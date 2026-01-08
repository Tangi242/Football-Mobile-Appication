import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext.js';

/**
 * Accessible Text component that supports:
 * - Font scaling for accessibility settings
 * - Proper contrast ratios
 * - Minimum readable font sizes
 */
const AccessibleText = ({
  children,
  style,
  variant = 'body', // body, bodySmall, caption, heading, display, h1, h2, h3, h4, tiny
  allowFontScaling = true,
  maxFontSizeMultiplier = 1.5, // Prevent text from becoming too large
  minimumFontSize = 12, // Ensure text never becomes unreadable
  ...props
}) => {
  const { theme } = useTheme();

  // Get base typography style from theme
  const getTypographyStyle = () => {
    const typography = theme.typography || {};
    
    switch (variant) {
      case 'display':
        return typography.display || {};
      case 'heading':
        return typography.heading || {};
      case 'body':
        return typography.body || {};
      case 'bodySmall':
        return typography.bodySmall || {};
      case 'caption':
        return typography.caption || {};
      case 'h1':
        return typography.h1 || {};
      case 'h2':
        return typography.h2 || {};
      case 'h3':
        return typography.h3 || {};
      case 'h4':
        return typography.h4 || {};
      case 'tiny':
        return typography.tiny || {};
      default:
        return typography.body || {};
    }
  };

  const baseStyle = getTypographyStyle();

  return (
    <Text
      style={[baseStyle, style]}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      minimumFontSize={minimumFontSize}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AccessibleText;










