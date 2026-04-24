import { getDb } from '../database/db';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  isCustom: number;
}

export const getCategories = async (): Promise<Category[]> => {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM Categories ORDER BY id ASC');
};

export const addCategory = async (name: string, icon: string, color: string): Promise<void> => {
  const db = await getDb();
  await db.runAsync('INSERT INTO Categories (name, icon, color, isCustom) VALUES (?, ?, ?, 1)', [name, icon, color]);
};

export const getTransactions = async (options?: {
  type?: string;
  categoryId?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}) => {
  const db = await getDb();
  let query = `
    SELECT t.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor
    FROM Transactions t
    LEFT JOIN Categories c ON t.categoryId = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (options?.type) {
    query += ' AND t.type = ?';
    params.push(options.type);
  }
  if (options?.categoryId) {
    query += ' AND t.categoryId = ?';
    params.push(options.categoryId);
  }
  if (options?.search) {
    query += ' AND (t.merchant LIKE ? OR t.notes LIKE ?)';
    params.push(`%${options.search}%`, `%${options.search}%`);
  }
  if (options?.fromDate) {
    query += ' AND t.date >= ?';
    params.push(options.fromDate);
  }
  if (options?.toDate) {
    query += ' AND t.date <= ?';
    params.push(options.toDate);
  }

  query += ' ORDER BY t.date DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  return db.getAllAsync(query, params);
};

export const addTransaction = async (data: {
  amount: number;
  type: 'Income' | 'Expense';
  categoryId: number;
  date: string;
  notes?: string;
  merchant: string;
}): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO Transactions (amount, type, categoryId, date, notes, merchant, isAutoDetected) VALUES (?, ?, ?, ?, ?, ?, 0)',
    [data.amount, data.type, data.categoryId, data.date, data.notes || '', data.merchant]
  );
};

export const deleteTransaction = async (id: number): Promise<void> => {
  const db = await getDb();
  await db.runAsync('DELETE FROM Transactions WHERE id = ?', [id]);
};

export const updateTransaction = async (
  id: number,
  data: {
    amount: number;
    type: 'Income' | 'Expense';
    categoryId: number;
    date: string;
    notes?: string;
    merchant: string;
  }
): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE Transactions SET amount=?, type=?, categoryId=?, date=?, notes=?, merchant=? WHERE id=?',
    [data.amount, data.type, data.categoryId, data.date, data.notes || '', data.merchant, id]
  );
};

export const getPrevMonthStats = async () => {
  const db = await getDb();
  const now = new Date();

  const prevFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const prevLast = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const result = await db.getFirstAsync<{ income: number; expense: number }>(
    `SELECT COALESCE(SUM(CASE WHEN type='Income' THEN amount ELSE 0 END),0) as income,
            COALESCE(SUM(CASE WHEN type='Expense' THEN amount ELSE 0 END),0) as expense
     FROM Transactions WHERE date >= ? AND date <= ?`,
    [prevFirst, prevLast]
  );

  return { prevIncome: result?.income ?? 0, prevExpense: result?.expense ?? 0 };
};

export const getTopCategory = async (): Promise<string | null> => {
  const db = await getDb();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const row = await db.getFirstAsync<{ label: string }>(
    `SELECT c.name as label FROM Transactions t
     LEFT JOIN Categories c ON t.categoryId = c.id
     WHERE t.type = 'Expense' AND t.date >= ? AND t.date <= ?
     GROUP BY t.categoryId ORDER BY SUM(t.amount) DESC LIMIT 1`,
    [firstDay, lastDay]
  );
  return row?.label ?? null;
};

export const getMonthlyStats = async () => {
  const db = await getDb();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const income = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM Transactions WHERE type='Income' AND date >= ? AND date <= ?`,
    [firstDay, lastDay]
  );
  const expense = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM Transactions WHERE type='Expense' AND date >= ? AND date <= ?`,
    [firstDay, lastDay]
  );
  const allTimeBalance = await db.getFirstAsync<{ income: number; expense: number }>(
    `SELECT COALESCE(SUM(CASE WHEN type='Income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type='Expense' THEN amount ELSE 0 END), 0) as expense
     FROM Transactions`
  );

  return {
    monthlyIncome: income?.total ?? 0,
    monthlyExpense: expense?.total ?? 0,
    totalBalance: (allTimeBalance?.income ?? 0) - (allTimeBalance?.expense ?? 0),
  };
};

export const getCategoryExpenses = async () => {
  const db = await getDb();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  return db.getAllAsync(`
    SELECT c.name, c.color, SUM(t.amount) as total
    FROM Transactions t
    JOIN Categories c ON t.categoryId = c.id
    WHERE t.type = 'Expense' AND t.date >= ? AND t.date <= ?
    GROUP BY t.categoryId
    ORDER BY total DESC
  `, [firstDay, lastDay]);
};
