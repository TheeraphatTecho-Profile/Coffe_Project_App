import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

/**
 * Brand colors for social login providers.
 */
const BRAND = {
  google: '#4285F4',
  facebook: '#1877F2',
  line: '#06C755',
} as const;

interface SocialAuthButtonsProps {
  onGooglePress: () => void;
  onFacebookPress: () => void;
  onLinePress: () => void;
  loading?: boolean;
  label?: string;
}

/**
 * Reusable social authentication buttons group.
 * Renders Google, Facebook, and LINE buttons with brand icons and colors.
 * Used on Welcome, Login, and Register screens.
 */
export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGooglePress,
  onFacebookPress,
  onLinePress,
  loading = false,
  label = 'หรือเข้าใช้งานด้วย',
}) => {
  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{label}</Text>
        <View style={styles.divider} />
      </View>

      {/* Google */}
      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton]}
        onPress={onGooglePress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.text} />
        ) : (
          <>
            <View style={styles.googleIconWrap}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleLabel}>เข้าสู่ระบบด้วย Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Facebook */}
      <TouchableOpacity
        style={[styles.socialButton, styles.facebookButton]}
        onPress={onFacebookPress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="logo-facebook" size={20} color={COLORS.white} />
            <Text style={styles.facebookLabel}>เข้าสู่ระบบด้วย Facebook</Text>
          </>
        )}
      </TouchableOpacity>

      {/* LINE */}
      <TouchableOpacity
        style={[styles.socialButton, styles.lineButton]}
        onPress={onLinePress}
        disabled={loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <View style={styles.lineIconWrap}>
              <Text style={styles.lineIcon}>L</Text>
            </View>
            <Text style={styles.lineLabel}>เข้าสู่ระบบด้วย LINE</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.lg,
  },

  // Shared button style
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    minHeight: 50,
  },

  // Google
  googleButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  googleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND.google,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  googleLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Facebook
  facebookButton: {
    backgroundColor: BRAND.facebook,
  },
  facebookLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },

  // LINE
  lineButton: {
    backgroundColor: BRAND.line,
  },
  lineIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  lineLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});
