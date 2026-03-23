import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { MarketService, MarketInsight, LOEI_MARKET_REGIONS } from '../../lib/marketService';
import { useAuth } from '../../context/AuthContext';

export const MarketIntelligenceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');

  useEffect(() => {
    loadInsights();
  }, [selectedType, selectedImpact]);

  const loadInsights = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedType !== 'all') filters.type = selectedType;
      if (selectedImpact !== 'all') filters.impact = selectedImpact;
      
      const insightsData = await MarketService.getMarketInsights(user.uid, filters);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading market insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  }, [selectedType, selectedImpact]);

  const getInsightTypeInfo = (type: MarketInsight['type']) => {
    const typeInfo = {
      price_forecast: { icon: 'trending-up', color: '#3498DB', label: 'พยากรณ์ราคา' },
      market_trend: { icon: 'analytics', color: '#9B59B6', label: 'แนวโน้มตลาด' },
      buyer_demand: { icon: 'people', color: '#E67E22', label: 'ความต้องการซื้อ' },
      export_opportunity: { icon: 'globe', color: '#16A085', label: 'โอกาสส่งออก' },
      quality_premium: { icon: 'star', color: '#F39C12', label: 'พรีเมียมคุณภาพ' },
      seasonal_analysis: { icon: 'calendar', color: '#27AE60', label: 'วิเคราะห์ฤดูกาล' },
    };
    return typeInfo[type] || typeInfo.price_forecast;
  };

  const getImpactColor = (impact: MarketInsight['impact']) => {
    const colors = {
      high: '#E74C3C',
      medium: '#F39C12',
      low: '#27AE60',
    };
    return colors[impact];
  };

  const getImpactLabel = (impact: MarketInsight['impact']) => {
    const labels = {
      high: 'สูง',
      medium: 'ปานกลาง',
      low: 'ต่ำ',
    };
    return labels[impact];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const renderInsightCard = (insight: MarketInsight) => {
    const typeInfo = getInsightTypeInfo(insight.type);
    
    return (
      <TouchableOpacity
        key={insight.id}
        style={styles.insightCard}
        onPress={() => {
          if (Platform.OS === 'web') {
            globalThis.alert(`${insight.title}\n\n${insight.content}`);
            return;
          }

          Alert.alert(insight.title, insight.content);
        }}
      >
        <View style={styles.insightHeader}>
          <View style={styles.insightTitleRow}>
            <View style={[styles.insightIcon, { backgroundColor: typeInfo.color + '20' }]}>
              <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
            </View>
            <View style={styles.insightTitleContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightType}>{typeInfo.label}</Text>
            </View>
            <View style={[styles.impactBadge, { backgroundColor: getImpactColor(insight.impact) }]}>
              <Text style={styles.impactText}>{getImpactLabel(insight.impact)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.insightContent} numberOfLines={3}>
          {insight.content}
        </Text>
        
        <View style={styles.insightMeta}>
          <Text style={styles.insightTimeframe}>⏰ {insight.timeframe}</Text>
          {insight.actionable && (
            <Text style={styles.actionableTag}>✓ ปรับใช้ได้</Text>
          )}
        </View>

        {insight.targetRegion && (
          <View style={styles.insightTarget}>
            <Text style={styles.insightTargetText}>📍 {insight.targetRegion}</Text>
          </View>
        )}

        <View style={styles.insightFooter}>
          <Text style={styles.insightDate}>{formatDate(insight.createdAt.toDate().toISOString())}</Text>
          <View style={styles.insightActions}>
            {insight.actionable && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterChips = () => {
    const insightTypes = ['all', 'price_forecast', 'market_trend', 'buyer_demand', 'export_opportunity', 'quality_premium', 'seasonal_analysis'];
    const impacts = ['all', 'high', 'medium', 'low'];
    
    return (
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>ประเภท:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {insightTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  selectedType === type && styles.filterChipActive
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedType === type && styles.filterChipTextActive
                ]}>
                  {type === 'all' ? 'ทั้งหมด' : getInsightTypeInfo(type as MarketInsight['type']).label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>ผลกระทบ:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {impacts.map((impact) => (
              <TouchableOpacity
                key={impact}
                style={[
                  styles.filterChip,
                  selectedImpact === impact && styles.filterChipActive
                ]}
                onPress={() => setSelectedImpact(impact)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedImpact === impact && styles.filterChipTextActive
                ]}>
                  {impact === 'all' ? 'ทั้งหมด' : impact === 'high' ? 'สูง' : impact === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderMarketOverview = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.overviewTitle}>ภาพรวมตลาดกาแฟเลย</Text>
      
      <View style={styles.overviewCards}>
        <View style={styles.overviewCard}>
          <Ionicons name="trending-up" size={24} color={colors.primary} />
          <Text style={styles.overviewLabel}>ราคาเฉลี่ย</Text>
          <Text style={styles.overviewValue}>฿120/kg</Text>
          <Text style={styles.overviewTrend}>+5.2% จากเดือนที่แล้ว</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <Ionicons name="people" size={24} color={colors.success} />
          <Text style={styles.overviewLabel}>ผู้ซื้อที่ใช้งาน</Text>
          <Text style={styles.overviewValue}>12 ราย</Text>
          <Text style={styles.overviewTrend}>+2 รายเดือนนี้</Text>
        </View>
        
        <View style={styles.overviewCard}>
          <Ionicons name="star" size={24} color={colors.warning} />
          <Text style={styles.overviewLabel}>คุณภาพเกรด A</Text>
          <Text style={styles.overviewValue}>฿180/kg</Text>
          <Text style={styles.overviewTrend}>พรีเมียม 50%</Text>
        </View>
      </View>

      <View style={styles.regionsContainer}>
        <Text style={styles.regionsTitle}>ตลาดหลัก</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LOEI_MARKET_REGIONS.map((region) => (
            <View key={region.name} style={styles.regionCard}>
              <Text style={styles.regionName}>{region.name}</Text>
              <Text style={styles.regionType}>{region.description}</Text>
              <Text style={styles.regionPrice}>฿{100 + Math.floor(Math.random() * 50)}/kg</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

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
            <Text style={styles.headerBrand}>ข่าวสารตลาด</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Section Title */}
          <Text style={styles.sectionLabel}>MARKET INTELLIGENCE</Text>
          <Text style={styles.title}>ข่าวสารและวิเคราะห์ตลาด</Text>
          <Text style={styles.subtitle}>
            ติดตามข่าวสารตลาดกาแฟและโอกาสทางธุรกิจสำหรับเกษตรกรเลย
          </Text>

          {/* Market Overview */}
          {renderMarketOverview()}

          {/* Filters */}
          {renderFilterChips()}

          {/* Insights List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLoader key={i} width="100%" height={150} borderRadius={radius.lg} style={{ marginBottom: spacing.md }} />
              ))}
            </View>
          ) : insights.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>ไม่มีข่าวสารตลาด</Text>
              <Text style={styles.emptyText}>
                ไม่พบข่าวสารตามเงื่อนไขที่เลือก
              </Text>
            </View>
          ) : (
            <View style={styles.insightsList}>
              {insights.map(renderInsightCard)}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <AnimatedButton
              title="จัดการผู้ซื้อ"
              onPress={() => navigation.navigate('BuyerManagement')}
              variant="outline"
              size="large"
              icon={<Ionicons name="people-outline" size={20} color={colors.secondary} />}
            />
            <AnimatedButton
              title="ติดตามราคา"
              onPress={() => navigation.navigate('PriceComparison')}
              variant="outline"
              size="large"
              icon={<Ionicons name="trending-up-outline" size={20} color={colors.secondary} />}
            />
          </View>
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

  // Market Overview
  overviewContainer: { marginBottom: spacing.xl },
  overviewTitle: {
    fontSize: typography.sizes.lg, fontWeight: '600', color: colors.text,
    marginBottom: spacing.lg,
  },
  overviewCards: {
    flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg,
  },
  overviewCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderLight, ...shadows.sm,
  },
  overviewLabel: {
    fontSize: typography.sizes.xs, color: colors.textSecondary,
    marginBottom: spacing.xs, textAlign: 'center',
  },
  overviewValue: {
    fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text,
    marginBottom: spacing.xs,
  },
  overviewTrend: {
    fontSize: typography.sizes.xs, color: colors.success,
    textAlign: 'center',
  },
  regionsContainer: { marginBottom: spacing.lg },
  regionsTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.md,
  },
  regionCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginRight: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight,
    minWidth: 100,
  },
  regionName: {
    fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  regionType: {
    fontSize: typography.sizes.xs, color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  regionPrice: {
    fontSize: typography.sizes.sm, fontWeight: '700', color: colors.primary,
  },

  // Filters
  filtersContainer: { marginBottom: spacing.xl },
  filterSection: { marginBottom: spacing.md },
  filterLabel: {
    fontSize: typography.sizes.sm, fontWeight: '600', color: colors.text,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderLight, marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm, color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
  },

  // Loading
  loadingContainer: { gap: spacing.md },

  // Insights List
  insightsList: { gap: spacing.md },
  insightCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
    ...shadows.sm,
  },
  insightHeader: {
    marginBottom: spacing.sm,
  },
  insightTitleRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
  },
  insightIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  insightTitleContent: { flex: 1 },
  insightTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  insightType: {
    fontSize: typography.sizes.xs, color: colors.textSecondary,
  },
  impactBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm,
  },
  impactText: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textOnPrimary,
  },
  insightContent: {
    fontSize: typography.sizes.sm, color: colors.text,
    lineHeight: 18, marginBottom: spacing.sm,
  },
  insightMeta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightTimeframe: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  actionableTag: {
    fontSize: typography.sizes.xs, color: colors.success,
    fontWeight: '500',
  },
  insightTarget: {
    backgroundColor: colors.primary + '10', borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  insightTargetText: {
    fontSize: typography.sizes.xs, color: colors.primary,
  },
  insightFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  insightDate: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  insightActions: {
    flexDirection: 'row', gap: spacing.sm,
  },
  actionButton: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center', padding: spacing.xxxl, gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg, fontWeight: '600', color: colors.text,
  },
  emptyText: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },

  // Action Buttons
  actionButtons: {
    gap: spacing.md, marginTop: spacing.xl,
  },
});
