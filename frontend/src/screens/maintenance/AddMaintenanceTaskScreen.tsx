import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { Logo } from '../../components/Logo';
import { MaintenanceService, MaintenanceTask, MAINTENANCE_SCHEDULES } from '../../lib/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { Farm, FarmService } from '../../lib/firebaseDb';

interface RouteParams {
  date?: string;
  farmId?: string;
  type?: MaintenanceTask['type'];
}

export const AddMaintenanceTaskScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const { date: initialDate, farmId: initialFarmId, type: initialType } = route.params as RouteParams || {};
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>(initialFarmId || '');
  const [selectedType, setSelectedType] = useState<MaintenanceTask['type']>(initialType || 'pruning');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenanceTask['priority']>('medium');
  const [scheduledDate, setScheduledDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [estimatedDuration, setEstimatedDuration] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFarms();
    if (initialType) {
      const schedule = MAINTENANCE_SCHEDULES.find(s => s.type === initialType);
      if (schedule) {
        setTitle(schedule.title);
        setDescription(schedule.description);
        setPriority(schedule.priority);
        setEstimatedDuration(schedule.estimatedDuration.toString());
        setNotes(schedule.guidelines || '');
      }
    }
  }, [initialType]);

  const loadFarms = async () => {
    try {
      if (user?.uid) {
        const farmsData = await FarmService.getAll(user.uid);
        setFarms(farmsData);
        if (!initialFarmId && farmsData.length > 0) {
          setSelectedFarm(farmsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  };

  const getTypeInfo = (type: MaintenanceTask['type']) => {
    const typeInfo = {
      pruning: { icon: 'cut', color: '#FF6B6B', label: 'ตัดแต่ง' },
      fertilizing: { icon: 'leaf', color: '#4ECDC4', label: 'ใส่ปุ๋ย' },
      watering: { icon: 'water', color: '#45B7D1', label: 'ให้น้ำ' },
      harvesting: { icon: 'basket', color: '#FFA07A', label: 'เก็บเกี่ยว' },
      pest_control: { icon: 'bug', color: '#98D8C8', label: 'กำจัดศัตรู' },
      planting: { icon: 'flower', color: '#F7DC6F', label: 'ปลูกต้น' },
      other: { icon: 'ellipsis-horizontal', color: '#BDC3C7', label: 'อื่นๆ' },
    };
    return typeInfo[type] || typeInfo.other;
  };

  const getPriorityInfo = (priority: MaintenanceTask['priority']) => {
    const priorityInfo = {
      urgent: { icon: 'alert', color: '#E74C3C', label: 'เร่งด่วน' },
      high: { icon: 'arrow-up', color: '#F39C12', label: 'สูง' },
      medium: { icon: 'remove', color: '#3498DB', label: 'ปานกลาง' },
      low: { icon: 'arrow-down', color: '#95A5A6', label: 'ต่ำ' },
    };
    return priorityInfo[priority];
  };

  const validateForm = (): boolean => {
    if (!selectedFarm) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกสวน');
      return false;
    }
    if (!title.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อกิจกรรม');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรายละเอียด');
      return false;
    }
    if (!scheduledDate) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกวันที่');
      return false;
    }
    if (!estimatedDuration || parseFloat(estimatedDuration) <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกระยะเวลาที่ถูกต้อง');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.uid) return;

    setLoading(true);
    try {
      const taskData = {
        userId: user.uid,
        farmId: selectedFarm,
        title: title.trim(),
        description: description.trim(),
        type: selectedType,
        priority,
        status: 'pending' as const,
        scheduledDate,
        estimatedDuration: parseFloat(estimatedDuration),
        notes: notes.trim() || undefined,
      };

      await MaintenanceService.createTask(taskData);
      
      Alert.alert(
        'สำเร็จ',
        'บันทึกกำหนดการเรียบร้อยแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'เพิ่มอีก',
            onPress: () => {
              setTitle('');
              setDescription('');
              setNotes('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกกำหนดการได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>เพิ่มกำหนดการ</Text>
          <View style={styles.headerRight}>
            <Logo size="small" showText={false} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Farm Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เลือกสวน</Text>
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                style={[
                  styles.farmOption,
                  selectedFarm === farm.id && styles.farmOptionSelected
                ]}
                onPress={() => setSelectedFarm(farm.id)}
              >
                <View style={styles.farmOptionLeft}>
                  <Ionicons 
                    name="leaf" 
                    size={20} 
                    color={selectedFarm === farm.id ? colors.textOnPrimary : colors.primary} 
                  />
                  <Text style={[
                    styles.farmOptionText,
                    selectedFarm === farm.id && styles.farmOptionTextSelected
                  ]}>
                    {farm.name}
                  </Text>
                </View>
                {selectedFarm === farm.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.textOnPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Task Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ประเภทกิจกรรม</Text>
            <View style={styles.typeGrid}>
              {Object.entries({
                pruning: 'ตัดแต่ง',
                fertilizing: 'ใส่ปุ๋ย',
                watering: 'ให้น้ำ',
                harvesting: 'เก็บเกี่ยว',
                pest_control: 'กำจัดศัตรู',
                planting: 'ปลูกต้น',
                other: 'อื่นๆ',
              }).map(([type, label]) => {
                const typeInfo = getTypeInfo(type as MaintenanceTask['type']);
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      selectedType === type && styles.typeOptionSelected,
                      { backgroundColor: selectedType === type ? typeInfo.color : colors.surface }
                    ]}
                    onPress={() => setSelectedType(type as MaintenanceTask['type'])}
                  >
                    <Ionicons 
                      name={typeInfo.icon as any} 
                      size={24} 
                      color={selectedType === type ? colors.textOnPrimary : typeInfo.color} 
                    />
                    <Text style={[
                      styles.typeText,
                      selectedType === type && styles.typeTextSelected
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Priority Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ระดับความสำคัญ</Text>
            <View style={styles.priorityGrid}>
              {(['urgent', 'high', 'medium', 'low'] as const).map((prio) => {
                const prioInfo = getPriorityInfo(prio);
                return (
                  <TouchableOpacity
                    key={prio}
                    style={[
                      styles.priorityOption,
                      priority === prio && styles.priorityOptionSelected,
                      { backgroundColor: priority === prio ? prioInfo.color : colors.surface }
                    ]}
                    onPress={() => setPriority(prio)}
                  >
                    <Ionicons 
                      name={prioInfo.icon as any} 
                      size={20} 
                      color={priority === prio ? colors.textOnPrimary : prioInfo.color} 
                    />
                    <Text style={[
                      styles.priorityText,
                      priority === prio && styles.priorityTextSelected
                    ]}>
                      {prioInfo.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Task Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>รายละเอียดกิจกรรม</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อกิจกรรม</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="เช่น ตัดแต่งกิ่งที่แก่"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รายละเอียด</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="อธิบายรายละเอียดของกิจกรรม..."
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>วันที่</Text>
                <TextInput
                  style={styles.input}
                  value={scheduledDate}
                  onChangeText={setScheduledDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                <Text style={styles.inputLabel}>ระยะเวลา (ชม.)</Text>
                <TextInput
                  style={styles.input}
                  value={estimatedDuration}
                  onChangeText={setEstimatedDuration}
                  placeholder="1.0"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>บันทึกเพิ่มเติม (ไม่จำเป็น)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="ข้อมูลเพิ่มเติมหรือคำแนะนำ..."
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Submit Button */}
          <AnimatedButton
            title="บันทึกกำหนดการ"
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            size="large"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
  headerRight: { width: 32, height: 32 },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text, marginBottom: spacing.md },

  // Farm Selection
  farmOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  farmOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  farmOptionLeft: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  farmOptionText: {
    fontSize: typography.sizes.md, fontWeight: '500', color: colors.text,
  },
  farmOptionTextSelected: {
    color: colors.textOnPrimary,
  },

  // Type Selection
  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  typeOption: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: '22%', aspectRatio: 1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  typeOptionSelected: {
    borderWidth: 2,
  },
  typeText: {
    fontSize: typography.sizes.xs, fontWeight: '500', color: colors.text,
    marginTop: spacing.xs, textAlign: 'center',
  },
  typeTextSelected: {
    color: colors.textOnPrimary,
  },

  // Priority Selection
  priorityGrid: {
    flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm,
  },
  priorityOption: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  priorityOptionSelected: {
    borderWidth: 2,
  },
  priorityText: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
    marginTop: spacing.xs, textAlign: 'center',
  },
  priorityTextSelected: {
    color: colors.textOnPrimary,
  },

  // Input Fields
  inputGroup: { marginBottom: spacing.md },
  inputLabel: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: typography.sizes.md, color: colors.text,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  textArea: {
    height: 80, textAlignVertical: 'top',
  },
  inputRow: { flexDirection: 'row' },
});
