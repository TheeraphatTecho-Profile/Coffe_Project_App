/**
 * Navigation type definitions for the Coffee Farm app.
 */

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
  soilType: string | null;
  waterSource: string | null;
  waterDetail?: string;
  irrigations?: string[];
  province: string;
  district: string | null;
  subDistrict?: string | null;
  altitude: number | null;
  latitude?: number | null;
  longitude?: number | null;
  variety: string | null;
  treeCount: number | null;
  plantingYear: number | null;
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
  // Production (ผลผลิต)
  AddFreshSale: undefined;
  AddProcessedProduct: undefined;
  AnnualReport: undefined;
};
