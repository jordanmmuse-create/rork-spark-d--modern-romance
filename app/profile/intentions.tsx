import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2, Target } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

const MAX_INTENTIONS = 5;

export default function IntentionsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { profile, updateIntentions } = useAppStore();
  const [editableIntentions, setEditableIntentions] = useState<string[]>(
    profile?.intentions || []
  );
  const [newIntention, setNewIntention] = useState<string>('');

  if (!profile) return null;

  const handleAddIntention = () => {
    const trimmed = newIntention.trim();
    if (trimmed.length > 0 && editableIntentions.length < MAX_INTENTIONS) {
      setEditableIntentions([...editableIntentions, trimmed]);
      setNewIntention('');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleRemoveIntention = (index: number) => {
    setEditableIntentions(editableIntentions.filter((_, i) => i !== index));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    updateIntentions(editableIntentions);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const canAdd = editableIntentions.length < MAX_INTENTIONS && newIntention.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'My Intentions',
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
              paddingTop: SPACING.md,
              paddingBottom: insets.bottom + SPACING.xl + 80,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surfaceAlt }]}>
            <Target size={32} color={colors.tint} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Your Intentions</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Set up to {MAX_INTENTIONS} intentions that guide your relationship journey.
          </Text>
        </View>

        <View style={[styles.counterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.counterText, { color: colors.textSecondary }]}>
            <Text style={[styles.counterNumber, { color: colors.tint }]}>
              {editableIntentions.length}
            </Text>
            /{MAX_INTENTIONS} intentions saved
          </Text>
        </View>

        {editableIntentions.length > 0 && (
          <View style={styles.intentionsSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Current Intentions</Text>
            {editableIntentions.map((intention, index) => (
              <View
                key={index}
                style={[styles.intentionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.intentionBullet, { backgroundColor: colors.tint }]} />
                <Text style={[styles.intentionText, { color: colors.text }]}>{intention}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveIntention(index)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {editableIntentions.length < MAX_INTENTIONS && (
          <View style={styles.addSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Add New Intention</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., Practice active listening"
                placeholderTextColor={colors.textSecondary}
                value={newIntention}
                onChangeText={setNewIntention}
                onSubmitEditing={handleAddIntention}
                multiline
                numberOfLines={2}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: canAdd ? colors.tint : colors.surfaceAlt },
                ]}
                onPress={handleAddIntention}
                disabled={!canAdd}
                activeOpacity={0.7}
              >
                <Plus size={20} color={canAdd ? '#FFFFFF' : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
          </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Set Intentions</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  counterCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  counterText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  counterNumber: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  intentionsSection: {
    marginBottom: SPACING.xl,
  },
  addSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  intentionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  intentionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  intentionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  deleteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    padding: SPACING.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
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
    color: '#FFFFFF',
  },
});
