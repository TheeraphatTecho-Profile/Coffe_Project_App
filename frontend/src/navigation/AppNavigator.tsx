import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { SettingsStack } from './SettingsStack';
import { useAuth } from '../context/AuthContext';
// Cost screens — lazy loaded
const CostListScreen = React.lazy(() =>
  import('../screens/cost/CostListScreen').then(m => ({ default: m.CostListScreen }))
);
const AddCostScreen = React.lazy(() =>
  import('../screens/cost/AddCostScreen').then(m => ({ default: m.AddCostScreen }))
);
const CostAnalyticsScreen = React.lazy(() =>
  import('../screens/cost/CostAnalyticsScreen').then(m => ({ default: m.CostAnalyticsScreen }))
);
// Maintenance screens — lazy loaded
const MaintenanceDashboardScreen = React.lazy(() =>
  import('../screens/maintenance/MaintenanceDashboardScreen').then(m => ({ default: m.MaintenanceDashboardScreen }))
);
const MaintenanceCalendarScreen = React.lazy(() =>
  import('../screens/maintenance/MaintenanceCalendarScreen').then(m => ({ default: m.MaintenanceCalendarScreen }))
);
const AddMaintenanceTaskScreen = React.lazy(() =>
  import('../screens/maintenance/AddMaintenanceTaskScreen').then(m => ({ default: m.AddMaintenanceTaskScreen }))
);
// Weather screens — lazy loaded
const WeatherAlertsScreen = React.lazy(() =>
  import('../screens/weather/WeatherAlertsScreen').then(m => ({ default: m.WeatherAlertsScreen }))
);
const WeatherAlertSettingsScreen = React.lazy(() =>
  import('../screens/weather/WeatherAlertSettingsScreen').then(m => ({ default: m.WeatherAlertSettingsScreen }))
);
// Market screens — lazy loaded
const MarketIntelligenceScreen = React.lazy(() =>
  import('../screens/market/MarketIntelligenceScreen').then(m => ({ default: m.MarketIntelligenceScreen }))
);
const BuyerManagementScreen = React.lazy(() =>
  import('../screens/market/BuyerManagementScreen').then(m => ({ default: m.BuyerManagementScreen }))
);
// Community deep-link — lazy loaded
const CommunityStack = React.lazy(() =>
  import('./CommunityStack').then(m => ({ default: m.CommunityStack }))
);

const LazyFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6B4226" />
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <Suspense fallback={<LazyFallback />}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsStack} />
          {/* Cost tracking */}
          <Stack.Screen name="CostList" component={CostListScreen} />
          <Stack.Screen name="AddCost" component={AddCostScreen} />
          <Stack.Screen name="CostAnalytics" component={CostAnalyticsScreen} />
          {/* Maintenance */}
          <Stack.Screen name="MaintenanceDashboard" component={MaintenanceDashboardScreen} />
          <Stack.Screen name="MaintenanceCalendar" component={MaintenanceCalendarScreen} />
          <Stack.Screen name="AddMaintenanceTask" component={AddMaintenanceTaskScreen} />
          {/* Weather */}
          <Stack.Screen name="WeatherAlerts" component={WeatherAlertsScreen} />
          <Stack.Screen name="WeatherAlertSettings" component={WeatherAlertSettingsScreen} />
          {/* Market */}
          <Stack.Screen name="MarketIntelligence" component={MarketIntelligenceScreen} />
          <Stack.Screen name="BuyerManagement" component={BuyerManagementScreen} />
          {/* Community deep-link from notifications */}
          <Stack.Screen name="Community" component={CommunityStack} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFAF6',
  },
});
