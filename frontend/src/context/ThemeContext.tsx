import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    border: string;
    borderLight: string;
  };
}

const lightColors = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1A2332',
  textSecondary: '#5A6B7D',
  primary: '#2E7D32',
  secondary: '#C49A2A',
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
};

const darkColors = {
  background: '#0F1419',
  surface: '#1C2530',
  text: '#E8ECF0',
  textSecondary: '#8899AA',
  primary: '#4CAF50',
  secondary: '#DABB5C',
  border: '#2A3544',
  borderLight: '#1E2936',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (err) {
      console.error('Error loading theme:', err);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
