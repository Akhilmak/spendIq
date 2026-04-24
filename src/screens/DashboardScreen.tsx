import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Dimensions, useColorScheme
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../theme/useThemeColors';
import { ThemedText } from '../components/ThemedText';
import { PremiumCard } from '../components/PremiumCard';
import { FintechBarChart } from '../components/FintechBarChart';
import { getMonthlyStats, getTransactions, getPrevMonthStats, getTopCategory } from '../database/repository';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { EditTransactionScreen } from './EditTransactionScreen';

const fmt = (n: number, sym: string) =>
  `${sym}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TIME_FILTERS = ['Daily', 'Weekly', 'Monthly'];

export const DashboardScreen = ({ navigation }: any) => {
  const colors = useThemeColors();
  const isFocused = useIsFocused();
  const currencySymbol = useSelector((s: RootState) => s.settings.currencySymbol);
  const monthlyBudget = useSelector((s: RootState) => s.settings.monthlyBudget);
  const themeMode = useSelector((s: RootState) => s.settings.themeMode);
  const refreshSignal = useSelector((s: RootState) => s.settings.refreshSignal);
  const system = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && system === 'dark');

  const [stats, setStats] = useState({ monthlyIncome: 0, monthlyExpense: 0, totalBalance: 0 });
  const [prevStats, setPrevStats] = useState({ prevIncome: 0, prevExpense: 0 });
  const [topCategory, setTopCategory] = useState<string | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Monthly');

  const load = useCallback(async () => {
    const [s, prev, top, r] = await Promise.all([
      getMonthlyStats(),
      getPrevMonthStats(),
      getTopCategory(),
      getTransactions({ limit: 4 }),
    ]);
    setStats(s);
    setPrevStats(prev);
    setTopCategory(top);
    setRecent(r as any[]);
  }, []);

  useEffect(() => { if (isFocused) load(); }, [isFocused]);
  useEffect(() => { load(); }, [refreshSignal]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const expenseDelta = prevStats.prevExpense > 0
    ? ((stats.monthlyExpense - prevStats.prevExpense) / prevStats.prevExpense) * 100
    : null;

  const getChartData = () => {
    if (timeFilter === 'Daily') return [
      { label: '08:00', value: 120 }, { label: '12:00', value: 340 }, { label: '16:00', value: 210 }, 
      { label: '20:00', value: 80 }, { label: 'Now', value: 10 }
    ];
    if (timeFilter === 'Weekly') return [
      { label: 'M', value: 450 }, { label: 'T', value: 320 }, { label: 'W', value: 580 }, 
      { label: 'T', value: 410 }, { label: 'F', value: 890 }, { label: 'S', value: 650 }, { label: 'S', value: 210 }
    ];
    return [
      { label: 'W1', value: 1200 }, { label: 'W2', value: 1850 }, 
      { label: 'W3', value: 1400 }, { label: 'W4', value: stats.monthlyExpense || 500 }
    ];
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent />

      <LinearGradient
        colors={isDark ? ['rgba(159, 122, 234, 0.1)', 'transparent'] : ['rgba(124, 58, 237, 0.05)', colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View>
             <ThemedText style={[styles.headerGreeting, { color: colors.textSecondary }]}>WELCOME TO</ThemedText>
             <ThemedText style={[styles.headerTitle, { color: colors.text }]}>SpendIQ</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.profileBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Hero Card (Level 1 Glass) */}
        <View style={styles.heroPadding}>
          <PremiumCard variant="glass" level={1} padding={0} style={[styles.heroCard, { borderColor: 'transparent' }]}>
            <View style={styles.heroGradientWrap}>
              <LinearGradient
                colors={isDark ? ['#2D1B69', '#1A1A24'] : colors.gradientBalance}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroLabel}>TOTAL BALANCE</ThemedText>
              <ThemedText style={styles.balanceText}>{fmt(stats.totalBalance, currencySymbol)}</ThemedText>
              
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <View style={styles.heroStatIcon}><Ionicons name="caret-down" size={12} color="#fff" /></View>
                  <View>
                    <ThemedText style={styles.heroStatLabel}>INCOME</ThemedText>
                    <ThemedText style={styles.heroStatValue}>{fmt(stats.monthlyIncome, currencySymbol)}</ThemedText>
                  </View>
                </View>
                <View style={[styles.heroStatItem, { marginLeft: 24 }]}>
                  <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Ionicons name="caret-up" size={12} color="#fff" /></View>
                  <View>
                    <ThemedText style={styles.heroStatLabel}>EXPENSE</ThemedText>
                    <ThemedText style={styles.heroStatValue}>{fmt(stats.monthlyExpense, currencySymbol)}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </PremiumCard>
        </View>

        {/* Bar Chart (Level 2 Glass) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Cash Flow Trend</ThemedText>
            <View style={[styles.trendBadge, { backgroundColor: expenseDelta && expenseDelta > 0 ? colors.dangerMuted : colors.successMuted }]}>
               <ThemedText style={{ color: expenseDelta && expenseDelta > 0 ? colors.danger : colors.success, fontSize: 10, fontWeight: '800' }}>
                 {expenseDelta !== null ? `${expenseDelta.toFixed(0)}%` : '-%'}
               </ThemedText>
            </View>
          </View>
          
          <PremiumCard variant="glass" level={2} style={styles.chartCard}>
            <FintechBarChart data={getChartData()} height={150} />
            
            <View style={[styles.timeFilter, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)', borderColor: colors.border }]}>
               {TIME_FILTERS.map(f => (
                 <TouchableOpacity 
                    key={f} 
                    onPress={() => setTimeFilter(f)}
                    style={[styles.filterBtn, timeFilter === f && { backgroundColor: isDark ? colors.primary + '30' : colors.surface, shadowColor: colors.cardShadow, elevation: 3 }]}
                 >
                   <ThemedText style={[styles.filterLabel, { color: timeFilter === f ? colors.primary : colors.textSecondary, fontWeight: '800' }]}>
                     {f}
                   </ThemedText>
                 </TouchableOpacity>
               ))}
            </View>
          </PremiumCard>
        </View>

        {/* Transactions (Grouped with Level 2 Glass) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</ThemedText>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <ThemedText style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>SEE ALL</ThemedText>
            </TouchableOpacity>
          </View>

          <PremiumCard variant="glass" level={2} style={styles.listCard}>
            {recent.map((item, idx) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.txRow, idx < recent.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
                onPress={() => { setEditItem(item); setEditVisible(true); }}
              >
                <View style={[styles.txIcon, { backgroundColor: (item.categoryColor || colors.primary) + (isDark ? '25' : '15') }]}>
                  <Ionicons name={item.categoryIcon as any || 'cube'} size={18} color={item.categoryColor || colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.txMerchant, { color: colors.text }]}>{item.merchant}</ThemedText>
                  <ThemedText style={[styles.txMeta, { color: colors.textSecondary }]}>{item.categoryName} • {new Date(item.date).toLocaleDateString()}</ThemedText>
                </View>
                <ThemedText style={[styles.txAmount, { color: item.type === 'Income' ? colors.success : colors.danger }]}>
                  {item.type === 'Income' ? '+' : '-'}{currencySymbol}{Number(item.amount).toFixed(2)}
                </ThemedText>
              </TouchableOpacity>
            ))}
            {recent.length === 0 && (
              <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>No records detected.</ThemedText>
            )}
          </PremiumCard>
        </View>
      </ScrollView>

      <EditTransactionScreen visible={editVisible} transaction={editItem} onClose={() => setEditVisible(false)} onSaved={load} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 22, paddingTop: 60, paddingBottom: 15 
  },
  headerGreeting: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginTop: 2 },
  profileBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  
  heroPadding: { paddingHorizontal: 18, marginTop: 5 },
  heroCard: { minHeight: 180, justifyContent: 'center', overflow: 'hidden', borderWidth: 0 },
  heroGradientWrap: { ...StyleSheet.absoluteFillObject, borderRadius: 24, overflow: 'hidden' },
  heroContent: { zIndex: 1, padding: 24 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  balanceText: { color: '#fff', fontSize: 38, fontWeight: '900', marginTop: 4, fontFamily: 'monospace' },
  heroStats: { flexDirection: 'row', marginTop: 28, alignItems: 'center' },
  heroStatItem: { flexDirection: 'row', alignItems: 'center' },
  heroStatIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  heroStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '800' },
  heroStatValue: { color: '#fff', fontSize: 15, fontWeight: '800' },

  section: { paddingHorizontal: 18, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  
  chartCard: { padding: 18, paddingBottom: 15 },
  timeFilter: { flexDirection: 'row', marginTop: 35, padding: 4, borderRadius: 14, borderWidth: 1 },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  filterLabel: { fontSize: 11 },

  listCard: { padding: 8 },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  txIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  txMerchant: { fontSize: 16, fontWeight: '700' },
  txMeta: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  txAmount: { fontSize: 15, fontWeight: '900' },
  emptyText: { textAlign: 'center', padding: 30, fontSize: 14, fontWeight: '600' },
});
