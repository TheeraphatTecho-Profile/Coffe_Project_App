import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '../../types/navigation';
import { CommunityService, CommunityGroup } from '../../lib/community/communityService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'Groups'>;
};

const REGION_GROUPS = [
  { 
    id: 'north', 
    name: 'ภาคเหนือ', 
    icon: 'leaf-outline',
    color: '#4CAF50',
    provinces: ['เชียงใหม่', 'เชียงราย', 'ลำปาง', 'ลำพูน', 'แม่ฮ่องสอน', 'น่าน', 'พะเยา', 'อุตรดิตถ์', 'ตาก', 'สุโขทัย']
  },
  { 
    id: 'northeast', 
    name: 'ภาคอีสาน', 
    icon: 'location-outline',
    color: '#FF9800',
    provinces: ['ขอนแก่น', 'อุดรธานี', 'มหาสารคาม', 'ร้อยเอ็ด', 'นครพนม', 'สกลนคร', 'หนองคาย', 'ศรีสะเกษ', 'อุบลราชธานี', 'กาฬสินธุ์', 'ชัยภูมิ', 'ยโสธร']
  },
  { 
    id: 'central', 
    name: 'ภาคกลาง', 
    icon: 'business-outline',
    color: '#2196F3',
    provinces: ['กรุงเทพฯ', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'นครปฐม', 'สมุทรสาคร', 'สมุทรสงคราม', 'ลพบุรี', 'สระบุรี', 'พระนครศรีอยุธยา', 'อ่างทอง', 'ชัยนาท', 'สิงห์บุรี']
  },
  { 
    id: 'east', 
    name: 'ภาคตะวันออก', 
    icon: 'water-outline',
    color: '#00BCD4',
    provinces: ['ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'ปราจีนบุรี', 'ฉะเชิงเทรา', 'สระแก้ว', 'นครนายก']
  },
  { 
    id: 'south', 
    name: 'ภาคใต้', 
    icon: 'sunny-outline',
    color: '#9C27B0',
    provinces: ['สุราษฎร์ธานี', 'นครศรีธรรมราช', 'ภูเก็ต', 'กระบี่', 'ตรัง', 'พัทลุง', 'สงขลา', 'สตูล', 'ปัตตานี', 'ยะลา', 'นราธิวาส', 'เพชรบุรี', 'ประจวบคีรีขันธ์']
  },
];

export const GroupsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const loadGroups = async () => {
    try {
      const data = await CommunityService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const getRegionGroup = (regionId: string) => {
    return REGION_GROUPS.find(r => r.id === regionId);
  };

  const getProvincesInRegion = (regionId: string) => {
    const region = REGION_GROUPS.find(r => r.id === regionId);
    return region?.provinces || [];
  };

  const filteredGroups = selectedRegion
    ? groups.filter(g => getProvincesInRegion(selectedRegion).includes(g.province || ''))
    : groups;

  const groupStats = {
    total: groups.length,
    members: groups.reduce((sum, g) => sum + g.member_count, 0),
    posts: groups.reduce((sum, g) => sum + g.post_count, 0),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>กลุ่มชุมชน</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{groupStats.total}</Text>
          <Text style={styles.statLabel}>กลุ่ม</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="person" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>{groupStats.members.toLocaleString()}</Text>
          <Text style={styles.statLabel}>สมาชิก</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color={COLORS.info} />
          <Text style={styles.statValue}>{groupStats.posts.toLocaleString()}</Text>
          <Text style={styles.statLabel}>โพสต์</Text>
        </View>
      </View>

      <View style={styles.regionFilter}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionFilterContent}
        >
          <TouchableOpacity
            style={[styles.regionChip, !selectedRegion && styles.regionChipActive]}
            onPress={() => setSelectedRegion(null)}
          >
            <Ionicons name="apps" size={16} color={!selectedRegion ? COLORS.white : COLORS.textSecondary} />
            <Text style={[styles.regionChipText, !selectedRegion && styles.regionChipTextActive]}>
              ทั้งหมด
            </Text>
          </TouchableOpacity>
          {REGION_GROUPS.map(region => (
            <TouchableOpacity
              key={region.id}
              style={[styles.regionChip, selectedRegion === region.id && styles.regionChipActive]}
              onPress={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
            >
              <Ionicons name={region.icon as any} size={16} color={selectedRegion === region.id ? COLORS.white : region.color} />
              <Text style={[styles.regionChipText, selectedRegion === region.id && styles.regionChipTextActive]}>
                {region.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {!selectedRegion && REGION_GROUPS.map(region => {
          const regionGroups = groups.filter(g => region.provinces.includes(g.province || ''));
          if (regionGroups.length === 0) return null;
          
          return (
            <View key={region.id} style={styles.regionSection}>
              <View style={styles.regionSectionHeader}>
                <View style={[styles.regionIcon, { backgroundColor: `${region.color}15` }]}>
                  <Ionicons name={region.icon as any} size={20} color={region.color} />
                </View>
                <Text style={styles.regionTitle}>{region.name}</Text>
                <Text style={styles.regionCount}>{regionGroups.length} กลุ่ม</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.groupsScrollContent}
              >
                {regionGroups.map(group => (
                  <TouchableOpacity key={group.id} style={styles.groupCard}>
                    <View style={[styles.groupCover, { backgroundColor: region.color }]}>
                      {group.cover_image ? (
                        <Image source={{ uri: group.cover_image }} style={styles.groupCoverImage} />
                      ) : (
                        <Ionicons name="people" size={32} color={COLORS.white} />
                      )}
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
                      <Text style={styles.groupProvince}>{group.province}</Text>
                      <View style={styles.groupStats}>
                        <View style={styles.groupStat}>
                          <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.groupStatText}>{group.member_count}</Text>
                        </View>
                        <View style={styles.groupStat}>
                          <Ionicons name="chatbubbles-outline" size={14} color={COLORS.textSecondary} />
                          <Text style={styles.groupStatText}>{group.post_count}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}

        {selectedRegion && (
          <View style={styles.filteredGroups}>
            <Text style={styles.filteredGroupsTitle}>
              กลุ่มใน{REGION_GROUPS.find(r => r.id === selectedRegion)?.name}
            </Text>
            {filteredGroups.map(group => (
              <TouchableOpacity key={group.id} style={styles.filteredGroupCard}>
                <View style={[styles.filteredGroupAvatar, { backgroundColor: getRegionGroup(selectedRegion)?.color }]}>
                  <Ionicons name="people" size={24} color={COLORS.white} />
                </View>
                <View style={styles.filteredGroupInfo}>
                  <Text style={styles.filteredGroupName}>{group.name}</Text>
                  <Text style={styles.filteredGroupMeta}>{group.province} • {group.member_count} สมาชิก</Text>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>เข้าร่วม</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {groups.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>ยังไม่มีกลุ่ม</Text>
            <Text style={styles.emptyText}>
              กลุ่มชุมชนจะปรากฏที่นี่เมื่อมีการสร้าง
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity style={styles.createGroupFab}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  statsContainer: { flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, gap: SPACING.md },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xs },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  regionFilter: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  regionFilterContent: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, gap: SPACING.sm },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  regionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  regionChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  regionChipTextActive: { color: COLORS.white, fontWeight: '600' },
  content: { flex: 1, paddingTop: SPACING.lg },
  regionSection: { marginBottom: SPACING.xl },
  regionSectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, marginBottom: SPACING.md },
  regionIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  regionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginLeft: SPACING.sm, flex: 1 },
  regionCount: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  groupsScrollContent: { paddingHorizontal: SPACING.xl, gap: SPACING.md },
  groupCard: { width: 160, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  groupCover: { height: 60, justifyContent: 'center', alignItems: 'center' },
  groupCoverImage: { width: '100%', height: '100%' },
  groupInfo: { padding: SPACING.md },
  groupName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  groupProvince: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  groupStats: { flexDirection: 'row', marginTop: SPACING.sm, gap: SPACING.md },
  groupStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groupStatText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  filteredGroups: { paddingHorizontal: SPACING.xl },
  filteredGroupsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  filteredGroupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  filteredGroupAvatar: { width: 48, height: 48, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  filteredGroupInfo: { flex: 1, marginLeft: SPACING.md },
  filteredGroupName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  filteredGroupMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  joinButton: { backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  joinButtonText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.primary },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm },
  bottomSpacer: { height: 100 },
  createGroupFab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, backgroundColor: COLORS.primary, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
});

export default GroupsScreen;
