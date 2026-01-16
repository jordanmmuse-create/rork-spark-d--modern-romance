import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Smile, Briefcase, Feather } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { Tone } from '@/types';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

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
  const { colors } = useThemeStyles();
  const { profile, updateTone } = useAppStore();

  if (!profile) return null;

  const handleSelectTone = (tone: Tone) => {
    updateTone(tone);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Choose Your Tone',
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>How should we talk to you?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose the tone that resonates most with you.
          </Text>
        </View>

        <View style={styles.options}>
          {TONE_OPTIONS.map((option) => {
            const isSelected = profile.tone === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && [styles.optionCardSelected, { borderColor: colors.tint, backgroundColor: colors.surfaceAlt }],
                ]}
                onPress={() => handleSelectTone(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.optionIcon, { backgroundColor: colors.surfaceInset }]}>
                    <option.icon
                      size={28}
                      color={isSelected ? colors.tint : colors.textSecondary}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: colors.text },
                        isSelected && [styles.optionLabelSelected, { color: colors.tint }],
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                <View style={[styles.exampleBox, { backgroundColor: colors.surfaceInset }]}>
                  <Text style={[styles.exampleText, { color: colors.textSecondary }]}>{option.example}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          You can change this anytime in your preferences.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  options: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  optionCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
  },
  optionCardSelected: {},
  optionHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: SPACING.xs - 2,
  },
  optionLabelSelected: {},
  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  exampleBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  exampleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
