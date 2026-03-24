import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MessagingService, Message } from '../../lib/messagingService';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: any;
  route: RouteProp<any, any>;
};

export const ChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const { conversationId, otherUser } = (route.params as { conversationId: string; otherUser: any }) ?? { conversationId: '', otherUser: null };
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    
    const unsubscribe = MessagingService.subscribeToConversation(
      conversationId,
      (updatedMessages) => {
        setMessages(updatedMessages);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    // Mark as read when entering chat
    if (user) {
      MessagingService.markConversationAsRead(conversationId, user.uid);
    }
    
    navigation.setOptions({
      headerTitle: otherUser.name,
    });
  }, [user, conversationId, otherUser, navigation]);

  const loadMessages = async () => {
    try {
      const data = await MessagingService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await MessagingService.sendMessage(
        conversationId,
        user.uid,
        user.displayName || 'Unknown',
        user.photoURL || undefined,
        text
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(text); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && user) {
      setSending(true);
      try {
        await MessagingService.sendMessage(
          conversationId,
          user.uid,
          user.displayName || 'Unknown',
          user.photoURL || undefined,
          '',
          'image',
          result.assets[0].uri
        );
      } catch (error) {
        console.error('Error sending image:', error);
      } finally {
        setSending(false);
      }
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.sender_id === user?.uid;
    const showDate = index === 0 || formatDate(messages[index - 1].created_at) !== formatDate(item.created_at);

    return (
      <>
        {showDate && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        )}
        <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
          {!isOwn && (
            <View style={[styles.miniAvatar, { backgroundColor: COLORS.info }]}>
              <Text style={styles.miniAvatarText}>{item.sender_name?.charAt(0) || 'U'}</Text>
            </View>
          )}
          <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
            {item.type === 'image' && item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.messageImage} />
            )}
            {item.type === 'harvest' && (
              <View style={styles.harvestCard}>
                <Text style={styles.harvestContent}>{item.content}</Text>
              </View>
            )}
            {(item.type === 'text' || !item.type) && (
              <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
                {item.content}
              </Text>
            )}
            <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
            <Ionicons name="image" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="พิมพ์ข้อความ..."
              placeholderTextColor={COLORS.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            <Ionicons name="send" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  messagesList: { padding: SPACING.xl, paddingBottom: SPACING.md },
  dateDivider: { alignItems: 'center', marginVertical: SPACING.md },
  dateText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, backgroundColor: COLORS.borderLight, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  messageContainer: { flexDirection: 'row', marginBottom: SPACING.sm, alignItems: 'flex-end' },
  ownMessage: { justifyContent: 'flex-end' },
  otherMessage: { justifyContent: 'flex-start' },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.xs },
  miniAvatarText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.white },
  messageBubble: { maxWidth: '75%', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg },
  ownBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4 },
  messageText: { fontSize: FONTS.sizes.md, color: COLORS.text, lineHeight: 22 },
  ownMessageText: { color: COLORS.white },
  messageTime: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4, alignSelf: 'flex-end' },
  ownMessageTime: { color: 'rgba(255,255,255,0.7)' },
  messageImage: { width: 200, height: 150, borderRadius: RADIUS.md },
  harvestCard: { backgroundColor: `${COLORS.primary}10`, padding: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.primary },
  harvestContent: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 18 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.borderLight, gap: SPACING.sm },
  attachButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  inputWrapper: { flex: 1, backgroundColor: COLORS.background, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0, maxHeight: 100 },
  textInput: { fontSize: FONTS.sizes.md, color: COLORS.text, maxHeight: 100 },
  sendButton: { width: 40, height: 40, backgroundColor: COLORS.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
});

export default ChatScreen;
