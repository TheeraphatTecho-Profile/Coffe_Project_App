import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HarvestStackParamList } from '../../types/navigation';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { FarmService, HarvestService } from '../../lib/firebaseDb';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<HarvestStackParamList, 'AddHarvest'>;
};

interface Farm {
  id: string;
  name: string;
}

export const AddHarvestScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [variety, setVariety] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [income, setIncome] = useState('');
  const [shift, setShift] = useState<'เช้า' | 'เย็น'>('เช้า');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    if (!user?.uid) return;
    try {
      const data = await FarmService.getAll(user.uid);
      setFarms(data);
      if (data.length > 0) {
        setSelectedFarm(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching farms:', err);
    }
  };

  const handleSave = async () => {
    if (!selectedFarm || !harvestDate || !weightKg) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (!user?.uid) {
      Alert.alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      setLoading(true);
      await HarvestService.create(user.uid, {
        farm_id: selectedFarm,
        harvest_date: harvestDate,
        variety: variety || null,
        weight_kg: parseFloat(weightKg) || 0,
        income: income ? parseFloat(income) : 0,
        shift: shift,
        notes: notes || null,
      });

      Alert.alert('สำเร็จ', 'บันทึกข้อมูลผลผลิตเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.error('Save harvest error:', err);
      Alert.alert('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถบันทึกข้อมูลได้');
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
          <Text style={styles.headerTitle}>เพิ่มผลผลิต</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Farm selector */}
          <Text style={styles.fieldLabel}>เลือกสวน</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.farmSelector}>
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                style={[styles.farmChip, selectedFarm === farm.id && styles.farmChipSelected]}
                onPress={() => setSelectedFarm(farm.id)}
              >
                <Text style={[styles.farmChipText, selectedFarm === farm.id && styles.farmChipTextSelected]}>
                  {farm.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Harvest date */}
          <Input
            label="วันที่เก็บเกี่ยว"
            placeholder="YYYY-MM-DD"
            value={harvestDate}
            onChangeText={setHarvestDate}
          />

          {/* Variety */}
          <Input
            label="สายพันธุ์"
            placeholder="เช่น อาราบิก้า โรบัสต้า"
            value={variety}
            onChangeText={setVariety}
          />

          {/* Weight */}
          <Input
            label="น้ำหนัก (กก.)"
            placeholder="0"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
          />

          {/* Income */}
          <Input
            label="รายได้ (บาท)"
            placeholder="0"
            value={income}
            onChangeText={setIncome}
            keyboardType="decimal-pad"
          />

          {/* Shift */}
          <Text style={styles.fieldLabel}>ช่วงเวลา</Text>
          <View style={styles.shiftRow}>
            <TouchableOpacity
              style={[styles.shiftChip, shift === 'เช้า' && styles.shiftChipSelected]}
              onPress={() => setShift('เช้า')}
            >
              <Text style={[styles.shiftText, shift === 'เช้า' && styles.shiftTextSelected]}>เช้า</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shiftChip, shift === 'เย็น' && styles.shiftChipSelected]}
              onPress={() => setShift('เย็น')}
            >
              <Text style={[styles.shiftText, shift === 'เย็น' && styles.shiftTextSelected]}>เย็น</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <Input
            label="หมายเหตุ (ถ้ามี)"
            placeholder="ระบุข้อมูลเพิ่มเติม..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          {/* Save button */}
          <Button
            title="บันทึกผลผลิต"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
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
  fieldLabel: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text, marginBottom: SPACING.md, marginTop: SPACING.md },
  farmSelector: { marginBottom: SPACING.lg },
  farmChip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.borderLight, marginRight: SPACING.sm },
  farmChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  farmChipText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  farmChipTextSelected: { color: COLORS.white },
  shiftRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xxl },
  shiftChip: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.borderLight, alignItems: 'center' },
  shiftChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  shiftText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textSecondary },
  shiftTextSelected: { color: COLORS.white },
  saveButton: { marginTop: SPACING.xl },
});
