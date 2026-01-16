import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ListRenderItem,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Send } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

type ChatMessage = {
  id: string;
  role: 'system' | 'member' | 'you';
  text: string;
  createdAt: number;
};

type RoomInfo = {
  id: string;
  name: string;
  description: string;
  emoji: string;
};

const ROOM_INDEX: Record<string, RoomInfo> = {
  'the-leaderboards': {
    id: 'the-leaderboards',
    name: 'The Leaderboards',
    description: 'Play + Connect invites competition, banter, and celebration for all of the shared victories.',
    emoji: '🏆',
  },
  'daily-spark-chat': {
    id: 'daily-spark-chat',
    name: 'Daily Spark Chat',
    description: 'Rotating prompt daily; new faces, fresh energy.',
    emoji: '💫',
  },
  'gratitude-practice': {
    id: 'gratitude-practice',
    name: 'Gratitude Practice',
    description: 'Share appreciation, perspective shifts, and small wins.',
    emoji: '🙏',
  },
  'healing-conversations': {
    id: 'healing-conversations',
    name: 'Healing Conversations',
    description: 'Lessons learned, letting go, and rebuilding trust within.',
    emoji: '🌸',
  },
  'late-night-thoughts': {
    id: 'late-night-thoughts',
    name: 'Late Night Thoughts',
    description: 'Honest, thoughtful conversation when you\'re wide awake.',
    emoji: '🗣️',
  },
  'communication-lab': {
    id: 'communication-lab',
    name: 'Communication Lab',
    description: 'Say it better: clarity, tone, and understanding.',
    emoji: '💬',
  },
  'conflict-without-combat': {
    id: 'conflict-without-combat',
    name: 'Conflict Without Combat',
    description: 'Disagree well, repair fast, stay respectful.',
    emoji: '🕊️',
  },
  'trust-builders': {
    id: 'trust-builders',
    name: 'Trust Builders',
    description: 'Vulnerability, consistency, honesty, and real alignment.',
    emoji: '🤝',
  },
  'intimacy-beyond-physical': {
    id: 'intimacy-beyond-physical',
    name: 'Intimacy (Beyond Physical)',
    description: 'Emotional closeness, safety, presence, and care.',
    emoji: '💞',
  },
  'boundaries-balance': {
    id: 'boundaries-balance',
    name: 'Boundaries & Balance',
    description: 'Standards, self-respect, and clear expectations.',
    emoji: '⚖️',
  },
  'slow-burn-crew': {
    id: 'slow-burn-crew',
    name: 'Slow Burn Crew',
    description: 'Depth over speed; no pressure, no rush.',
    emoji: '🕯️',
  },
  'green-flags-only': {
    id: 'green-flags-only',
    name: 'Green Flags Only',
    description: 'What healthy looks like in real life.',
    emoji: '✅',
  },
  'first-date-debriefs': {
    id: 'first-date-debriefs',
    name: 'First Date Debriefs',
    description: 'Stories, reflections, lessons, and low-key humor.',
    emoji: '☕',
  },
  'casual-meetups': {
    id: 'casual-meetups',
    name: 'Casual Meetups',
    description: 'Coffee, walks, and low-pressure connection nearby.',
    emoji: '🚶',
  },
  'locals-only': {
    id: 'locals-only',
    name: 'Locals Only',
    description: 'Events, weekend plans, and date ideas in your city.',
    emoji: '📍',
  },
  'bookish-hearts': {
    id: 'bookish-hearts',
    name: 'Bookish Hearts',
    description: 'Readers, thinkers, and "one more chapter" people.',
    emoji: '📚',
  },
  'creative-corner': {
    id: 'creative-corner',
    name: 'Creative Corner',
    description: 'Art, music, writing, and expressive energy.',
    emoji: '🎨',
  },
  'fitness-for-connection': {
    id: 'fitness-for-connection',
    name: 'Fitness for Connection',
    description: 'Movement without obsession; motivation and community.',
    emoji: '🏃',
  },
  'travel-stories': {
    id: 'travel-stories',
    name: 'Travel Stories',
    description: 'Dream trips, wild stories, and future itineraries.',
    emoji: '✈️',
  },
  'spiritual-grounded': {
    id: 'spiritual-grounded',
    name: 'Spiritual & Grounded',
    description: 'Faith, mindfulness, purpose, and perspective.',
    emoji: '🧘',
  },
  'career-calling': {
    id: 'career-calling',
    name: 'Career & Calling',
    description: 'Ambition, balance, and building a meaningful life.',
    emoji: '💼',
  },
  'entrepreneurs-builders': {
    id: 'entrepreneurs-builders',
    name: 'Entrepreneurs & Builders',
    description: 'Founders, creators, idea people, and momentum.',
    emoji: '🚀',
  },
  'single-thriving': {
    id: 'single-thriving',
    name: 'Single & Thriving',
    description: 'Celebrating singlehood, self-discovery, and growth - honoring the season you\'re in while staying open to love.',
    emoji: '✨',
  },
  'pop-culture-check-in': {
    id: 'pop-culture-check-in',
    name: 'Pop Culture Check-In',
    description: 'Movies, shows, music, and what\'s trending.',
    emoji: '🎬',
  },
  'sports-smack-talk': {
    id: 'sports-smack-talk',
    name: 'Sports & Smack Talk',
    description: 'Fans without toxicity; play-by-play and banter.',
    emoji: '🏈',
  },
  'games-anime': {
    id: 'games-anime',
    name: 'Games & Anime',
    description: 'For the true gamers, anime lovers & cosplay fans',
    emoji: '🧝‍♀️',
  },
  'pop-ups': {
    id: 'pop-ups',
    name: 'Pop-Ups',
    description: 'Shops, shows, events, and takeovers in your area',
    emoji: '🛍️',
  },
  'music-that-feels-like-me': {
    id: 'music-that-feels-like-me',
    name: 'Music That Feels Like Me',
    description: 'Share songs that explain you better.',
    emoji: '🎵',
  },
  'the-real': {
    id: 'the-real',
    name: 'The Real',
    description: 'Honest, thoughtful conversation when you\'re wide awake.',
    emoji: '🗣️',
  },
  'playful-energy': {
    id: 'playful-energy',
    name: 'Playful Energy',
    description: 'Flirting, humor, light banter done well',
    emoji: '✨',
  },
  'growth-season': {
    id: 'growth-season',
    name: 'Growth Season',
    description: 'Becoming who you are becoming. Mindset shifts, personal evolution, and leveling up at your own pace',
    emoji: '🌱',
  },
};

