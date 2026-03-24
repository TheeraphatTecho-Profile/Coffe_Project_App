import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FarmStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { FarmService, Farm } from '../../lib/firebaseDb';

type Props = {
  navigation: NativeStackNavigationProp<FarmStackParamList, 'FarmDetail'>;
  route: RouteProp<{ params: { farmId: string } }, 'params'>;
};

export const FarmDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { farmId } = route.params;
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Farm>>({});

  useEffect(() => {
    fetchFarm();
  }, [farmId]);

  const fetchFarm = async () => {
    try {
      const data = await FarmService.getById(farmId);
      if (data) {
        setFarm(data);
        setEditData(data);
      }
    } catch (err) {
      console.error('Error fetching farm:', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสวนได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'ลบสวน',
      'คุณต้องการลบสวนนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await FarmService.delete(farmId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบสวนได้');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      await FarmService.update(farmId, {
        name: editData.name,
        area: editData.area,
        soil_type: editData.soil_type,
        water_source: editData.water_source,
        province: editData.province,
        district: editData.district,
        altitude: editData.altitude,
        variety: editData.variety,
        tree_count: editData.tree_count,
        planting_year: editData.planting_year,
        notes: editData.notes,
      });
      setFarm(editData as any);
      setIsEditing(false);
      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย');
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>กำลังโหลด...</Text>
      </View>
    );
  }

  if (!farm) {
    return (
      <View style={styles.container}>
        <Text>ไม่พบข้อมูลสวน</Text>
      </View>
    );
  }

  const InfoRow = ({ icon, label, value, editable = false }: { icon: string; label: string; value: string; editable?: boolean }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={styles.editInput}
            value={editData[label as keyof Farm]?.toString() || ''}
            onChangeText={(text) => setEditData({ ...editData, [label]: text })}
          />
        ) : (
          <Text style={styles.infoValue}>{value || '-'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'แก้ไขสวน' : 'รายละเอียดสวน'}</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons name={isEditing ? 'close' : 'create-outline'} size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Farm name */}
          <View style={styles.nameSection}>
            <View style={styles.farmIcon}>
              <Ionicons name="leaf" size={32} color={COLORS.primary} />
            </View>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editData.name || ''}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
              />
            ) : (
              <Text style={styles.farmName}>{farm.name}</Text>
            )}
          </View>

          {/* Info cards */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>ข้อมูลที่ตั้ง</Text>
            <InfoRow icon="resize" label="area" value={`${farm.area} ไร่`} editable />
            <InfoRow icon="location" label="province" value={farm.province} editable />
            <InfoRow icon="navigate" label="district" value={farm.district || '-'} editable />
            <InfoRow icon="speedometer" label="altitude" value={farm.altitude ? `${farm.altitude} เมตร` : '-'} editable />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>ข้อมูลการปลูก</Text>
            <InfoRow icon="leaf" label="variety" value={farm.variety || '-'} editable />
            <InfoRow icon="grid" label="tree_count" value={farm.tree_count ? `${farm.tree_count} ต้น` : '-'} editable />
            <InfoRow icon="calendar" label="planting_year" value={farm.planting_year ? `พ.ศ. ${farm.planting_year}` : '-'} editable />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>สภาพแวดล้อม</Text>
            <InfoRow icon="water" label="water_source" value={farm.water_source || '-'} editable />
            <InfoRow icon="layers" label="soil_type" value={farm.soil_type || '-'} editable />
          </View>

          {farm.notes && (
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>หมายเหตุ</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.editInput, { minHeight: 80, textAlignVertical: 'top' }]}
                  value={editData.notes || ''}
                  onChangeText={(text) => setEditData({ ...editData, notes: text })}
                  multiline
                />
              ) : (
                <Text style={styles.notesText}>{farm.notes}</Text>
              )}
            </View>
          )}

          {/* Action buttons */}
          {isEditing ? (
            <View style={styles.actionButtons}>
              <Button title="บันทึก" onPress={handleSave} style={styles.saveButton} />
              <Button title="ยกเลิก" onPress={() => { setIsEditing(false); setEditData(farm); }} variant="outline" />
            </View>
          ) : (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.deleteText}>ลบสวน</Text>
            </TouchableOpacity>
          )}
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
  infoValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  nameSection: { alignItems: 'center', paddingVertical: SPACING.xxl },
  farmIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surfaceWarm, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  farmName: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text },
  nameInput: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.primary, paddingBottom: SPACING.sm },
  infoCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.md, letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  infoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceWarm, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  infoContent: { flex: 1 },
  editInput: { fontSize: FONTS.sizes.md, color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.xs },
  notesText: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22 },
  actionButtons: { gap: SPACING.md, marginTop: SPACING.lg },
  saveButton: { marginBottom: SPACING.sm },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.lg, marginTop: SPACING.xl },
  deleteText: { fontSize: FONTS.sizes.md, color: COLORS.error, marginLeft: SPACING.sm },
});
