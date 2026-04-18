#!/usr/bin/env node
import 'dotenv/config';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

async function populateDatabase() {
    console.log('🚀 Starting database population (fast mode)...');
    console.log(`📁 Reading files from: ${DATA_DIR}`);

    // Get all JSON files
    const files = fs.readdirSync(DATA_DIR)
        .filter(f => f.endsWith('.json'))
        .sort();

    console.log(`📚 Found ${files.length} chapter files`);

    let processed = 0;
    let totalVerses = 0;

    for (const file of files) {
        try {
            // Parse filename: book_chapter.json
            const match = file.match(/^(.+)_(\d+)\.json$/);
            if (!match) continue;

            const [, bookId, chapterNum] = match;
            const chapter = parseInt(chapterNum);

            // Read and parse JSON
            const filePath = path.join(DATA_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            if (!data.verses || !Array.isArray(data.verses)) continue;

            // Build batch insert
            const values = data.verses.map(v =>
                `('${bookId}', ${chapter}, ${v.verse}, '${v.text.replace(/'/g, "''")}', 'acf')`
            ).join(',');

            // Execute batch insert
            await sql.query(`
        INSERT INTO verses (book_id, chapter, verse, text, translation_id)
        VALUES ${values}
        ON CONFLICT (book_id, chapter, verse, translation_id) DO UPDATE
        SET text = EXCLUDED.text
      `);

            totalVerses += data.verses.length;
            processed++;

            // Progress log every 100 files
            if (processed % 100 === 0) {
                console.log(`✅ Progress: ${processed}/${files.length} chapters, ${totalVerses} verses inserted`);
            }

        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    }

    console.log('\n📊 Population Summary:');
    console.log(`✅ Successfully processed: ${processed} chapters`);
    console.log(`✅ Total verses inserted: ${totalVerses}`);
    console.log('🎉 Database population complete!');

    process.exit(0);
}

populateDatabase().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
