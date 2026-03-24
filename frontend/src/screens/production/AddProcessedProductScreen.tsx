import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { showAlert } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { FarmService } from '../../lib/firebaseDb';
import { ProcessedProductService } from '../../lib/productionService';
import { useAuth } from '../../context/AuthContext';

interface Farm { id: string; name: string; }

const PRODUCT_TYPES = [
  'กาแฟคั่วบด',
  'กาแฟคั่วเมล็ด',
  'กาแฟดริป',
  'กาแฟสำเร็จรูป',
  'กาแฟพร้อมดื่ม',
  'อื่นๆ',
];

/**
 * Screen to add a processed coffee product record.
 */
export const AddProcessedProductScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [harvestYear, setHarvestYear] = useState(String(new Date().getFullYear() + 543));
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('กาแฟคั่วบด');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('กก.');
  const [rawWeightKg, setRawWeightKg] = useState('');
  const [beanSource, setBeanSource] = useState('');
  const [isGI, setIsGI] = useState(false);
  const [salesChannel, setSalesChannel] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    FarmService.getAll(user.uid).then((data) => {
      setFarms(data);
      if (data.length > 0) setSelectedFarm(data[0].id);
    }).catch(() => {});
  }, [user]);

  const totalIncome = (parseFloat(quantity) || 0) * (parseFloat(pricePerUnit) || 0);

  const handleSave = async () => {
    if (!productName.trim() || !quantity) {
      showAlert('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อผลิตภัณฑ์และปริมาณ');
      return;
    }
    if (!user?.uid) { showAlert('กรุณาเข้าสู่ระบบก่อน'); return; }

    try {
      setLoading(true);
      await ProcessedProductService.create(user.uid, {
        farmId: selectedFarm,
        harvestYear: parseInt(harvestYear) || (new Date().getFullYear() + 543),
        productName: productName.trim(),
        productType,
        quantity: parseFloat(quantity) || 0,
        unit,
        rawWeightKg: parseFloat(rawWeightKg) || 0,
        beanSource: beanSource.trim() || null,
        isGI,
        salesChannel: salesChannel.trim() || null,
        pricePerUnit: parseFloat(pricePerUnit) || 0,
        totalIncome,
        notes: notes.trim() || null,
      });
      showAlert('สำเร็จ', 'บันทึกผลิตภัณฑ์แปรรูปเรียบร้อย', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.error('Save processed product error:', err);
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
          <Text style={styles.headerTitle}>เพิ่มผลิตภัณฑ์แปรรูป</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Farm selector */}
          <Text style={styles.fieldLabel}>สวนต้นทาง</Text>
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
          <Input label="ชื่อผลิตภัณฑ์ *" placeholder="เช่น กาแฟคั่วภูเรือ" value={productName} onChangeText={setProductName} />

          {/* Product type chips */}
          <Text style={styles.fieldLabel}>ชนิดผลิตภัณฑ์</Text>
          <View style={styles.typeRow}>
            {PRODUCT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, productType === t && styles.chipActive]}
                onPress={() => setProductType(t)}
              >
                <Text style={[styles.chipText, productType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="ปริมาณ *" placeholder="0" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="หน่วย" placeholder="กก." value={unit} onChangeText={setUnit} />
            </View>
          </View>

          <Input label="น้ำหนักเมล็ดดิบที่ใช้ (กก.)" placeholder="0" value={rawWeightKg} onChangeText={setRawWeightKg} keyboardType="decimal-pad" />
          <Input label="แหล่งที่มาของเมล็ดกาแฟ" placeholder="เช่น สวนภูเรือทอง" value={beanSource} onChangeText={setBeanSource} />

          {/* GI toggle */}
          <TouchableOpacity style={styles.giRow} onPress={() => setIsGI(!isGI)} activeOpacity={0.7}>
            <View style={[styles.checkbox, isGI && styles.checkboxChecked]}>
              {isGI && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
            </View>
            <Text style={styles.giLabel}>สิ่งบ่งชี้ทางภูมิศาสตร์ (GI)</Text>
          </TouchableOpacity>

          <Input label="สถานที่จำหน่าย" placeholder="เช่น ตลาดชุมชน, ออนไลน์" value={salesChannel} onChangeText={setSalesChannel} />
          <Input label="ราคาต่อหน่วย (บาท)" placeholder="0" value={pricePerUnit} onChangeText={setPricePerUnit} keyboardType="decimal-pad" />

          {/* Computed income */}
          <View style={styles.incomeCard}>
            <Text style={styles.incomeLabel}>รายได้รวม</Text>
            <Text style={styles.incomeValue}>฿{totalIncome.toLocaleString('th-TH', { maximumFractionDigits: 2 })}</Text>
          </View>

          <Input label="หมายเหตุ" placeholder="ข้อมูลเพิ่มเติม..." value={notes} onChangeText={setNotes} multiline style={{ minHeight: 70, textAlignVertical: 'top' }} />

          <Button title="บันทึกผลิตภัณฑ์แปรรูป" onPress={handleSave} loading={loading} style={styles.saveBtn} />
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
  chip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.borderLight, marginRight: SPACING.sm, marginBottom: SPACING.sm },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  row: { flexDirection: 'row', gap: SPACING.md },
  giRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg, marginTop: SPACING.sm },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  giLabel: { fontSize: FONTS.sizes.md, color: COLORS.text },
  incomeCard: { backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center' },
  incomeLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  incomeValue: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.primary },
  saveBtn: { marginTop: SPACING.xl },
});
