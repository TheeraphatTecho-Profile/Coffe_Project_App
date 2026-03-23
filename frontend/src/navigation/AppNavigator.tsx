import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { CommunityStack } from './CommunityStack';
import { SettingsStack } from './SettingsStack';
import { useAuth } from '../context/AuthContext';
// Cost screens
import { CostListScreen } from '../screens/cost/CostListScreen';
import { AddCostScreen } from '../screens/cost/AddCostScreen';
import { CostAnalyticsScreen } from '../screens/cost/CostAnalyticsScreen';
// Maintenance screens
import { MaintenanceDashboardScreen } from '../screens/maintenance/MaintenanceDashboardScreen';
import { MaintenanceCalendarScreen } from '../screens/maintenance/MaintenanceCalendarScreen';
import { AddMaintenanceTaskScreen } from '../screens/maintenance/AddMaintenanceTaskScreen';
// Weather screens
import { WeatherAlertsScreen } from '../screens/weather/WeatherAlertsScreen';
import { WeatherAlertSettingsScreen } from '../screens/weather/WeatherAlertSettingsScreen';
// Market screens
import { MarketIntelligenceScreen } from '../screens/market/MarketIntelligenceScreen';
import { BuyerManagementScreen } from '../screens/market/BuyerManagementScreen';
// Notification + social + messaging screens
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { FollowersScreen } from '../screens/profile/FollowersScreen';
import { FollowingScreen } from '../screens/profile/FollowingScreen';
import { SearchUsersScreen } from '../screens/profile/SearchUsersScreen';
import { ConversationsScreen } from '../screens/messaging/ConversationsScreen';
import { ChatScreen } from '../screens/messaging/ChatScreen';
// Price screens
import { PriceComparisonScreen } from '../screens/price/PriceComparisonScreen';
import { ProfitCalculatorScreen } from '../screens/price/ProfitCalculatorScreen';

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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Community" component={CommunityStack} />
          <Stack.Screen name="Settings" component={SettingsStack} />
          <Stack.Screen name="Notifications" component={NotificationScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="Followers" component={FollowersScreen} />
          <Stack.Screen name="Following" component={FollowingScreen} />
          <Stack.Screen name="SearchUsers" component={SearchUsersScreen} />
          <Stack.Screen name="Conversations" component={ConversationsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
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
          {/* Price */}
          <Stack.Screen name="PriceComparison" component={PriceComparisonScreen} />
          <Stack.Screen name="ProfitCalculator" component={ProfitCalculatorScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
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
