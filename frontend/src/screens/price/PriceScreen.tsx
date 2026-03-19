import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { FarmService, HarvestService } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { AnalyticsChart } from '../../components/AnalyticsChart';

const MONTHLY_DATA = [
  { month: 'ม.ค.', value: 0.3 },
  { month: 'ก.พ.', value: 0.4 },
  { month: 'มี.ค.', value: 0.5 },
  { month: 'เม.ย.', value: 0.35 },
  { month: 'พ.ค.', value: 0.45 },
  { month: 'มิ.ย.', value: 0.6 },
  { month: 'ก.ค.', value: 0.55 },
  { month: 'ส.ค.', value: 0.8 },
  { month: 'ก.ย.', value: 1.0 },
  { month: 'ต.ค.', value: 0.7 },
  { month: 'พ.ย.', value: 0.5 },
  { month: 'ธ.ค.', value: 0.3 },
];

const FARM_GROUPS = [
  { name: 'ภูเรือ', yield: 65300, income: 0, quality: 86.5 },
  { name: 'นาแห้ว', yield: 22800, income: 0, quality: 83.2 },
  { name: 'ด่านซ้าย', yield: 51400, income: 0, quality: 81.5 },
];

const QUALITY_SCORE = 84.2;
const AVG_WEIGHT = 42.8;
const OVERALL_SCORE = 94;
const TOTAL_YIELD = 1240;
const YIELD_GROWTH = 12;

export const PriceScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [farmStats, setFarmStats] = useState<any[]>([]);
  const [harvestSummary, setHarvestSummary] = useState({ total_weight: 0, total_income: 0 });

  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [farms, harvestSummaryData] = await Promise.all([
        FarmService.getAll(user.uid),
        HarvestService.getSummary(user.uid),
      ]);

      setFarmStats(farms.map((f: any) => ({
        name: f.name,
        yield: f.tree_count || 0,
        income: 0,
        quality: Math.random() * 20 + 80,
      })));

      setHarvestSummary({
        total_weight: harvestSummaryData.totalWeight,
        total_income: harvestSummaryData.totalIncome,
      });
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
   * Render a simple bar chart using View heights.
   */
  const renderBarChart = () => {
    const maxVal = Math.max(...MONTHLY_DATA.map((d) => d.value));
    const BAR_MAX_HEIGHT = 120;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBarsRow}>
          {MONTHLY_DATA.map((d, i) => {
            const height = (d.value / maxVal) * BAR_MAX_HEIGHT;
            const isHighlight = i === 8; // September peak
            return (
              <View key={d.month} style={styles.chartBarCol}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height,
                      backgroundColor: isHighlight ? COLORS.text : COLORS.secondary,
                      opacity: isHighlight ? 1 : 0.6,
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{d.month}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.text }]} />
            <Text style={styles.legendText}>ปี 2567</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.secondary, opacity: 0.6 }]} />
            <Text style={styles.legendText}>ปี 2566</Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render a circular gauge for overall score.
   */
  const renderGauge = () => (
    <View style={styles.gaugeContainer}>
      <View style={styles.gaugeOuter}>
        <View style={styles.gaugeInner}>
          <Text style={styles.gaugeValue}>{OVERALL_SCORE}%</Text>
          <Text style={styles.gaugeLabel}>คะแนนรวม</Text>
        </View>
      </View>
    </View>
  );

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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.title}>รายงานบทวิเคราะห์{'\n'}การผลิตและคุณภาพ</Text>
          <Text style={styles.subtitle}>
            สรุปภาพรวมการผลิตของปี พ.ศ. 2567 พร้อมข้อมูลคุณภาพกาแฟ รายได้เปรียบเทียบและรายงานที่ช่วยตัดสินใจเกี่ยวกับอนาคต
          </Text>

          {/* Total yield stat */}
          <View style={styles.yieldStatCard}>
            <Text style={styles.yieldStatLabel}>ผลผลิตรวมสะสม</Text>
            <View style={styles.yieldStatRow}>
              <Text style={styles.yieldStatValue}>{formatNumber(TOTAL_YIELD)}</Text>
              <Text style={styles.yieldStatUnit}> กก.</Text>
            </View>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color={COLORS.success} />
              <Text style={styles.growthText}> +{YIELD_GROWTH}% จากปีที่แล้ว</Text>
            </View>
          </View>

          {/* Quality score card */}
          <View style={styles.qualityCard}>
            <View style={styles.qualityHeader}>
              <Text style={styles.qualityTitle}>Quality Score</Text>
            </View>
            <View style={styles.qualityRow}>
              <Text style={styles.qualityValue}>{QUALITY_SCORE}</Text>
              <Text style={styles.qualityMax}> /100</Text>
            </View>
            {/* Quality bar */}
            <View style={styles.qualityBarBg}>
              <View style={[styles.qualityBarFill, { width: `${QUALITY_SCORE}%` }]} />
            </View>
          </View>

          {/* Average weight */}
          <View style={styles.avgWeightCard}>
            <Text style={styles.avgWeightValue}>{AVG_WEIGHT}</Text>
            <Text style={styles.avgWeightUnit}> กรัม/ผล</Text>
            <Text style={styles.avgWeightNote}>เกรด 82 คะแนน</Text>
          </View>

          {/* Monthly bar chart */}
          <Text style={styles.sectionTitle}>แนวโน้มการผลิตรายเดือน (Cherry)</Text>
          {renderBarChart()}

          {/* Farm group efficiency table */}
          <Text style={styles.sectionTitle}>ประสิทธิภาพรายกลุ่มสวน</Text>
          <View style={styles.tableCard}>
            {/* Table header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>กลุ่ม/พื้นที่</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>ผลผลิต(กก.)</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>คุณภาพ(คะแนน)</Text>
            </View>
            {FARM_GROUPS.map((g, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { flex: 1.2, fontWeight: '600' }]}>กลุ่ม{'\n'}{g.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{formatNumber(g.yield)}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.tableCell}>{g.quality}</Text>
                  <Text style={styles.starIcon}> ★</Text>
                </View>
              </View>
            ))}
          </View>

          {/* AI Insights */}
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>สรุปภาพรวมเชิงลึก</Text>
            <Text style={styles.insightsText}>
              ในปี 2567 ผลผลิตรวม 1,240 กก. เพิ่มขึ้น 12% จากปีก่อน สวนกลุ่มภูเรือมีผลผลิตสูงสุดด้วยคะแนนคุณภาพ 86.5 แนะนำให้เพิ่มการดูแลสวนกลุ่มด่านซ้ายเพื่อยกระดับคุณภาพ
            </Text>
          </View>

          {/* Overall score gauge */}
          <View style={styles.overallCard}>
            <Text style={styles.overallTitle}>คะแนนโดยรวมคุณภาพเมล็ดปี 2567</Text>
            {renderGauge()}
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

  // Overall gauge
  overallCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.xxl,
    alignItems: 'center', marginBottom: SPACING.xxl, ...SHADOWS.sm,
  },
  overallTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xl, textAlign: 'center' },
  gaugeContainer: { alignItems: 'center' },
  gaugeOuter: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 10, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  gaugeInner: { alignItems: 'center' },
  gaugeValue: { fontSize: 36, fontWeight: '700', color: COLORS.primary },
  gaugeLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
});
