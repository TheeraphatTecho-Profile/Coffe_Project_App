import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FarmStackParamList, FarmData } from '../../types/navigation';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<FarmStackParamList, 'AddFarmStep1'>;
  route: { params: { farmData?: Partial<FarmData> } };
};

type SoilType = 'loam' | 'sandy' | 'loei_signature' | null;

/**
 * Add Farm Step 1 - Basic farm info: name, area size, and soil type.
 */
export const AddFarmStep1Screen: React.FC<Props> = ({ navigation, route }) => {
  const [farmName, setFarmName] = useState('');
  const [area, setArea] = useState('');
  const [soilType, setSoilType] = useState<SoilType>(null);

  const canProceed = farmName.trim() && area.trim() && soilType;

  const handleNext = () => {
    const farmData: Partial<FarmData> = {
      ...route.params?.farmData,
      name: farmName.trim(),
      area: parseFloat(area),
      soilType: soilType,
    };
    navigation.navigate('AddFarmStep2', { farmData });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="cafe" size={22} color={COLORS.text} />
            <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Step indicator */}
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>STEP 01</Text>
            </View>
            <Text style={styles.stepCount}>1 of 4</Text>

            <Text style={styles.title}>เริ่มสร้าง{'\n'}อาณาจักรกาแฟ</Text>
            <Text style={styles.subtitle}>
              ระบุข้อมูลพื้นฐานของสวนคุณ เพื่อเริ่มต้นการจัดการอย่างมืออาชีพ
            </Text>

            {/* Farm name */}
            <Input
              label="ชื่อสวน"
              placeholder="เช่น สวนภูเรือทอง"
              value={farmName}
              onChangeText={setFarmName}
              icon={<Ionicons name="flag-outline" size={18} color={COLORS.textLight} />}
            />

            {/* Area size */}
            <View style={styles.areaContainer}>
              <Input
                label="ขนาดพื้นที่ (ไร่)"
                placeholder="0.00"
                value={area}
                onChangeText={setArea}
                keyboardType="decimal-pad"
                icon={<Ionicons name="map-outline" size={18} color={COLORS.textLight} />}
              />
              <View style={styles.areaUnit}>
                <Text style={styles.areaUnitText}>ไร่</Text>
              </View>
            </View>

            {/* Soil type */}
            <Text style={styles.soilLabel}>
              <Ionicons name="earth-outline" size={16} color={COLORS.textSecondary} />
              {'  '}ประเภทดิน
            </Text>

            <View style={styles.soilRow}>
              <TouchableOpacity
                style={[styles.soilOption, soilType === 'loam' && styles.soilSelected]}
                onPress={() => setSoilType('loam')}
              >
                <Text style={styles.soilIcon}>🌿</Text>
                <Text style={[styles.soilText, soilType === 'loam' && styles.soilTextSelected]}>
                  ดินร่วน
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.soilOption, soilType === 'sandy' && styles.soilSelected]}
                onPress={() => setSoilType('sandy')}
              >
                <Text style={styles.soilIcon}>✨</Text>
                <Text style={[styles.soilText, soilType === 'sandy' && styles.soilTextSelected]}>
                  ดินปนทราย
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.signatureOption,
                soilType === 'loei_signature' && styles.signatureSelected,
              ]}
              onPress={() => setSoilType('loei_signature')}
            >
              <Ionicons name="diamond-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.signatureText}>ดินภูเขาเลย (Loei Signature)</Text>
            </TouchableOpacity>

            {/* Next button */}
            <Button
              title="ขั้นตอนต่อไป →"
              onPress={handleNext}
              disabled={!canProceed}
              style={styles.nextButton}
            />

            <Text style={styles.editNote}>
              คุณสามารถแก้ไขข้อมูลนี้ได้ภายหลังในหน้าการตั้งค่าสวน
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxxl,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  stepBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  stepCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    alignSelf: 'flex-end',
    marginTop: -SPACING.xl,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  areaContainer: {
    position: 'relative',
  },
  areaUnit: {
    position: 'absolute',
    right: SPACING.lg,
    top: 42,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  areaUnitText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  soilLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  soilRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  soilOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  soilSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.successLight,
  },
  soilIcon: {
    fontSize: 24,
  },
  soilText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  soilTextSelected: {
    color: COLORS.primary,
  },
  signatureOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.xxxl,
  },
  signatureSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.warningLight,
  },
  signatureText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  nextButton: {
    marginBottom: SPACING.lg,
  },
  editNote: {
    textAlign: 'center',
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});
