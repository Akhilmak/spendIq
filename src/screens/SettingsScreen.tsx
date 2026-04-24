import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch, TextInput, Alert, TouchableOpacity, StatusBar, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../components/ThemedText';
import { NeonButton } from '../components/NeonButton';
import { useThemeColors } from '../theme/useThemeColors';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setThemeMode, setMonthlyBudget, setCurrencySymbol } from '../store/settingsSlice';
import { Ionicons } from '@expo/vector-icons';
import { PremiumCard } from '../components/PremiumCard';

const CURRENCIES = [
  { symbol: '$', label: 'USD' }, { symbol: '₹', label: 'INR' },
  { symbol: '€', label: 'EUR' }, { symbol: '£', label: 'GBP' }, { symbol: '¥', label: 'JPY' },
];

interface RowProps { icon: string; label: string; right?: React.ReactNode; onPress?: () => void; isLast?: boolean; }

const Row: React.FC<RowProps> = ({ icon, label, right, onPress, isLast }) => {
  const colors = useThemeColors();
  const Inner = (
    <View style={styles.row}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[styles.rowIcon, { backgroundColor: colors.isDark ? 'rgba(159, 122, 234, 0.1)' : colors.primaryMuted }]}>
          <Ionicons name={icon as any} size={16} color={colors.primary} />
        </View>
        <ThemedText style={[styles.rowLabel, { color: colors.text }]}>{label}</ThemedText>
      </View>
      {right}
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.6}>{Inner}</TouchableOpacity>;
  return Inner;
};

export const SettingsScreen = () => {
  const colors = useThemeColors();
  const dispatch = useDispatch();
  const themeMode = useSelector((s: RootState) => s.settings.themeMode);
  const monthlyBudget = useSelector((s: RootState) => s.settings.monthlyBudget);
  const currencySymbol = useSelector((s: RootState) => s.settings.currencySymbol);
  const system = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && system === 'dark');

  const [budgetInput, setBudgetInput] = useState(monthlyBudget > 0 ? monthlyBudget.toString() : '');

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!budgetInput || isNaN(val) || val < 0) return;
    dispatch(setMonthlyBudget(val));
    Alert.alert('Success', 'Budget updated.');
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <ThemedText style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</ThemedText>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Settings</ThemedText>
        <ThemedText style={{ color: colors.textTertiary, fontSize: 13, fontWeight: '600' }}>Manage your preferences and budget</ThemedText>
      </View>

      <View style={styles.content}>
        <SectionHeader title="EXPERIENCE" />
        <PremiumCard variant="glass" level={2} style={styles.groupCard}>
            <Row icon="moon-outline" label="Dark Theme" right={
              <Switch
                value={themeMode === 'dark'}
                onValueChange={(v) => dispatch(setThemeMode(v ? 'dark' : 'light'))}
                trackColor={{ false: '#333', true: colors.primary + 'AA' }}
                thumbColor={themeMode === 'dark' ? colors.primary : '#888'}
              />
            } />
            <Row icon="sync-outline" label="Sync System" right={
              <Switch
                value={themeMode === 'system'}
                onValueChange={(v) => dispatch(setThemeMode(v ? 'system' : 'dark'))}
                trackColor={{ false: '#333', true: colors.primary + 'AA' }}
                thumbColor={themeMode === 'system' ? colors.primary : '#888'}
              />
            } />
        </PremiumCard>

        <SectionHeader title="VALUATIONS" />
        <PremiumCard variant="glass" level={2} style={styles.groupCard}>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map(c => {
              const selected = currencySymbol === c.symbol;
              return (
                <TouchableOpacity
                  key={c.symbol}
                  style={[styles.currencyItem, { backgroundColor: selected ? colors.primaryMuted : 'transparent', borderColor: selected ? colors.primary : colors.border }]}
                  onPress={() => dispatch(setCurrencySymbol(c.symbol))}
                >
                  <ThemedText style={{ fontSize: 16, color: selected ? colors.primary : colors.text, fontWeight: '800' }}>{c.symbol}</ThemedText>
                  <ThemedText style={{ fontSize: 10, color: selected ? colors.primary : colors.textSecondary, fontWeight: '700' }}>{c.label}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </PremiumCard>

        <SectionHeader title="QUOTA" />
        <PremiumCard variant="glass" level={2} style={styles.groupCard}>
          <View style={[styles.budgetInputRow, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.4)' }]}>
            <ThemedText style={{ fontSize: 18, color: colors.textSecondary, fontWeight: '800' }}>{currencySymbol}</ThemedText>
            <TextInput
              style={[styles.budgetInput, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={saveBudget}>
             <LinearGradient colors={colors.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
             <ThemedText style={styles.saveBtnText}>Update Quota</ThemedText>
          </TouchableOpacity>
        </PremiumCard>

        <SectionHeader title="ENTITY" />
        <PremiumCard variant="glass" level={2} style={styles.groupCard}>
          <Row icon="information-circle-outline" label="Version" right={<ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>1.2.0</ThemedText>} />
          <Row icon="shield-checkmark-outline" label="Encryption" right={<ThemedText style={{ color: colors.textSecondary, fontWeight: '700' }}>Local-AES</ThemedText>} />
        </PremiumCard>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 22, paddingTop: 64, paddingBottom: 15 },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  content: { paddingHorizontal: 16 },

  sectionHeader: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 28, marginBottom: 10, marginLeft: 8 },
  groupCard: { padding: 8, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, minHeight: 58 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '600' },

  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 8 },
  currencyItem: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center', flex: 1, minWidth: 60 },

  budgetInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  budgetInput: { flex: 1, fontSize: 20, fontWeight: '800', fontFamily: 'monospace' },

  saveBtn: { height: 50, borderRadius: 14, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
