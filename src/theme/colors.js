export const palette = {
  // Brave Warriors Brand Colors
  // Navy Blue - Dominant primary color for headers, navigation, structural elements
  navy: '#1E3A5F',          // Primary navy blue (Brave Warriors)
  navyDark: '#0F1F3A',      // Darker navy for depth
  navyMedium: '#2D4A6F',    // Medium navy
  navyLight: '#3D5A8F',     // Light navy
  navyLighter: '#E8EDF5',   // Very light navy for backgrounds
  // Red - Interactive elements, buttons, CTAs, active states, alerts
  red: '#DC143C',           // Primary red (Crimson - Brave Warriors)
  redDark: '#B01030',       // Darker red for hover/pressed states
  redMedium: '#E0204C',     // Medium red
  redLight: '#F0305C',      // Light red
  redLighter: '#FFE8ED',    // Very light red for backgrounds/alerts
  // Gold - Special features, achievements, premium content, highlights, badges
  gold: '#FFD700',          // Primary gold (Brave Warriors)
  goldDark: '#CCAA00',      // Darker gold
  goldMedium: '#FFE44D',    // Medium gold
  goldLight: '#FFF4B3',     // Light gold
  goldLighter: '#FFFBE6',   // Very light gold for backgrounds
  // Neutral colors - high contrast and bright
  white: '#FFFFFF',
  dark: '#0F172A',          // Very dark for text (high contrast)
  darkGray: '#334155',      // Dark gray for secondary text
  gray: '#64748B',          // Medium gray
  grayLight: '#475569',     // Darker gray for muted text (higher contrast - was #94A3B8)
  grayLighter: '#E2E8F0',   // Lighter gray for borders
  grayLightest: '#F8FAFC'   // Lightest gray for subtle backgrounds
};

// Dark mode palette
const darkPalette = {
  // Dark backgrounds - Navy-based for consistency
  darkBg: '#0A0F1A',        // Very dark navy background
  darkSurface: '#151F2A',   // Dark navy surface for cards
  darkSurfaceElevated: '#1E2A3A', // Elevated dark navy surface
  // Dark text colors
  darkTextPrimary: '#F8FAFC',    // Light text for dark bg
  darkTextSecondary: '#CBD5E1',  // Secondary light text
  darkTextMuted: '#94A3B8',       // Muted light text
  // Dark borders
  darkBorder: '#1E293B',         // Dark border
  darkBorderLight: '#2D3A4F',    // Lighter dark navy border
};

const sharedTheme = {
  spacing: {
    xs: 4,      // 4px - minimal spacing
    sm: 8,      // 8px - small spacing
    md: 16,     // 16px - medium spacing (base unit)
    lg: 24,     // 24px - large spacing
    xl: 32,     // 32px - extra large spacing
    xxl: 48,    // 48px - section spacing
    xxxl: 64    // 64px - major section spacing
  },
  borderRadius: {
    sm: 8,      // 8px - small radius
    md: 12,     // 12px - medium radius
    lg: 16,     // 16px - large radius
    xl: 20,     // 20px - extra large radius
    full: 9999  // Full circle
  },
  // Touch target minimums for accessibility
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
    padding: 12
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12
    }
  },
  typography: {
    // Display - Hero text, major headings (1 style)
    display: {
      fontSize: 32,
      fontWeight: '800',
      lineHeight: 40,
      letterSpacing: -0.5
    },
    // Heading - Section titles, important text (2 style)
    heading: {
      fontSize: 26, // Increased from 20 - larger for better emphasis
      fontWeight: '800', // Increased from 700 - bolder
      lineHeight: 34,
      letterSpacing: -0.3
    },
    // Body - Main content (3 style - default)
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      letterSpacing: 0
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
      letterSpacing: 0.2
    },
    // Legacy support - map to new system (enhanced for better hierarchy)
    h1: {
      fontSize: 36, // Increased from 32
      fontWeight: '900', // Increased from 800
      lineHeight: 44
    },
    h2: {
      fontSize: 26, // Increased from 20 - larger page titles
      fontWeight: '800', // Increased from 700 - bolder
      lineHeight: 34
    },
    h3: {
      fontSize: 22, // Increased from 18
      fontWeight: '800', // Increased from 700
      lineHeight: 30
    },
    h4: {
      fontSize: 18, // Increased from 16
      fontWeight: '700', // Increased from 600
      lineHeight: 26
    },
    tiny: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16
    }
  }
};

