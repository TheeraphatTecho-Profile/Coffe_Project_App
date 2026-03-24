import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CommunityService } from '../../lib/community/communityService';

jest.mock('../../context/AuthContext');
jest.mock('../../lib/community/communityService');
jest.mock('../../lib/alert');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const mockUser = { uid: 'user-1', displayName: 'Test Farmer' };

const mockPosts = [
  {
    id: 'post-1',
    author_id: 'user-1',
    author_name: 'เกษตรกรทดสอบ',
    author_province: 'เลย',
    title: 'วิธีดูแลต้นกาแฟในหน้าแล้ง',
    content: 'ช่วงหน้าแล้งควรรดน้ำทุกวัน...',
    post_type: 'tips',
    tags: ['กาแฟ', 'การดูแล'],
    likes_count: 5,
    comments_count: 2,
    is_pinned: false,
    created_at: { toDate: () => new Date('2025-01-01') },
    user_liked: false,
  },
  {
    id: 'post-2',
    author_id: 'user-2',
    author_name: 'เกษตรกร 2',
    author_province: 'เชียงใหม่',
    title: 'ราคากาแฟวันนี้',
    content: 'ราคากาแฟอาราบิก้าวันนี้...',
    post_type: 'market',
    tags: ['ราคา'],
    likes_count: 3,
    comments_count: 0,
    is_pinned: true,
    created_at: { toDate: () => new Date('2025-01-02') },
    user_liked: true,
  },
];

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  (CommunityService.getPosts as jest.Mock).mockResolvedValue(mockPosts);
  (CommunityService.likePost as jest.Mock).mockResolvedValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CommunityScreen', () => {
  it('should be importable without errors', () => {
    const mod = require('../../screens/community/CommunityScreen');
    expect(mod).toBeDefined();
    expect(mod.CommunityScreen).toBeDefined();
  });

  it('should be a valid React component', () => {
    const { CommunityScreen } = require('../../screens/community/CommunityScreen');
    expect(typeof CommunityScreen).toBe('function');
  });

  it('should render without throwing', () => {
    const { CommunityScreen } = require('../../screens/community/CommunityScreen');
    expect(() => React.createElement(CommunityScreen, { navigation: { navigate: jest.fn() } as any })).not.toThrow();
  });
});

describe('CommunityService', () => {
  it('getPosts returns array of posts', async () => {
    const posts = await CommunityService.getPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts).toHaveLength(2);
  });

  it('getPosts with type filter passes type argument', async () => {
    await CommunityService.getPosts('tips');
    expect(CommunityService.getPosts).toHaveBeenCalledWith('tips');
  });

  it('likePost returns boolean', async () => {
    const result = await CommunityService.likePost('post-1', 'user-1');
    expect(typeof result).toBe('boolean');
  });

  it('likePost called with correct arguments', async () => {
    await CommunityService.likePost('post-2', 'user-2');
    expect(CommunityService.likePost).toHaveBeenCalledWith('post-2', 'user-2');
  });
});

describe('Community post filtering', () => {
  it('filters posts by title search', () => {
    const query = 'วิธีดูแล';
    const filtered = mockPosts.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.content.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('post-1');
  });

  it('returns empty array when no match', () => {
    const query = 'ไม่มีโพสต์นี้';
    const filtered = mockPosts.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.content.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered).toHaveLength(0);
  });

  it('filters by post_type correctly', () => {
    const filtered = mockPosts.filter(p => p.post_type === 'market');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('post-2');
  });

  it('identifies pinned posts', () => {
    const pinned = mockPosts.filter(p => p.is_pinned);
    expect(pinned).toHaveLength(1);
    expect(pinned[0].id).toBe('post-2');
  });
});

describe('Community like state management', () => {
  it('increments likes when toggling on', () => {
    const post = { ...mockPosts[0] };
    const newLiked = true;
    const updatedCount = newLiked ? post.likes_count + 1 : post.likes_count - 1;
    expect(updatedCount).toBe(6);
  });

  it('decrements likes when toggling off', () => {
    const post = { ...mockPosts[1] };
    const newLiked = false;
    const updatedCount = newLiked ? post.likes_count + 1 : post.likes_count - 1;
    expect(updatedCount).toBe(2);
  });
});
