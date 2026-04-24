import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import { ThemedText } from './ThemedText';

const PIE_COLORS = ["#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE", "#00E5FF", "#69F0AE", "#FFD740"];

interface SliceData {
  label: string;
  value: number;
}

interface PieChartProps {
  data: SliceData[];
  size?: number;
  innerRadius?: number;
}

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const createArcPath = (cx: number, cy: number, r: number, innerR: number, startAngle: number, endAngle: number) => {
  // Clamp to prevent degenerate arcs
  const end = Math.min(endAngle, startAngle + 359.9);

  const outer1 = polarToCartesian(cx, cy, r, end);
  const outer2 = polarToCartesian(cx, cy, r, startAngle);
  const inner1 = polarToCartesian(cx, cy, innerR, end);
  const inner2 = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = end - startAngle > 180 ? 1 : 0;

  return [
    `M ${outer1.x} ${outer1.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${outer2.x} ${outer2.y}`,
    `L ${inner2.x} ${inner2.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${inner1.x} ${inner1.y}`,
    'Z',
  ].join(' ');
};

export const PieChart: React.FC<PieChartProps> = ({ data, size = 280, innerRadius = 70 }) => {
  if (!data || data.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let currentAngle = 0;

  const slices = data.map((item, i) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...item,
      startAngle,
      angle,
      color: PIE_COLORS[i % PIE_COLORS.length],
    };
  });

  return (
    <View>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, i) => (
            <Path
              key={i}
              d={createArcPath(cx, cy, outerR, innerRadius, slice.startAngle, slice.startAngle + slice.angle)}
              fill={slice.color}
            />
          ))}
          {/* Inner white/transparent circle for donut effect */}
          <Circle cx={cx} cy={cy} r={innerRadius - 2} fill="transparent" />
        </G>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {slices.map((slice, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <ThemedText type="caption" style={{ flex: 1 }}>{slice.label}</ThemedText>
            <ThemedText type="caption" weight="bold">
              {((slice.value / total) * 100).toFixed(1)}%
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legend: {
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
