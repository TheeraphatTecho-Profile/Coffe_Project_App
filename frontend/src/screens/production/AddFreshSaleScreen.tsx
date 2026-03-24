import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { showAlert } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { FarmService } from '../../lib/firebaseDb';
import { FreshSaleService } from '../../lib/productionService';
import { useAuth } from '../../context/AuthContext';

interface Farm { id: string; name: string; }

/**
 * Screen to add a fresh coffee cherry sale record.
 */
export const AddFreshSaleScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [harvestYear, setHarvestYear] = useState(String(new Date().getFullYear() + 543));
  const [variety, setVariety] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    FarmService.getAll(user.uid).then((data) => {
      setFarms(data);
      if (data.length > 0) setSelectedFarm(data[0].id);
    }).catch(() => {});
  }, [user]);

  const totalIncome = (parseFloat(weightKg) || 0) * (parseFloat(pricePerKg) || 0);

  const handleSave = async () => {
    if (!selectedFarm || !weightKg || !pricePerKg) {
      showAlert('ข้อมูลไม่ครบ', 'กรุณาระบุสวน น้ำหนัก และราคาต่อกก.');
      return;
    }
    if (!user?.uid) { showAlert('กรุณาเข้าสู่ระบบก่อน'); return; }

    try {
      setLoading(true);
      await FreshSaleService.create(user.uid, {
        farmId: selectedFarm,
        harvestYear: parseInt(harvestYear) || (new Date().getFullYear() + 543),
        variety: variety || null,
        weightKg: parseFloat(weightKg) || 0,
        pricePerKg: parseFloat(pricePerKg) || 0,
        totalIncome,
        buyerName: buyerName || null,
        saleDate,
        notes: notes || null,
      });
      showAlert('สำเร็จ', 'บันทึกข้อมูลขายผลสดเรียบร้อย', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Save fresh sale error:', err);
      showAlert('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>เพิ่มข้อมูลขายผลสด</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Farm selector */}
          <Text style={styles.fieldLabel}>เลือกสวน</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {farms.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.chip, selectedFarm === f.id && styles.chipActive]}
                onPress={() => setSelectedFarm(f.id)}
              >
                <Text style={[styles.chipText, selectedFarm === f.id && styles.chipTextActive]}>{f.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input label="ปีการผลิต (พ.ศ.)" value={harvestYear} onChangeText={setHarvestYear} keyboardType="number-pad" />
          <Input label="สายพันธุ์" placeholder="เช่น อาราบิก้า" value={variety} onChangeText={setVariety} />
          <Input label="น้ำหนักที่ขาย (กก.)" placeholder="0" value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" />
          <Input label="ราคาต่อกก. (บาท)" placeholder="0" value={pricePerKg} onChangeText={setPricePerKg} keyboardType="decimal-pad" />

          {/* Computed income */}
          <View style={styles.incomeCard}>
            <Text style={styles.incomeLabel}>รายได้รวม</Text>
            <Text style={styles.incomeValue}>฿{totalIncome.toLocaleString('th-TH', { maximumFractionDigits: 2 })}</Text>
          </View>

          <Input label="ผู้ซื้อ / ช่องทาง" placeholder="ชื่อผู้ซื้อหรือร้านค้า" value={buyerName} onChangeText={setBuyerName} />
          <Input label="วันที่ขาย" placeholder="YYYY-MM-DD" value={saleDate} onChangeText={setSaleDate} />
          <Input label="หมายเหตุ" placeholder="ข้อมูลเพิ่มเติม..." value={notes} onChangeText={setNotes} multiline style={{ minHeight: 70, textAlignVertical: 'top' }} />

          <Button title="บันทึกข้อมูลขายผลสด" onPress={handleSave} loading={loading} style={styles.saveBtn} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  fieldLabel: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.md, marginTop: SPACING.md },
  chipScroll: { marginBottom: SPACING.lg },
  chip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.borderLight, marginRight: SPACING.sm },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  incomeCard: { backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center' },
  incomeLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  incomeValue: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.primary },
  saveBtn: { marginTop: SPACING.xl },
});
