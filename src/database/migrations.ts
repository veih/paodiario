import { getDatabase } from './database';

interface Migration {
  version: number;
  name: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Initial schema',
    sql: `
      CREATE TABLE IF NOT EXISTS translations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        language TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        chapters INTEGER NOT NULL,
        testament TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        translation_id TEXT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id),
        FOREIGN KEY (translation_id) REFERENCES translations(id),
        UNIQUE(book_id, chapter, verse, translation_id)
      );

      CREATE INDEX IF NOT EXISTS idx_verses_lookup ON verses(book_id, chapter, translation_id);
      CREATE INDEX IF NOT EXISTS idx_verses_translation ON verses(translation_id);
    `,
  },
];

export const getCurrentVersion = async (): Promise<number> => {
  const db = getDatabase();
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1;'
    );
    return result?.version || 0;
  } catch {
    // Table doesn't exist yet
    return 0;
  }
};

export const setVersion = async (version: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO schema_version (version, applied_at) VALUES (?, ?);',
    version,
    Date.now()
  );
};

export const createVersionTable = async (): Promise<void> => {
  const db = getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);
};

export const runMigrations = async (): Promise<void> => {
  const db = getDatabase();

  await createVersionTable();
  const currentVersion = await getCurrentVersion();

  const pendingMigrations = MIGRATIONS.filter((m) => m.version > currentVersion);

  if (pendingMigrations.length === 0) {
    console.log('Database is up to date (version:', currentVersion, ')');
    return;
  }

  console.log(`Running ${pendingMigrations.length} migration(s)...`);

  for (const migration of pendingMigrations) {
    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync(migration.sql);
        await setVersion(migration.version);
      });
      console.log(`Migration ${migration.version} applied: ${migration.name}`);
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  console.log('All migrations completed successfully');
};
