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
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { FarmService, HarvestService, Harvest } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';

const DARK_BG = '#2A1F14';
const DARK_SURFACE = '#3D2E1F';

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentHarvests, setRecentHarvests] = useState<Harvest[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalWeight: 0,
    farmCount: 0,
    harvestCount: 0,
  });

  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    try {
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
    } catch (err) {
      console.error('Error fetching home stats:', err);
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />
          }
        >
          {/* ===== DARK HEADER SECTION ===== */}
          <View style={styles.darkSection}>
            {/* Header bar */}
            <View style={styles.header}>
              <Text style={styles.headerBrand}>สวนกาแฟเลย</Text>
              <TouchableOpacity
                style={styles.headerAvatar}
                onPress={() => navigation.navigate('ProfileTab')}
              >
                <Ionicons name="person" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeLabel}>ยินดีต้อนรับกลับ</Text>
              <Text style={styles.welcomeName}>สวัสดี, {userName}</Text>
              <Text style={styles.welcomeSub}>ข้อมูลสรุปจากฐานข้อมูลของคุณ</Text>
            </View>

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
              <TouchableOpacity
                style={styles.shortcutButton}
                onPress={() => {
                  try { navigation.navigate('FarmTab', { screen: 'AddFarmStep1', params: {} }); } catch { /* noop */ }
                }}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: COLORS.successLight }]}>
                  <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.shortcutText}>เพิ่มสวน{'\n'}ใหม่</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutButton}
                onPress={() => navigation.navigate('HarvestTab')}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: COLORS.warningLight }]}>
                  <Ionicons name="basket-outline" size={22} color={COLORS.secondary} />
                </View>
                <Text style={styles.shortcutText}>บันทึกเก็บ{'\n'}เกี่ยว</Text>
              </TouchableOpacity>
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
                <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>ยังไม่มีข้อมูล</Text>
                <Text style={styles.emptyText}>
                  เริ่มต้นโดยการเพิ่มสวนกาแฟและบันทึกผลผลิต
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => {
                    try { navigation.navigate('FarmTab', { screen: 'AddFarmStep1', params: {} }); } catch { /* noop */ }
                  }}
                >
                  <Ionicons name="add" size={18} color={COLORS.white} />
                  <Text style={styles.emptyButtonText}>เพิ่มสวนแรก</Text>
                </TouchableOpacity>
              </View>
            ) : (
              recentHarvests.map((h, idx) => {
                const date = h.harvest_date ? new Date(h.harvest_date) : new Date();
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
                        {h.variety || 'กาแฟ'} • {formatNumber(h.weight_kg)} กก. • ฿{formatNumber(h.income)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1, backgroundColor: DARK_BG },

  // Dark header section
  darkSection: { backgroundColor: DARK_BG, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  headerBrand: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.white },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary + '30',
    alignItems: 'center', justifyContent: 'center',
  },

  // Welcome
  welcomeSection: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.xxl },
  welcomeLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.5)', marginBottom: SPACING.xs },
  welcomeName: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.xs },
  welcomeSub: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.5)' },

  // Revenue card
  revenueCard: {
    marginHorizontal: SPACING.xl, backgroundColor: DARK_SURFACE,
    borderRadius: RADIUS.xl, padding: SPACING.xxl, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  revenueLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.5)', marginBottom: SPACING.sm },
  revenueValue: { fontSize: 38, fontWeight: '700', color: COLORS.white },
  emptyHint: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.35)', marginTop: SPACING.sm },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.xl },
  statCard: {
    flex: 1, backgroundColor: DARK_SURFACE, borderRadius: RADIUS.lg,
    padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.5)' },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.white },
  statUnit: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.5)' },

  // Light section
  lightSection: {
    backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl, paddingBottom: SPACING.xxxxl,
  },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },

  // Shortcuts
  shortcutsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xxl },
  shortcutButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  shortcutIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  shortcutText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, lineHeight: 18 },

  // Activities
  activityHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  activitySubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  seeAll: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary },

  activityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, gap: SPACING.md,
    ...SHADOWS.sm,
  },
  activityDateWrap: {
    alignItems: 'center', backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    minWidth: 48,
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  activityDetail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  activityDate: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  activityMonth: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  shiftBadge: {
    backgroundColor: COLORS.surfaceWarm, paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.sm,
  },
  shiftText: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },

  // Empty state
  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.xxxl,
    alignItems: 'center', gap: SPACING.md, ...SHADOWS.sm,
  },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  emptyText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md, marginTop: SPACING.sm,
  },
  emptyButtonText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.white },
});
