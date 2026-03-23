import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedButton } from '../../components/AnimatedButton';
import { Logo } from '../../components/Logo';
import { WeatherAlertService, WeatherAlertSettings, LOEI_WEATHER_THRESHOLDS } from '../../lib/weatherAlertService';
import { useAuth } from '../../context/AuthContext';
import { Farm, FarmService } from '../../lib/firebaseDb';

interface RouteParams {
  farmId?: string;
}

export const WeatherAlertSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { colors, spacing, typography, radius, shadows } = useTheme();
  
  const { farmId: initialFarmId } = route.params as RouteParams || {};
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>(initialFarmId || '');
  const [settings, setSettings] = useState<Partial<WeatherAlertSettings>>({
    enableFrostAlerts: true,
    frostThreshold: 4.0,
    enableRainAlerts: true,
    heavyRainThreshold: 15.0,
    enableStormAlerts: true,
    enableDroughtAlerts: true,
    droughtThreshold: 7,
    enableTemperatureAlerts: true,
    heatThreshold: 32.0,
    coldThreshold: 6.0,
    enableWindAlerts: false,
    windThreshold: 40.0,
    enableHumidityAlerts: false,
    humidityMinThreshold: 30,
    humidityMaxThreshold: 90,
    notificationHours: [6, 12, 24],
    pushNotifications: true,
    emailNotifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFarms();
    if (selectedFarm) {
      loadSettings();
    }
  }, [selectedFarm]);

  const loadFarms = async () => {
    try {
      if (user?.uid) {
        const farmsData = await FarmService.getAll(user.uid);
        setFarms(farmsData);
        if (!initialFarmId && farmsData.length > 0) {
          setSelectedFarm(farmsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  };

  const loadSettings = async () => {
    if (!user?.uid || !selectedFarm) return;
    
    try {
      const existingSettings = await WeatherAlertService.getAlertSettings(user.uid, selectedFarm);
      if (existingSettings) {
        setSettings(existingSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.uid || !selectedFarm) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกสวน');
      return;
    }

    setSaving(true);
    try {
      const settingsData = {
        userId: user.uid,
        farmId: selectedFarm,
        ...settings,
      } as Omit<WeatherAlertSettings, 'id' | 'createdAt' | 'updatedAt'>;

      const existingSettings = await WeatherAlertService.getAlertSettings(user.uid, selectedFarm);
      
      if (existingSettings?.id) {
        await WeatherAlertService.updateAlertSettings(existingSettings.id, settingsData);
      } else {
        await WeatherAlertService.createAlertSettings(settingsData);
      }

      if (Platform.OS === 'web') {
        globalThis.alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
        navigation.goBack();
        return;
      }

      Alert.alert(
        'สำเร็จ',
        'บันทึกการตั้งค่าเรียบร้อยแล้ว',
        [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof WeatherAlertSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addNotificationHour = (hour: number) => {
    const currentHours = settings.notificationHours || [];
    if (!currentHours.includes(hour)) {
      updateSetting('notificationHours', [...currentHours, hour].sort((a, b) => a - b));
    }
  };

  const removeNotificationHour = (hour: number) => {
    const currentHours = settings.notificationHours || [];
    updateSetting('notificationHours', currentHours.filter(h => h !== hour));
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || 'สวนไม่ระบุ';
  };

  const styles = React.useMemo(() => createStyles(colors, spacing, typography, radius, shadows), [colors, spacing, typography, radius, shadows]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ตั้งค่าการแจ้งเตือน</Text>
          <View style={styles.headerRight}>
            <Logo size="small" showText={false} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Farm Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>เลือกสวน</Text>
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                style={[
                  styles.farmOption,
                  selectedFarm === farm.id && styles.farmOptionSelected
                ]}
                onPress={() => setSelectedFarm(farm.id)}
              >
                <View style={styles.farmOptionLeft}>
                  <Ionicons 
                    name="leaf" 
                    size={20} 
                    color={selectedFarm === farm.id ? colors.textOnPrimary : colors.primary} 
                  />
                  <Text style={[
                    styles.farmOptionText,
                    selectedFarm === farm.id && styles.farmOptionTextSelected
                  ]}>
                    {farm.name}
                  </Text>
                </View>
                {selectedFarm === farm.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.textOnPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Temperature Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>การแจ้งเตือนอุณหภูมิ</Text>
              <Switch
                value={settings.enableTemperatureAlerts}
                onValueChange={(value) => updateSetting('enableTemperatureAlerts', value)}
              />
            </View>
            
            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>ความร้อน (°C)</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.heatThreshold?.toString()}
                  onChangeText={(text) => updateSetting('heatThreshold', parseFloat(text) || 32)}
                  keyboardType="numeric"
                  editable={settings.enableTemperatureAlerts}
                />
              </View>
              
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>ความหนาว (°C)</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.coldThreshold?.toString()}
                  onChangeText={(text) => updateSetting('coldThreshold', parseFloat(text) || 6)}
                  keyboardType="numeric"
                  editable={settings.enableTemperatureAlerts}
                />
              </View>
            </View>
          </View>

          {/* Rain Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>การแจ้งเตือนฝน</Text>
              <Switch
                value={settings.enableRainAlerts}
                onValueChange={(value) => updateSetting('enableRainAlerts', value)}
              />
            </View>
            
            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>ฝนหนัก (มม./ชม.)</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.heavyRainThreshold?.toString()}
                  onChangeText={(text) => updateSetting('heavyRainThreshold', parseFloat(text) || 15)}
                  keyboardType="numeric"
                  editable={settings.enableRainAlerts}
                />
              </View>
              
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>ภัยแล้ง (วัน)</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.droughtThreshold?.toString()}
                  onChangeText={(text) => updateSetting('droughtThreshold', parseInt(text) || 7)}
                  keyboardType="numeric"
                  editable={settings.enableRainAlerts}
                />
              </View>
            </View>
          </View>

          {/* Frost Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>การแจ้งเตือนความหนาว</Text>
              <Switch
                value={settings.enableFrostAlerts}
                onValueChange={(value) => updateSetting('enableFrostAlerts', value)}
              />
            </View>
            
            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>เกณฑ์ความหนาว (°C)</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.frostThreshold?.toString()}
                  onChangeText={(text) => updateSetting('frostThreshold', parseFloat(text) || 4)}
                  keyboardType="numeric"
                  editable={settings.enableFrostAlerts}
                />
              </View>
            </View>
          </View>

          {/* Wind Alerts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>การแจ้งเตือนลม</Text>
              <Switch
                value={settings.enableWindAlerts}
                onValueChange={(value) => updateSetting('enableWindAlerts', value)}
              />
            </View>
            
            <View style={styles.thresholdRow}>
              <View style={styles.thresholdItem}>
                <Text style={styles.thresholdLabel}>ความเร็วลม (กม./ชม.)</Text>
                <TextInput
                  style={styles.thresholdInput}
                  value={settings.windThreshold?.toString()}
                  onChangeText={(text) => updateSetting('windThreshold', parseFloat(text) || 40)}
                  keyboardType="numeric"
                  editable={settings.enableWindAlerts}
                />
              </View>
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>การแจ้งเตือน</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>แจ้งเตือนแบบ Push</Text>
              <Switch
                value={settings.pushNotifications}
                onValueChange={(value) => updateSetting('pushNotifications', value)}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>แจ้งเตือนทาง Email</Text>
              <Switch
                value={settings.emailNotifications}
                onValueChange={(value) => updateSetting('emailNotifications', value)}
              />
            </View>
          </View>

          {/* Notification Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>แจ้งเตือนล่วงหน้า (ชั่วโมง)</Text>
            
            <View style={styles.hoursContainer}>
              {[6, 12, 24, 48].map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourChip,
                    (settings.notificationHours || []).includes(hour) && styles.hourChipActive
                  ]}
                  onPress={() => {
                    if ((settings.notificationHours || []).includes(hour)) {
                      removeNotificationHour(hour);
                    } else {
                      addNotificationHour(hour);
                    }
                  }}
                >
                  <Text style={[
                    styles.hourChipText,
                    (settings.notificationHours || []).includes(hour) && styles.hourChipTextActive
                  ]}>
                    {hour}ชม.
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Loei-specific Information */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>🌍 ข้อมูลเฉพาะพื้นที่เลย</Text>
            <Text style={styles.infoText}>
              ค่าเริ่มต้นถูกปรับให้เหมาะสมกับสภาพอากาศที่สูงของจังหวัดเลย
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• ความเสี่ยงน้ำค้างแข็งสูงที่ความสูงเกิน 800 เมตร</Text>
              <Text style={styles.infoItem}>• ฤดูหนาว (พฤศจิกายน-กุมภาพันธ์) อุณหภูมิอาจต่ำถึง 0°C</Text>
              <Text style={styles.infoItem}>• ฤดูร้อน (มีนาคม-พฤษภาคม) อุณหภูมิอาจสูงถึง 35°C</Text>
            </View>
          </View>

          {/* Save Button */}
          <AnimatedButton
            title="บันทึกการตั้งค่า"
            onPress={handleSave}
            loading={saving}
            variant="primary"
            size="large"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any, spacing: any, typography: any, radius: any, shadows: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text },
  headerRight: { width: 32, height: 32 },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  section: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.text },

  // Farm Selection
  farmOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  farmOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  farmOptionLeft: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  farmOptionText: {
    fontSize: typography.sizes.md, fontWeight: '500', color: colors.text,
  },
  farmOptionTextSelected: {
    color: colors.textOnPrimary,
  },

  // Threshold Settings
  thresholdRow: {
    flexDirection: 'row', gap: spacing.md,
  },
  thresholdItem: {
    flex: 1,
  },
  thresholdLabel: {
    fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text,
    marginBottom: spacing.xs,
  },
  thresholdInput: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: typography.sizes.md, color: colors.text,
    borderWidth: 1, borderColor: colors.borderLight,
    textAlign: 'center',
  },

  // Settings
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  settingLabel: {
    fontSize: typography.sizes.md, color: colors.text,
  },

  // Notification Hours
  hoursContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  hourChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  hourChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  hourChipText: {
    fontSize: typography.sizes.sm, color: colors.text,
  },
  hourChipTextActive: {
    color: colors.textOnPrimary,
  },

  // Info Section
  infoSection: {
    backgroundColor: colors.secondary + '10', borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.secondary + '30',
  },
  infoTitle: {
    fontSize: typography.sizes.md, fontWeight: '600', color: colors.secondary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm, color: colors.text,
    lineHeight: 18, marginBottom: spacing.md,
  },
  infoList: { gap: spacing.xs },
  infoItem: {
    fontSize: typography.sizes.sm, color: colors.text,
    lineHeight: 16,
  },
});
