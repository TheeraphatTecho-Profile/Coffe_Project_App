import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants';

interface SplashAnimationProps {
  onFinish: () => void;
}

/**
 * Animated splash screen with coffee icon animation.
 * Shows app branding before transitioning to the main app.
 */
export const SplashAnimation: React.FC<SplashAnimationProps> = ({ onFinish }) => {
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Step 1: Icon bounces in
    iconScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    iconRotate.value = withSequence(
      withTiming(10, { duration: 200 }),
      withTiming(-10, { duration: 200 }),
      withTiming(0, { duration: 200 }),
    );

    // Step 2: Title fades in
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));

    // Step 3: Subtitle fades in
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    // Step 4: Fade out entire splash
    containerOpacity.value = withDelay(2000, withTiming(0, {
      duration: 400,
      easing: Easing.in(Easing.ease),
    }));

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={iconStyle}>
        <View style={styles.iconCircle}>
          <Ionicons name="cafe" size={48} color={COLORS.white} />
        </View>
      </Animated.View>

      <Animated.View style={titleStyle}>
        <Text style={styles.title}>สวนกาแฟเลย</Text>
      </Animated.View>

      <Animated.View style={subtitleStyle}>
        <Text style={styles.subtitle}>Coffee Farm Management</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.8)',
  },
});
