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

export const FollowingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    try {
      const userId = route.params?.userId || user?.uid;
      if (!userId) return;
      
      const data = await SocialService.getFollowing(userId);
      setFollowing(data);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFollowing();
    setRefreshing(false);
  };

  const handleUnfollow = async (followingId: string) => {
    if (!user) return;
    
    try {
      await SocialService.unfollowUser(user.uid, followingId);
      setFollowing(prev => prev.filter(f => f.following_id !== followingId));
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  const renderUser = ({ item }: { item: Follow }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item.following_id })}
    >
      <View style={styles.avatarContainer}>
        {item.following_avatar ? (
          <Image source={{ uri: item.following_avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.following_name?.charAt(0) || 'U'}</Text>
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.following_name}</Text>
        {item.following_province && (
          <Text style={styles.userMeta}>{item.following_province}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.unfollowButton}
        onPress={() => handleUnfollow(item.following_id)}
      >
        <Text style={styles.unfollowButtonText}>เลิกติดตาม</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="person-add-outline" size={64} color={COLORS.borderLight} />
      <Text style={styles.emptyTitle}>ยังไม่ได้ติดตามใคร</Text>
      <Text style={styles.emptyText}>ติดตามเกษตรกรที่สนใจเพื่อรับข่าวสาร</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>กำลังติดตาม ({following.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={following}
        keyExtractor={item => item.id}
        renderItem={renderUser}
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatarContainer: { marginRight: SPACING.md },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.info, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white },
  userInfo: { flex: 1 },
  userName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  userMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  unfollowButton: { backgroundColor: COLORS.borderLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  unfollowButtonText: { fontSize: FONTS.sizes.sm, fontWeight: '500', color: COLORS.textSecondary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm },
});

export default FollowingScreen;
