import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ThemeProvider as RichThemeProvider } from './src/theme/ThemeProvider';
import { ErrorBoundary, AuthErrorBoundary } from './src/components/ErrorBoundary';

const AppContent = () => {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RichThemeProvider>
              <AuthErrorBoundary>
                <AuthProvider>
                  <NavigationContainer>
                    <AppContent />
                  </NavigationContainer>
                </AuthProvider>
              </AuthErrorBoundary>
            </RichThemeProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
