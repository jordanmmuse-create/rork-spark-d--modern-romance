import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { FocusArea } from '@/types';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { FOCUS_AREA_COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

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
  {
    id: 'desire',
    emoji: '🔥',
    title: 'Desire',
    description: 'Keeping attraction, tension, and novelty alive.',
    subTopics: [
      'Flirtation',
      'Confidence',
      'Presence',
      'Novelty / Spontaneity',
      'Tension / Anticipation',
      'Mystery',
      'Validation',
      'Intention / Feeling Chosen',
    ],
  },
];

export default function FocusAreasEditScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { profile, updateGoals, toggleFocusArea } = useAppStore();
  
  const [expandedAreas, setExpandedAreas] = useState<Set<FocusArea>>(
    new Set(profile?.focusAreas || [])
  );
  
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>(
    profile?.goals || []
  );
  
  if (!profile) return null;

  const selectedAreas = profile.focusAreas;
  const allAreas = Object.keys(FOCUS_AREA_INFO) as FocusArea[];
  const unselectedAreas = allAreas.filter(area => !selectedAreas.includes(area));
  const orderedAreas = [...selectedAreas, ...unselectedAreas];

  const toggleExpand = (area: FocusArea) => {
    setExpandedAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(area)) {
        newSet.delete(area);
      } else {
        newSet.add(area);
      }
      return newSet;
    });
  };
  
  const toggleSubTopic = (category: string, subTopic: string) => {
    const id = `${category}:${subTopic}`;
    const isCurrentlySelected = selectedSubTopics.includes(id);
    
    if (!isCurrentlySelected) {
      const categoryAsFocusArea = category as FocusArea;
      if (profile && !profile.focusAreas.includes(categoryAsFocusArea)) {
        toggleFocusArea(categoryAsFocusArea);
      }
    }
    
    setSelectedSubTopics((prev) => {
      if (prev.includes(id)) {
        return prev.filter((st) => st !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isSubTopicSelected = (category: string, subTopic: string) => {
    const id = `${category}:${subTopic}`;
    return selectedSubTopics.includes(id);
  };

  const hasSelectedSubTopics = (categoryId: string) => {
    return selectedSubTopics.some(id => id.startsWith(`${categoryId}:`));
  };

  const handleSave = () => {
    updateGoals(selectedSubTopics);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Edit Growth Points',
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + SPACING.xl + 60 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Select your growth points
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Tap to expand areas and select specific growth points you want to focus on.
            </Text>
          </View>

          <View style={styles.areas}>
            {orderedAreas.map((area) => {
              const category = CATEGORIES.find(c => c.id === area);
              if (!category) return null;
              
              const isExpanded = expandedAreas.has(area);
              const hasSelected = hasSelectedSubTopics(area);
              const areaColor = FOCUS_AREA_COLORS[area];

              return (
                <View
                  key={area}
                  style={[
                    styles.areaCard,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: (isExpanded || hasSelected) ? areaColor : colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.areaHeader}
                    onPress={() => toggleExpand(area)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.areaHeaderLeft}>
                      <Text style={styles.areaEmoji}>{category.emoji}</Text>
                      <View style={styles.areaHeaderText}>
                        <Text
                          style={[
                            styles.areaTitle,
                            { color: (isExpanded || hasSelected) ? areaColor : colors.text },
                          ]}
                        >
                          {category.title}
                        </Text>
                        {!isExpanded && (
                          <Text style={[styles.areaDescription, { color: colors.textSecondary }]}>
                            {category.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color={areaColor} />
                    ) : (
                      <ChevronDown size={20} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <Text style={[styles.expandedDescription, { color: colors.text }]}>
                        {category.description}
                      </Text>
                      <View style={styles.subTopicsContainer}>
                        {category.subTopics.map((subTopic) => {
                          const isSelected = isSubTopicSelected(category.id, subTopic);
                          return (
                            <TouchableOpacity
                              key={subTopic}
                              style={[
                                styles.subTopicChip,
                                { 
                                  backgroundColor: isSelected ? colors.tint : colors.background,
                                  borderColor: isSelected ? colors.tint : colors.border,
                                },
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
                                  { color: isSelected ? 'white' : colors.text },
                                ]}
                              >
                                {subTopic}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
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
            { 
              paddingBottom: insets.bottom + SPACING.md,
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.tint, '#FF6B35']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                Save Changes
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
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  areas: {
    gap: SPACING.md,
  },
  areaCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md + 2,
  },
  areaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaEmoji: {
    fontSize: 26,
    marginRight: SPACING.sm,
  },
  areaHeaderText: {
    flex: 1,
  },
  areaTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  areaDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginTop: SPACING.xs - 2,
  },
  expandedContent: {
    paddingHorizontal: SPACING.md + 2,
    paddingBottom: SPACING.md + 2,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  expandedDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  subTopicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  subTopicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    gap: SPACING.xs - 2,
  },
  subTopicText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  button: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
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
