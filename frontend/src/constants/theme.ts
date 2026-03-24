/**
 * Theme constants for the Coffee Farm app.
 * Color palette derived from the warm, earthy coffee brand identity.
 */

export const COLORS = {
  // Primary palette - Professional green
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',

  // Secondary / accent - Warm gold
  secondary: '#C49A2A',
  secondaryLight: '#DABB5C',
  golden: '#D4A84C',

  // Backgrounds - Clean, bright
  background: '#F5F7FA',
  backgroundDark: '#EEF1F5',
  surface: '#FFFFFF',
  surfaceWarm: '#F0F7F1',
  surfaceCard: '#FFFFFF',

  // Text - High contrast
  text: '#1A2332',
  textSecondary: '#5A6B7D',
  textLight: '#8E9AAD',
  textOnPrimary: '#FFFFFF',

  // UI elements
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  inputBg: '#F7FAFC',
  divider: '#EDF2F7',

  // Status colors
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#F57C00',
  warningLight: '#FFF3E0',

  // Basics
  white: '#FFFFFF',
  black: '#1A1A1A',
  transparent: 'transparent',

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const FONTS = {
  regular: 'Kanit_400Regular',
  medium: 'Kanit_500Medium',
  semiBold: 'Kanit_600SemiBold',
  bold: 'Kanit_700Bold',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
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
    boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
    elevation: 2,
  },
  md: {
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  lg: {
    boxShadow: '0px 4px 12px rgba(0,0,0,0.12)',
    elevation: 6,
  },
} as const;
