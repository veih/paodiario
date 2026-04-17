// Script to test API connectivity and show available Bible data
// Run with: npx ts-node scripts/populateDatabase.ts

import { getAllBooks, getAllTranslations, fetchChapter } from '../src/api/bibleApi';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Test API connection
 */
async function testApiConnection(): Promise<boolean> {
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
    console.error('✗ API connection failed:', error);
    return false;
  }
}

/**
 * Fetch and display a chapter (without database)
 */
async function fetchAndDisplayChapter(
  bookId: string,
  chapter: number,
  translation: string = 'acf'
): Promise<void> {
  try {
    console.log(`\nFetching ${bookId} ${chapter} (${translation})...`);
    const data = await fetchChapter(bookId, chapter, translation);
    console.log(`✓ Found ${data.verses?.length || 0} verses`);
    
    // Display first 3 verses
    if (data.verses && data.verses.length > 0) {
      console.log('\nFirst 3 verses:');
      data.verses.slice(0, 3).forEach((verse) => {
        console.log(`  ${verse.verse}. ${verse.text.substring(0, 80)}...`);
      });
    }
  } catch (error) {
    console.error(`✗ Failed to fetch ${bookId} ${chapter}:`, error);
  }
}

/**
 * Show available books and translations
 */
function showAvailableData(): void {
  const books = getAllBooks();
  const translations = getAllTranslations();
  
  console.log('\n=== Available Translations ===');
  translations.forEach((t) => {
    console.log(`  ${t.abbreviation} - ${t.name}`);
  });
  
  console.log(`\n=== Available Books (${books.length}) ===`);
  console.log(`  Old Testament: ${books.filter((b) => ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua', 'judges', 'ruth', '1samuel', '2samuel', '1kings', '2kings', '1chronicles', '2chronicles', 'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'proverbs', 'ecclesiastes', 'songofsolomon', 'isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'].includes(b.id)).length} books`);
  console.log(`  New Testament: ${books.filter((b) => ['matthew', 'mark', 'luke', 'john', 'acts', 'romans', '1corinthians', '2corinthians', 'galatians', 'ephesians', 'philippians', 'colossians', '1thessalonians', '2thessalonians', '1timothy', '2timothy', 'titus', 'philemon', 'hebrews', 'james', '1peter', '2peter', '1john', '2john', '3john', 'jude', 'revelation'].includes(b.id)).length} books`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
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
        
      case 'fetch':
        const bookId = args[1] || 'genesis';
        const chapter = parseInt(args[2], 10) || 1;
        const translation = args[3] || 'acf';
        await fetchAndDisplayChapter(bookId, chapter, translation);
        break;
        
      default:
        console.log(`
Usage:
  npx ts-node scripts/populateDatabase.ts [command] [options]

Commands:
  info                           - Show available data and test API (default)
  fetch <book> <chapter> [trans] - Fetch and display a specific chapter

Examples:
  npx ts-node scripts/populateDatabase.ts info
  npx ts-node scripts/populateDatabase.ts fetch genesis 1 acf
  npx ts-node scripts/populateDatabase.ts fetch psalms 23 nvi
        `);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
