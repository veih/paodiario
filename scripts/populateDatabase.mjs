// Script to test API connectivity and fetch Bible data
// Run with: node scripts/populateDatabase.mjs

const API_BASE_URL = 'http://localhost:3001/api';

// Bible books data
const BIBLE_BOOKS = {
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

const TRANSLATIONS = [
    { id: 'acf', name: 'Almeida Corrigida e Fiel', abbreviation: 'ACF' },
    { id: 'ara', name: 'Almeida Revista e Atualizada', abbreviation: 'ARA' },
    { id: 'arc', name: 'Almeida Revista e Corrigida', abbreviation: 'ARC' },
    { id: 'nvi', name: 'Nova Versão Internacional', abbreviation: 'NVI' },
    { id: 'naa', name: 'Nova Almeida Atualizada', abbreviation: 'NAA' },
];

function getAllBooks() {
    return [...BIBLE_BOOKS.oldTestament, ...BIBLE_BOOKS.newTestament];
}

async function testApiConnection() {
    try {
        console.log('Testing API connection...');
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✓ API is running:', data);
            return true;
        }
        return false;
    } catch (error) {
        console.error('✗ API connection failed:', error.message);
        return false;
    }
}

async function fetchChapter(bookId, chapter, translation = 'acf') {
    const response = await fetch(
        `${API_BASE_URL}/bible/${bookId}/${chapter}?translation=${translation}`
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch ${bookId} ${chapter}: ${response.status}`);
    }
    return await response.json();
}

async function fetchAndDisplayChapter(bookId, chapter, translation = 'acf') {
    try {
        console.log(`\nFetching ${bookId} ${chapter} (${translation})...`);
        const data = await fetchChapter(bookId, chapter, translation);
        console.log(`✓ Found ${data.verses?.length || 0} verses`);

        if (data.verses && data.verses.length > 0) {
            console.log('\nFirst 3 verses:');
            data.verses.slice(0, 3).forEach((verse) => {
                console.log(`  ${verse.verse}. ${verse.text.substring(0, 80)}...`);
            });
        }
        return data;
    } catch (error) {
        console.error(`✗ Failed to fetch ${bookId} ${chapter}:`, error.message);
        return null;
    }
}

function showAvailableData() {
    const books = getAllBooks();

    console.log('\n=== Available Translations ===');
    TRANSLATIONS.forEach((t) => {
        console.log(`  ${t.abbreviation} - ${t.name}`);
    });

    console.log(`\n=== Available Books (${books.length}) ===`);
    console.log(`  Old Testament: ${BIBLE_BOOKS.oldTestament.length} books`);
    console.log(`  New Testament: ${BIBLE_BOOKS.newTestament.length} books`);
}

async function populateSample() {
    console.log('\n=== Populating Sample Data ===');

    const chaptersToFetch = [
        { book: 'genesis', chapter: 1 },
        { book: 'genesis', chapter: 2 },
        { book: 'genesis', chapter: 3 },
        { book: 'psalms', chapter: 1 },
        { book: 'psalms', chapter: 23 },
        { book: 'john', chapter: 3 },
    ];

    for (const { book, chapter } of chaptersToFetch) {
        await fetchAndDisplayChapter(book, chapter, 'acf');
        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log('\n=== Sample Data Population Complete ===');
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'info';

    try {
        switch (command) {
            case 'info':
                showAvailableData();
                const apiOk = await testApiConnection();
                if (apiOk) {
                    await fetchAndDisplayChapter('genesis', 1, 'acf');
                } else {
                    console.log('\n⚠️  Make sure the server is running: npm run server');
                }
                break;

            case 'sample':
                const apiOk2 = await testApiConnection();
                if (!apiOk2) {
                    console.log('\n⚠️  Make sure the server is running: npm run server');
                    process.exit(1);
                }
                await populateSample();
                break;

            case 'fetch':
                const bookId = args[1] || 'genesis';
                const chapter = parseInt(args[2], 10) || 1;
                const translation = args[3] || 'acf';
                await fetchAndDisplayChapter(bookId, chapter, translation);
                break;

            default:
                console.log(`
Usage:
  node scripts/populateDatabase.mjs [command] [options]

Commands:
  info                           - Show available data and test API (default)
  sample                         - Fetch and display sample chapters
  fetch <book> <chapter> [trans] - Fetch and display a specific chapter

Examples:
  node scripts/populateDatabase.mjs info
  node scripts/populateDatabase.mjs sample
  node scripts/populateDatabase.mjs fetch genesis 1 acf
  node scripts/populateDatabase.mjs fetch psalms 23 nvi
        `);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
