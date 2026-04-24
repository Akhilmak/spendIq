import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  themeMode: ThemeMode;
  monthlyBudget: number;
  currencySymbol: string;
  refreshSignal: number; // Incremented when any transaction mutates
}

const initialState: SettingsState = {
  themeMode: 'system',
  monthlyBudget: 0,
  currencySymbol: '$',
  refreshSignal: 0,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    setMonthlyBudget(state, action: PayloadAction<number>) {
      state.monthlyBudget = action.payload;
    },
    setCurrencySymbol(state, action: PayloadAction<string>) {
      state.currencySymbol = action.payload;
    },
    bumpRefresh(state) {
      state.refreshSignal += 1;
    },
  },
});

export const { setThemeMode, setMonthlyBudget, setCurrencySymbol, bumpRefresh } = settingsSlice.actions;
export default settingsSlice.reducer;