function seedMessagesForRoom(room: RoomInfo): ChatMessage[] {
  const now = Date.now();
  const base: ChatMessage[] = [
    {
      id: 'm1',
      role: 'system',
      text: `Welcome to ${room.name}. Keep it kind, curious, and real.`,
      createdAt: now - 1000 * 60 * 12,
    },
    {
      id: 'm2',
      role: 'member',
      text: 'Quick icebreaker: what brought you here today?',
      createdAt: now - 1000 * 60 * 10,
    },
    {
      id: 'm3',
      role: 'member',
      text: 'One thing I\'m trying lately: being more direct without being harsh.',
      createdAt: now - 1000 * 60 * 8,
    },
  ];

  if (room.id === 'gratitude-practice') {
    return [
      ...base,
      {
        id: 'm4',
        role: 'member',
        text: 'Today I\'m grateful for a calm conversation that didn\'t spiral.',
        createdAt: now - 1000 * 60 * 6,
      },
      {
        id: 'm5',
        role: 'member',
        text: 'Small win: I asked for what I needed instead of hinting.',
        createdAt: now - 1000 * 60 * 4,
      },
    ];
  }

  if (room.id === 'daily-spark-chat') {
    return [
      ...base,
      {
        id: 'm4',
        role: 'member',
        text: 'Prompt check: what\'s one green flag you noticed this week?',
        createdAt: now - 1000 * 60 * 6,
      },
      {
        id: 'm5',
        role: 'member',
        text: 'Mine: someone who asks follow-up questions and remembers details.',
        createdAt: now - 1000 * 60 * 4,
      },
    ];
  }

  if (room.id === 'conflict-without-combat') {
    return [
      ...base,
      {
        id: 'm4',
        role: 'member',
        text: 'A line that helps me: "We\'re on the same team."',
        createdAt: now - 1000 * 60 * 6,
      },
      {
        id: 'm5',
        role: 'member',
        text: 'What\'s your best repair move after a tense moment?',
        createdAt: now - 1000 * 60 * 4,
      },
    ];
  }

  if (room.id === 'late-night-thoughts') {
    return [
      ...base,
      {
        id: 'm4',
        role: 'member',
        text: 'Late-night question: what are you unlearning right now?',
        createdAt: now - 1000 * 60 * 6,
      },
    ];
  }

  return [
    ...base,
    {
      id: 'm4',
      role: 'member',
      text: 'No pressure—share a thought or ask a question in one sentence.',
      createdAt: now - 1000 * 60 * 6,
    },
  ];
}

