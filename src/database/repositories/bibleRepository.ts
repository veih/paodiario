import { getDatabase } from '../database';
import {
  INSERT_TRANSLATION,
  INSERT_BOOK,
  INSERT_VERSE,
  SELECT_CHAPTER_VERSES,
  SELECT_VERSE,
  CHECK_CHAPTER_EXISTS,
  SELECT_ALL_BOOKS,
  SELECT_ALL_TRANSLATIONS,
} from '../schema';
import { DbTranslation, DbBook, DbVerse } from '../types';

export class BibleRepository {
  async saveTranslation(translation: DbTranslation): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      INSERT_TRANSLATION,
      translation.id,
      translation.name,
      translation.abbreviation,
      translation.language
    );
  }

  async saveBook(book: DbBook): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      INSERT_BOOK,
      book.id,
      book.name,
      book.abbreviation,
      book.chapters,
      book.testament
    );
  }

  async saveVerse(verse: Omit<DbVerse, 'id'>): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      INSERT_VERSE,
      verse.book_id,
      verse.chapter,
      verse.verse,
      verse.text,
      verse.translation_id
    );
  }

  async saveVerses(verses: Omit<DbVerse, 'id'>[]): Promise<void> {
    const db = getDatabase();
    await db.withTransactionAsync(async () => {
      for (const verse of verses) {
        await db.runAsync(
          INSERT_VERSE,
          verse.book_id,
          verse.chapter,
          verse.verse,
          verse.text,
          verse.translation_id
        );
      }
    });
  }

  async getChapterVerses(
    bookId: string,
    chapter: number,
    translationId: string
  ): Promise<DbVerse[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<DbVerse>(
      SELECT_CHAPTER_VERSES,
      bookId,
      chapter,
      translationId
    );
    return results;
  }

  async getVerse(
    bookId: string,
    chapter: number,
    verse: number,
    translationId: string
  ): Promise<DbVerse | null> {
    const db = getDatabase();
    const result = await db.getFirstAsync<DbVerse>(
      SELECT_VERSE,
      bookId,
      chapter,
      verse,
      translationId
    );
    return result || null;
  }

  async chapterExists(
    bookId: string,
    chapter: number,
    translationId: string
  ): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      CHECK_CHAPTER_EXISTS,
      bookId,
      chapter,
      translationId
    );
    return (result?.count || 0) > 0;
  }

  async getAllBooks(): Promise<DbBook[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<DbBook>(SELECT_ALL_BOOKS);
    return results;
  }

  async getAllTranslations(): Promise<DbTranslation[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<DbTranslation>(SELECT_ALL_TRANSLATIONS);
    return results;
  }

  async isTranslationPopulated(translationId: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM verses WHERE translation_id = ?;',
      translationId
    );
    return (result?.count || 0) > 0;
  }
}

// Singleton instance
let bibleRepository: BibleRepository | null = null;

export const getBibleRepository = (): BibleRepository => {
  if (!bibleRepository) {
    bibleRepository = new BibleRepository();
  }
  return bibleRepository;
};
