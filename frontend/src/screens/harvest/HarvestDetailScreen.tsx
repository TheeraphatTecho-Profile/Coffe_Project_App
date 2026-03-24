import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HarvestStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { HarvestService, Harvest } from '../../lib/firebaseDb';

type Props = {
  navigation: NativeStackNavigationProp<HarvestStackParamList, 'HarvestDetail'>;
  route: RouteProp<{ params: { harvestId: string } }, 'params'>;
};

export const HarvestDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { harvestId } = route.params;
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Harvest>>({});

  useEffect(() => {
    fetchHarvest();
  }, [harvestId]);

  const fetchHarvest = async () => {
    try {
      const data = await HarvestService.getById(harvestId);
      if (data) {
        setHarvest(data);
        setEditData(data);
      }
    } catch (err) {
      console.error('Error fetching harvest:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'ลบรายการ',
      'คุณต้องการลบรายการผลผลิตนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await HarvestService.delete(harvestId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบได้');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      await HarvestService.update(harvestId, {
        harvestDate: editData.harvestDate,
        variety: editData.variety,
        weightKg: editData.weightKg,
        income: editData.income,
        shift: editData.shift,
        notes: editData.notes,
      });
      setHarvest(editData as any);
      setIsEditing(false);
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย');
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกได้');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatNumber = (n: number) => n.toLocaleString('th-TH');

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>กำลังโหลด...</Text>
      </View>
    );
  }

  if (!harvest) {
    return (
      <View style={styles.container}>
        <Text>ไม่พบข้อมูล</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'แก้ไข' : 'รายละเอียด'}</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons name={isEditing ? 'close' : 'create-outline'} size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Date card */}
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>วันที่เก็บเกี่ยว</Text>
            {isEditing ? (
              <TextInput
                style={styles.dateInput}
                value={editData.harvestDate || ''}
                onChangeText={(text: string) => setEditData({ ...editData, harvestDate: text })}
              />
            ) : (
              <Text style={styles.dateValue}>{formatDate(harvest.harvestDate)}</Text>
            )}
          </View>

          {/* Farm name */}
          <View style={styles.farmRow}>
            <Ionicons name="leaf" size={20} color={COLORS.primary} />
            <Text style={styles.farmLabel}>สวน: {harvest.farms?.name || '-'}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>น้ำหนัก</Text>
              {isEditing ? (
                <TextInput
                  style={styles.statInput}
                  value={editData.weightKg?.toString() || ''}
                  onChangeText={(text: string) => setEditData({ ...editData, weightKg: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={styles.statValue}>{formatNumber(harvest.weightKg)} กก.</Text>
              )}
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>รายได้</Text>
              {isEditing ? (
                <TextInput
                  style={styles.statInput}
                  value={editData.income?.toString() || ''}
                  onChangeText={(text: string) => setEditData({ ...editData, income: parseFloat(text) || 0 })}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Text style={[styles.statValue, { color: COLORS.secondary }]}>
                  ฿{formatNumber(harvest.income)}
                </Text>
              )}
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailCard}>
            <DetailRow 
              label="สายพันธุ์" 
              value={harvest.variety || '-'} 
              editable={isEditing}
              editValue={editData.variety || ''}
              onChange={(text: string) => setEditData({ ...editData, variety: text })}
            />
            <DetailRow 
              label="ช่วงเวลา" 
              value={harvest.shift || '-'} 
              editable={isEditing}
              editValue={editData.shift || ''}
              onChange={(text: string) => setEditData({ ...editData, shift: text })}
            />
            {harvest.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>หมายเหตุ</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.notesInput}
                    value={editData.notes || ''}
                    onChangeText={(text: string) => setEditData({ ...editData, notes: text })}
                    multiline
                  />
                ) : (
                  <Text style={styles.notesValue}>{harvest.notes}</Text>
                )}
              </View>
            )}
          </View>

          {/* Actions */}
          {isEditing ? (
            <View style={styles.actions}>
              <Button title="บันทึก" onPress={handleSave} />
              <Button title="ยกเลิก" onPress={() => { setIsEditing(false); setEditData(harvest); }} variant="outline" />
            </View>
          ) : (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.deleteText}>ลบรายการ</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const DetailRow = ({ label, value, editable, editValue, onChange }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    {editable ? (
      <TextInput style={styles.detailInput} value={editValue} onChangeText={onChange} />
    ) : (
      <Text style={styles.detailValue}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  headerTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  dateCard: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg },
  dateLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs },
  dateValue: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.white },
  dateInput: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.white, borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.5)' },
  farmRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  farmLabel: { fontSize: FONTS.sizes.md, color: COLORS.text, marginLeft: SPACING.sm },
  statsContainer: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  statBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginBottom: SPACING.xs },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  statInput: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  detailLabel: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  detailValue: { fontSize: FONTS.sizes.md, color: COLORS.text },
  detailInput: { fontSize: FONTS.sizes.md, color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.border, minWidth: 150, textAlign: 'right' },
  notesSection: { paddingTop: SPACING.md },
  notesLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  notesValue: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22 },
  notesInput: { fontSize: FONTS.sizes.md, color: COLORS.text, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md },
  actions: { gap: SPACING.md, marginTop: SPACING.xl },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.lg, marginTop: SPACING.xl },
  deleteText: { fontSize: FONTS.sizes.md, color: COLORS.error, marginLeft: SPACING.sm },
});
