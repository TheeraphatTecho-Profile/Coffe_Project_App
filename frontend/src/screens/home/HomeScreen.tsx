import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FarmService, HarvestService, Harvest } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../hooks';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { Logo } from '../../components/Logo';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const { requestLogout, isLoggingOut } = useLogout();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [recentHarvests, setRecentHarvests] = useState<Harvest[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalWeight: 0,
    farmCount: 0,
    harvestCount: 0,
  });
  const [dataError, setDataError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setDataError(null);
      const [farmCount, harvestSummary, harvests] = await Promise.all([
        FarmService.count(user.uid),
        HarvestService.getSummary(user.uid),
        HarvestService.getAll(user.uid),
      ]);

      setStats({
        totalIncome: harvestSummary.totalIncome,
        totalWeight: harvestSummary.totalWeight,
        farmCount,
        harvestCount: harvests.length,
      });
      setRecentHarvests(harvests.slice(0, 5));
    } catch (err: any) {
      console.error('Error fetching home stats:', err);
      const message = err?.message || '';
      if (message.includes('index') || message.includes('requires an index')) {
        setDataError('ต้องสร้าง Firestore Index ก่อน — รัน: firebase deploy --only firestore:indexes');
      } else if (message.includes('permission') || message.includes('PERMISSION_DENIED')) {
        setDataError('ไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาตรวจสอบ Firestore Rules');
      } else {
        setDataError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatNumber = (n: number): string => n.toLocaleString('th-TH');
  const formatCurrency = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString('th-TH');
  };
  const userName = user?.displayName || user?.email?.split('@')[0] || 'คุณผู้ใช้';

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textOnPrimary} />
          }
        >
          {/* ===== DARK HEADER SECTION ===== */}
          <View style={styles.darkSection}>
            {/* Header bar */}
            <View style={styles.header}>
              <Logo size="small" showText={false} />
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerAvatar}
                  onPress={() => navigation.navigate('ProfileTab')}
                >
                  <Ionicons name="person" size={18} color={colors.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerLogout}
                  onPress={requestLogout}
                  disabled={isLoggingOut}
                >
                  <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeLabel}>ยินดีต้อนรับกลับ</Text>
              <Text style={styles.welcomeName}>สวัสดี, {userName}</Text>
              <Text style={styles.welcomeSub}>ข้อมูลสรุปจากฐานข้อมูลของคุณ</Text>
            </View>

            {/* Error banner */}
            {dataError && (
              <TouchableOpacity style={styles.errorBanner} onPress={onRefresh}>
                <Ionicons name="warning-outline" size={18} color="#FFF" />
                <Text style={styles.errorText}>{dataError}</Text>
                <Text style={styles.errorRetry}>แตะเพื่อลองใหม่</Text>
              </TouchableOpacity>
            )}

            {/* Revenue card */}
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>รายได้รวมสะสม (บาท)</Text>
              <Text style={styles.revenueValue}>
                {stats.totalIncome > 0 ? formatNumber(stats.totalIncome) : '0'}
              </Text>
              {stats.totalIncome === 0 && (
                <Text style={styles.emptyHint}>เริ่มบันทึกผลผลิตเพื่อดูรายได้</Text>
              )}
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="cube-outline" size={22} color="rgba(255,255,255,0.6)" />
                <Text style={styles.statLabel}>ผลผลิตรวม</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{formatNumber(stats.totalWeight)}</Text>
                  <Text style={styles.statUnit}> กก.</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="leaf-outline" size={22} color="rgba(255,255,255,0.6)" />
                <Text style={styles.statLabel}>จำนวนสวน</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{stats.farmCount}</Text>
                  <Text style={styles.statUnit}> แห่ง</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ===== LIGHT CONTENT SECTION ===== */}
          <View style={styles.lightSection}>
            {/* Shortcuts */}
            <Text style={styles.sectionTitle}>ทางลัด</Text>
            <View style={styles.shortcutsRow}>
              <AnimatedButton
                title="เพิ่มสวน\nใหม่"
                onPress={() => {
                  try { navigation.navigate('FarmTab', { screen: 'AddFarmStep1', params: {} }); } catch { /* noop */ }
                }}
                variant="secondary"
                size="medium"
                icon={<Ionicons name="add-circle-outline" size={22} color={colors.primary} />}
                style={styles.shortcutButton}
              />

              <AnimatedButton
                title="บันทึกเก็บ\nเกี่ยว"
                onPress={() => navigation.navigate('HarvestTab')}
                variant="outline"
                size="medium"
                icon={<Ionicons name="basket-outline" size={22} color={colors.secondary} />}
                style={styles.shortcutButton}
              />
            </View>

            {/* Recent harvests from real data */}
            <View style={styles.activityHeader}>
              <View>
                <Text style={styles.sectionTitle}>การเก็บเกี่ยวล่าสุด</Text>
                <Text style={styles.activitySubtitle}>
                  {recentHarvests.length > 0
                    ? `${recentHarvests.length} รายการล่าสุด`
                    : 'ยังไม่มีข้อมูลการเก็บเกี่ยว'}
                </Text>
              </View>
              {recentHarvests.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('HarvestTab')}>
                  <Text style={styles.seeAll}>ดูทั้งหมด</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentHarvests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="leaf-outline" size={40} color={colors.textLight} />
                <Text style={styles.emptyTitle}>ยังไม่มีข้อมูล</Text>
                <Text style={styles.emptyText}>
                  เริ่มต้นโดยการเพิ่มสวนกาแฟและบันทึกผลผลิต
                </Text>
                <AnimatedButton
                  title="เพิ่มสวนแรก"
                  onPress={() => {
                    try { navigation.navigate('FarmTab', { screen: 'AddFarmStep1', params: {} }); } catch { /* noop */ }
                  }}
                  icon={<Ionicons name="add" size={18} color={colors.textOnPrimary} />}
                />
              </View>
            ) : (
              recentHarvests.map((h, idx) => {
                const date = h.harvestDate ? new Date(h.harvestDate) : new Date();
                const day = date.getDate().toString();
                const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                const month = monthNames[date.getMonth()] || '';

                return (
                  <View key={h.id || idx} style={styles.activityCard}>
                    <View style={styles.activityDateWrap}>
                      <Text style={styles.activityDate}>{day}</Text>
                      <Text style={styles.activityMonth}>{month}</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {h.farms?.name || 'สวนกาแฟ'}
                      </Text>
                      <Text style={styles.activityDetail}>
                        {h.variety || 'กาแฟ'} • {formatNumber(h.weightKg)} กก. • ฿{formatNumber(h.income)}
                      </Text>
                    </View>
                    <View style={styles.shiftBadge}>
                      <Text style={styles.shiftText}>{h.shift || '-'}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safeArea: { flex: 1, backgroundColor: colors.coffeeBean },

    // Error banner
    errorBanner: {
      marginHorizontal: spacing.xl, marginBottom: spacing.md,
      backgroundColor: '#C62828', borderRadius: radius.lg,
      padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      flexWrap: 'wrap',
    },
    errorText: { flex: 1, fontSize: typography.sizes.sm, color: '#FFF', lineHeight: 18 },
    errorRetry: { fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

    // Dark header section
    darkSection: { backgroundColor: colors.coffeeBean, paddingBottom: spacing.xxl },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    },
    headerRight: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    },
    headerAvatar: {
      width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center', justifyContent: 'center',
    },
    headerLogout: {
      width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },

    // Welcome
    welcomeSection: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
    welcomeLabel: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xs },
    welcomeName: { fontSize: typography.sizes.xxl, fontWeight: '700', color: '#FFFFFF', marginBottom: spacing.xs },
    welcomeSub: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.6)' },

    // Revenue card
    revenueCard: {
      marginHorizontal: spacing.xl, backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: radius.xl, padding: spacing.xxl, marginBottom: spacing.lg,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    revenueLabel: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.sm },
    revenueValue: { fontSize: 38, fontWeight: '700', color: '#FFFFFF' },
    emptyHint: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.5)', marginTop: spacing.sm },

    // Stats
    statsRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl },
    statCard: {
      flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.lg,
      padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    },
    statLabel: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)' },
    statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
    statValue: { fontSize: typography.sizes.xxl, fontWeight: '700', color: '#FFFFFF' },
    statUnit: { fontSize: typography.sizes.md, color: 'rgba(255,255,255,0.7)' },

    // Light section
    lightSection: {
      backgroundColor: colors.background, borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl, paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl, paddingBottom: spacing.xxxl,
    },
    sectionTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

    // Shortcuts
    shortcutsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl },
    shortcutButton: {
      flex: 1,
    },

    // Activities
    activityHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: spacing.lg,
    },
    activitySubtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
    seeAll: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.secondary },

    activityCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md,
      borderWidth: 1, borderColor: colors.border, ...shadows.sm,
    },
    activityDateWrap: {
      alignItems: 'center', backgroundColor: colors.surfaceWarm,
      borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      minWidth: 48,
    },
    activityContent: { flex: 1 },
    activityTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text, marginBottom: 2 },
    activityDetail: { fontSize: typography.sizes.sm, color: colors.textSecondary },
    activityDate: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.text },
    activityMonth: { fontSize: typography.sizes.xs, color: colors.textLight },
    shiftBadge: {
      backgroundColor: colors.surfaceWarm, paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs, borderRadius: radius.sm,
    },
    shiftText: { fontSize: typography.sizes.xs, fontWeight: '600', color: colors.textSecondary },

    // Empty state
    emptyCard: {
      backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xxxl,
      alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm,
    },
    emptyTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.text },
    emptyText: { fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  });
