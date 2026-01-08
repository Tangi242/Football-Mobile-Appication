/**
 * Professional Design System for NFA Mobile App
 * Ensures consistency, accessibility, and visual appeal
 */

export const designTokens = {
  // Brand Colors - Brave Warriors (Namibia Football Association)
  brand: {
    // Navy Blue - Dominant primary for headers, navigation, structure
    primary: '#1E3A5F',        // Main navy blue (Brave Warriors)
    primaryDark: '#0F1F3A',     // Darker navy for depth
    primaryLight: '#3D5A8F',   // Lighter navy for accents
    // Red - Interactive elements, buttons, CTAs, active states
    interactive: '#DC143C',     // Primary red (Crimson)
    interactiveDark: '#B01030', // Darker red for pressed states
    interactiveLight: '#F0305C', // Light red for hover
    // Gold - Special features, achievements, premium content
    special: '#FFD700',         // Primary gold
    specialDark: '#CCAA00',     // Darker gold
    specialLight: '#FFE44D',    // Medium gold
    // Status colors
    error: '#DC143C',          // Red for errors/alerts
    success: '#10B981',        // Green for success
    warning: '#FFD700',        // Gold for warnings
    info: '#1E3A5F',           // Navy for info
  },

  // Neutral Colors - High contrast for accessibility
  neutrals: {
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
    black: '#000000',
  },

  // Semantic Colors
  semantic: {
    text: {
      primary: '#0F172A',      // WCAG AAA contrast
      secondary: '#334155',     // WCAG AA contrast
      tertiary: '#64748B',     // Muted text
      inverse: '#FFFFFF',       // Text on dark
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
    },
    border: {
      light: '#E2E8F0',
      medium: '#CBD5E1',
      dark: '#94A3B8',
    },
  },

  // Spacing Scale - 8px base unit for consistency
  spacing: {
    xs: 4,      // 4px
    sm: 8,      // 8px
    md: 16,     // 16px
    lg: 24,     // 24px
    xl: 32,     // 32px
    xxl: 48,    // 48px
    xxxl: 64,   // 64px
  },

  // Typography - 3 font styles for hierarchy
  typography: {
    // Display - For hero text and major headings
    display: {
      fontSize: 32,
      fontWeight: '800',
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    // Heading - For section titles and important text
    heading: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 28,
      letterSpacing: -0.2,
    },
    // Body - For main content (default)
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0,
    },
    // Body Small - For secondary content
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
    },
    // Caption - For labels and metadata
    caption: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.2,
    },
  },

  // Border Radius
  radius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // Shadows - Subtle depth
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Touch Targets - Minimum 44x44 for accessibility
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
    padding: 12,
  },

  // Animation Durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

// Contrast ratios (WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text)
export const contrastRatios = {
  primary: {
    onWhite: 4.8,      // #0066CC on white - Passes AA
    onGray: 3.2,       // On light gray - Passes AA for large text
  },
  text: {
    primary: 15.8,     // #0F172A on white - AAA
    secondary: 7.1,    // #334155 on white - AAA
  },
};

export default designTokens;

