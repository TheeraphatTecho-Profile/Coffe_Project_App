/**
 * LazyScreen — HOC wrapper for lazy-loaded screens with Suspense fallback.
 *
 * Usage in navigation:
 *   const LazyMarketScreen = lazyScreen(() => import('../screens/market/MarketScreen'));
 *   <Stack.Screen name="Market" component={LazyMarketScreen} />
 */
import React, { Suspense, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface FallbackProps {
  label?: string;
}

const LoadingFallback: React.FC<FallbackProps> = ({ label }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#2E7D32" />
    {label && <Text style={styles.label}>{label}</Text>}
  </View>
);

/**
 * Creates a lazy-loaded screen component with a loading fallback.
 *
 * @param factory — Dynamic import factory, e.g. () => import('../screens/SomeScreen')
 * @param exportName — Named export to pick from the module. Default: 'default'
 * @param label — Optional loading text
 */
export function lazyScreen<P extends object>(
  factory: () => Promise<{ [key: string]: ComponentType<P> }>,
  exportName: string = 'default',
  label?: string
): React.FC<P> {
  const LazyComponent = React.lazy(async () => {
    const mod = await factory();
    const Component = mod[exportName] || mod.default;
    return { default: Component };
  });

  const WrappedScreen: React.FC<P> = (props) => (
    <Suspense fallback={<LoadingFallback label={label} />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedScreen.displayName = `LazyScreen(${exportName})`;
  return WrappedScreen;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFAF6',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 8,
  },
});
