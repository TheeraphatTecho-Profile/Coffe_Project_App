// Community Service - Firestore operations for community features
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
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  Firestore,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
// Auth context is used at the screen level, not in services

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_province?: string;
  title: string;
  content: string;
  image_url?: string;
  post_type: 'question' | 'share' | 'tips' | 'announcement' | 'market';
  tags: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: Timestamp | Date;
  updated_at?: Timestamp | Date;
  user_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  likes_count: number;
  created_at: Timestamp | Date;
  user_liked?: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  province?: string;
  region?: string;
  cover_image?: string;
  member_count: number;
  post_count: number;
  is_private: boolean;
  created_at: Timestamp | Date;
  created_by: string;
}

export interface CommunityPoll {
  id: string;
  post_id: string;
  question: string;
  options: { text: string; votes: number }[];
  total_votes: number;
  ends_at: Timestamp | Date;
  user_voted?: boolean;
  user_option?: number;
}

export const CommunityService = {
  // ==================== POSTS ====================
  
  async getPosts(
    postType?: string,
    province?: string,
    limitCount: number = 20
  ): Promise<CommunityPost[]> {
    try {
      const postsRef = collection(db, 'community_posts');
      let q = query(
        postsRef,
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      if (postType) {
        q = query(
          postsRef,
          where('post_type', '==', postType),
          orderBy('created_at', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      let posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunityPost[];

      // Filter by province if specified
      if (province) {
        posts = posts.filter(p => p.author_province === province);
      }

      // Sort pinned first
      posts.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
      });

      return posts;
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  },

  /**
   * Paginated post fetching with cursor support (for infinite scroll).
   */
  async getPostsPaginated(
    postType?: string,
    pageSize: number = 15,
    afterDoc?: QueryDocumentSnapshot | null
  ): Promise<{
    posts: CommunityPost[];
    lastDoc: QueryDocumentSnapshot | null;
    hasMore: boolean;
  }> {
    try {
      const postsRef = collection(db, 'community_posts');
      let q;

      if (postType && afterDoc) {
        q = query(
          postsRef,
          where('post_type', '==', postType),
          orderBy('created_at', 'desc'),
          startAfter(afterDoc),
          limit(pageSize + 1)
        );
      } else if (postType) {
        q = query(
          postsRef,
          where('post_type', '==', postType),
          orderBy('created_at', 'desc'),
          limit(pageSize + 1)
        );
      } else if (afterDoc) {
        q = query(
          postsRef,
          orderBy('created_at', 'desc'),
          startAfter(afterDoc),
          limit(pageSize + 1)
        );
      } else {
        q = query(
          postsRef,
          orderBy('created_at', 'desc'),
          limit(pageSize + 1)
        );
      }

      const snapshot = await getDocs(q);

      const hasMore = snapshot.docs.length > pageSize;
      const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
      const lastDocument = docs.length > 0 ? docs[docs.length - 1] : null;

      let posts = docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as CommunityPost[];

      // Sort pinned first
      posts.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
      });

      return { posts, lastDoc: lastDocument, hasMore };
    } catch (error) {
      console.error('Error getting paginated posts:', error);
      return { posts: [], lastDoc: null, hasMore: false };
    }
  },

  async getPostById(postId: string): Promise<CommunityPost | null> {
    try {
      const postRef = doc(db, 'community_posts', postId);
      const snapshot = await getDoc(postRef);
      
      if (!snapshot.exists()) return null;
      
      return { id: snapshot.id, ...snapshot.data() } as CommunityPost;
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  },

  async createPost(
    userId: string,
    userName: string,
    userProvince: string,
    data: {
      title: string;
      content: string;
      image_url?: string;
      post_type: CommunityPost['post_type'];
      tags: string[];
    }
  ): Promise<string> {
    try {
      const postsRef = collection(db, 'community_posts');
      const docRef = await addDoc(postsRef, {
        author_id: userId,
        author_name: userName,
        author_province: userProvince,
        title: data.title,
        content: data.content,
        image_url: data.image_url || null,
        post_type: data.post_type,
        tags: data.tags,
        likes_count: 0,
        comments_count: 0,
        is_pinned: false,
        liked_by: [],
        created_at: serverTimestamp(),
      });

      // Update user's post count
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        community_posts_count: increment(1),
      }).catch(() => {});

      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(
    postId: string,
    userId: string,
    data: Partial<Pick<CommunityPost, 'title' | 'content' | 'image_url' | 'tags'>>
  ): Promise<void> {
    try {
      const postRef = doc(db, 'community_posts', postId);
      const post = await getDoc(postRef);
      
      if (!post.exists() || post.data().author_id !== userId) {
        throw new Error('Unauthorized');
      }

      await updateDoc(postRef, {
        ...data,
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'community_posts', postId);
      const post = await getDoc(postRef);
      
      if (!post.exists() || post.data().author_id !== userId) {
        throw new Error('Unauthorized');
      }

      await deleteDoc(postRef);

      // Update user's post count
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        community_posts_count: increment(-1),
      }).catch(() => {});
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      const postRef = doc(db, 'community_posts', postId);
      const post = await getDoc(postRef);
      
      if (!post.exists()) throw new Error('Post not found');

      const likedBy = post.data().liked_by || [];
      const hasLiked = likedBy.includes(userId);

      if (hasLiked) {
        await updateDoc(postRef, {
          likes_count: increment(-1),
          liked_by: arrayRemove(userId),
        });
        return false;
      } else {
        await updateDoc(postRef, {
          likes_count: increment(1),
          liked_by: arrayUnion(userId),
        });
        return true;
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // ==================== COMMENTS ====================

  async getComments(postId: string): Promise<CommunityComment[]> {
    try {
      const commentsRef = collection(db, 'community_comments');
      const q = query(
        commentsRef,
        where('post_id', '==', postId),
        orderBy('created_at', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunityComment[];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },

  async addComment(
    postId: string,
    userId: string,
    userName: string,
    content: string
  ): Promise<string> {
    try {
      const commentsRef = collection(db, 'community_comments');
      const docRef = await addDoc(commentsRef, {
        post_id: postId,
        author_id: userId,
        author_name: userName,
        content,
        likes_count: 0,
        liked_by: [],
        created_at: serverTimestamp(),
      });

      // Update post's comment count
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        comments_count: increment(1),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async deleteComment(commentId: string, postId: string): Promise<void> {
    try {
      const commentRef = doc(db, 'community_comments', commentId);
      await deleteDoc(commentRef);

      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        comments_count: increment(-1),
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  async likeComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const commentRef = doc(db, 'community_comments', commentId);
      const comment = await getDoc(commentRef);
      
      if (!comment.exists()) throw new Error('Comment not found');

      const likedBy = comment.data().liked_by || [];
      const hasLiked = likedBy.includes(userId);

      if (hasLiked) {
        await updateDoc(commentRef, {
          likes_count: increment(-1),
          liked_by: arrayRemove(userId),
        });
        return false;
      } else {
        await updateDoc(commentRef, {
          likes_count: increment(1),
          liked_by: arrayUnion(userId),
        });
        return true;
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  },

  // ==================== GROUPS ====================

  async getGroups(province?: string): Promise<CommunityGroup[]> {
    try {
      const groupsRef = collection(db, 'community_groups');
      let q = query(groupsRef, orderBy('member_count', 'desc'));

      if (province) {
        q = query(
          groupsRef,
          where('province', '==', province),
          orderBy('member_count', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunityGroup[];
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  },

  async joinGroup(groupId: string, userId: string): Promise<void> {
    try {
      const groupRef = doc(db, 'community_groups', groupId);
      await updateDoc(groupRef, {
        member_count: increment(1),
        members: arrayUnion(userId),
      });
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const groupRef = doc(db, 'community_groups', groupId);
      await updateDoc(groupRef, {
        member_count: increment(-1),
        members: arrayRemove(userId),
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  // ==================== FEEDBACK/REACTIONS ====================

  async reportPost(postId: string, userId: string, reason: string): Promise<void> {
    try {
      const reportsRef = collection(db, 'community_reports');
      await addDoc(reportsRef, {
        post_id: postId,
        reporter_id: userId,
        reason,
        created_at: serverTimestamp(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Error reporting post:', error);
      throw error;
    }
  },

  // ==================== STATS ====================

  async getCommunityStats(): Promise<{
    totalPosts: number;
    totalMembers: number;
    totalComments: number;
    postsToday: number;
  }> {
    try {
      // This would typically use aggregation queries
      // For now, return mock data structure
      return {
        totalPosts: 0,
        totalMembers: 0,
        totalComments: 0,
        postsToday: 0,
      };
    } catch (error) {
      console.error('Error getting community stats:', error);
      return {
        totalPosts: 0,
        totalMembers: 0,
        totalComments: 0,
        postsToday: 0,
      };
    }
  },
};

export default CommunityService;
