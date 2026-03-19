import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

const APP_VERSION = 'V2.4.0';

interface MenuItem {
  icon: string;
  label: string;
  hasNotification?: boolean;
  isDestructive?: boolean;
  onPress?: () => void;
}

const GENERAL_SETTINGS: MenuItem[] = [
  { icon: 'person-outline', label: 'แก้ไขโปรไฟล์' },
  { icon: 'notifications-outline', label: 'การแจ้งเตือน', hasNotification: true },
  { icon: 'settings-outline', label: 'ตั้งค่าแอป' },
];

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ออกจากระบบ', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        },
      ]
    );
  };

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
      <Text style={[styles.menuLabel, item.isDestructive && styles.menuLabelDestructive]}>
        {item.label}
      </Text>
      <View style={styles.menuRight}>
        {item.hasNotification && <View style={styles.notificationDot} />}
        <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );

  const userName = user?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้งาน';
  const userEmail = user?.email || '';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>สวนกาแฟเลย</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SettingsMain')}>
            <Ionicons name="settings-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
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
            <Text style={styles.userSince}>{userEmail ? userEmail : 'สมาชิกใหม่'}</Text>

            {/* Level badge */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>เกษตรกร</Text>
            </View>

            {/* Farm count */}
            <View style={styles.farmCountCard}>
              <Text style={styles.farmCountValue}>-</Text>
              <Text style={styles.farmCountLabel}>จำนวนสวน</Text>
            </View>
          </View>

          {/* Settings sections (light background) */}
          <View style={styles.settingsContainer}>
            {/* General settings */}
            <Text style={styles.sectionTitle}>การตั้งค่าทั่วไป</Text>
            <View style={styles.menuCard}>
              {GENERAL_SETTINGS.map(renderMenuItem)}
            </View>

            {/* Support */}
            <Text style={styles.sectionTitle}>การสนับสนุน</Text>
            <View style={styles.menuCard}>
              {renderMenuItem({ icon: 'help-circle-outline', label: 'ช่วยเหลือ' }, 0)}
              {renderMenuItem({ icon: 'log-out-outline', label: 'ออกจากระบบ', isDestructive: true, onPress: handleLogout }, 1)}
            </View>

            {/* App footer */}
            <View style={styles.footer}>
              <Ionicons name="cafe" size={32} color={COLORS.textLight} />
              <Text style={styles.footerText}>SUAN KAFE LOEI {APP_VERSION}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const DARK_BG = '#2A1F14';
const DARK_SURFACE = '#3D2E1F';

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
    backgroundColor: COLORS.secondary + '30', paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginBottom: SPACING.xxl,
  },
  levelText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.secondary },

  // Farm count
  farmCountCard: {
    backgroundColor: DARK_SURFACE, borderRadius: RADIUS.xl, paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxxxl, alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  farmCountValue: { fontSize: FONTS.sizes.xxxl, fontWeight: '700', color: COLORS.white },
  farmCountLabel: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.6)' },

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
  menuLabel: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
  menuLabelDestructive: { color: COLORS.error },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  notificationDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.secondary,
  },

  // Footer
  footer: { alignItems: 'center', paddingVertical: SPACING.xxxl, gap: SPACING.sm },
  footerText: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, letterSpacing: 1 },
});
