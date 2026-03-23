import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FarmStack } from './FarmStack';
import { HarvestStack } from './HarvestStack';
import { CommunityStack } from './CommunityStack';
import { PriceScreen } from '../screens/price/PriceScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useTheme } from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  FarmTab: { focused: 'leaf', unfocused: 'leaf-outline' },
  HarvestTab: { focused: 'basket', unfocused: 'basket-outline' },
  CommunityTab: { focused: 'people', unfocused: 'people-outline' },
  PriceTab: { focused: 'trending-up', unfocused: 'trending-up-outline' },
  ProfileTab: { focused: 'person', unfocused: 'person-outline' },
};

/**
 * Main bottom tab navigator with 6 tabs.
 * Uses live theme colors so tab bar updates with dark/light mode.
 */
export const MainTabs: React.FC = () => {
  const { colors, typography } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 6,
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'หน้าหลัก' }} />
      <Tab.Screen name="FarmTab" component={FarmStack} options={{ tabBarLabel: 'สวนของฉัน' }} />
      <Tab.Screen name="HarvestTab" component={HarvestStack} options={{ tabBarLabel: 'เก็บเกี่ยว' }} />
      <Tab.Screen name="CommunityTab" component={CommunityStack} options={{ tabBarLabel: 'ชุมชน' }} />
      <Tab.Screen name="PriceTab" component={PriceScreen} options={{ tabBarLabel: 'ราคา' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'โปรไฟล์' }} />
    </Tab.Navigator>
  );
};
