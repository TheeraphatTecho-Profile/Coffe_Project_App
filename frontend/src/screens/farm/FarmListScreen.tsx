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
      setFarms([]);
      setLoading(false);
      return;
    }
    try {
      const data = await FarmService.getAll(user.uid);
      setFarms(data);
    } catch (err) {
      console.error('Error fetching farms:', err);
      setFarms([]);
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.title}>สวนของฉัน</Text>
          <Text style={styles.subtitle}>จัดการสวนกาแฟทั้งหมดของคุณ</Text>

          {/* Add farm button */}
          <TouchableOpacity
            style={styles.addFarmCard}
            onPress={() => navigation.navigate('AddFarmStep1', {})}
          >
            <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            <Text style={styles.addFarmText}>เพิ่มสวนใหม่</Text>
          </TouchableOpacity>

          {/* Farm list */}
          {loading ? (
            <View style={styles.loadingCard}>
              <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
            </View>
          ) : farms.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>ยังไม่มีสวนกาแฟ</Text>
              <Text style={styles.emptyText}>
                เริ่มต้นโดยการเพิ่มสวนแรกของคุณเพื่อจัดการการผลิต
              </Text>
            </View>
          ) : (
            farms.map((farm: Farm) => (
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
            ))
          )}
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
  // Empty state
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxxl,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Loading state
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxxl,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
});
