import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

const BIBLE_API_BASE_URL = 'https://bible-api.com';

// Translation mapping from our codes to bible-api.com codes
const TRANSLATION_MAP: Record<string, string> = {
  acf: 'almeida',      // Almeida Corrigida e Fiel
  ara: 'almeida',      // Almeida Revista e Atualizada (fallback to almeida)
  arc: 'almeida',      // Almeida Revista e Corrigida (fallback to almeida)
  nvi: 'almeida',      // Nova Versão Internacional (fallback to almeida)
  naa: 'almeida',      // Nova Almeida Atualizada (fallback to almeida)
};

// Book ID mapping from our format to bible-api.com format
const BOOK_ID_MAP: Record<string, string> = {
  genesis: 'GEN',
  exodus: 'EXO',
  leviticus: 'LEV',
  numbers: 'NUM',
  deuteronomy: 'DEU',
  joshua: 'JOS',
  judges: 'JDG',
  ruth: 'RUT',
  '1samuel': '1SA',
  '2samuel': '2SA',
  '1kings': '1KI',
  '2kings': '2KI',
  '1chronicles': '1CH',
  '2chronicles': '2CH',
  ezra: 'EZR',
  nehemiah: 'NEH',
  esther: 'EST',
  job: 'JOB',
  psalms: 'PSA',
  proverbs: 'PRO',
  ecclesiastes: 'ECC',
  songofsolomon: 'SNG',
  isaiah: 'ISA',
  jeremiah: 'JER',
  lamentations: 'LAM',
  ezekiel: 'EZK',
  daniel: 'DAN',
  hosea: 'HOS',
  joel: 'JOL',
  amos: 'AMO',
  obadiah: 'OBA',
  jonah: 'JON',
  micah: 'MIC',
  nahum: 'NAM',
  habakkuk: 'HAB',
  zephaniah: 'ZEP',
  haggai: 'HAG',
  zechariah: 'ZEC',
  malachi: 'MAL',
  matthew: 'MAT',
  mark: 'MRK',
  luke: 'LUK',
  john: 'JHN',
  acts: 'ACT',
  romans: 'ROM',
  '1corinthians': '1CO',
  '2corinthians': '2CO',
  galatians: 'GAL',
  ephesians: 'EPH',
  philippians: 'PHP',
  colossians: 'COL',
  '1thessalonians': '1TH',
  '2thessalonians': '2TH',
  '1timothy': '1TI',
  '2timothy': '2TI',
  titus: 'TIT',
  philemon: 'PHM',
  hebrews: 'HEB',
  james: 'JAS',
  '1peter': '1PE',
  '2peter': '2PE',
  '1john': '1JN',
  '2john': '2JN',
  '3john': '3JN',
  jude: 'JUD',
  revelation: 'REV',
};

function getApiTranslation(translation: string): string {
  return TRANSLATION_MAP[translation] || 'almeida';
}

function getApiBookId(bookId: string): string {
  return BOOK_ID_MAP[bookId] || bookId.toUpperCase();
}

// Enable CORS for all origins (in production, restrict this)
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for fetching Bible chapters
app.get('/api/bible/:bookId/:chapter', async (req, res) => {
  try {
    const { bookId, chapter } = req.params;
    const { translation = 'acf' } = req.query;

    const apiTranslation = getApiTranslation(translation as string);
    const apiBookId = getApiBookId(bookId);
    const apiUrl = `${BIBLE_API_BASE_URL}/${apiBookId}+${chapter}?translation=${apiTranslation}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to fetch from Bible API',
        status: response.status 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying Bible API request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Bible API proxy server running on http://localhost:${PORT}`);
});
