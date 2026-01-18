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
import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { FocusArea } from '@/types';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

interface SubTopic {
  id: string;
  label: string;
  category: string;
}

interface Category {
  id: string;
  emoji: string;
  title: string;
  description: string;
  subTopics: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'communication',
    emoji: '💬',
    title: 'Communication',
    description: 'How we send, receive, and understand each other.',
    subTopics: [
      'Active Listening',
      'Expressing Needs Clearly',
      'Vulnerability & Honesty',
      'Emotional Articulation',
      'Tone & Delivery Awareness',
      'Nonverbal Communication',
      'Repair Attempts',
      'Conversation Balance',
    ],
  },
  {
    id: 'trust',
    emoji: '🤝',
    title: 'Trust',
    description: 'The foundation of emotional safety.',
    subTopics: [
      'Reliability & Consistency',
      'Transparency',
      'Follow-Through',
      'Emotional Safety',
      'Loyalty & Commitment',
      'Reassurance & Affirmation',
      'Financial Trust',
      'Digital Boundaries & Trust',
    ],
  },
  {
    id: 'play',
    emoji: '🎨',
    title: 'Play',
    description: 'Keeping the relationship fun, light, and alive.',
    subTopics: [
      'Shared Humor',
      'Playful Banter',
      'Spontaneity',
      'Games & Challenges',
      'Shared Hobbies',
      'Adventures & Exploration',
      'Surprise & Novelty',
      'Creative Expression Together',
    ],
  },
  {
    id: 'intimacy',
    emoji: '💕',
    title: 'Intimacy',
    description: 'Emotional, physical, and soulful closeness.',
    subTopics: [
      'Emotional Intimacy',
      'Physical Touch & Affection',
      'Sexual Connection',
      'Quality Time',
      'Spiritual Intimacy',
      'Being Seen & Known',
      'Desire & Passion',
      'Rituals of Togetherness',
    ],
  },
  {
    id: 'conflict',
    emoji: '⚡',
    title: 'Conflict',
    description: 'How we navigate differences and repair.',
    subTopics: [
      'De-Escalation Skills',
      'Fair Fighting Rules',
      'Understanding Triggers',
      'Conflict Styles',
      'Apology & Forgiveness',
      'Accountability',
      'Managing Expectations',
      'Repair & Reconnection',
    ],
  },
  {
    id: 'gratitude',
    emoji: '🙏',
    title: 'Gratitude',
    description: 'Recognizing and celebrating each other.',
    subTopics: [
      'Verbal Appreciation',
      'Acts of Kindness',
      'Noticing the Small Things',
      'Celebrating Wins',
      'Affectionate Recognition',
      'Being Present & Mindful',
      'Love Languages',
      'Daily Micro-Thankfulness',
    ],
  },
  {
    id: 'growth',
    emoji: '🌱',
    title: 'Growth',
    description: 'Becoming better individually and together.',
    subTopics: [
      'Self-Awareness',
      'Emotional Maturity',
      'Goal Setting',
      'Learning New Skills Together',
      'Healthy Habits & Routines',
      'Relationship Reflection',
      'Change Adaptability',
      'Personal Healing Work',
    ],
  },
  {
    id: 'boundaries',
    emoji: '🛡️',
    title: 'Boundaries',
    description: 'Respecting limits and protecting the relationship.',
    subTopics: [
      'Emotional Boundaries',
      'Time Boundaries',
      'Digital Boundaries',
      'Family & Friends Boundaries',
      'Financial Boundaries',
      'Physical Space & Privacy',
      'Work/Life Balance',
      'Sexual Boundaries & Comfort Zones',
    ],
  },
];

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const { onboardingData, updateOnboarding } = useAppStore();
  
  const filteredCategories = CATEGORIES.filter(category => 
    onboardingData.focusAreas.includes(category.id as FocusArea)
  );
  const [selectedSubTopics, setSelectedSubTopics] = useState<SubTopic[]>(
    onboardingData.goals.map((goal) => {
      const parts = goal.split(':');
      return {
        id: goal,
        label: parts[1] || goal,
        category: parts[0] || 'unknown',
      };
    })
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubTopic = (category: string, subTopic: string) => {
    const id = `${category}:${subTopic}`;
    setSelectedSubTopics((prev) => {
      const exists = prev.find((st) => st.id === id);
      if (exists) {
        return prev.filter((st) => st.id !== id);
      } else {
        return [...prev, { id, label: subTopic, category }];
      }
    });
  };

  const isSubTopicSelected = (category: string, subTopic: string) => {
    const id = `${category}:${subTopic}`;
    return selectedSubTopics.some((st) => st.id === id);
  };

  const handleContinue = () => {
    const goals = selectedSubTopics.map((st) => st.id);
    updateOnboarding({ goals, step: 3 });
    router.push('/onboarding/profile-details' as any);
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
                console.log('[Goals] Back pressed');
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
              <Text style={[styles.headerTitle, { color: Colors.dark.text }]}>Growth Points</Text>
            </View>

            <TouchableOpacity
              testID="onboarding-goals-later"
              onPress={() => router.push('/onboarding/profile-details' as any)}
              style={styles.headerRight}
              activeOpacity={0.7}
            >
              <Text style={styles.laterButtonText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { 
              paddingBottom: insets.bottom + SPACING.xl + 60 
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeader}>
            <Text style={styles.title}>What do you want to work on?</Text>
            <Text style={styles.subtitle}>Select all that resonate with you.</Text>
          </View>

          <View style={styles.categories}>
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              return (
                <View key={category.id} style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryHeaderLeft}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      <View style={styles.categoryHeaderText}>
                        <Text style={styles.categoryTitle}>{category.title}</Text>
                        <Text style={styles.categoryDescription}>{category.description}</Text>
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color={Colors.dark.textSecondary} />
                    ) : (
                      <ChevronDown size={20} color={Colors.dark.textSecondary} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.subTopicsContainer}>
                      {category.subTopics.map((subTopic) => {
                        const isSelected = isSubTopicSelected(category.id, subTopic);
                        return (
                          <TouchableOpacity
                            key={subTopic}
                            style={[
                              styles.subTopicChip,
                              isSelected && styles.subTopicChipSelected,
                            ]}
                            onPress={() => toggleSubTopic(category.id, subTopic)}
                            activeOpacity={0.7}
                          >
                            {isSelected && (
                              <Check size={14} color="white" strokeWidth={3} />
                            )}
                            <Text
                              style={[
                                styles.subTopicText,
                                isSelected && styles.subTopicTextSelected,
                              ]}
                            >
                              {subTopic}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
              selectedSubTopics.length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedSubTopics.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedSubTopics.length > 0
                  ? [Colors.dark.tint, '#FF6B35']
                  : ['#444444', '#333333']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                Continue ({selectedSubTopics.length} selected)
              </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  pageHeader: {
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
  categories: {
    gap: SPACING.md,
  },
  categoryContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  categoryHeaderText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  subTopicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  subTopicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    backgroundColor: Colors.dark.background,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    gap: SPACING.xs - 2,
  },
  subTopicChipSelected: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  subTopicText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.text,
  },
  subTopicTextSelected: {
    color: 'white',
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

  laterButtonText: {
    color: '#0EA5E9',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
