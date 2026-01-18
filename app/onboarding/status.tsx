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
import { Heart, Users, Sparkles, MessageCircle, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { RelationshipStatus } from '@/types';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

const STATUS_OPTIONS: {
  value: RelationshipStatus;
  label: string;
  icon: typeof Heart;
  description: string;
}[] = [
  {
    value: 'single',
    label: 'Single',
    icon: Sparkles,
    description: 'Working on myself and future relationships',
  },
  {
    value: 'dating',
    label: 'Dating',
    icon: MessageCircle,
    description: 'Exploring connection with someone new',
  },
  {
    value: 'partnered',
    label: 'In a Relationship',
    icon: Heart,
    description: 'Committed and growing together',
  },
  {
    value: 'complicated',
    label: 'It\'s Complicated',
    icon: Users,
    description: 'Navigating something in between',
  },
];

export default function StatusScreen() {
  const insets = useSafeAreaInsets();
  const { onboardingData, updateOnboarding } = useAppStore();

  const handleSelect = (status: RelationshipStatus) => {
    updateOnboarding({ status, step: 1 });
    router.push('/onboarding/focus-areas' as any);
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
                console.log('[Status] Back pressed');
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
              <Text style={[styles.headerTitle, { color: Colors.dark.text }]}>Welcome</Text>
            </View>

            <View style={styles.headerRight} />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { 
              paddingBottom: insets.bottom + SPACING.xl 
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>What brings you here?</Text>
            <Text style={styles.subtitle}>
              Choose what best describes your current relationship status.
            </Text>
          </View>

          <View style={styles.options}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  onboardingData.status === option.value && styles.optionCardSelected,
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <option.icon
                    size={32}
                    color={
                      onboardingData.status === option.value
                        ? Colors.dark.tint
                        : Colors.dark.textSecondary
                    }
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      onboardingData.status === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.disclaimer}>
            This helps us personalize your experience. You can change this anytime.
          </Text>
        </ScrollView>
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
    flexDirection: 'row',
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
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.surfaceInset,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
    marginBottom: SPACING.xs,
  },
  optionLabelSelected: {
    color: Colors.dark.tint,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
