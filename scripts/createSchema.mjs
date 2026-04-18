#!/usr/bin/env node
import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function createSchema() {
    console.log('🚀 Creating database schema...');

    try {
        // Create translations table
        await sql`
      CREATE TABLE IF NOT EXISTS translations (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        abbreviation VARCHAR(20) NOT NULL,
        language VARCHAR(10) NOT NULL
      )
    `;
        console.log('✅ Created translations table');

        // Create books table
        await sql`
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        testament VARCHAR(10) NOT NULL,
        chapters INTEGER NOT NULL
      )
    `;
        console.log('✅ Created books table');

        // Create verses table
        await sql`
      CREATE TABLE IF NOT EXISTS verses (
        id SERIAL PRIMARY KEY,
        book_id VARCHAR(50) REFERENCES books(id),
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        translation_id VARCHAR(10) REFERENCES translations(id),
        UNIQUE(book_id, chapter, verse, translation_id)
      )
    `;
        console.log('✅ Created verses table');

        // Insert default translation
        await sql`
      INSERT INTO translations (id, name, abbreviation, language) 
      VALUES ('acf', 'Almeida Corrigida e Fiel', 'ACF', 'pt')
      ON CONFLICT (id) DO NOTHING
    `;
        console.log('✅ Inserted default translation');

        // Insert all 66 books
        const books = [
            ['genesis', 'Gênesis', 'old', 50],
            ['exodus', 'Êxodo', 'old', 40],
            ['leviticus', 'Levítico', 'old', 27],
            ['numbers', 'Números', 'old', 36],
            ['deuteronomy', 'Deuteronômio', 'old', 34],
            ['joshua', 'Josué', 'old', 24],
            ['judges', 'Juízes', 'old', 21],
            ['ruth', 'Rute', 'old', 4],
            ['1samuel', '1 Samuel', 'old', 31],
            ['2samuel', '2 Samuel', 'old', 24],
            ['1kings', '1 Reis', 'old', 22],
            ['2kings', '2 Reis', 'old', 25],
            ['1chronicles', '1 Crônicas', 'old', 29],
            ['2chronicles', '2 Crônicas', 'old', 36],
            ['ezra', 'Esdras', 'old', 10],
            ['nehemiah', 'Neemias', 'old', 13],
            ['esther', 'Ester', 'old', 10],
            ['job', 'Jó', 'old', 42],
            ['psalms', 'Salmos', 'old', 150],
            ['proverbs', 'Provérbios', 'old', 31],
            ['ecclesiastes', 'Eclesiastes', 'old', 12],
            ['songofsolomon', 'Cantares', 'old', 8],
            ['isaiah', 'Isaías', 'old', 66],
            ['jeremiah', 'Jeremias', 'old', 52],
            ['lamentations', 'Lamentações', 'old', 5],
            ['ezekiel', 'Ezequiel', 'old', 48],
            ['daniel', 'Daniel', 'old', 12],
            ['hosea', 'Oséias', 'old', 14],
            ['joel', 'Joel', 'old', 3],
            ['amos', 'Amós', 'old', 9],
            ['obadiah', 'Obadias', 'old', 1],
            ['jonah', 'Jonas', 'old', 4],
            ['micah', 'Miquéias', 'old', 7],
            ['nahum', 'Naum', 'old', 3],
            ['habakkuk', 'Habacuque', 'old', 3],
            ['zephaniah', 'Sofonias', 'old', 3],
            ['haggai', 'Ageu', 'old', 2],
            ['zechariah', 'Zacarias', 'old', 14],
            ['malachi', 'Malaquias', 'old', 4],
            ['matthew', 'Mateus', 'new', 28],
            ['mark', 'Marcos', 'new', 16],
            ['luke', 'Lucas', 'new', 24],
            ['john', 'João', 'new', 21],
            ['acts', 'Atos', 'new', 28],
            ['romans', 'Romanos', 'new', 16],
            ['1corinthians', '1 Coríntios', 'new', 16],
            ['2corinthians', '2 Coríntios', 'new', 13],
            ['galatians', 'Gálatas', 'new', 6],
            ['ephesians', 'Efésios', 'new', 6],
            ['philippians', 'Filipenses', 'new', 4],
            ['colossians', 'Colossenses', 'new', 4],
            ['1thessalonians', '1 Tessalonicenses', 'new', 5],
            ['2thessalonians', '2 Tessalonicenses', 'new', 3],
            ['1timothy', '1 Timóteo', 'new', 6],
            ['2timothy', '2 Timóteo', 'new', 4],
            ['titus', 'Tito', 'new', 3],
            ['philemon', 'Filemom', 'new', 1],
            ['hebrews', 'Hebreus', 'new', 13],
            ['james', 'Tiago', 'new', 5],
            ['1peter', '1 Pedro', 'new', 5],
            ['2peter', '2 Pedro', 'new', 3],
            ['1john', '1 João', 'new', 5],
            ['2john', '2 João', 'new', 1],
            ['3john', '3 João', 'new', 1],
            ['jude', 'Judas', 'new', 1],
            ['revelation', 'Apocalipse', 'new', 22]
        ];

        for (const [id, name, testament, chapters] of books) {
            await sql`
        INSERT INTO books (id, name, testament, chapters)
        VALUES (${id}, ${name}, ${testament}, ${chapters})
        ON CONFLICT (id) DO NOTHING
      `;
        }
        console.log(`✅ Inserted ${books.length} books`);

        console.log('\n🎉 Schema created successfully!');
    } catch (error) {
        console.error('❌ Error creating schema:', error);
        process.exit(1);
    }

    process.exit(0);
}

createSchema();
