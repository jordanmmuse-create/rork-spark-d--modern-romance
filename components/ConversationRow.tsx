import React, { useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Pin, BellOff, Trash2, Bell, X } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { useAppStore } from '@/store/appStore';
import type { Conversation, Message } from '@/types';

const SWIPE_THRESHOLD = 80;
const ACTION_BUTTON_WIDTH = 70;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ConversationRowProps = {
  conversation: Conversation;
  onPress: () => void;
  showPartnerGlow?: boolean;
  isComingSoon?: boolean;
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function ConversationRow({
  conversation,
  onPress,
  showPartnerGlow = false,
  isComingSoon = false,
}: ConversationRowProps) {
  const { colors } = useThemeStyles();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [peekModalVisible, setPeekModalVisible] = useState(false);

  const {
    getMessagesForConversation,
    toggleConversationPin,
    toggleConversationMute,
    deleteConversation,
  } = useAppStore();

  const hasUnread = conversation.unreadCount > 0;
  const isPinned = conversation.pinned || false;
  const isMuted = conversation.muted || false;

  const previewMessages = useMemo(() => {
    const allMessages = getMessagesForConversation(conversation.id);
    return allMessages.filter(m => !m.deletedForAll && !m.deletedForMe).slice(-8);
  }, [conversation.id, getMessagesForConversation]);

  const closeSwipe = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    setIsSwipeOpen(false);
  }, [translateX]);

  const openSwipe = useCallback(() => {
    Animated.spring(translateX, {
      toValue: -ACTION_BUTTON_WIDTH * 2,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    setIsSwipeOpen(true);
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderGrant: () => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = isSwipeOpen
          ? Math.max(-ACTION_BUTTON_WIDTH * 2.5, gestureState.dx - ACTION_BUTTON_WIDTH * 2)
          : Math.max(-ACTION_BUTTON_WIDTH * 2.5, Math.min(0, gestureState.dx));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isSwipeOpen) {
          if (gestureState.dx > SWIPE_THRESHOLD / 2) {
            closeSwipe();
          } else {
            openSwipe();
          }
        } else {
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            openSwipe();
          } else {
            closeSwipe();
          }
        }
      },
    })
  ).current;

  const handleLongPress = useCallback(() => {
    if (isComingSoon) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    console.log('[ConversationRow] Long press - opening peek modal (NOT marking as read)');
    setPeekModalVisible(true);
  }, [isComingSoon]);

  const handlePress = useCallback(() => {
    if (isSwipeOpen) {
      closeSwipe();
      return;
    }
    if (isComingSoon) return;
    onPress();
  }, [isSwipeOpen, closeSwipe, isComingSoon, onPress]);

  const handleMuteAction = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleConversationMute(conversation.id);
    closeSwipe();
  }, [conversation.id, toggleConversationMute, closeSwipe]);

  const handleDeleteAction = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete your conversation with ${conversation.participantName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: closeSwipe },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteConversation(conversation.id);
          },
        },
      ]
    );
  }, [conversation.id, conversation.participantName, deleteConversation, closeSwipe]);

  const handlePinAction = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleConversationPin(conversation.id);
    setPeekModalVisible(false);
  }, [conversation.id, toggleConversationPin]);

  const handleMuteFromPeek = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleConversationMute(conversation.id);
    setPeekModalVisible(false);
  }, [conversation.id, toggleConversationMute]);

  const handleDeleteFromPeek = useCallback(() => {
    setPeekModalVisible(false);
    setTimeout(() => {
      Alert.alert(
        'Delete Conversation',
        `Are you sure you want to delete your conversation with ${conversation.participantName}? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteConversation(conversation.id);
            },
          },
        ]
      );
    }, 300);
  }, [conversation.id, conversation.participantName, deleteConversation]);

  const card = (
    <View style={styles.rowContainer}>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.muteButton]}
          onPress={handleMuteAction}
          activeOpacity={0.8}
        >
          {isMuted ? (
            <Bell size={22} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <BellOff size={22} color="#FFFFFF" strokeWidth={2} />
          )}
          <Text style={styles.actionButtonText}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteAction}
          activeOpacity={0.8}
        >
          <Trash2 size={22} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.cardWrapper,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          testID={`conversation-row-${conversation.id}`}
          style={[styles.conversationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          activeOpacity={isComingSoon ? 1 : 0.7}
          disabled={isComingSoon}
        >
          <View style={styles.avatarContainer}>
            {conversation.participantAvatar ? (
              <Image
                source={{ uri: conversation.participantAvatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.avatarText, { color: colors.accent }]}>
                  {conversation.participantName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {hasUnread && !isComingSoon && (
              <View style={[styles.unreadDot, { backgroundColor: '#FF3B30' }]} />
            )}
            {isPinned && (
              <View style={[styles.pinnedIndicator, { backgroundColor: colors.tint }]}>
                <Pin size={10} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            )}
          </View>

          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <View style={styles.nameRow}>
                <Text style={[styles.participantName, { color: colors.text }]} numberOfLines={1}>
                  {conversation.participantName}
                  {conversation.isPartner && ' 💕'}
                </Text>
                {isMuted && (
                  <BellOff size={14} color={colors.textSecondary} strokeWidth={2} style={styles.mutedIcon} />
                )}
              </View>
              {conversation.lastMessageAt && !isComingSoon && (
                <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
                  {formatTimeAgo(conversation.lastMessageAt)}
                </Text>
              )}
            </View>
            
            {conversation.lastMessage && (
              <Text 
                style={[
                  styles.lastMessage, 
                  { color: isComingSoon ? colors.textSecondary : (hasUnread ? colors.text : colors.textSecondary) },
                  hasUnread && !isComingSoon && styles.lastMessageUnread,
                  isComingSoon && styles.comingSoonText,
                ]} 
                numberOfLines={1}
              >
                {conversation.lastMessage}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const peekModal = (
    <Modal
      visible={peekModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPeekModalVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setPeekModalVisible(false)}
      >
        <Pressable style={[styles.peekContainer, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.peekHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.peekHeaderLeft}>
              {conversation.participantAvatar ? (
                <Image
                  source={{ uri: conversation.participantAvatar }}
                  style={styles.peekAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.peekAvatar, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.peekAvatarText, { color: colors.accent }]}>
                    {conversation.participantName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={[styles.peekName, { color: colors.text }]}>
                {conversation.participantName}
                {conversation.isPartner && ' 💕'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPeekModalVisible(false)}
              style={styles.peekCloseButton}
            >
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.peekMessages}
            contentContainerStyle={styles.peekMessagesContent}
            showsVerticalScrollIndicator={false}
          >
            {previewMessages.length === 0 ? (
              <Text style={[styles.noMessagesText, { color: colors.textSecondary }]}>
                No messages yet
              </Text>
            ) : (
              previewMessages.map((msg: Message) => {
                const isMe = msg.senderId !== conversation.participantId && msg.senderId !== 'coach-sarah' && msg.senderId !== 'echo';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.peekMessageRow,
                      isMe ? styles.peekMessageRowMe : styles.peekMessageRowThem,
                    ]}
                  >
                    <View
                      style={[
                        styles.peekMessageBubble,
                        isMe
                          ? [styles.peekMessageBubbleMe, { backgroundColor: colors.tint }]
                          : [styles.peekMessageBubbleThem, { backgroundColor: colors.backgroundSecondary }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.peekMessageText,
                          { color: isMe ? '#FFFFFF' : colors.text },
                        ]}
                        numberOfLines={3}
                      >
                        {msg.content}
                      </Text>
                    </View>
                    <Text style={[styles.peekMessageTime, { color: colors.textSecondary }]}>
                      {formatMessageTime(msg.createdAt)}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={[styles.peekActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.peekActionButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={handlePinAction}
              activeOpacity={0.7}
            >
              <Pin size={20} color={isPinned ? colors.tint : colors.text} strokeWidth={2} />
              <Text style={[styles.peekActionText, { color: colors.text }]}>
                {isPinned ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.peekActionButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={handleMuteFromPeek}
              activeOpacity={0.7}
            >
              {isMuted ? (
                <Bell size={20} color={colors.text} strokeWidth={2} />
              ) : (
                <BellOff size={20} color={colors.text} strokeWidth={2} />
              )}
              <Text style={[styles.peekActionText, { color: colors.text }]}>
                {isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.peekActionButton, { backgroundColor: '#FF3B3020' }]}
              onPress={handleDeleteFromPeek}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color="#FF3B30" strokeWidth={2} />
              <Text style={[styles.peekActionText, { color: '#FF3B30' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (showPartnerGlow) {
    return (
      <>
        <View style={styles.partnerGlowContainer}>
          <View style={[
            styles.partnerGlow,
            {
              backgroundColor: '#FF3B30',
              shadowColor: '#FF3B30',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 32,
              elevation: 12,
            }
          ]} />
          {card}
        </View>
        {peekModal}
      </>
    );
  }

  return (
    <>
      {card}
      {peekModal}
    </>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.lg,
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionButton: {
    width: ACTION_BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  muteButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  cardWrapper: {
    backgroundColor: 'transparent',
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold as '700',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  pinnedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs - 2,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  participantName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
    flexShrink: 1,
  },
  mutedIcon: {
    marginLeft: SPACING.xs,
  },
  timeAgo: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  lastMessageUnread: {
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
  comingSoonText: {
    fontStyle: 'italic',
  },
  partnerGlowContainer: {
    position: 'relative',
  },
  partnerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  peekContainer: {
    width: SCREEN_WIDTH - SPACING.lg * 2,
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  peekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  peekHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  peekAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peekAvatarText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold as '700',
  },
  peekName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
  peekCloseButton: {
    padding: SPACING.xs,
  },
  peekMessages: {
    maxHeight: 300,
  },
  peekMessagesContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  noMessagesText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.sm,
    padding: SPACING.lg,
  },
  peekMessageRow: {
    marginBottom: SPACING.xs,
  },
  peekMessageRowMe: {
    alignItems: 'flex-end',
  },
  peekMessageRowThem: {
    alignItems: 'flex-start',
  },
  peekMessageBubble: {
    maxWidth: '85%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  peekMessageBubbleMe: {
    borderBottomRightRadius: SPACING.xs,
  },
  peekMessageBubbleThem: {
    borderBottomLeftRadius: SPACING.xs,
  },
  peekMessageText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  peekMessageTime: {
    fontSize: 10,
    marginTop: 2,
    paddingHorizontal: SPACING.xs,
  },
  peekActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
  },
  peekActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  peekActionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
});
