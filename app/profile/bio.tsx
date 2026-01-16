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
import { Edit3 } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

const MAX_BIO_LENGTH = 200;

export default function BioScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { profile, updateProfile } = useAppStore();
  const [bioText, setBioText] = useState<string>(profile?.bio || '');

  if (!profile) return null;

  const handleSave = () => {
    updateProfile({ bio: bioText.trim() });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const remaining = MAX_BIO_LENGTH - bioText.length;
  const isOverLimit = remaining < 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Edit Bio',
          headerShadowVisible: false,
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceAlt }]}>
              <Edit3 size={32} color={colors.tint} strokeWidth={1.5} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Your Bio</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Share a little about yourself and what brings you here. (Max {MAX_BIO_LENGTH} characters)
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: isOverLimit ? colors.error : colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Write something about yourself..."
                placeholderTextColor={colors.textSecondary}
                value={bioText}
                onChangeText={setBioText}
                multiline
                textAlignVertical="top"
                maxLength={MAX_BIO_LENGTH + 50}
              />
            </View>
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
            <Text style={[styles.tipTitle, { color: colors.text }]}>💡 Tips for a great bio</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              • Share what you&apos;re hoping to grow or strengthen{'\n'}
              • Mention your relationship stage if you&apos;d like{'\n'}
              • Keep it authentic and true to you
            </Text>
          </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + SPACING.md }]}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { backgroundColor: isOverLimit ? colors.surfaceAlt : colors.tint }
          ]}
          onPress={handleSave}
          disabled={isOverLimit}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.saveButtonText,
            { color: isOverLimit ? colors.textSecondary : '#FFFFFF' }
          ]}>
            Save Bio
          </Text>
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
  inputSection: {
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 150,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    padding: SPACING.md,
    lineHeight: 22,
    minHeight: 150,
  },
  characterCounter: {
    marginTop: SPACING.sm,
    alignItems: 'flex-end',
  },
  counterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tipCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
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
  },
});
