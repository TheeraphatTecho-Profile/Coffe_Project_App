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
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SkeletonLoader, TextSkeleton } from '../../components/SkeletonLoader';
import { Logo } from '../../components/Logo';
import { CostService, Cost, COST_CATEGORIES } from '../../lib/costService';
import { useAuth } from '../../context/AuthContext';
import { Farm, FarmService } from '../../lib/firebaseDb';

export const CostListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const [costs, setCosts] = useState<Cost[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [costsData, farmsData] = await Promise.all([
        CostService.getAllCosts(user.uid),
        FarmService.getAll(user.uid)
      ]);
      
      setCosts(costsData);
      setFarms(farmsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getCategoryInfo = (categoryId: string) => {
    return COST_CATEGORIES.find(cat => cat.id === categoryId) || COST_CATEGORIES[0];
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || 'สวนไม่ระบุ';
  };

  const formatNumber = (n: number): string => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthIndex = date.getMonth();
    const month = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : '';
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  const handleDeleteCost = async (costId: string) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบรายการต้นทุนนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await CostService.deleteCost(costId);
              await loadData();
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบรายการได้ กรุณาลองใหม่');
            }
          },
        },
      ]
    );
  };

  const filteredCosts = costs.filter(cost => {
    const farmMatch = selectedFarm === 'all' || cost.farmId === selectedFarm;
    const categoryMatch = selectedCategory === 'all' || cost.category === selectedCategory;
    return farmMatch && categoryMatch;
  });

  const totalCost = filteredCosts.reduce((sum, cost) => sum + cost.totalCost, 0);

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Logo size="small" showText={false} />
            <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
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
          <Text style={styles.sectionLabel}>COST MANAGEMENT</Text>
          <Text style={styles.title}>ต้นทุนการผลิต</Text>
          <Text style={styles.subtitle}>
            ติดตามและจัดการต้นทุนทั้งหมดในสวนกาแฟของคุณ
          </Text>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="calculator-outline" size={24} color={colors.primary} />
              <Text style={styles.summaryTitle}>ต้นทุนรวม</Text>
            </View>
            <Text style={styles.summaryValue}>฿{formatNumber(totalCost)}</Text>
            <Text style={styles.summarySubtext}>
              {filteredCosts.length} รายการ
            </Text>
          </View>

          {/* Filters */}
          <View style={styles.filtersSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterLabel}>กรองตามสวน</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[styles.chip, selectedFarm === 'all' && styles.chipActive]}
                onPress={() => setSelectedFarm('all')}
              >
                <Text style={[styles.chipText, selectedFarm === 'all' && styles.chipTextActive]}>
                  ทุกสวน
                </Text>
              </TouchableOpacity>
              {farms.map((farm) => (
                <TouchableOpacity
                  key={farm.id}
                  style={[styles.chip, selectedFarm === farm.id && styles.chipActive]}
                  onPress={() => setSelectedFarm(farm.id)}
                >
                  <Text style={[styles.chipText, selectedFarm === farm.id && styles.chipTextActive]}>
                    {farm.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { marginTop: spacing.lg }]}>กรองตามประเภท</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'all' && styles.chipActive]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextActive]}>
                  ทุกประเภท
                </Text>
              </TouchableOpacity>
              {COST_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.chip, selectedCategory === category.id && styles.chipActive]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[styles.chipText, selectedCategory === category.id && styles.chipTextActive]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Cost List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={styles.costCard}>
                  <SkeletonLoader width={50} height={50} borderRadius={25} />
                  <View style={styles.costInfo}>
                    <TextSkeleton width={120} height={18} />
                    <TextSkeleton width={80} height={14} style={{ marginTop: spacing.xs }} />
                  </View>
                  <View style={styles.costAmount}>
                    <TextSkeleton width={60} height={16} />
                  </View>
                </View>
              ))}
            </View>
          ) : filteredCosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>ไม่มีข้อมูลต้นทุน</Text>
              <Text style={styles.emptyText}>
                {selectedFarm === 'all' && selectedCategory === 'all'
                  ? 'เริ่มต้นโดยการเพิ่มต้นทุนแรกของคุณ'
                  : 'ไม่พบต้นทุนตามเงื่อนไขที่เลือก'}
              </Text>
              <AnimatedButton
                title="เพิ่มต้นทุนแรก"
                onPress={() => navigation.navigate('AddCost')}
                variant="outline"
                size="medium"
              />
            </View>
          ) : (
            <View style={styles.costList}>
              {filteredCosts.map((cost) => {
                const categoryInfo = getCategoryInfo(cost.category);
                return (
                  <TouchableOpacity
                    key={cost.id}
                    style={styles.costCard}
                    onPress={() => navigation.navigate('CostDetail', { costId: cost.id })}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '20' }]}>
                      <Ionicons name={categoryInfo.icon as any} size={20} color={categoryInfo.color} />
                    </View>
                    
                    <View style={styles.costInfo}>
                      <Text style={styles.costDescription}>{cost.description}</Text>
                      <Text style={styles.costDetails}>
                        {getFarmName(cost.farmId)} • {formatThaiDate(cost.date)}
                      </Text>
                      <Text style={styles.costQuantity}>
                        {cost.amount} {categoryInfo.unit} × ฿{formatNumber(cost.unitPrice)}
                      </Text>
                    </View>
                    
                    <View style={styles.costAmount}>
                      <Text style={styles.costValue}>฿{formatNumber(cost.totalCost)}</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => cost.id && handleDeleteCost(cost.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* FAB */}
        <AnimatedButton
          title=""
          onPress={() => navigation.navigate('AddCost')}
          variant="primary"
          size="large"
          icon={<Ionicons name="add" size={28} color={colors.textOnPrimary} />}
          style={styles.fab}
        />
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
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: 100 },

  sectionLabel: {
    fontSize: typography.sizes.xs, fontWeight: '700', color: colors.secondary,
    letterSpacing: 1.5, marginBottom: spacing.sm,
  },
  title: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  subtitle: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    padding: spacing.xl, marginBottom: spacing.xl,
    ...shadows.md,
  },
  summaryHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: 'rgba(255,255,255,0.9)',
  },
  summaryValue: {
    fontSize: typography.sizes['2xl'], fontWeight: '700', color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)',
  },

  // Filters
  filtersSection: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  filterHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  filterLabel: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text },
  chipScroll: { marginVertical: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surfaceWarm,
    borderWidth: 1, borderColor: colors.borderLight, marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  chipText: { fontSize: typography.sizes.sm, color: colors.text },
  chipTextActive: { color: colors.textOnPrimary, fontWeight: '600' },

  // Cost List
  loadingContainer: { gap: spacing.md },
  costList: { gap: spacing.md },
  costCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md,
    ...shadows.sm,
  },
  categoryIcon: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  costInfo: { flex: 1 },
  costDescription: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.text,
    marginBottom: spacing.xs,
  },
  costDetails: {
    fontSize: typography.sizes.sm, color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  costQuantity: {
    fontSize: typography.sizes.xs, color: colors.textLight,
  },
  costAmount: {
    alignItems: 'flex-end', gap: spacing.xs,
  },
  costValue: {
    fontSize: typography.sizes.md, fontWeight: '700', color: colors.text,
  },
  deleteButton: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.error + '20',
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

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    ...shadows.lg,
  },
});
