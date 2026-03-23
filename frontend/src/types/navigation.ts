/**
 * Navigation type definitions for the Coffee Farm app.
 */

 interface ChatUser {
  id: string;
  name: string;
  avatar?: string | null;
 }

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PrivacyPolicy: { mode: 'view' | 'accept' };
  FarmDetail: { farmId: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  FarmTab: undefined;
  HarvestTab: undefined;
  CommunityTab: undefined;
  PriceTab: undefined;
  ProfileTab: undefined;
};

export type FarmStackParamList = {
  FarmList: undefined;
  AddFarmStep1: { farmData?: Partial<FarmData> };
  AddFarmStep2: { farmData: Partial<FarmData> };
  AddFarmStep3: { farmData: Partial<FarmData> };
  AddFarmStep4: { farmData: Partial<FarmData> };
  FarmDetail: { farmId: string };
};

export interface FarmData {
  name: string;
  area: number;
  soil_type: string | null;
  water_source: string | null;
  water_detail?: string;
  irrigations?: string[];
  province: string;
  district: string | null;
  sub_district?: string | null;
  altitude: number | null;
  latitude?: number | null;
  longitude?: number | null;
  variety: string | null;
  tree_count: number | null;
  planting_year: number | null;
  notes: string | null;
}

export type HarvestStackParamList = {
  HarvestList: undefined;
  AddHarvest: undefined;
  HarvestDetail: { harvestId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type CommunityStackParamList = {
  CommunityFeed: undefined;
  CreatePost: undefined;
  PostDetail: { postId: string };
  Groups: undefined;
  GroupDetail: { groupId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Settings: undefined;
  Community: undefined;
  Notifications: undefined;
  UserProfile: { userId?: string };
  Followers: { userId?: string };
  Following: { userId?: string };
  SearchUsers: undefined;
  Conversations: undefined;
  Chat: { conversationId: string; otherUser: ChatUser };
  PriceComparison: undefined;
  ProfitCalculator: undefined;
  // Cost tracking
  CostList: { farmId?: string };
  AddCost: { farmId?: string; costId?: string };
  CostAnalytics: { farmId?: string };
  // Maintenance
  MaintenanceDashboard: { farmId?: string };
  MaintenanceCalendar: { farmId?: string };
  AddMaintenanceTask: { farmId?: string; taskId?: string };
  // Weather
  WeatherAlerts: { farmId?: string };
  WeatherAlertSettings: { farmId?: string };
  // Market
  MarketIntelligence: { farmId?: string };
  BuyerManagement: { farmId?: string };
};
