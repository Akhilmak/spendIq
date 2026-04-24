import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Text, Defs, LinearGradient, Stop, Path, Circle, Rect } from 'react-native-svg';
import { useThemeColors } from '../theme/useThemeColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export const SpendIQSplash: React.FC<Props> = ({ onFinish }) => {
  const colors = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(onFinish);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#0B0B12' }]}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <Svg width={SCREEN_WIDTH * 0.85} height={(SCREEN_WIDTH * 0.85) / 3} viewBox="0 0 900 300" fill="none">
          <Defs>
            <LinearGradient id="moneyGrad" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#22C55E" />
              <Stop offset="0.35" stopColor="#4C6FFF" />
              <Stop offset="0.7" stopColor="#7C5CFF" />
              <Stop offset="1" stopColor="#4DE3FF" />
            </LinearGradient>
          </Defs>

          {/* Subtle cash flow line */}
          <Path 
            d="M140 185 C260 120, 360 250, 480 160 C600 80, 700 220, 820 140"
            stroke="url(#moneyGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.25"
          />

          {/* Spend */}
          <Text
            x="140"
            y="180"
            fontSize="92"
            fontWeight="700"
            fill="url(#moneyGrad)"
          >
            Spend
          </Text>

          {/* IQ */}
          <Text
            x="430"
            y="180"
            fontSize="92"
            fontWeight="800"
            fill="url(#moneyGrad)"
          >
            IQ
          </Text>

          {/* Insight dot */}
          <Circle cx="545" cy="120" r="6" fill="#4DE3FF" />

          {/* Underline */}
          <Rect x="140" y="205" width="520" height="3" fill="url(#moneyGrad)" opacity="0.25" />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});
