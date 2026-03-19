import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PasswordStrength } from '../../components/PasswordStrength';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

/**
 * Registration screen with name, email, password, confirm password, and T&C checkbox.
 * Includes password strength indicator and social signup options.
 */
export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'กรุณาระบุชื่อ-นามสกุล';
    if (!email.trim()) {
      newErrors.email = 'กรุณาระบุอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'กรุณาระบุอีเมลให้ถูกต้อง';
    }
    if (!password) {
      newErrors.password = 'กรุณาระบุรหัสผ่าน';
    } else if (password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }
    if (!acceptTerms) {
      newErrors.terms = 'กรุณายอมรับข้อตกลงและเงื่อนไข';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const { error } = await signUp(email, password, fullName);
      if (error) {
        Alert.alert('สมัครสมาชิกไม่สำเร็จ', error.message);
      } else {
        Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          {/* Header bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerLeft}>
              <Ionicons name="cafe" size={22} color={COLORS.text} />
              <Text style={styles.headerBrand}>สวนกาแฟเลย</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={26} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Journey badge */}
            <View style={styles.journeyBadge}>
              <Text style={styles.journeyText}>เริ่มต้นการเดินทาง</Text>
            </View>

            <Text style={styles.title}>สร้างบัญชีใหม่</Text>
            <Text style={styles.subtitle}>
              ร่วมเป็นส่วนหนึ่งของวิถีเกษตรกรกาแฟยุคใหม่จากเมืองเลย
            </Text>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="ชื่อ-นามสกุล"
                placeholder="พิมพ์ชื่อและนามสกุลของคุณ"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
                autoComplete="name"
              />

              <Input
                label="อีเมล"
                placeholder="example@gmail.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="รหัสผ่าน"
                placeholder="ตั้งรหัสผ่านของคุณ"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                isPassword
              />
              <PasswordStrength password={password} />

              <Input
                label="ยืนยันรหัสผ่านอีกครั้ง"
                placeholder="ยืนยันรหัสผ่าน"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={errors.confirmPassword}
                isPassword
              />

              {/* Terms checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  ฉันยอมรับ{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() =>
                      navigation.navigate('PrivacyPolicy', { mode: 'view' })
                    }
                  >
                    ข้อตกลงและเงื่อนไข
                  </Text>{' '}
                  ในการใช้งานแอปพลิเคชัน
                </Text>
              </TouchableOpacity>
              {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

              <Button
                title="สมัครสมาชิก →"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
              />
            </View>

            {/* Social signup divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>หรือสมัครผ่าน</Text>
              <View style={styles.divider} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={18} color="#4285F4" />
                <Text style={styles.socialLabel}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.socialButton, styles.socialFb]}>
                <Ionicons name="logo-facebook" size={18} color={COLORS.white} />
                <Text style={[styles.socialLabel, styles.socialFbLabel]}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>มีบัญชีผู้ใช้งานอยู่แล้ว? </Text>
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                เข้าสู่ระบบ
              </Text>
            </View>
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerBrand: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },
  journeyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  journeyText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  registerButton: {
    marginTop: SPACING.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  socialFb: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  socialLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  socialFbLabel: {
    color: COLORS.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
  },
});
