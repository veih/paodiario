// Database schema definitions

export const CREATE_TRANSLATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    language TEXT NOT NULL
  );
`;

export const CREATE_BOOKS_TABLE = `
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    chapters INTEGER NOT NULL,
    testament TEXT NOT NULL
  );
`;

export const CREATE_VERSES_TABLE = `
  CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    translation_id TEXT NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (translation_id) REFERENCES translations(id),
    UNIQUE(book_id, chapter, verse, translation_id)
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(book_id, chapter, translation_id);
  CREATE INDEX IF NOT EXISTS idx_verses_translation ON verses(translation_id);
`;

export const INSERT_TRANSLATION = `
  INSERT OR REPLACE INTO translations (id, name, abbreviation, language)
  VALUES (?, ?, ?, ?);
`;

export const INSERT_BOOK = `
  INSERT OR REPLACE INTO books (id, name, abbreviation, chapters, testament)
  VALUES (?, ?, ?, ?, ?);
`;

export const INSERT_VERSE = `
  INSERT OR REPLACE INTO verses (book_id, chapter, verse, text, translation_id)
  VALUES (?, ?, ?, ?, ?);
`;

export const SELECT_CHAPTER_VERSES = `
  SELECT * FROM verses
  WHERE book_id = ? AND chapter = ? AND translation_id = ?
  ORDER BY verse;
`;

export const SELECT_VERSE = `
  SELECT * FROM verses
  WHERE book_id = ? AND chapter = ? AND verse = ? AND translation_id = ?;
`;

export const CHECK_CHAPTER_EXISTS = `
  SELECT COUNT(*) as count FROM verses
  WHERE book_id = ? AND chapter = ? AND translation_id = ?;
`;

export const SELECT_ALL_BOOKS = `
  SELECT * FROM books ORDER BY testament, id;
`;

export const SELECT_ALL_TRANSLATIONS = `
  SELECT * FROM translations;
`;

export const DELETE_CHAPTER_VERSES = `
  DELETE FROM verses
  WHERE book_id = ? AND chapter = ? AND translation_id = ?;
`;
