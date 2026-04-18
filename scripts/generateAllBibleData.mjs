// Script to generate ALL Bible chapters (1,189 chapters total)
// WARNING: This will take a long time and make many API requests

import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'https://bible-api.com';

// All 66 books with chapter counts
const ALL_BOOKS = [
    // Old Testament (39 books)
    { id: 'genesis', chapters: 50 },
    { id: 'exodus', chapters: 40 },
    { id: 'leviticus', chapters: 27 },
    { id: 'numbers', chapters: 36 },
    { id: 'deuteronomy', chapters: 34 },
    { id: 'joshua', chapters: 24 },
    { id: 'judges', chapters: 21 },
    { id: 'ruth', chapters: 4 },
    { id: '1samuel', chapters: 31 },
    { id: '2samuel', chapters: 24 },
    { id: '1kings', chapters: 22 },
    { id: '2kings', chapters: 25 },
    { id: '1chronicles', chapters: 29 },
    { id: '2chronicles', chapters: 36 },
    { id: 'ezra', chapters: 10 },
    { id: 'nehemiah', chapters: 13 },
    { id: 'esther', chapters: 10 },
    { id: 'job', chapters: 42 },
    { id: 'psalms', chapters: 150 },
    { id: 'proverbs', chapters: 31 },
    { id: 'ecclesiastes', chapters: 12 },
    { id: 'songofsolomon', chapters: 8 },
    { id: 'isaiah', chapters: 66 },
    { id: 'jeremiah', chapters: 52 },
    { id: 'lamentations', chapters: 5 },
    { id: 'ezekiel', chapters: 48 },
    { id: 'daniel', chapters: 12 },
    { id: 'hosea', chapters: 14 },
    { id: 'joel', chapters: 3 },
    { id: 'amos', chapters: 9 },
    { id: 'obadiah', chapters: 1 },
    { id: 'jonah', chapters: 4 },
    { id: 'micah', chapters: 7 },
    { id: 'nahum', chapters: 3 },
    { id: 'habakkuk', chapters: 3 },
    { id: 'zephaniah', chapters: 3 },
    { id: 'haggai', chapters: 2 },
    { id: 'zechariah', chapters: 14 },
    { id: 'malachi', chapters: 4 },
    // New Testament (27 books)
    { id: 'matthew', chapters: 28 },
    { id: 'mark', chapters: 16 },
    { id: 'luke', chapters: 24 },
    { id: 'john', chapters: 21 },
    { id: 'acts', chapters: 28 },
    { id: 'romans', chapters: 16 },
    { id: '1corinthians', chapters: 16 },
    { id: '2corinthians', chapters: 13 },
    { id: 'galatians', chapters: 6 },
    { id: 'ephesians', chapters: 6 },
    { id: 'philippians', chapters: 4 },
    { id: 'colossians', chapters: 4 },
    { id: '1thessalonians', chapters: 5 },
    { id: '2thessalonians', chapters: 3 },
    { id: '1timothy', chapters: 6 },
    { id: '2timothy', chapters: 4 },
    { id: 'titus', chapters: 3 },
    { id: 'philemon', chapters: 1 },
    { id: 'hebrews', chapters: 13 },
    { id: 'james', chapters: 5 },
    { id: '1peter', chapters: 5 },
    { id: '2peter', chapters: 3 },
    { id: '1john', chapters: 5 },
    { id: '2john', chapters: 1 },
    { id: '3john', chapters: 1 },
    { id: 'jude', chapters: 1 },
    { id: 'revelation', chapters: 22 },
];

