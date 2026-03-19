import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants';

interface PasswordStrengthProps {
  password: string;
}

/**
 * Displays a password strength indicator bar with label.
 */
export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: COLORS.border };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'อ่อน', color: COLORS.error };
    if (score <= 2) return { level: 2, label: 'ปานกลาง', color: COLORS.warning };
    if (score <= 3) return { level: 3, label: 'ปานกลาง', color: COLORS.warning };
    if (score <= 4) return { level: 4, label: 'แข็งแรง', color: COLORS.success };
    return { level: 5, label: 'แข็งแรงมาก', color: COLORS.success };
  };

  const { level, label, color } = getStrength();

  if (!password) return null;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { backgroundColor: i <= level ? color : COLORS.borderLight },
            ]}
          />
        ))}
      </View>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color }]}>
          รหัสผ่านระดับ: {label}
        </Text>
        {level < 4 && (
          <Text style={styles.hint}>ต้องการความปลอดภัยเพิ่ม</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  barContainer: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: SPACING.xs,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  hint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
});