export const lightTheme = {
  ...sharedTheme,
  colors: {
    // Backgrounds - White primary as per Brave Warriors brand
    backgroundPrimary: palette.white,           // Pure white primary background
    backgroundSecondary: palette.white,         // White for tab bar/navigation
    surface: palette.white,                     // White for cards
    // Primary colors - Navy blue dominant for structure
    primary: palette.navy,                      // Navy blue - headers, navigation, structure
    primaryDark: palette.navyDark,              // Darker navy for depth
    primaryLight: palette.navyLight,           // Lighter navy for accents
    // Interactive colors - Red for actions
    interactive: palette.red,                  // Red for buttons, CTAs, links
    interactiveDark: palette.redDark,          // Darker red for pressed states
    interactiveLight: palette.redLight,       // Light red for hover states
    // Special colors - Gold for achievements/premium
    special: palette.gold,                     // Gold for achievements, badges, highlights
    specialDark: palette.goldDark,            // Darker gold
    specialLight: palette.goldLight,          // Light gold
    // Legacy support - map to new system
    secondary: palette.red,                    // Red as secondary (interactive)
    accent: palette.gold,                      // Gold as accent (special features)
    highlight: palette.gold,                    // Gold for highlights
    // Text colors - high contrast for readability
    textPrimary: palette.dark,                  // Very dark text (#0F172A) - highest contrast
    textSecondary: '#334155',                   // Dark gray for secondary text - improved contrast
    textDark: palette.navyDark,                 // Navy text for emphasis
    // Borders and separators - subtle navy tint
    border: palette.grayLighter,                // Light gray border
    borderNavy: palette.navyLighter,           // Navy-tinted border for structure
    muted: '#475569',                           // Darker muted text for better readability - improved contrast
    // Status colors
    error: palette.red,                        // Red for errors/alerts
    success: '#10B981',                        // Green for success
    warning: palette.gold,                     // Gold for warnings
    info: palette.navy,                        // Navy for info
    // Additional colors
    white: palette.white,
    darkGray: palette.darkGray                  // For components that need it
  },
  gradients: {
    hero: [palette.navy, palette.navyDark],    // Navy gradient for hero sections
    card: [palette.white, palette.navyLighter], // Subtle navy tint for cards
    interactive: [palette.red, palette.redDark], // Red gradient for buttons
    special: [palette.gold, palette.goldDark]   // Gold gradient for premium features
  }
};

export const darkTheme = {
  ...sharedTheme,
  colors: {
    // Backgrounds - Dark navy-based for consistency
    backgroundPrimary: darkPalette.darkBg,              // Very dark navy background
    backgroundSecondary: darkPalette.darkSurface,       // Dark navy surface for tab bar
    surface: darkPalette.darkSurface,                   // Dark navy surface for cards
    // Primary colors - Navy blue (lighter for dark mode)
    primary: palette.navyLight,                         // Lighter navy for dark mode visibility
    primaryDark: palette.navy,                          // Standard navy
    primaryLight: '#4D6A9F',                            // Even lighter navy for accents
    // Interactive colors - Red for actions (same in dark mode)
    interactive: palette.red,                           // Red for buttons, CTAs, links
    interactiveDark: palette.redDark,                  // Darker red for pressed states
    interactiveLight: palette.redLight,                // Light red for hover states
    // Special colors - Gold for achievements/premium
    special: palette.gold,                             // Gold for achievements, badges
    specialDark: palette.goldDark,                    // Darker gold
    specialLight: palette.goldMedium,                 // Medium gold
    // Legacy support - map to new system
    secondary: palette.red,                             // Red as secondary (interactive)
    accent: palette.gold,                               // Gold as accent (special features)
    highlight: palette.gold,                           // Gold for highlights
    // Text colors - light for dark backgrounds
    textPrimary: darkPalette.darkTextPrimary,           // Light text (#F8FAFC)
    textSecondary: darkPalette.darkTextSecondary,       // Secondary light text (#CBD5E1)
    textDark: darkPalette.darkTextPrimary,              // Light text for dark mode
    // Borders and separators - visible on dark
    border: darkPalette.darkBorder,                     // Dark border
    borderNavy: darkPalette.darkBorderLight,           // Navy-tinted border
    muted: darkPalette.darkTextMuted,                   // Muted light text
    // Status colors
    error: palette.red,                                // Red for errors/alerts
    success: '#10B981',                                // Green for success
    warning: palette.gold,                              // Gold for warnings
    info: palette.navyLight,                           // Navy for info
    // Additional colors
    white: palette.white,
    darkGray: darkPalette.darkTextSecondary             // For components that need it
  },
  gradients: {
    hero: [darkPalette.darkBg, darkPalette.darkSurface], // Dark navy gradient
    card: [darkPalette.darkSurface, darkPalette.darkSurfaceElevated], // Elevated dark navy
    interactive: [palette.red, palette.redDark],        // Red gradient for buttons
    special: [palette.gold, palette.goldDark]           // Gold gradient for premium
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 12
    }
  }
};

// Default export for backward compatibility
export const theme = lightTheme;

// Function to get theme based on dark mode
export const getTheme = (isDark = false) => {
  return isDark ? darkTheme : lightTheme;
};

export default theme;
