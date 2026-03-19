import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FarmStackParamList } from '../../types/navigation';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { FarmService, Farm } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<FarmStackParamList, 'FarmList'>;
};

const MOCK_FARMS: Farm[] = [
  {
    id: '1',
    name: 'สวนเขาหงอนเอน',
    area: 32,
    variety: 'Arabica',
    tree_count: 1200,
    soil_type: null,
    water_source: null,
    province: 'เลย',
    district: null,
    altitude: null,
    planting_year: null,
    notes: null,
    created_at: {} as any,
    user_id: '',
  },
  {
    id: '2',
    name: 'สวนภูเรือ',
    area: 45,
    variety: 'Arabica',
    tree_count: 1800,
    soil_type: null,
    water_source: null,
    province: 'เลย',
    district: null,
    altitude: null,
    planting_year: null,
    notes: null,
    created_at: {} as any,
    user_id: '',
  },
  {
    id: '3',
    name: 'สวนนาด้วง',
    area: 28,
    variety: 'Robusta',
    tree_count: 950,
    soil_type: null,
    water_source: null,
    province: 'เลย',
    district: null,
    altitude: null,
    planting_year: null,
    notes: null,
    created_at: {} as any,
    user_id: '',
  },
];

/**
 * Farm list screen showing all user's coffee farms.
 * Provides quick access to add a new farm.
 */
export const FarmListScreen: React.FC<Props> = ({ navigation }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchFarms = useCallback(async () => {
    if (!user?.uid) {
      setFarms(MOCK_FARMS);
      setLoading(false);
      return;
    }
    try {
      const data = await FarmService.getAll(user.uid);
      setFarms(data.length > 0 ? data : MOCK_FARMS);
    } catch (err) {
      console.error('Error fetching farms:', err);
      setFarms(MOCK_FARMS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFarms();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="cafe" size={22} color={COLORS.text} />
            <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>สวนของฉัน</Text>
          <Text style={styles.subtitle}>จัดการสวนกาแฟทั้งหมดของคุณ</Text>

          {/* Add farm button */}
          <TouchableOpacity
            style={styles.addFarmCard}
            onPress={() => navigation.navigate('AddFarmStep1')}
          >
            <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            <Text style={styles.addFarmText}>เพิ่มสวนใหม่</Text>
          </TouchableOpacity>

          {/* Farm list */}
          {(farms.length > 0 ? farms : MOCK_FARMS).map((farm) => (
            <TouchableOpacity 
              key={farm.id} 
              style={styles.farmCard}
              onPress={() => navigation.navigate('FarmDetail', { farmId: farm.id })}
            >
              <View style={styles.farmIcon}>
                <Ionicons name="leaf" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.farmContent}>
                <Text style={styles.farmName}>{farm.name}</Text>
                <Text style={styles.farmDetail}>
                  {farm.area} ไร่ • {farm.variety || '-'} • {farm.tree_count || 0} ต้น
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxxl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  addFarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addFarmText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  farmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  farmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmContent: {
    flex: 1,
  },
  farmName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  farmDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});
