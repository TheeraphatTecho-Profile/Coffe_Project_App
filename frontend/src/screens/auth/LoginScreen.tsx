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
import { COLORS, FONTS, SPACING } from '../../constants';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

/**
 * Login screen with email/password form.
 * Includes validation, forgot password link, and social login options.
 */
export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
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

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error.message);
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
        Alert.alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ', error.message);
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
        Alert.alert('เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ', error.message);
      }
    } catch (err) {
      console.error('Facebook login error:', err);
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <Ionicons name="cafe" size={24} color={COLORS.text} />
                <Text style={styles.headerBrand}> สวนกาแฟเลย</Text>
              </View>

              <Text style={styles.title}>เข้าสู่ระบบ</Text>
              <Text style={styles.subtitle}>
                ยินดีต้อนรับกลับสู่ระบบจัดการไร่กาแฟของคุณ
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
                rightLabel="ลืมรหัสผ่าน?"
                onRightLabelPress={() => navigation.navigate('ForgotPassword')}
                autoComplete="password"
              />

              <Button
                title="เข้าสู่ระบบ"
                onPress={handleLogin}
                loading={loading}
                disabled={!email || !password}
                style={styles.loginButton}
              />
            </View>

            {/* Social login divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>หรือเข้าใช้งานด้วย</Text>
              <View style={styles.divider} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color={COLORS.text} />
                <Text style={styles.socialLabel}>GOOGLE</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, styles.socialButtonFb]}
                onPress={handleFacebookLogin}
                disabled={loading}
              >
                <Ionicons name="logo-facebook" size={22} color={COLORS.secondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.socialButton, styles.socialButtonLine]}
                disabled={loading}
              >
                <Text style={styles.socialLabelLine}>LINE</Text>
              </TouchableOpacity>
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>ยังไม่มีบัญชีผู้ใช้งาน? </Text>
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                สร้างบัญชีใหม่
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    marginBottom: SPACING.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  headerBrand: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
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
  loginButton: {
    marginTop: SPACING.md,
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
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  socialButtonFb: {
    // Same style, different icon
  },
  socialButtonLine: {
    backgroundColor: '#06C755',
    borderColor: '#06C755',
  },
  socialLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1,
  },
  socialLabelLine: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },
});
