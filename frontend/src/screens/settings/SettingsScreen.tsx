import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { useLogout } from '../../hooks';

type RootStackParamList = {
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, toggleTheme } = useTheme();
  const { requestLogout } = useLogout();

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    danger = false 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons name={icon as any} size={20} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>การตั้งค่า</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile section */}
          <Text style={styles.sectionTitle}>โปรไฟล์</Text>
          <View style={styles.section}>
            <SettingItem
              icon="person-outline"
              title="แก้ไขโปรไฟล์"
              subtitle="เปลี่ยนชื่อ อีเมล รูปภาพ"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <SettingItem
              icon="lock-closed-outline"
              title="เปลี่ยนรหัสผ่าน"
              subtitle="อัปเดตรหัสผ่านของคุณ"
              onPress={() => navigation.navigate('ChangePassword')}
            />
          </View>

          {/* Appearance */}
          <Text style={styles.sectionTitle}>การแสดงผล</Text>
          <View style={styles.section}>
            <SettingItem
              icon="moon-outline"
              title="โหมดมืด"
              subtitle="เปลี่ยนธีมแอป"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              }
            />
          </View>

          {/* Notifications */}
          <Text style={styles.sectionTitle}>การแจ้งเตือน</Text>
          <View style={styles.section}>
            <SettingItem
              icon="notifications-outline"
              title="การแจ้งเตือน"
              subtitle="จัดการการแจ้งเตือน"
            />
            <SettingItem
              icon="mail-outline"
              title="อีเมลแจ้งเตือน"
              subtitle="รับการแจ้งเตือนทางอีเมล"
            />
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>เกี่ยวกับ</Text>
          <View style={styles.section}>
            <SettingItem
              icon="document-text-outline"
              title="ข้อตกลงและเงื่อนไข"
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="นโยบายความเป็นส่วนตัว"
            />
            <SettingItem
              icon="information-circle-outline"
              title="เวอร์ชันแอป"
              subtitle="V2.4.0"
            />
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <SettingItem
              icon="log-out-outline"
              title="ออกจากระบบ"
              onPress={requestLogout}
              danger
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl },
  sectionTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.xl, marginBottom: SPACING.sm, letterSpacing: 0.5 },
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  settingIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceWarm, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  settingIconDanger: { backgroundColor: COLORS.errorLight },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
  settingTitleDanger: { color: COLORS.error },
  settingSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
});
