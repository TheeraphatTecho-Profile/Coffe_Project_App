import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Animated wrapper that fades in children with optional delay.
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 400,
  style,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

interface ScaleOnPressProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Animated wrapper with scale effect for pressable items.
 */
export const ScaleOnPress: React.FC<ScaleOnPressProps> = ({ children, style }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[style, animatedStyle]}
      onTouchStart={() => {
        scale.value = withSpring(0.95, { damping: 10 });
      }}
      onTouchEnd={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
    >
      {children}
    </Animated.View>
  );
};

interface StaggerChildrenProps {
  children: React.ReactNode[];
  staggerMs?: number;
  style?: ViewStyle;
}

/**
 * Renders children with staggered fade-in animation.
 */
export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerMs = 100,
  style,
}) => {
  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child, index) => (
        <FadeInView delay={index * staggerMs} key={index}>
          {child}
        </FadeInView>
      ))}
    </Animated.View>
  );
};

/**
 * Pre-built entering/exiting animations for screens.
 */
export const ScreenAnimations = {
  fadeIn: FadeIn.duration(300),
  fadeInDown: FadeInDown.duration(400).springify(),
  fadeInUp: FadeInUp.duration(400).springify(),
  fadeOut: FadeOut.duration(200),
  slideInRight: SlideInRight.duration(300),
  slideOutLeft: SlideOutLeft.duration(300),
};
