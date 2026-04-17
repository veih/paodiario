import type { VercelRequest, VercelResponse } from '@vercel/node';

const BIBLE_API_BASE_URL = 'https://bible-api.com';

// Book ID mapping
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { bookId, chapter } = req.query;
  const translation = (req.query.translation as string) || 'acf';

  if (!bookId || !chapter) {
    return res.status(400).json({ error: 'Missing bookId or chapter' });
  }

  try {
    const apiBookId = BOOK_ID_MAP[bookId as string] || (bookId as string).toUpperCase();
    const apiUrl = `${BIBLE_API_BASE_URL}/${apiBookId}+${chapter}?translation=almeida`;

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
    console.error('Error fetching Bible data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
