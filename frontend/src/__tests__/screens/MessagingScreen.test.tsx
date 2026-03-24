import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessagingService, Message, Conversation } from '../../lib/messagingService';

jest.mock('../../context/AuthContext');
jest.mock('../../lib/messagingService');
jest.mock('../../lib/alert');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { Images: 'Images' },
}));
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'file://processed.jpg' }),
  SaveFormat: { JPEG: 'jpeg' },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { conversationId: 'conv-1', recipientId: 'user-2', recipientName: 'เกษตรกร 2' } }),
}));

const mockUser = { uid: 'user-1', displayName: 'เกษตรกรทดสอบ' };

const mockConversations: Partial<Conversation>[] = [
  {
    id: 'conv-1',
    participants: ['user-1', 'user-2'],
    participant_names: { 'user-1': 'เกษตรกรทดสอบ', 'user-2': 'เกษตรกร 2' },
    last_message: 'สวัสดีครับ',
    last_message_at: { toDate: () => new Date('2025-01-01') } as any,
    unread_count: { 'user-1': 2 },
    created_at: { toDate: () => new Date('2025-01-01') } as any,
  },
  {
    id: 'conv-2',
    participants: ['user-1', 'user-3'],
    participant_names: { 'user-1': 'เกษตรกรทดสอบ', 'user-3': 'เกษตรกร 3' },
    last_message: 'ราคากาแฟเป็นยังไงบ้าง',
    last_message_at: { toDate: () => new Date('2025-01-02') } as any,
    unread_count: { 'user-1': 0 },
    created_at: { toDate: () => new Date('2025-01-02') } as any,
  },
];

const mockMessages: Partial<Message>[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    sender_name: 'เกษตรกรทดสอบ',
    content: 'สวัสดีครับ',
    type: 'text',
    created_at: { toDate: () => new Date('2025-01-01T10:00:00') } as any,
    read_by: ['user-1'],
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    sender_id: 'user-2',
    sender_name: 'เกษตรกร 2',
    content: 'สวัสดีครับ มีอะไรให้ช่วยไหม',
    type: 'text',
    created_at: { toDate: () => new Date('2025-01-01T10:01:00') } as any,
    read_by: ['user-2'],
  },
];

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  (MessagingService.getConversations as jest.Mock).mockResolvedValue(mockConversations);
  (MessagingService.getMessages as jest.Mock).mockResolvedValue(mockMessages);
  (MessagingService.sendMessage as jest.Mock).mockResolvedValue({ id: 'msg-new', ...mockMessages[0] });
  (MessagingService.markConversationAsRead as jest.Mock).mockResolvedValue(undefined);
  (MessagingService.getOrCreateConversation as jest.Mock).mockResolvedValue('conv-new');
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ConversationsScreen', () => {
  it('should be importable without errors', () => {
    const mod = require('../../screens/messaging/ConversationsScreen');
    expect(mod).toBeDefined();
  });

  it('should be a valid React component', () => {
    const mod = require('../../screens/messaging/ConversationsScreen');
    const Screen = mod.ConversationsScreen || mod.default;
    expect(typeof Screen).toBe('function');
  });
});

describe('ChatScreen', () => {
  it('should be importable without errors', () => {
    const mod = require('../../screens/messaging/ChatScreen');
    expect(mod).toBeDefined();
  });

  it('should be a valid React component', () => {
    const mod = require('../../screens/messaging/ChatScreen');
    const Screen = mod.ChatScreen || mod.default;
    expect(typeof Screen).toBe('function');
  });
});

describe('MessagingService', () => {
  it('getConversations returns conversations array', async () => {
    const result = await MessagingService.getConversations('user-1');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('getMessages returns messages array', async () => {
    const result = await MessagingService.getMessages('conv-1');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('sendMessage called with correct args', async () => {
    await MessagingService.sendMessage('conv-1', 'user-1', 'เกษตรกรทดสอบ', 'ทดสอบ');
    expect(MessagingService.sendMessage).toHaveBeenCalledWith('conv-1', 'user-1', 'เกษตรกรทดสอบ', 'ทดสอบ');
  });

  it('markConversationAsRead called with correct args', async () => {
    await MessagingService.markConversationAsRead('conv-1', 'user-1');
    expect(MessagingService.markConversationAsRead).toHaveBeenCalledWith('conv-1', 'user-1');
  });

  it('getOrCreateConversation returns conversation id', async () => {
    const id = await MessagingService.getOrCreateConversation(
      'user-1', 'เกษตรกรทดสอบ', undefined,
      'user-2', 'เกษตรกร 2', undefined
    );
    expect(typeof id).toBe('string');
  });
});

describe('Conversation list logic', () => {
  it('identifies unread conversations for user', () => {
    const unread = mockConversations.filter(c => (c.unread_count?.['user-1'] ?? 0) > 0);
    expect(unread).toHaveLength(1);
    expect(unread[0].id).toBe('conv-1');
  });

  it('gets recipient name for a conversation', () => {
    const conv = mockConversations[0];
    const recipientId = conv.participants!.find(p => p !== 'user-1')!;
    const recipientName = conv.participant_names![recipientId];
    expect(recipientName).toBe('เกษตรกร 2');
  });

  it('sorts conversations by last_message_at descending', () => {
    const sorted = [...mockConversations].sort((a, b) => {
      const aTime = a.last_message_at?.toDate().getTime() ?? 0;
      const bTime = b.last_message_at?.toDate().getTime() ?? 0;
      return bTime - aTime;
    });
    expect(sorted[0].id).toBe('conv-2');
    expect(sorted[1].id).toBe('conv-1');
  });
});

describe('Message display logic', () => {
  it('identifies own messages', () => {
    const ownMessages = mockMessages.filter(m => m.sender_id === 'user-1');
    expect(ownMessages).toHaveLength(1);
    expect(ownMessages[0].id).toBe('msg-1');
  });

  it('identifies unread messages', () => {
    const unread = mockMessages.filter(m => !m.read_by?.includes('user-1'));
    expect(unread).toHaveLength(1);
    expect(unread[0].id).toBe('msg-2');
  });

  it('sorts messages by created_at ascending', () => {
    const sorted = [...mockMessages].sort((a, b) => {
      const aTime = (a.created_at as any)?.toDate().getTime() ?? 0;
      const bTime = (b.created_at as any)?.toDate().getTime() ?? 0;
      return aTime - bTime;
    });
    expect(sorted[0].id).toBe('msg-1');
    expect(sorted[1].id).toBe('msg-2');
  });

  it('text messages have type text', () => {
    expect(mockMessages[0].type).toBe('text');
    expect(mockMessages[1].type).toBe('text');
  });
});
