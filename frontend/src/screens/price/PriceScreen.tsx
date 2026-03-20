import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { FarmService, HarvestService } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';

export const PriceScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [farmStats, setFarmStats] = useState<any[]>([]);
  const [harvestSummary, setHarvestSummary] = useState({ total_weight: 0, total_income: 0 });
  const [monthlyData, setMonthlyData] = useState<{ month: string; value: number }[]>([]);

  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [farms, harvestSummaryData, allHarvests] = await Promise.all([
        FarmService.getAll(user.uid),
        HarvestService.getSummary(user.uid),
        HarvestService.getAll(user.uid),
      ]);

      setFarmStats(farms.map((f: any) => ({
        name: f.name || 'สวน',
        yield: f.area_rai || 0,
        treeCount: f.tree_count || 0,
      })));

      setHarvestSummary({
        total_weight: harvestSummaryData.totalWeight,
        total_income: harvestSummaryData.totalIncome,
      });

      // Compute monthly production from real harvest data
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const monthTotals = new Array(12).fill(0);
      allHarvests.forEach((h: any) => {
        if (h.harvest_date) {
          const d = new Date(h.harvest_date);
          monthTotals[d.getMonth()] += h.weight_kg || 0;
        }
      });
      setMonthlyData(monthNames.map((m, i) => ({ month: m, value: monthTotals[i] })));
    } catch (err) {
      console.error('Error fetching price data:', err);
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

  /**
   * Render a simple bar chart using View heights from real monthly data.
   */
  const renderBarChart = () => {
    const maxVal = Math.max(...monthlyData.map((d: { month: string; value: number }) => d.value), 1);
    const BAR_MAX_HEIGHT = 120;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBarsRow}>
          {monthlyData.map((d: { month: string; value: number }, i: number) => {
            const height = maxVal > 0 ? (d.value / maxVal) * BAR_MAX_HEIGHT : 4;
            const isMax = d.value === maxVal && d.value > 0;
            return (
              <View key={d.month} style={styles.chartBarCol}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: Math.max(height, 4),
                      backgroundColor: isMax ? COLORS.text : COLORS.secondary,
                      opacity: isMax ? 1 : 0.6,
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{d.month}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Compute average income per kg from real data
  const avgPricePerKg = harvestSummary.total_weight > 0
    ? (harvestSummary.total_income / harvestSummary.total_weight).toFixed(1)
    : '0';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="cafe" size={22} color={COLORS.text} />
            <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Title */}
          <Text style={styles.title}>รายงานวิเคราะห์{'\n'}การผลิตและรายได้</Text>
          <Text style={styles.subtitle}>
            สรุปภาพรวมผลผลิตและรายได้จากฐานข้อมูลจริงของคุณ
          </Text>

          {/* Total yield stat — real data */}
          <View style={styles.yieldStatCard}>
            <Text style={styles.yieldStatLabel}>ผลผลิตรวมสะสม</Text>
            <View style={styles.yieldStatRow}>
              <Text style={styles.yieldStatValue}>{formatNumber(harvestSummary.total_weight)}</Text>
              <Text style={styles.yieldStatUnit}> กก.</Text>
            </View>
            {harvestSummary.total_weight === 0 && (
              <Text style={styles.emptyHint}>ยังไม่มีข้อมูลผลผลิต</Text>
            )}
          </View>

          {/* Total income card */}
          <View style={styles.qualityCard}>
            <View style={styles.qualityHeader}>
              <Text style={styles.qualityTitle}>รายได้รวมสะสม</Text>
            </View>
            <View style={styles.qualityRow}>
              <Text style={styles.qualityValue}>{formatNumber(harvestSummary.total_income)}</Text>
              <Text style={styles.qualityMax}> บาท</Text>
            </View>
          </View>

          {/* Average price per kg */}
          <View style={styles.avgWeightCard}>
            <Text style={styles.avgWeightValue}>{avgPricePerKg}</Text>
            <Text style={styles.avgWeightUnit}> บาท/กก.</Text>
            <Text style={styles.avgWeightNote}>ราคาเฉลี่ยต่อกิโลกรัม</Text>
          </View>

          {/* Monthly bar chart — real data */}
          <Text style={styles.sectionTitle}>ผลผลิตรายเดือน (กก.)</Text>
          {monthlyData.length > 0 ? renderBarChart() : (
            <Text style={styles.emptyHint}>ยังไม่มีข้อมูลรายเดือน</Text>
          )}

          {/* Farm list table — real data */}
          <Text style={styles.sectionTitle}>ข้อมูลสวนของคุณ</Text>
          {farmStats.length === 0 ? (
            <View style={styles.insightsCard}>
              <Text style={styles.insightsText}>ยังไม่มีข้อมูลสวน — เพิ่มสวนแรกของคุณเพื่อเริ่มต้น</Text>
            </View>
          ) : (
            <View style={styles.tableCard}>
              {/* Table header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>ชื่อสวน</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>พื้นที่ (ไร่)</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>จำนวนต้น</Text>
              </View>
              {farmStats.map((g: any, i: number) => (
                <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, { flex: 1.5, fontWeight: '600' }]}>{g.name}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatNumber(g.yield)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatNumber(g.treeCount)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary insights */}
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>สรุปภาพรวม</Text>
            <Text style={styles.insightsText}>
              {harvestSummary.total_weight > 0
                ? `ผลผลิตรวม ${formatNumber(harvestSummary.total_weight)} กก. รายได้รวม ${formatNumber(harvestSummary.total_income)} บาท จำนวนสวนทั้งหมด ${farmStats.length} แห่ง ราคาเฉลี่ย ${avgPricePerKg} บาท/กก.`
                : 'เริ่มบันทึกผลผลิตเพื่อดูรายงานวิเคราะห์ที่ครบถ้วน'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerBrand: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },

  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 34 },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.xxl },

  // Yield stat
  yieldStatCard: {
    backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.xl, padding: SPACING.xxl,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  yieldStatLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  yieldStatRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  yieldStatValue: { fontSize: 42, fontWeight: '700', color: COLORS.text },
  yieldStatUnit: { fontSize: FONTS.sizes.xl, fontWeight: '500', color: COLORS.textSecondary },
  growthBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: COLORS.successLight, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  growthText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.success },

  // Quality score
  qualityCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xxl,
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  qualityHeader: { marginBottom: SPACING.sm },
  qualityTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  qualityRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  qualityValue: { fontSize: 42, fontWeight: '700', color: COLORS.text },
  qualityMax: { fontSize: FONTS.sizes.lg, color: COLORS.textLight },
  qualityBarBg: { height: 8, backgroundColor: COLORS.borderLight, borderRadius: 4 },
  qualityBarFill: { height: 8, backgroundColor: COLORS.secondary, borderRadius: 4 },

  // Average weight
  avgWeightCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xxl,
    marginBottom: SPACING.xxl, ...SHADOWS.sm, flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap',
  },
  avgWeightValue: { fontSize: 42, fontWeight: '700', color: COLORS.text },
  avgWeightUnit: { fontSize: FONTS.sizes.lg, color: COLORS.textSecondary },
  avgWeightNote: { width: '100%', fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: SPACING.xs },

  // Section title
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },

  // Chart
  chartContainer: { marginBottom: SPACING.xxl },
  chartBarsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, marginBottom: SPACING.sm },
  chartBarCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 14, borderRadius: 4, minHeight: 4 },
  chartLabel: { fontSize: 9, color: COLORS.textLight, marginTop: 4 },
  chartLegend: { flexDirection: 'row', gap: SPACING.lg, justifyContent: 'center', marginTop: SPACING.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

  // Table
  tableCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden',
    marginBottom: SPACING.xxl, ...SHADOWS.sm,
  },
  tableHeaderRow: {
    flexDirection: 'row', backgroundColor: COLORS.text, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
  },
  tableHeaderCell: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.white },
  tableRow: { flexDirection: 'row', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, alignItems: 'center' },
  tableRowAlt: { backgroundColor: COLORS.surfaceWarm },
  tableCell: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  starIcon: { color: COLORS.secondary, fontSize: FONTS.sizes.sm },

  // Insights
  insightsCard: {
    backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.xl, padding: SPACING.xxl,
    marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  insightsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  insightsText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },

  // Empty hint
  emptyHint: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: SPACING.sm },
});
