// Notification Service - Push notifications for community activity
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface Notification {
  id: string;
  user_id: string;
  type: 'comment' | 'like' | 'follow' | 'mention' | 'system' | 'harvest' | 'price' | 'weather';
  title: string;
  body: string;
  data: {
    post_id?: string;
    comment_id?: string;
    user_id?: string;
    farm_id?: string;
    harvest_id?: string;
    group_id?: string;
    [key: string]: string | undefined;
  };
  read: boolean;
  created_at: Timestamp | Date;
}

export interface PushToken {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name?: string;
  updated_at: Timestamp | Date;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  // ==================== PUSH TOKENS ====================

  async registerPushToken(userId: string, token: string): Promise<void> {
    try {
      const tokensRef = collection(db, 'push_tokens');
      const q = query(tokensRef, where('user_id', '==', userId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(tokensRef, {
          user_id: userId,
          token,
          platform: Platform.OS as 'ios' | 'android' | 'web',
          updated_at: serverTimestamp(),
        });
      } else {
        const existingToken = snapshot.docs[0];
        await updateDoc(doc(db, 'push_tokens', existingToken.id), {
          token,
          updated_at: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  },

  async unregisterPushToken(userId: string): Promise<void> {
    try {
      const tokensRef = collection(db, 'push_tokens');
      const q = query(tokensRef, where('user_id', '==', userId));
      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'push_tokens', docSnap.id));
      }
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  },

  // ==================== IN-APP NOTIFICATIONS ====================

  async getNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  // ==================== CREATE NOTIFICATIONS ====================

  async notifyComment(
    postAuthorId: string,
    commenterName: string,
    postId: string,
    postTitle: string,
    commentId: string
  ): Promise<void> {
    if (postAuthorId === commenterName) return; // Don't notify own actions

    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        user_id: postAuthorId,
        type: 'comment',
        title: 'มีความคิดเห็นใหม่',
        body: `${commenterName} แสดงความคิดเห็นใน "${postTitle.slice(0, 30)}..."`,
        data: {
          post_id: postId,
          comment_id: commentId,
        },
        read: false,
        created_at: serverTimestamp(),
      });

      // Send push notification
      await this.sendPushNotification(postAuthorId, 'มีความคิดเห็นใหม่', `${commenterName} แสดงความคิดเห็นในโพสต์ของคุณ`);
    } catch (error) {
      console.error('Error creating comment notification:', error);
    }
  },

  async notifyLike(
    postAuthorId: string,
    likerName: string,
    postId: string,
    postTitle: string
  ): Promise<void> {
    if (postAuthorId === likerName) return;

    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        user_id: postAuthorId,
        type: 'like',
        title: 'มีคนถูกใจโพสต์ของคุณ',
        body: `${likerName} ถูกใจโพสต์ "${postTitle.slice(0, 30)}..."`,
        data: { post_id: postId },
        read: false,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  },

  async notifyFollow(
    targetUserId: string,
    followerName: string,
    followerId: string
  ): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        user_id: targetUserId,
        type: 'follow',
        title: 'มีคนติดตามคุณ',
        body: `${followerName} เริ่มติดตามคุณ`,
        data: { user_id: followerId },
        read: false,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating follow notification:', error);
    }
  },

  async notifyHarvestReminder(
    userId: string,
    farmName: string,
    daysUntilHarvest: number
  ): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        user_id: userId,
        type: 'harvest',
        title: 'เตือนเตรียมเก็บเกี่ยว',
        body: `สวน ${farmName} ควรเก็บเกี่ยวในอีก ${daysUntilHarvest} วัน`,
        data: {},
        read: false,
        created_at: serverTimestamp(),
      });

      await this.sendPushNotification(userId, 'เตือนเตรียมเก็บเกี่ยว', `สวน ${farmName} ควรเก็บเกี่ยวในอีก ${daysUntilHarvest} วัน`);
    } catch (error) {
      console.error('Error creating harvest notification:', error);
    }
  },

  async notifyPriceAlert(
    userId: string,
    coffeeType: string,
    price: number,
    trend: 'up' | 'down'
  ): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const trendText = trend === 'up' ? 'สูงขึ้น' : 'ต่ำลง';
      await addDoc(notificationsRef, {
        user_id: userId,
        type: 'price',
        title: 'แจ้งเตือนราคากาแฟ',
        body: `ราคา${coffeeType} ${trendText} อยู่ที่ ฿${price}/กก.`,
        data: {},
        read: false,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating price notification:', error);
    }
  },

  async notifyWeatherAlert(
    userId: string,
    province: string,
    alertType: string,
    description: string
  ): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        user_id: userId,
        type: 'weather',
        title: `เตือนสภาพอากาศ: ${alertType}`,
        body: `${province}: ${description}`,
        data: {},
        read: false,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating weather notification:', error);
    }
  },

  async notifySystem(
    userId: string,
    title: string,
    body: string,
    data: Record<string, string> = {}
  ): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        user_id: userId,
        type: 'system',
        title,
        body,
        data,
        read: false,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
    }
  },

  // ==================== PUSH NOTIFICATIONS ====================

  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    try {
      // Get user's push token
      const tokensRef = collection(db, 'push_tokens');
      const q = query(tokensRef, where('user_id', '==', userId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      const token = snapshot.docs[0].data().token;

      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  },

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // ==================== LISTEN TO NOTIFICATIONS ====================

  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      callback(notifications);
    });

    return unsubscribe;
  },

  // ==================== BADGE MANAGEMENT ====================

  async updateBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  },
};

export default NotificationService;
