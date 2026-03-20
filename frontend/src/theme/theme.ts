import { Theme } from './types';

// Light Theme - Coffee inspired color palette
export const lightTheme: Theme = {
  colors: {
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
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
  },

  typography: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },

  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 12,
    },
    colored: {
      shadowColor: '#3E2723',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
    spring: {
      tension: 100,
      friction: 8,
    },
    ease: 'ease-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  breakpoints: {
    small: 375,
    medium: 768,
    large: 1024,
  },
};

// Dark Theme - Comfortable evening coffee experience
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    
    // Dark theme backgrounds
    background: '#1A1A1A',
    backgroundDark: '#121212',
    surface: '#2D2D2D',
    surfaceDark: '#252525',
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

    // Dark theme surfaces
    surfaceWarm: '#36302D',

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
  },
};

export default lightTheme;
