/**
 * Color contrast utilities for WCAG compliance
 * Calculates contrast ratios and ensures accessible color combinations
 */

/**
 * Calculate relative luminance of a color (0-1)
 * Based on WCAG 2.1 formula
 */
const getLuminance = (hex) => {
  // Remove # if present
  const rgb = hex.replace('#', '');
  
  // Convert to RGB values
  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rLinear, gLinear, bLinear] = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 (no contrast) and 21 (maximum contrast)
 * WCAG AA requires: 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA requires: 7:1 for normal text, 4.5:1 for large text
 */
export const getContrastRatio = (color1, color2) => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG requirements
 */
export const meetsWCAGAA = (foreground, background, isLargeText = false) => {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3.0 : 4.5;
  return ratio >= requiredRatio;
};

/**
 * Check if contrast ratio meets WCAG AAA requirements
 */
export const meetsWCAGAAA = (foreground, background, isLargeText = false) => {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 4.5 : 7.0;
  return ratio >= requiredRatio;
};

/**
 * Get accessible text color for a background
 * Returns dark text for light backgrounds, light text for dark backgrounds
 */
export const getAccessibleTextColor = (backgroundColor) => {
  const white = '#FFFFFF';
  const dark = '#0F172A';
  
  const contrastWithWhite = getContrastRatio(white, backgroundColor);
  const contrastWithDark = getContrastRatio(dark, backgroundColor);
  
  // Return the color with better contrast
  return contrastWithWhite > contrastWithDark ? white : dark;
};

/**
 * Ensure text color meets minimum contrast requirements
 * Adjusts color if needed to meet WCAG AA standards
 */
export const ensureAccessibleColor = (foreground, background, isLargeText = false) => {
  if (meetsWCAGAA(foreground, background, isLargeText)) {
    return foreground;
  }
  
  // If contrast is insufficient, return a color that meets requirements
  return getAccessibleTextColor(background);
};

// Pre-calculated contrast ratios for common color combinations
export const CONTRAST_RATIOS = {
  // Text on white background
  darkOnWhite: getContrastRatio('#0F172A', '#FFFFFF'), // 15.8:1 - AAA
  navyOnWhite: getContrastRatio('#1E3A5F', '#FFFFFF'), // ~8.5:1 - AAA
  grayOnWhite: getContrastRatio('#334155', '#FFFFFF'), // ~7.1:1 - AAA
  mutedOnWhite: getContrastRatio('#475569', '#FFFFFF'), // ~5.2:1 - AA
  
  // Text on red background
  whiteOnRed: getContrastRatio('#FFFFFF', '#DC143C'), // ~4.8:1 - AA (borderline)
  darkOnRed: getContrastRatio('#0F172A', '#DC143C'), // ~2.1:1 - Fails
  
  // Text on navy background
  whiteOnNavy: getContrastRatio('#FFFFFF', '#1E3A5F'), // ~8.5:1 - AAA
  lightOnNavy: getContrastRatio('#F8FAFC', '#1E3A5F'), // ~8.0:1 - AAA
  
  // Text on gold background
  darkOnGold: getContrastRatio('#0F172A', '#FFD700'), // ~9.5:1 - AAA
  navyOnGold: getContrastRatio('#1E3A5F', '#FFD700'), // ~4.8:1 - AA
};

export default {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getAccessibleTextColor,
  ensureAccessibleColor,
  CONTRAST_RATIOS,
};