export default function ConnectRoomScreen() {
  const router = useRouter();
  const { colors } = useThemeStyles();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const roomId = useMemo(() => {
    const raw = params.id;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return (value ?? '').toString();
  }, [params.id]);

  const room = useMemo<RoomInfo | null>(() => {
    if (!roomId) return null;
    return ROOM_INDEX[roomId] ?? null;
  }, [roomId]);

  const [draft, setDraft] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (roomId && ROOM_INDEX[roomId]) return seedMessagesForRoom(ROOM_INDEX[roomId]);
    return [];
  });

  useEffect(() => {
    if (!room) {
      setMessages([]);
      return;
    }
    setMessages(seedMessagesForRoom(room));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [room]);

  const listRef = useRef<FlatList<ChatMessage> | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        listRef.current?.scrollToEnd({ animated: true });
      } catch (e) {
        console.log('[ConnectRoom] scrollToEnd failed', e);
      }
    });
  }, []);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `you-${Date.now()}`,
      role: 'you',
      text,
      createdAt: Date.now(),
    };

    console.log('[ConnectRoom] send', { roomId, textLength: text.length });
    setMessages((prev) => [...prev, newMsg]);
    setDraft('');
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    scrollToBottom();
  }, [draft, roomId, scrollToBottom]);

  const renderMessage: ListRenderItem<ChatMessage> = ({ item }) => {
    const isYou = item.role === 'you';
    const isSystem = item.role === 'system';

    const bubbleBg = isSystem
      ? colors.backgroundSecondary
      : isYou
        ? colors.accent + '25'
        : colors.card;

    const borderColor = isSystem ? colors.border : colors.border;

    return (
      <View
        style={[
          styles.msgRow,
          isYou ? styles.msgRowYou : styles.msgRowOther,
        ]}
      >
        <View
          style={[
            styles.msgBubble,
            { backgroundColor: bubbleBg, borderColor },
            isSystem && styles.msgBubbleSystem,
          ]}
        >
          <Text
            style={[
              styles.msgMeta,
              { color: colors.textSecondary },
              isYou && { textAlign: 'right' },
            ]}
          >
            {isSystem ? 'System' : isYou ? 'You' : 'Member'}
          </Text>
          <Text style={[styles.msgText, { color: colors.text }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  if (!room) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}
        testID="connect-room-not-found"
      >
  
        <View style={styles.notFoundWrap}>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>Room not found</Text>
          <Text style={[styles.notFoundSubtitle, { color: colors.textSecondary }]}>That chat room doesn&apos;t exist yet.</Text>
          <TouchableOpacity
            testID="connect-room-not-found-back"
            style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>


      <View style={styles.headerBlock}>
        <View style={styles.roomNameRow}>
          <Text style={styles.roomEmoji}>{room.emoji}</Text>
          <Text style={[styles.roomName, { color: colors.text }]} testID="connect-room-name">
            {room.name}
          </Text>
        </View>
        <Text style={[styles.roomDesc, { color: colors.textSecondary }]} testID="connect-room-description">
          {room.description}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.chatWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
      >
        <FlatList
          ref={(r) => {
            listRef.current = r;
          }}
          testID="connect-message-list"
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => scrollToBottom()}
          onLayout={() => scrollToBottom()}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.composer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={[styles.inputWrap, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <TextInput
              testID="connect-message-input"
              style={[styles.input, { color: colors.text }]}
              placeholder="Message"
              placeholderTextColor={colors.textSecondary}
              value={draft}
              onChangeText={setDraft}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            testID="connect-send-button"
            style={[styles.sendButton, { backgroundColor: colors.accent }]}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  roomNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  roomEmoji: {
    fontSize: 28,
  },
  roomName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -0.2,
    flex: 1,
  },
  roomDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  chatWrap: {
    flex: 1,
  },
  msgList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgRowYou: {
    justifyContent: 'flex-end',
  },
  msgRowOther: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '88%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  msgBubbleSystem: {
    maxWidth: '100%',
  },
  msgMeta: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  msgText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
  },
  inputWrap: {
    flex: 1,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'web' ? SPACING.sm : SPACING.xs,
  },
  input: {
    fontSize: TYPOGRAPHY.sizes.md,
    padding: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundWrap: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  notFoundTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  notFoundSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
