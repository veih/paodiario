// Script to generate static JSON data for Bible chapters
// This data will be included in the build and served statically

import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'https://bible-api.com';

// Book ID mapping
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

// Sample chapters to pre-fetch (most popular)
const SAMPLE_CHAPTERS = [
    { book: 'genesis', chapter: 1 },
    { book: 'genesis', chapter: 2 },
    { book: 'genesis', chapter: 3 },
    { book: 'psalms', chapter: 1 },
    { book: 'psalms', chapter: 23 },
    { book: 'psalms', chapter: 91 },
    { book: 'psalms', chapter: 119 },
    { book: 'john', chapter: 3 },
    { book: 'john', chapter: 1 },
    { book: 'romans', chapter: 1 },
    { book: 'romans', chapter: 8 },
    { book: 'matthew', chapter: 5 },
    { book: 'matthew', chapter: 6 },
    { book: 'matthew', chapter: 7 },
    { book: 'revelation', chapter: 1 },
    { book: 'revelation', chapter: 22 },
];

async function fetchChapter(bookId, chapter) {
    const apiBookId = BOOK_ID_MAP[bookId] || bookId.toUpperCase();
    const url = `${API_BASE_URL}/${apiBookId}+${chapter}?translation=almeida`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${bookId} ${chapter}:`, error.message);
        return null;
    }
}

async function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function generateStaticData() {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const distDataDir = path.join(process.cwd(), 'dist', 'data');

    // Create directories if not exists
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log('Generating static Bible data...\n');

    const index = {};

    for (const { book, chapter } of SAMPLE_CHAPTERS) {
        const data = await fetchChapter(book, chapter);
        if (data) {
            const filename = `${book}_${chapter}.json`;
            fs.writeFileSync(
                path.join(dataDir, filename),
                JSON.stringify(data, null, 2)
            );
            index[`${book}_${chapter}`] = filename;
            console.log(`✓ ${book} ${chapter} (${data.verses?.length || 0} verses)`);
        }
        // Small delay to be nice to the API
        await new Promise(r => setTimeout(r, 100));
    }

    // Save index file
    fs.writeFileSync(
        path.join(dataDir, 'index.json'),
        JSON.stringify(index, null, 2)
    );

    console.log(`\n✓ Generated ${Object.keys(index).length} chapters in public/data/`);

    // Also copy to dist if it exists (for Vercel deployment)
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        console.log('\nCopying data to dist folder...');
        await copyDir(dataDir, distDataDir);
        console.log('✓ Data copied to dist/data/');
    }
}

generateStaticData().catch(console.error);
