import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Share,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  Copy,
  Trash2,
  Share2,
  Languages,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import type { Message } from '@/types';

interface ChatSelectModeBarProps {
  selectedMessages: Message[];
  onCopy: () => void;
  onDelete: () => void;
  onShare: () => void;
  onTranslate: () => void;
  onCancel: () => void;
}

export default function ChatSelectModeBar({
  selectedMessages,
  onCopy,
  onDelete,
  onShare,
  onTranslate,
  onCancel,
}: ChatSelectModeBarProps) {
  const { colors } = useThemeStyles();
  const [showMore, setShowMore] = useState(false);

  const handleHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    handleHaptic();
    const text = selectedMessages.map(m => m.content).join('\n\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${selectedMessages.length} message(s) copied`);
    onCopy();
  }, [selectedMessages, onCopy, handleHaptic]);

  const handleDelete = useCallback(() => {
    handleHaptic();
    Alert.alert(
      'Delete Messages',
      `Delete ${selectedMessages.length} selected message(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete for Me', onPress: onDelete },
      ]
    );
  }, [selectedMessages.length, onDelete, handleHaptic]);

  const handleShare = useCallback(async () => {
    handleHaptic();
    const text = selectedMessages.map(m => m.content).join('\n\n');
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.log('[ChatSelectModeBar] Share error:', error);
    }
    onShare();
  }, [selectedMessages, onShare, handleHaptic]);

  const handleTranslate = useCallback(() => {
    handleHaptic();
    onTranslate();
  }, [onTranslate, handleHaptic]);

  const handleMorePress = useCallback(() => {
    handleHaptic();
    setShowMore(true);
  }, [handleHaptic]);

  const count = selectedMessages.length;

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.countContainer}>
          <Text style={[styles.countText, { color: colors.text }]}>
            {count} selected
          </Text>
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            activeOpacity={0.7}
            disabled={count === 0}
          >
            <Copy size={22} color={count > 0 ? colors.text : colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: count > 0 ? colors.text : colors.textSecondary }]}>
              Copy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
            activeOpacity={0.7}
            disabled={count === 0}
          >
            <Trash2 size={22} color={count > 0 ? colors.error : colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: count > 0 ? colors.error : colors.textSecondary }]}>
              Delete
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
            disabled={count === 0}
          >
            <Share2 size={22} color={count > 0 ? colors.text : colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: count > 0 ? colors.text : colors.textSecondary }]}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTranslate}
            activeOpacity={0.7}
            disabled={count === 0}
          >
            <Languages size={22} color={count > 0 ? colors.text : colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: count > 0 ? colors.text : colors.textSecondary }]}>
              Translate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={handleMorePress}
            activeOpacity={0.7}
          >
            <ChevronRight size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => { handleHaptic(); onCancel(); }}
          activeOpacity={0.7}
        >
          <X size={18} color={colors.text} strokeWidth={2} />
          <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMore}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMore(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMore(false)}>
          <View style={styles.moreOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.moreContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.moreTitle, { color: colors.text }]}>More Options</Text>
                
                <TouchableOpacity
                  style={styles.moreOption}
                  onPress={() => { 
                    handleHaptic(); 
                    Alert.alert('Forward', 'Forward feature coming soon'); 
                    setShowMore(false); 
                  }}
                  activeOpacity={0.7}
                >
                  <Share2 size={20} color={colors.text} strokeWidth={1.5} />
                  <Text style={[styles.moreOptionText, { color: colors.text }]}>Forward</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.moreOption}
                  onPress={() => { 
                    handleHaptic(); 
                    Alert.alert('Pin', 'Pin feature coming soon'); 
                    setShowMore(false); 
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moreIcon}>📌</Text>
                  <Text style={[styles.moreOptionText, { color: colors.text }]}>Pin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.moreOption}
                  onPress={() => { 
                    handleHaptic(); 
                    Alert.alert('Report', 'Report feature coming soon'); 
                    setShowMore(false); 
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moreIcon}>🚩</Text>
                  <Text style={[styles.moreOptionText, { color: colors.text }]}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.closeMoreButton, { borderTopColor: colors.border }]}
                  onPress={() => { handleHaptic(); setShowMore(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.closeMoreText, { color: colors.tint }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  actionButton: {
    alignItems: 'center',
    padding: SPACING.xs,
    minWidth: 50,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
  },
  moreButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
  moreOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  moreContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moreTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
    textAlign: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  moreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  moreOptionText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  moreIcon: {
    fontSize: 20,
    width: 20,
    textAlign: 'center',
  },
  closeMoreButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  closeMoreText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold as '600',
  },
});
