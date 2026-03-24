import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { HarvestService, Harvest } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../lib/alert';
import ExportService from '../../lib/exportService';
import {
  filterHarvests,
  getAvailableYears,
  getFarmOptions,
  getShiftSummary,
  HarvestFilters,
} from '../../lib/harvestFilters';
import {
  PerformanceMonitor,
  useDebouncedCallback,
  usePerformanceMonitor,
  logMemoryUsage,
  toThaiYearCached,
  normalizeShiftCached,
} from '../../lib/performanceUtils';

const SHIFT_OPTIONS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'morning', label: 'รอบเช้า' },
  { id: 'afternoon', label: 'รอบบ่าย' },
  { id: 'evening', label: 'รอบกลางคืน' },
];

export const HarvestScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<HarvestFilters>({
    search: '',
    year: 'ทั้งหมด',
    shift: 'all',
    farmId: 'all',
  });

  const monitorPerformance = usePerformanceMonitor('HarvestScreen');

  const fetchHarvests = useCallback(async () => {
    if (!user?.uid) {
      setHarvests([]);
      setLoading(false);
      return;
    }
    
    PerformanceMonitor.start('fetchHarvests');
    
    try {
      const data = await HarvestService.getAll(user.uid);
      setHarvests(data);
      logMemoryUsage('After fetchHarvests');
    } catch (err) {
      console.error('Error fetching harvests:', err);
    } finally {
      setLoading(false);
      PerformanceMonitor.end('fetchHarvests');
    }
  }, [user]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHarvests();
    setRefreshing(false);
  }, [fetchHarvests]);

  const formatNumber = useCallback((n: number): string => 
    n.toLocaleString('th-TH', { maximumFractionDigits: 1 }), []
  );

  // Debounced search handler
  const handleSearchChange = useDebouncedCallback((text: string) => {
    setFilters(prev => ({ ...prev, search: text }));
  }, 300);

  const handleFilterChange = useCallback((partial: Partial<HarvestFilters>) => {
    monitorPerformance(() => {
      setFilters(prev => ({ ...prev, ...partial }));
    });
  }, [monitorPerformance]);

  // Memoized expensive calculations
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.search?.trim() ||
      filters.year !== 'ทั้งหมด' ||
      filters.shift !== 'all' ||
      filters.farmId !== 'all'
    );
  }, [filters]);

  const yearOptions = useMemo(() => {
    PerformanceMonitor.start('yearOptions');
    const result = ['ทั้งหมด', ...getAvailableYears(harvests)];
    PerformanceMonitor.end('yearOptions');
    return result;
  }, [harvests]);

  const farmOptions = useMemo(() => {
    PerformanceMonitor.start('farmOptions');
    const result = [{ id: 'all', name: 'สวนทั้งหมด' }, ...getFarmOptions(harvests)];
    PerformanceMonitor.end('farmOptions');
    return result;
  }, [harvests]);

  const filteredHarvests = useMemo(() => {
    PerformanceMonitor.start('filterHarvests');
    const result = filterHarvests(harvests, filters);
    PerformanceMonitor.end('filterHarvests');
    return result;
  }, [harvests, filters]);

  const shiftSummary = useMemo(() => {
    PerformanceMonitor.start('shiftSummary');
    const result = getShiftSummary(filteredHarvests);
    PerformanceMonitor.end('shiftSummary');
    return result;
  }, [filteredHarvests]);

  const topShift = shiftSummary[0];

  const topFarm = useMemo(() => {
    if (!filteredHarvests.length) return null;
    
    PerformanceMonitor.start('topFarm');
    const stats = filteredHarvests.reduce((acc, h) => {
      if (!h.farmId) return acc;
      const current = acc.get(h.farmId) || {
        name: h.farms?.name || 'ไร่กาแฟ',
        weight: 0,
        income: 0,
      };
      current.weight += h.weightKg || 0;
      current.income += h.income || 0;
      acc.set(h.farmId, current);
      return acc;
    }, new Map<string, { name: string; weight: number; income: number }>());
    const sorted = Array.from(stats.values()).sort((a, b) => b.weight - a.weight);
    PerformanceMonitor.end('topFarm');
    return sorted[0] || null;
  }, [filteredHarvests]);

  const totalYield = useMemo(
    () => filteredHarvests.reduce((sum, h) => sum + (h.weightKg || 0), 0),
    [filteredHarvests]
  );
  
  const totalIncome = useMemo(
    () => filteredHarvests.reduce((sum, h) => sum + (h.income || 0), 0),
    [filteredHarvests]
  );
  
  const entryCount = filteredHarvests.length;
  const avgWeight = entryCount ? totalYield / entryCount : 0;

  const handleResetFilters = useCallback(() => {
    setFilters({ search: '', year: 'ทั้งหมด', shift: 'all', farmId: 'all' });
  }, []);

  // Memoized empty state text
  const emptyStateTexts = useMemo(() => ({
    title: harvests.length === 0 ? 'ยังไม่มีข้อมูลการเก็บเกี่ยว' : 'ไม่พบข้อมูลตามตัวกรอง',
    subtitle: harvests.length === 0
      ? 'เริ่มบันทึกผลผลิตจากสวนกาแฟของคุณ'
      : 'ลองเปลี่ยนตัวกรองหรือรีเซ็ตเพื่อดูรายการทั้งหมด',
  }), [harvests.length]);

  const handleDeleteHarvest = useCallback((id: string) => {
    showAlert(
      'ลบรายการ',
      'คุณต้องการลบรายการผลผลิตนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await HarvestService.delete(id);
              setHarvests(prev => prev.filter(item => item.id !== id));
            } catch (err) {
              console.error('Delete harvest error:', err);
              showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
            }
          },
        },
      ]
    );
  }, []);

  // Optimized harvest item renderer
  const renderHarvestItem = useCallback(({ item: h }: { item: Harvest }) => {
    const date = h.harvestDate ? new Date(h.harvestDate) : new Date();
    const day = date.getDate().toString();
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthShort = monthNames[date.getMonth()] || '';
    const yearBE = (date.getFullYear() + 543).toString();

    return (
      <TouchableOpacity
        key={h.id}
        style={styles.harvestCard}
        onPress={() => navigation.navigate('HarvestDetail', { harvestId: h.id })}
      >
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{monthShort}</Text>
          <Text style={styles.dateYear}>{yearBE}</Text>
        </View>
        <View style={styles.harvestInfo}>
          <View style={styles.harvestHeader}>
            <Text style={styles.harvestVariety}>{h.variety || 'พันธุ์ไม่ระบุ'}</Text>
            <Text style={styles.harvestShift}>
              {normalizeShiftCached(h.shift) || 'ไม่ระบุ'}
            </Text>
          </View>
          <View style={styles.harvestDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>น้ำหนัก:</Text>
              <Text style={styles.detailValue}>{formatNumber(h.weightKg || 0)} กก.</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>รายได้:</Text>
              <Text style={styles.detailValue}>฿{formatNumber(h.income || 0)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.harvestActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('HarvestDetail', { harvestId: h.id })}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteHarvest(h.id)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, formatNumber, handleDeleteHarvest]);

  // List key extractor
  const keyExtractor = useCallback((item: Harvest) => item.id, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="cafe" size={22} color={COLORS.text} />
            <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={async () => {
                try {
                  await ExportService.exportHarvestsPDF(
                    filteredHarvests,
                    filters.year !== 'ทั้งหมด' ? filters.year : undefined
                  );
                } catch (err) {
                  showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกรายงานได้');
                }
              }}
            >
              <Ionicons name="document-text-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddHarvest')}
            >
              <Ionicons name="add" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifButton}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredHarvests}
          renderItem={renderHarvestItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          ListHeaderComponent={
            <View>
              <Text style={styles.sectionLabel}>INVENTORY & YIELD</Text>
              <Text style={styles.title}>รายการผลผลิต</Text>
              <Text style={styles.subtitle}>
                บันทึกการเก็บเกี่ยวจากไร่กาแฟบนขอบภูหลวง{' '}
                ข้อมูลประวัติการเก็บเกี่ยวรายแปลงและรายได้รวมสะสม
              </Text>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="ค้นหาตามวันที่หรือรหัสแปลง..."
                  placeholderTextColor={COLORS.textLight}
                  defaultValue={filters.search}
                  onChangeText={handleSearchChange}
                />
              </View>
              <View style={styles.filtersSection}>
                <View style={styles.filterHeader}>
                  <Text style={styles.filterLabel}>ปีการผลิต</Text>
                  {hasActiveFilters && (
                    <TouchableOpacity onPress={handleResetFilters}>
                      <Text style={styles.resetText}>ล้างตัวกรอง</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {yearOptions.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.chip, filters.year === year && styles.chipActive]}
                      onPress={() => handleFilterChange({ year })}
                    >
                      <Text style={[styles.chipText, filters.year === year && styles.chipTextActive]}>
                        {year === 'ทั้งหมด' ? 'ทั้งหมด' : `พ.ศ. ${year}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={[styles.filterLabel, { marginTop: SPACING.lg }]}>รอบการเก็บเกี่ยว</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {SHIFT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.chip, filters.shift === option.id && styles.chipActive]}
                      onPress={() => handleFilterChange({ shift: option.id })}
                    >
                      <Text style={[styles.chipText, filters.shift === option.id && styles.chipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text style={[styles.filterLabel, { marginTop: SPACING.lg }]}>เลือกสวน</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {farmOptions.map((farm) => (
                    <TouchableOpacity
                      key={farm.id}
                      style={[styles.chip, filters.farmId === farm.id && styles.chipActive]}
                      onPress={() => handleFilterChange({ farmId: farm.id })}
                    >
                      <Text style={[styles.chipText, filters.farmId === farm.id && styles.chipTextActive]}>
                        {farm.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="basket-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>{emptyStateTexts.title}</Text>
              <Text style={styles.emptyText}>{emptyStateTexts.subtitle}</Text>
            </View>
          }
          ListFooterComponent={
            <View>
              <View style={styles.totalYieldCard}>
                <Text style={styles.totalYieldLabel}>
                  ผลผลิตรวม {filters.year === 'ทั้งหมด' ? 'ทั้งหมด' : `พ.ศ. ${filters.year}`}
                </Text>
                <View style={styles.totalYieldRow}>
                  <Text style={styles.totalYieldValue}>{formatNumber(totalYield)}</Text>
                  <Text style={styles.totalYieldUnit}> กก.</Text>
                </View>
              </View>
              <View style={styles.totalIncomeCard}>
                <Text style={styles.totalIncomeLabel}>รายได้รวม</Text>
                <Text style={styles.totalIncomeValue}>{formatNumber(totalIncome)}</Text>
                <Text style={styles.totalIncomeUnit}>บาท</Text>
              </View>
              {shiftSummary.length > 0 && (
                <View style={styles.shiftSummaryCard}>
                  <Text style={styles.sectionTitle}>สรุปรอบเก็บเกี่ยว</Text>
                  {shiftSummary.map((item) => (
                    <View key={item.id} style={styles.shiftSummaryRow}>
                      <Text style={styles.shiftSummaryLabel}>{item.label}</Text>
                      <Text style={styles.shiftSummaryValue}>
                        {item.count} ครั้ง • {formatNumber(item.totalWeight)} กก.
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          }
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddHarvest')}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
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
  headerBrand: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  addButton: { padding: SPACING.xs },
  notifButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },

  sectionLabel: {
    fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.secondary,
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.md, letterSpacing: 0.5 },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.xxl },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: SPACING.lg,
  },
  searchInput: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text },

  // Filters
  filtersSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  filterLabel: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  resetText: { fontSize: FONTS.sizes.sm, color: COLORS.secondary, fontWeight: '600' },
  chipScroll: { marginVertical: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceWarm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.text },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },

  // Harvest card
  harvestCard: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.lg, gap: SPACING.lg, ...SHADOWS.sm,
  },
  dateBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, minWidth: 48,
  },
  dateMonth: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  dateDay: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text },
  dateYear: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  harvestDetails: { flex: 1 },
  harvestInfo: { flex: 1 },
  harvestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  harvestActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  detailLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  detailValue: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  harvestList: { marginBottom: SPACING.lg },
  harvestTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  tagBadge: {
    paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.sm,
  },
  tagText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
  harvestShift: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  harvestVariety: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  harvestStatsRow: { flexDirection: 'row', gap: SPACING.xxl },
  harvestStat: {},
  harvestStatLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginBottom: 2 },
  harvestStatValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  harvestStatValue: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text },
  harvestStatUnit: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },

  // Total yield
  totalYieldCard: {
    backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.xl, padding: SPACING.xxl,
    marginBottom: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight,
  },
  totalYieldLabel: {
    fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary,
    letterSpacing: 1.5, marginBottom: SPACING.md,
  },
  totalYieldRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  totalYieldValue: { fontSize: 48, fontWeight: '700', color: COLORS.text },
  totalYieldUnit: { fontSize: FONTS.sizes.xl, fontWeight: '500', color: COLORS.textSecondary },
  growthBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full,
  },
  growthText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.success },

  // Total income
  totalIncomeCard: {
    backgroundColor: COLORS.secondary, borderRadius: RADIUS.xl, padding: SPACING.xxl,
    alignItems: 'center', marginBottom: SPACING.xxl,
  },
  totalIncomeLabel: {
    fontSize: FONTS.sizes.xs, fontWeight: '700', color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },
  totalIncomeValue: { fontSize: 48, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  totalIncomeUnit: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)' },

  // Insights
  insightsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.lg, marginBottom: SPACING.md },
  insightStat: { flex: 1 },
  insightLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  insightValue: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text },
  insightValueSmall: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: '600' },

  shiftSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xxxl,
  },
  shiftSummaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  shiftSummaryLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  shiftSummaryValue: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },

  // Empty state
  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.xxxl,
    alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xxl, ...SHADOWS.sm,
  },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  emptyText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.lg,
  },
});
