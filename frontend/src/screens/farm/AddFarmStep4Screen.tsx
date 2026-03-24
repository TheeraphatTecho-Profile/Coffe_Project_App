import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { showAlert } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FarmStackParamList, FarmData } from '../../types/navigation';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { FarmService } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<FarmStackParamList, 'AddFarmStep4'>;
  route: { params: { farmData: Partial<FarmData> } };
};

type CoffeeVariety = 'arabica' | 'robusta' | 'other';

export const AddFarmStep4Screen: React.FC<Props> = ({ navigation, route }) => {
  const { farmData } = route.params || {};
  const { user } = useAuth();
  const [variety, setVariety] = useState<CoffeeVariety>('arabica');
  const [treeCount, setTreeCount] = useState('');
  const [plantingYear, setPlantingYear] = useState('2567');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!farmData?.name || !farmData?.area) {
      showAlert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลสวนให้ครบถ้วน');
      return;
    }

    if (!user?.uid) {
      showAlert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      setLoading(true);
      const irrigationsList = farmData.irrigations || [];
      await FarmService.create(user.uid, {
        name: farmData.name,
        area: farmData.area,
        soilType: farmData.soilType || null,
        waterSource: farmData.waterSource || null,
        waterDetail: farmData.waterDetail || null,
        hasWaterSource: !!(farmData.waterSource),
        irrigations: irrigationsList,
        hasIrrigation: irrigationsList.length > 0,
        province: farmData.province || 'เลย',
        district: farmData.district || null,
        subDistrict: farmData.subDistrict || null,
        altitude: farmData.altitude || null,
        latitude: farmData.latitude || null,
        longitude: farmData.longitude || null,
        variety: variety === 'arabica' ? 'Arabica' : variety === 'robusta' ? 'Robusta' : 'อื่นๆ',
        treeCount: treeCount ? parseInt(treeCount) : null,
        plantingYear: plantingYear ? parseInt(plantingYear) : null,
        notes: notes || null,
      });

      showAlert('สำเร็จ', 'บันทึกข้อมูลสวนเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.popToTop() }
      ]);
    } catch (err: any) {
      console.error('Save farm error:', err);
      showAlert('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกข้อมูลได้');
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
          <Text style={styles.headerTitle}>เพิ่มสวนใหม่</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>

          <Text style={styles.title}>รายละเอียดการปลูก</Text>
          <Text style={styles.subtitle}>ข้อมูลส่วนสุดท้ายเพื่อบันทึกสถิติการเติบโตและผลผลิตในอนาคต</Text>

          {/* Coffee variety */}
          <Text style={styles.fieldLabel}>สายพันธุ์กาแฟ</Text>
          <View style={styles.varietyRow}>
            {([
              { value: 'arabica' as CoffeeVariety, label: 'อาราบิก้า (Arabica)' },
              { value: 'robusta' as CoffeeVariety, label: 'โรบัสต้า (Robusta)' },
              { value: 'other' as CoffeeVariety, label: 'อื่น ๆ' },
            ]).map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.varietyChip, variety === item.value && styles.varietySelected]}
                onPress={() => setVariety(item.value)}
              >
                {variety === item.value && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                <Text style={[styles.varietyText, variety === item.value && styles.varietyTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tree count & planting year */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>จำนวนต้น</Text>
              <View style={styles.counterContainer}>
                <Text style={styles.counterValue}>{treeCount || '0'}</Text>
                <Text style={styles.counterUnit}>ต้น</Text>
              </View>
              <Input placeholder="0" value={treeCount} onChangeText={setTreeCount} keyboardType="number-pad" />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>ปีที่ปลูก</Text>
              <View style={styles.counterContainer}>
                <Text style={styles.counterValue}>{plantingYear}</Text>
                <Text style={styles.counterUnit}>พ.ศ.</Text>
              </View>
              <Input placeholder="2567" value={plantingYear} onChangeText={setPlantingYear} keyboardType="number-pad" />
            </View>
          </View>

          <Input
            label="หมายเหตุเพิ่มเติม (ถ้ามี)"
            placeholder="ระบุข้อมูลเพิ่มเติมเกี่ยวกับสภาพดิน หรือแหล่งต้นพันธุ์..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          {/* Tip */}
          <View style={styles.tipCard}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.tipText}>
              คำแนะนำ: ปีที่ปลูกช่วยให้เราคำนวณช่วงเวลาที่เหมาะสมในการใส่ปุ๋ยและเก็บเกี่ยวสำหรับกาแฟแต่ละสายพันธุ์ได้แม่นยำขึ้น
            </Text>
          </View>

          {/* Save button */}
          <Button 
            title="บันทึกและเสร็จสิ้น ✓" 
            onPress={handleSave} 
            loading={loading}
            style={styles.saveButton} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.editBackLink}>
            <Text style={styles.editBackText}>ย้อนกลับไปแก้ไข</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  headerTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xxl, paddingBottom: SPACING.xxxxl },
  progressBar: { height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2, marginBottom: SPACING.xxl },
  progressFill: { height: 4, backgroundColor: COLORS.secondary, borderRadius: 2 },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.xxl },
  fieldLabel: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.md },
  varietyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xxl },
  varietyChip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.borderLight },
  varietySelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  varietyText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  varietyTextSelected: { color: COLORS.white },
  row: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.lg },
  halfField: { flex: 1 },
  counterContainer: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm, marginBottom: SPACING.sm },
  counterValue: { fontSize: FONTS.sizes.xxxl, fontWeight: '700', color: COLORS.text },
  counterUnit: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  tipCard: { flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xxl },
  tipText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  saveButton: { marginBottom: SPACING.lg },
  editBackLink: { alignItems: 'center', paddingVertical: SPACING.md },
  editBackText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textDecorationLine: 'underline' },
});
