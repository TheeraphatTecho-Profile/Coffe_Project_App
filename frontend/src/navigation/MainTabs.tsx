import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FarmStack } from './FarmStack';
import { HarvestScreen } from '../screens/harvest/HarvestScreen';
import { PriceScreen } from '../screens/price/PriceScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { COLORS, FONTS } from '../constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  HomeTab: { focused: 'home', unfocused: 'home-outline' },
  FarmTab: { focused: 'leaf', unfocused: 'leaf-outline' },
  HarvestTab: { focused: 'basket', unfocused: 'basket-outline' },
  PriceTab: { focused: 'trending-up', unfocused: 'trending-up-outline' },
  ProfileTab: { focused: 'person', unfocused: 'person-outline' },
};

/**
 * Main bottom tab navigator with 5 tabs:
 * Home, My Farms, Harvest, Price, Profile.
 */
export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'หน้าหลัก' }}
      />
      <Tab.Screen
        name="FarmTab"
        component={FarmStack}
        options={{ tabBarLabel: 'สวนของฉัน' }}
      />
      <Tab.Screen
        name="HarvestTab"
        component={HarvestScreen}
        options={{ tabBarLabel: 'เก็บเกี่ยว' }}
      />
      <Tab.Screen
        name="PriceTab"
        component={PriceScreen}
        options={{ tabBarLabel: 'ราคา' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'โปรไฟล์' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 6,
    paddingBottom: 8,
    height: 64,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
});
