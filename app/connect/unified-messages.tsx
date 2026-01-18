import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Search, ChevronLeft, PenLine, Mail } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

import { useAppStore } from '@/store/appStore';
import ConversationRow from '@/components/ConversationRow';
import type { Conversation } from '@/types';

type UnifiedConversation = {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  type: 'partner' | 'coach' | 'intell' | 'friend' | 'community';
  isComingSoon?: boolean;
};

export default function UnifiedMessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const storeConversations = useAppStore((state) => state.conversations);

  const allConversations = useMemo(() => {
    return [...storeConversations].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.isPartner !== b.isPartner) return a.isPartner ? -1 : 1;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }, [storeConversations]);

  const unifiedConversations = useMemo<UnifiedConversation[]>(() => {
    const unified: UnifiedConversation[] = [];

    allConversations.forEach((conv: Conversation) => {
      if (conv.isPartner || conv.relationshipType === 'partner') {
        unified.push({
          id: `partner-${conv.id}`,
          participantName: conv.participantName,
          participantAvatar: conv.participantAvatar || '',
          lastMessage: conv.lastMessage || '',
          lastMessageAt: conv.lastMessageAt || new Date().toISOString(),
          unreadCount: conv.unreadCount,
          type: 'partner',
        });
      } else if (conv.relationshipType === 'coach') {
        unified.push({
          id: `coach-${conv.id}`,
          participantName: conv.participantName,
          participantAvatar: conv.participantAvatar || '',
          lastMessage: conv.lastMessage || '',
          lastMessageAt: conv.lastMessageAt || new Date().toISOString(),
          unreadCount: conv.unreadCount,
          type: 'coach',
        });
      } else if (conv.relationshipType === 'community') {
        unified.push({
          id: `community-${conv.id}`,
          participantName: conv.participantName,
          participantAvatar: conv.participantAvatar || '',
          lastMessage: conv.lastMessage || '',
          lastMessageAt: conv.lastMessageAt || new Date().toISOString(),
          unreadCount: conv.unreadCount,
          type: 'community',
        });
      } else {
        unified.push({
          id: `friend-${conv.id}`,
          participantName: conv.participantName,
          participantAvatar: conv.participantAvatar || '',
          lastMessage: conv.lastMessage || '',
          lastMessageAt: conv.lastMessageAt || new Date().toISOString(),
          unreadCount: conv.unreadCount,
          type: 'friend',
        });
      }
    });

    unified.push({
      id: 'intell-ai',
      participantName: 'inTELL AI',
      participantAvatar: '',
      lastMessage: 'Coming Soon',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      type: 'intell',
      isComingSoon: true,
    });

    unified.sort((a, b) => {
      if (a.isComingSoon && !b.isComingSoon) return 1;
      if (!a.isComingSoon && b.isComingSoon) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return unified;
  }, [allConversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return unifiedConversations;
    
    const query = searchQuery.toLowerCase();
    return unifiedConversations.filter(conv => 
      conv.participantName.toLowerCase().includes(query) ||
      conv.lastMessage?.toLowerCase().includes(query)
    );
  }, [unifiedConversations, searchQuery]);

  const partnerConversations = useMemo(() => 
    filteredConversations.filter(conv => conv.type === 'partner'),
    [filteredConversations]
  );

  const coachConversations = useMemo(() => 
    filteredConversations.filter(conv => conv.type === 'coach'),
    [filteredConversations]
  );

  const intellConversations = useMemo(() => 
    filteredConversations.filter(conv => conv.type === 'intell'),
    [filteredConversations]
  );

  const friendConversations = useMemo(() => 
    filteredConversations.filter(conv => conv.type === 'friend'),
    [filteredConversations]
  );

  const communityConversations = useMemo(() => 
    filteredConversations.filter(conv => conv.type === 'community'),
    [filteredConversations]
  );

  const getConversationFromUnified = (item: UnifiedConversation): Conversation => {
    const storeConv = allConversations.find(c => 
      c.id === item.id.replace(/^(partner-|friend-|coach-|intell-|community-)/, '') ||
      c.id === item.id
    );
    
    return {
      id: item.id.replace(/^(partner-|friend-|coach-|intell-|community-)/, ''),
      userId: storeConv?.userId || '',
      participantId: storeConv?.participantId || item.id,
      participantName: item.participantName,
      participantAvatar: item.participantAvatar,
      isPartner: item.type === 'partner',
      lastMessage: item.lastMessage,
      lastMessageAt: item.lastMessageAt,
      unreadCount: item.unreadCount,
      pinned: storeConv?.pinned,
      muted: storeConv?.muted,
    };
  };

  const handleConversationPress = (item: UnifiedConversation) => {
    if (item.isComingSoon) {
      console.log('[UnifiedMessages] Coming soon');
      return;
    }
    console.log('[UnifiedMessages] Open conversation', { id: item.id, participantName: item.participantName, type: item.type });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const realConvId = item.id.replace(/^(partner-|friend-|coach-|intell-|community-)/, '');
    router.push(`/connect/chat/${realConvId}` as any);
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
        testID="unifiedMessagesHeader"
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              console.log('[UnifiedMessages] Back pressed');
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
            <Mail size={20} color="#FF3B30" strokeWidth={2.5} />
            <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>+ Messenger</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/connect/new-message' as any);
            }}
            style={styles.headerRight}
            activeOpacity={0.7}
          >
            <PenLine size={24} color={colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={[styles.conversationsHeader, { color: colors.text }]}>
            Conversations
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search convos…"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="unified-search-input"
            />
          </View>
        </View>

        <View style={styles.conversationsContainer}>
          {partnerConversations.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>PARTNER</Text>
              <View style={styles.categoryContent}>
                {partnerConversations.map((conv) => (
                  <View key={conv.id}>
                    <ConversationRow
                      conversation={getConversationFromUnified(conv)}
                      onPress={() => handleConversationPress(conv)}
                      showPartnerGlow
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {coachConversations.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>COACHES</Text>
              <View style={styles.categoryContent}>
                {coachConversations.map((conv) => (
                  <View key={conv.id}>
                    <ConversationRow
                      conversation={getConversationFromUnified(conv)}
                      onPress={() => handleConversationPress(conv)}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {intellConversations.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>INTELL AI</Text>
              <View style={styles.categoryContent}>
                {intellConversations.map((conv) => (
                  <View key={conv.id}>
                    <ConversationRow
                      conversation={getConversationFromUnified(conv)}
                      onPress={() => handleConversationPress(conv)}
                      isComingSoon={conv.isComingSoon}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {friendConversations.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>FRIENDS</Text>
              <View style={styles.categoryContent}>
                {friendConversations.map((conv) => (
                  <View key={conv.id}>
                    <ConversationRow
                      conversation={getConversationFromUnified(conv)}
                      onPress={() => handleConversationPress(conv)}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {communityConversations.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>COMMUNITY</Text>
              <View style={styles.categoryContent}>
                {communityConversations.map((conv) => (
                  <View key={conv.id}>
                    <ConversationRow
                      conversation={getConversationFromUnified(conv)}
                      onPress={() => handleConversationPress(conv)}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {partnerConversations.length === 0 && coachConversations.length === 0 && intellConversations.length === 0 && friendConversations.length === 0 && communityConversations.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery.trim() ? 'No conversations found' : 'No messages yet'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  conversationsHeader: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    padding: 0,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  conversationsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sizes.sm + 1,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  categoryContent: {
    gap: SPACING.xs,
  },
});
