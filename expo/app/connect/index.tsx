import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Users, Mail, Link2, ChevronLeft } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { useAppStore } from '@/store/appStore';

type ConnectCategory = 'Connect' | 'Reflect' | 'Explore' | 'Share';

type ChatRoom = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  participants: number;
};

type ChatCategories = Record<ConnectCategory, ChatRoom[]>;

function toRoomId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const CHAT_CATEGORIES: ChatCategories = {
  Connect: [
    {
      id: toRoomId('Daily Spark Chat'),
      name: 'Daily Spark Chat',
      description: 'Rotating prompt daily; new faces, fresh energy.',
      emoji: '💫',
      participants: 1847,
    },
    {
      id: toRoomId('First Date Debriefs'),
      name: 'First Date Debriefs',
      description: 'Stories, reflections, lessons, and low-key humor.',
      emoji: '☕',
      participants: 923,
    },
    {
      id: toRoomId('The Real'),
      name: 'The Real',
      description: "Honest, thoughtful conversation when you're wide awake.",
      emoji: '🗣️',
      participants: 1562,
    },
    {
      id: toRoomId('Green Flags Only'),
      name: 'Green Flags Only',
      description: 'What healthy looks like in real life.',
      emoji: '✅',
      participants: 2014,
    },
    {
      id: toRoomId('Career & Calling'),
      name: 'Career & Calling',
      description: 'Ambition, balance, and building a meaningful life.',
      emoji: '💼',
      participants: 674,
    },
    {
      id: toRoomId('Entrepreneurs & Builders'),
      name: 'Entrepreneurs & Builders',
      description: 'Founders, creators, idea people, and momentum.',
      emoji: '🚀',
      participants: 891,
    },
    {
      id: toRoomId('Single & Thriving'),
      name: 'Single & Thriving',
      description: 'Celebrating singlehood, self-discovery, and growth - honoring the season you\'re in while staying open to love.',
      emoji: '✨',
      participants: 1329,
    },
    {
      id: toRoomId('Slow Burn Crew'),
      name: 'Slow Burn Crew',
      description: 'Depth over speed; no pressure, no rush.',
      emoji: '🕯️',
      participants: 765,
    },
    {
      id: toRoomId('Spiritual & Grounded'),
      name: 'Spiritual & Grounded',
      description: 'Faith, mindfulness, purpose, and perspective.',
      emoji: '🧘',
      participants: 1108,
    },
    {
      id: toRoomId('Healing Conversations'),
      name: 'Healing Conversations',
      description: 'Lessons learned, letting go, and rebuilding trust within.',
      emoji: '🌸',
      participants: 1456,
    },
  ],
  Reflect: [
    {
      id: toRoomId('Communication Lab'),
      name: 'Communication Lab',
      description: 'Say it better: clarity, tone, and understanding.',
      emoji: '💬',
      participants: 1234,
    },
    {
      id: toRoomId('Trust Builders'),
      name: 'Trust Builders',
      description: 'Vulnerability, consistency, honesty, and real alignment.',
      emoji: '🤝',
      participants: 987,
    },
    {
      id: toRoomId('Conflict Without Combat'),
      name: 'Conflict Without Combat',
      description: 'Disagree well, repair fast, stay respectful.',
      emoji: '🕊️',
      participants: 1543,
    },
    {
      id: toRoomId('Playful Energy'),
      name: 'Playful Energy',
      description: 'Flirting, humor, light banter done well',
      emoji: '✨',
      participants: 1876,
    },
    {
      id: toRoomId('Growth Season'),
      name: 'Growth Season',
      description: 'Becoming who you are becoming. Mindset shifts, personal evolution, and leveling up at your own pace',
      emoji: '🌱',
      participants: 1092,
    },
    {
      id: toRoomId('Gratitude Practice'),
      name: 'Gratitude Practice',
      description: 'Share appreciation, perspective shifts, and small wins.',
      emoji: '🙏',
      participants: 845,
    },
    {
      id: toRoomId('Intimacy (Beyond Physical)'),
      name: 'Intimacy (Beyond Physical)',
      description: 'Emotional closeness, safety, presence, and care.',
      emoji: '💞',
      participants: 1678,
    },
    {
      id: toRoomId('Boundaries & Balance'),
      name: 'Boundaries & Balance',
      description: 'Standards, self-respect, and clear expectations.',
      emoji: '⚖️',
      participants: 734,
    },
  ],
  Explore: [
    {
      id: toRoomId('Locals Only'),
      name: 'Locals Only',
      description: 'Events, weekend plans, and date ideas in your city.',
      emoji: '📍',
      participants: 1423,
    },
    {
      id: toRoomId('Pop-Ups'),
      name: 'Pop-Ups',
      description: 'Shops, shows, events, and takeovers in your area',
      emoji: '🛍️',
      participants: 892,
    },
    {
      id: toRoomId('Casual Meetups'),
      name: 'Casual Meetups',
      description: 'Coffee, walks, and low-pressure connection nearby.',
      emoji: '🚶',
      participants: 1267,
    },
    {
      id: toRoomId('Travel Stories'),
      name: 'Travel Stories',
      description: 'Dream trips, wild stories, and future itineraries.',
      emoji: '✈️',
      participants: 956,
    },
  ],
  Share: [
    {
      id: toRoomId('The Leaderboards'),
      name: 'The Leaderboards',
      description: 'Play + Connect invites competition, banter, and celebration for all of the shared victories.',
      emoji: '🏆',
      participants: 1654,
    },
    {
      id: toRoomId('Bookish Hearts'),
      name: 'Bookish Hearts',
      description: 'Readers, thinkers, and "one more chapter" people.',
      emoji: '📚',
      participants: 723,
    },
    {
      id: toRoomId('Creative Corner'),
      name: 'Creative Corner',
      description: 'Art, music, writing, and expressive energy.',
      emoji: '🎨',
      participants: 1089,
    },
    {
      id: toRoomId('Fitness for Connection'),
      name: 'Fitness for Connection',
      description: 'Movement without obsession; motivation and community.',
      emoji: '🏃',
      participants: 1398,
    },
    {
      id: toRoomId('Pop Culture Check-In'),
      name: 'Pop Culture Check-In',
      description: "Movies, shows, music, and what's trending.",
      emoji: '🎬',
      participants: 1876,
    },
    {
      id: toRoomId('Games & Anime'),
      name: 'Games & Anime',
      description: 'For the true gamers, anime lovers & cosplay fans',
      emoji: '🧝‍♀️',
      participants: 1245,
    },
    {
      id: toRoomId('Sports & Smack Talk'),
      name: 'Sports & Smack Talk',
      description: 'Fans without toxicity; play-by-play and banter.',
      emoji: '🏈',
      participants: 987,
    },
    {
      id: toRoomId('Music That Feels Like Me'),
      name: 'Music That Feels Like Me',
      description: 'Share songs that explain you better.',
      emoji: '🎵',
      participants: 834,
    },
  ],
};

