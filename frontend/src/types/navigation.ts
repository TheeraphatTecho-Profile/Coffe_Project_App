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
  altitude: number | null;
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

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Settings: undefined;
};
