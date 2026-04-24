import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { ThemedText } from './ThemedText';

interface BarData {
  label: string;
  value: number;
}

interface Props {
  data: BarData[];
  maxVal?: number;
  height?: number;
}

export const FintechBarChart: React.FC<Props> = ({ data, maxVal, height = 150 }) => {
  const colors = useThemeColors();
  const maxValue = maxVal || Math.max(...data.map(d => d.value), 1);
  
  // Create or reuse animated values for each bar
  const [anims, setAnims] = useState<Animated.Value[]>([]);

  useEffect(() => {
    // Sync animated values with data length
    const newAnims = data.map((_, i) => anims[i] || new Animated.Value(0));
    setAnims(newAnims);

    // Reset and trigger animations
    newAnims.forEach(anim => anim.setValue(0));
    Animated.stagger(40, newAnims.map(anim => 
      Animated.spring(anim, { toValue: 1, useNativeDriver: false, tension: 25, friction: 8 })
    )).start();
  }, [data.length]); // Only re-create if length changes

  return (
    <View style={[styles.container, { height }]}>
      {/* Subtle Grid Lines */}
      <View style={styles.grid}>
        {[0, 0.5, 1].map((p, i) => (
          <View key={i} style={[styles.gridLine, { bottom: `${p * 100}%` as any, backgroundColor: colors.border }]} />
        ))}
      </View>

      <View style={styles.barsContainer}>
        {data.map((item, idx) => {
          const barHeight = (item.value / maxValue) * (height - 25);
          const anim = anims[idx];
          
          if (!anim) return <View key={idx} style={styles.barColumn} />;

          return (
            <View key={idx} style={styles.barColumn}>
              <View style={styles.barClipper}>
                <Animated.View 
                  style={[
                    styles.bar, 
                    { 
                      backgroundColor: colors.primary,
                      height: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.max(barHeight, 4)]
                      })
                    }
                  ]} 
                />
              </View>
              <ThemedText style={[styles.label, { color: colors.textTertiary }]}>{item.label}</ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', justifyContent: 'flex-end', marginTop: 10 },
  grid: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', paddingBottom: 25 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, opacity: 0.3 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', paddingBottom: 25 },
  barColumn: { alignItems: 'center', flex: 1 },
  barClipper: { height: '100%', justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: 12, borderRadius: 6 },
  label: { fontSize: 9, fontWeight: '700', marginTop: 6, position: 'absolute', bottom: -22, textAlign: 'center' },
});
