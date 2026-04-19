import { Pool } from 'pg';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { book, chapter } = request.query;
  const translation = (request.query.translation as string) || 'acf';

  try {
    const result = await pool.query(
      `SELECT v.verse, v.text, b.name as book_name
       FROM verses v
       JOIN books b ON b.id = v.book_id
       WHERE v.book_id = $1
         AND v.chapter = $2
         AND v.translation_id = $3
       ORDER BY v.verse ASC`,
      [book, parseInt(chapter as string), translation]
    );

    if (result.rows.length === 0) {
      const apiResponse = await fetch(
        `https://bible-api.com/${(book as string).toUpperCase()}+${chapter}?translation=almeida`
      );
      if (!apiResponse.ok) {
        return response.status(404).json({ error: 'Chapter not found' });
      }
      return response.status(200).json(await apiResponse.json());
    }

    const bookName = result.rows[0].book_name;
    const formattedVerses = result.rows.map((v) => ({
      book_id: (book as string).toUpperCase(),
      book_name: bookName,
      chapter: parseInt(chapter as string),
      verse: v.verse,
      text: v.text,
    }));

    return response.status(200).json({
      reference: `${bookName} ${chapter}`,
      verses: formattedVerses,
      text: formattedVerses.map((v) => v.text).join(' '),
      translation_id: translation,
      translation_name: 'Almeida Corrigida e Fiel',
      translation_note: 'Portuguese',
    });
  } catch (error) {
    console.error('Database error:', error);
    try {
      const apiResponse = await fetch(
        `https://bible-api.com/${(book as string).toUpperCase()}+${chapter}?translation=almeida`
      );
      if (!apiResponse.ok) {
        return response.status(500).json({ error: 'Failed to fetch chapter' });
      }
      return response.status(200).json(await apiResponse.json());
    } catch {
      return response.status(500).json({ error: 'Failed to fetch chapter' });
    }
  }
}
