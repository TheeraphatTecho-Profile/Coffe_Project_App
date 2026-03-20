import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '../../types/navigation';
import { CommunityService, CommunityPost } from '../../lib/community/communityService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'CommunityFeed'>;
};

const POST_TYPES = [
  { key: 'all', label: 'ทั้งหมด', icon: 'globe-outline' },
  { key: 'question', label: 'ถาม-ตอบ', icon: 'help-circle-outline' },
  { key: 'tips', label: 'เทคนิค', icon: 'bulb-outline' },
  { key: 'share', label: 'แชร์ประสบการณ์', icon: 'share-outline' },
  { key: 'market', label: 'ตลาด', icon: 'storefront-outline' },
];

export const CommunityScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      const type = selectedType === 'all' ? undefined : selectedType;
      const data = await CommunityService.getPosts(type);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: string, currentLikes: number, hasLiked: boolean) => {
    if (!user) return;
    
    try {
      const newHasLiked = await CommunityService.likePost(postId, user.uid);
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                likes_count: newHasLiked ? currentLikes + 1 : currentLikes - 1,
                user_liked: newHasLiked,
              }
            : post
        )
      );
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถกดไลค์ได้');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  const getPostTypeIcon = (type: string) => {
    const typeData = POST_TYPES.find(t => t.key === type);
    return typeData?.icon || 'document-text-outline';
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return COLORS.warning;
      case 'tips': return COLORS.success;
      case 'share': return COLORS.info;
      case 'market': return COLORS.primary;
      case 'announcement': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPost = (post: CommunityPost) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
    >
      {post.is_pinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={12} color={COLORS.white} />
          <Text style={styles.pinnedText}>ปักหมุด</Text>
        </View>
      )}

      <View style={styles.postHeader}>
        <View style={styles.authorAvatar}>
          <Text style={styles.avatarText}>
            {post.author_name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author_name}</Text>
          <Text style={styles.postMeta}>
            {post.author_province} • {formatDate(post.created_at)}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.postTypeTag}>
        <Ionicons 
          name={getPostTypeIcon(post.post_type) as any} 
          size={14} 
          color={getPostTypeColor(post.post_type)} 
        />
        <Text style={[styles.postTypeText, { color: getPostTypeColor(post.post_type) }]}>
          {POST_TYPES.find(t => t.key === post.post_type)?.label || post.post_type}
        </Text>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>

      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
      )}

      {post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(post.id, post.likes_count, !!post.user_liked)}
        >
          <Ionicons 
            name={post.user_liked ? 'heart' : 'heart-outline'} 
            size={20} 
            color={post.user_liked ? COLORS.error : COLORS.textSecondary} 
          />
          <Text style={[styles.actionText, post.user_liked && { color: COLORS.error }]}>
            {post.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>แชร์</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ชุมชนเกษตร</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Groups')}
          >
            <Ionicons name="people-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาในชุมชน..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilter}
        contentContainerStyle={styles.typeFilterContent}
      >
        {POST_TYPES.map(type => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeChip,
              selectedType === type.key && styles.typeChipActive
            ]}
            onPress={() => setSelectedType(type.key)}
          >
            <Ionicons 
              name={type.icon as any} 
              size={16} 
              color={selectedType === type.key ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[
              styles.typeChipText,
              selectedType === type.key && styles.typeChipTextActive
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.borderLight} />
            <Text style={styles.emptyTitle}>ยังไม่มีโพสต์</Text>
            <Text style={styles.emptyText}>
              เป็นคนแรกที่แชร์ความรู้ให้ชุมชน
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.createButtonText}>สร้างโพสต์</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPosts.map(renderPost)
        )}
      </ScrollView>
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
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text },
  headerActions: { flexDirection: 'row', gap: SPACING.md },
  headerButton: { padding: SPACING.xs },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  typeFilter: { maxHeight: 50 },
  typeFilterContent: { paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  typeChip: {
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
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  typeChipTextActive: { color: COLORS.white, fontWeight: '600' },
  feed: { flex: 1 },
  feedContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxxl, gap: SPACING.lg },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pinnedBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  pinnedText: { fontSize: FONTS.sizes.xs, color: COLORS.white, fontWeight: '600' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.white },
  authorInfo: { flex: 1, marginLeft: SPACING.md },
  authorName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  postMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  moreButton: { padding: SPACING.xs },
  postTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  postTypeText: { fontSize: FONTS.sizes.sm, fontWeight: '500' },
  postTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  postContent: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22 },
  postImage: { width: '100%', height: 180, borderRadius: RADIUS.md, marginTop: SPACING.md },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md, gap: SPACING.xs },
  tag: { backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  tagText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '500' },
  postActions: { flexDirection: 'row', marginTop: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight, gap: SPACING.xl },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  actionText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xl,
    gap: SPACING.xs,
  },
  createButtonText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.white },
});

export default CommunityScreen;
