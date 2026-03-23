import React, { useState, useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: any;
  textStyle?: any;
  formatValue?: (value: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  style,
  textStyle,
  formatValue = (val) => val.toLocaleString(),
}) => {
  const { colors, typography } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    
    previousValue.current = value;

    // Animate from start to end
    Animated.timing(animatedValue, {
      toValue: endValue,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Update display value during animation
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration]);

  const formattedValue = formatValue(displayValue);

  return (
    <Animated.Text
      style={[
        {
          fontSize: typography.sizes.xxl,
          fontWeight: typography.weights.bold as any,
          color: colors.text,
        },
        style,
        textStyle,
      ]}
    >
      {prefix}{formattedValue}{suffix}
    </Animated.Text>
  );
};

// Specialized counter components
export const WeightCounter: React.FC<{ value: number; style?: any }> = ({ value, style }) => (
  <AnimatedCounter
    value={value}
    suffix=" กก."
    formatValue={(val) => val.toLocaleString('th-TH', { maximumFractionDigits: 1 })}
    style={style}
  />
);

export const IncomeCounter: React.FC<{ value: number; style?: any }> = ({ value, style }) => (
  <AnimatedCounter
    value={value}
    prefix="฿"
    formatValue={(val) => val.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
    style={style}
  />
);

export const PercentageCounter: React.FC<{ value: number; style?: any }> = ({ value, style }) => (
  <AnimatedCounter
    value={value}
    suffix="%"
    formatValue={(val) => val.toLocaleString('th-TH', { maximumFractionDigits: 1 })}
    style={style}
  />
);

export const CountCounter: React.FC<{ value: number; style?: any }> = ({ value, style }) => (
  <AnimatedCounter
    value={value}
    formatValue={(val) => val.toLocaleString('th-TH')}
    style={style}
  />
);
