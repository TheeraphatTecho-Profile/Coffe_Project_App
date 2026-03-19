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
  background: '#FBF5EB',
  surface: '#FFFFFF',
  text: '#2A1F14',
  textSecondary: '#6B5E52',
  primary: '#6F4E37',
  secondary: '#8B5A2B',
  border: '#E5DDD3',
  borderLight: '#F0EBE3',
};

const darkColors = {
  background: '#1A1410',
  surface: '#2A1F14',
  text: '#F5F0EB',
  textSecondary: '#A89B8C',
  primary: '#A67C52',
  secondary: '#C4956A',
  border: '#3D2E1F',
  borderLight: '#2A1F14',
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
