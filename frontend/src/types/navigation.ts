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
  AddFarmStep1: undefined;
  AddFarmStep2: undefined;
  AddFarmStep3: undefined;
  AddFarmStep4: undefined;
  FarmDetail: { farmId: string };
};

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
