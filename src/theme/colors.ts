export const financeDark = {
  background: '#0B0B0F',
  backgroundAlt: '#12121A',
  surface: '#1A1A24',
  surfaceAlt: '#22222E',
  
  // Glass System - Premium Dark
  glassLevel1: 'rgba(18, 18, 26, 0.75)', // Hero / Modal
  glassLevel2: 'rgba(30, 30, 40, 0.55)',  // Standard Cards
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.08)',
  glassShadow: 'rgba(159, 122, 234, 0.08)', // Subtle primary glow
  
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#606070',
  
  primary: '#9F7AEA', 
  primaryMuted: 'rgba(159, 122, 234, 0.15)',
  accent: '#F687B3', 
  
  success: '#48BB78',
  successMuted: 'rgba(72, 187, 120, 0.15)',
  warning: '#ECC94B',
  warningMuted: 'rgba(236, 201, 75, 0.15)',
  danger: '#F56565',
  dangerMuted: 'rgba(245, 101, 101, 0.15)',
  
  border: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.04)',
  
  gradientPrimary: ['#9F7AEA', '#F687B3'] as [string, string],
  gradientBalance: ['#2D1B69', '#1A1A24'] as [string, string],
  cardShadow: 'rgba(0, 0, 0, 0.45)',
  
  isDark: true,
};

export const financeLight = {
  background: '#F8F9FE', 
  backgroundAlt: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F5FC',
  
  // Glass System - Liquid Light
  glassLevel1: 'rgba(255, 255, 255, 0.8)',   // Hero / Modal (Opaque-ish)
  glassLevel2: 'rgba(240, 235, 255, 0.65)', // Standard Cards (Hint of flavor)
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
  glassShadow: 'rgba(0, 0, 0, 0.06)',
  
  text: '#1A1A2E',
  textSecondary: '#4B5563', // Darker for better contrast
  textTertiary: '#9CA3AF',
  
  primary: '#7C3AED', 
  primaryMuted: 'rgba(124, 58, 237, 0.12)',
  accent: '#DB2777', 
  
  success: '#059669',
  successMuted: 'rgba(5, 150, 105, 0.08)',
  warning: '#D97706',
  warningMuted: 'rgba(217, 119, 6, 0.08)',
  danger: '#DC2626',
  dangerMuted: 'rgba(220, 38, 38, 0.08)',
  
  border: 'rgba(0, 0, 0, 0.05)',
  divider: 'rgba(0, 0, 0, 0.03)',
  
  gradientPrimary: ['#7C3AED', '#DB2777'] as [string, string],
  gradientBalance: ['#7C3AED', '#EC4899'] as [string, string],
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  
  isDark: false,
};

export type ThemeColors = typeof financeDark;
