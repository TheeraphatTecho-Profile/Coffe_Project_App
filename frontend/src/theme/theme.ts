import { Theme } from './types';

// Light Theme - Professional coffee farm business palette
export const lightTheme: Theme = {
  colors: {
    // Primary palette - Professional forest green
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#4CAF50',
    primaryUltraLight: '#A5D6A7',

    // Secondary palette - Warm gold accent
    secondary: '#C49A2A',
    secondaryDark: '#A07C1C',
    secondaryLight: '#DABB5C',
    golden: '#D4A84C',
    goldenLight: '#F0DCA0',

    // Backgrounds - Clean, bright
    background: '#F5F7FA',
    backgroundDark: '#EEF1F5',
    surface: '#FFFFFF',
    surfaceDark: 'rgba(255,255,255,0.12)',
    surfaceWarm: '#F0F7F1',
    surfaceCard: '#FFFFFF',

    // Text colors - High contrast
    text: '#1A2332',
    textSecondary: '#5A6B7D',
    textLight: '#8E9AAD',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    textDisabled: '#B0BAC5',

    // Status colors
    success: '#2E7D32',
    successLight: '#E8F5E9',
    successDark: '#1B5E20',
    error: '#D32F2F',
    errorLight: '#FFEBEE',
    errorDark: '#B71C1C',
    warning: '#F57C00',
    warningLight: '#FFF3E0',
    warningDark: '#E65100',
    info: '#1976D2',
    infoLight: '#E3F2FD',
    infoDark: '#0D47A1',

    // UI elements
    border: '#E2E8F0',
    borderLight: '#EDF2F7',
    borderDark: '#CBD5E0',
    inputBg: '#F7FAFC',
    divider: '#EDF2F7',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Coffee specific colors
    coffeeBean: '#1A3C2A',
    coffeeLeaf: '#2E7D32',
    coffeeMilk: '#D4A84C',
    mountain: '#607D8B',
    soil: '#5D4037',

    // Neutrals
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
      boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
      elevation: 1,
    },
    sm: {
      boxShadow: '0px 1px 4px rgba(0,0,0,0.08)',
      elevation: 2,
    },
    md: {
      boxShadow: '0px 2px 8px rgba(0,0,0,0.12)',
      elevation: 4,
    },
    lg: {
      boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
      elevation: 8,
    },
    xl: {
      boxShadow: '0px 8px 16px rgba(0,0,0,0.18)',
      elevation: 12,
    },
    colored: {
      boxShadow: '0px 2px 8px rgba(62,39,35,0.2)',
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

// Dark Theme - Professional dark mode
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,

    // Primary - Lighter green for dark bg
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    primaryLight: '#81C784',

    // Secondary - Brighter gold on dark
    secondary: '#DABB5C',
    secondaryDark: '#C49A2A',

    // Dark theme backgrounds
    background: '#0F1419',
    backgroundDark: '#0A0E12',
    surface: '#1C2530',
    surfaceDark: 'rgba(255,255,255,0.06)',
    surfaceCard: '#1C2530',
    surfaceWarm: '#1A2A22',

    // Dark theme text
    text: '#E8ECF0',
    textSecondary: '#8899AA',
    textLight: '#5A6B7D',
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    textDisabled: '#404D5A',

    // Dark theme borders
    border: '#2A3544',
    borderLight: '#1E2936',
    borderDark: '#3D4F62',
    inputBg: '#1C2530',
    divider: '#2A3544',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Coffee specific
    coffeeBean: '#0F1419',

    // Dark theme status colors
    successLight: '#1B3A2A',
    successDark: '#4CAF50',
    errorLight: '#3A1A1A',
    errorDark: '#EF5350',
    warningLight: '#3A2A0A',
    warningDark: '#FF9800',
    infoLight: '#0A1A3A',
    infoDark: '#42A5F5',

    // Dark theme neutrals
    gray50: '#0A0E12',
    gray100: '#0F1419',
    gray200: '#1C2530',
    gray300: '#2A3544',
    gray400: '#3D4F62',
    gray500: '#5A6B7D',
    gray600: '#8899AA',
    gray700: '#A0B0C0',
    gray800: '#C8D4E0',
    gray900: '#E8ECF0',
  },
};

export default lightTheme;
