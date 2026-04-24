import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '../theme/useThemeColors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'glass' | 'soft' | 'flat';
  level?: 1 | 2;
  intensity?: number;
  padding?: number;
}

export const PremiumCard: React.FC<Props> = ({ 
  children, 
  style, 
  variant = 'soft', 
  level = 2,
  intensity,
  padding
}) => {
  const colors = useThemeColors();

  if (variant === 'glass') {
    const bg = level === 1 ? colors.glassLevel1 : colors.glassLevel2;
    const blurIntensity = intensity || (level === 1 ? 25 : 12);

    return (
      <View style={[styles.glassContainer, { borderColor: colors.glassBorder, shadowColor: colors.glassShadow }, style]}>
        <BlurView 
          intensity={blurIntensity} 
          tint={colors.isDark ? 'dark' : 'light'} 
          style={StyleSheet.absoluteFill} 
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />
        
        <View style={[styles.content, padding !== undefined && { padding }]}>{children}</View>
      </View>
    );
  }

  if (variant === 'flat') {
    return (
      <View style={[styles.flatContainer, { borderColor: colors.border }, style]}>
        <View style={[styles.content, padding !== undefined && { padding }]}>{children}</View>
      </View>
    );
  }

  // Standard Soft Variant
  return (
    <View style={[
      styles.softContainer, 
      { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        shadowColor: colors.cardShadow 
      }, 
      style
    ]}>
      <View style={[styles.content, padding !== undefined && { padding }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  softContainer: {
    borderRadius: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  flatContainer: {
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  topEdge: {
    position: 'absolute', top: 0, left: 15, right: 15, height: 1,
  },
  bottomEdge: {
    position: 'absolute', bottom: 0, left: 15, right: 15, height: 1.5,
  },
  content: {
    padding: 20,
  },
});
