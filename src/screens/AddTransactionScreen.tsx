import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Modal, TextInput, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, useColorScheme,
  Animated, Dimensions
} from 'react-native';
import { useThemeColors } from '../theme/useThemeColors';
import { ThemedText } from '../components/ThemedText';
import { addTransaction, getCategories, Category } from '../database/repository';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { bumpRefresh } from '../store/settingsSlice';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export const AddTransactionScreen: React.FC<Props> = ({ visible, onClose, onAdded }) => {
  const colors = useThemeColors();
  const dispatch = useDispatch();
  const currencySymbol = useSelector((s: RootState) => s.settings.currencySymbol);
  const themeMode = useSelector((s: RootState) => s.settings.themeMode);
  const system = useColorScheme();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && system === 'dark');

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { getCategories().then(setCategories); }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 40, friction: 7 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true })
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0 || !merchant) return;
    try {
      await addTransaction({ amount: parsed, type, categoryId: selectedCategoryId, date: new Date().toISOString(), notes, merchant });
      dispatch(bumpRefresh());
      onAdded();
      onClose();
      setAmount(''); setMerchant(''); setNotes('');
    } catch (e) { Alert.alert('Error', 'Save failed.'); }
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.overlay}>
        {/* Layer 1 & 2: Dim + Strong Blur Backdrop */}
        <BlurView intensity={isDark ? 25 : 35} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.25)' }]} />
        </TouchableOpacity>

        <Animated.View style={[
          styles.modal, 
          { 
            opacity: fadeAnim, transform: [{ scale: scaleAnim }],
            borderColor: colors.glassBorder, shadowColor: isDark ? colors.primary : '#000'
          }
        ]}>
          <BlurView intensity={isDark ? 80 : 95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          {/* Surface: warm purple-tinted white for light theme */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(18,18,26,0.65)' : 'rgba(240,235,255,0.7)' }]} />
          
          <View style={[styles.topHighlight, { backgroundColor: colors.glassHighlight }]} />
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
             <View style={styles.header}>
                <ThemedText style={styles.title}>Add Transaction</ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.close}>
                  <Ionicons name="close-circle" size={26} color={colors.textTertiary} />
                </TouchableOpacity>
             </View>

             <View style={styles.amountWrap}>
                <ThemedText style={[styles.currency, { color: colors.textTertiary }]}>{currencySymbol}</ThemedText>
                <TextInput
                  style={[styles.inputLarge, { color: type === 'Income' ? colors.success : colors.danger }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
             </View>

             <View style={[styles.toggle, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.tglBtn, type === 'Expense' && { backgroundColor: isDark ? colors.danger + '40' : colors.dangerMuted }]}
                  onPress={() => setType('Expense')}
                >
                  <ThemedText style={[styles.tglLbl, { color: type === 'Expense' ? colors.danger : colors.textTertiary }]}>EXPENSE</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tglBtn, type === 'Income' && { backgroundColor: isDark ? colors.success + '40' : colors.successMuted }]}
                  onPress={() => setType('Income')}
                >
                  <ThemedText style={[styles.tglLbl, { color: type === 'Income' ? colors.success : colors.textTertiary }]}>INCOME</ThemedText>
                </TouchableOpacity>
             </View>

             <View style={styles.form}>
                <ThemedText style={styles.label}>MERCHANT</ThemedText>
                <TextInput
                  style={[styles.field, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}
                  placeholder="e.g. Amazon"
                  placeholderTextColor={colors.textTertiary}
                  value={merchant}
                  onChangeText={setMerchant}
                />

                <ThemedText style={styles.label}>CATEGORY</ThemedText>
                <View style={styles.grid}>
                  {categories.map(cat => {
                    const sel = selectedCategoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.item, { backgroundColor: sel ? cat.color + '25' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)', borderColor: sel ? cat.color : colors.border }]}
                        onPress={() => setSelectedCategoryId(cat.id)}
                      >
                        <Ionicons name={cat.icon as any} size={20} color={sel ? cat.color : colors.textTertiary} />
                        <ThemedText style={[styles.itemName, { color: sel ? colors.text : colors.textSecondary }]}>{cat.name}</ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.action} onPress={handleSave}>
                  <LinearGradient colors={colors.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                  <ThemedText style={styles.actionText}>SAVE TRANSACTION</ThemedText>
                </TouchableOpacity>
             </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modal: { 
    width: SCREEN_WIDTH * 0.9, backgroundColor: 'transparent',
    borderRadius: 32, overflow: 'hidden', borderWidth: 1,
    shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 20 
  },
  topHighlight: { position: 'absolute', top: 0, left: 30, right: 30, height: 1.2 },
  scroll: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  close: { padding: 5 },
  
  amountWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  currency: { fontSize: 24, fontWeight: '800', marginRight: 6 },
  inputLarge: { fontSize: 56, fontWeight: '900', fontFamily: 'monospace', textAlign: 'center', minWidth: 120 },

  toggle: { flexDirection: 'row', padding: 4, borderRadius: 16, borderWidth: 1, marginBottom: 25 },
  tglBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tglLbl: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },

  form: { gap: 14 },
  label: { fontSize: 10, fontWeight: '800', color: '#6B7280', letterSpacing: 1 },
  field: { padding: 16, borderRadius: 18, borderWidth: 1, fontSize: 16, fontWeight: '700' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 15 },
  item: { width: '31%', aspectRatio: 1, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', padding: 8 },
  itemName: { fontSize: 10, fontWeight: '800', marginTop: 6, textAlign: 'center', textTransform: 'uppercase' },

  action: { height: 60, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
});
