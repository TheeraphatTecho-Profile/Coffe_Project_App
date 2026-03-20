import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { SocialAuthButtons } from '../../components/SocialAuthButtons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { signInWithLINE } from '../../lib/lineAuth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

/**
 * Welcome/Landing screen with branding and login options.
 * Shows app logo, tagline, and sign-in buttons (Email, Google, Facebook, LINE).
 */
export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) Alert.alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ', error.message);
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
      if (error) Alert.alert('เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ', error.message);
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
      if (error) Alert.alert('เข้าสู่ระบบด้วย LINE ไม่สำเร็จ', error.message);
    } catch (err) {
      console.error('LINE login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top branding section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="cafe" size={44} color={COLORS.primary} />
              </View>
            </View>

            <Text style={styles.title}>สวนกาแฟเลย</Text>
            <Text style={styles.subtitle}>ระบบจัดการสวนกาแฟอัจฉริยะ</Text>

            <View style={styles.platformBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>LOEI SPECIALTY COFFEE</Text>
            </View>
          </View>

          {/* Bottom action section */}
          <View style={styles.actionSection}>
            <Button
              title="เข้าสู่ระบบด้วยอีเมล"
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              icon={<Ionicons name="mail-outline" size={20} color={COLORS.white} />}
            />

            <SocialAuthButtons
              onGooglePress={handleGoogleLogin}
              onFacebookPress={handleFacebookLogin}
              onLinePress={handleLineLogin}
              loading={loading}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>ยังไม่มีบัญชี? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>สมัครสมาชิก</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>Suan Kafe Loei v2.4.0</Text>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  brandSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingTop: SPACING.xxxxl,
    minHeight: 300,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  actionSection: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
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
  versionText: {
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
});
