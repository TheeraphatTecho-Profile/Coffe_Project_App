import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '../types/navigation';
import { CommunityScreen } from '../screens/community/CommunityScreen';
import { CreatePostScreen } from '../screens/community/CreatePostScreen';
import { PostDetailScreen } from '../screens/community/PostDetailScreen';
import { GroupsScreen } from '../screens/community/GroupsScreen';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export const CommunityStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CommunityFeed" component={CommunityScreen} />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ presentation: Platform.OS === 'web' ? 'card' : 'modal' }}
      />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
    </Stack.Navigator>
  );
};

export default CommunityStack;
