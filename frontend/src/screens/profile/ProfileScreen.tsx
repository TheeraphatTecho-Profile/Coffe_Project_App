import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { FarmService, HarvestService } from '../../lib/firebaseDb';

const APP_VERSION = 'V2.4.0';

interface MenuItem {
  icon: string;
  label: string;
  detail?: string;
  hasNotification?: boolean;
  isDestructive?: boolean;
  onPress?: () => void;
}

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();
  const [farmCount, setFarmCount] = useState(0);
  const [harvestCount, setHarvestCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [count, summary, harvests] = await Promise.all([
        FarmService.count(user.uid),
        HarvestService.getSummary(user.uid),
        HarvestService.getAll(user.uid),
      ]);
      setFarmCount(count);
      setTotalIncome(summary.totalIncome);
      setHarvestCount(harvests.length);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await signOut();
      } catch (err) {
        console.error('Logout failed:', err);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis.confirm === 'function'
        ? globalThis.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')
        : true;
      if (confirmed) {
        void doLogout();
      }
      return;
    }

    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ออกจากระบบ', 
          style: 'destructive',
          onPress: async () => {
            await doLogout();
          }
        },
      ]
    );
  };

  const GENERAL_SETTINGS: MenuItem[] = [
    { icon: 'person-outline', label: 'แก้ไขโปรไฟล์', onPress: () => { /* TODO: navigate to EditProfile */ } },
    { icon: 'notifications-outline', label: 'การแจ้งเตือน', onPress: () => { /* TODO: navigate to Notifications */ } },
    { icon: 'settings-outline', label: 'ตั้งค่าแอป', onPress: () => { try { navigation.navigate('Settings', { screen: 'SettingsMain' }); } catch { /* noop */ } } },
  ];

  const DATA_SETTINGS: MenuItem[] = [
    { icon: 'leaf-outline', label: 'สวนของฉัน', detail: `${farmCount} แห่ง`, onPress: () => { try { navigation.navigate('Main', { screen: 'FarmTab' }); } catch { /* noop */ } } },
    { icon: 'basket-outline', label: 'ประวัติเก็บเกี่ยว', detail: `${harvestCount} รายการ`, onPress: () => { try { navigation.navigate('Main', { screen: 'HarvestTab' }); } catch { /* noop */ } } },
    { icon: 'bar-chart-outline', label: 'รายงานวิเคราะห์', onPress: () => { try { navigation.navigate('Main', { screen: 'PriceTab' }); } catch { /* noop */ } } },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.menuItem} 
      activeOpacity={0.7}
      onPress={item.onPress}
    >
      <View style={[styles.menuIcon, item.isDestructive && styles.menuIconDestructive]}>
        <Ionicons
          name={item.icon as any}
          size={22}
          color={item.isDestructive ? COLORS.error : COLORS.textSecondary}
        />
      </View>
      <View style={styles.menuLabelWrap}>
        <Text style={[styles.menuLabel, item.isDestructive && styles.menuLabelDestructive]}>
          {item.label}
        </Text>
        {item.detail && <Text style={styles.menuDetail}>{item.detail}</Text>}
      </View>
      <View style={styles.menuRight}>
        {item.hasNotification && <View style={styles.notificationDot} />}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );

  const userName = user?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้งาน';
  const userEmail = user?.email || '';
  const formatNumber = (n: number): string => n.toLocaleString('th-TH');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
          <TouchableOpacity onPress={() => { try { navigation.navigate('Settings', { screen: 'SettingsMain' }); } catch { /* noop */ } }}>
            <Ionicons name="settings-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />
          }
        >
          {/* Profile hero section (dark background) */}
          <View style={styles.heroSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color={COLORS.textLight} />
              </View>
            </View>

            {/* Name & info */}
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userSince}>{userEmail || 'สมาชิกใหม่'}</Text>

            {/* Level badge */}
            <View style={styles.levelBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.secondary} />
              <Text style={styles.levelText}>เกษตรกร</Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{farmCount}</Text>
                <Text style={styles.statLabel}>สวน</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{harvestCount}</Text>
                <Text style={styles.statLabel}>เก็บเกี่ยว</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalIncome > 0 ? formatNumber(totalIncome) : '0'}</Text>
                <Text style={styles.statLabel}>รายได้ (฿)</Text>
              </View>
            </View>
          </View>

          {/* Settings sections (light background) */}
          <View style={styles.settingsContainer}>
            {/* Data & Farm */}
            <Text style={styles.sectionTitle}>ข้อมูลของฉัน</Text>
            <View style={styles.menuCard}>
              {DATA_SETTINGS.map(renderMenuItem)}
            </View>

            {/* General settings */}
            <Text style={styles.sectionTitle}>การตั้งค่าทั่วไป</Text>
            <View style={styles.menuCard}>
              {GENERAL_SETTINGS.map(renderMenuItem)}
            </View>

            {/* Support & Logout */}
            <Text style={styles.sectionTitle}>อื่นๆ</Text>
            <View style={styles.menuCard}>
              {renderMenuItem({ icon: 'help-circle-outline', label: 'ช่วยเหลือ & ติดต่อ' }, 0)}
              {renderMenuItem({ icon: 'document-text-outline', label: 'นโยบายความเป็นส่วนตัว' }, 1)}
              {renderMenuItem({ icon: 'log-out-outline', label: 'ออกจากระบบ', isDestructive: true, onPress: handleLogout }, 2)}
            </View>

            {/* App footer */}
            <View style={styles.footer}>
              <Ionicons name="cafe" size={28} color={COLORS.textLight} />
              <Text style={styles.footerText}>SUAN KAFE LOEI {APP_VERSION}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const DARK_BG = '#1A3C2A';
const DARK_SURFACE = 'rgba(255,255,255,0.1)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_BG },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, backgroundColor: DARK_BG,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.white },
  headerAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.secondary + '30',
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero section
  heroSection: {
    backgroundColor: DARK_BG, alignItems: 'center', paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  avatarContainer: { marginBottom: SPACING.lg },
  avatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: DARK_SURFACE,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.secondary,
  },
  userName: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.xs },
  userSince: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)', marginBottom: SPACING.md },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.secondary + '30', paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginBottom: SPACING.xxl,
  },
  levelText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary },

  // Stats row
  statsRow: {
    flexDirection: 'row', backgroundColor: DARK_SURFACE, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  statLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: SPACING.xs },

  // Settings
  settingsContainer: {
    backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxxxl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: SPACING.md, marginTop: SPACING.md,
  },
  menuCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden',
    marginBottom: SPACING.lg, ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceWarm,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  menuIconDestructive: { backgroundColor: COLORS.errorLight },
  menuLabelWrap: { flex: 1 },
  menuLabel: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
  menuDetail: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: 2 },
  menuLabelDestructive: { color: COLORS.error },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  notificationDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.secondary,
  },

  // Footer
  footer: { alignItems: 'center', paddingVertical: SPACING.xxxl, gap: SPACING.sm },
  footerText: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, letterSpacing: 1 },
});
