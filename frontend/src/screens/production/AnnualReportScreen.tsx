import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { FarmService, HarvestService } from '../../lib/firebaseDb';
import { FreshSaleService, ProcessedProductService } from '../../lib/productionService';
import { generateAndShareReport } from '../../lib/pdfExportService';
import { showAlert } from '../../lib/alert';

interface YearSummary {
  year: number;
  totalHarvestKg: number;
  harvestEntries: number;
  byVariety: { variety: string; weightKg: number }[];
  freshSaleKg: number;
  freshSaleIncome: number;
  processedKg: number;
  processedIncome: number;
  totalIncome: number;
  productCount: number;
}

/**
 * Annual production report screen.
 * Aggregates harvest, fresh sale, and processed product data by year.
 */
export const AnnualReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 543);
  const [summary, setSummary] = useState<YearSummary | null>(null);
  const [exporting, setExporting] = useState(false);

  /**
   * Fetch all data and compute annual summary for the selected year.
   */
  const fetchData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [harvests, freshSales, processedProducts] = await Promise.all([
        HarvestService.getAll(user.uid),
        FreshSaleService.getAll(user.uid),
        ProcessedProductService.getAll(user.uid),
      ]);

      // Collect all available years
      const yearSet = new Set<number>();
      harvests.forEach(h => {
        if (h.harvestDate) {
          const y = new Date(h.harvestDate).getFullYear() + 543;
          yearSet.add(y);
        }
      });
      freshSales.forEach(s => yearSet.add(s.harvestYear));
      processedProducts.forEach(p => yearSet.add(p.harvestYear));
      if (yearSet.size === 0) yearSet.add(new Date().getFullYear() + 543);

      const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
      setYears(sortedYears);

      // If selectedYear is not in available years, pick the latest
      const yearToUse = sortedYears.includes(selectedYear) ? selectedYear : sortedYears[0];
      if (yearToUse !== selectedYear) setSelectedYear(yearToUse);

      // Filter data for selected year
      const yearHarvests = harvests.filter(h => {
        if (!h.harvestDate) return false;
        return (new Date(h.harvestDate).getFullYear() + 543) === yearToUse;
      });

      const yearFreshSales = freshSales.filter(s => s.harvestYear === yearToUse);
      const yearProcessed = processedProducts.filter(p => p.harvestYear === yearToUse);

      // Aggregate by variety
      const varietyMap = new Map<string, number>();
      yearHarvests.forEach(h => {
        const v = h.variety || 'ไม่ระบุ';
        varietyMap.set(v, (varietyMap.get(v) || 0) + (h.weightKg || 0));
      });
      const byVariety = Array.from(varietyMap.entries())
        .map(([variety, weightKg]) => ({ variety, weightKg }))
        .sort((a, b) => b.weightKg - a.weightKg);

      const totalHarvestKg = yearHarvests.reduce((s, h) => s + (h.weightKg || 0), 0);
      const harvestIncome = yearHarvests.reduce((s, h) => s + (h.income || 0), 0);
      const freshSaleKg = yearFreshSales.reduce((s, f) => s + (f.weightKg || 0), 0);
      const freshSaleIncome = yearFreshSales.reduce((s, f) => s + (f.totalIncome || 0), 0);
      const processedKg = yearProcessed.reduce((s, p) => s + (p.rawWeightKg || 0), 0);
      const processedIncome = yearProcessed.reduce((s, p) => s + (p.totalIncome || 0), 0);

      setSummary({
        year: yearToUse,
        totalHarvestKg,
        harvestEntries: yearHarvests.length,
        byVariety,
        freshSaleKg,
        freshSaleIncome,
        processedKg,
        processedIncome,
        totalIncome: harvestIncome + freshSaleIncome + processedIncome,
        productCount: yearProcessed.length,
      });
    } catch (err) {
      console.error('Error fetching annual report:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleExportPdf = async () => {
    if (!user?.uid || !summary) return;
    setExporting(true);
    try {
      const farms = await FarmService.getAll(user.uid);
      const harvests = await HarvestService.getAll(user.uid);

      const pdfFarms = farms.map((f: any) => ({
        id: f.id, name: f.name ?? '', area: f.area ?? 0,
        province: f.province ?? '-', district: f.district,
        altitude: f.altitude, variety: f.variety,
        treeCount: f.treeCount, latitude: f.latitude, longitude: f.longitude,
      }));
      const pdfHarvests = harvests.map((h: any) => ({
        id: h.id, farmName: h.farms?.name, harvestDate: h.harvestDate ?? '-',
        weightKg: h.weightKg ?? 0, pricePerKg: h.pricePerKg,
        quality: h.quality, notes: h.notes,
      }));

      const result = await generateAndShareReport(pdfFarms, pdfHarvests, {
        title: `รายงานสรุปรายปี พ.ศ. ${summary.year}`,
        generatedBy: user.displayName || user.email || undefined,
      });
      if (!result.success) {
        if (Platform.OS === 'web') {
          globalThis.alert?.(result.error);
        } else {
          showAlert('ข้อผิดพลาด', result.error);
        }
      }
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 1 });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>รายงานสรุปรายปี</Text>
          <TouchableOpacity onPress={handleExportPdf} disabled={exporting}>
            <Ionicons name="download-outline" size={24} color={exporting ? COLORS.textLight : COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Year selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                style={[styles.yearChip, selectedYear === y && styles.yearChipActive]}
                onPress={() => setSelectedYear(y)}
              >
                <Text style={[styles.yearText, selectedYear === y && styles.yearTextActive]}>
                  พ.ศ. {y}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
          ) : !summary ? (
            <Text style={styles.loadingText}>ยังไม่มีข้อมูล</Text>
          ) : (
            <>
              {/* Total harvest */}
              <View style={styles.heroCard}>
                <Text style={styles.heroLabel}>ผลผลิตรวม พ.ศ. {summary.year}</Text>
                <View style={styles.heroRow}>
                  <Text style={styles.heroValue}>{fmt(summary.totalHarvestKg)}</Text>
                  <Text style={styles.heroUnit}> กก.</Text>
                </View>
                <Text style={styles.heroSub}>{summary.harvestEntries} ครั้งเก็บเกี่ยว</Text>
              </View>

              {/* By variety */}
              {summary.byVariety.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>แยกตามสายพันธุ์</Text>
                  {summary.byVariety.map((v) => (
                    <View key={v.variety} style={styles.varietyRow}>
                      <Text style={styles.varietyName}>{v.variety}</Text>
                      <Text style={styles.varietyVal}>{fmt(v.weightKg)} กก.</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Fresh sales */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="leaf-outline" size={20} color={COLORS.success} />
                  <Text style={styles.cardTitle}> ขายผลสด</Text>
                </View>
                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>ปริมาณ</Text>
                    <Text style={styles.statVal}>{fmt(summary.freshSaleKg)} กก.</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>รายได้</Text>
                    <Text style={[styles.statVal, { color: COLORS.success }]}>฿{fmt(summary.freshSaleIncome)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddFreshSale')}>
                  <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.addBtnText}>เพิ่มข้อมูลขายผลสด</Text>
                </TouchableOpacity>
              </View>

              {/* Processed products */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="flask-outline" size={20} color={COLORS.secondary} />
                  <Text style={styles.cardTitle}> แปรรูป</Text>
                </View>
                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>ปริมาณเมล็ดดิบ</Text>
                    <Text style={styles.statVal}>{fmt(summary.processedKg)} กก.</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>รายได้</Text>
                    <Text style={[styles.statVal, { color: COLORS.secondary }]}>฿{fmt(summary.processedIncome)}</Text>
                  </View>
                </View>
                <Text style={styles.productCount}>{summary.productCount} ผลิตภัณฑ์</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddProcessedProduct')}>
                  <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.addBtnText}>เพิ่มผลิตภัณฑ์แปรรูป</Text>
                </TouchableOpacity>
              </View>

              {/* Total income */}
              <View style={[styles.heroCard, { backgroundColor: COLORS.primary }]}>
                <Text style={[styles.heroLabel, { color: 'rgba(255,255,255,0.7)' }]}>
                  รายได้รวมทั้งปี พ.ศ. {summary.year}
                </Text>
                <View style={styles.heroRow}>
                  <Text style={[styles.heroValue, { color: '#FFF' }]}>฿{fmt(summary.totalIncome)}</Text>
                </View>
                <Text style={[styles.heroSub, { color: 'rgba(255,255,255,0.6)' }]}>
                  ผลสด ฿{fmt(summary.freshSaleIncome)} + แปรรูป ฿{fmt(summary.processedIncome)} + เก็บเกี่ยว ฿{fmt(summary.totalIncome - summary.freshSaleIncome - summary.processedIncome)}
                </Text>
              </View>
            </>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  yearScroll: { marginBottom: SPACING.xl },
  yearChip: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.full, backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.borderLight, marginRight: SPACING.sm,
  },
  yearChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  yearText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  yearTextActive: { color: COLORS.white },
  loadingText: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xxxl },

  heroCard: {
    backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.xl,
    padding: SPACING.xxl, marginBottom: SPACING.lg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  heroLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  heroRow: { flexDirection: 'row', alignItems: 'baseline' },
  heroValue: { fontSize: 38, fontWeight: '700', color: COLORS.text },
  heroUnit: { fontSize: FONTS.sizes.xl, color: COLORS.textSecondary },
  heroSub: { fontSize: FONTS.sizes.sm, color: COLORS.textLight, marginTop: SPACING.sm, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },

  varietyRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  varietyName: { fontSize: FONTS.sizes.md, color: COLORS.text },
  varietyVal: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },

  statRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  statBox: {
    flex: 1, backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center',
  },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginBottom: SPACING.xs },
  statVal: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },

  productCount: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, paddingVertical: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  addBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.primary },
});
