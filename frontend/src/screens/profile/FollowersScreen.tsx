import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SocialService, Follow } from '../../lib/socialService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: any;
  route: { params?: { userId?: string } };
};

export const FollowersScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      const userId = route.params?.userId || user?.uid;
      if (!userId) return;
      
      const data = await SocialService.getFollowers(userId);
      setFollowers(data);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFollowers();
    setRefreshing(false);
  };

  const renderFollower = ({ item }: { item: Follow }) => (
    <TouchableOpacity 
      style={styles.followerCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item.follower_id })}
    >
      <View style={styles.avatarContainer}>
        {item.follower_avatar ? (
          <Image source={{ uri: item.follower_avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.follower_name?.charAt(0) || 'U'}</Text>
          </View>
        )}
      </View>
      <View style={styles.followerInfo}>
        <Text style={styles.followerName}>{item.follower_name}</Text>
        <Text style={styles.followerMeta}>
          เริ่มติดตามเมื่อ {item.created_at?.toDate?.().toLocaleDateString('th-TH') || ''}
        </Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>ติดตาม</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={COLORS.borderLight} />
      <Text style={styles.emptyTitle}>ยังไม่มีผู้ติดตาม</Text>
      <Text style={styles.emptyText}>แชร์ความรู้เพิ่มเพื่อให้คนติดตาม</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ผู้ติดตาม ({followers.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={followers}
        keyExtractor={item => item.id}
        renderItem={renderFollower}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: { padding: SPACING.xl, flexGrow: 1 },
  followerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatarContainer: { marginRight: SPACING.md },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white },
  followerInfo: { flex: 1 },
  followerName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  followerMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  followButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  followButtonText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.white },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm },
});

export default FollowersScreen;
