import { Platform } from 'react-native';
import { getBibleRepository } from '../database/repositories/bibleRepository';
import {
  BIBLE_TRANSLATIONS,
  BIBLE_BOOKS,
  fetchChapter as fetchChapterFromApi,
  ChapterData,
  Verse,
} from '../api/bibleApi';
import { DbTranslation, DbBook, DbVerse } from '../database/types';

// API configuration for web fallback
const API_BASE_URL = 'http://localhost:3001/api';

async function fetchChapterFromServer(
  bookId: string,
  chapter: number,
  translation: string = 'acf'
): Promise<ChapterData> {
  const response = await fetch(
    `${API_BASE_URL}/bible/${bookId}/${chapter}?translation=${translation}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch chapter');
  }
  return await response.json() as ChapterData;
}

export class SyncService {
  private repository = getBibleRepository();
  private isWeb = Platform.OS === 'web';

  async initializeTranslations(): Promise<void> {
    if (this.isWeb) return;

    const translations = Object.values(BIBLE_TRANSLATIONS);
    for (const translation of translations) {
      const dbTranslation: DbTranslation = {
        id: translation.id,
        name: translation.name,
        abbreviation: translation.abbreviation,
        language: translation.language,
      };
      await this.repository.saveTranslation(dbTranslation);
    }
    console.log('Translations initialized');
  }

  async initializeBooks(): Promise<void> {
    if (this.isWeb) return;

    const allBooks = [
      ...BIBLE_BOOKS.oldTestament.map((book) => ({ ...book, testament: 'old' as const })),
      ...BIBLE_BOOKS.newTestament.map((book) => ({ ...book, testament: 'new' as const })),
    ];

    for (const book of allBooks) {
      const dbBook: DbBook = {
        id: book.id,
        name: book.name,
        abbreviation: book.abbreviation,
        chapters: book.chapters,
        testament: book.testament,
      };
      await this.repository.saveBook(dbBook);
    }
    console.log('Books initialized');
  }

  async syncChapter(
    bookId: string,
    chapter: number,
    translationId: string
  ): Promise<ChapterData> {
    // On web, always fetch from API directly
    if (this.isWeb) {
      return await fetchChapterFromServer(bookId, chapter, translationId);
    }

    // Check if already exists in database
    const exists = await this.repository.chapterExists(bookId, chapter, translationId);
    if (exists) {
      const verses = await this.repository.getChapterVerses(bookId, chapter, translationId);
      return {
        reference: `${bookId} ${chapter}`,
        verses: verses.map((v) => ({
          book_id: v.book_id,
          book_name: '',
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
        })),
        text: verses.map((v) => v.text).join(' '),
        translation_id: translationId,
        translation_name: BIBLE_TRANSLATIONS[translationId]?.name || '',
        translation_note: '',
      };
    }

    // Fetch from API
    const chapterData = await fetchChapterFromApi(bookId, chapter, translationId);

    // Save to database
    if (chapterData.verses && chapterData.verses.length > 0) {
      const dbVerses: Omit<DbVerse, 'id'>[] = chapterData.verses.map((verse: Verse) => ({
        book_id: verse.book_id,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        translation_id: translationId,
      }));

      await this.repository.saveVerses(dbVerses);
      console.log(`Synced ${bookId} ${chapter} (${translationId}) - ${dbVerses.length} verses`);
    }

    return chapterData;
  }

  async initializeDatabase(): Promise<void> {
    if (this.isWeb) {
      console.log('Running on web - skipping database initialization');
      return;
    }

    try {
      // Check if already initialized
      const existingTranslations = await this.repository.getAllTranslations();
      if (existingTranslations.length === 0) {
        await this.initializeTranslations();
      }

      const existingBooks = await this.repository.getAllBooks();
      if (existingBooks.length === 0) {
        await this.initializeBooks();
      }

      console.log('Database initialization complete');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async isChapterAvailable(
    bookId: string,
    chapter: number,
    translationId: string
  ): Promise<boolean> {
    if (this.isWeb) return false;
    return await this.repository.chapterExists(bookId, chapter, translationId);
  }
}

// Singleton instance
let syncService: SyncService | null = null;

export const getSyncService = (): SyncService => {
  if (!syncService) {
    syncService = new SyncService();
  }
  return syncService;
};

export const initializeDatabaseData = async (): Promise<void> => {
  const service = getSyncService();
  await service.initializeDatabase();
};

export const syncChapter = async (
  bookId: string,
  chapter: number,
  translationId: string
): Promise<ChapterData> => {
  const service = getSyncService();
  return await service.syncChapter(bookId, chapter, translationId);
};
