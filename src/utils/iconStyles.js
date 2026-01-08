import theme from '../theme/colors.js';

/**
 * Consistent icon styling utility
 * Ensures brand colors are applied consistently across the app
 */

// Standard icon sizes
export const ICON_SIZES = {
  tiny: 12,
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

/**
 * Get icon color based on context and brand guidelines
 * @param {string} context - The context/type of icon (interactive, info, success, warning, error, special)
 * @param {string} iconName - Optional icon name for specific color mapping
 * @returns {string} Color hex code
 */
export const getIconColor = (context = 'default', iconName = '') => {
  const icon = iconName?.toLowerCase() || '';

  // Interactive/Action icons - Red (Brave Warriors brand)
  if (context === 'interactive' || context === 'action' || 
      icon.includes('arrow') || icon.includes('chevron') || 
      icon.includes('play') || icon.includes('add') || 
      icon.includes('cart') || icon.includes('ticket') ||
      icon.includes('share') || icon.includes('send')) {
    return theme.colors.interactive || theme.colors.error || '#DC143C';
  }

  // Special/Achievement icons - Gold
  if (context === 'special' || context === 'achievement' ||
      icon.includes('trophy') || icon.includes('star') || 
      icon.includes('medal') || icon.includes('award') ||
      icon.includes('ribbon') || icon.includes('crown')) {
    return theme.colors.special || '#FFD700';
  }

  // Success icons - Green
  if (context === 'success' || icon.includes('check') || icon.includes('done')) {
    return '#10B981';
  }

  // Warning icons - Amber
  if (context === 'warning' || icon.includes('warning') || icon.includes('alert')) {
    return '#F59E0B';
  }

  // Error/Danger icons - Red
  if (context === 'error' || context === 'danger' || icon.includes('close') || icon.includes('remove')) {
    return '#EF4444';
  }

  // Info icons - Navy (default brand color)
  if (context === 'info' || icon.includes('info') || icon.includes('help')) {
    return theme.colors.primary;
  }

  // Default - Navy (Brave Warriors primary brand color)
  return theme.colors.primary;
};

/**
 * Get consistent icon props for common use cases
 */
export const getIconProps = (context = 'default', size = 'medium', iconName = '') => {
  return {
    size: typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.medium,
    color: getIconColor(context, iconName),
  };
};

export default {
  ICON_SIZES,
  getIconColor,
  getIconProps,
};










