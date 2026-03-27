import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { NotebookCategory, SendTarget } from '@/types';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, NOTEBOOK_CATEGORY_COLORS } from '@/constants/colors';
import ImageAttachment from '@/components/ImageAttachment';
import TitlePromptModal from '@/components/TitlePromptModal';

const MAX_JOURNAL_LENGTH = 1000;
const MAX_NOTES_LENGTH = 100;

type CategoryConfig = {
  id: NotebookCategory;
  label: string;
  color: string;
};

const categories: CategoryConfig[] = [
  { id: 'notes', label: 'Note', color: '#FF6B35' },
  { id: 'journal', label: 'Journal', color: '#10B981' },
  { id: 'love_letter', label: 'Letter', color: '#60A5FA' },
  { id: 'poems', label: 'Poem', color: '#EF4444' },
];

type SendTargetOption = {
  id: SendTarget;
  label: string;
};

const sendTargetOptions: SendTargetOption[] = [
  { id: 'partner', label: 'To Partner!' },
  { id: 'vault', label: 'To the Vault!' },
];

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { addJournalEntry, theme } = useAppStore();
  
  const getTodayDate = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };
  
  const [journalText, setJournalText] = useState<string>('');
  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<NotebookCategory>('journal');
  const [sendTarget, setSendTarget] = useState<SendTarget>('vault');
  const [attachmentUri, setAttachmentUri] = useState<string | null>(null);
  const [showTitlePrompt, setShowTitlePrompt] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleTextChange = (text: string) => {
    if (!hasStartedTyping && text.length > 0) {
      setHasStartedTyping(true);
    }
    setJournalText(text);
  };

  React.useEffect(() => {
    if (selectedCategory === 'journal' && sendTarget === 'partner') {
      setSendTarget('vault');
    }
  }, [selectedCategory, sendTarget]);

  const handleSave = () => {
    const finalText = journalText.trim();
    if (!finalText) return;
    
    if (selectedCategory === 'journal') {
      addJournalEntry({ 
        content: finalText, 
        tags: [], 
        category: selectedCategory, 
        sendTarget,
        attachmentUri: attachmentUri || undefined,
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } else {
      setShowTitlePrompt(true);
    }
  };

  const handleTitleConfirm = (title: string) => {
    const finalText = journalText.trim();
    if (!finalText) return;
    
    addJournalEntry({ 
      content: finalText, 
      tags: [], 
      category: selectedCategory, 
      sendTarget,
      attachmentUri: attachmentUri || undefined,
      title,
    });
    
    setShowTitlePrompt(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const handleTitleCancel = () => {
    setShowTitlePrompt(false);
  };

  const datePrefix = getTodayDate();
  const displayText = hasStartedTyping ? journalText : '';
  const maxLength = selectedCategory === 'notes' ? MAX_NOTES_LENGTH : MAX_JOURNAL_LENGTH;
  const remaining = maxLength - journalText.length;
  const isOverLimit = remaining < 0;
  
  const categoryColors = NOTEBOOK_CATEGORY_COLORS[theme][selectedCategory];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Let\'s Write!',
          headerShadowVisible: false,
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: SPACING.sm,
              paddingBottom: insets.bottom + SPACING.md,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View>
          <View style={styles.header}>
            <Text style={styles.iconEmoji}>📝</Text>
            <Text style={[styles.title, { color: colors.text }]}>My Notebook</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Send a sweet note to your partner, submit a journal reflection, write a love letter, or show your poetic side! Whatever you&apos;re feeling, just write…
            </Text>
          </View>

          <View style={styles.categorySelector}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  selectedCategory === category.id && [
                    styles.categoryButtonActive,
                    { backgroundColor: category.color + '20', borderColor: category.color },
                  ],
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    { color: colors.textSecondary },
                    selectedCategory === category.id && [
                      styles.categoryButtonTextActive,
                      { color: category.color },
                    ],
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputSection}>
            <Pressable
              style={[
                styles.inputContainer,
                {
                  backgroundColor: isOverLimit ? colors.surface : categoryColors.background,
                  borderColor: isOverLimit ? colors.error : categoryColors.border,
                }
              ]}
              onPress={() => inputRef.current?.focus()}
            >
              <View style={styles.inputHeader}>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  {datePrefix}
                </Text>
                <ImageAttachment
                  imageUri={attachmentUri}
                  onImageSelected={setAttachmentUri}
                  colors={colors}
                />
              </View>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="Write from the heart…"
                placeholderTextColor={colors.textSecondary}
                value={displayText}
                onChangeText={handleTextChange}
                multiline
                textAlignVertical="top"
                maxLength={maxLength + 50}
              />
            </Pressable>
            <View style={styles.characterCounter}>
              <Text style={[
                styles.counterText, 
                { color: isOverLimit ? colors.error : colors.textSecondary }
              ]}>
                {remaining} characters remaining
              </Text>
            </View>
          </View>

          <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>💡Tips for a great journal entry</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Write about the day, weeks, or anything that&apos;s happened since your last entry.{'\n'}
              • Be honest about how you&apos;ve been feeling— this space is for you & your partner.{'\n'}
              • Capture little details you might want to be remembered later on.
            </Text>
          </View>

          <View style={styles.sendTargetSelector}>
            {sendTargetOptions.map((option) => {
              const isJournalCategory = selectedCategory === 'journal';
              const isPartnerOption = option.id === 'partner';
              const isDisabled = isJournalCategory && isPartnerOption;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sendTargetButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    sendTarget === option.id && [
                      styles.sendTargetButtonActive,
                      { backgroundColor: colors.tint, borderColor: colors.tint },
                    ],
                    isDisabled && [
                      styles.sendTargetButtonDisabled,
                      { backgroundColor: colors.surface, opacity: 0.4 },
                    ],
                  ]}
                  onPress={() => {
                    if (isDisabled) return;
                    setSendTarget(option.id);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  disabled={isDisabled}
                  activeOpacity={isDisabled ? 1 : 0.7}
                >
                  <Text
                    style={[
                      styles.sendTargetButtonText,
                      { color: colors.textSecondary },
                      sendTarget === option.id && !isDisabled && [
                        styles.sendTargetButtonTextActive,
                        { color: '#FFFFFF' },
                      ],
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { backgroundColor: (isOverLimit || !journalText.trim()) ? colors.surfaceAlt : colors.tint }
          ]}
          onPress={handleSave}
          disabled={isOverLimit || !journalText.trim()}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.saveButtonText,
            { color: (isOverLimit || !journalText.trim()) ? colors.textSecondary : '#FFFFFF' }
          ]}>
            Send Entry
          </Text>
        </TouchableOpacity>
      </View>

      <TitlePromptModal
        visible={showTitlePrompt}
        mode={selectedCategory === 'love_letter' ? 'letter' : selectedCategory === 'poems' ? 'poem' : 'note'}
        onCancel={handleTitleCancel}
        onConfirm={handleTitleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
  },
  iconEmoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs - 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '100%',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm + 2,
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryButtonActive: {},
  categoryButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm - 1,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  categoryButtonTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  inputSection: {
    marginBottom: SPACING.sm + 4,
  },
  inputContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 160,
    padding: SPACING.md,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 20,
    minHeight: 120,
    outlineStyle: 'none' as const,
  },
  characterCounter: {
    marginTop: SPACING.xs,
    alignItems: 'flex-end',
  },
  counterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tipCard: {
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm + 2,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
  },
  sendTargetSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sendTargetButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  sendTargetButtonActive: {},
  sendTargetButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sendTargetButtonTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  sendTargetButtonDisabled: {},
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  saveButton: {
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
