import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { showAlert } from '../../lib/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { UserProfileService, UserProfile, validateCitizenId } from '../../lib/userProfileService';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type GenderOption = 'male' | 'female' | 'other';

const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่นๆ' },
];

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [gender, setGender] = useState<GenderOption | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [farmerHouseholdId, setFarmerHouseholdId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [province, setProvince] = useState('เลย');
  const [district, setDistrict] = useState('');
  const [subDistrict, setSubDistrict] = useState('');

  // Validation state
  const [citizenIdError, setCitizenIdError] = useState('');

  /**
   * Load existing profile data from Firestore.
   */
  const loadProfile = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const profile = await UserProfileService.getProfile(user.uid);
      if (profile) {
        setFullName(profile.fullName || user.displayName || '');
        setGender(profile.gender || null);
        setDateOfBirth(profile.dateOfBirth || '');
        setCitizenId(profile.citizenId || '');
        setHouseNumber(profile.houseNumber || '');
        setFarmerHouseholdId(profile.farmerHouseholdId || '');
        setPhone(profile.phone || '');
        setEmail(profile.email || user.email || '');
        setProvince(profile.province || 'เลย');
        setDistrict(profile.district || '');
        setSubDistrict(profile.subDistrict || '');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Validate citizen ID format and uniqueness, then save profile.
   */
  const handleSave = async () => {
    if (!fullName.trim()) {
      showAlert('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อ-นามสกุล');
      return;
    }

    if (!user?.uid) {
      showAlert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    // Validate citizen ID if provided
    if (citizenId.trim()) {
      if (!validateCitizenId(citizenId.trim())) {
        setCitizenIdError('เลขบัตรประชาชนไม่ถูกต้อง (ต้องเป็นตัวเลข 13 หลัก)');
        return;
      }
      const available = await UserProfileService.isCitizenIdAvailable(citizenId.trim(), user.uid);
      if (!available) {
        setCitizenIdError('เลขบัตรประชาชนนี้ถูกใช้งานแล้ว');
        return;
      }
      setCitizenIdError('');
    }

    try {
      setSaving(true);
      await UserProfileService.saveProfile(user.uid, {
        fullName: fullName.trim(),
        gender,
        dateOfBirth: dateOfBirth.trim() || null,
        citizenId: citizenId.trim() || null,
        houseNumber: houseNumber.trim() || null,
        farmerHouseholdId: farmerHouseholdId.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        province: province.trim() || null,
        district: district.trim() || null,
        subDistrict: subDistrict.trim() || null,
      });

      showAlert('สำเร็จ', 'บันทึกข้อมูลโปรไฟล์เรียบร้อย', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Save profile error:', err);
      showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={COLORS.textLight} />
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>เปลี่ยนรูปโปรไฟล์</Text>
            </TouchableOpacity>
          </View>

          {/* Section: Personal info */}
          <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อ-นามสกุล <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="กรุณาระบุชื่อ-นามสกุล"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เพศ</Text>
              <View style={styles.chipRow}>
                {GENDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, gender === opt.value && styles.chipActive]}
                    onPress={() => setGender(opt.value)}
                  >
                    <Text style={[styles.chipText, gender === opt.value && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date of birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>วัน/เดือน/ปีเกิด (พ.ศ.)</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="เช่น 15/06/2530"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Citizen ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เลขบัตรประชาชน (13 หลัก)</Text>
              <TextInput
                style={[styles.input, citizenIdError ? styles.inputError : null]}
                value={citizenId}
                onChangeText={(t) => { setCitizenId(t); setCitizenIdError(''); }}
                placeholder="X-XXXX-XXXXX-XX-X"
                placeholderTextColor={COLORS.textLight}
                keyboardType="number-pad"
                maxLength={13}
              />
              {citizenIdError ? <Text style={styles.errorText}>{citizenIdError}</Text> : null}
            </View>

            {/* House number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เลขบ้าน</Text>
              <TextInput
                style={styles.input}
                value={houseNumber}
                onChangeText={setHouseNumber}
                placeholder="เช่น 123/4"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Farmer household ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>เลขที่เกษตรกร (ต่อครัวเรือน)</Text>
              <TextInput
                style={styles.input}
                value={farmerHouseholdId}
                onChangeText={setFarmerHouseholdId}
                placeholder="เลขที่เกษตรกร"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          {/* Section: Contact */}
          <Text style={styles.sectionTitle}>ข้อมูลติดต่อ</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>อีเมล</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                editable={false}
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>เบอร์โทรศัพท์</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="0XX-XXX-XXXX"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Section: Address */}
          <Text style={styles.sectionTitle}>ที่อยู่</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>จังหวัด</Text>
              <TextInput
                style={styles.input}
                value={province}
                onChangeText={setProvince}
                placeholder="จังหวัด"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>อำเภอ</Text>
                <TextInput
                  style={styles.input}
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="อำเภอ"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>ตำบล</Text>
                <TextInput
                  style={styles.input}
                  value={subDistrict}
                  onChangeText={setSubDistrict}
                  placeholder="ตำบล"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>
          </View>

          {/* Save button */}
          <Button
            title="บันทึกการเปลี่ยนแปลง"
            onPress={handleSave}
            loading={saving}
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
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.xxl },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surfaceWarm, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  changePhotoBtn: { paddingVertical: SPACING.sm },
  changePhotoText: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '600' },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
  form: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm },
  required: { color: COLORS.error },
  input: { fontSize: FONTS.sizes.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md },
  inputError: { borderColor: COLORS.error },
  inputDisabled: { backgroundColor: COLORS.surfaceWarm, color: COLORS.textLight },
  errorText: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginTop: SPACING.xs },
  chipRow: { flexDirection: 'row', gap: SPACING.sm },
  chip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.borderLight },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  row: { flexDirection: 'row', gap: SPACING.md },
  saveButton: { marginTop: SPACING.xl },
});