const TAB_ORDER: ConnectCategory[] = ['Connect', 'Reflect', 'Explore', 'Share'];

export default function ConnectHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { getUnreadMessagesCount } = useAppStore();

  const [selectedTab, setSelectedTab] = useState<ConnectCategory>('Connect');
  
  const unreadCount = getUnreadMessagesCount();

  const rooms = useMemo(() => CHAT_CATEGORIES[selectedTab], [selectedTab]);

  const renderRoom: ListRenderItem<ChatRoom> = ({ item }) => {
    return (
      <TouchableOpacity
        testID={`connect-room-${item.id}`}
        style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          console.log('[ConnectHub] Open room', { id: item.id, name: item.name });
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push({ pathname: '/connect/room/[id]', params: { id: item.id } } as any);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.roomEmoji}>{item.emoji}</Text>
        <View style={styles.roomLeft}>
          <Text style={[styles.roomTitle, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.roomSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.roomRight}>
          <View style={styles.participantsBadge}>
            <Users size={12} color={colors.textSecondary} />
            <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
              {item.participants.toLocaleString()}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + SPACING.md,
            backgroundColor: colors.background,
          },
        ]}
        testID="connectHeader"
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              console.log('[ConnectHub] Back pressed');
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
            style={[styles.backButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={colors.text} strokeWidth={2.5} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Link2 size={22} color={colors.warning} strokeWidth={2} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>+ Connect</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/connect/messages' as any)}
            style={styles.headerRight}
            activeOpacity={0.7}
          >
            <Mail size={24} color={colors.text} strokeWidth={2} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Users size={40} color={colors.warning} strokeWidth={2} style={styles.heroIcon} />
          <Text style={[styles.pageHeader, { color: colors.text }]} testID="connect-page-header">
            Chat Spaces
          </Text>
          <Text style={[styles.pageDescription, { color: colors.textSecondary }]} testID="connect-page-description">
            Connect with people through prompts, rooms, and shared interests.
          </Text>
        </View>

        <View style={styles.tabsRow} testID="connect-category-tabs">
          {TAB_ORDER.map((tab) => {
            const isSelected = tab === selectedTab;
            return (
              <TouchableOpacity
                key={tab}
                testID={`connect-tab-${tab}`}
                style={[
                  styles.tabPill,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  isSelected && styles.tabPillActive,
                  isSelected && { backgroundColor: colors.accent + '20', borderColor: colors.accent },
                ]}
                onPress={() => {
                  console.log('[ConnectHub] Select tab', { tab });
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedTab(tab);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    { color: colors.textSecondary },
                    isSelected && styles.tabPillTextActive,
                    isSelected && { color: colors.accent },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <FlatList
          testID="connect-room-list"
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
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
    position: 'relative',
    flexShrink: 0,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  hero: {
    marginBottom: SPACING.md,
  },
  heroIcon: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  pageHeader: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -0.3,
    marginBottom: SPACING.xs,
  },
  pageDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tabPill: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabPillActive: {
    borderWidth: 2,
  },
  tabPillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabPillTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs - 0.5,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  roomEmoji: {
    fontSize: 32,
    marginRight: SPACING.xs,
  },
  roomLeft: {
    flex: 1,
  },
  roomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  participantsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  roomTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 4,
  },
  roomSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
});
