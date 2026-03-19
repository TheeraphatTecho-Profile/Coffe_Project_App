import React, { useState, useEffect, useCallback } from 'react';
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

const MOCK_HARVESTS: Harvest[] = [
  {
    id: '1',
    farm_id: '1',
    harvest_date: '2024-02-12',
    variety: 'อาราบิก้า',
    weight_kg: 320,
    income: 9600,
    shift: 'เช้า',
    notes: '',
    created_at: {} as any,
    user_id: '',
    farms: { name: 'สวนภูเรือ' },
  },
  {
    id: '2',
    farm_id: '2',
    harvest_date: '2024-02-10',
    variety: 'อาราบิก้า',
    weight_kg: 280,
    income: 8400,
    shift: 'เย็น',
    notes: '',
    created_at: {} as any,
    user_id: '',
    farms: { name: 'สวนนาแห้ว' },
  },
];

const TOTAL_YIELD = 1240;
const TOTAL_INCOME = 54200;
const YIELD_GROWTH_PERCENT = 12;

export const HarvestScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedYear] = useState('2567');
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHarvests = useCallback(async () => {
    if (!user?.uid) {
      setHarvests(MOCK_HARVESTS);
      setLoading(false);
      return;
    }
    try {
      const data = await HarvestService.getAll(user.uid);
      setHarvests(data.length > 0 ? data : MOCK_HARVESTS);
    } catch (err) {
      console.error('Error fetching harvests:', err);
      setHarvests(MOCK_HARVESTS);
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

  const formatNumber = (n: number): string => n.toLocaleString('th-TH');

  const totalYield = harvests.reduce((sum, h) => sum + (h.weight_kg || 0), 0);
  const totalIncome = harvests.reduce((sum, h) => sum + (h.income || 0), 0);

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
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Year filter */}
          <View style={styles.yearRow}>
            <Text style={styles.yearLabel}>ปีการผลิต</Text>
            <TouchableOpacity style={styles.yearPicker}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.yearValue}> พ.ศ. {selectedYear}</Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Harvest entries */}
          {(harvests.length > 0 ? harvests : MOCK_HARVESTS).map((h: any) => (
            <TouchableOpacity 
              key={h.id} 
              style={styles.harvestCard}
              onPress={() => navigation.navigate('HarvestDetail', { harvestId: h.id })}
            >
              {/* Date badge */}
              <View style={styles.dateBadge}>
                <Text style={styles.dateMonth}>{h.monthShort}</Text>
                <Text style={styles.dateDay}>{h.date}</Text>
                <Text style={styles.dateYear}>{h.year}</Text>
              </View>

              {/* Details */}
              <View style={styles.harvestDetails}>
                <View style={styles.harvestTopRow}>
                  <View style={[styles.tagBadge, { backgroundColor: h.tagColor || COLORS.primary }]}>
                    <Text style={styles.tagText}>{h.tag || 'A-01'}</Text>
                  </View>
                  <Text style={styles.harvestShift}>{h.shift}</Text>
                </View>
                <Text style={styles.harvestVariety}>{h.variety}</Text>

                <View style={styles.harvestStatsRow}>
                  <View style={styles.harvestStat}>
                    <Text style={styles.harvestStatLabel}>ปริมาณสุทธิ</Text>
                    <View style={styles.harvestStatValueRow}>
                      <Text style={styles.harvestStatValue}>{formatNumber(h.weightKg || h.weight_kg || 0)}</Text>
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
          ))}

          {/* Total yield card */}
          <View style={styles.totalYieldCard}>
            <Text style={styles.totalYieldLabel}>TOTAL YIELD {selectedYear}</Text>
            <View style={styles.totalYieldRow}>
              <Text style={styles.totalYieldValue}>{formatNumber(TOTAL_YIELD)}</Text>
              <Text style={styles.totalYieldUnit}> กก.</Text>
            </View>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={14} color={COLORS.success} />
              <Text style={styles.growthText}>
                {' '}+{YIELD_GROWTH_PERCENT}% จากปีที่แล้ว
              </Text>
            </View>
          </View>

          {/* Total income card */}
          <View style={styles.totalIncomeCard}>
            <Text style={styles.totalIncomeLabel}>TOTAL INCOME</Text>
            <Text style={styles.totalIncomeValue}>{formatNumber(TOTAL_INCOME)}</Text>
            <Text style={styles.totalIncomeUnit}>บาท</Text>
          </View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
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

  // Year filter
  yearRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  yearLabel: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  yearPicker: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  yearValue: { fontSize: FONTS.sizes.sm, fontWeight: '500', color: COLORS.text },

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

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.lg,
  },
});
