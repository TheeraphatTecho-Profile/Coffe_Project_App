// Social Service - Follow system and user interactions
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
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Follow {
  id: string;
  follower_id: string;
  follower_name: string;
  follower_avatar?: string;
  following_id: string;
  following_name: string;
  following_avatar?: string;
  following_province?: string;
  created_at: Timestamp | Date;
}

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  display_name?: string;
  avatar?: string;
  province?: string;
  farm_count: number;
  harvest_count: number;
  total_income: number;
  followers_count: number;
  following_count: number;
  posts_count: number;
  joined_at: Timestamp | Date;
  bio?: string;
  is_following?: boolean;
}

export const SocialService = {
  // ==================== FOLLOW SYSTEM ====================

  async followUser(followerId: string, followerName: string, followerAvatar: string | undefined, targetUserId: string): Promise<void> {
    try {
      const followsRef = collection(db, 'follows');
      
      // Check if already following
      const q = query(
        followsRef,
        where('follower_id', '==', followerId),
        where('following_id', '==', targetUserId)
      );
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        return; // Already following
      }

      // Create follow record
      await addDoc(followsRef, {
        follower_id: followerId,
        follower_name: followerName,
        follower_avatar: followerAvatar || null,
        following_id: targetUserId,
        created_at: serverTimestamp(),
      });

      // Update follower's following count
      const followerRef = doc(db, 'users', followerId);
      await updateDoc(followerRef, {
        following_count: increment(1),
      }).catch(() => {});

      // Update target's followers count
      const targetRef = doc(db, 'users', targetUserId);
      await updateDoc(targetRef, {
        followers_count: increment(1),
      }).catch(() => {});
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  async unfollowUser(followerId: string, targetUserId: string): Promise<void> {
    try {
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('follower_id', '==', followerId),
        where('following_id', '==', targetUserId)
      );
      const snapshot = await getDocs(q);

      for (const followDoc of snapshot.docs) {
        await deleteDoc(doc(db, 'follows', followDoc.id));
      }

      // Update counts
      const followerRef = doc(db, 'users', followerId);
      await updateDoc(followerRef, {
        following_count: increment(-1),
      }).catch(() => {});

      const targetRef = doc(db, 'users', targetUserId);
      await updateDoc(targetRef, {
        followers_count: increment(-1),
      }).catch(() => {});
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  async isFollowing(followerId: string, targetUserId: string): Promise<boolean> {
    try {
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('follower_id', '==', followerId),
        where('following_id', '==', targetUserId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  async getFollowers(userId: string): Promise<Follow[]> {
    try {
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('following_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Follow[];
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  },

  async getFollowing(userId: string): Promise<Follow[]> {
    try {
      const followsRef = collection(db, 'follows');
      const q = query(
        followsRef,
        where('follower_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Follow[];
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  },

  async getFollowersCount(userId: string): Promise<number> {
    try {
      const followsRef = collection(db, 'follows');
      const q = query(followsRef, where('following_id', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting followers count:', error);
      return 0;
    }
  },

  async getFollowingCount(userId: string): Promise<number> {
    try {
      const followsRef = collection(db, 'follows');
      const q = query(followsRef, where('follower_id', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  },

  // ==================== USER PROFILES ====================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      
      if (!snapshot.exists()) return null;
      
      return { id: snapshot.id, uid: snapshot.id, ...snapshot.data() } as UserProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async updateUserProfile(
    userId: string,
    data: Partial<Pick<UserProfile, 'display_name' | 'avatar' | 'province' | 'bio'>>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async searchUsers(searchQuery: string, limitCount: number = 20): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('display_name'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const searchLower = searchQuery.toLowerCase();
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, uid: doc.id, ...doc.data() } as UserProfile))
        .filter(user => 
          user.display_name?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.province?.toLowerCase().includes(searchLower)
        );
      
      return filtered;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  async getSuggestedUsers(userId: string, limitCount: number = 10): Promise<UserProfile[]> {
    try {
      // Get users that current user is not following
      const following = await this.getFollowing(userId);
      const followingIds = following.map(f => f.following_id);
      followingIds.push(userId); // Exclude self

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('followers_count', 'desc'),
        limit(limitCount * 3) // Get more to filter
      );
      const snapshot = await getDocs(q);
      
      const suggested = snapshot.docs
        .map(doc => ({ id: doc.id, uid: doc.id, ...doc.data() } as UserProfile))
        .filter(user => !followingIds.includes(user.uid))
        .slice(0, limitCount);
      
      return suggested;
    } catch (error) {
      console.error('Error getting suggested users:', error);
      return [];
    }
  },

  // ==================== ACTIVE FARMERS (Featured) ====================

  async getActiveFarmers(limitCount: number = 10): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('posts_count', '>', 0),
        orderBy('posts_count', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
      })) as UserProfile[];
    } catch (error) {
      console.error('Error getting active farmers:', error);
      return [];
    }
  },
};

export default SocialService;
