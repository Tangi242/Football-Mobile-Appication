import { useMemo } from 'react';
import { PixelRatio } from 'react-native';

/**
 * Hook for accessibility utilities
 * Provides font scaling props and touch target helpers
 */
export const useAccessibility = () => {
  const fontScale = PixelRatio.getFontScale();

  // Default font scaling props for Text components
  const textProps = useMemo(() => ({
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5, // Prevent text from becoming too large
    minimumFontSize: 12, // Ensure text never becomes unreadable
  }), []);

  // Props for large text (headings, titles)
  const largeTextProps = useMemo(() => ({
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.3, // Slightly more restrictive for large text
    minimumFontSize: 16,
  }), []);

  // Props for small text (captions, labels)
  const smallTextProps = useMemo(() => ({
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5,
    minimumFontSize: 10,
  }), []);

  // Props for very small text (badges, metadata)
  const tinyTextProps = useMemo(() => ({
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.5,
    minimumFontSize: 8,
  }), []);

  // Ensure touch target meets minimum size
  const ensureTouchTarget = (size) => {
    return Math.max(size, 44);
  };

  return {
    fontScale,
    textProps,
    largeTextProps,
    smallTextProps,
    tinyTextProps,
    ensureTouchTarget,
  };
};

export default useAccessibility;










