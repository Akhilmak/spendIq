import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: number;
  amount: number;
  type: 'Income' | 'Expense';
  categoryId: number;
  date: string;
  notes?: string;
  merchant: string;
  isAutoDetected: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
}

interface TransactionsState {
  items: Transaction[];
  loading: boolean;
}

const initialState: TransactionsState = {
  items: [],
  loading: false,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.items = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setTransactions, setLoading } = transactionsSlice.actions;
export default transactionsSlice.reducer;
