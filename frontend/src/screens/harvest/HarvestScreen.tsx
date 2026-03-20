import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { HarvestService, Harvest } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import {
  filterHarvests,
  getAvailableYears,
  getFarmOptions,
  getShiftSummary,
  HarvestFilters,
} from '../../lib/harvestFilters';

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

  const fetchHarvests = useCallback(async () => {
    if (!user?.uid) {
      setHarvests([]);
      setLoading(false);
      return;
    }
    try {
      const data = await HarvestService.getAll(user.uid);
      setHarvests(data);
    } catch (err) {
      console.error('Error fetching harvests:', err);
      setHarvests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHarvests();
    setRefreshing(false);
  };

  const formatNumber = (n: number): string => n.toLocaleString('th-TH', { maximumFractionDigits: 1 });

  const handleFilterChange = (partial: Partial<HarvestFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  };

  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.search?.trim() ||
      filters.year !== 'ทั้งหมด' ||
      filters.shift !== 'all' ||
      filters.farmId !== 'all'
    );
  }, [filters]);

  const yearOptions = useMemo(() => ['ทั้งหมด', ...getAvailableYears(harvests)], [harvests]);
  const farmOptions = useMemo(
    () => [{ id: 'all', name: 'สวนทั้งหมด' }, ...getFarmOptions(harvests)],
    [harvests]
  );

  const filteredHarvests = useMemo(() => filterHarvests(harvests, filters), [harvests, filters]);
  const shiftSummary = useMemo(() => getShiftSummary(filteredHarvests), [filteredHarvests]);
  const topShift = shiftSummary[0];

  const topFarm = useMemo(() => {
    if (!filteredHarvests.length) return null;
    const stats = filteredHarvests.reduce((acc, h) => {
      if (!h.farm_id) return acc;
      const current = acc.get(h.farm_id) || {
        name: h.farms?.name || 'ไร่กาแฟ',
        weight: 0,
        income: 0,
      };
      current.weight += h.weight_kg || 0;
      current.income += h.income || 0;
      acc.set(h.farm_id, current);
      return acc;
    }, new Map<string, { name: string; weight: number; income: number }>());
    const sorted = Array.from(stats.values()).sort((a, b) => b.weight - a.weight);
    return sorted[0] || null;
  }, [filteredHarvests]);

  const totalYield = useMemo(
    () => filteredHarvests.reduce((sum, h) => sum + (h.weight_kg || 0), 0),
    [filteredHarvests]
  );
  const totalIncome = useMemo(
    () => filteredHarvests.reduce((sum, h) => sum + (h.income || 0), 0),
    [filteredHarvests]
  );
  const entryCount = filteredHarvests.length;
  const avgWeight = entryCount ? totalYield / entryCount : 0;

  const handleResetFilters = () => {
    setFilters({ search: '', year: 'ทั้งหมด', shift: 'all', farmId: 'all' });
  };

  const emptyStateTitle = harvests.length === 0 ? 'ยังไม่มีข้อมูลการเก็บเกี่ยว' : 'ไม่พบข้อมูลตามตัวกรอง';
  const emptyStateSubtitle =
    harvests.length === 0
      ? 'เริ่มบันทึกผลผลิตจากสวนกาแฟของคุณ'
      : 'ลองเปลี่ยนตัวกรองหรือรีเซ็ตเพื่อดูรายการทั้งหมด';

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
              onPress={() => navigation.navigate('AddHarvest')}
            >
              <Ionicons name="add-circle" size={28} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifButton}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section label */}
          <Text style={styles.sectionLabel}>INVENTORY & YIELD</Text>
          <Text style={styles.title}>รายการผลผลิต</Text>
          <Text style={styles.subtitle}>
            บันทึกการเก็บเกี่ยวจากไร่กาแฟบนขอบภูหลวง{'\n'}
            ข้อมูลประวัติการเก็บเกี่ยวรายแปลงและรายได้รวมสะสม
          </Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหาตามวันที่หรือรหัสแปลง..."
              placeholderTextColor={COLORS.textLight}
              value={filters.search}
              onChangeText={(text) => handleFilterChange({ search: text })}
            />
          </View>

          {/* Filters */}
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

          {/* Insights card */}
          <View style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>สรุปตัวกรองปัจจุบัน</Text>
            <View style={styles.insightRow}>
              <View style={styles.insightStat}>
                <Text style={styles.insightLabel}>จำนวนรายการ</Text>
                <Text style={styles.insightValue}>{entryCount}</Text>
              </View>
              <View style={styles.insightStat}>
                <Text style={styles.insightLabel}>เฉลี่ยต่อครั้ง</Text>
                <Text style={styles.insightValue}>{formatNumber(avgWeight)} กก.</Text>
              </View>
            </View>
            <View style={styles.insightRow}>
              <View style={styles.insightStat}>
                <Text style={styles.insightLabel}>สวนที่ทำผลผลิตสูงสุด</Text>
                <Text style={styles.insightValueSmall}>
                  {topFarm ? `${topFarm.name} • ${formatNumber(topFarm.weight)} กก.` : '—'}
                </Text>
              </View>
              <View style={styles.insightStat}>
                <Text style={styles.insightLabel}>รอบที่มีประสิทธิภาพ</Text>
                <Text style={styles.insightValueSmall}>
                  {topShift
                    ? `${topShift.label} • ${topShift.count} ครั้ง (${formatNumber(topShift.totalWeight)} กก.)`
                    : '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Harvest entries */}
          {filteredHarvests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="basket-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>{emptyStateTitle}</Text>
              <Text style={styles.emptyText}>{emptyStateSubtitle}</Text>
            </View>
          ) : (
            filteredHarvests.map((h) => {
              const date = h.harvest_date ? new Date(h.harvest_date) : new Date();
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
                  {/* Date badge */}
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateMonth}>{monthShort}</Text>
                    <Text style={styles.dateDay}>{day}</Text>
                    <Text style={styles.dateYear}>{yearBE}</Text>
                  </View>

                  {/* Details */}
                  <View style={styles.harvestDetails}>
                    <View style={styles.harvestTopRow}>
                      <View style={[styles.tagBadge, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.tagText}>{h.farms?.name || 'สวน'}</Text>
                      </View>
                      <Text style={styles.harvestShift}>{h.shift || '-'}</Text>
                    </View>
                    <Text style={styles.harvestVariety}>{h.variety || 'กาแฟ'}</Text>

                    <View style={styles.harvestStatsRow}>
                      <View style={styles.harvestStat}>
                        <Text style={styles.harvestStatLabel}>ปริมาณสุทธิ</Text>
                        <View style={styles.harvestStatValueRow}>
                          <Text style={styles.harvestStatValue}>{formatNumber(h.weight_kg || 0)}</Text>
                          <Text style={styles.harvestStatUnit}> กก.</Text>
                        </View>
                      </View>
                      <View style={styles.harvestStat}>
                        <Text style={styles.harvestStatLabel}>รายได้รวม</Text>
                        <View style={styles.harvestStatValueRow}>
                          <Text style={[styles.harvestStatValue, { color: COLORS.secondary }]}>
                            {formatNumber(h.income || 0)}
                          </Text>
                          <Text style={styles.harvestStatUnit}> บาท</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* Total yield card — real computed values */}
          <View style={styles.totalYieldCard}>
            <Text style={styles.totalYieldLabel}>
              ผลผลิตรวม {filters.year === 'ทั้งหมด' ? 'ทั้งหมด' : `พ.ศ. ${filters.year}`}
            </Text>
            <View style={styles.totalYieldRow}>
              <Text style={styles.totalYieldValue}>{formatNumber(totalYield)}</Text>
              <Text style={styles.totalYieldUnit}> กก.</Text>
            </View>
          </View>

          {/* Total income card — real computed values */}
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
        </ScrollView>

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
