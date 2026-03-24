import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CommunityStackParamList } from '../../types/navigation';
import { CommunityService, CommunityPost, CommunityComment } from '../../lib/community/communityService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'PostDetail'>;
  route: RouteProp<CommunityStackParamList, 'PostDetail'>;
};

export const PostDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { postId } = route.params;
  const { user } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [postData, commentsData] = await Promise.all([
        CommunityService.getPostById(postId),
        CommunityService.getComments(postId),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLikePost = async () => {
    if (!user || !post) return;
    try {
      const newHasLiked = await CommunityService.likePost(post.id, user.uid);
      setPost(prev => prev ? {
        ...prev,
        likes_count: newHasLiked ? prev.likes_count + 1 : prev.likes_count - 1,
        user_liked: newHasLiked,
      } : null);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด');
    }
  };

  const handleLikeComment = async (commentId: string, hasLiked: boolean) => {
    if (!user) return;
    try {
      const newHasLiked = await CommunityService.likeComment(commentId, user.uid);
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, likes_count: newHasLiked ? c.likes_count + 1 : c.likes_count - 1, user_liked: newHasLiked }
            : c
        )
      );
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด');
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim() || !post) return;

    setSubmitting(true);
    try {
      await CommunityService.addComment(post.id, user.uid, user.displayName || 'Unknown', newComment.trim());
      setNewComment('');
      await loadData();
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มความคิดเห็นได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert('ลบความคิดเห็น', 'คุณต้องการลบความคิดเห็นนี้หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          try {
            await CommunityService.deleteComment(commentId, postId);
            await loadData();
          } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด');
          }
        },
      },
    ]);
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return COLORS.warning;
      case 'tips': return COLORS.success;
      case 'share': return COLORS.info;
      case 'market': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getPostTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      question: 'ถาม-ตอบ',
      share: 'แชร์ประสบการณ์',
      tips: 'เทคนิค/ความรู้',
      market: 'ซื้อ-ขาย',
      announcement: 'ประกาศ',
    };
    return labels[type] || type;
  };

  if (loading || !post) {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดโพสต์</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <View style={styles.authorAvatar}>
                <Text style={styles.avatarText}>{post.author_name?.charAt(0) || 'U'}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author_name}</Text>
                <Text style={styles.postMeta}>{post.author_province} • {formatDate(post.created_at)}</Text>
              </View>
            </View>

            <View style={[styles.postTypeTag, { backgroundColor: `${getPostTypeColor(post.post_type)}15` }]}>
              <Text style={[styles.postTypeText, { color: getPostTypeColor(post.post_type) }]}>
                {getPostTypeLabel(post.post_type)}
              </Text>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            {post.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.postImage} />
            )}

            {post.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {post.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.postStats}>
              <TouchableOpacity style={styles.statItem} onPress={handleLikePost}>
                <Ionicons 
                  name={post.user_liked ? 'heart' : 'heart-outline'} 
                  size={22} 
                  color={post.user_liked ? COLORS.error : COLORS.textSecondary} 
                />
                <Text style={[styles.statText, post.user_liked && { color: COLORS.error }]}>
                  {post.likes_count} ถูกใจ
                </Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={22} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{post.comments_count} ความคิดเห็น</Text>
              </View>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>ความคิดเห็น ({comments.length})</Text>

            {comments.map(comment => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={[styles.commentAvatar, { backgroundColor: COLORS.info }]}>
                    <Text style={styles.commentAvatarText}>{comment.author_name?.charAt(0) || 'U'}</Text>
                  </View>
                  <View style={styles.commentInfo}>
                    <Text style={styles.commentAuthor}>{comment.author_name}</Text>
                    <Text style={styles.commentMeta}>{formatDate(comment.created_at)}</Text>
                  </View>
                  {user?.uid === comment.author_id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <TouchableOpacity 
                  style={styles.commentLike}
                  onPress={() => handleLikeComment(comment.id, !!comment.user_liked)}
                >
                  <Ionicons 
                    name={comment.user_liked ? 'heart' : 'heart-outline'} 
                    size={16} 
                    color={comment.user_liked ? COLORS.error : COLORS.textSecondary} 
                  />
                  <Text style={[styles.commentLikeText, comment.user_liked && { color: COLORS.error }]}>
                    {comment.likes_count}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {comments.length === 0 && (
              <View style={styles.noComments}>
                <Ionicons name="chatbubbles-outline" size={40} color={COLORS.borderLight} />
                <Text style={styles.noCommentsText}>ยังไม่มีความคิดเห็น</Text>
                <Text style={styles.noCommentsHint}>เป็นคนแรกที่แสดงความคิดเห็น</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.commentInputContainer}>
          <View style={styles.commentInputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="เขียนความคิดเห็น..."
              placeholderTextColor={COLORS.textSecondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newComment.trim() || submitting) && styles.sendButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              <Ionicons name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  content: { flex: 1 },
  postContainer: { backgroundColor: COLORS.white, padding: SPACING.xl },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  authorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white },
  authorInfo: { flex: 1, marginLeft: SPACING.md },
  authorName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.text },
  postMeta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  postTypeTag: { alignSelf: 'flex-start', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, marginBottom: SPACING.md },
  postTypeText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  postTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  postContent: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24 },
  postImage: { width: '100%', height: 220, borderRadius: RADIUS.lg, marginTop: SPACING.lg },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.lg, gap: SPACING.xs },
  tag: { backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm },
  tagText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '500' },
  postStats: { flexDirection: 'row', marginTop: SPACING.xl, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.borderLight, gap: SPACING.xl },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  statText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  commentsSection: { padding: SPACING.xl, backgroundColor: COLORS.background },
  commentsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  commentCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.white },
  commentInfo: { flex: 1, marginLeft: SPACING.sm },
  commentAuthor: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  commentMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  commentContent: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22 },
  commentLike: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 4 },
  commentLikeText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  noComments: { alignItems: 'center', paddingVertical: SPACING.xxl },
  noCommentsText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.md },
  noCommentsHint: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  commentInputContainer: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  commentInputWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  commentInput: { flex: 1, backgroundColor: COLORS.background, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.sizes.md, maxHeight: 100 },
  sendButton: { width: 40, height: 40, backgroundColor: COLORS.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
});

export default PostDetailScreen;
