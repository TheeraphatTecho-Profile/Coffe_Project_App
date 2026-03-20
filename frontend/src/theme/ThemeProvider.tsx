import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode } from './types';
import { lightTheme, darkTheme } from './theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  colors: Theme['colors'];
  spacing: Theme['spacing'];
  typography: Theme['typography'];
  radius: Theme['radius'];
  shadows: Theme['shadows'];
  animations: Theme['animations'];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'light' 
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [theme, setTheme] = useState<Theme>(defaultTheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeModeState((prev: ThemeMode) => prev === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    radius: theme.radius,
    shadows: theme.shadows,
    animations: theme.animations,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for accessing theme values directly
export const useColors = () => {
  const { colors } = useTheme();
  return colors;
};

export const useSpacing = () => {
  const { spacing } = useTheme();
  return spacing;
};

export const useTypography = () => {
  const { typography } = useTheme();
  return typography;
};

export const useAnimations = () => {
  const { animations } = useTheme();
  return animations;
};
