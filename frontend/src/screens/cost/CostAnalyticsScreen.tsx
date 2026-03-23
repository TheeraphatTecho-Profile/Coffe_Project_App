import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { CostService, Cost, COST_CATEGORIES } from '../../lib/costService';
import { HarvestService } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';

export const CostAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [costSummary, setCostSummary] = useState<any>(null);
  const [harvestSummary, setHarvestSummary] = useState<any>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedFarm]);

  const loadAnalytics = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [costData, harvestData, trendData] = await Promise.all([
        CostService.getCostSummary(user.uid, selectedFarm === 'all' ? undefined : selectedFarm),
        HarvestService.getSummary(user.uid),
        CostService.getMonthlyCostTrend(user.uid, 12)
      ]);
      
      setCostSummary(costData);
      setHarvestSummary(harvestData);
      setMonthlyTrend(trendData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n: number): string => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const formatThaiMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthName = monthNames[parseInt(month) - 1] || '';
    const thaiYear = parseInt(year) + 543;
    return `${monthName} ${thaiYear}`;
  };

  const calculateProfit = () => {
    if (!harvestSummary || !costSummary) return 0;
    return harvestSummary.totalIncome - costSummary.totalCost;
  };

  const calculateProfitMargin = () => {
    if (!harvestSummary || !costSummary || harvestSummary.totalIncome === 0) return 0;
    return ((calculateProfit() / harvestSummary.totalIncome) * 100);
  };

  const renderCostByCategory = () => {
    if (!costSummary) return null;
    
    const categories = Object.entries(costSummary.byCategory).map(([category, amount]) => ({
      category,
      amount: amount as number,
      info: COST_CATEGORIES.find(cat => cat.id === category) || COST_CATEGORIES[0],
      percentage: costSummary.totalCost > 0 ? ((amount as number) / costSummary.totalCost) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    return (
      <View style={styles.categoryBreakdown}>
        <Text style={styles.sectionTitle}>ต้นทุนตามประเภท</Text>
        {categories.map((item) => (
          <View key={item.category} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: item.info.color + '20' }]}>
                <Ionicons name={item.info.icon as any} size={20} color={item.info.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.info.name}</Text>
                <Text style={styles.categoryPercentage}>{item.percentage.toFixed(1)}%</Text>
              </View>
            </View>
            <Text style={styles.categoryAmount}>฿{formatNumber(item.amount)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMonthlyTrend = () => {
    const maxCost = Math.max(...monthlyTrend.map(item => item.cost), 1);
    const BAR_MAX_HEIGHT = 100;

    return (
      <View style={styles.trendChart}>
        <Text style={styles.sectionTitle}>แนวโน้มต้นทุนรายเดือน</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartBars}>
            {monthlyTrend.slice(-6).map((item, index) => {
              const height = (item.cost / maxCost) * BAR_MAX_HEIGHT;
              return (
                <View key={item.month} style={styles.chartBarContainer}>
                  <View style={[
                    styles.chartBar,
                    { height: Math.max(height, 4), backgroundColor: colors.primary }
                  ]} />
                  <Text style={styles.chartLabel}>{formatThaiMonth(item.month).substring(0, 3)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerBrand}>วิเคราะห์ต้นทุน</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Section Title */}
          <Text style={styles.sectionLabel}>COST ANALYTICS</Text>
          <Text style={styles.title}>วิเคราะห์ต้นทุน</Text>
          <Text style={styles.subtitle}>
            ภาพรวมต้นทุนและกำไรจากการผลิตกาแฟ
          </Text>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodOption,
                  selectedPeriod === period && styles.periodOptionSelected
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextSelected
                ]}>
                  {period === 'month' ? 'รายเดือน' : period === 'quarter' ? 'รายไตรมาส' : 'รายปี'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <SkeletonLoader width="100%" height={120} borderRadius={radius.lg} style={{ marginBottom: spacing.lg }} />
              <SkeletonLoader width="100%" height={200} borderRadius={radius.lg} />
            </View>
          ) : (
            <>
              {/* Profit Summary */}
              <View style={styles.profitSummary}>
                <Text style={styles.profitTitle}>สรุปผลกำไร</Text>
                <View style={styles.profitCards}>
                  <View style={styles.profitCard}>
                    <Text style={styles.profitLabel}>รายได้รวม</Text>
                    <Text style={styles.profitValueIncome}>
                      ฿{formatNumber(harvestSummary?.totalIncome || 0)}
                    </Text>
                  </View>
                  <View style={styles.profitCard}>
                    <Text style={styles.profitLabel}>ต้นทุนรวม</Text>
                    <Text style={styles.profitValueCost}>
                      ฿{formatNumber(costSummary?.totalCost || 0)}
                    </Text>
                  </View>
                  <View style={[styles.profitCard, styles.profitCardMain]}>
                    <Text style={styles.profitLabel}>กำไรสุทธิ</Text>
                    <Text style={[
                      styles.profitValueProfit,
                      calculateProfit() >= 0 ? styles.profitPositive : styles.profitNegative
                    ]}>
                      {calculateProfit() >= 0 ? '+' : ''}฿{formatNumber(calculateProfit())}
                    </Text>
                    <Text style={styles.profitMargin}>
                      ({calculateProfitMargin().toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Cost per kg */}
              <View style={styles.costPerKgCard}>
                <Text style={styles.costPerKgTitle}>ต้นทุนต่อกิโลกรัม</Text>
                <Text style={styles.costPerKgValue}>
                  ฿{harvestSummary?.totalWeight > 0 
                    ? formatNumber((costSummary?.totalCost || 0) / harvestSummary.totalWeight)
                    : '0.00'
                  }
                </Text>
                <Text style={styles.costPerKgSubtext}>
                  ต่อกก. กาแฟดิบ
                </Text>
              </View>

              {/* Monthly Trend */}
              {renderMonthlyTrend()}

              {/* Category Breakdown */}
              {renderCostByCategory()}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <AnimatedButton
                  title="ดูรายการต้นทุน"
                  onPress={() => navigation.navigate('CostList')}
                  variant="outline"
                  size="large"
                  icon={<Ionicons name="list-outline" size={20} color={colors.secondary} />}
                />
                <AnimatedButton
                  title="เพิ่มต้นทุน"
                  onPress={() => navigation.navigate('AddCost')}
                  variant="primary"
                  size="large"
                  icon={<Ionicons name="add" size={20} color={colors.textOnPrimary} />}
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerBrand: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  sectionLabel: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.secondary,
    letterSpacing: 1.5, marginBottom: spacing.sm,
  },
  title: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  subtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl },

  // Period Selector
  periodSelector: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.xs, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  periodOption: {
    flex: 1, paddingVertical: spacing.sm, alignItems: 'center',
    borderRadius: radius.md,
  },
  periodOptionSelected: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
  },
  periodTextSelected: {
    color: colors.textOnPrimary, fontWeight: '600',
  },

  // Loading
  loadingContainer: { gap: spacing.lg },

  // Profit Summary
  profitSummary: { marginBottom: spacing.xl },
  profitTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.lg,
  },
  profitCards: { gap: spacing.sm },
  profitCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
  },
  profitCardMain: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  profitLabel: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
  },
  profitValueIncome: {
    fontSize: typography.sizes.md, fontWeight: '700', color: colors.success,
  },
  profitValueCost: {
    fontSize: typography.sizes.md, fontWeight: '700', color: colors.error,
  },
  profitValueProfit: {
    fontSize: typography.sizes.md, fontWeight: '700',
  },
  profitPositive: { color: colors.textOnPrimary },
  profitNegative: { color: colors.error },
  profitMargin: {
    fontSize: typography.sizes.xs, color: 'rgba(255,255,255,0.8)',
  },

  // Cost per kg
  costPerKgCard: {
    backgroundColor: colors.secondary, borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl,
    ...shadows.md,
  },
  costPerKgTitle: {
    fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
  },
  costPerKgValue: {
    fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  costPerKgSubtext: {
    fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)',
  },

  // Trend Chart
  trendChart: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.lg,
  },
  chartContainer: { alignItems: 'center' },
  chartBars: {
    flexDirection: 'row', alignItems: 'flex-end',
    height: 100, gap: spacing.sm,
  },
  chartBarContainer: {
    flex: 1, alignItems: 'center',
  },
  chartBar: {
    width: '100%', borderRadius: radius.sm, marginBottom: spacing.xs,
  },
  chartLabel: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },

  // Category Breakdown
  categoryBreakdown: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  categoryItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  categoryIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryInfo: { flex: 1 },
  categoryName: {
    fontSize: typography.sizes.md, fontWeight: '500', color: colors.text,
  },
  categoryPercentage: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  categoryAmount: {
    fontSize: typography.sizes.md, fontWeight: '700', color: colors.text,
  },

  // Action Buttons
  actionButtons: { gap: spacing.md },
});
