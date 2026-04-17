// Scraper service to fetch Bible content from padrepauloricardo.org
// and populate the local database

import { getBibleRepository } from '../database/repositories/bibleRepository';
import { DbVerse } from '../database/types';

const BASE_URL = 'https://padrepauloricardo.org/biblia';

// Book ID mapping from our app to padrepauloricardo.org format
const BOOK_ID_MAP: Record<string, string> = {
  genesis: 'gn',
  exodus: 'ex',
  leviticus: 'lv',
  numbers: 'nm',
  deuteronomy: 'dt',
  joshua: 'js',
  judges: 'jz',
  ruth: 'rt',
  '1samuel': '1sm',
  '2samuel': '2sm',
  '1kings': '1rs',
  '2kings': '2rs',
  '1chronicles': '1cr',
  '2chronicles': '2cr',
  ezra: 'esd',
  nehemiah: 'ne',
  esther: 'et',
  job: 'jo',
  psalms: 'sl',
  proverbs: 'pr',
  ecclesiastes: 'ecl',
  songofsolomon: 'ct',
  isaiah: 'is',
  jeremiah: 'jr',
  lamentations: 'lm',
  ezekiel: 'ez',
  daniel: 'dn',
  hosea: 'os',
  joel: 'jl',
  amos: 'am',
  obadiah: 'ob',
  jonah: 'jn',
  micah: 'mq',
  nahum: 'na',
  habakkuk: 'hc',
  zephaniah: 'sf',
  haggai: 'ag',
  zechariah: 'zc',
  malachi: 'ml',
  matthew: 'mt',
  mark: 'mc',
  luke: 'lc',
  john: 'jo',
  acts: 'at',
  romans: 'rm',
  '1corinthians': '1cor',
  '2corinthians': '2cor',
  galatians: 'gl',
  ephesians: 'ef',
  philippians: 'fl',
  colossians: 'cl',
  '1thessalonians': '1ts',
  '2thessalonians': '2ts',
  '1timothy': '1tm',
  '2timothy': '2tm',
  titus: 'tt',
  philemon: 'fm',
  hebrews: 'hb',
  james: 'tg',
  '1peter': '1pd',
  '2peter': '2pd',
  '1john': '1jo',
  '2john': '2jo',
  '3john': '3jo',
  jude: 'jd',
  revelation: 'ap',
};

// Edition mapping
const EDITION_MAP: Record<string, string> = {
  acf: 'matos-soares',
  ara: 'almeida-revisada-atualizada',
  arc: 'almeida-revisada-corrigida',
  nvi: 'nova-versao-internacional',
  naa: 'nova-almeida-atualizada',
};

interface ScrapedVerse {
  verse: number;
  text: string;
}

interface ScrapedChapter {
  bookId: string;
  chapter: number;
  verses: ScrapedVerse[];
}

export class ScraperService {
  private repository = getBibleRepository();

  /**
   * Parse HTML content to extract verses
   * This is a basic parser - the actual implementation may need adjustment
   * based on the actual HTML structure
   */
  parseChapterHtml(html: string, bookId: string, chapter: number): ScrapedChapter {
    const verses: ScrapedVerse[] = [];
    
    // Simple regex-based parsing - looking for verse patterns
    // The actual HTML structure would need proper parsing
    const verseRegex = /(\d+)[°º]?\s*([^.]+\.)/g;
    let match;
    
    while ((match = verseRegex.exec(html)) !== null) {
      const verseNum = parseInt(match[1], 10);
      const text = match[2].trim();
      
      if (verseNum && text) {
        verses.push({
          verse: verseNum,
          text: text,
        });
      }
    }

    return {
      bookId,
      chapter,
      verses,
    };
  }

  /**
   * Fetch a chapter from the website
   */
  async fetchChapter(
    bookId: string,
    chapter: number,
    edition: string = 'matos-soares'
  ): Promise<ScrapedChapter | null> {
    try {
      const mappedBookId = BOOK_ID_MAP[bookId] || bookId;
      const url = `${BASE_URL}/${mappedBookId}?cap=${chapter}&edition=${edition}`;
      
      console.log(`Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.status}`);
        return null;
      }

      const html = await response.text();
      return this.parseChapterHtml(html, bookId, chapter);
    } catch (error) {
      console.error(`Error fetching chapter ${bookId} ${chapter}:`, error);
      return null;
    }
  }

  /**
   * Save scraped chapter to database
   */
  async saveChapterToDatabase(
    chapter: ScrapedChapter,
    translationId: string
  ): Promise<void> {
    if (chapter.verses.length === 0) {
      console.warn(`No verses found for ${chapter.bookId} ${chapter.chapter}`);
      return;
    }

    const dbVerses: Omit<DbVerse, 'id'>[] = chapter.verses.map((v) => ({
      book_id: chapter.bookId,
      chapter: chapter.chapter,
      verse: v.verse,
      text: v.text,
      translation_id: translationId,
    }));

    await this.repository.saveVerses(dbVerses);
    console.log(
      `Saved ${dbVerses.length} verses for ${chapter.bookId} ${chapter.chapter} (${translationId})`
    );
  }

  /**
   * Scrape and save a specific chapter
   */
  async scrapeAndSaveChapter(
    bookId: string,
    chapter: number,
    translationId: string = 'acf'
  ): Promise<boolean> {
    const edition = EDITION_MAP[translationId] || 'matos-soares';
    
    const scrapedChapter = await this.fetchChapter(bookId, chapter, edition);
    if (!scrapedChapter) {
      return false;
    }

    await this.saveChapterToDatabase(scrapedChapter, translationId);
    return true;
  }

  /**
   * Check if we can scrape from this source
   * Note: Web scraping should respect robots.txt and terms of service
   */
  canScrape(): boolean {
    // This is a placeholder - in production, check robots.txt
    // and ensure compliance with website terms
    return true;
  }
}

// Singleton instance
let scraperService: ScraperService | null = null;

export const getScraperService = (): ScraperService => {
  if (!scraperService) {
    scraperService = new ScraperService();
  }
  return scraperService;
};

export const scrapeAndSaveChapter = async (
  bookId: string,
  chapter: number,
  translationId: string = 'acf'
): Promise<boolean> => {
  const service = getScraperService();
  return await service.scrapeAndSaveChapter(bookId, chapter, translationId);
};
