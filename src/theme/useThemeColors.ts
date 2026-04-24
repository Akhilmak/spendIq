import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { financeDark, financeLight, ThemeColors } from './colors';

export const useThemeColors = (): ThemeColors => {
  const systemColorScheme = useColorScheme();
  const themeMode = useSelector((state: RootState) => state.settings.themeMode);

  if (themeMode === 'system') {
    return systemColorScheme === 'dark' ? financeDark : financeLight;
  }

  return themeMode === 'dark' ? financeDark : financeLight;
};
