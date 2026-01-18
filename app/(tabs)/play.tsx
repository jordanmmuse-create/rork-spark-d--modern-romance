import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabScroll } from './_layout';
import { Gamepad2, Users, Play, Repeat, Target, Sparkles } from 'lucide-react-native';
import { SEED_GAMES_TURN_BASED, SEED_GAMES_COLLABORATIVE, SEED_CHALLENGES } from '@/constants/data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { HEADER_RIGHT_OFFSET, HEADER_TOP_OFFSET } from '@/constants/header';
import HeaderProfileButton from '@/components/HeaderProfileButton';
import { Game, CommunityChallenge } from '@/types';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const [selectedTab, setSelectedTab] = useState<'games' | 'challenges'>('games');
  const scrollRef = useRef<ScrollView>(null);
  const { registerScroll } = useTabScroll();

  const isProfileButtonActive = false;

  useEffect(() => {
    registerScroll('play', scrollRef);
  }, [registerScroll]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {selectedTab === 'challenges' && isProfileButtonActive && (
        <View style={[styles.profileButtonAbsolute, { top: insets.top + HEADER_TOP_OFFSET, right: HEADER_RIGHT_OFFSET }]}>
          <HeaderProfileButton variant="playChallenges" />
        </View>
      )}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Gamepad2 size={28} color={colors.tint} strokeWidth={2} />
              <Text style={[styles.title, { color: colors.text }]}>Play</Text>
            </View>
            {selectedTab === 'games' && (
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
                style={styles.logo}
                resizeMode="contain"
              />
            )}
            {selectedTab === 'challenges' && !isProfileButtonActive && (
              <View style={styles.challengeProfileInline}>
                <HeaderProfileButton variant="playChallenges" />
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Games and challenges to strengthen your bond
        </Text>

        <Text style={[styles.mantra, { color: colors.text }]}>
          Flirt. Compete. Laugh. Repeat.
        </Text>

        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1wr45gun0gjo59tejd968' }}
          style={styles.lineSeparator}
          resizeMode="contain"
        />

        <View style={[styles.tabContainer, { backgroundColor: colors.tint + '20', borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'games' && [styles.tabActive, { backgroundColor: colors.tint }],
            ]}
            onPress={() => setSelectedTab('games')}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                selectedTab === 'games' && styles.tabTextActive,
              ]}
            >
              Games
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'challenges' && [styles.tabActive, { backgroundColor: colors.tint }],
            ]}
            onPress={() => setSelectedTab('challenges')}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                selectedTab === 'challenges' && styles.tabTextActive,
              ]}
            >
              Challenges
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'games' ? (
          <View>
            <View style={styles.sectionHeader}>
              <Repeat size={18} color="#136C8D" strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Take Turns!</Text>
            </View>
            <View style={styles.section}>
              {SEED_GAMES_TURN_BASED.map((game) => (
                <GameCard key={game.id} game={game} colors={colors} />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Users size={18} color="#10B981" strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Collaborate!</Text>
            </View>
            <View style={styles.section}>
              {SEED_GAMES_COLLABORATIVE.map((game) => (
                <GameCard key={game.id} game={game} colors={colors} />
              ))}
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.sectionHeader}>
              <Target size={18} color="#F97316" strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Challenges</Text>
            </View>
            <View style={styles.section}>
              {SEED_CHALLENGES.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} colors={colors} />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Sparkles size={18} color="#F59E0B" strokeWidth={2} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Play + Connect</Text>
            </View>
            <View style={styles.section}>
              <ChallengeCard
                challenge={{
                  id: 'sparkd-bingo',
                  title: 'Spark\'d Bingo (Monthly)',
                  emoji: '🏅',
                  description: 'Complete daily app-powered tasks to fill your unique monthly bingo card and chase special rewards.',
                  startDate: '2025-01-01',
                  endDate: '2025-01-31',
                  participants: 487,
                  category: 'growth',
                  status: 'active',
                }}
                colors={colors}
              />
              <ChallengeCard
                challenge={{
                  id: 'game-night',
                  title: 'Game Night Thursdays',
                  emoji: '🎯',
                  description: 'Join the weekly app-wide Game Night and compete in themed challenges to earn points and share proof.',
                  startDate: '2025-01-01',
                  endDate: '2025-12-31',
                  participants: 356,
                  category: 'play',
                  status: 'active',
                }}
                colors={colors}
              />
              <ChallengeCard
                challenge={{
                  id: 'story-seeds',
                  title: 'Story Seeds',
                  emoji: '🌿',
                  description: 'Submit a 3–5 line mini-story each week based on a story prompt for community highlights and badges.',
                  startDate: '2025-01-15',
                  endDate: '2025-12-31',
                  participants: 0,
                  category: 'communication',
                  status: 'upcoming',
                }}
                colors={colors}
              />
              <PlayConnectCard
                challenge={{
                  id: 'the-leaderboards',
                  title: 'The Leaderboards',
                  emoji: '🏆',
                  description: 'Play + Connect invites competition, banter, and celebration for all of the shared victories.',
                  startDate: '2025-01-01',
                  endDate: '2025-12-31',
                  participants: 1654,
                  category: 'play',
                  status: 'active',
                }}
                colors={colors}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function GameCard({ game, colors }: { game: Game; colors: any }) {
  const router = useRouter();
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'deep':
        return '#A78BFA';
      case 'romantic':
        return '#F472B6';
      case 'fun':
        return '#FBBF24';
      case 'competitive':
        return '#F97316';
      default:
        return colors.accent;
    }
  };

  const getGameEmoji = (title: string) => {
    if (title.includes('L\'Inked')) return '🔗';
    if (title.includes('Echo')) return '🗣️';
    if (title.includes('Memory Lane')) return '🛣️';
    if (title.includes('Level-Up')) return '🎛️';
    if (title.includes('36 Questions')) return '❓';
    if (title.includes('Chess')) return '♟️';
    if (title.includes('Words With Friends')) return '🔤';
    if (title.includes('Two Truths')) return '🫆';
    if (title.includes('Truth or Dare')) return '🤫';
    if (title.includes('Pieces of Us')) return '🧩';
    if (title.includes('Compatibility')) return '💞';
    if (title.includes('Would You Rather')) return '🕵️';
    if (title.includes('Favorites')) return '🫶';
    if (title.includes('Scenario Swap')) return '🎭';
    if (title.includes('Battle of Opinions')) return '🏆';
    return '🎮';
  };

  const categoryColor = getCategoryColor(game.category);
  const emoji = getGameEmoji(game.title);

  const handlePress = () => {
    if (game.title.includes("L'Inked")) {
      console.log('[Play] Navigate to L\'Inked');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      router.push('/linked' as any);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{game.title}</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{game.description}</Text>
        <View style={styles.cardMeta}>
          <View
            style={[
              styles.badge,
              { backgroundColor: categoryColor + '20' },
            ]}
          >
            <Text style={[styles.badgeText, { color: categoryColor }]}>
              {game.category}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{game.estTime} min</Text>
        </View>
      </View>
      <Play size={20} color={colors.tint} />
    </TouchableOpacity>
  );
}

function PlayConnectCard({ challenge, colors }: { challenge: CommunityChallenge; colors: any }) {
  const router = useRouter();
  const participants = challenge.participants || 0;

  const handlePress = () => {
    console.log('[Play] Navigate to leaderboards chat');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({ pathname: '/connect/room/[id]', params: { id: 'the-leaderboards' } } as any);
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} 
      activeOpacity={0.8}
      onPress={handlePress}
    >
      {challenge.emoji && (
        <Text style={styles.cardEmoji}>{challenge.emoji}</Text>
      )}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{challenge.title}</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{challenge.description}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.participantsBadge}>
            <Users size={12} color={colors.textSecondary} />
            <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
              {participants.toLocaleString()} joined
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  challenge.status === 'active'
                    ? colors.success + '20'
                    : colors.textSecondary + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    challenge.status === 'active'
                      ? colors.success
                      : colors.textSecondary,
                },
              ]}
            >
              {challenge.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ChallengeCard({ challenge, colors }: { challenge: CommunityChallenge; colors: any }) {
  const participants = challenge.participants || 0;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
      {challenge.emoji && (
        <Text style={styles.cardEmoji}>{challenge.emoji}</Text>
      )}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{challenge.title}</Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{challenge.description}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.participantsBadge}>
            <Users size={12} color={colors.textSecondary} />
            <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
              {participants.toLocaleString()} joined
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  challenge.status === 'active'
                    ? colors.success + '20'
                    : colors.textSecondary + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    challenge.status === 'active'
                      ? colors.success
                      : colors.textSecondary,
                },
              ]}
            >
              {challenge.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  lineSeparator: {
    width: 200,
    height: 12,
    marginTop: 0,
    marginBottom: SPACING.md,
    alignSelf: 'center',
  },
  headerSection: {
    marginBottom: SPACING.xs,
  },
  profileButtonAbsolute: {
    position: 'absolute',
    zIndex: 10,
  },
  challengeProfileInline: {
    marginRight: -SPACING.lg + HEADER_RIGHT_OFFSET,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 120,
    height: 36,
    marginRight: -SPACING.lg,
  },

  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.xs,
    zIndex: 1,
  },
  mantra: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginTop: SPACING.sm + 4,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs - 2,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'transparent',
  },
  tabActive: {},
  tabText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabTextActive: {
    color: 'white',
  },
  section: {
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  cardEmoji: {
    fontSize: 32,
    marginRight: SPACING.xs,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 4,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.xs + 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'capitalize' as const,
  },
  metaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  participantsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'capitalize' as const,
  },
  comingSoonCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 80,
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontStyle: 'italic' as const,
  },
});
