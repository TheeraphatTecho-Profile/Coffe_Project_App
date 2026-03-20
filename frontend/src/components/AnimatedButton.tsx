import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  View, 
  ViewStyle, 
  TextStyle,
  GestureResponderEvent 
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface AnimatedButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  customTextStyle?: TextStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  customTextStyle,
}) => {
  const { colors, animations, spacing, radius, typography } = useTheme();
  
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      ...animations.spring,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      ...animations.spring,
    }).start();
  };

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      overflow: 'hidden',
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? colors.textDisabled : colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? colors.textDisabled : colors.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? colors.textDisabled : colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: typography.weights.semibold as any,
      textAlign: 'center',
    };

    // Size text styles
    const sizeStyles = {
      small: { fontSize: typography.sizes.sm },
      medium: { fontSize: typography.sizes.md },
      large: { fontSize: typography.sizes.lg },
    };

    // Variant text styles
    const variantStyles = {
      primary: {
        color: colors.textOnPrimary,
      },
      secondary: {
        color: colors.textOnSecondary,
      },
      outline: {
        color: disabled ? colors.textDisabled : colors.primary,
      },
      ghost: {
        color: disabled ? colors.textDisabled : colors.primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const buttonStyle = getButtonStyles();
  const textStyle = getTextStyles();

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <Animated.View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: getTextStyles().color,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [{ rotate: '45deg' }],
            }}
          />
        ) : (
          <>
            {icon && (
              <View style={{ marginRight: spacing.sm }}>
                {icon}
              </View>
            )}
            <Text style={[textStyle, customTextStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
