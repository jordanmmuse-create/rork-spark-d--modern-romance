import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MessageCircle, Heart, MessageCircle as MessageIcon, Bookmark, Share2, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { INSPO_SECTIONS } from '@/constants/parq-data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { InspoPost } from '@/types';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import FlippableStoryCard from '@/components/FlippableStoryCard';

export default function SharedInspoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  
  const getPosts = useAppStore(state => state.getPosts);
  const profile = useAppStore(state => state.profile);
  const highlightedSharedStoryIds = useAppStore(state => state.highlightedSharedStoryIds);
  const toggleStoryHighlight = useAppStore(state => state.toggleStoryHighlight);
  
  const sharedStories = getPosts().filter(post => post.authorUserId === profile?.id);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + SPACING.md,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
            style={[styles.backButton, { borderColor: colors.border, backgroundColor: 'transparent' }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={colors.text} strokeWidth={2.5} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>💡 Shared Inspo</Text>
          </View>

          <View style={styles.headerRight} />
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <MessageCircle size={24} color="#10B981" style={styles.pageHeaderIcon} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Shared Stories</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Stories and ideas you&apos;ve shared with the community
        </Text>
        
        {sharedStories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No shared stories yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Share your experiences with the community to see them here.
            </Text>
          </View>
        ) : (
          <View style={styles.storiesList}>
            {sharedStories.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                colors={colors}
                isHighlighted={highlightedSharedStoryIds.includes(post.id)}
                onToggleHighlight={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  toggleStoryHighlight(post.id);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

interface PostCardProps {
  post: InspoPost;
  colors: any;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
}

function PostCard({ post, colors, isHighlighted, onToggleHighlight }: PostCardProps) {
  const togglePostLike = useAppStore(state => state.togglePostLike);
  const togglePostBookmark = useAppStore(state => state.togglePostBookmark);
  const isLiked = useAppStore(state => state.isPostLikedByUser(post.id));
  const isBookmarked = useAppStore(state => state.isPostBookmarkedByUser(post.id));
  
  const handleLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    togglePostLike(post.id);
  };
  
  const handleBookmark = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    togglePostBookmark(post.id);
  };
  
  const section = INSPO_SECTIONS.find(s => s.id === post.sectionId);
  
  return (
    <FlippableStoryCard
      borderRadius={BORDER_RADIUS.lg}
      disabledTouchAreas={
        <>
          <View style={[styles.disabledTouchArea, styles.highlightButtonTouch]} />
          <View style={[styles.disabledTouchArea, styles.postActionsTouch]} />
        </>
      }
    >
      <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.highlightButton, { 
            backgroundColor: isHighlighted ? '#10B981' + '20' : colors.backgroundSecondary,
            borderWidth: 1.5,
            borderColor: isHighlighted ? '#10B981' : colors.border,
          }]}
          onPress={onToggleHighlight}
          activeOpacity={0.7}
        >
          <Text style={[styles.highlightButtonText, { 
            color: isHighlighted ? '#10B981' : colors.textSecondary,
            fontWeight: isHighlighted ? '600' : '500',
          }]}>
            {isHighlighted ? '✓ On Profile' : 'Show on profile'}
          </Text>
        </TouchableOpacity>

        {post.isTopStory && (
          <View style={[styles.topStoryBadge, { backgroundColor: colors.tint + '20' }]}>
            <Text style={[styles.topStoryText, { color: colors.tint }]}>Top Story</Text>
          </View>
        )}
        
        <View style={[styles.categoryBadge, { backgroundColor: '#10B981' + '20', borderColor: '#10B981' }]}>
          <Text style={[styles.categoryBadgeText, { color: '#10B981' }]}>
            {section?.emoji} {section?.label?.toUpperCase() || 'STORY'}
          </Text>
        </View>
        
        <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
        <Text style={[styles.postBody, { color: colors.text }]}>{post.body}</Text>
        
        {post.actionSparkText && (
          <View style={[styles.actionSparkBox, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.tint }]}>
            <Text style={[styles.actionSparkLabel, { color: colors.textSecondary }]}>Action Spark</Text>
            <Text style={[styles.actionSparkText, { color: colors.text }]}>{post.actionSparkText}</Text>
          </View>
        )}
        
        <View style={styles.postMeta}>
          <View style={styles.tags}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={[styles.postActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={isLiked ? colors.tint : colors.textSecondary}
              fill={isLiked ? colors.tint : 'transparent'}
            />
            <Text style={[styles.actionText, { color: isLiked ? colors.tint : colors.textSecondary }]}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <MessageIcon size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{post.commentsCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Bookmark
              size={20}
              color={isBookmarked ? colors.tint : colors.textSecondary}
              fill={isBookmarked ? colors.tint : 'transparent'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Share2 size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </FlippableStoryCard>
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
    flexShrink: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pageHeaderIcon: {
    marginTop: 2,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  emptyState: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
  storiesList: {
    gap: SPACING.md,
  },
  postCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  highlightButton: {
    position: 'absolute' as const,
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    zIndex: 1,
  },
  highlightButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium as any,
  },
  topStoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start' as const,
    marginBottom: SPACING.sm,
  },
  topStoryText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase' as const,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start' as const,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase' as const,
  },
  postTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
  },
  postBody: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  actionSparkBox: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
  },
  actionSparkLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase' as const,
    marginBottom: SPACING.xs - 2,
  },
  actionSparkText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  postMeta: {
    marginBottom: SPACING.md,
  },
  tags: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  postActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.lg,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.xs - 2,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  disabledTouchArea: {
    position: 'absolute' as const,
    zIndex: 10,
  },
  highlightButtonTouch: {
    top: SPACING.md,
    right: SPACING.md,
    width: 120,
    height: 32,
  },
  postActionsTouch: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});
