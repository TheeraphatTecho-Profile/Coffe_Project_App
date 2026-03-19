import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { COLORS, FONTS, SPACING } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

/**
 * Welcome/Landing screen with branding and login options.
 * Shows app logo, tagline, and sign-in buttons (Email + Google).
 */
export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        {/* Top branding section */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="cafe" size={48} color={COLORS.text} />
            </View>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={18} color={COLORS.white} />
            </View>
          </View>

          <Text style={styles.title}>สวนกาแฟเลย</Text>
          <Text style={styles.subtitle}>ดูแลสวนกาแฟอย่างมืออาชีพ</Text>

          <View style={styles.platformBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>LOEI SPECIALTY COFFEE PLATFORM</Text>
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

          <Button
            title="เข้าสู่ระบบด้วย Google"
            onPress={() => {
              // TODO: Implement Google sign-in
            }}
            variant="outline"
            icon={<Text style={styles.googleIcon}>G</Text>}
            style={styles.googleButton}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>ยังไม่มีบัญชี? </Text>
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              สมัครสมาชิก
            </Text>
          </View>

          <Text style={styles.versionText}>v2.4.0</Text>
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
  brandSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: SPACING.xxl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWarm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
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
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  googleButton: {
    backgroundColor: COLORS.white,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
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
  versionText: {
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
});
