import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flag } from 'lucide-react-native';

import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

interface Milestone {
  id: string;
  date: string;
  type: 'xp' | 'streak' | 'anniversary' | 'first-time' | 'achievement';
  title: string;
  description: string;
  icon: string;
}

export default function MilestonesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { profile, userSparks, journalEntries } = useAppStore();

  const generateMilestones = (): Milestone[] => {
    const milestones: Milestone[] = [];
    
    if (!profile) return milestones;

    const completedSparks = userSparks.filter(us => us.status === 'completed').length;
    const totalJournalEntries = journalEntries.length;
    const currentXP = profile.totalXP;
    const currentStreak = profile.streak;
    const hasIntentions = profile.intentions && profile.intentions.length > 0;

    if (profile.hasCompletedOnboarding) {
      milestones.push({
        id: 'first-spark',
        date: profile.createdAt,
        type: 'first-time',
        title: 'Journey Begins',
        description: hasIntentions 
          ? 'You\'ve started your journey with Spark\'d! Welcome to a community of growth.'
          : 'You\'ve started your journey with Spark\'d! Now let\'s set your intentions for growth.',
        icon: '✨',
      });
    }

    if (hasIntentions) {
      milestones.push({
        id: 'intentions-set',
        date: profile.createdAt,
        type: 'achievement',
        title: 'Intentions Set',
        description: completedSparks === 0 && totalJournalEntries === 0
          ? `You've set ${profile.intentions!.length} intention${profile.intentions!.length > 1 ? 's' : ''} for growth! Try completing your first Spark or writing in your journal to build momentum.`
          : `You've set ${profile.intentions!.length} intention${profile.intentions!.length > 1 ? 's' : ''} for growth! You're building a strong foundation for transformation.`,
        icon: '🎯',
      });
    }

    if (completedSparks >= 1 && completedSparks < 10) {
      milestones.push({
        id: 'first-spark-complete',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'first-time',
        title: 'First Spark Completed',
        description: totalJournalEntries === 0
          ? 'Completed your first Spark! Keep the momentum going by exploring the journal feature to reflect on your growth.'
          : 'Completed your first Spark! You\'re taking action on your intentions.',
        icon: '🌟',
      });
    }

    if (totalJournalEntries >= 1 && totalJournalEntries < 5) {
      milestones.push({
        id: 'first-journal',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'first-time',
        title: 'First Journal Entry',
        description: 'Started documenting your journey! Reflection is a powerful tool for growth. Keep writing to track your progress.',
        icon: '📝',
      });
    }

    if (profile.anniversary) {
      const anniversaryDate = new Date(profile.anniversary);
      const now = new Date();
      const yearsSince = now.getFullYear() - anniversaryDate.getFullYear();
      
      if (yearsSince >= 1) {
        milestones.push({
          id: 'anniversary-1',
          date: new Date(anniversaryDate.getFullYear() + 1, anniversaryDate.getMonth(), anniversaryDate.getDate()).toISOString(),
          type: 'anniversary',
          title: 'One-Year Anniversary',
          description: 'Celebrated your first year together on this journey.',
          icon: '🎉',
        });
      }
    }

    if (currentXP >= 100) {
      milestones.push({
        id: 'xp-100',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'xp',
        title: '100 XP Milestone',
        description: 'Reached 100 XP by engaging consistently with Sparks and growth activities. Try exploring Journeys for deeper transformation.',
        icon: '⭐',
      });
    }

    if (completedSparks >= 10) {
      milestones.push({
        id: 'sparks-10',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'achievement',
        title: '10 Sparks Completed',
        description: 'Completed 10 Sparks, showing dedication to personal and relationship growth. You\'re building lasting habits!',
        icon: '🔥',
      });
    }

    if (currentStreak >= 7) {
      milestones.push({
        id: 'streak-7',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'streak',
        title: '7-Day Streak Achieved',
        description: 'Maintained a 7-day streak of consistent engagement with daily Sparks. Consistency is the key to transformation!',
        icon: '🔥',
      });
    }

    if (totalJournalEntries >= 5) {
      milestones.push({
        id: 'journal-5',
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'achievement',
        title: '5 Journal Entries',
        description: 'Documented 5 meaningful moments and reflections in your journal. Your story is unfolding beautifully.',
        icon: '✍️',
      });
    }

    if (profile.status === 'partnered' && profile.partnerGroupId) {
      milestones.push({
        id: 'partner-sync',
        date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'achievement',
        title: 'Partner Synced',
        description: 'Connected with your partner to share Sparks and grow together. Your journey is stronger together!',
        icon: '💕',
      });
    }

    return milestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const milestones = generateMilestones();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Milestones',
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
        <View style={styles.headerSection}>
          <Flag size={32} color="#FBBF24" strokeWidth={2} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Your Journey</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Celebrate your biggest victories and achievements
          </Text>
        </View>

        {milestones.length > 0 ? (
          <View style={styles.timelineContainer}>
            {milestones.map((milestone, index) => (
              <TouchableOpacity
                key={milestone.id}
                style={styles.timelineItem}
                activeOpacity={0.7}
              >
                <View style={styles.timelineLeftColumn}>
                  <View style={[styles.timelineDot, { backgroundColor: '#FBBF24' }]} />
                  {index < milestones.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: '#FBBF24', opacity: 0.3 }]} />
                  )}
                </View>
                
                <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                    {new Date(milestone.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Text>
                  
                  <View style={[styles.timelineBadge, { backgroundColor: '#FBBF24' + '20', borderColor: '#FBBF24' }]}>
                    <Text style={styles.badgeEmoji}>{milestone.icon}</Text>
                    <Text style={[styles.timelineBadgeText, { color: '#FBBF24' }]}>Milestone</Text>
                  </View>
                  
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>{milestone.title}</Text>
                  <Text style={[styles.timelineSummary, { color: colors.textSecondary }]}>
                    {milestone.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Flag size={48} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your milestones await</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Keep engaging with Sparks, journaling, and growing. Your achievements will appear here.
            </Text>
          </View>
        )}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  timelineContainer: {
    marginTop: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: SPACING.xs - 2,
  },
  timelineCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  timelineBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  timelineTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
    lineHeight: 20,
  },
  timelineSummary: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  emptyState: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
});
