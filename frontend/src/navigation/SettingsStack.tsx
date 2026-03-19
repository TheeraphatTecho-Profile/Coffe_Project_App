import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/navigation';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/settings/ChangePasswordScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
};
