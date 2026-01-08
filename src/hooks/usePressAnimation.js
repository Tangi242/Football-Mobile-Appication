import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Hook for subtle press animations on buttons and cards
 * Provides scale animation on press for better visual feedback
 */
export const usePressAnimation = (scaleTo = 0.97) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return {
    scale,
    handlePressIn,
    handlePressOut,
  };
};

/**
 * Hook for fade-in animation on card mount
 */
export const useFadeIn = (duration = 300) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, []);

  return opacity;
};

export default usePressAnimation;

