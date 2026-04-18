import { PrismaClient } from '@prisma/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const prisma = new PrismaClient();

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const { book, chapter } = request.query;
  const translation = (request.query.translation as string) || 'acf';

  try {
    // Try to get from database using Prisma
    const verses = await prisma.verse.findMany({
      where: {
        bookId: book as string,
        chapter: parseInt(chapter as string),
        translationId: translation,
      },
      include: {
        book: true,
      },
      orderBy: {
        verse: 'asc',
      },
    });

    if (verses.length === 0) {
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
    const formattedVerses = verses.map((v) => ({
      book_id: v.bookId.toUpperCase(),
      book_name: v.book.name,
      chapter: parseInt(chapter as string),
      verse: v.verse,
      text: v.text,
    }));

    return response.status(200).json({
      reference: `${verses[0].book.name} ${chapter}`,
      verses: formattedVerses,
      text: formattedVerses.map((v) => v.text).join(' '),
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
  } finally {
    await prisma.$disconnect();
  }
}
