import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext.js';
import theme from '../../theme/colors.js';

/**
 * Toast notification component for user feedback
 */
const Toast = ({ message, type = 'info', visible, onHide, duration = 3000 }) => {
  const { theme: appTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Fade in and slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        // Red for errors/alerts (Brave Warriors brand)
        return appTheme.colors.error || appTheme.colors.interactive || '#DC143C';
      case 'warning':
        // Gold for warnings (Brave Warriors brand)
        return appTheme.colors.warning || appTheme.colors.special || '#FFD700';
      default:
        // Navy for info
        return appTheme.colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: appTheme.colors.surface,
          borderLeftColor: getColor(),
        },
      ]}
    >
      <Ionicons name={getIcon()} size={24} color={getColor()} />
      <Text style={[styles.message, { color: appTheme.colors.textPrimary }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    gap: theme.spacing.sm,
    ...theme.shadows.lg,
    zIndex: 9999,
  },
  message: {
    ...theme.typography.bodySmall,
    flex: 1,
    fontWeight: '500',
  },
});

export default Toast;

