import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

type TitlePromptMode = 'letter' | 'poem' | 'note';

interface TitlePromptModalProps {
  visible: boolean;
  mode: TitlePromptMode;
  onCancel: () => void;
  onConfirm: (titleOrCategory: string) => void;
}

const NOTE_CATEGORIES = [
  { id: 'sweet_nothing', label: 'Sweet Nothing' },
  { id: 'reminder', label: 'Reminder' },
] as const;

export default function TitlePromptModal({
  visible,
  mode,
  onCancel,
  onConfirm,
}: TitlePromptModalProps) {
  const { colors } = useThemeStyles();
  const [titleText, setTitleText] = useState('');
  const [selectedNoteCategory, setSelectedNoteCategory] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitleText('');
      setSelectedNoteCategory(null);
    }
  }, [visible]);

  const isNoteMode = mode === 'note';
  const canConfirm = isNoteMode
    ? selectedNoteCategory !== null
    : titleText.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isNoteMode && selectedNoteCategory) {
      const category = NOTE_CATEGORIES.find(c => c.id === selectedNoteCategory);
      onConfirm(category?.label || 'Sweet Nothing');
    } else {
      onConfirm(titleText.trim());
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedNoteCategory(categoryId);
  };

  const getModalTitle = () => {
    if (mode === 'letter') return 'Name Your Letter';
    if (mode === 'poem') return 'Name Your Poem';
    return 'What Kind of Note?';
  };

  const getModalSubtitle = () => {
    if (mode === 'letter') return 'Give your letter a memorable title';
    if (mode === 'poem') return 'Give your poem a memorable title';
    return 'Choose a category for your note';
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        />

        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getModalTitle()}
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={22} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getModalSubtitle()}
          </Text>

          {isNoteMode ? (
            <View style={styles.categoryContainer}>
              {NOTE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    selectedNoteCategory === category.id && [
                      styles.categoryButtonActive,
                      { backgroundColor: '#FF6B35' + '20', borderColor: '#FF6B35' },
                    ],
                  ]}
                  onPress={() => handleSelectCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: colors.textSecondary },
                      selectedNoteCategory === category.id && [
                        styles.categoryButtonTextActive,
                        { color: '#FF6B35' },
                      ],
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={mode === 'letter' ? 'e.g., "For You, Tonight"' : 'e.g., "Moonlight Whispers"'}
                placeholderTextColor={colors.textSecondary}
                value={titleText}
                onChangeText={setTitleText}
                autoFocus
                maxLength={50}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                {titleText.length}/50
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: canConfirm ? colors.tint : colors.surfaceAlt },
              ]}
              onPress={handleConfirm}
              disabled={!canConfirm}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  { color: canConfirm ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 360,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.sizes.md,
    outlineStyle: 'none' as const,
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  categoryContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  categoryButtonActive: {},
  categoryButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  categoryButtonTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
