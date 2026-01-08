/**
 * Accessibility utilities for ensuring WCAG compliance
 */

import { getContrastRatio, meetsWCAGAA, getAccessibleTextColor, ensureAccessibleColor } from './colorContrast.js';

// Minimum contrast ratios (WCAG AA)
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5,    // Minimum for normal text
  LARGE_TEXT: 3.0,    // Minimum for large text (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7.0,     // WCAG AAA for normal text
  AAA_LARGE: 4.5,     // WCAG AAA for large text
};

// Touch target minimums (Apple HIG & Material Design)
export const TOUCH_TARGETS = {
  MINIMUM: 44,        // 44x44 points minimum
  RECOMMENDED: 48,    // 48x48 points recommended
};

// Text size minimums
export const TEXT_SIZES = {
  MINIMUM: 12,        // Absolute minimum readable size
  BODY: 16,          // Recommended body text
  LARGE: 18,         // Large text for better readability (18pt+ or 14pt+ bold)
};

/**
 * Check if color combination meets contrast requirements
 */
export const meetsContrastRatio = (foreground, background, isLargeText = false) => {
  return meetsWCAGAA(foreground, background, isLargeText);
};

/**
 * Ensure touch target meets minimum size
 */
export const ensureTouchTarget = (size) => {
  return Math.max(size, TOUCH_TARGETS.MINIMUM);
};

/**
 * Check if text size is considered "large" for WCAG purposes
 * Large text is 18pt+ regular or 14pt+ bold
 */
export const isLargeText = (fontSize, fontWeight = '400') => {
  const isBold = ['600', '700', '800', '900', 'bold'].includes(fontWeight.toString());
  return fontSize >= 18 || (fontSize >= 14 && isBold);
};

export default {
  CONTRAST_RATIOS,
  TOUCH_TARGETS,
  TEXT_SIZES,
  meetsContrastRatio,
  getAccessibleTextColor,
  ensureAccessibleColor,
  ensureTouchTarget,
  isLargeText,
  getContrastRatio,
};

