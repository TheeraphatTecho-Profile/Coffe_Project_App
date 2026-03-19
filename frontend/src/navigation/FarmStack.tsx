import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmStackParamList } from '../types/navigation';
import { FarmListScreen } from '../screens/farm/FarmListScreen';
import { AddFarmStep1Screen } from '../screens/farm/AddFarmStep1Screen';
import { AddFarmStep2Screen } from '../screens/farm/AddFarmStep2Screen';
import { AddFarmStep3Screen } from '../screens/farm/AddFarmStep3Screen';
import { AddFarmStep4Screen } from '../screens/farm/AddFarmStep4Screen';

const Stack = createNativeStackNavigator<FarmStackParamList>();

/**
 * Farm management stack navigator.
 * Handles farm list and the 4-step add farm flow.
 */
export const FarmStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="FarmList" component={FarmListScreen} />
      <Stack.Screen name="AddFarmStep1" component={AddFarmStep1Screen} />
      <Stack.Screen name="AddFarmStep2" component={AddFarmStep2Screen} />
      <Stack.Screen name="AddFarmStep3" component={AddFarmStep3Screen} />
      <Stack.Screen name="AddFarmStep4" component={AddFarmStep4Screen} />
    </Stack.Navigator>
  );
};
