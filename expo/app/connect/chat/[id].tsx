import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ListRenderItem,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import SparkShareCard from '@/components/SparkShareCard';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Send, X } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { useAppStore } from '@/store/appStore';
import MessageActionModal from '@/components/MessageActionModal';
import ChatSelectModeBar from '@/components/ChatSelectModeBar';
import type { Message, SparkSharePayload } from '@/types';

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const SELF_TEST_CONVERSATION_ID = 'self-test';

function getToneAutoPopulateText(tone: string | undefined): string {
  switch (tone) {
    case 'playful':
      return 'Smiling while sending this ✨';
    case 'poetic':
      return 'This felt worth pausing for ✨';
    case 'practical':
    default:
      return 'Saw this and thought of you ✨';
  }
}

export default function ChatThreadScreen() {
  const { id, sparkShare: sparkShareParam } = useLocalSearchParams<{ id: string; sparkShare?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const flatListRef = useRef<FlatList>(null);
  const [messageText, setMessageText] = useState('');
  
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [editingSessionStartedAt, setEditingSessionStartedAt] = useState<Record<string, number>>({});

  const {
    conversations,
    messages: allStoreMessages,
    sendMessage,
    sendSelfChatMessage,
    addEchoMessage,
    markConversationAsRead,
    profile,
    toggleMessageReaction,
    editMessage,
    deleteMessage,
    undoSendMessage,
    canEditOrUndoMessage,
    getMessageById,
    getOrCreateConversation,
    pendingSparkShare,
    clearPendingSparkShare,
    sendSparkShareMessage,
  } = useAppStore();

  const [sparkShareDraft, setSparkShareDraft] = useState<SparkSharePayload | null>(null);

  const isSelfTestThread = id === SELF_TEST_CONVERSATION_ID;

  // Ensure conversation exists in store (especially for self-test)
  useEffect(() => {
    if (isSelfTestThread && profile) {
      console.log('[ChatThread] Ensuring self-test conversation exists in store');
      getOrCreateConversation(
        SELF_TEST_CONVERSATION_ID,
        profile.displayName || profile.name || 'You',
        profile.profilePicture,
        false
      );
    }
  }, [isSelfTestThread, profile, getOrCreateConversation]);

  // Handle spark share draft from navigation
  useEffect(() => {
    if (sparkShareParam === 'true' && pendingSparkShare) {
      console.log('[ChatThread] Setting spark share draft from pending:', pendingSparkShare.id, 'isParq:', pendingSparkShare.isParq);
      setSparkShareDraft(pendingSparkShare);
      
      // Auto-populate message text: use PARQ default message for PARQ cards, tone-based for Spark cards
      let autoText: string;
      if (pendingSparkShare.isParq && pendingSparkShare.parqDefaultMessage) {
        autoText = pendingSparkShare.parqDefaultMessage;
        console.log('[ChatThread] Auto-populating with PARQ default message:', autoText);
      } else {
        autoText = getToneAutoPopulateText(profile?.tone);
        console.log('[ChatThread] Auto-populating with tone-based text:', autoText);
      }
      setMessageText(autoText);
    }
  }, [sparkShareParam, pendingSparkShare, profile?.tone]);

  const conversation = useMemo(() => {
    return conversations.find((c) => c.id === id) || {
      id: id || SELF_TEST_CONVERSATION_ID,
      userId: profile?.id || '',
      participantId: isSelfTestThread ? 'self' : id || '',
      participantName: isSelfTestThread ? (profile?.displayName || profile?.name || 'You') : 'Chat',
      participantAvatar: isSelfTestThread ? profile?.profilePicture : undefined,
      isPartner: false,
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
  }, [conversations, id, isSelfTestThread, profile]);

  // Get messages from the persisted store
  const storeMessages = useMemo(() => {
    if (!id) return [];
    return allStoreMessages
      .filter(m => m.conversationId === id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [id, allStoreMessages]);
  
  const messages = useMemo(() => {
    const filtered = storeMessages.filter(m => !m.deletedForMe);
    
    // For self-test threads, create mirrored messages for visual demo at render time
    // The "echo" messages are stored in the store, so we just display them
    // No need to duplicate here - the sendMessage handler creates both
    return filtered;
  }, [storeMessages]);

  const selectedMessages = useMemo(() => {
    return messages.filter(m => selectedMessageIds.has(m.id));
  }, [messages, selectedMessageIds]);

  // Mark conversation as read on focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        console.log('[ChatThread] Screen focused, marking conversation as read:', id);
        markConversationAsRead(id);
      }
    }, [id, markConversationAsRead])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const handleHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleSendSparkShare = useCallback(() => {
    if (!sparkShareDraft || !id) return;
    
    const comment = messageText.trim();
    console.log('[ChatThread] Sending spark share message with comment:', comment || '(none)');
    handleHaptic();
    
    sendSparkShareMessage(id, {
      sparkText: sparkShareDraft.sparkText,
      sparkLogoAsset: sparkShareDraft.sparkLogoAsset,
    }, comment || undefined);
    
    setSparkShareDraft(null);
    setMessageText('');
    clearPendingSparkShare();
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [sparkShareDraft, id, messageText, sendSparkShareMessage, clearPendingSparkShare, handleHaptic]);

  const handleClearSparkShareDraft = useCallback(() => {
    console.log('[ChatThread] Clearing spark share draft');
    handleHaptic();
    setSparkShareDraft(null);
    clearPendingSparkShare();
  }, [clearPendingSparkShare, handleHaptic]);

  const handleSend = useCallback(() => {
    const trimmedText = messageText.trim();
    if (!trimmedText || !id || !profile) return;

    console.log('[ChatThread] Sending message:', trimmedText, 'to conversation:', id);
    handleHaptic();

    if (editingMessage) {
      console.log('[ChatThread] Editing message:', editingMessage.id);
      editMessage(editingMessage.id, trimmedText);
      setEditingMessage(null);
      setMessageText('');
      return;
    }

    // For self-test thread, use paired message system
    if (isSelfTestThread) {
      const { pairId } = sendSelfChatMessage(id, trimmedText, replyToMessage?.id);
      setMessageText('');
      setReplyToMessage(null);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Create echo message with same pairId after delay
      setTimeout(() => {
        handleHaptic();
        addEchoMessage(id, trimmedText, pairId);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 600);
    } else {
      // Regular message send for non-self threads
      sendMessage(id, trimmedText, replyToMessage?.id);
      setMessageText('');
      setReplyToMessage(null);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messageText, id, sendMessage, sendSelfChatMessage, addEchoMessage, isSelfTestThread, profile, handleHaptic, replyToMessage, editingMessage, editMessage]);

  const handleLongPress = useCallback((message: Message) => {
    if (isSelectMode) return;
    handleHaptic();
    setSelectedMessage(message);
    setActionModalVisible(true);
  }, [handleHaptic, isSelectMode]);

  const handleMessagePress = useCallback((message: Message) => {
    if (!isSelectMode) return;
    handleHaptic();
    setSelectedMessageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(message.id)) {
        newSet.delete(message.id);
      } else {
        newSet.add(message.id);
      }
      return newSet;
    });
  }, [isSelectMode, handleHaptic]);

  const handleReaction = useCallback((emoji: string) => {
    if (!selectedMessage) return;
    console.log('[ChatThread] Adding reaction:', emoji, 'to message:', selectedMessage.id);
    toggleMessageReaction(selectedMessage.id, emoji);
  }, [selectedMessage, toggleMessageReaction]);

  const handleReply = useCallback(() => {
    if (!selectedMessage) return;
    setReplyToMessage(selectedMessage);
  }, [selectedMessage]);

  const handleDelete = useCallback((forAll: boolean) => {
    if (!selectedMessage) return;
    console.log('[ChatThread] Deleting message:', selectedMessage.id, 'forAll:', forAll);
    deleteMessage(selectedMessage.id, forAll);
  }, [selectedMessage, deleteMessage]);

  const handleEdit = useCallback(() => {
    if (!selectedMessage) return;
    
    setEditingSessionStartedAt(prev => ({ ...prev, [selectedMessage.id]: Date.now() }));
    setEditingMessage(selectedMessage);
    setMessageText(selectedMessage.content);
  }, [selectedMessage]);

  const handleUndoSend = useCallback(() => {
    if (!selectedMessage) return;
    console.log('[ChatThread] Undoing send:', selectedMessage.id);
    undoSendMessage(selectedMessage.id);
  }, [selectedMessage, undoSendMessage]);

  const handleEnterSelectMode = useCallback(() => {
    if (selectedMessage) {
      setSelectedMessageIds(new Set([selectedMessage.id]));
    }
    setIsSelectMode(true);
  }, [selectedMessage]);

  const handleExitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedMessageIds(new Set());
  }, []);

  const handleSelectCopy = useCallback(() => {
    handleExitSelectMode();
  }, [handleExitSelectMode]);

  const handleSelectDelete = useCallback(() => {
    selectedMessageIds.forEach(msgId => {
      deleteMessage(msgId, false);
    });
    handleExitSelectMode();
  }, [selectedMessageIds, deleteMessage, handleExitSelectMode]);

  const handleSelectShare = useCallback(() => {
    handleExitSelectMode();
  }, [handleExitSelectMode]);

  const handleSelectTranslate = useCallback(() => {
    const text = selectedMessages.map(m => m.content).join('\n\n');
    const encoded = encodeURIComponent(text);
    Linking.openURL(`https://translate.google.com/?sl=auto&tl=en&text=${encoded}`);
    handleExitSelectMode();
  }, [selectedMessages, handleExitSelectMode]);

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setMessageText('');
  }, []);

  const cancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const getReplyMessage = useCallback((messageId: string | undefined): Message | undefined => {
    if (!messageId) return undefined;
    return getMessageById(messageId);
  }, [getMessageById]);

  const checkCanEditOrUndo = useCallback((message: Message): boolean => {
    if (editingSessionStartedAt[message.id]) return true;
    return canEditOrUndoMessage(message);
  }, [canEditOrUndoMessage, editingSessionStartedAt]);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => {
      const isMe = item.senderId === profile?.id;
      const isSelected = selectedMessageIds.has(item.id);
      const replyMsg = getReplyMessage(item.replyToMessageId);
      const reactions = item.reactions || [];
      const isDeleted = item.deletedForAll;
      const isSparkShare = item.type === 'sparkShare' && item.sparkShare;

      if (isSparkShare && item.sparkShare) {
        return (
          <Pressable
            onLongPress={() => handleLongPress(item)}
            onPress={() => handleMessagePress(item)}
            delayLongPress={400}
            style={[
              styles.messageRow,
              isMe ? styles.messageRowMe : styles.messageRowThem,
              isSelected && { backgroundColor: colors.tint + '20' },
            ]}
          >
            {isSelectMode && (
              <View style={[styles.checkbox, isSelected && { backgroundColor: colors.tint, borderColor: colors.tint }]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            )}
            <View style={styles.messageContent}>
              <SparkShareCard
                sparkShare={item.sparkShare}
                isCompact
                isOwnMessage={isMe}
              />
              <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
                {formatMessageTime(item.createdAt)}
              </Text>
            </View>
          </Pressable>
        );
      }

      return (
        <Pressable
          onLongPress={() => handleLongPress(item)}
          onPress={() => handleMessagePress(item)}
          delayLongPress={400}
          style={[
            styles.messageRow,
            isMe ? styles.messageRowMe : styles.messageRowThem,
            isSelected && { backgroundColor: colors.tint + '20' },
          ]}
        >
          {isSelectMode && (
            <View style={[styles.checkbox, isSelected && { backgroundColor: colors.tint, borderColor: colors.tint }]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          )}
          
          <View style={styles.messageContent}>
            {replyMsg && !isDeleted && (
              <View style={[styles.replyPreview, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.tint }]}>
                <Text style={[styles.replyPreviewText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {replyMsg.content}
                </Text>
              </View>
            )}
            
            <View
              style={[
                styles.messageBubble,
                isMe
                  ? [styles.messageBubbleMe, { backgroundColor: colors.tint }]
                  : [styles.messageBubbleThem, { backgroundColor: colors.card, borderColor: colors.border }],
                isDeleted && { opacity: 0.6 },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: isMe ? '#FFFFFF' : colors.text },
                  isDeleted && { fontStyle: 'italic' as const },
                ]}
              >
                {isDeleted ? 'Message deleted' : item.content}
              </Text>
              {item.editedAt && !isDeleted && (
                <Text style={[styles.editedLabel, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                  Edited
                </Text>
              )}
            </View>

            {reactions.length > 0 && !isDeleted && (
              <View style={[styles.reactionsContainer, isMe ? styles.reactionsMe : styles.reactionsThem]}>
                {reactions.map((reaction, idx) => (
                  <View key={idx} style={[styles.reactionBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={styles.reactionBadgeEmoji}>{reaction.emoji}</Text>
                    {reaction.userIds.length > 1 && (
                      <Text style={[styles.reactionCount, { color: colors.textSecondary }]}>
                        {reaction.userIds.length}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
              {formatMessageTime(item.createdAt)}
            </Text>
          </View>
        </Pressable>
      );
    },
    [profile?.id, colors, handleLongPress, handleMessagePress, isSelectMode, selectedMessageIds, getReplyMessage]
  );

  const participantName = isSelfTestThread 
    ? (profile?.displayName || profile?.name || 'You')
    : (conversation?.participantName || 'Chat');
  const participantAvatar = isSelfTestThread 
    ? profile?.profilePicture 
    : conversation?.participantAvatar;
  const isPartner = conversation?.isPartner || false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + SPACING.sm,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            console.log('[ChatThread] Back pressed');
            handleHaptic();
            router.back();
          }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {participantAvatar ? (
            <Image
              source={{ uri: participantAvatar }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.headerAvatarText, { color: colors.accent }]}>
                {participantName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {participantName}
            {isPartner && ' 💕'}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: SPACING.md },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No messages yet. Say hi! 👋
              </Text>
            </View>
          }
        />

        {isSelectMode ? (
          <ChatSelectModeBar
            selectedMessages={selectedMessages}
            onCopy={handleSelectCopy}
            onDelete={handleSelectDelete}
            onShare={handleSelectShare}
            onTranslate={handleSelectTranslate}
            onCancel={handleExitSelectMode}
          />
        ) : (
          <View
            style={[
              styles.composerContainer,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.md,
              },
            ]}
          >
            {replyToMessage && (
              <View style={[styles.replyBar, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.tint }]}>
                <View style={styles.replyBarContent}>
                  <Text style={[styles.replyBarLabel, { color: colors.tint }]}>Replying to</Text>
                  <Text style={[styles.replyBarText, { color: colors.text }]} numberOfLines={1}>
                    {replyToMessage.content}
                  </Text>
                </View>
                <TouchableOpacity onPress={cancelReply} style={styles.replyBarClose}>
                  <X size={18} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}

            {editingMessage && (
              <View style={[styles.editBar, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.accent }]}>
                <View style={styles.editBarContent}>
                  <Text style={[styles.editBarLabel, { color: colors.accent }]}>Editing message</Text>
                </View>
                <TouchableOpacity onPress={cancelEdit} style={styles.editBarClose}>
                  <X size={18} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            )}

            {sparkShareDraft && (
              <View style={styles.sparkShareAttachmentContainer}>
                <View style={[styles.sparkShareAttachmentPreview, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                  <SparkShareCard
                    sparkShare={{
                      sparkText: sparkShareDraft.sparkText,
                      sparkLogoAsset: sparkShareDraft.sparkLogoAsset,
                    }}
                    isCompact
                    showCloseButton
                    onClose={handleClearSparkShareDraft}
                    isOwnMessage
                  />
                </View>
              </View>
            )}

            <View style={styles.composerRow}>
              <View
                style={[
                  styles.composerInputWrapper,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.composerInput, { color: colors.text }]}
                  placeholder={editingMessage ? "Edit message" : sparkShareDraft ? "Add a comment..." : "Message"}
                  placeholderTextColor={colors.textSecondary}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={1000}
                  testID="chat-message-input"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: (sparkShareDraft || messageText.trim()) ? colors.tint : colors.backgroundSecondary,
                  },
                ]}
                onPress={sparkShareDraft ? handleSendSparkShare : handleSend}
                disabled={!sparkShareDraft && !messageText.trim()}
                activeOpacity={0.7}
              >
                <Send
                  size={20}
                  color={(sparkShareDraft || messageText.trim()) ? '#FFFFFF' : colors.textSecondary}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      <MessageActionModal
        visible={actionModalVisible}
        message={selectedMessage}
        isOwnMessage={selectedMessage ? selectedMessage.senderId === profile?.id : false}
        canEditOrUndo={selectedMessage ? checkCanEditOrUndo(selectedMessage) : false}
        onClose={() => { setActionModalVisible(false); setSelectedMessage(null); }}
        onReaction={handleReaction}
        onReply={handleReply}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onUndoSend={handleUndoSend}
        onSelect={handleEnterSelectMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold as '700',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
  headerRight: {
    width: 44,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  messageRow: {
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowThem: {
    justifyContent: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: SPACING.xs,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  messageContent: {
    maxWidth: '80%',
  },
  replyPreview: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderLeftWidth: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  replyPreviewText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  messageBubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  messageBubbleMe: {
    borderBottomRightRadius: SPACING.xs,
  },
  messageBubbleThem: {
    borderBottomLeftRadius: SPACING.xs,
    borderWidth: 1,
  },
  messageText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  editedLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionsMe: {
    justifyContent: 'flex-end',
  },
  reactionsThem: {
    justifyContent: 'flex-start',
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  reactionBadgeEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    marginLeft: 2,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs - 2,
    paddingHorizontal: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  composerContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  replyBarContent: {
    flex: 1,
  },
  replyBarLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
    marginBottom: 2,
  },
  replyBarText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  replyBarClose: {
    padding: SPACING.xs,
  },
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  editBarContent: {
    flex: 1,
  },
  editBarLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
  editBarClose: {
    padding: SPACING.xs,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  composerInputWrapper: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 120,
  },
  composerInput: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkShareAttachmentContainer: {
    marginBottom: SPACING.sm,
  },
  sparkShareAttachmentPreview: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
});
