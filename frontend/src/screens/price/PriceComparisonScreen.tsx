import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { 
  PriceService, 
  MarketPrice, 
  PriceTrend, 
  BuyerComparison, 
  PriceAlert 
} from '../../lib/priceService';

type Grade = 'A' | 'B' | 'C';

export const PriceComparisonScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade>('B');
  const [selectedDays, setSelectedDays] = useState(30);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [trends, setTrends] = useState<PriceTrend[]>([]);
  const [buyers, setBuyers] = useState<BuyerComparison[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [bestPrice, setBestPrice] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [marketPrices, priceTrends, buyerComparison, bestPriceData] = await Promise.all([
        PriceService.getMarketPrices(selectedDays),
        PriceService.getPriceTrends(selectedDays),
        PriceService.getBuyerComparison(),
        PriceService.getBestPriceForGrade(selectedGrade),
      ]);

      setPrices(marketPrices);
      setTrends(priceTrends);
      setBuyers(buyerComparison);
      setBestPrice(bestPriceData);
      setAlerts(await PriceService.getPriceAlerts());
    } catch (err) {
      console.error('Error fetching price data:', err);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลราคาได้');
    }
  }, [user, selectedDays, selectedGrade]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatNumber = (n: number): string => n.toLocaleString('th-TH', { maximumFractionDigits: 2 });

  const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ส.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

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

  const getPriceChange = (): { change: number; isPositive: boolean } => {
    if (trends.length < 2) return { change: 0, isPositive: false };
    
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    const change = ((latest.average_price - previous.average_price) / previous.average_price) * 100;
    
    return {
      change: Math.abs(change),
      isPositive: latest.average_price > previous.average_price,
    };
  };

  const priceChange = getPriceChange();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerBrand}>เปรียบเทียบราคา</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Section label */}
          <Text style={styles.sectionLabel}>MARKET INTELLIGENCE</Text>
          <Text style={styles.title}>เปรียบเทียบราคากาแฟ</Text>
          <Text style={styles.subtitle}>
            ติดตามราคาตลาดและวิเคราะห์แนวโน้มเพื่อตัดสินใจขาย
            {'\n'}ข้อมูลจากผู้ซื้อในจังหวัดเลยและพื้นที่ใกล้เคียง
          </Text>

          {/* Grade selector */}
          <View style={styles.gradeSelector}>
            <Text style={styles.selectorLabel}>เลือกเกรดกาแฟ:</Text>
            <View style={styles.gradeButtons}>
              {(['A', 'B', 'C'] as Grade[]).map((grade) => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.gradeButton,
                    selectedGrade === grade && styles.gradeButtonActive,
                  ]}
                  onPress={() => setSelectedGrade(grade)}
                >
                  <Text
                    style={[
                      styles.gradeButtonText,
                      selectedGrade === grade && styles.gradeButtonTextActive,
                    ]}
                  >
                    {getGradeLabel(grade)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time period selector */}
          <View style={styles.periodSelector}>
            <Text style={styles.selectorLabel}>ช่วงเวลา:</Text>
            <View style={styles.periodButtons}>
              {[7, 30, 90].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.periodButton,
                    selectedDays === days && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedDays(days)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedDays === days && styles.periodButtonTextActive,
                    ]}
                  >
                    {days === 7 ? '7 วัน' : days === 30 ? '30 วัน' : '90 วัน'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Current best price card */}
          {bestPrice && (
            <View style={styles.bestPriceCard}>
              <View style={styles.bestPriceHeader}>
                <Text style={styles.bestPriceTitle}>ราคาที่แนะนำ {getGradeLabel(selectedGrade)}</Text>
                <View style={styles.priceChangeBadge}>
                  <Ionicons 
                    name={priceChange.isPositive ? "arrow-up" : "arrow-down"} 
                    size={14} 
                    color={priceChange.isPositive ? COLORS.success : COLORS.error} 
                  />
                  <Text style={[
                    styles.priceChangeText,
                    { color: priceChange.isPositive ? COLORS.success : COLORS.error }
                  ]}>
                    {formatNumber(priceChange.change)}%
                  </Text>
                </View>
              </View>
              <View style={styles.bestPriceContent}>
                <View>
                  <Text style={styles.bestPriceValue}>฿{formatNumber(bestPrice.price)}</Text>
                  <Text style={styles.bestPriceUnit}>ต่อกิโลกรัม</Text>
                </View>
                <View style={styles.bestPriceDetails}>
                  <Text style={styles.bestBuyer}>{bestPrice.buyer}</Text>
                  <Text style={styles.premiumText}>
                    {bestPrice.premium > 0 ? `พรีเมียม +฿${formatNumber(bestPrice.premium)}` : 'ราคาตลาด'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Buyer comparison */}
          <View style={styles.buyerComparisonCard}>
            <Text style={styles.sectionTitle}>เปรียบเทียบผู้ซื้อ</Text>
            {buyers.map((buyer, index) => (
              <TouchableOpacity key={buyer.buyer} style={styles.buyerRow}>
                <View style={styles.buyerInfo}>
                  <View style={styles.buyerRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.buyerDetails}>
                    <Text style={styles.buyerName}>{buyer.buyer}</Text>
                    <Text style={styles.buyerTerms}>{buyer.payment_terms}</Text>
                  </View>
                </View>
                <View style={styles.buyerPrice}>
                  <Text style={styles.priceValue}>฿{formatNumber(buyer.avg_price)}</Text>
                  <View style={styles.reliability}>
                    <Ionicons name="star" size={12} color={COLORS.warning} />
                    <Text style={styles.reliabilityText}>{buyer.reliability_score}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price trends mini chart */}
          <View style={styles.trendsCard}>
            <Text style={styles.sectionTitle}>แนวโน้มราคา ({selectedDays} วัน)</Text>
            <View style={styles.trendChart}>
              {trends.slice(-7).map((trend, index) => {
                const maxPrice = Math.max(...trends.slice(-7).map(t => t.max_price));
                const height = (trend.average_price / maxPrice) * 60;
                
                return (
                  <View key={trend.date} style={styles.trendBar}>
                    <View 
                      style={[
                        styles.trendBarFill,
                        { height: Math.max(height, 4) },
                        { backgroundColor: getGradeColor(selectedGrade) }
                      ]}
                    />
                    <Text style={styles.trendBarLabel}>
                      {new Date(trend.date).getDate()}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.trendLegend}>
              <Text style={styles.trendCurrent}>
                ปัจจุบัน: ฿{trends.length > 0 ? formatNumber(trends[trends.length - 1].average_price) : '-'}
              </Text>
              <Text style={styles.trendRange}>
                ช่วง: ฿{trends.length > 0 ? formatNumber(Math.min(...trends.map(t => t.min_price))) : '-'} - 
                ฿{trends.length > 0 ? formatNumber(Math.max(...trends.map(t => t.max_price))) : '-'}
              </Text>
            </View>
          </View>

          {/* Active alerts */}
          {alerts.length > 0 && (
            <View style={styles.alertsCard}>
              <Text style={styles.sectionTitle}>การแจ้งเตือน</Text>
              {alerts.filter(a => a.active).map((alert) => (
                <View key={alert.id} style={styles.alertRow}>
                  <Ionicons 
                    name={alert.type === 'above' ? "trending-up" : "trending-down"} 
                    size={16} 
                    color={alert.type === 'above' ? COLORS.success : COLORS.error} 
                  />
                  <Text style={styles.alertText}>
                    {alert.type === 'above' ? 'ราคาสูงกว่า' : 'ราคาต่ำกว่า'} ฿{formatNumber(alert.threshold)}
                    {alert.buyer && ` (${alert.buyer})`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Profit calculator teaser */}
          <TouchableOpacity 
            style={styles.profitCalculatorCard}
            onPress={() => navigation.navigate('ProfitCalculator')}
          >
            <Ionicons name="calculator" size={24} color={COLORS.white} />
            <View style={styles.profitCalculatorContent}>
              <Text style={styles.profitCalculatorTitle}>คำนวณกำไร</Text>
              <Text style={styles.profitCalculatorSubtitle}>วิเคราะห์ผลกำไรจากการเก็บเกี่ยว</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerBrand: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  addButton: { padding: SPACING.sm },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },

  sectionLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.xxl },

  // Grade selector
  gradeSelector: { marginBottom: SPACING.xl },
  selectorLabel: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  gradeButtons: { flexDirection: 'row', gap: SPACING.sm },
  gradeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  gradeButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  gradeButtonText: { fontSize: FONTS.sizes.sm, color: COLORS.text, textAlign: 'center' },
  gradeButtonTextActive: { color: COLORS.white, fontWeight: '600' },

  // Period selector
  periodSelector: { marginBottom: SPACING.xl },
  periodButtons: { flexDirection: 'row', gap: SPACING.sm },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  periodButtonActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  periodButtonText: { fontSize: FONTS.sizes.sm, color: COLORS.text, textAlign: 'center' },
  periodButtonTextActive: { color: COLORS.white, fontWeight: '600' },

  // Best price card
  bestPriceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    ...SHADOWS.md,
  },
  bestPriceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bestPriceTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.white },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  priceChangeText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  bestPriceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bestPriceValue: { fontSize: 32, fontWeight: '700', color: COLORS.white },
  bestPriceUnit: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)' },
  bestPriceDetails: { alignItems: 'flex-end' },
  bestBuyer: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.white, marginBottom: SPACING.sm },
  premiumText: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)' },

  // Buyer comparison
  buyerComparisonCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.md, letterSpacing: 0.5 },
  buyerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  buyerInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  buyerRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text },
  buyerDetails: { flex: 1 },
  buyerName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  buyerTerms: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  buyerPrice: { alignItems: 'flex-end' },
  priceValue: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  reliability: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reliabilityText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

  // Trends
  trendsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  trendBar: { alignItems: 'center', flex: 1 },
  trendBarFill: {
    width: 20,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  trendBarLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  trendCurrent: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  trendRange: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },

  // Alerts
  alertsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  alertText: { fontSize: FONTS.sizes.sm, color: COLORS.text },

  // Profit calculator
  profitCalculatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    ...SHADOWS.md,
  },
  profitCalculatorContent: { flex: 1 },
  profitCalculatorTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.sm },
  profitCalculatorSubtitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)' },
});
