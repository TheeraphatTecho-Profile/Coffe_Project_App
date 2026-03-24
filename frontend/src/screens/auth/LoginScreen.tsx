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
import { showAlert } from '../../lib/alert';
import { isRateLimited, recordFailedAttempt, clearAttempts, formatLockoutMessage } from '../../lib/authRateLimit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SocialAuthButtons } from '../../components/SocialAuthButtons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { signInWithLINE } from '../../lib/lineAuth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

/**
 * Login screen with email/password form.
 * Includes validation, forgot password link, remember me, and social login options.
 */
export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuth();

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('กรุณาระบุอีเมล');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('กรุณาระบุอีเมลให้ถูกต้อง');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) return;
    if (!password) return;

    const { limited, retryAfterMs } = isRateLimited(email);
    if (limited) {
      showAlert('บัญชีถูกล็อก', formatLockoutMessage(retryAfterMs));
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) {
        const { limited: nowLimited, retryAfterMs: wait } = recordFailedAttempt(email);
        if (nowLimited) {
          showAlert('บัญชีถูกล็อกชั่วคราว', formatLockoutMessage(wait));
        } else {
          showAlert('เข้าสู่ระบบไม่สำเร็จ', error.message);
        }
      } else {
        clearAttempts(email);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
        showAlert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ', error.message);
      }
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithFacebook();
      if (error) {
        showAlert('เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ', error.message);
      }
    } catch (err) {
      console.error('Facebook login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithLINE();
      if (error) {
        showAlert('เข้าสู่ระบบด้วย LINE ไม่สำเร็จ', error.message);
      }
    } catch (err) {
      console.error('LINE login error:', err);
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>เข้าสู่ระบบ</Text>
              <Text style={styles.subtitle}>
                ยินดีต้อนรับกลับสู่ระบบจัดการสวนกาแฟเลย
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="อีเมล"
                placeholder="example@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                onBlur={() => validateEmail(email)}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="รหัสผ่าน"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoComplete="password"
              />

              {/* Remember me + Forgot password row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={13} color={COLORS.white} />
                    )}
                  </View>
                  <Text style={styles.rememberText}>จดจำรหัสผ่าน</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="เข้าสู่ระบบ"
                onPress={handleLogin}
                loading={loading}
                disabled={!email || !password}
                style={styles.loginButton}
              />
            </View>

            {/* Social login buttons */}
            <SocialAuthButtons
              onGooglePress={handleGoogleLogin}
              onFacebookPress={handleFacebookLogin}
              onLinePress={handleLineLogin}
              loading={loading}
            />

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>ยังไม่มีบัญชีผู้ใช้งาน? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>สร้างบัญชีใหม่</Text>
              </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  header: {
    marginBottom: SPACING.xxl,
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
  },
  form: {
    marginBottom: SPACING.xxl,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  forgotText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  loginButton: {
    marginTop: SPACING.xs,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  registerText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});
