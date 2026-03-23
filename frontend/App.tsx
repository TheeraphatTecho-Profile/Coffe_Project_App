import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ThemeProvider as RichThemeProvider } from './src/theme/ThemeProvider';
import { ErrorBoundary } from './src/components/ErrorBoundary';

/**
 * AppContent reads isDark from ThemeContext (which owns persistence + system detection)
 * and passes it to RichThemeProvider so both theme systems stay synchronized.
 */
const AppContent = () => {
  const { colors, isDark } = useTheme();
  return (
    <RichThemeProvider defaultTheme={isDark ? 'dark' : 'light'}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </RichThemeProvider>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
