import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Lightbulb } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { INSPO_SECTIONS } from '@/constants/parq-data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useAppStore } from '@/store/appStore';
import { InspoPost } from '@/types';
import RandomStoryModal from '@/components/RandomStoryModal';

export default function AllCategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  
  const [randomCardModalVisible, setRandomCardModalVisible] = useState(false);
  const [randomPost, setRandomPost] = useState<InspoPost | null>(null);
  
  const getPosts = useAppStore(state => state.getPosts);
  const togglePostLike = useAppStore(state => state.togglePostLike);
  const togglePostBookmark = useAppStore(state => state.togglePostBookmark);
  const isRandomPostLiked = useAppStore(state => randomPost ? state.isPostLikedByUser(randomPost.id) : false);
  const isRandomPostBookmarked = useAppStore(state => randomPost ? state.isPostBookmarkedByUser(randomPost.id) : false);
  
  const allPosts = useMemo(() => {
    const posts = getPosts();
    console.log('[AllCategories] Total posts available for randomizer:', posts.length);
    return posts;
  }, [getPosts]);
  
  const handleRandomize = () => {
    console.log('[AllCategories] 🎲 Randomize button pressed!');
    console.log('[AllCategories] Available posts:', allPosts.length);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (allPosts.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPosts.length);
      console.log('[AllCategories] Selected random post index:', randomIndex);
      setRandomPost(allPosts[randomIndex]);
      setRandomCardModalVisible(true);
    } else {
      console.log('[AllCategories] No posts available to randomize');
    }
  };
  
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
  
  const handleSectionPress = (sectionId: string, sectionSlug: string, isComingSoon: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isComingSoon) {
      return;
    }
    
    if (sectionSlug === 'tell-story') {
      router.push('/inspo/submit-story' as any);
    } else {
      router.push({
        pathname: '/inspo/section/[id]' as any,
        params: { id: sectionId, slug: sectionSlug },
      } as any);
    }
  };
  
  const SHARED_STORIES_ORDER = [
    'sweet-valentines',
    'top-stories',
    'weekly-curated',
    'date-night',
    'meaningful-gestures',
    'holiday-magic',
    'recipes',
    'gift-giving',
    'celebrate',
    'making-official',
    'party-of-2',
    'swole-mates',
    'diy-projects',
    'long-distance',
    'romantic-getaways',
    'self-care',
    'just-because',
    'party-of-1',
    'tell-story',
  ];
  
  const activeSections = INSPO_SECTIONS
    .filter(s => !s.isComingSoon && s.slug !== 'parqs')
    .sort((a, b) => {
      const aIndex = SHARED_STORIES_ORDER.indexOf(a.slug);
      const bIndex = SHARED_STORIES_ORDER.indexOf(b.slug);
      if (aIndex === -1 && bIndex === -1) return a.sortOrder - b.sortOrder;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  
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
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              console.log('[AllCategories] Back pressed');
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
            <Lightbulb size={20} color={colors.tint} strokeWidth={2} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Shared Stories</Text>
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
      >
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Browse all community story categories and find inspiration for your relationship.
        </Text>
        
        <View style={styles.categoriesList}>
          {activeSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSectionPress(section.id, section.slug, section.isComingSoon)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryEmoji}>{section.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: colors.text }]}>{section.label}</Text>
              </View>
              <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                {section.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
      />
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
    gap: SPACING.xs - 2,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  categoriesList: {
    gap: SPACING.md,
  },
  categoryCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  categoryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
});
