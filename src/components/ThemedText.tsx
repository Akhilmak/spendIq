import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'amount';
  color?: string;
  weight?: 'normal' | 'bold' | '600' | '800';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  children, 
  type = 'default', 
  color, 
  weight,
  style, 
  ...props 
}) => {
  const colors = useThemeColors();

  let defaultStyles: any = { color: color || colors.text };
  
  switch (type) {
    case 'title':
      defaultStyles = { ...defaultStyles, fontSize: 28, fontWeight: 'bold' };
      break;
    case 'subtitle':
      defaultStyles = { ...defaultStyles, fontSize: 18, color: colors.textSecondary };
      break;
    case 'caption':
      defaultStyles = { ...defaultStyles, fontSize: 13, color: colors.textSecondary };
      break;
    case 'amount':
      defaultStyles = { ...defaultStyles, fontSize: 36, fontWeight: '800', fontFamily: 'monospace' };
      break;
    default:
      defaultStyles = { ...defaultStyles, fontSize: 16 };
      break;
  }

  if (weight) {
    defaultStyles.fontWeight = weight;
  }

  return (
    <Text style={[defaultStyles, style]} {...props}>
      {children}
    </Text>
  );
};
