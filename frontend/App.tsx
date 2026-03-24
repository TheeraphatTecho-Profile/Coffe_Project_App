import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Kanit_400Regular, Kanit_500Medium, Kanit_600SemiBold, Kanit_700Bold } from '@expo-google-fonts/kanit';
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
  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_500Medium,
    Kanit_600SemiBold,
    Kanit_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={appStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // Apply Kanit as the default font for every Text component in the app.
  // Individual styles can still override fontFamily explicitly.
  // Cast required: RN typings omit defaultProps but the runtime property exists.
  const TextAny = Text as any;
  if (!TextAny.defaultProps) TextAny.defaultProps = {};
  TextAny.defaultProps.style = [
    { fontFamily: 'Kanit_400Regular' },
    TextAny.defaultProps.style ?? {},
  ];

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

const appStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFAF6',
  },
});
