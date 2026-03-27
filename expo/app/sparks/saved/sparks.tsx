import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Library, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, FOCUS_AREA_COLORS, getThemeTagColor } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Spark, FocusArea } from '@/types';

const CATEGORIES: { id: string; label: string; value: FocusArea | 'all' }[] = [
  { id: 'all', label: 'All', value: 'all' },
  { id: 'communication', label: 'Communication', value: 'communication' },
  { id: 'trust', label: 'Trust', value: 'trust' },
  { id: 'conflict', label: 'Conflict', value: 'conflict' },
  { id: 'play', label: 'Play', value: 'play' },
  { id: 'growth', label: 'Growth', value: 'growth' },
  { id: 'gratitude', label: 'Gratitude', value: 'gratitude' },
  { id: 'intimacy', label: 'Intimacy', value: 'intimacy' },
  { id: 'boundaries', label: 'Boundaries', value: 'boundaries' },
];

export default function SavedSparksScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { getSparks, userSparks } = useAppStore();
  const allSparks = getSparks();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const savedSparkIds = useMemo(() => {
    return userSparks
      .filter((us) => us.status === 'saved')
      .map((us) => us.sparkId);
  }, [userSparks]);
  
  const savedSparks = useMemo(() => {
    return allSparks.filter((spark) => savedSparkIds.includes(spark.id));
  }, [allSparks, savedSparkIds]);
  
  const filteredSparks = useMemo(() => {
    return savedSparks.filter((spark) => {
      const matchesSearch = searchQuery === '' ||
        spark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spark.lesson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' ||
        spark.focusArea === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [savedSparks, searchQuery, selectedCategory]);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Saved Sparks',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Library size={24} color="#3B82F6" style={styles.pageHeaderIcon} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Saved Library</Text>
        </View>
        
        <View style={[styles.searchBarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchBarInput, { color: colors.text }]}
            placeholder="Search sparks…"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => {
            const categoryColor = FOCUS_AREA_COLORS[category.value as FocusArea] || colors.tint;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedCategory === category.id && [
                    styles.categoryChipActive,
                    { backgroundColor: categoryColor + '20', borderColor: categoryColor },
                  ],
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                {category.value !== 'all' && (
                  <Text style={styles.categoryEmoji}>
                    {FOCUS_AREA_INFO[category.value as FocusArea].emoji}
                  </Text>
                )}
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: colors.textSecondary },
                    selectedCategory === category.id && [
                      styles.categoryChipTextActive,
                      { color: categoryColor },
                    ],
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {filteredSparks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {savedSparks.length === 0 
                ? 'No saved sparks yet. Bookmark sparks to see them here.'
                : 'No sparks found matching your criteria.'}
            </Text>
          </View>
        ) : (
          filteredSparks.map((spark) => (
            <SparkCard key={spark.id} spark={spark} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface SparkCardProps {
  spark: Spark;
}

function SparkCard({ spark }: SparkCardProps) {
  const router = useRouter();
  const { colors } = useThemeStyles();
  const toggleSparkFavorite = useAppStore(state => state.toggleSparkFavorite);
  const favoriteSparkIds = useAppStore(state => state.favoriteSparkIds);
  const isFavorited = favoriteSparkIds.includes(spark.id);
  const areaTagColors = getThemeTagColor(FOCUS_AREA_INFO[spark.focusArea].title);

  const handlePress = () => {
    router.push(`/spark/${spark.id}`);
  };

  const handleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleSparkFavorite(spark.id);
  };

  return (
    <TouchableOpacity
      style={[styles.sparkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <TouchableOpacity
        style={[styles.favoriteButton, { backgroundColor: colors.backgroundSecondary }]}
        onPress={handleFavorite}
        activeOpacity={0.7}
      >
        <Star
          size={18}
          color={isFavorited ? '#F97316' : colors.textSecondary}
          fill={isFavorited ? '#F97316' : 'transparent'}
        />
      </TouchableOpacity>
      <View
        style={[
          styles.sparkBadge,
          {
            backgroundColor: areaTagColors.background,
            borderColor: areaTagColors.border,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={styles.sparkBadgeEmoji}>
          {FOCUS_AREA_INFO[spark.focusArea].emoji}
        </Text>
        <Text style={[styles.sparkBadgeText, { color: areaTagColors.text }]}>
          {FOCUS_AREA_INFO[spark.focusArea].title}
        </Text>
        <View style={[styles.difficultyBadge, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.difficultyText, { color: colors.textSecondary }]}>{spark.difficulty}</Text>
        </View>
      </View>
      <Text style={[styles.sparkCardTitle, { color: colors.text }]}>{spark.title}</Text>
      <Text style={[styles.sparkCardLesson, { color: colors.textSecondary }]} numberOfLines={2}>
        {spark.lesson}
      </Text>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  searchBarInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    padding: 0,
  },
  categoriesScroll: {
    paddingRight: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    marginRight: SPACING.xs,
    gap: SPACING.xs - 2,
  },
  categoryChipActive: {
    borderWidth: 2,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  categoryChipTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  sparkCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  sparkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  sparkBadgeEmoji: {
    fontSize: 12,
    marginRight: SPACING.xs - 2,
  },
  sparkBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginRight: SPACING.xs,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'capitalize' as const,
  },
  sparkCardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  sparkCardLesson: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
  favoriteButton: {
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