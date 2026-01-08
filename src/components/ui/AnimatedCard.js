import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, TouchableOpacity } from 'react-native';
import { usePressAnimation, useFadeIn } from '../../hooks/usePressAnimation.js';
import theme from '../../theme/colors.js';

/**
 * Animated card wrapper with subtle press and fade-in animations
 */
const AnimatedCard = ({ 
  children, 
  onPress, 
  style, 
  delay = 0,
  animated = true,
  ...props 
}) => {
  const fadeOpacity = useFadeIn(300);
  const { scale, handlePressIn, handlePressOut } = usePressAnimation(0.98);
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [animated, delay, slideAnim]);

  const animatedStyle = animated ? {
    opacity: fadeOpacity,
    transform: [
      { translateY: slideAnim },
      { scale: onPress ? scale : 1 },
    ],
  } : {};

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={styles.card}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style, styles.card]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    // Base card styles can be overridden
  },
});

export default AnimatedCard;

