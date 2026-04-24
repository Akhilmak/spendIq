import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('finance_tracker.db');
  return db;
};

export const initDb = async () => {
  const database = await getDb();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS Categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      isCustom INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT NOT NULL, -- 'Income' | 'Expense'
      categoryId INTEGER NOT NULL,
      date TEXT NOT NULL, -- ISO 8601 String
      notes TEXT,
      merchant TEXT,
      isAutoDetected INTEGER DEFAULT 0,
      FOREIGN KEY (categoryId) REFERENCES Categories(id)
    );
  `);

  // Seed default categories if none exist
  const countResult = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM Categories;'
  );
  
  if (countResult && countResult.count === 0) {
    await database.execAsync(`
      INSERT INTO Categories (name, icon, color, isCustom) VALUES 
      ('Food', 'fast-food', '#FF5722', 0),
      ('Travel', 'car', '#2196F3', 0),
      ('Bills', 'receipt', '#F44336', 0),
      ('Shopping', 'bag', '#9C27B0', 0),
      ('Salary', 'cash', '#4CAF50', 0);
    `);
  }
};
