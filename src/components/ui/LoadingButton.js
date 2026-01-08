import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.js';
import { usePressAnimation } from '../../hooks/usePressAnimation.js';
import theme from '../../theme/colors.js';

/**
 * Professional button component with loading state and haptic feedback
 * Ensures minimum 44x44 touch target for accessibility
 */
const LoadingButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, secondary, outline
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { theme: appTheme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      minHeight: theme.touchTarget.minHeight,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      ...theme.shadows.sm,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        // Red for interactive buttons (Brave Warriors brand)
        return {
          ...baseStyle,
          backgroundColor: appTheme.colors.interactive || appTheme.colors.secondary,
        };
      case 'secondary':
        // Navy for secondary actions
        return {
          ...baseStyle,
          backgroundColor: appTheme.colors.primary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          // Red border for interactive outline buttons
          borderColor: appTheme.colors.interactive || appTheme.colors.secondary,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      ...theme.typography.body,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseStyle,
          color: theme.colors.white,
        };
      case 'outline':
        return {
          ...baseStyle,
          // Red text for interactive outline buttons
          color: appTheme.colors.interactive || appTheme.colors.secondary,
        };
      default:
        return baseStyle;
    }
  };

  const { scale, handlePressIn, handlePressOut } = usePressAnimation(0.96);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Subtle pulse animation for primary buttons
  useEffect(() => {
    if (variant === 'primary' && !disabled && !loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [variant, disabled, loading]);

  return (
    <Animated.View style={{ transform: [{ scale: disabled || loading ? 1 : scale }] }}>
      <TouchableOpacity
        style={[
          getButtonStyle(),
          disabled && { opacity: 0.5 },
          variant === 'primary' && !disabled && !loading && { transform: [{ scale: pulseAnim }] },
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.85}
        {...props}
      >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? (appTheme.colors.interactive || appTheme.colors.secondary) : theme.colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'outline' ? (appTheme.colors.interactive || appTheme.colors.secondary) : theme.colors.white}
            />
          )}
          <Text 
            style={[getTextStyle(), textStyle]}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.5}
            minimumFontSize={12}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'outline' ? (appTheme.colors.interactive || appTheme.colors.secondary) : theme.colors.white}
            />
          )}
        </>
      )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default LoadingButton;

