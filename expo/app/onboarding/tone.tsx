import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Smile, Briefcase, Feather } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { Tone } from '@/types';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

const TONE_OPTIONS: {
  value: Tone;
  label: string;
  icon: typeof Smile;
  description: string;
  example: string;
}[] = [
  {
    value: 'playful',
    label: 'Playful',
    icon: Smile,
    description: 'Light, fun, and encouraging',
    example: '"Time to sprinkle some magic on your day!"',
  },
  {
    value: 'practical',
    label: 'Practical',
    icon: Briefcase,
    description: 'Direct, actionable, and clear',
    example: '"Here\'s what research shows works best."',
  },
  {
    value: 'poetic',
    label: 'Poetic',
    icon: Feather,
    description: 'Reflective, thoughtful, and lyrical',
    example: '"Like tending a garden, love needs intention."',
  },
];

export default function ToneScreen() {
  const insets = useSafeAreaInsets();
  const { onboardingData, completeOnboarding } = useAppStore();
  const [selectedTone, setSelectedTone] = useState<Tone | null>(
    onboardingData.tone
  );

  const handleComplete = () => {
    if (!selectedTone || !onboardingData.status) return;

    completeOnboarding(
      onboardingData.status,
      onboardingData.goals,
      onboardingData.focusAreas,
      selectedTone,
      10,
      onboardingData.name,
      onboardingData.username,
      onboardingData.birthday,
      onboardingData.partnerBirthday,
      onboardingData.anniversary
    );
    router.replace('/(tabs)/library');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View
          style={[
            styles.headerBar,
            {
              paddingTop: insets.top,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => {
                console.log('[Tone] Back pressed');
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              style={[styles.backButton, { borderColor: Colors.dark.border }]}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color={Colors.dark.text} strokeWidth={2.5} />
              <Text style={[styles.backButtonText, { color: Colors.dark.text }]}>Back</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: Colors.dark.text }]}>Choose Your Tone</Text>
            </View>

            <View style={styles.headerRight} />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + SPACING.xl + 60 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>How should we talk to you?</Text>
            <Text style={styles.subtitle}>
              Choose the tone that resonates most with you.
            </Text>
          </View>

          <View style={styles.options}>
            {TONE_OPTIONS.map((option) => {
              const isSelected = selectedTone === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedTone(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionHeader}>
                    <View style={styles.optionIcon}>
                      <option.icon
                        size={28}
                        color={
                          isSelected
                            ? Colors.dark.tint
                            : Colors.dark.textSecondary
                        }
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleText}>{option.example}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.disclaimer}>
            Almost done! This is the last step.
          </Text>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + SPACING.md }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.button,
              !selectedTone && styles.buttonDisabled,
            ]}
            onPress={handleComplete}
            disabled={!selectedTone}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedTone
                  ? [Colors.dark.tint, '#FF6B35']
                  : ['#444444', '#333333']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Start Your Journey</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: Colors.dark.surface,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerRight: {
    minWidth: 44,
    height: 44,
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  options: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    padding: SPACING.lg,
    backgroundColor: Colors.dark.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  optionCardSelected: {
    borderColor: Colors.dark.tint,
    backgroundColor: Colors.dark.surfaceAlt,
  },
  optionHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
    marginBottom: SPACING.xs - 2,
  },
  optionLabelSelected: {
    color: Colors.dark.tint,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  exampleBox: {
    backgroundColor: Colors.dark.surfaceInset,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  exampleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: Colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  button: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
});
