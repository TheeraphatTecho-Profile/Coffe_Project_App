import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { PriceService } from '../../lib/priceService';
import { HarvestService, FarmService } from '../../lib/firebaseDb';

type Grade = 'A' | 'B' | 'C';

interface CalculatorState {
  harvestWeight: string;
  selectedFarm: string;
  selectedGrade: Grade;
  laborCost: string;
  transportCost: string;
  processingCost: string;
  otherCosts: string;
  farms: any[];
  calculation: any;
  loading: boolean;
}

export const ProfitCalculatorScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const [state, setState] = useState<CalculatorState>({
    harvestWeight: '',
    selectedFarm: '',
    selectedGrade: 'B',
    laborCost: '',
    transportCost: '',
    processingCost: '',
    otherCosts: '',
    farms: [],
    calculation: null,
    loading: false,
  });

  useEffect(() => {
    loadFarms();
  }, [user]);

  const loadFarms = async () => {
    if (!user?.uid) return;
    try {
      const farms = await FarmService.getAll(user.uid);
      setState(prev => ({ ...prev, farms }));
    } catch (err) {
      console.error('Error loading farms:', err);
    }
  };

  const calculateProfit = async () => {
    const weight = parseFloat(state.harvestWeight);
    if (!weight || weight <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุน้ำหนักการเก็บเกี่ยว');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const labor = parseFloat(state.laborCost) || 0;
      const transport = parseFloat(state.transportCost) || 0;
      const processing = parseFloat(state.processingCost) || 0;
      const other = parseFloat(state.otherCosts) || 0;
      
      const totalCosts = labor + transport + processing + other;
      const bestPrice = await PriceService.getBestPriceForGrade(state.selectedGrade);
      const revenue = weight * bestPrice.price;
      const profit = revenue - totalCosts;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      const comparison = await PriceService.getBuyerComparison();
      const profitAnalysis = PriceService.calculateProfitPotential(
        weight,
        state.selectedGrade
      );

      setState(prev => ({
        ...prev,
        loading: false,
        calculation: {
          revenue,
          totalCosts,
          profit,
          profitMargin,
          bestPrice,
          comparison: comparison.slice(0, 3),
          profitAnalysis,
          costPerKg: weight > 0 ? totalCosts / weight : 0,
        },
      }));
    } catch (err) {
      setState(prev => ({ ...prev, loading: false }));
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถคำนวณได้');
    }
  };

  const formatNumber = (n: number): string => 
    n.toLocaleString('th-TH', { maximumFractionDigits: 2 });

  const getGradeColor = (grade: Grade): string => {
    switch (grade) {
      case 'A': return COLORS.success;
      case 'B': return COLORS.primary;
      case 'C': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getGradeLabel = (grade: Grade): string => {
    switch (grade) {
      case 'A': return 'เกรด A (พิเศษ)';
      case 'B': return 'เกรด B (ดี)';
      case 'C': return 'เกรด C (ทั่วไป)';
      default: return 'เกรด C';
    }
  };

  const updateState = (updates: Partial<CalculatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>คำนวณกำไร</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Input section */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>ข้อมูลการเก็บเกี่ยว</Text>
            
            {/* Farm selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>สวนกาแฟ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.farmButtons}>
                  <TouchableOpacity
                    style={[
                      styles.farmButton,
                      !state.selectedFarm && styles.farmButtonActive,
                    ]}
                    onPress={() => updateState({ selectedFarm: '' })}
                  >
                    <Text style={[
                      styles.farmButtonText,
                      !state.selectedFarm && styles.farmButtonTextActive,
                    ]}>
                      ทั้งหมด
                    </Text>
                  </TouchableOpacity>
                  {state.farms.map((farm) => (
                    <TouchableOpacity
                      key={farm.id}
                      style={[
                        styles.farmButton,
                        state.selectedFarm === farm.id && styles.farmButtonActive,
                      ]}
                      onPress={() => updateState({ selectedFarm: farm.id })}
                    >
                      <Text style={[
                        styles.farmButtonText,
                        state.selectedFarm === farm.id && styles.farmButtonTextActive,
                      ]}>
                        {farm.name || 'สวนไม่มีชื่อ'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Weight input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>น้ำหนัก (กิโลกรัม)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="scale-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.textLight}
                  value={state.harvestWeight}
                  onChangeText={(text: string) => updateState({ harvestWeight: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Grade selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>เกรดกาแฟ</Text>
              <View style={styles.gradeButtons}>
                {(['A', 'B', 'C'] as Grade[]).map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeButton,
                      state.selectedGrade === grade && styles.gradeButtonActive,
                      { borderColor: getGradeColor(grade) }
                    ]}
                    onPress={() => updateState({ selectedGrade: grade })}
                  >
                    <Text style={[
                      styles.gradeButtonText,
                      state.selectedGrade === grade && styles.gradeButtonTextActive,
                    ]}>
                      {getGradeLabel(grade)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Costs section */}
          <View style={styles.costsSection}>
            <Text style={styles.sectionTitle}>ต้นทุน</Text>
            
            <View style={styles.costsGrid}>
              <View style={styles.costInput}>
                <Text style={styles.costLabel}>แรงงาน</Text>
                <View style={styles.costInputWrapper}>
                  <Ionicons name="people-outline" size={16} color={COLORS.textLight} />
                  <TextInput
                    style={styles.costTextInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    value={state.laborCost}
                    onChangeText={(text) => updateState({ laborCost: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.costInput}>
                <Text style={styles.costLabel}>ขนส่ง</Text>
                <View style={styles.costInputWrapper}>
                  <Ionicons name="car-outline" size={16} color={COLORS.textLight} />
                  <TextInput
                    style={styles.costTextInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    value={state.transportCost}
                    onChangeText={(text) => updateState({ transportCost: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.costInput}>
                <Text style={styles.costLabel}>แปรรูป</Text>
                <View style={styles.costInputWrapper}>
                  <Ionicons name="settings-outline" size={16} color={COLORS.textLight} />
                  <TextInput
                    style={styles.costTextInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    value={state.processingCost}
                    onChangeText={(text) => updateState({ processingCost: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.costInput}>
                <Text style={styles.costLabel}>อื่นๆ</Text>
                <View style={styles.costInputWrapper}>
                  <Ionicons name="ellipsis-horizontal-outline" size={16} color={COLORS.textLight} />
                  <TextInput
                    style={styles.costTextInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    value={state.otherCosts}
                    onChangeText={(text) => updateState({ otherCosts: text })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Calculate button */}
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateProfit}
            disabled={state.loading}
          >
            <Ionicons name="calculator" size={20} color={COLORS.white} />
            <Text style={styles.calculateButtonText}>
              {state.loading ? 'กำลังคำนวณ...' : 'คำนวณกำไร'}
            </Text>
          </TouchableOpacity>

          {/* Results section */}
          {state.calculation && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>ผลการคำนวณ</Text>
              
              {/* Summary cards */}
              <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                  <Ionicons name="trending-up" size={24} color={COLORS.success} />
                  <Text style={styles.summaryLabel}>รายได้</Text>
                  <Text style={styles.summaryValue}>฿{formatNumber(state.calculation.revenue)}</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Ionicons name="cash-outline" size={24} color={COLORS.error} />
                  <Text style={styles.summaryLabel}>ต้นทุน</Text>
                  <Text style={styles.summaryValue}>฿{formatNumber(state.calculation.totalCosts)}</Text>
                </View>

                <View style={[
                  styles.summaryCard,
                  { backgroundColor: state.calculation.profit >= 0 ? COLORS.successLight : COLORS.errorLight }
                ]}>
                  <Ionicons 
                    name={state.calculation.profit >= 0 ? "arrow-up" : "arrow-down"} 
                    size={24} 
                    color={state.calculation.profit >= 0 ? COLORS.success : COLORS.error} 
                  />
                  <Text style={styles.summaryLabel}>กำไร</Text>
                  <Text style={[
                    styles.summaryValue,
                    { color: state.calculation.profit >= 0 ? COLORS.success : COLORS.error }
                  ]}>
                    ฿{formatNumber(state.calculation.profit)}
                  </Text>
                </View>
              </View>

              {/* Profit margin */}
              <View style={styles.profitMarginCard}>
                <Text style={styles.profitMarginLabel}>อัตรากำไร</Text>
                <Text style={[
                  styles.profitMarginValue,
                  { color: state.calculation.profitMargin >= 0 ? COLORS.success : COLORS.error }
                ]}>
                  {formatNumber(state.calculation.profitMargin)}%
                </Text>
                <Text style={styles.profitMarginSubtext}>
                  ต้นทุนต่อกิโล: ฿{formatNumber(state.calculation.costPerKg)}
                </Text>
              </View>

              {/* Recommendations */}
              <View style={styles.recommendationsCard}>
                <Text style={styles.recommendationsTitle}>คำแนะนำ</Text>
                <View style={styles.recommendationItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.recommendationText}>
                    {state.calculation.profitAnalysis.recommendation}
                  </Text>
                </View>
                <View style={styles.recommendationItem}>
                  <Ionicons name="information-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.recommendationText}>
                    ราคาที่แนะนำ: ฿{formatNumber(state.calculation.bestPrice.price)} ต่อกิโลกรัม
                  </Text>
                </View>
              </View>

              {/* Buyer comparison */}
              <View style={styles.buyerComparisonCard}>
                <Text style={styles.buyerComparisonTitle}>เปรียบเทียบผู้ซื้ออื่น</Text>
                {state.calculation.comparison.map((buyer: any, index: number) => {
                  const buyerRevenue = state.calculation.profit + state.calculation.totalCosts + 
                    (buyer.avg_price - state.calculation.bestPrice.price) * parseFloat(state.harvestWeight);
                  const buyerProfit = buyerRevenue - state.calculation.totalCosts;
                  
                  return (
                    <View key={buyer.buyer} style={styles.buyerComparisonRow}>
                      <View style={styles.buyerComparisonInfo}>
                        <Text style={styles.buyerComparisonName}>{buyer.buyer}</Text>
                        <Text style={styles.buyerComparisonPrice}>฿{formatNumber(buyer.avg_price)}/กก.</Text>
                      </View>
                      <View style={styles.buyerComparisonProfit}>
                        <Text style={[
                          styles.buyerComparisonProfitValue,
                          { color: buyerProfit >= state.calculation.profit ? COLORS.success : COLORS.textSecondary }
                        ]}>
                          ฿{formatNumber(buyerProfit)}
                        </Text>
                        <Text style={styles.buyerComparisonDiff}>
                          {buyerProfit > state.calculation.profit ? '+' : ''}
                          ฿{formatNumber(buyerProfit - state.calculation.profit)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  headerPlaceholder: { width: 24 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },

  // Input section
  inputSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  inputLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  
  // Farm selection
  farmButtons: { flexDirection: 'row', gap: SPACING.sm },
  farmButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  farmButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  farmButtonText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  farmButtonTextActive: { color: COLORS.white, fontWeight: '600' },

  // Text input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  textInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text },

  // Grade selection
  gradeButtons: { flexDirection: 'row', gap: SPACING.sm },
  gradeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
  },
  gradeButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  gradeButtonText: { fontSize: FONTS.sizes.sm, color: COLORS.text, textAlign: 'center' },
  gradeButtonTextActive: { color: COLORS.white, fontWeight: '600' },

  // Costs section
  costsSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  costsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginHorizontal: -SPACING.sm },
  costInput: {
    width: '50%',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
  },
  costLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  costInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  costTextInput: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text },

  // Calculate button
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.xxl,
    ...SHADOWS.md,
  },
  calculateButtonText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.white },

  // Results section
  resultsSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },

  // Profit margin
  profitMarginCard: {
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profitMarginLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  profitMarginValue: { fontSize: FONTS.sizes.xxl, fontWeight: '700', marginBottom: SPACING.sm },
  profitMarginSubtext: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },

  // Recommendations
  recommendationsCard: {
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  recommendationsTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  recommendationText: { fontSize: FONTS.sizes.sm, color: COLORS.text, flex: 1 },

  // Buyer comparison
  buyerComparisonCard: {
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  buyerComparisonTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  buyerComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  buyerComparisonInfo: { flex: 1 },
  buyerComparisonName: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  buyerComparisonPrice: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  buyerComparisonProfit: { alignItems: 'flex-end' },
  buyerComparisonProfitValue: { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  buyerComparisonDiff: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
});
