#!/usr/bin/env node
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

async function populateDatabase() {
    console.log('🚀 Starting database population...');
    console.log(`📁 Reading files from: ${DATA_DIR}`);

    // Get all JSON files
    const files = fs.readdirSync(DATA_DIR)
        .filter(f => f.endsWith('.json'))
        .sort();

    console.log(`📚 Found ${files.length} chapter files`);

    let processed = 0;
    let errors = 0;

    for (const file of files) {
        try {
            // Parse filename: book_chapter.json
            const match = file.match(/^(.+)_(\d+)\.json$/);
            if (!match) {
                console.warn(`⚠️ Skipping invalid filename: ${file}`);
                continue;
            }

            const [, bookId, chapterNum] = match;
            const chapter = parseInt(chapterNum);

            // Read and parse JSON
            const filePath = path.join(DATA_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(content);

            if (!data.verses || !Array.isArray(data.verses)) {
                console.warn(`⚠️ No verses found in ${file}`);
                continue;
            }

            // Insert verses
            for (const verse of data.verses) {
                try {
                    await sql`
            INSERT INTO verses (book_id, chapter, verse, text, translation_id)
            VALUES (${bookId}, ${chapter}, ${verse.verse}, ${verse.text}, 'acf')
            ON CONFLICT (book_id, chapter, verse, translation_id) DO UPDATE
            SET text = ${verse.text}
          `;
                } catch (verseError) {
                    console.error(`❌ Error inserting verse ${bookId} ${chapter}:${verse.verse}:`, verseError.message);
                    errors++;
                }
            }

            processed++;

            // Progress log every 100 files
            if (processed % 100 === 0) {
                console.log(`✅ Progress: ${processed}/${files.length} chapters processed`);
            }

            // Small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 10));

        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
            errors++;
        }
    }

    console.log('\n📊 Population Summary:');
    console.log(`✅ Successfully processed: ${processed} chapters`);
    console.log(`❌ Errors: ${errors}`);
    console.log('🎉 Database population complete!');

    process.exit(0);
}

// Check if POSTGRES_URL is set
if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not set');
    console.log('💡 Make sure to run this script with Vercel CLI or set POSTGRES_URL');
    process.exit(1);
}

populateDatabase().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
