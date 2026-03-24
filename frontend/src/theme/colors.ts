// Coffee-inspired color palette for Loei Coffee App
export const COLORS = {
  // Primary palette - Deep coffee browns
  primary: '#3E2723', // Dark coffee bean
  primaryDark: '#2E1A17',
  primaryLight: '#5D4037',
  primaryUltraLight: '#8D6E63',

  // Secondary palette - Warm earth tones
  secondary: '#8D6E63', // Light brown
  secondaryDark: '#6D4C41',
  secondaryLight: '#A1887F',
  golden: '#D4A574', // Golden coffee
  goldenLight: '#E6C9A8',

  // Backgrounds - Warm, inviting tones
  background: '#FAF7F2', // Cream paper
  backgroundDark: '#F5F0E6',
  surface: '#FFFFFF',
  surfaceDark: '#F8F5F0',
  surfaceWarm: '#FEFBF7',
  surfaceCard: '#FFFFFF',

  // Text colors - High contrast on warm backgrounds
  text: '#2E1A17',
  textSecondary: '#5D4037',
  textLight: '#8D6E63',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  textDisabled: '#A1887F',

  // Status colors - Nature inspired
  success: '#4CAF50', // Fresh coffee leaf
  successLight: '#E8F5E9',
  successDark: '#388E3C',
  error: '#E53935', // Red warning
  errorLight: '#FFEBEE',
  errorDark: '#C62828',
  warning: '#FF9800', // Amber sunrise
  warningLight: '#FFF3E0',
  warningDark: '#F57C00',
  info: '#2196F3', // Clear sky
  infoLight: '#E3F2FD',
  infoDark: '#1976D2',

  // UI elements - Subtle boundaries
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#BDBDBD',
  inputBg: '#FFFFFF',
  divider: '#EEEEEE',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Coffee specific colors
  coffeeBean: '#3E2723',
  coffeeLeaf: '#4CAF50',
  coffeeMilk: '#D4A574',
  mountain: '#78909C', // Mountain gray
  soil: '#6D4C41', // Earth brown

  // Neutrals - Complete grayscale
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  transparent: 'transparent',
};

export const DARK_COLORS = {
  ...COLORS,
  
  // Dark theme backgrounds
  background: '#1A1A1A',
  backgroundDark: '#121212',
  surface: '#2D2D2D',
  surfaceDark: '#252525',
  surfaceWarm: '#333333',
  surfaceCard: '#2D2D2D',

  // Dark theme text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  textDisabled: '#606060',

  // Dark theme borders
  border: '#404040',
  borderLight: '#333333',
  borderDark: '#606060',
  inputBg: '#2D2D2D',
  divider: '#404040',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Dark theme status colors
  successLight: '#1B5E20',
  successDark: '#4CAF50',
  errorLight: '#B71C1C',
  errorDark: '#E53935',
  warningLight: '#E65100',
  warningDark: '#FF9800',
  infoLight: '#0D47A1',
  infoDark: '#2196F3',

  // Dark theme neutrals
  gray50: '#121212',
  gray100: '#1E1E1E',
  gray200: '#2D2D2D',
  gray300: '#404040',
  gray400: '#606060',
  gray500: '#808080',
  gray600: '#A0A0A0',
  gray700: '#B0B0B0',
  gray800: '#D0D0D0',
  gray900: '#F0F0F0',
};
