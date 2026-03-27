import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Linking,
  Share,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  MessageCircle,
  Smile,
  Trash2,
  Pencil,
  RotateCcw,
  Copy,
  Languages,
  Search,
  Share2,
  CheckSquare,
  MoreHorizontal,
  X,
} from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import type { Message } from '@/types';

const DEFAULT_REACTIONS = ['❤️', '👍', '👎', '😂', '‼️', '❓', '+'];
const STICKER_EMOJIS = ['😍', '🥰', '😘', '💋', '💕', '💖', '💗', '💓', '💝', '🔥', '✨', '🎉', '👏', '🙌', '💪', '🤗'];

interface MessageActionModalProps {
  visible: boolean;
  message: Message | null;
  isOwnMessage: boolean;
  canEditOrUndo: boolean;
  onClose: () => void;
  onReaction: (emoji: string) => void;
  onReply: () => void;
  onDelete: (forAll: boolean) => void;
  onEdit: () => void;
  onUndoSend: () => void;
  onSelect: () => void;
}

type ModalView = 'main' | 'sticker' | 'delete' | 'more';

export default function MessageActionModal({
  visible,
  message,
  isOwnMessage,
  canEditOrUndo,
  onClose,
  onReaction,
  onReply,
  onDelete,
  onEdit,
  onUndoSend,
  onSelect,
}: MessageActionModalProps) {
  const { colors } = useThemeStyles();
  const [currentView, setCurrentView] = useState<ModalView>('main');

  const handleHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleReaction = useCallback((emoji: string) => {
    if (emoji === '+') {
      setCurrentView('sticker');
      return;
    }
    handleHaptic();
    onReaction(emoji);
    onClose();
  }, [onReaction, onClose, handleHaptic]);

  const handleCopy = useCallback(async () => {
    if (!message) return;
    handleHaptic();
    await Clipboard.setStringAsync(message.content);
    Alert.alert('Copied', 'Message copied to clipboard');
    onClose();
  }, [message, onClose, handleHaptic]);

  const handleTranslate = useCallback(() => {
    if (!message) return;
    handleHaptic();
    const encoded = encodeURIComponent(message.content);
    Linking.openURL(`https://translate.google.com/?sl=auto&tl=en&text=${encoded}`);
    onClose();
  }, [message, onClose, handleHaptic]);

  const handleSearchWeb = useCallback(() => {
    if (!message) return;
    handleHaptic();
    const encoded = encodeURIComponent(message.content);
    Linking.openURL(`https://www.google.com/search?q=${encoded}`);
    onClose();
  }, [message, onClose, handleHaptic]);

  const handleShare = useCallback(async () => {
    if (!message) return;
    handleHaptic();
    try {
      await Share.share({ message: message.content });
    } catch (error) {
      console.log('[MessageActionModal] Share error:', error);
    }
    onClose();
  }, [message, onClose, handleHaptic]);

  const handleDeletePress = useCallback(() => {
    handleHaptic();
    setCurrentView('delete');
  }, [handleHaptic]);

  const handleDeleteConfirm = useCallback((forAll: boolean) => {
    handleHaptic();
    onDelete(forAll);
    onClose();
  }, [onDelete, onClose, handleHaptic]);

  const handleMorePress = useCallback(() => {
    handleHaptic();
    setCurrentView('more');
  }, [handleHaptic]);

  const handleBack = useCallback(() => {
    handleHaptic();
    setCurrentView('main');
  }, [handleHaptic]);

  const handleModalClose = useCallback(() => {
    setCurrentView('main');
    onClose();
  }, [onClose]);

  const renderReactionBar = () => (
    <View style={[styles.reactionBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {DEFAULT_REACTIONS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          style={styles.reactionButton}
          onPress={() => handleReaction(emoji)}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionEmoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMainActions = () => (
    <View style={[styles.actionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => { handleHaptic(); onReply(); onClose(); }}
        activeOpacity={0.7}
      >
        <MessageCircle size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Reply</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => { handleHaptic(); setCurrentView('sticker'); }}
        activeOpacity={0.7}
      >
        <Smile size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Attach Sticker</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={handleDeletePress}
        activeOpacity={0.7}
      >
        <Trash2 size={20} color={colors.error} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
      </TouchableOpacity>

      {isOwnMessage && (
        <TouchableOpacity
          style={[styles.actionRow, !canEditOrUndo && styles.actionDisabled]}
          onPress={() => { if (canEditOrUndo) { handleHaptic(); onEdit(); onClose(); } }}
          activeOpacity={canEditOrUndo ? 0.7 : 1}
        >
          <Pencil size={20} color={canEditOrUndo ? colors.text : colors.textSecondary} strokeWidth={1.5} />
          <Text style={[styles.actionText, { color: canEditOrUndo ? colors.text : colors.textSecondary }]}>
            Edit
          </Text>
        </TouchableOpacity>
      )}

      {isOwnMessage && (
        <TouchableOpacity
          style={[styles.actionRow, !canEditOrUndo && styles.actionDisabled]}
          onPress={() => { if (canEditOrUndo) { handleHaptic(); onUndoSend(); onClose(); } }}
          activeOpacity={canEditOrUndo ? 0.7 : 1}
        >
          <RotateCcw size={20} color={canEditOrUndo ? colors.text : colors.textSecondary} strokeWidth={1.5} />
          <Text style={[styles.actionText, { color: canEditOrUndo ? colors.text : colors.textSecondary }]}>
            Undo Send
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.actionRow}
        onPress={handleCopy}
        activeOpacity={0.7}
      >
        <Copy size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Copy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={handleTranslate}
        activeOpacity={0.7}
      >
        <Languages size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Translate</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={handleSearchWeb}
        activeOpacity={0.7}
      >
        <Search size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Search Web</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={handleShare}
        activeOpacity={0.7}
      >
        <Share2 size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => { handleHaptic(); onSelect(); onClose(); }}
        activeOpacity={0.7}
      >
        <CheckSquare size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Select</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={handleMorePress}
        activeOpacity={0.7}
      >
        <MoreHorizontal size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>More...</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStickerPicker = () => (
    <View style={[styles.actionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.stickerHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <X size={20} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={[styles.stickerTitle, { color: colors.text }]}>Choose a Sticker</Text>
      </View>
      <View style={styles.stickerGrid}>
        {STICKER_EMOJIS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={styles.stickerButton}
            onPress={() => handleReaction(emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.stickerEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDeleteConfirm = () => (
    <View style={[styles.actionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.deleteHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <X size={20} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={[styles.deleteTitle, { color: colors.text }]}>Delete Message</Text>
      </View>
      
      {isOwnMessage && (
        <TouchableOpacity
          style={styles.deleteOption}
          onPress={() => handleDeleteConfirm(true)}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color={colors.error} strokeWidth={1.5} />
          <Text style={[styles.deleteOptionText, { color: colors.error }]}>Delete for Everyone</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={styles.deleteOption}
        onPress={() => handleDeleteConfirm(false)}
        activeOpacity={0.7}
      >
        <Trash2 size={20} color={colors.textSecondary} strokeWidth={1.5} />
        <Text style={[styles.deleteOptionText, { color: colors.textSecondary }]}>Delete for Me</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMoreActions = () => (
    <View style={[styles.actionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.moreHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <X size={20} color={colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={[styles.moreTitle, { color: colors.text }]}>More Options</Text>
      </View>
      
      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => { handleHaptic(); Alert.alert('Forward', 'Forward feature coming soon'); onClose(); }}
        activeOpacity={0.7}
      >
        <Share2 size={20} color={colors.text} strokeWidth={1.5} />
        <Text style={[styles.actionText, { color: colors.text }]}>Forward</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => { handleHaptic(); Alert.alert('Pin', 'Pin feature coming soon'); onClose(); }}
        activeOpacity={0.7}
      >
        <Text style={styles.pinIcon}>📌</Text>
        <Text style={[styles.actionText, { color: colors.text }]}>Pin Message</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => { handleHaptic(); Alert.alert('Report', 'Report feature coming soon'); onClose(); }}
        activeOpacity={0.7}
      >
        <Text style={styles.pinIcon}>🚩</Text>
        <Text style={[styles.actionText, { color: colors.text }]}>Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionRow}
        onPress={() => { 
          handleHaptic(); 
          if (message) {
            const sentTime = new Date(message.createdAt).toLocaleString();
            const readTime = message.readAt ? new Date(message.readAt).toLocaleString() : 'Not read yet';
            Alert.alert('Message Details', `Sent: ${sentTime}\nRead: ${readTime}`);
          }
          onClose(); 
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.pinIcon}>ℹ️</Text>
        <Text style={[styles.actionText, { color: colors.text }]}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'sticker':
        return renderStickerPicker();
      case 'delete':
        return renderDeleteConfirm();
      case 'more':
        return renderMoreActions();
      default:
        return (
          <>
            {renderReactionBar()}
            {renderMainActions()}
          </>
        );
    }
  };

  if (!message) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <TouchableWithoutFeedback onPress={handleModalClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.contentWrapper}>
              <View style={[styles.messageBubblePreview, { 
                backgroundColor: isOwnMessage ? colors.tint : colors.card,
                borderColor: isOwnMessage ? 'transparent' : colors.border,
                alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
              }]}>
                <Text style={[styles.messagePreviewText, { 
                  color: isOwnMessage ? '#FFFFFF' : colors.text 
                }]} numberOfLines={3}>
                  {message.content}
                </Text>
              </View>
              
              <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {renderContent()}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
  },
  messageBubblePreview: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    maxWidth: '85%',
  },
  messagePreviewText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  reactionButton: {
    padding: SPACING.xs,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  actionsContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
  stickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  stickerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  stickerButton: {
    width: '20%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerEmoji: {
    fontSize: 28,
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  deleteTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
  deleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  deleteOptionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
  moreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  moreTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
  pinIcon: {
    fontSize: 20,
    width: 20,
    textAlign: 'center',
  },
});
