import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Share,
  PanResponder,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useAppStore } from '@/store/appStore';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import ImageAttachment from '@/components/ImageAttachment';
import { MessageCircle, Share2, Copy, Mail } from 'lucide-react-native';
import type { ParqType } from '@/types';
import * as Sharing from 'expo-sharing';
import * as SMS from 'expo-sms';
import { generateSparkCardFile, getPlainTextShareMessage } from '@/utils/sparkCardGenerator';

interface SendContentModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string, attachmentUri?: string) => void;
  title: string;
  categoryLabel: string;
  accentColor: string;
  initialText: string;
  placeholder?: string;
  mode?: 'spark' | 'parq' | 'inspo';
  parqType?: ParqType;
  parqDefaultMessage?: string;
}

const MAX_CHARACTERS = 500;
const SPARK_LOGO_ASSET = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/uahcbjuz3204xc7ekucrd';

export default function SendContentModal({
  visible,
  onClose,
  onSend,
  title,
  categoryLabel,
  accentColor,
  initialText,
  placeholder = 'Write your message...',
  mode = 'spark',
  parqType,
  parqDefaultMessage,
}: SendContentModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const router = useRouter();
  const [message, setMessage] = useState<string>('');
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 80) {
          closeActions();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setMessage(initialText);
      setAttachmentUri(null);
      setShowActions(false);
      slideAnim.setValue(300);
    }
  }, [visible, initialText, slideAnim]);

  const openActions = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowActions(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeActions = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowActions(false);
      slideAnim.setValue(300);
    });
  };

  const handleCopyLink = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const plainText = mode === 'spark' ? getPlainTextShareMessage() : message;
    await Clipboard.setStringAsync(plainText);
  };

  const handleShareTo = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      if (Platform.OS === 'web') {
        const plainText = mode === 'spark' ? getPlainTextShareMessage() : message;
        await Share.share({ message: plainText });
        return;
      }
      
      if (mode === 'spark') {
        const file = await generateSparkCardFile(message);
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'text/html',
            dialogTitle: 'Share Spark\'d Card',
            UTI: 'public.html',
          });
        }
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleMessages = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync([], message);
      } else {
        const plainText = mode === 'spark' ? getPlainTextShareMessage() : message;
        await Share.share({ message: plainText });
      }
    } catch (error) {
      console.log('SMS error:', error);
    }
  };

  const { setPendingSparkShare } = useAppStore();

  const handleNewMessage = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const payload = {
      id: `spark-share-${Date.now()}`,
      createdAt: Date.now(),
      sparkText: message,
      sparkLogoAsset: SPARK_LOGO_ASSET,
      isParq: mode === 'parq',
      parqType: mode === 'parq' ? parqType : undefined,
      parqDefaultMessage: mode === 'parq' ? parqDefaultMessage : undefined,
    };
    
    console.log('[SendContentModal] Setting pending spark share:', payload.id, 'isParq:', payload.isParq);
    setPendingSparkShare(payload);
    
    onClose();
    router.push('/connect/new-message?intent=shareSpark');
  };

  const charactersRemaining = MAX_CHARACTERS - message.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Pressable
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.background,
                  paddingBottom: insets.bottom + SPACING.md,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
            <ScrollView
              keyboardShouldPersistTaps="always"
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
            <View style={styles.handleBar}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {title}
              </Text>
              <TouchableOpacity onPressIn={onClose} activeOpacity={0.7}>
                <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoryContainer}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: accentColor + '20',
                    borderColor: accentColor,
                  },
                ]}
              >
                <Text style={[styles.categoryText, { color: accentColor }]}>
                  {categoryLabel}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.textInputContainer,
                {
                  backgroundColor: accentColor + '10',
                  borderColor: accentColor,
                },
              ]}
            >
              <View style={styles.inputHeader}>
                <ImageAttachment
                  imageUri={attachmentUri}
                  onImageSelected={setAttachmentUri}
                  colors={colors}
                />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.text },
                ]}
                value={message}
                onChangeText={setMessage}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={MAX_CHARACTERS}
                autoFocus={true}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.footerContainer}>
              <View style={styles.footer}>
                <Text
                  style={[
                    styles.characterCount,
                    { color: colors.textSecondary },
                    charactersRemaining < 0 && { color: colors.error || '#EF4444' },
                  ]}
                >
                  {charactersRemaining} characters remaining
                </Text>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: accentColor,
                      opacity: message.trim() && charactersRemaining >= 0 ? 1 : 0.5,
                      shadowColor: accentColor,
                    },
                  ]}
                  onPressIn={openActions}
                  disabled={!message.trim() || charactersRemaining < 0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sendButtonText}>{title}</Text>
                </TouchableOpacity>
              </View>

              {showActions && (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.actionTray,
                    {
                      backgroundColor: colors.background,
                      borderColor: accentColor + '30',
                      shadowColor: accentColor,
                      transform: [{ translateX: slideAnim }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCopyLink}
                    activeOpacity={0.7}
                  >
                    <Copy size={24} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Copy Text</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShareTo}
                    activeOpacity={0.7}
                  >
                    <Share2 size={24} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Share To...</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleMessages}
                    activeOpacity={0.7}
                  >
                    <MessageCircle size={24} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Messages</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleNewMessage}
                    activeOpacity={0.7}
                  >
                    <Mail size={24} color="#FF3B30" />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>+ Messenger</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
            </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    position: 'relative',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.xs,
    minHeight: 400,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cancelButton: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  categoryContainer: {
    marginBottom: SPACING.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  textInputContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    padding: SPACING.md,
    minHeight: 160,
    marginBottom: SPACING.md,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  textInput: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    minHeight: 140,
    outlineStyle: 'none' as const,
  },
  footerContainer: {
    position: 'relative',
    minHeight: 90,
    height: 90,
  },
  footer: {
    gap: SPACING.sm,
    zIndex: 1,
  },
  characterCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'right',
  },
  sendButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
  actionTray: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 100,
    overflow: 'hidden',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 4,
  },
});
