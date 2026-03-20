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
import { FarmService, Farm } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SkeletonLoader, TextSkeleton } from '../../components/SkeletonLoader';
import { Logo } from '../../components/Logo';

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
  const { colors, spacing, typography, radius, shadows } = useTheme();

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

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Logo size="small" showText={false} />
            <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
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
          <AnimatedButton
            title="เพิ่มสวนใหม่"
            onPress={() => navigation.navigate('AddFarmStep1', {})}
            variant="outline"
            size="large"
            icon={<Ionicons name="add-circle" size={32} color={colors.primary} />}
            style={styles.addFarmButton}
          />

          {/* Farm list */}
          {loading ? (
            <View style={styles.loadingCard}>
              <SkeletonLoader width={40} height={40} borderRadius={20} />
              <TextSkeleton width={120} height={20} style={{ marginTop: spacing.md }} />
            </View>
          ) : farms.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="leaf-outline" size={40} color={colors.textLight} />
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
                  <Ionicons name="leaf" size={24} color={colors.primary} />
                </View>
                <View style={styles.farmContent}>
                  <Text style={styles.farmName}>{farm.name}</Text>
                  <Text style={styles.farmDetail}>
                    {farm.area} ไร่ • {farm.variety || '-'} • {farm.tree_count || 0} ต้น
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  addFarmButton: {
    marginBottom: spacing.xxl,
  },
  farmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  farmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmContent: {
    flex: 1,
  },
  farmName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  farmDetail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  // Empty state
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Loading state
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});
