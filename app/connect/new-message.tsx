import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ListRenderItem,
  TextInput,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { useAppStore } from '@/store/appStore';
import type { Conversation } from '@/types';

export default function NewMessageScreen() {
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const { colors } = useThemeStyles();
  const { conversations, pendingSparkShare, clearPendingSparkShare } = useAppStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const isSparkShareIntent = intent === 'shareSpark' && pendingSparkShare !== null;
  
  useEffect(() => {
    console.log('[NewMessage] Intent:', intent, 'Has pending spark share:', !!pendingSparkShare);
  }, [intent, pendingSparkShare]);
  
  useEffect(() => {
    return () => {
      if (isSparkShareIntent) {
        console.log('[NewMessage] Component unmounting, clearing pending spark share');
      }
    };
  }, [isSparkShareIntent]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.participantName.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const handleSelectUser = useCallback((item: Conversation) => {
    console.log('[NewMessage] Select user', { id: item.id, participantName: item.participantName, isSparkShareIntent });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const existingConv = conversations.find(
      (c) => c.participantId === item.participantId
    );
    
    const conversationId = existingConv?.id || item.id;
    
    if (isSparkShareIntent && pendingSparkShare) {
      console.log('[NewMessage] Navigating with spark share payload to:', conversationId);
      router.replace(`/connect/chat/${conversationId}?sparkShare=true` as any);
    } else {
      console.log('[NewMessage] Opening conversation:', conversationId);
      router.replace(`/connect/chat/${conversationId}` as any);
    }
  }, [conversations, router, isSparkShareIntent, pendingSparkShare]);

  const renderUser: ListRenderItem<Conversation> = ({ item }) => {
    return (
      <TouchableOpacity
        testID={`new-message-user-${item.id}`}
        style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleSelectUser(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.participantAvatar ? (
            <Image
              source={{ uri: item.participantAvatar }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {item.participantName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userContent}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {item.participantName}
            {item.isPartner && ' 💕'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleBack = useCallback(() => {
    if (isSparkShareIntent) {
      console.log('[NewMessage] Back pressed, clearing pending spark share');
      clearPendingSparkShare();
    }
    router.back();
  }, [isSparkShareIntent, clearPendingSparkShare, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: isSparkShareIntent ? 'Send Spark To...' : 'New Message',
          headerBackTitle: 'Cancel',
          headerLeft: isSparkShareIntent ? () => (
            <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
              <ChevronLeft size={24} color={colors.text} />
              <Text style={[styles.headerBackText, { color: colors.tint }]}>Cancel</Text>
            </TouchableOpacity>
          ) : undefined,
        }} 
      />
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="To: Search"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="search-input"
            />
          </View>
        </View>

        <FlatList
          testID="users-list"
          data={filteredConversations}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery.trim() ? 'No users found' : 'No connected users'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
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
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.xs,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerBackText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium as '500',
  },
});
