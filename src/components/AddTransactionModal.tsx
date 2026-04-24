import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColors } from '../theme/useThemeColors';
import { NeonButton } from './NeonButton';
import { PremiumCard } from './PremiumCard';
import { getDb } from '../database/db';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, onAdded }) => {
  const colors = useThemeColors();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [type, setType] = useState<'Expense' | 'Income'>('Expense');

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Invalid Amount", "Please enter a valid number.");
      return;
    }

    try {
      const db = await getDb();
      // Using category ID 1 as default fallback (e.g. Food) to keep it simple
      await db.runAsync(
        'INSERT INTO Transactions (amount, type, categoryId, date, merchant, isAutoDetected) VALUES (?, ?, ?, ?, ?, ?)',
        [Number(amount), type, 1, new Date().toISOString(), merchant || 'Unknown', 0]
      );
      setAmount('');
      setMerchant('');
      onAdded();
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save transaction.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.overlay}
      >
        <PremiumCard elevated style={[styles.card, { backgroundColor: colors.surface }]}>
          <ThemedText type="title" style={{ marginBottom: 20 }}>Add Transaction</ThemedText>

          <View style={styles.typeSelector}>
            <NeonButton 
              title="Expense" 
              variant={type === 'Expense' ? 'danger' : 'secondary'} 
              onPress={() => setType('Expense')}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <NeonButton 
              title="Income" 
              variant={type === 'Income' ? 'primary' : 'secondary'} 
              onPress={() => setType('Income')}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <TextInput
            placeholder="Amount (e.g. 50.00)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />

          <TextInput
            placeholder="Merchant / Notes"
            placeholderTextColor={colors.textSecondary}
            value={merchant}
            onChangeText={setMerchant}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />

          <View style={{ marginTop: 20 }}>
            <NeonButton title="Save Transaction" onPress={handleSave} />
            <NeonButton title="Cancel" variant="secondary" onPress={onClose} />
          </View>
        </PremiumCard>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    margin: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: 40,
    paddingTop: 30,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  }
});