// Book ID mapping to API format
const BOOK_ID_MAP = {
    genesis: 'GEN', exodus: 'EXO', leviticus: 'LEV', numbers: 'NUM', deuteronomy: 'DEU',
    joshua: 'JOS', judges: 'JDG', ruth: 'RUT', '1samuel': '1SA', '2samuel': '2SA',
    '1kings': '1KI', '2kings': '2KI', '1chronicles': '1CH', '2chronicles': '2CH',
    ezra: 'EZR', nehemiah: 'NEH', esther: 'EST', job: 'JOB', psalms: 'PSA',
    proverbs: 'PRO', ecclesiastes: 'ECC', songofsolomon: 'SNG', isaiah: 'ISA',
    jeremiah: 'JER', lamentations: 'LAM', ezekiel: 'EZK', daniel: 'DAN',
    hosea: 'HOS', joel: 'JOL', amos: 'AMO', obadiah: 'OBA', jonah: 'JON',
    micah: 'MIC', nahum: 'NAM', habakkuk: 'HAB', zephaniah: 'ZEP',
    haggai: 'HAG', zechariah: 'ZEC', malachi: 'MAL', matthew: 'MAT',
    mark: 'MRK', luke: 'LUK', john: 'JHN', acts: 'ACT', romans: 'ROM',
    '1corinthians': '1CO', '2corinthians': '2CO', galatians: 'GAL',
    ephesians: 'EPH', philippians: 'PHP', colossians: 'COL',
    '1thessalonians': '1TH', '2thessalonians': '2TH', '1timothy': '1TI',
    '2timothy': '2TI', titus: 'TIT', philemon: 'PHM', hebrews: 'HEB',
    james: 'JAS', '1peter': '1PE', '2peter': '2PE', '1john': '1JN',
    '2john': '2JN', '3john': '3JN', jude: 'JUD', revelation: 'REV'
};

async function fetchChapter(bookId, chapter) {
    const apiBookId = BOOK_ID_MAP[bookId] || bookId.toUpperCase();
    const url = `${API_BASE_URL}/${apiBookId}+${chapter}?translation=almeida`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 429) {
                console.log(`  Rate limited, waiting 5 seconds...`);
                await new Promise(r => setTimeout(r, 5000));
                return fetchChapter(bookId, chapter); // Retry
            }
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`  Failed to fetch ${bookId} ${chapter}:`, error.message);
        return null;
    }
}

async function generateAllBibleData() {
    const dataDir = path.join(process.cwd(), 'public', 'data');

    // Create directory if not exists
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log('Generating ALL Bible data...\n');
    console.log(`Total books: ${ALL_BOOKS.length}`);
    console.log(`Estimated total chapters: 1,189\n`);

    const index = {};
    let totalChapters = 0;
    let successCount = 0;
    let failCount = 0;

    for (const book of ALL_BOOKS) {
        console.log(`\n📖 ${book.id} (${book.chapters} chapters):`);

        for (let chapter = 1; chapter <= book.chapters; chapter++) {
            const data = await fetchChapter(book.id, chapter);
            totalChapters++;

            if (data) {
                const filename = `${book.id}_${chapter}.json`;
                fs.writeFileSync(
                    path.join(dataDir, filename),
                    JSON.stringify(data, null, 2)
                );
                index[`${book.id}_${chapter}`] = filename;
                successCount++;
                process.stdout.write(`  ✓ ${chapter} `);
            } else {
                failCount++;
                process.stdout.write(`  ✗ ${chapter} `);
            }

            // Progress every 10 chapters
            if (chapter % 10 === 0) {
                console.log(` (${chapter}/${book.chapters})`);
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 200));
        }
        console.log(`\n  Done: ${successCount}/${totalChapters} total`);
    }

    // Save index file
    fs.writeFileSync(
        path.join(dataDir, 'index.json'),
        JSON.stringify(index, null, 2)
    );

    console.log(`\n\n✅ COMPLETE!`);
    console.log(`Total chapters: ${totalChapters}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`\nData saved in: public/data/`);
}

console.log('⚠️  WARNING: This will download ALL 1,189 chapters of the Bible!');
console.log('This will take approximately 30-60 minutes and make many API requests.\n');
console.log('Starting in 5 seconds... (Press Ctrl+C to cancel)\n');

setTimeout(() => {
    generateAllBibleData().catch(console.error);
}, 5000);
