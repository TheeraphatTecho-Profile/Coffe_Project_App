import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FarmStackParamList, FarmData } from '../../types/navigation';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { DropdownPicker } from '../../components/DropdownPicker';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<FarmStackParamList, 'AddFarmStep2'>;
  route: { params: { farmData: Partial<FarmData> } };
};

type WaterSource = 'river' | 'well' | 'rain' | 'reservoir';

interface IrrigationMethod {
  id: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

/**
 * Add Farm Step 2 - Water source and irrigation methods.
 */
export const AddFarmStep2Screen: React.FC<Props> = ({ navigation, route }) => {
  const [waterSource, setWaterSource] = useState<WaterSource>('river');
  const [waterDetail, setWaterDetail] = useState('');

  const handleNext = () => {
    const farmData: Partial<FarmData> = {
      ...route.params.farmData,
      waterSource: waterSource,
      waterDetail: waterDetail.trim(),
      irrigations: irrigations.filter(i => i.enabled).map(i => i.id),
    };
    navigation.navigate('AddFarmStep3', { farmData });
  };
  const [irrigations, setIrrigations] = useState<IrrigationMethod[]>([
    {
      id: 'drip',
      label: 'ระบบน้ำหยด',
      description: 'ประหยัดน้ำและให้ความชื้นสม่ำเสมอ',
      icon: 'water-outline',
      enabled: true,
    },
    {
      id: 'sprinkler',
      label: 'ระบบสปริงเกอร์',
      description: 'ครอบคลุมพื้นที่กว้างขวาง',
      icon: 'rainy-outline',
      enabled: false,
    },
    {
      id: 'manual',
      label: 'รดน้ำด้วยสายยาง/มือ',
      description: 'ดูแลเป็นจุดตามความต้องการ',
      icon: 'hand-left-outline',
      enabled: false,
    },
  ]);

  const toggleIrrigation = (id: string) => {
    setIrrigations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const WATER_SOURCES: { value: WaterSource; label: string }[] = [
    { value: 'river', label: 'แม่น้ำ / ลำห้วยธรรมชาติ' },
    { value: 'well', label: 'บ่อบาดาล / บ่อน้ำ' },
    { value: 'rain', label: 'น้ำฝน' },
    { value: 'reservoir', label: 'อ่างเก็บน้ำ / สระน้ำ' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>เพิ่มสวนใหม่</Text>
          <Text style={styles.headerBrand}>สวนกาแฟเลย</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step indicator */}
          <Text style={styles.stepLabel}>STEP 02</Text>

          <Text style={styles.title}>แหล่งน้ำและการชลประทาน</Text>

          {/* Progress dots */}
          <View style={styles.progressRow}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  step <= 2 ? styles.progressDotActive : styles.progressDotInactive,
                ]}
              />
            ))}
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>

          {/* Water source section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="water" size={22} color={COLORS.secondary} />
              <Text style={styles.sectionTitle}> แหล่งน้ำหลัก</Text>
              <View style={styles.waterIcon}>
                <Ionicons name="cloud-outline" size={20} color={COLORS.textLight} />
              </View>
            </View>

            <DropdownPicker
              label="ชื่อแหล่งน้ำหรือประเภท"
              options={WATER_SOURCES.map((s) => ({ value: s.value, label: s.label }))}
              selectedValue={waterSource}
              onValueChange={(val) => setWaterSource(val as WaterSource)}
            />

            <Input
              label="รายละเอียดเพิ่มเติม (ถ้ามี)"
              placeholder="เช่น ห้วยน้ำเลย, สระหลังบ้าน"
              value={waterDetail}
              onChangeText={setWaterDetail}
            />
          </View>

          {/* Irrigation methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>วิธีการรดน้ำ</Text>

            {irrigations.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.irrigationCard}
                onPress={() => toggleIrrigation(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.irrigationLeft}>
                  <View style={[
                    styles.irrigationIcon,
                    method.enabled && styles.irrigationIconActive,
                  ]}>
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={method.enabled ? COLORS.primary : COLORS.textLight}
                    />
                  </View>
                  <View style={styles.irrigationText}>
                    <Text style={styles.irrigationLabel}>{method.label}</Text>
                    <Text style={styles.irrigationDesc}>{method.description}</Text>
                  </View>
                </View>

                {/* Toggle switch */}
                <View style={[styles.toggle, method.enabled && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, method.enabled && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>
              ข้อมูลนี้จะช่วยให้ระบบแนะนำตารางการรดน้ำที่เหมาะสมตามสภาพอากาศในจังหวัดเลยและพันธุ์กาแฟที่คุณปลูก
            </Text>
          </View>
        </ScrollView>

        {/* Bottom buttons */}
        <View style={styles.bottomBar}>
          <Button
            title="ย้อนกลับ"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="md"
            fullWidth={false}
            style={styles.backButton}
            icon={<Ionicons name="chevron-back" size={16} color={COLORS.text} />}
          />
          <Button
            title="ดำเนินการต่อ >"
            onPress={handleNext}
            size="md"
            fullWidth={false}
            style={styles.nextButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerBrand: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  stepLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.secondary,
  },
  progressDotInactive: {
    backgroundColor: COLORS.borderLight,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    marginBottom: SPACING.xxl,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  waterIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  selectValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  irrigationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  irrigationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  irrigationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  irrigationIconActive: {
    backgroundColor: COLORS.successLight,
  },
  irrigationText: {
    flex: 1,
  },
  irrigationLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  irrigationDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  infoNote: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  backButton: {
    flex: 0.4,
  },
  nextButton: {
    flex: 0.6,
  },
});
