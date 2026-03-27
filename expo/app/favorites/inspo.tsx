import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Library, Heart, MessageCircle as MessageIcon, Share2, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { INSPO_SECTIONS } from '@/constants/parq-data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, getThemeTagColor } from '@/constants/colors';
import { InspoPost, ParqItem } from '@/types';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function FavoriteInspoScreen() {
  const { colors } = useThemeStyles();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const getPosts = useAppStore(state => state.getPosts);
  const getParqItems = useAppStore(state => state.getParqItems);
  const favoritePostIds = useAppStore(state => state.favoritePostIds);
  const favoriteParqIds = useAppStore(state => state.favoriteParqIds);
  const posts = getPosts();
  const allParqItems = getParqItems();
  
  const favoriteInspos = useMemo<InspoPost[]>(() => {
    return posts.filter(p => favoritePostIds.includes(p.id));
  }, [posts, favoritePostIds]);
  
  const favoriteParqs = useMemo<ParqItem[]>(() => {
    return allParqItems.filter(p => favoriteParqIds.includes(p.id));
  }, [allParqItems, favoriteParqIds]);
  
  const groupedPosts = useMemo(() => {
    const groups: Record<string, InspoPost[]> = {};
    favoriteInspos.forEach((post: InspoPost) => {
      if (!groups[post.sectionId]) {
        groups[post.sectionId] = [];
      }
      groups[post.sectionId].push(post);
    });
    return groups;
  }, [favoriteInspos]);
  
  const toggleSection = (sectionId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitle: '💡 Favorite Inspo',
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Library size={24} color="#10B981" style={styles.pageHeaderIcon} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Favorites Library</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>{
          favoriteInspos.length === 0 && favoriteParqs.length === 0
            ? 'No favorite inspiration yet. Mark stories as favorites to see them here.'
            : 'Browse your favorite stories and ideas by category.'
        }</Text>
        
        {favoriteInspos.length === 0 && favoriteParqs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No favorites yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap the star button on any story to mark it as a favorite.
            </Text>
          </View>
        ) : (
          <View style={styles.categoriesList}>
            {favoriteParqs.length > 0 && (
              <View style={styles.categoryGroup}>
                <TouchableOpacity
                  style={[styles.categoryHeader, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => toggleSection('parqs')}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <Text style={styles.categoryEmoji}>💬</Text>
                    <Text style={[styles.categoryLabel, { color: colors.text }]}>PARQs</Text>
                  </View>
                  <View style={styles.categoryHeaderRight}>
                    <View style={[styles.countBadge, { backgroundColor: '#F97316' + '20', borderColor: '#F97316' }]}>
                      <Text style={[styles.countText, { color: '#F97316' }]}>{favoriteParqs.length}</Text>
                    </View>
                    <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                      {expandedSections.includes('parqs') ? '▼' : '▶'}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {expandedSections.includes('parqs') && (
                  <View style={styles.postsContainer}>
                    {favoriteParqs.map(parq => (
                      <ParqCard key={parq.id} parq={parq} colors={colors} />
                    ))}
                  </View>
                )}
              </View>
            )}
            {Object.entries(groupedPosts).map(([sectionId, sectionPosts]) => {
              const section = INSPO_SECTIONS.find(s => s.id === sectionId);
              if (!section) return null;
              
              const isExpanded = expandedSections.includes(sectionId);
              
              return (
                <View key={sectionId} style={styles.categoryGroup}>
                  <TouchableOpacity
                    style={[styles.categoryHeader, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => toggleSection(sectionId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryHeaderLeft}>
                      <Text style={styles.categoryEmoji}>{section.emoji}</Text>
                      <Text style={[styles.categoryLabel, { color: colors.text }]}>{section.label}</Text>
                    </View>
                    <View style={styles.categoryHeaderRight}>
                      <View style={[styles.countBadge, { backgroundColor: '#F97316' + '20', borderColor: '#F97316' }]}>
                        <Text style={[styles.countText, { color: '#F97316' }]}>{sectionPosts.length}</Text>
                      </View>
                      <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                        {isExpanded ? '▼' : '▶'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.postsContainer}>
                      {sectionPosts.map(post => (
                        <PostCard key={post.id} post={post} colors={colors} />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ParqCard({ parq, colors }: { parq: ParqItem; colors: any }) {
  const toggleParqFavorite = useAppStore(state => state.toggleParqFavorite);
  const favoriteParqIds = useAppStore(state => state.favoriteParqIds);
  const isFavorited = favoriteParqIds.includes(parq.id);
  
  const handleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleParqFavorite(parq.id);
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote':
        return '#A78BFA';
      case 'affirmation':
        return '#F472B6';
      case 'ritual':
        return '#FBBF24';
      case 'prompt':
        return '#60A5FA';
      default:
        return colors.tint;
    }
  };
  
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'quote':
        return '💬';
      case 'affirmation':
        return '❤️';
      case 'ritual':
        return '🕯';
      case 'prompt':
        return '💭';
      default:
        return '✨';
    }
  };
  
  const typeColor = getTypeColor(parq.type);
  const typeEmoji = getTypeEmoji(parq.type);
  
  return (
    <View style={[styles.parqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.parqFavoriteButton, { backgroundColor: colors.backgroundSecondary }]}
        onPress={handleFavorite}
        activeOpacity={0.7}
      >
        <Star
          size={18}
          color={isFavorited ? '#F97316' : colors.textSecondary}
          fill={isFavorited ? '#F97316' : 'transparent'}
        />
      </TouchableOpacity>
      <View style={styles.parqCardHeader}>
        <View
          style={[
            styles.parqTypeBadge,
            { backgroundColor: typeColor + '20' },
          ]}
        >
          <Text style={styles.parqTypeEmoji}>{typeEmoji}</Text>
          <Text style={[styles.parqTypeText, { color: typeColor }]}>
            {parq.type}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.parqText, { color: colors.text }]}>{parq.text}</Text>
      
      <View style={styles.parqFooter}>
        <View style={styles.tags}>
          {parq.themeTags.slice(0, 2).map((tag, index) => {
            const tagColors = getThemeTagColor(tag);
            return (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: tagColors.background,
                    borderColor: tagColors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: tagColors.text }]}>{tag}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function PostCard({ post, colors }: { post: InspoPost; colors: any }) {
  const togglePostLike = useAppStore(state => state.togglePostLike);
  const togglePostFavorite = useAppStore(state => state.togglePostFavorite);
  const isLiked = useAppStore(state => state.isPostLikedByUser(post.id));
  const favoritePostIds = useAppStore(state => state.favoritePostIds);
  const isFavorited = favoritePostIds.includes(post.id);
  const [isRecipeExpanded, setIsRecipeExpanded] = useState<boolean>(false);
  
  const handleLike = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    togglePostLike(post.id);
  };
  
  const handleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    togglePostFavorite(post.id);
  };
  
  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.postFavoriteButton, { backgroundColor: colors.backgroundSecondary }]}
        onPress={handleFavorite}
        activeOpacity={0.7}
      >
        <Star
          size={18}
          color={isFavorited ? '#F97316' : colors.textSecondary}
          fill={isFavorited ? '#F97316' : 'transparent'}
        />
      </TouchableOpacity>
      {post.isTopStory && (
        <View style={[styles.topStoryBadge, { backgroundColor: colors.tint + '20' }]}>
          <Text style={[styles.topStoryText, { color: colors.tint }]}>Top Story</Text>
        </View>
      )}
      
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
        
        <Text style={[styles.authorText, { color: colors.textSecondary }]}>{post.authorDisplayName || 'Anonymous'}</Text>
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
          activeOpacity={0.7}
        >
          <Share2 size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
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
  categoriesList: {
    gap: SPACING.xl,
  },
  categoryGroup: {
    gap: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryHeaderRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  countBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  expandIcon: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  postsContainer: {
    gap: SPACING.md,
  },
  postCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
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
  parqCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  parqCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  parqTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  parqTypeEmoji: {
    fontSize: 14,
  },
  parqTypeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'capitalize' as const,
  },
  parqActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parqText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  parqFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  parqToneText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  parqFavoriteButton: {
    position: 'absolute' as const,
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1,
  },
  postFavoriteButton: {
    position: 'absolute' as const,
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1,
  },
});
