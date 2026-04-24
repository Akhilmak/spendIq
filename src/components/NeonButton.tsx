import React from 'react';
import {
  TouchableOpacity, StyleSheet, TouchableOpacityProps, StyleProp, ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../theme/useThemeColors';
import { ThemedText } from './ThemedText';

interface NeonButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  containerStyle?: StyleProp<ViewStyle>;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  title,
  variant = 'primary',
  containerStyle,
  ...props
}) => {
  const colors = useThemeColors();

  if (variant === 'ghost' || variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 14,
          },
          containerStyle,
        ]}
        activeOpacity={0.7}
        {...props}
      >
        <ThemedText
          weight="600"
          style={{ fontSize: 15, color: colors.textSecondary, letterSpacing: 0.2 }}
        >
          {title}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.dangerMuted, borderRadius: 14 }, containerStyle]}
        activeOpacity={0.75}
        {...props}
      >
        <ThemedText weight="bold" style={{ fontSize: 15, color: colors.danger, letterSpacing: 0.3 }}>
          {title}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  // Primary — gradient, but subtle and clean
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 6,
          borderRadius: 14,
          overflow: 'hidden',
        },
        containerStyle,
      ]}
      activeOpacity={0.82}
      {...props}
    >
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
      />
      <ThemedText weight="bold" style={{ fontSize: 15, color: '#fff', letterSpacing: 0.4 }}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
});
