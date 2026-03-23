import React, { useState, useEffect, useCallback } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MessagingService, Conversation } from '../../lib/messagingService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: any;
};

export const ConversationsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const data = await MessagingService.getConversations(user.uid);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = MessagingService.subscribeToConversations(
      user.uid,
      (updatedConversations) => {
        setConversations(updatedConversations);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
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
    if (minutes < 60) return `${minutes} นาที`;
    if (hours < 24) return `${hours} ชม.`;
    if (days < 7) return `${days} วัน`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const other = conversation.participants.find(p => p.id !== user?.uid);
    return other || conversation.participants[0];
  };

  const handleConversationPress = async (conversation: Conversation) => {
    if (!user) return;

    // Mark as read
    await MessagingService.markConversationAsRead(conversation.id, user.uid);

    // Navigate to chat
    const other = getOtherParticipant(conversation);
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      otherUser: other,
    });
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await MessagingService.deleteConversation(conversationId);
    setConversations(prev => prev.filter(c => c.id !== conversationId));
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const other = getOtherParticipant(item);
    const hasUnread = item.unread_count > 0;

    return (
      <TouchableOpacity
        style={[styles.conversationCard, hasUnread && styles.conversationUnread]}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {other.avatar ? (
            <Image source={{ uri: other.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{other.name?.charAt(0) || 'U'}</Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.userNameUnread]}>
              {other.name}
            </Text>
            <Text style={styles.timeText}>{formatDate(item.updated_at)}</Text>
          </View>
          <View style={styles.lastMessageRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.last_message?.content || 'เริ่มการสนทนา'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color={COLORS.borderLight} />
      <Text style={styles.emptyTitle}>ยังไม่มีข้อความ</Text>
      <Text style={styles.emptyText}>
        เริ่มสนทนากับเกษตรกรคนอื่นๆ ในชุมชน
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ข้อความ</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SearchUsers')}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="mail-unread" size={20} color={COLORS.primary} />
          <Text style={styles.unreadBannerText}>
            คุณมี {totalUnread} ข้อความที่ยังไม่ได้อ่าน
          </Text>
        </View>
      )}

      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
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
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  unreadBannerText: { fontSize: FONTS.sizes.sm, color: COLORS.primary },
  listContent: { padding: SPACING.xl, flexGrow: 1 },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  conversationUnread: {
    backgroundColor: `${COLORS.primary}05`,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  avatarContainer: { marginRight: SPACING.md },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white },
  conversationContent: { flex: 1 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
  userNameUnread: { fontWeight: '700' },
  timeText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  lastMessageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  lastMessage: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  lastMessageUnread: { color: COLORS.text, fontWeight: '500' },
  unreadBadge: { backgroundColor: COLORS.error, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: SPACING.xs },
  unreadText: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.white },
  deleteButton: { padding: SPACING.xs, marginLeft: SPACING.xs },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
});

export default ConversationsScreen;
