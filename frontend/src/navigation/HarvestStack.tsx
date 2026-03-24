import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HarvestStackParamList } from '../types/navigation';
import { HarvestScreen } from '../screens/harvest/HarvestScreen';
import { AddHarvestScreen } from '../screens/harvest/AddHarvestScreen';
import { HarvestDetailScreen } from '../screens/harvest/HarvestDetailScreen';

const Stack = createNativeStackNavigator<HarvestStackParamList>();

/**
 * Harvest management stack navigator.
 * Handles harvest list, add harvest, and harvest detail screens.
 */
export const HarvestStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HarvestList" component={HarvestScreen} />
      <Stack.Screen name="AddHarvest" component={AddHarvestScreen as any} />
      <Stack.Screen name="HarvestDetail" component={HarvestDetailScreen as any} />
    </Stack.Navigator>
  );
};
