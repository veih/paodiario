// Database entity types

export interface DbTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
}

export interface DbBook {
  id: string;
  name: string;
  abbreviation: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface DbVerse {
  id: number;
  book_id: string;
  chapter: number;
  verse: number;
  text: string;
  translation_id: string;
}

export interface DbChapter {
  book_id: string;
  chapter: number;
  translation_id: string;
  verses: DbVerse[];
}
