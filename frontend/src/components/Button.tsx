import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

/**
 * Reusable button component with multiple variants.
 * Supports primary (dark green), secondary, outline, and ghost styles.
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const buttonStyles = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    disabled && styles.labelDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <>
          {icon}
          <Text style={labelStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  variant_primary: {
    backgroundColor: COLORS.primary,
  },
  variant_secondary: {
    backgroundColor: COLORS.secondary,
  },
  variant_outline: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  variant_ghost: {
    backgroundColor: COLORS.transparent,
  },

  // Sizes
  size_sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
  },
  size_md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  size_lg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    minHeight: 54,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Labels
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  label_primary: {
    color: COLORS.textOnPrimary,
  },
  label_secondary: {
    color: COLORS.textOnPrimary,
  },
  label_outline: {
    color: COLORS.text,
  },
  label_ghost: {
    color: COLORS.primary,
  },

  // Label sizes
  labelSize_sm: {
    fontSize: FONTS.sizes.sm,
  },
  labelSize_md: {
    fontSize: FONTS.sizes.md,
  },
  labelSize_lg: {
    fontSize: FONTS.sizes.lg,
  },

  labelDisabled: {
    opacity: 0.7,
  },
});
