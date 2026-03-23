// Messaging Service - Private chat between farmers
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
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
import { db } from './firebase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  type: 'text' | 'image' | 'location' | 'harvest';
  image_url?: string;
  read: boolean;
  created_at: Timestamp | Date;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  last_message?: {
    content: string;
    sender_id: string;
    created_at: Timestamp | Date;
  };
  unread_count: number;
  created_at: Timestamp | Date;
  updated_at: Timestamp | Date;
}

export const MessagingService = {
  // ==================== CONVERSATIONS ====================

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participant_ids', 'array-contains', userId),
        orderBy('updated_at', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },

  async getOrCreateConversation(userId1: string, user1Name: string, user1Avatar: string | undefined, userId2: string, user2Name: string, user2Avatar: string | undefined): Promise<string> {
    try {
      // Check if conversation exists
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participant_ids', 'array-contains', userId1)
      );
      const snapshot = await getDocs(q);

      for (const convDoc of snapshot.docs) {
        const participants = convDoc.data().participant_ids || [];
        if (participants.includes(userId2)) {
          return convDoc.id; // Return existing conversation
        }
      }

      // Create new conversation
      const newConv = await addDoc(conversationsRef, {
        participant_ids: [userId1, userId2],
        participants: [
          { id: userId1, name: user1Name, avatar: user1Avatar || null },
          { id: userId2, name: user2Name, avatar: user2Avatar || null },
        ],
        unread_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return newConv.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const convRef = doc(db, 'conversations', conversationId);
      await updateDoc(convRef, { unread_count: 0 });

      // Mark all messages in conversation as read
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversationId),
        where('sender_id', '!=', userId),
        where('read', '==', false)
      );
      const snapshot = await getDocs(q);

      for (const msgDoc of snapshot.docs) {
        await updateDoc(doc(db, 'messages', msgDoc.id), { read: true });
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Delete all messages
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversationId)
      );
      const msgSnapshot = await getDocs(q);

      for (const msgDoc of msgSnapshot.docs) {
        await deleteDoc(doc(db, 'messages', msgDoc.id));
      }

      // Delete conversation
      await deleteDoc(doc(db, 'conversations', conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // ==================== MESSAGES ====================

  async getMessages(conversationId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversationId),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).reverse() as Message[]; // Reverse to get chronological order
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    content: string,
    type: Message['type'] = 'text',
    imageUrl?: string
  ): Promise<string> {
    try {
      const messagesRef = collection(db, 'messages');
      const docRef = await addDoc(messagesRef, {
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar || null,
        content,
        type,
        image_url: imageUrl || null,
        read: false,
        created_at: serverTimestamp(),
      });

      // Update conversation's last message and unread count
      const convRef = doc(db, 'conversations', conversationId);
      const convDoc = await getDoc(convRef);
      const participants = convDoc.data()?.participant_ids || [];
      const otherParticipant = participants.find((id: string) => id !== senderId);

      await updateDoc(convRef, {
        last_message: {
          content: type === 'image' ? '📷 รูปภาพ' : content.slice(0, 50),
          sender_id: senderId,
          created_at: serverTimestamp(),
        },
        updated_at: serverTimestamp(),
        [`unread_${otherParticipant}`]: increment(1),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async sendHarvestMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    harvestData: {
      farm_name: string;
      weight_kg: number;
      income: number;
      date: string;
    }
  ): Promise<string> {
    try {
      const content = `📦 ${harvestData.farm_name}\nน้ำหนัก: ${harvestData.weight_kg} กก.\nรายได้: ฿${harvestData.income.toLocaleString()}\nวันที่: ${harvestData.date}`;
      
      return await this.sendMessage(
        conversationId,
        senderId,
        senderName,
        senderAvatar,
        content,
        'harvest'
      );
    } catch (error) {
      console.error('Error sending harvest message:', error);
      throw error;
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'messages', messageId), { read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  subscribeToConversation(
    conversationId: string,
    onMessagesUpdate: (messages: Message[]) => void
  ): () => void {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversation_id', '==', conversationId),
      orderBy('created_at', 'asc')
    );

    return onSnapshot(q, snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      onMessagesUpdate(messages);
    });
  },

  subscribeToConversations(
    userId: string,
    onConversationsUpdate: (conversations: Conversation[]) => void
  ): () => void {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participant_ids', 'array-contains', userId),
      orderBy('updated_at', 'desc')
    );

    return onSnapshot(q, snapshot => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];
      onConversationsUpdate(conversations);
    });
  },

  // ==================== UTILITY ====================

  async getTotalUnreadCount(userId: string): Promise<number> {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participant_ids', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);

      let total = 0;
      for (const convDoc of snapshot.docs) {
        total += convDoc.data().unread_count || 0;
      }
      return total;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },
};

export default MessagingService;
