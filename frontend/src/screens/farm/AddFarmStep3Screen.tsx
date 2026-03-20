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
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<FarmStackParamList, 'AddFarmStep3'>;
  route: { params: { farmData: Partial<FarmData> } };
};

type Altitude = 'low' | 'medium' | 'high' | null;

/**
 * Add Farm Step 3 - Location and altitude information.
 * Not shown in mockup but implied by 4-step flow.
 */
export const AddFarmStep3Screen: React.FC<Props> = ({ navigation, route }) => {
  const [altitude, setAltitude] = useState<Altitude>(null);
  const [province, setProvince] = useState('เลย');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');

  const handleNext = () => {
    const farmData: Partial<FarmData> = {
      ...route.params.farmData,
      province,
      district: district.trim() || null,
      altitude: altitude ? (altitude === 'low' ? 300 : altitude === 'medium' ? 600 : 900) : null,
    };
    navigation.navigate('AddFarmStep4', { farmData });
  };

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
          <Text style={styles.stepLabel}>STEP 03</Text>
          <Text style={styles.title}>ตำแหน่งและระดับความสูง</Text>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>

          {/* Province */}
          <Input
            label="จังหวัด"
            placeholder="จังหวัด"
            value={province}
            onChangeText={setProvince}
            icon={<Ionicons name="location-outline" size={18} color={COLORS.textLight} />}
          />

          {/* District */}
          <Input
            label="อำเภอ"
            placeholder="เช่น ภูเรือ, ด่านซ้าย"
            value={district}
            onChangeText={setDistrict}
          />

          {/* Sub-district */}
          <Input
            label="ตำบล"
            placeholder="เช่น ท่าศาลา"
            value={subDistrict}
            onChangeText={setSubDistrict}
          />

          {/* Altitude selection */}
          <Text style={styles.sectionTitle}>
            <Ionicons name="trending-up" size={18} color={COLORS.textSecondary} />
            {'  '}ระดับความสูงของสวน
          </Text>

          <View style={styles.altitudeGrid}>
            {([
              { value: 'low' as Altitude, label: 'ต่ำกว่า 600 ม.', desc: 'เหมาะกับ Robusta' },
              { value: 'medium' as Altitude, label: '600-900 ม.', desc: 'เหมาะกับ Arabica/Robusta' },
              { value: 'high' as Altitude, label: 'สูงกว่า 900 ม.', desc: 'เหมาะกับ Specialty Arabica' },
            ]).map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.altitudeCard,
                  altitude === item.value && styles.altitudeSelected,
                ]}
                onPress={() => setAltitude(item.value)}
              >
                <Ionicons
                  name="triangle-outline"
                  size={20}
                  color={altitude === item.value ? COLORS.primary : COLORS.textLight}
                />
                <Text style={[
                  styles.altitudeLabel,
                  altitude === item.value && styles.altitudeLabelSelected,
                ]}>
                  {item.label}
                </Text>
                <Text style={styles.altitudeDesc}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* GPS note */}
          <View style={styles.infoNote}>
            <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>
              คุณสามารถเพิ่มพิกัด GPS ได้ภายหลังจากหน้าตั้งค่าสวน เพื่อระบุตำแหน่งที่แน่นอน
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
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  altitudeGrid: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  altitudeCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  altitudeSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.successLight,
  },
  altitudeLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  altitudeLabelSelected: {
    color: COLORS.primary,
  },
  altitudeDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
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
