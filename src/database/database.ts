import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('bible.db');
      await runMigrations();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      dbInstance = null;
    }
  }

  async transaction<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');
    let result: T;
    await this.db.withTransactionAsync(async () => {
      result = await callback(this.db!);
    });
    return result!;
  }
}

// Singleton instance
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

export const getDatabase = (): SQLite.SQLiteDatabase => {
  return getDatabaseService().getDatabase();
};
