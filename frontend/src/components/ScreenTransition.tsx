import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type TransitionType = 'fade' | 'slideInRight' | 'slideInLeft' | 'slideInUp' | 'slideInDown';

interface ScreenTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  visible?: boolean;
  onAnimationComplete?: () => void;
}

export const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  visible = true,
  onAnimationComplete,
}) => {
  const { animations } = useTheme();
  const animatedValue = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    if (visible) {
      // Animation to show
      switch (type) {
        case 'fade':
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInRight':
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInLeft':
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInUp':
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInDown':
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
      }
    } else {
      // Animation to hide
      switch (type) {
        case 'fade':
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInRight':
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInLeft':
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInUp':
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
        case 'slideInDown':
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver,
          }).start(onAnimationComplete);
          break;
      }
    }
  }, [visible, type, duration, animatedValue, onAnimationComplete, useNativeDriver]);

  const getAnimationStyle = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: animatedValue,
        };
      case 'slideInRight':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      case 'slideInLeft':
        return {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      case 'slideInUp':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      case 'slideInDown':
        return {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            },
          ],
          opacity: animatedValue,
        };
      default:
        return { opacity: animatedValue };
    }
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, getAnimationStyle()]}>
      {children}
    </Animated.View>
  );
};

// Hook for staggered list animations
export const useStaggeredAnimation = (itemCount: number, delay = 100) => {
  const animations = useRef<Animated.Value[]>([]).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    // Initialize animations
    for (let i = 0; i < itemCount; i++) {
      animations[i] = new Animated.Value(0);
    }
  }, [itemCount]);

  const startAnimations = () => {
    const staggeredAnimations = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * delay,
        useNativeDriver,
      })
    );

    Animated.parallel(staggeredAnimations).start();
  };

  const resetAnimations = () => {
    const resetAnimations = animations.map((anim) =>
      Animated.timing(anim, {
        toValue: 0,
        duration: 0,
        useNativeDriver,
      })
    );

    Animated.parallel(resetAnimations).start();
  };

  return { animations, startAnimations, resetAnimations };
};

// Staggered list item component
interface StaggeredListItemProps {
  children: React.ReactNode;
  index: number;
  animationValue: Animated.Value;
  style?: any;
}

export const StaggeredListItem: React.FC<StaggeredListItemProps> = ({
  children,
  index,
  animationValue,
  style,
}) => {
  const animatedStyle = {
    transform: [
      {
        translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
    opacity: animationValue,
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
