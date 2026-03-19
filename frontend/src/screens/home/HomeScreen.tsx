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
import { FarmService, HarvestService } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';

const DARK_BG = '#2A1F14';
const DARK_SURFACE = '#3D2E1F';
const DARK_CARD = '#4A3828';

const ACTIVITIES = [
  {
    icon: 'create-outline' as const,
    title: 'บันทึกเก็บเกี่ยว: สวน\nภูเรือ 1',
    detail: 'กาแฟอาราบิก้า • 450 กก.',
    date: '12',
    month: 'II',
    year: '2567',
  },
  {
    icon: 'refresh-outline' as const,
    title: 'อัปเดตข้อมูลสวน: สวน\nนาแห้ว',
    detail: 'เริ่มฤดูกาลดอกดอก',
    date: '10',
    month: 'II',
    year: '2567',
  },
  {
    icon: 'cash-outline' as const,
    title: 'บันทึกรายได้: สวน\nด่านซ้าย',
    detail: 'จำหน่ายกะลาสแห้ง • ฿24,000',
    date: '08',
    month: 'II',
    year: '2567',
  },
];

export const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalWeight: 0,
    farmCount: 0,
    harvestCount: 0,
  });

  const fetchStats = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [farmCount, harvestSummary] = await Promise.all([
        FarmService.count(user.uid),
        HarvestService.getSummary(user.uid),
      ]);

      setStats({
        totalIncome: harvestSummary.totalIncome,
        totalWeight: harvestSummary.totalWeight,
        farmCount,
        harvestCount: 0,
      });
    } catch (err) {
      console.error('Error fetching home stats:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const formatNumber = (n: number): string => n.toLocaleString('th-TH');
  const userName = user?.displayName || user?.email?.split('@')[0] || 'คุณผู้ใช้';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* ===== DARK HEADER SECTION ===== */}
          <View style={styles.darkSection}>
            {/* Header bar */}
            <View style={styles.header}>
              <TouchableOpacity>
                <Ionicons name="menu" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerBrand}>สวนกาแฟเลย</Text>
              <View style={styles.headerAvatar}>
                <Ionicons name="person" size={18} color={COLORS.secondary} />
              </View>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeLabel}>ยินดีต้อนรับกลับ</Text>
              <Text style={styles.welcomeName}>สวัสดี, {userName}</Text>
              <Text style={styles.welcomeSub}>ข้อมูลสรุปการเก็บเกี่ยว ประจำปี พ.ศ. 2567</Text>
            </View>

            {/* Revenue card */}
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>รายได้รวมสะสม</Text>
              <Text style={styles.revenueValue}>{formatNumber(stats.totalIncome)}</Text>
              <View style={styles.growthRow}>
                <Ionicons name="trending-up" size={14} color={COLORS.success} />
                <Text style={styles.growthText}> +12% จากเดือนที่แล้ว</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="cube-outline" size={22} color="rgba(255,255,255,0.6)" />
                <Text style={styles.statLabel}>ปริมาณผลผลิต</Text>
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
                  try { navigation.navigate('FarmTab', { screen: 'AddFarmStep1' }); } catch { /* noop */ }
                }}
              >
                <View style={styles.shortcutIcon}>
                  <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.shortcutText}>เพิ่มสวน{'\n'}ใหม่</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shortcutButton}>
                <View style={styles.shortcutIcon}>
                  <Ionicons name="create-outline" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.shortcutText}>บันทึกเก็บ{'\n'}เกี่ยว</Text>
              </TouchableOpacity>
            </View>

            {/* Recent activities */}
            <View style={styles.activityHeader}>
              <View>
                <Text style={styles.sectionTitle}>กิจกรรมล่าสุด</Text>
                <Text style={styles.activitySubtitle}>
                  การอัปเดตสถานะของสวนในช่วงสัปดาห์นี้
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>ดูทั้งหมด</Text>
              </TouchableOpacity>
            </View>

            {ACTIVITIES.map((a, idx) => (
              <View key={idx} style={styles.activityCard}>
                <View style={styles.activityIconWrap}>
                  <Ionicons name={a.icon} size={20} color={COLORS.secondary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{a.title}</Text>
                  <Text style={styles.activityDetail}>{a.detail}</Text>
                </View>
                <View style={styles.activityDateWrap}>
                  <Text style={styles.activityDate}>{a.date}</Text>
                  <Text style={styles.activityMonth}>{a.month}</Text>
                  <Text style={styles.activityYear}>{a.year}</Text>
                </View>
              </View>
            ))}
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
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.secondary + '30',
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
  revenueValue: { fontSize: 42, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.md },
  growthRow: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,140,92,0.2)', paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  growthText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.success },

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
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.successLight,
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
  activityIconWrap: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.warningLight,
    alignItems: 'center', justifyContent: 'center',
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  activityDetail: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  activityDateWrap: {
    alignItems: 'center', backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
  },
  activityDate: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  activityMonth: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  activityYear: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
});
