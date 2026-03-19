import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightLabel?: string;
  onRightLabelPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

/**
 * Reusable text input with label, error state, and password toggle.
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  rightLabel,
  onRightLabelPress,
  containerStyle,
  isPassword = false,
  style,
  ...props
}) => {
  const [secureEntry, setSecureEntry] = useState(isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      {(label || rightLabel) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {rightLabel && (
            <TouchableOpacity onPress={onRightLabelPress}>
              <Text style={styles.rightLabel}>{rightLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {icon && React.isValidElement(icon) && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : null, style]}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureEntry}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setSecureEntry(!secureEntry)}
          >
            <Ionicons
              name={secureEntry ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  rightLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minHeight: 52,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  iconContainer: {
    paddingLeft: SPACING.lg,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  inputWithIcon: {
    paddingLeft: SPACING.md,
  },
  eyeButton: {
    padding: SPACING.md,
    paddingRight: SPACING.lg,
  },
  error: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  hint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
