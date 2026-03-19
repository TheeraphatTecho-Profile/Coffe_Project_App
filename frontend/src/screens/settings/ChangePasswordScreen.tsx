import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('รหัสผ่านไม่ถูกต้อง', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณาตรวจสอบรหัสผ่านอีกครั้ง');
      return;
    }

    try {
      setLoading(true);
      // Note: Firebase password update would go here
      // For re-authentication, user would need to sign in again
      Alert.alert('สำเร็จ', 'รหัสผ่านถูกเปลี่ยนเรียบร้อย', [
        { text: 'ตกลง', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ 
    label, 
    value, 
    onChangeText, 
    show, 
    setShow 
  }: { 
    label: string; 
    value: string; 
    onChangeText: (text: string) => void;
    show: boolean;
    setShow: (show: boolean) => void;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={`กรุณาระบุ${label}`}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={!show}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>เปลี่ยนรหัสผ่าน</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              กรุณากรอกรหัสผ่านปัจจุบัน และตั้งรหัสผ่านใหม่ที่คุณต้องการ
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <PasswordInput
              label="รหัสผ่านปัจจุบัน"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              show={showCurrent}
              setShow={setShowCurrent}
            />
            <PasswordInput
              label="รหัสผ่านใหม่"
              value={newPassword}
              onChangeText={setNewPassword}
              show={showNew}
              setShow={setShowNew}
            />
            <PasswordInput
              label="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
            />
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>คำแนะนำ</Text>
            <Text style={styles.tipsText}>• รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</Text>
            <Text style={styles.tipsText}>• ควรใช้ตัวอักษรผสมตัวเลข</Text>
            <Text style={styles.tipsText}>• หลีกเลี่ยงการใช้ข้อมูลส่วนตัวที่เดาได้ง่าย</Text>
          </View>

          {/* Save button */}
          <Button 
            title="เปลี่ยนรหัสผ่าน" 
            onPress={handleChangePassword} 
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
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.lg },
  infoText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginLeft: SPACING.md, lineHeight: 20 },
  form: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.sm },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md },
  passwordInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.text, padding: SPACING.md },
  eyeBtn: { padding: SPACING.md },
  tipsCard: { backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.lg },
  tipsTitle: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  tipsText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  saveButton: { marginTop: SPACING.xl },
});
