import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import transactionsReducer from './transactionsSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
