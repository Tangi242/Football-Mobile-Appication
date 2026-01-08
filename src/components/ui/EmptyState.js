import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { usePressAnimation } from '../../hooks/usePressAnimation.js';
import theme from '../../theme/colors.js';

// Get icon color based on icon type for brand consistency
const getIconColor = (iconName) => {
  const icon = iconName?.toLowerCase() || '';
  // Red for interactive/action icons (Brave Warriors brand)
  if (icon.includes('ticket') || icon.includes('cart') || icon.includes('add') ||
    icon.includes('play') || icon.includes('arrow') || icon.includes('chevron')) {
    return theme.colors.interactive || theme.colors.error || '#DC143C';
  }
  // Gold for special/achievement icons
  if (icon.includes('trophy') || icon.includes('star') || icon.includes('medal') ||
    icon.includes('award') || icon.includes('ribbon')) {
    return theme.colors.special || '#FFD700';
  }
  // Navy for informational icons (default brand color)
  return theme.colors.primary;
};

// Friendly and motivational empty state messages
const EMPTY_MESSAGES = {
  default: {
    title: "Nothing here yet",
    subtitle: "Content will appear here soon. Check back later!",
  },
  matches: {
    title: "No matches scheduled",
    subtitle: "New fixtures will be added as they're announced. Stay tuned for exciting matchups!",
  },
  news: {
    title: "No news articles",
    subtitle: "Latest updates and stories will appear here. Check back soon for fresh content!",
  },
  tickets: {
    title: "No tickets yet",
    subtitle: "Browse upcoming matches and secure your spot in the stands. Your tickets will appear here once purchased!",
  },
  cart: {
    title: "Your cart is empty",
    subtitle: "Start shopping! Browse our official Ballr merchandise and add items to your cart.",
  },
  polls: {
    title: "No polls available",
    subtitle: "New fan polls will be added regularly. Your opinion matters—come back soon to vote!",
  },
  quizzes: {
    title: "No quizzes available",
    subtitle: "Test your football knowledge! New trivia quizzes will be added regularly. Challenge yourself and compete with other fans!",
  },
  predictions: {
    title: "No upcoming matches",
    subtitle: "New prediction challenges will appear here. Make your predictions and climb the leaderboard!",
  },
  reactions: {
    title: "No live matches",
    subtitle: "When matches are live or starting soon, you can react in real-time! Check back during match days to share your excitement.",
  },
};

const EmptyState = ({
  icon = 'football',
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  illustrationTone = 'brand', // brand | gold | navy | red
  messageType = 'default', // For predefined friendly messages
}) => {
  const iconColor = getIconColor(icon);
  const isSpecialIcon = icon?.toLowerCase().includes('trophy') || icon?.toLowerCase().includes('star') ||
    icon?.toLowerCase().includes('medal') || icon?.toLowerCase().includes('award');
  const toneMap = {
    brand: [theme.colors.primary, theme.colors.interactive || '#DC143C'],
    gold: [theme.colors.special || '#FFD700', theme.colors.specialDark || '#CCAA00'],
    navy: [theme.colors.primary, theme.colors.navyMedium || theme.colors.primary],
    red: [theme.colors.interactive || '#DC143C', theme.colors.redDark || '#B01030']
  };
  const gradientColors = toneMap[illustrationTone] || toneMap.brand;

  // Use predefined messages if title/subtitle not provided
  const defaultMessages = EMPTY_MESSAGES[messageType] || EMPTY_MESSAGES.default;
  const displayTitle = title !== undefined ? title : defaultMessages.title;
  const displaySubtitle = subtitle !== undefined ? subtitle : defaultMessages.subtitle;

  // Icon animation
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const { scale: buttonScale, handlePressIn, handlePressOut } = usePressAnimation(0.95);

  useEffect(() => {
    // Gentle bounce animation for icon
    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }),
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }),
        Animated.timing(iconRotation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const rotateInterpolate = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: iconScale },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        {isSpecialIcon ? (
          <LinearGradient
            colors={[theme.colors.special || '#FFD700', theme.colors.specialDark || '#CCAA00']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={icon} size={36} color={theme.colors.white} />
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={gradientColors}
            style={styles.iconBackgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.iconBackground, { borderColor: iconColor + '30' }]}>
              <Ionicons name={icon} size={36} color={iconColor} />
            </View>
          </LinearGradient>
        )}
      </Animated.View>
      <Text
        style={styles.title}
        allowFontScaling={true}
        maxFontSizeMultiplier={1.5}
        minimumFontSize={14}
        accessibilityRole="text"
      >
        {displayTitle}
      </Text>
      {displaySubtitle && (
        <Text
          style={styles.subtitle}
          allowFontScaling={true}
          maxFontSizeMultiplier={1.5}
          minimumFontSize={12}
          accessibilityRole="text"
        >
          {displaySubtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.interactive || theme.colors.error || '#DC143C' }]}
            onPress={onAction}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.85}
          >
            {actionIcon && (
              <Ionicons
                name={actionIcon}
                size={18}
                color={theme.colors.white}
                style={styles.actionIcon}
              />
            )}
            <Text
              style={styles.actionText}
              allowFontScaling={true}
              maxFontSizeMultiplier={1.5}
              minimumFontSize={12}
            >
              {actionLabel}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    width: '100%'
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3
  },
  iconBackgroundGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg
  },
  title: {
    marginTop: theme.spacing.sm,
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.textDark,
    textAlign: 'center',
    fontSize: 16, // Increased for better readability
    lineHeight: 22 // Improved line height
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300, // Slightly wider for better readability
    fontSize: 13, // Increased for better readability
    lineHeight: 18, // Improved line height
    paddingHorizontal: theme.spacing.md,
    fontWeight: '500',
    marginBottom: theme.spacing.md
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
    minHeight: 44, // Accessibility
    ...theme.shadows.sm
  },
  actionIcon: {
    marginRight: -4
  },
  actionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 13
  }
});

export default EmptyState;

