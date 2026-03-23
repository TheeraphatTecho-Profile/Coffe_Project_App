import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
  animationDuration?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animationDuration = 1000,
}) => {
  const { colors } = useTheme();
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animatedValue, animationDuration, useNativeDriver]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.gray200,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: colors.white,
            opacity: 0.7,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// Predefined skeleton components
export const TextSkeleton: React.FC<SkeletonLoaderProps> = (props) => (
  <SkeletonLoader height={16} borderRadius={4} {...props} />
);

export const TitleSkeleton: React.FC<SkeletonLoaderProps> = (props) => (
  <SkeletonLoader height={24} borderRadius={6} {...props} />
);

export const CardSkeleton: React.FC = () => {
  const { spacing, radius } = useTheme();
  
  return (
    <View
      style={{
        padding: spacing.lg,
        borderRadius: radius.lg,
        backgroundColor: '#FFFFFF',
        marginVertical: spacing.sm,
      }}
    >
      <View style={{ marginBottom: spacing.sm }}>
        <TitleSkeleton width="60%" />
      </View>
      <View style={{ marginBottom: spacing.md }}>
        <TextSkeleton />
      </View>
      <View style={{ marginBottom: spacing.md }}>
        <TextSkeleton width="80%" />
      </View>
      <View>
        <SkeletonLoader height={40} borderRadius={radius.md} />
      </View>
    </View>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </>
  );
};
