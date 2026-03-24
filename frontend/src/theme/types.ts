export interface Theme {
  colors: {
    // Primary palette - Coffee inspired
    primary: string;
    primaryDark: string;
    primaryLight: string;
    primaryUltraLight: string;
    
    // Secondary palette - Warm earth tones
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    golden: string;
    goldenLight: string;
    
    // Backgrounds
    background: string;
    backgroundDark: string;
    surface: string;
    surfaceDark: string;
    surfaceWarm: string;
    surfaceCard: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textLight: string;
    textOnPrimary: string;
    textOnSecondary: string;
    textDisabled: string;
    
    // Status colors
    success: string;
    successLight: string;
    successDark: string;
    error: string;
    errorLight: string;
    errorDark: string;
    warning: string;
    warningLight: string;
    warningDark: string;
    info: string;
    infoLight: string;
    infoDark: string;
    
    // UI elements
    border: string;
    borderLight: string;
    borderDark: string;
    inputBg: string;
    divider: string;
    overlay: string;
    
    // Coffee specific colors
    coffeeBean: string;
    coffeeLeaf: string;
    coffeeMilk: string;
    mountain: string;
    soil: string;
    
    // Neutrals
    white: string;
    black: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
    
    // Transparent colors
    transparent: string;
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    xxxxl: number;
  };
  
  typography: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
      display: number;
    };
    weights: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
      extrabold: string;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
  };
  
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  shadows: {
    xs: any;
    sm: any;
    md: any;
    lg: any;
    xl: any;
    colored: any;
  };
  
  animations: {
    fast: number;
    normal: number;
    slow: number;
    spring: any;
    ease: any;
    easeIn: any;
    easeOut: any;
    easeInOut: any;
  };
  
  breakpoints: {
    small: number;
    medium: number;
    large: number;
  };
}

export type ThemeMode = 'light' | 'dark';
