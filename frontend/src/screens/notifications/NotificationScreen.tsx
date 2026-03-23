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
import { NotificationService, Notification } from '../../lib/notifications/notificationService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: any;
};

const NOTIFICATION_ICONS: Record<string, { icon: string; color: string }> = {
  comment: { icon: 'chatbubble', color: COLORS.info },
  like: { icon: 'heart', color: COLORS.error },
  follow: { icon: 'person-add', color: COLORS.success },
  mention: { icon: 'at', color: COLORS.warning },
  harvest: { icon: 'basket', color: COLORS.primary },
  price: { icon: 'trending-up', color: COLORS.success },
  weather: { icon: 'cloud', color: COLORS.info },
  system: { icon: 'information-circle', color: COLORS.textSecondary },
};

export const NotificationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await NotificationService.getNotifications(user.uid);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      user.uid,
      (newNotifications) => {
        setNotifications(newNotifications);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    await NotificationService.markAsRead(notificationId, user.uid);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await NotificationService.markAllAsRead(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await NotificationService.updateBadgeCount(0);
  };

  const handleDelete = async (notificationId: string) => {
    await NotificationService.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationPress = (notification: Notification) => {
    handleMarkAsRead(notification.id);

    switch (notification.type) {
      case 'comment':
      case 'like':
        if (notification.data.post_id) {
          navigation.navigate('Community', {
            screen: 'PostDetail',
            params: { postId: notification.data.post_id },
          });
        }
        break;
      case 'follow':
        if (notification.data.user_id) {
          navigation.navigate('ProfileTab');
        }
        break;
      case 'harvest':
        if (notification.data.harvest_id) {
          navigation.navigate('HarvestTab');
        }
        break;
      case 'price':
        navigation.navigate('PriceTab');
        break;
      default:
        break;
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
    if (hours < 24) return `${hours} ชม.ที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.system;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconData = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.notificationUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconData.color}15` }]}>
          <Ionicons name={iconData.icon as any} size={24} color={iconData.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, !item.read && styles.notificationTitleUnread]}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={styles.notificationBody}>{item.body}</Text>
        </View>

        <View style={styles.notificationActions}>
          {!item.read && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMarkAsRead(item.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={64} color={COLORS.borderLight} />
      <Text style={styles.emptyTitle}>ไม่มีการแจ้งเตือน</Text>
      <Text style={styles.emptyText}>
        การแจ้งเตือนจากกิจกรรมต่างๆ จะปรากฏที่นี่
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllRead}>อ่านทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="mail-unread" size={20} color={COLORS.primary} />
          <Text style={styles.unreadText}>คุณมี {unreadCount} การแจ้งเตือนที่ยังไม่ได้อ่าน</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
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
  markAllRead: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  unreadText: { fontSize: FONTS.sizes.sm, color: COLORS.primary },
  listContent: { padding: SPACING.xl, flexGrow: 1 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  notificationUnread: {
    backgroundColor: `${COLORS.primary}05`,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  notificationContent: { flex: 1, marginLeft: SPACING.md },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationTitle: { fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.text },
  notificationTitleUnread: { fontWeight: '700' },
  notificationTime: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  notificationBody: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4, lineHeight: 20 },
  notificationActions: { flexDirection: 'row', gap: SPACING.xs },
  actionButton: { padding: SPACING.xs },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
});

export default NotificationScreen;
