import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, useColorScheme } from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { ThemedText } from '../components/ThemedText';
import { PremiumCard } from '../components/PremiumCard';
import { getMonthlyStats, getCategoryExpenses } from '../database/repository';
import { useIsFocused } from '@react-navigation/native';
import { PieChart } from '../components/PieChart';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons } from '@expo/vector-icons';

interface CategoryExpense { label: string; value: number; color: string; }

export const AnalyticsScreen = () => {
  const colors = useThemeColors();
  const isFocused = useIsFocused();
  const currencySymbol = useSelector((s: RootState) => s.settings.currencySymbol);
  const themeMode = useSelector((s: RootState) => s.settings.themeMode);
  const system = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && system === 'dark');

  const [pieData, setPieData] = useState<CategoryExpense[]>([]);
  const [stats, setStats] = useState({ monthlyIncome: 0, monthlyExpense: 0 });

  useEffect(() => {
    if (isFocused) {
      getMonthlyStats().then(setStats);
      getCategoryExpenses().then(data => {
         const formatted = data.map((d: any) => ({
           label: d.name,
           value: d.total,
           color: d.color || colors.primary
         }));
         setPieData(formatted);
      });
    }
  }, [isFocused]);

  const topCategory = pieData.sort((a,b) => b.value - a.value)[0];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
           <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Analytics</ThemedText>
           <ThemedText style={[styles.headerSub, { color: colors.textSecondary }]}>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</ThemedText>
        </View>

        {/* Major Insight (Glass Highlight with Fixed Contrast) */}
        <View style={styles.insightPadding}>
          <PremiumCard variant="glass" intensity={isDark ? 30 : 50} style={[styles.insightCard, !isDark && { backgroundColor: colors.primaryMuted + '40' }]}>
             <View style={styles.insightFlex}>
               <View style={styles.insightInfo}>
                  <View style={styles.insightHeader}>
                     <Ionicons name="bulb" size={16} color={isDark ? colors.accent : colors.primary} />
                     <ThemedText style={[styles.insightTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : colors.primary }]}>Key Insight</ThemedText>
                  </View>
                  <ThemedText style={[styles.insightDesc, { color: isDark ? '#fff' : '#1A1A1A' }]}>
                    {topCategory 
                      ? `You've allocated ${((topCategory.value / (stats.monthlyExpense || 1)) * 100).toFixed(0)}% of your budget to ${topCategory.label}.`
                      : 'Not enough data for insights yet.'}
                  </ThemedText>
               </View>
               <View style={[styles.insightIcon, { backgroundColor: isDark ? colors.primary + '30' : colors.primaryMuted }]}>
                  <Ionicons name="analytics" size={24} color={isDark ? colors.primary : colors.primary} />
               </View>
             </View>
          </PremiumCard>
        </View>

        {/* Charts (Soft UI) */}
        <View style={styles.section}>
          <PremiumCard variant="soft" style={styles.chartCard} intensity={10}>
             <ThemedText style={[styles.sectionLabel, { color: colors.text }]}>Spending Breakdown</ThemedText>
             {pieData.length > 0 ? (
                <View style={styles.chartBox}>
                   <PieChart data={pieData} size={220} innerRadius={65} />
                   <View style={styles.legend}>
                      {pieData.slice(0, 4).map((item, i) => (
                        <View key={i} style={styles.legendItem}>
                           <View style={[styles.dot, { backgroundColor: item.color }]} />
                           <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
                             {item.label} ({((item.value / stats.monthlyExpense) * 100).toFixed(0)}%)
                           </ThemedText>
                        </View>
                      ))}
                   </View>
                </View>
             ) : (
                <View style={styles.empty}>
                   <ThemedText style={{ color: colors.textTertiary }}>No data available yet</ThemedText>
                </View>
             )}
          </PremiumCard>
        </View>

        {/* Summary (Soft UI) */}
        <View style={styles.summaryGrid}>
           <PremiumCard variant="soft" style={styles.summaryItem}>
              <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>Total Saved</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: colors.success }]}>
                {currencySymbol}{(stats.monthlyIncome - stats.monthlyExpense).toFixed(0)}
              </ThemedText>
           </PremiumCard>
           <PremiumCard variant="soft" style={[styles.summaryItem, { marginLeft: 12 }]}>
              <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>Daily Avg</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: colors.primary }]}>
                {currencySymbol}{(stats.monthlyExpense / 30).toFixed(0)}
              </ThemedText>
           </PremiumCard>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 140 },
  header: { paddingHorizontal: 22, paddingTop: 60, marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 4, fontWeight: '600' },

  insightPadding: { paddingHorizontal: 18 },
  insightCard: { borderRadius: 24, padding: 18 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  insightFlex: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  insightInfo: { flex: 1 },
  insightTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  insightDesc: { fontSize: 16, fontWeight: '700' },
  insightIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },

  section: { paddingHorizontal: 18, marginTop: 24 },
  sectionLabel: { fontSize: 15, fontWeight: '800', marginBottom: 20 },
  chartCard: { padding: 24 },
  chartBox: { alignItems: 'center' },
  legend: { marginTop: 24, width: '100%', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13, fontWeight: '700' },
  empty: { height: 200, justifyContent: 'center', alignItems: 'center' },

  summaryGrid: { flexDirection: 'row', paddingHorizontal: 18, marginTop: 15 },
  summaryItem: { flex: 1, padding: 16 },
  summaryLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  summaryValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
});
