import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, StatusBar, useColorScheme
} from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { ThemedText } from '../components/ThemedText';
import { getTransactions, deleteTransaction } from '../database/repository';
import { EditTransactionScreen } from './EditTransactionScreen';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { bumpRefresh } from '../store/settingsSlice';
import { BlurView } from 'expo-blur';
import { PremiumCard } from '../components/PremiumCard';

const FILTERS = ['All', 'Income', 'Expense'];

export const TransactionsScreen = () => {
  const colors = useThemeColors();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const currencySymbol = useSelector((s: RootState) => s.settings.currencySymbol);
  const refreshSignal = useSelector((s: RootState) => s.settings.refreshSignal);
  const themeMode = useSelector((s: RootState) => s.settings.themeMode);
  const system = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && system === 'dark');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const typeParam = activeFilter === 'Inflow' ? 'Income' : activeFilter === 'Outflow' ? 'Expense' : undefined;
      const rows = await getTransactions({
        type: typeParam,
        search: search || undefined,
      });
      setTransactions(rows as any[]);
    } catch (e) { console.error(e); }
  }, [activeFilter, search]);

  useEffect(() => { if (isFocused) fetchTransactions(); }, [isFocused, fetchTransactions]);
  useEffect(() => { fetchTransactions(); }, [refreshSignal]);

  const handleDelete = (id: number) => {
    Alert.alert('Erase Record', 'Remove permanently?', [
      { text: 'Abort', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: async () => {
          await deleteTransaction(id);
          dispatch(bumpRefresh());
          fetchTransactions();
      }},
    ]);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => { setEditItem(item); setEditVisible(true); }}
      onLongPress={() => handleDelete(item.id)}
      style={[styles.txRow, { borderBottomColor: colors.divider, borderBottomWidth: index < transactions.length - 1 ? 1 : 0 }]}
    >
      <View style={[styles.txIcon, { backgroundColor: (item.categoryColor || colors.primary) + (isDark ? '25' : '12') }]}>
        <Ionicons name={item.categoryIcon as any || 'cube-outline'} size={20} color={item.categoryColor || colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.txMerchant, { color: colors.text }]}>{item.merchant}</ThemedText>
        <ThemedText style={[styles.txMeta, { color: colors.textSecondary }]}>
          {item.categoryName} • {new Date(item.date).toLocaleDateString()}
        </ThemedText>
      </View>

      <View style={styles.txRight}>
        <ThemedText style={[styles.txAmount, { color: item.type === 'Income' ? colors.success : colors.danger }]}>
          {item.type === 'Income' ? '+' : '-'}{currencySymbol}{Number(item.amount).toFixed(2)}
        </ThemedText>
        <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Transactions</ThemedText>
        <ThemedText style={{ color: colors.textTertiary, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>HISTORY</ThemedText>
      </View>

      {/* Search Bar - Level 2 Glass */}
      <View style={styles.searchSection}>
        <PremiumCard variant="glass" level={2} padding={0} style={styles.searchCard}>
          <View style={styles.searchInner}>
             <Ionicons name="search" size={18} color={colors.textTertiary} />
             <TextInput
               style={[styles.searchInput, { color: colors.text }]}
               placeholder="Search records..."
               placeholderTextColor={colors.textTertiary}
               value={search}
               onChangeText={setSearch}
             />
          </View>
        </PremiumCard>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <View style={[styles.segment, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.segmentItem, activeFilter === f && { backgroundColor: isDark ? colors.primary + '30' : colors.surface, shadowColor: colors.cardShadow, elevation: 2 }]}
              onPress={() => setActiveFilter(f)}
            >
              <ThemedText style={[styles.segmentLabel, { color: activeFilter === f ? colors.primary : colors.textSecondary, fontWeight: '800' }]}>{f}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trail-sign-outline" size={48} color={colors.textTertiary} />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No matching records detected.</ThemedText>
          </View>
        }
      />

      <EditTransactionScreen visible={editVisible} transaction={editItem} onClose={() => setEditVisible(false)} onSaved={fetchTransactions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 22, paddingTop: 60, paddingBottom: 10 },
  headerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  
  searchSection: { paddingHorizontal: 20, marginBottom: 15 },
searchCard: {
  width: '90%',
  alignSelf: 'center',
  height: 44,          // 👈 KEY (Google-style height)
  borderRadius: 22,
  paddingHorizontal: 12,
  justifyContent: 'center',
},
 searchInner: {
  flexDirection: 'row',
  alignItems: 'center',
  height: '100%',
},
 searchInput: {
  flex: 1,
  fontSize: 14,
  paddingVertical: 0,   // 👈 removes extra height
  marginLeft: 8,
},

  filterSection: { paddingHorizontal: 20, marginBottom: 20 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 16, borderWidth: 1 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  segmentLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4, gap: 14 },
  txIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  txMerchant: { fontSize: 16, fontWeight: '800' },
  txMeta: { fontSize: 12, marginTop: 3, fontWeight: '600' },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '900' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 14, fontWeight: '700', marginTop: 15 },
});
