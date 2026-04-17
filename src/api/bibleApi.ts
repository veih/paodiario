// API service for Bible data in Portuguese
// Using the Bible API (bible-api.com) which supports Portuguese
// Now with local SQLite database support for offline access

import { syncChapter } from '../services/syncService';

// Type definitions
export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
  abbreviation: string;
}

export interface BibleBooks {
  oldTestament: BibleBook[];
  newTestament: BibleBook[];
}

export interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ChapterData {
  reference: string;
  verses: Verse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

// Available Bible translations
export const BIBLE_TRANSLATIONS: Record<string, BibleTranslation> = {
  acf: {
    id: 'acf',
    name: 'Almeida Corrigida e Fiel',
    abbreviation: 'ACF',
    language: 'Português',
  },
  ara: {
    id: 'ara',
    name: 'Almeida Revista e Atualizada',
    abbreviation: 'ARA',
    language: 'Português',
  },
  arc: {
    id: 'arc',
    name: 'Almeida Revista e Corrigida',
    abbreviation: 'ARC',
    language: 'Português',
  },
  nvi: {
    id: 'nvi',
    name: 'Nova Versão Internacional',
    abbreviation: 'NVI',
    language: 'Português',
  },
  naa: {
    id: 'naa',
    name: 'Nova Almeida Atualizada',
    abbreviation: 'NAA',
    language: 'Português',
  },
};

// Get all available translations as array
export const getAllTranslations = (): BibleTranslation[] => {
  return Object.values(BIBLE_TRANSLATIONS);
};

// Get translation by ID
export const getTranslationById = (translationId: string): BibleTranslation => {
  return BIBLE_TRANSLATIONS[translationId] || BIBLE_TRANSLATIONS.acf;
};

// Complete list of Bible books in Portuguese (Almeida Corrigida e Fiel - ACF)
// Using bible-api.com compatible book IDs (English abbreviations)
export const BIBLE_BOOKS: BibleBooks = {
  oldTestament: [
    { id: 'genesis', name: 'Gênesis', chapters: 50, abbreviation: 'Gn' },
    { id: 'exodus', name: 'Êxodo', chapters: 40, abbreviation: 'Ex' },
    { id: 'leviticus', name: 'Levítico', chapters: 27, abbreviation: 'Lv' },
    { id: 'numbers', name: 'Números', chapters: 36, abbreviation: 'Nm' },
    { id: 'deuteronomy', name: 'Deuteronômio', chapters: 34, abbreviation: 'Dt' },
    { id: 'joshua', name: 'Josué', chapters: 24, abbreviation: 'Js' },
    { id: 'judges', name: 'Juízes', chapters: 21, abbreviation: 'Jz' },
    { id: 'ruth', name: 'Rute', chapters: 4, abbreviation: 'Rt' },
    { id: '1samuel', name: '1 Samuel', chapters: 31, abbreviation: '1Sm' },
    { id: '2samuel', name: '2 Samuel', chapters: 24, abbreviation: '2Sm' },
    { id: '1kings', name: '1 Reis', chapters: 22, abbreviation: '1Rs' },
    { id: '2kings', name: '2 Reis', chapters: 25, abbreviation: '2Rs' },
    { id: '1chronicles', name: '1 Crônicas', chapters: 29, abbreviation: '1Cr' },
    { id: '2chronicles', name: '2 Crônicas', chapters: 36, abbreviation: '2Cr' },
    { id: 'ezra', name: 'Esdras', chapters: 10, abbreviation: 'Ed' },
    { id: 'nehemiah', name: 'Neemias', chapters: 13, abbreviation: 'Ne' },
    { id: 'esther', name: 'Ester', chapters: 10, abbreviation: 'Et' },
    { id: 'job', name: 'Jó', chapters: 42, abbreviation: 'Jó' },
    { id: 'psalms', name: 'Salmos', chapters: 150, abbreviation: 'Sl' },
    { id: 'proverbs', name: 'Provérbios', chapters: 31, abbreviation: 'Pv' },
    { id: 'ecclesiastes', name: 'Eclesiastes', chapters: 12, abbreviation: 'Ec' },
    { id: 'songofsolomon', name: 'Cânticos', chapters: 8, abbreviation: 'Ct' },
    { id: 'isaiah', name: 'Isaías', chapters: 66, abbreviation: 'Is' },
    { id: 'jeremiah', name: 'Jeremias', chapters: 52, abbreviation: 'Jr' },
    { id: 'lamentations', name: 'Lamentações', chapters: 5, abbreviation: 'Lm' },
    { id: 'ezekiel', name: 'Ezequiel', chapters: 48, abbreviation: 'Ez' },
    { id: 'daniel', name: 'Daniel', chapters: 12, abbreviation: 'Dn' },
    { id: 'hosea', name: 'Oséias', chapters: 14, abbreviation: 'Os' },
    { id: 'joel', name: 'Joel', chapters: 3, abbreviation: 'Jl' },
    { id: 'amos', name: 'Amós', chapters: 9, abbreviation: 'Am' },
    { id: 'obadiah', name: 'Obadias', chapters: 1, abbreviation: 'Ob' },
    { id: 'jonah', name: 'Jonas', chapters: 4, abbreviation: 'Jn' },
    { id: 'micah', name: 'Miquéias', chapters: 7, abbreviation: 'Mq' },
    { id: 'nahum', name: 'Naum', chapters: 3, abbreviation: 'Na' },
    { id: 'habakkuk', name: 'Habacuque', chapters: 3, abbreviation: 'Hc' },
    { id: 'zephaniah', name: 'Sofonias', chapters: 3, abbreviation: 'Sf' },
    { id: 'haggai', name: 'Ageu', chapters: 2, abbreviation: 'Ag' },
    { id: 'zechariah', name: 'Zacarias', chapters: 14, abbreviation: 'Zc' },
    { id: 'malachi', name: 'Malaquias', chapters: 4, abbreviation: 'Ml' },
  ],
  newTestament: [
    { id: 'matthew', name: 'Mateus', chapters: 28, abbreviation: 'Mt' },
    { id: 'mark', name: 'Marcos', chapters: 16, abbreviation: 'Mc' },
    { id: 'luke', name: 'Lucas', chapters: 24, abbreviation: 'Lc' },
    { id: 'john', name: 'João', chapters: 21, abbreviation: 'Jo' },
    { id: 'acts', name: 'Atos', chapters: 28, abbreviation: 'At' },
    { id: 'romans', name: 'Romanos', chapters: 16, abbreviation: 'Rm' },
    { id: '1corinthians', name: '1 Coríntios', chapters: 16, abbreviation: '1Co' },
    { id: '2corinthians', name: '2 Coríntios', chapters: 13, abbreviation: '2Co' },
    { id: 'galatians', name: 'Gálatas', chapters: 6, abbreviation: 'Gl' },
    { id: 'ephesians', name: 'Efésios', chapters: 6, abbreviation: 'Ef' },
    { id: 'philippians', name: 'Filipenses', chapters: 4, abbreviation: 'Fp' },
    { id: 'colossians', name: 'Colossenses', chapters: 4, abbreviation: 'Cl' },
    { id: '1thessalonians', name: '1 Tessalonicenses', chapters: 5, abbreviation: '1Ts' },
    { id: '2thessalonians', name: '2 Tessalonicenses', chapters: 3, abbreviation: '2Ts' },
    { id: '1timothy', name: '1 Timóteo', chapters: 6, abbreviation: '1Tm' },
    { id: '2timothy', name: '2 Timóteo', chapters: 4, abbreviation: '2Tm' },
    { id: 'titus', name: 'Tito', chapters: 3, abbreviation: 'Tt' },
    { id: 'philemon', name: 'Filemom', chapters: 1, abbreviation: 'Fm' },
    { id: 'hebrews', name: 'Hebreus', chapters: 13, abbreviation: 'Hb' },
    { id: 'james', name: 'Tiago', chapters: 5, abbreviation: 'Tg' },
    { id: '1peter', name: '1 Pedro', chapters: 5, abbreviation: '1Pe' },
    { id: '2peter', name: '2 Pedro', chapters: 3, abbreviation: '2Pe' },
    { id: '1john', name: '1 João', chapters: 5, abbreviation: '1Jo' },
    { id: '2john', name: '2 João', chapters: 1, abbreviation: '2Jo' },
    { id: '3john', name: '3 João', chapters: 1, abbreviation: '3Jo' },
    { id: 'jude', name: 'Judas', chapters: 1, abbreviation: 'Jd' },
    { id: 'revelation', name: 'Apocalipse', chapters: 22, abbreviation: 'Ap' },
  ],
};

// Get all books as a single array
export const getAllBooks = (): BibleBook[] => {
  return [...BIBLE_BOOKS.oldTestament, ...BIBLE_BOOKS.newTestament];
};

// Fetch a specific chapter from the Bible API
// Uses local database first, falls back to API if not cached
export const fetchChapter = async (
  bookId: string,
  chapter: number,
  translation: string = 'acf'
): Promise<ChapterData> => {
  try {
    // Try to get from local database first (will sync from API if not available)
    return await syncChapter(bookId, chapter, translation);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    throw error;
  }
};


