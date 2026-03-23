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
import { SocialService, UserProfile } from '../../lib/socialService';
import { CommunityService, CommunityPost } from '../../lib/community/communityService';
import { MessagingService } from '../../lib/messagingService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: any;
  route: { params?: { userId?: string } };
};

export const UserProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const targetUserId = route.params?.userId || user?.uid;
  const isOwnProfile = targetUserId === user?.uid;

  useEffect(() => {
    loadProfile();
  }, [targetUserId]);

  const loadProfile = async () => {
    if (!targetUserId) return;
    
    try {
      const [profileData, postsData] = await Promise.all([
        SocialService.getUserProfile(targetUserId),
        CommunityService.getPosts(undefined, undefined, 20),
      ]);
      
      const userPosts = postsData.filter(p => p.author_id === targetUserId);
      
      setProfile(profileData);
      setPosts(userPosts);
      
      if (!isOwnProfile && user) {
        const following = await SocialService.isFollowing(user.uid, targetUserId);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = async () => {
    if (!user || !profile || isOwnProfile || !targetUserId) return;

    try {
      const conversationId = await MessagingService.getOrCreateConversation(
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Unknown',
        user.photoURL || undefined,
        targetUserId,
        profile.display_name || profile.name || 'Unknown User',
        profile.avatar || undefined
      );

      navigation.navigate('Chat', {
        conversationId,
        otherUser: {
          id: targetUserId,
          name: profile.display_name || profile.name || 'Unknown User',
          avatar: profile.avatar || null,
        },
      });
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleFollow = async () => {
    if (!user || !profile || isOwnProfile) return;

    try {
      if (isFollowing) {
        await SocialService.unfollowUser(user.uid, targetUserId!);
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count - 1 } : null);
      } else {
        await SocialService.followUser(
          user.uid,
          user.displayName || 'Unknown',
          user.photoURL || undefined,
          targetUserId!
        );
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statValue}>{profile?.farm_count || 0}</Text>
        <Text style={styles.statLabel}>สวน</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => navigation.navigate('Followers', { userId: targetUserId })}
      >
        <Text style={styles.statValue}>{profile?.followers_count || 0}</Text>
        <Text style={styles.statLabel}>ผู้ติดตาม</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.statItem}
        onPress={() => navigation.navigate('Following', { userId: targetUserId })}
      >
        <Text style={styles.statValue}>{profile?.following_count || 0}</Text>
        <Text style={styles.statLabel}>กำลังติดตาม</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statValue}>{posts.length}</Text>
        <Text style={styles.statLabel}>โพสต์</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile?.display_name?.charAt(0) || profile?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>
            {profile?.display_name || profile?.name || 'Unknown User'}
          </Text>
          {profile?.province && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.locationText}>{profile.province}</Text>
            </View>
          )}
          {profile?.bio && (
            <Text style={styles.bioText}>{profile.bio}</Text>
          )}
        </View>
      </View>

      {!isOwnProfile && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Ionicons 
              name={isFollowing ? 'checkmark' : 'person-add'} 
              size={18} 
              color={isFollowing ? COLORS.primary : COLORS.white} 
            />
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={handleOpenChat}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />
            <Text style={styles.messageButtonText}>ข้อความ</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderStats()}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>โพสต์ของ {isOwnProfile ? 'คุณ' : profile?.display_name?.split(' ')[0] || 'เขา'}</Text>
      </View>
    </>
  );

  const renderPost = (post: CommunityPost) => (
    <TouchableOpacity key={post.id} style={styles.postCard}>
      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
      <View style={styles.postMeta}>
        <Text style={styles.postDate}>
          {(post.created_at as any)?.toDate?.().toLocaleDateString('th-TH') || ''}
        </Text>
        <View style={styles.postStats}>
          <Ionicons name="heart" size={14} color={COLORS.error} />
          <Text style={styles.postStatText}>{post.likes_count}</Text>
          <Ionicons name="chatbubble" size={14} color={COLORS.info} style={{ marginLeft: 12 }} />
          <Text style={styles.postStatText}>{post.comments_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyPosts = () => (
    <View style={styles.emptyPosts}>
      <Ionicons name="document-text-outline" size={48} color={COLORS.borderLight} />
      <Text style={styles.emptyPostsTitle}>ยังไม่มีโพสต์</Text>
      <Text style={styles.emptyPostsText}>
        {isOwnProfile ? 'แชร์ความรู้ให้ชุมชน' : 'ผู้ใช้นี้ยังไม่มีโพสต์'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'โปรไฟล์ของฉัน' : 'โปรไฟล์'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        
        {posts.length > 0 ? (
          posts.map(renderPost)
        ) : (
          renderEmptyPosts()
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  content: { flex: 1 },
  header: { padding: SPACING.xl, alignItems: 'center' },
  avatarContainer: { marginBottom: SPACING.md },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, fontWeight: '700', color: COLORS.white },
  profileInfo: { alignItems: 'center' },
  displayName: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginLeft: 4 },
  bioText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center', paddingHorizontal: SPACING.xl },
  actionButtons: { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.md, marginBottom: SPACING.lg },
  followButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, gap: SPACING.xs },
  followingButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary },
  followButtonText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.white },
  followingButtonText: { color: COLORS.primary },
  messageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.primary, gap: SPACING.xs },
  messageButtonText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.primary },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.borderLight, marginHorizontal: SPACING.xl },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  sectionHeader: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  postCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.xl, marginBottom: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.lg },
  postTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  postContent: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
  postMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  postDate: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  postStats: { flexDirection: 'row', alignItems: 'center' },
  postStatText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginLeft: 4 },
  emptyPosts: { alignItems: 'center', paddingVertical: SPACING.xxxxl },
  emptyPostsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.text, marginTop: SPACING.md },
  emptyPostsText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: 4 },
});

export default UserProfileScreen;
