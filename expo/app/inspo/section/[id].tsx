import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Heart, MessageCircle as MessageIcon, Bookmark, Send, ChevronLeft, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { INSPO_SECTIONS, getStoryDisplayAuthor } from '@/constants/parq-data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { InspoPost } from '@/types';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import FlippableStoryCard from '@/components/FlippableStoryCard';
import RandomStoryModal from '@/components/RandomStoryModal';
import SendContentModal from '@/components/SendContentModal';

const INSPO_ACCENT_COLOR = '#10B981';

const CATEGORY_COLORS: Record<string, { background: string; border: string; text: string }> = {
  'section-sweet-valentines': { background: '#FFEDD5', border: '#FF9500', text: '#C2410C' },
  'section-holiday-magic': { background: '#D4E4FF', border: '#007AFF', text: '#2563EB' },
  'section-date-night': { background: '#FFE4E6', border: '#FF3B30', text: '#DC2626' },
  'section-recipes': { background: '#FFEDD5', border: '#FF9500', text: '#C2410C' },
  'section-gift-giving': { background: '#FFE4E6', border: '#FF3B30', text: '#DC2626' },
  'section-celebrate': { background: '#FFE4E6', border: '#FF3B30', text: '#DC2626' },
  'section-making-official': { background: '#D4E4FF', border: '#007AFF', text: '#2563EB' },
  'section-party-of-2': { background: '#FEF3C7', border: '#FFCC00', text: '#B45309' },
  'section-meaningful-gestures': { background: '#EDE6D9', border: '#A2845E', text: '#78716C' },
  'section-swole-mates': { background: '#FFEDD5', border: '#FF9500', text: '#C2410C' },
  'section-diy-projects': { background: '#EDE6D9', border: '#A2845E', text: '#78716C' },
  'section-long-distance': { background: '#D1FAE5', border: '#34C759', text: '#059669' },
  'section-romantic-getaways': { background: '#D4E4FF', border: '#007AFF', text: '#2563EB' },
  'section-self-care': { background: '#D1FAE5', border: '#34C759', text: '#059669' },
  'section-just-because': { background: '#D1FAE5', border: '#34C759', text: '#059669' },
  'section-party-of-1': { background: '#FEF3C7', border: '#FFCC00', text: '#B45309' },
};

const getCategoryColors = (sectionId: string) => {
  return CATEGORY_COLORS[sectionId] || { background: 'rgba(255, 149, 0, 0.15)', border: '#FF9500', text: '#FF9500' };
};

const getCategoryLabel = (sectionId: string): string => {
  const section = INSPO_SECTIONS.find(s => s.id === sectionId);
  return section?.label || 'Story';
};

const getCategoryEmoji = (sectionId: string): string => {
  const section = INSPO_SECTIONS.find(s => s.id === sectionId);
  return section?.emoji || '💡';
};

export default function SectionFeedScreen() {
  const params = useLocalSearchParams();
  const { id } = params;
  const sectionId = String(id);
  const { colors } = useThemeStyles();
  const insets = useSafeAreaInsets();
  
  const section = INSPO_SECTIONS.find(s => s.id === sectionId);
  const getPostsBySection = useAppStore(state => state.getPostsBySection);
  const posts = getPostsBySection(sectionId);
  const profile = useAppStore(state => state.profile);
  
  const [randomCardModalVisible, setRandomCardModalVisible] = useState(false);
  const [randomPost, setRandomPost] = useState<InspoPost | null>(null);
  
  const togglePostLike = useAppStore(state => state.togglePostLike);
  const togglePostBookmark = useAppStore(state => state.togglePostBookmark);
  const isRandomPostLiked = useAppStore(state => randomPost ? state.isPostLikedByUser(randomPost.id) : false);
  const isRandomPostBookmarked = useAppStore(state => randomPost ? state.isPostBookmarkedByUser(randomPost.id) : false);
  
  const handleRandomLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (randomPost) {
      togglePostLike(randomPost.id);
    }
  };
  
  const handleRandomBookmark = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (randomPost) {
      togglePostBookmark(randomPost.id);
    }
  };
  
  const handleRandomize = () => {
    console.log('[SectionFeed] 🎲 Randomize button pressed!');
    console.log('[SectionFeed] Available posts:', posts.length);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (posts.length > 0) {
      const randomIndex = Math.floor(Math.random() * posts.length);
      console.log('[SectionFeed] Selected random post index:', randomIndex);
      setRandomPost(posts[randomIndex]);
      setRandomCardModalVisible(true);
    } else {
      console.log('[SectionFeed] No posts available to randomize');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="inspo-section-feed">
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
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              console.log('[SectionFeed] Back pressed');
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
            <Search size={20} color={colors.text} strokeWidth={2} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Explore…</Text>
          </View>

          <TouchableOpacity
            onPress={handleRandomize}
            style={styles.headerRight}
            activeOpacity={0.7}
          >
            <Text style={styles.diceEmoji}>🎲</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {section && (
          <View style={[styles.categoryHeader, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              {section.emoji} {section.label}
            </Text>
            <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
              {section.description}
            </Text>
          </View>
        )}
        
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No posts yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Check back soon for new stories and ideas!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} colors={colors} profile={profile} />
          ))
        )}
      </ScrollView>
      
      <RandomStoryModal
        visible={randomCardModalVisible}
        onClose={() => setRandomCardModalVisible(false)}
        post={randomPost}
        isLiked={isRandomPostLiked}
        isBookmarked={isRandomPostBookmarked}
        onLike={handleRandomLike}
        onBookmark={handleRandomBookmark}
        colors={colors}
        profile={profile}
      />
    </View>
  );
}

