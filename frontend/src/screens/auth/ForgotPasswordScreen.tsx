import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

/**
 * Forgot password screen - enter email to receive a reset link.
 */
export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSendLink = async () => {
    if (!email.trim()) {
      setError('กรุณาระบุอีเมล');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('กรุณาระบุอีเมลให้ถูกต้อง');
      return;
    }
    setError('');

    try {
      setLoading(true);
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
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
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="cafe" size={32} color={COLORS.text} />
              </View>
              <Text style={styles.brand}>สวนกาแฟเลย</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.title}>ลืมรหัสผ่าน</Text>
              <Text style={styles.subtitle}>
                ระบุอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
              </Text>

              {sent ? (
                <View style={styles.sentContainer}>
                  <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                  <Text style={styles.sentText}>
                    ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย
                  </Text>
                </View>
              ) : (
                <>
                  <Input
                    label="อีเมลของคุณ"
                    placeholder="example@email.com"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    error={error}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    icon={
                      <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
                    }
                  />

                  <Button
                    title="ส่งลิงก์"
                    onPress={handleSendLink}
                    loading={loading}
                    disabled={!email}
                  />
                </>
              )}

              <Text
                style={styles.backLink}
                onPress={() => navigation.navigate('Login')}
              >
                ← กลับไปหน้าเข้าสู่ระบบ
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerBrand}>PREMIUM LOEI COFFEE ESTATE</Text>
              <Text style={styles.footerCopy}>
                © 2567 สวนกาแฟเลย • วิถีเกษตรสมัยใหม่
              </Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  brand: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xxl,
    marginBottom: SPACING.xxxl,
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
    marginBottom: SPACING.xxl,
    lineHeight: 22,
  },
  sentContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
  },
  sentText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  backLink: {
    textAlign: 'center',
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: SPACING.xl,
  },
  footer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerBrand: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
    color: COLORS.textLight,
    letterSpacing: 2,
  },
  footerCopy: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
});
