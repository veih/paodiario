import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { book, chapter } = request.query;
  const translation = (request.query.translation as string) || 'acf';

  try {
    // Try to get from database first
    const result = await sql`
      SELECT v.verse, v.text, b.name as book_name, b.id as book_id
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE b.id = ${book as string} 
        AND v.chapter = ${parseInt(chapter as string)}
        AND v.translation_id = ${translation}
      ORDER BY v.verse
    `;

    if (result.rows.length === 0) {
      // If not in database, fetch from external API
      const apiResponse = await fetch(
        `https://bible-api.com/${(book as string).toUpperCase()}+${chapter}?translation=almeida`
      );
      
      if (!apiResponse.ok) {
        return response.status(404).json({ error: 'Chapter not found' });
      }

      const data = await apiResponse.json();
      return response.status(200).json(data);
    }

    // Format response from database
    const verses = result.rows.map((row: any) => ({
      book_id: row.book_id.toUpperCase(),
      book_name: row.book_name,
      chapter: parseInt(chapter as string),
      verse: row.verse,
      text: row.text,
    }));

    return response.status(200).json({
      reference: `${result.rows[0].book_name} ${chapter}`,
      verses,
      text: verses.map((v: any) => v.text).join(' '),
      translation_id: translation,
      translation_name: 'Almeida Corrigida e Fiel',
      translation_note: 'Portuguese',
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Fallback to external API
    try {
      const apiResponse = await fetch(
        `https://bible-api.com/${(book as string).toUpperCase()}+${chapter}?translation=almeida`
      );
      
      if (!apiResponse.ok) {
        return response.status(500).json({ error: 'Failed to fetch chapter' });
      }

      const data = await apiResponse.json();
      return response.status(200).json(data);
    } catch (apiError) {
      return response.status(500).json({ error: 'Failed to fetch chapter' });
    }
  }
}
