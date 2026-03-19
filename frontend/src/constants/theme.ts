/**
 * Theme constants for the Coffee Farm app.
 * Color palette derived from the warm, earthy coffee brand identity.
 */

export const COLORS = {
  // Primary palette
  primary: '#4A5D23',
  primaryDark: '#3A4A1C',
  primaryLight: '#6B7F3A',

  // Secondary / accent
  secondary: '#8B6914',
  secondaryLight: '#C49A2A',
  golden: '#C9A84C',

  // Backgrounds
  background: '#FBF5EB',
  backgroundDark: '#F0E8D8',
  surface: '#FFFFFF',
  surfaceWarm: '#FDF8F0',
  surfaceCard: '#FFFCF5',

  // Text
  text: '#3D2314',
  textSecondary: '#8B7355',
  textLight: '#B8A88A',
  textOnPrimary: '#FFFFFF',

  // UI elements
  border: '#E8DFD0',
  borderLight: '#F0E8DA',
  inputBg: '#FDF8F0',
  divider: '#E8DFD0',

  // Status colors
  error: '#C44B3F',
  errorLight: '#FEF0EE',
  success: '#4A8C5C',
  successLight: '#E8F5E9',
  warning: '#D4A026',
  warningLight: '#FFF8E1',

  // Basics
  white: '#FFFFFF',
  black: '#1A1A1A',
  transparent: 'transparent',

  // Overlay
  overlay: 'rgba(0,0,0,0.3)',
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    boxShadow: '0px 4px 12px rgba(0,0,0,0.12)',
  },
} as const;
