import React, { useRef, useState } from 'react';
import {
  View, TouchableOpacity, StyleSheet, Animated, useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/useThemeColors';
import { ThemedText } from './ThemedText';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { useDispatch, useSelector } from 'react-redux';
import { bumpRefresh } from '../store/settingsSlice';
import { RootState } from '../store';

const TABS = [
  { route: 'Dashboard',    icon: 'grid-outline',      iconFocused: 'grid',      label: 'Home'     },
  { route: 'Transactions', icon: 'receipt-outline',   iconFocused: 'receipt',   label: 'Transactions'   },
  { route: 'Analytics',   icon: 'stats-chart-outline', iconFocused: 'stats-chart', label: 'Analytics' },
  { route: 'Settings',    icon: 'options-outline',   iconFocused: 'options',   label: 'Settings' },
];

interface Props { state: any; navigation: any; }

export const FloatingTabBar: React.FC<Props> = ({ state, navigation }) => {
  const colors   = useThemeColors();
  const dispatch = useDispatch();
  const themeMode = useSelector((s: RootState) => s.settings.themeMode);
  const system   = useColorScheme();
  const isDark   = themeMode === 'dark' || (themeMode === 'system' && system === 'dark');

  const [addVisible, setAddVisible] = useState(false);
  const fabScale = useRef(new Animated.Value(1)).current;

  const onFabIn  = () => Animated.spring(fabScale, { toValue: 0.85, useNativeDriver: true }).start();
  const onFabOut = () => Animated.spring(fabScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleTabPress = (routeIndex: number, routeName: string) => {
    const isFocused = state.index === routeIndex;
    if (!isFocused) navigation.navigate(routeName);
  };

  const renderTab = (tab: typeof TABS[0], routeIndex: number) => {
    const focused = state.index === routeIndex;
    const color = focused ? colors.primary : colors.textTertiary;
    return (
      <TouchableOpacity key={tab.route} style={styles.tab} onPress={() => handleTabPress(routeIndex, tab.route)} activeOpacity={0.7}>
        <Ionicons name={(focused ? tab.iconFocused : tab.icon) as any} size={22} color={color} />
        <ThemedText style={[styles.tabLabel, { color, fontWeight: focused ? '800' : '600' }]}>{tab.label}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Pill Container (The Nav Bar) */}
      <View style={[styles.pillContainer, { shadowColor: colors.cardShadow }]}>
        <BlurView
          intensity={120}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(18, 18, 26, 0.45)' : 'rgba(255, 255, 255, 0.55)', borderColor: colors.glassBorder, borderWidth: 1, borderRadius: 34 }]} />
        <View style={[styles.navHighlight, { backgroundColor: colors.glassHighlight }]} />
        
        <View style={styles.tabGroup}>{TABS.slice(0, 2).map((tab, i) => renderTab(tab, i))}</View>
        <View style={{ width: 68 }} />
        <View style={styles.tabGroup}>{TABS.slice(2, 4).map((tab, i) => renderTab(tab, i + 2))}</View>
      </View>

      {/* FAB: Separated entirely from Nav structure with Dedicated Shadow Caster */}
      <Animated.View style={[styles.fabWrapper, { transform: [{ scale: fabScale }] }]} pointerEvents="box-none">
        {/* Layer 0: The Isolated Shadow Caster (Prevents Rectangular Artifacts) */}
        <View style={styles.fabShadowCaster} />

        <TouchableOpacity 
          style={styles.fabMainTouch}
          onPress={() => setAddVisible(true)} 
          onPressIn={onFabIn} 
          onPressOut={onFabOut} 
          activeOpacity={1}
        >
          <View style={styles.fabSurface}>
            <LinearGradient 
              colors={colors.gradientPrimary} 
              style={StyleSheet.absoluteFill} 
            />
            <View style={styles.fabContent}>
              <Ionicons name="add" size={32} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <AddTransactionScreen visible={addVisible} onClose={() => setAddVisible(false)} onAdded={() => dispatch(bumpRefresh())} />
    </>
  );
};

const FAB_SIZE = 58;

const styles = StyleSheet.create({
  pillContainer: {
    position: 'absolute', bottom: 25, left: 16, right: 16,
    height: 68, borderRadius: 34,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20,
    zIndex: 1000,
  },
  tabGroup: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  tab: { alignItems: 'center', height: '100%', justifyContent: 'center', minWidth: 50 },
  tabLabel: { fontSize: 8, marginTop: 4, letterSpacing: 0.4, textTransform: 'uppercase' },

 fabWrapper: {
  position: 'absolute',
  bottom: 38,
  alignSelf: 'center',
  zIndex: 1001,
  width: FAB_SIZE,
  height: FAB_SIZE,
},
fabMainTouch: {
  flex: 1,
},
fabSurface: {
  flex: 1,
  borderRadius: FAB_SIZE / 2,
  overflow: 'hidden',
},
fabContent: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
fabShadowCaster: {
  ...StyleSheet.absoluteFillObject,
  borderRadius: FAB_SIZE / 2,
  backgroundColor: '#000', // Solid background for sharp circular shadow
  shadowColor: '#000', 
  shadowOffset: { width: 0, height: 10 }, 
  shadowOpacity: 0.35, 
  shadowRadius: 14, 
  elevation: 12, 
},
  fabHighlight: { 
    position: 'absolute', top: 3, left: 12, right: 12, height: 10, 
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10 
  },
  navHighlight: {
    position: 'absolute', top: 0, left: 40, right: 40, height: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  }
});