function PostCard({ post, colors, profile }: { post: InspoPost; colors: any; profile: any }) {
  const togglePostLike = useAppStore(state => state.togglePostLike);
  const togglePostBookmark = useAppStore(state => state.togglePostBookmark);
  const isLiked = useAppStore(state => state.isPostLikedByUser(post.id));
  const isBookmarked = useAppStore(state => state.isPostBookmarkedByUser(post.id));
  const [isRecipeExpanded, setIsRecipeExpanded] = useState<boolean>(false);
  const [isSendInspoOpen, setIsSendInspoOpen] = useState<boolean>(false);
  
  const categoryColors = getCategoryColors(post.sectionId);
  const categoryLabel = getCategoryLabel(post.sectionId);
  
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

  const handleSendPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSendInspoOpen(true);
  };

  const getInitialSendText = () => {
    const categoryLower = categoryLabel.toLowerCase();
    return `What do you think about this ${categoryLower} idea?`;
  };
  
  return (
    <FlippableStoryCard
      borderRadius={BORDER_RADIUS.lg}
      disabledTouchAreas={
        <View style={[styles.disabledTouchArea, styles.postActionsTouch]} />
      }
    >
      <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.categoryBadge, { backgroundColor: categoryColors.background, borderColor: categoryColors.border }]}>
        <Text style={[styles.categoryBadgeText, { color: categoryColors.text }]}>
          {getCategoryEmoji(post.sectionId)} {post.isTopStory ? 'TOP STORY' : post.isWeeklyCurated ? 'WEEKLY CURATED IDEAS' : categoryLabel.toUpperCase()}
        </Text>
      </View>
      
      <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
      <Text style={[styles.postBody, { color: colors.text }]}>{post.body}</Text>
      
      {post.recipeLink && !post.recipeIngredients && !post.recipeSteps ? (
        <TouchableOpacity
          style={[styles.recipeModuleCompact, { backgroundColor: colors.backgroundSecondary, borderLeftColor: '#FF6B6B' }]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL(post.recipeLink!);
            } else {
              window.open(post.recipeLink!, '_blank');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.recipeModuleEmoji}>🍽️</Text>
          <Text style={[styles.recipeModuleSubtitle, { color: colors.textSecondary }]}>Tap to open recipe link!</Text>
        </TouchableOpacity>
      ) : (post.recipeIngredients || post.recipeSteps) && (
        <View>
          {!isRecipeExpanded ? (
            <TouchableOpacity
              style={[styles.recipeModuleCompact, { backgroundColor: colors.backgroundSecondary, borderLeftColor: '#FF6B6B' }]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setIsRecipeExpanded(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.recipeModuleEmoji}>🍽️</Text>
              <Text style={[styles.recipeModuleSubtitle, { color: colors.textSecondary }]}>Tap to view recipe!</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.recipeBoxExpanded, { backgroundColor: colors.backgroundSecondary, borderColor: '#FF6B6B' }]}>
              <Text style={[styles.recipeLabel, { color: colors.text }]}>🍽 RECIPE</Text>
              
              {post.recipeIngredients && (
                <View style={styles.recipeSection}>
                  <Text style={[styles.recipeSubLabel, { color: colors.text }]}>Ingredients:</Text>
                  <Text style={[styles.recipeText, { color: colors.text }]}>{post.recipeIngredients}</Text>
                </View>
              )}
              
              {post.recipeSteps && (
                <View style={styles.recipeSection}>
                  <Text style={[styles.recipeSubLabel, { color: colors.text }]}>Steps:</Text>
                  <Text style={[styles.recipeText, { color: colors.text }]}>{post.recipeSteps}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.collapseButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setIsRecipeExpanded(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.collapseButtonText, { color: colors.textSecondary }]}>Collapse ▲</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
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
        
        <Text style={[styles.authorText, { color: colors.textSecondary }]}>{getStoryDisplayAuthor(post, profile)}</Text>
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
          onPress={handleSendPress}
          activeOpacity={0.7}
        >
          <Send size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      </View>
      {isSendInspoOpen && (
        <SendContentModal
          visible={isSendInspoOpen}
          onClose={() => setIsSendInspoOpen(false)}
          onSend={(message) => {
            console.log('[PostCard] Send Inspo:', message);
            setIsSendInspoOpen(false);
          }}
          title="Send Inspo"
          categoryLabel="Inspo"
          accentColor={INSPO_ACCENT_COLOR}
          initialText={getInitialSendText()}
          placeholder="Add a personal note..."
          mode="inspo"
        />
      )}
    </FlippableStoryCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  categoryHeader: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center' as const,
  },
  postCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start' as const,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
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
  recipeModuleCompact: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: SPACING.xs,
    borderLeftWidth: 3,
  },
  recipeModuleEmoji: {
    fontSize: 20,
  },
  recipeModuleSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  recipeBoxExpanded: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
  },
  recipeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase' as const,
    marginBottom: SPACING.md,
  },
  recipeSection: {
    marginBottom: SPACING.md,
  },
  recipeSubLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
  },
  recipeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  collapseButton: {
    alignItems: 'center' as const,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  collapseButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  postMeta: {
    marginBottom: SPACING.md,
  },
  tags: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
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
  authorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontStyle: 'italic' as const,
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
  postActionsTouch: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  headerBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  backButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
    position: 'absolute' as const,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: SPACING.xs,
    pointerEvents: 'none' as const,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerRight: {
    minWidth: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  },
  diceEmoji: {
    fontSize: 30,
  },
});
