-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(20) NOT NULL,
  language VARCHAR(10) NOT NULL
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  testament VARCHAR(10) NOT NULL,
  chapters INTEGER NOT NULL
);

-- Create verses table
CREATE TABLE IF NOT EXISTS verses (
  id SERIAL PRIMARY KEY,
  book_id VARCHAR(50) REFERENCES books(id),
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation_id VARCHAR(10) REFERENCES translations(id),
  UNIQUE(book_id, chapter, verse, translation_id)
);

-- Insert default translation
INSERT INTO translations (id, name, abbreviation, language) 
VALUES ('acf', 'Almeida Corrigida e Fiel', 'ACF', 'pt')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample books (you can add more)
INSERT INTO books (id, name, testament, chapters) VALUES
('genesis', 'Gênesis', 'old', 50),
('exodus', 'Êxodo', 'old', 40),
('leviticus', 'Levítico', 'old', 27),
('numbers', 'Números', 'old', 36),
('deuteronomy', 'Deuteronômio', 'old', 34),
('matthew', 'Mateus', 'new', 28),
('mark', 'Marcos', 'new', 16),
('luke', 'Lucas', 'new', 24),
('john', 'João', 'new', 21),
('acts', 'Atos', 'new', 28),
('romans', 'Romanos', 'new', 16),
('1corinthians', '1 Coríntios', 'new', 16),
('2corinthians', '2 Coríntios', 'new', 13),
('galatians', 'Gálatas', 'new', 6),
('ephesians', 'Efésios', 'new', 6),
('philippians', 'Filipenses', 'new', 4),
('colossians', 'Colossenses', 'new', 4),
('1thessalonians', '1 Tessalonicenses', 'new', 5),
('2thessalonians', '2 Tessalonicenses', 'new', 3),
('1timothy', '1 Timóteo', 'new', 6),
('2timothy', '2 Timóteo', 'new', 4),
('titus', 'Tito', 'new', 3),
('philemon', 'Filemom', 'new', 1),
('hebrews', 'Hebreus', 'new', 13),
('james', 'Tiago', 'new', 5),
('1peter', '1 Pedro', 'new', 5),
('2peter', '2 Pedro', 'new', 3),
('1john', '1 João', 'new', 5),
('2john', '2 João', 'new', 1),
('3john', '3 João', 'new', 1),
('jude', 'Judas', 'new', 1),
('revelation', 'Apocalipse', 'new', 22)
ON CONFLICT (id) DO NOTHING;
