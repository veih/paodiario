// Web fallback for database - SQLite is not available on web
// This provides a mock implementation that always uses the API

export interface SQLiteDatabase {
  // Mock interface for web
}

export class DatabaseService {
  async initialize(): Promise<void> {
    console.log('Web mode: Database initialization skipped');
  }

  getDatabase(): SQLiteDatabase {
    throw new Error('Database not available on web platform');
  }

  async close(): Promise<void> {
    // No-op on web
  }

  async transaction<T>(): Promise<T> {
    throw new Error('Transactions not available on web platform');
  }
}

let databaseService: DatabaseService | null = null;

export const getDatabaseService = (): DatabaseService => {
  if (!databaseService) {
    databaseService = new DatabaseService();
  }
  return databaseService;
};

export const initializeDatabase = async (): Promise<void> => {
  const service = getDatabaseService();
  await service.initialize();
};

export const getDatabase = (): SQLiteDatabase => {
  return getDatabaseService().getDatabase();
};
