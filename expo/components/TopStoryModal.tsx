import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X as CloseIcon, Heart, MessageCircle as MessageIcon, Bookmark, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { InspoPost } from '@/types';
import FlippableMediaStoryCard from '@/components/FlippableMediaStoryCard';
import { INSPO_SECTIONS, getStoryDisplayAuthor } from '@/constants/parq-data';
import SendContentModal from '@/components/SendContentModal';

const CATEGORY_COLORS: Record<string, { background: string; border: string; text: string }> = {
  'section-weekly-curated': { background: '#FEF3C7', border: '#FFCC00', text: '#B45309' },
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
  'section-parqs': { background: '#E0E7FF', border: '#6366F1', text: '#4338CA' },
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

interface TopStoryModalProps {
  visible: boolean;
  onClose: () => void;
  post: InspoPost | null;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  colors: {
    card: string;
    border: string;
    text: string;
    textSecondary: string;
    backgroundSecondary: string;
    tint: string;
  };
  profile?: any;
}

export default function TopStoryModal({
  visible,
  onClose,
  post,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  colors,
  profile,
}: TopStoryModalProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const modalCardWidth = useMemo(() => {
    const horizontalPadding = SPACING.lg * 2;
    const maxW = 620;
    return Math.max(320, Math.min(windowWidth - horizontalPadding, maxW));
  }, [windowWidth]);

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, {
          paddingTop: insets.top + SPACING.md,
          paddingBottom: insets.bottom + SPACING.md,
        }]}
        testID="top-story-modal-overlay"
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.cardWrapper}
          >
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { width: modalCardWidth }]}
              showsVerticalScrollIndicator={true}
              bounces={false}
              style={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              {post && (
                <TopStoryPostCard
                  post={post}
                  colors={colors}
                  isLiked={isLiked}
                  isBookmarked={isBookmarked}
                  onLike={onLike}
                  onBookmark={onBookmark}
                  profile={profile}
                  modalVisible={visible}
                />
              )}
            </ScrollView>
            <TouchableOpacity
              testID="top-story-modal-close"
              onPress={handleClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <CloseIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const INSPO_ACCENT_COLOR = '#10B981';

interface TopStoryPostCardProps {
  post: InspoPost;
  colors: {
    card: string;
    border: string;
    text: string;
    textSecondary: string;
    backgroundSecondary: string;
    tint: string;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  profile?: any;
  modalVisible?: boolean;
}

function TopStoryPostCard({
  post,
  colors,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  profile,
  modalVisible,
}: TopStoryPostCardProps) {
  const [isRecipeExpanded, setIsRecipeExpanded] = useState<boolean>(false);
  const [isSendInspoOpen, setIsSendInspoOpen] = useState<boolean>(false);
  const categoryColors = getCategoryColors(post.sectionId);
  const categoryLabel = getCategoryLabel(post.sectionId);
  const categoryEmoji = getCategoryEmoji(post.sectionId);

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
    <FlippableMediaStoryCard
      borderRadius={BORDER_RADIUS.xl}
      initialState="logo"
      hasMedia={post.hasMedia}
      mediaType={post.mediaType}
      mediaUrl={post.mediaUrl}
      storyId={post.id}
      visible={modalVisible}
      onFlipChange={(state) => {
        console.log('[TopStoryModal] Card flip state:', state);
      }}
      disabledTouchAreas={
        <View style={[cardStyles.disabledTouchArea, cardStyles.postActionsTouch]} />
      }
    >
      <View style={[cardStyles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[cardStyles.categoryBadge, { backgroundColor: categoryColors.background, borderColor: categoryColors.border }]}>
          <Text style={[cardStyles.categoryBadgeText, { color: categoryColors.text }]}>
            {categoryEmoji} {post.isTopStory ? '🔥 TOP STORY' : post.isWeeklyCurated ? 'WEEKLY CURATED' : categoryLabel.toUpperCase()}
          </Text>
        </View>
        
        <Text style={[cardStyles.postTitle, { color: colors.text }]}>{post.title}</Text>
        <Text style={[cardStyles.postBody, { color: colors.text }]}>{post.body}</Text>
          
        {post.recipeLink && !post.recipeIngredients && !post.recipeSteps ? (
          <TouchableOpacity
            style={[cardStyles.recipeModuleCompact, { backgroundColor: colors.backgroundSecondary, borderLeftColor: '#FF6B6B' }]}
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
            <Text style={cardStyles.recipeModuleEmoji}>🍽️</Text>
            <Text style={[cardStyles.recipeModuleSubtitle, { color: colors.textSecondary }]}>Tap to open recipe link!</Text>
          </TouchableOpacity>
        ) : (post.recipeIngredients || post.recipeSteps) && (
          <View>
            {!isRecipeExpanded ? (
              <TouchableOpacity
                style={[cardStyles.recipeModuleCompact, { backgroundColor: colors.backgroundSecondary, borderLeftColor: '#FF6B6B' }]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setIsRecipeExpanded(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={cardStyles.recipeModuleEmoji}>🍽️</Text>
                <Text style={[cardStyles.recipeModuleSubtitle, { color: colors.textSecondary }]}>Tap to view recipe!</Text>
              </TouchableOpacity>
            ) : (
              <View style={[cardStyles.recipeBoxExpanded, { backgroundColor: colors.backgroundSecondary, borderColor: '#FF6B6B' }]}>
                <Text style={[cardStyles.recipeLabel, { color: colors.text }]}>🍽 RECIPE</Text>
                
                {post.recipeIngredients && (
                  <View style={cardStyles.recipeSection}>
                    <Text style={[cardStyles.recipeSubLabel, { color: colors.text }]}>Ingredients:</Text>
                    <Text style={[cardStyles.recipeText, { color: colors.text }]}>{post.recipeIngredients}</Text>
                  </View>
                )}
                
                {post.recipeSteps && (
                  <View style={cardStyles.recipeSection}>
                    <Text style={[cardStyles.recipeSubLabel, { color: colors.text }]}>Steps:</Text>
                    <Text style={[cardStyles.recipeText, { color: colors.text }]}>{post.recipeSteps}</Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={cardStyles.collapseButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setIsRecipeExpanded(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[cardStyles.collapseButtonText, { color: colors.textSecondary }]}>Collapse ▲</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
          
        {post.actionSparkText && (
          <View style={[cardStyles.actionSparkBox, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.tint }]}>
            <Text style={[cardStyles.actionSparkLabel, { color: colors.textSecondary }]}>ACTION SPARK</Text>
            <Text style={[cardStyles.actionSparkText, { color: colors.text }]}>{post.actionSparkText}</Text>
          </View>
        )}
        
        <View style={cardStyles.postMeta}>
          <View style={cardStyles.tags}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[cardStyles.tag, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[cardStyles.tagText, { color: colors.text }]}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <Text style={[cardStyles.authorText, { color: colors.textSecondary }]}>
            {profile ? getStoryDisplayAuthor(post, profile) : (post.authorDisplayName || 'Anonymous')}
          </Text>
        </View>
        
        <View style={[cardStyles.postActions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={cardStyles.actionButton}
            onPress={onLike}
            activeOpacity={0.7}
          >
            <Heart
              size={20}
              color={isLiked ? colors.tint : colors.textSecondary}
              fill={isLiked ? colors.tint : 'transparent'}
            />
            <Text style={[cardStyles.actionText, { color: isLiked ? colors.tint : colors.textSecondary }]}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={cardStyles.actionButton}
            activeOpacity={0.7}
          >
            <MessageIcon size={20} color={colors.textSecondary} />
            <Text style={[cardStyles.actionText, { color: colors.textSecondary }]}>{post.commentsCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={cardStyles.actionButton}
            onPress={onBookmark}
            activeOpacity={0.7}
          >
            <Bookmark
              size={20}
              color={isBookmarked ? colors.tint : colors.textSecondary}
              fill={isBookmarked ? colors.tint : 'transparent'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={cardStyles.actionButton}
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
            console.log('[TopStoryModal] Send Inspo:', message);
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
    </FlippableMediaStoryCard>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 620,
    paddingHorizontal: SPACING.lg,
    maxHeight: '100%',
  },
  cardWrapper: {
    position: 'relative',
    width: '100%',
    maxHeight: '100%',
  },
  scroll: {
    maxHeight: '100%',
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    maxWidth: 620,
  },
  closeButton: {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 100,
  },
});

const cardStyles = StyleSheet.create({
  postCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
    alignItems: 'center',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  disabledTouchArea: {
    position: 'absolute',
    zIndex: 10,
  },
  postActionsTouch: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});
