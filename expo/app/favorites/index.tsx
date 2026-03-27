import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Layers, Lightbulb, Star } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useAppStore } from '@/store/appStore';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

interface FavoriteCategory {
  id: string;
  title: string;
  description: string;
  icon: 'layers' | 'lightbulb';
  color: string;
  route?: string;
}

const FAVORITE_CATEGORIES: FavoriteCategory[] = [
  {
    id: 'favorite-sparks',
    title: 'Favorite Sparks',
    description: 'Your go-to prompts and conversation starters',
    icon: 'layers',
    color: '#3B82F6',
    route: '/favorites/sparks',
  },
  {
    id: 'favorite-inspo',
    title: 'Favorite Inspo',
    description: 'Stories and ideas you love the most',
    icon: 'lightbulb',
    color: '#10B981',
    route: '/favorites/inspo',
  },
];

export default function FavoritesIndexScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const router = useRouter();

  const favoriteSparkIds = useAppStore(state => state.favoriteSparkIds);
  const favoriteParqIds = useAppStore(state => state.favoriteParqIds);
  const favoritePostIds = useAppStore(state => state.favoritePostIds);
  
  const favoriteSparksCount = favoriteSparkIds.length;
  const favoriteInspoCount = favoriteParqIds.length + favoritePostIds.length;

  const handleCategoryPress = (category: FavoriteCategory) => {
    if (category.route) {
      router.push(category.route as any);
    }
  };

  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'layers':
        return <Layers size={32} color={color} strokeWidth={2} />;
      case 'lightbulb':
        return <Lightbulb size={32} color={color} strokeWidth={2} />;
      default:
        return <Layers size={32} color={color} strokeWidth={2} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Favorites',
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
        <View style={styles.headerSection}>
          <Star size={32} color="#EF4444" strokeWidth={2} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Favorite Content</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Your most-loved sparks and inspiration in one place
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {FAVORITE_CATEGORIES.map((category) => {
            const count = category.id === 'favorite-sparks' ? favoriteSparksCount : 
                          category.id === 'favorite-inspo' ? favoriteInspoCount : 0;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  !category.route && styles.categoryCardDisabled,
                ]}
                activeOpacity={category.route ? 0.7 : 1}
                onPress={() => handleCategoryPress(category)}
                disabled={!category.route}
              >
                <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                  {getIcon(category.icon, category.color)}
                </View>
                
                <View style={styles.categoryContent}>
                  <View style={styles.categoryTitleRow}>
                    <Text style={[styles.categoryTitle, { color: colors.text }]}>
                      {category.title}
                    </Text>
                    <View style={[styles.countBadge, { backgroundColor: category.color + '20', borderColor: category.color }]}>
                      <Text style={[styles.countText, { color: category.color }]}>{count}</Text>
                    </View>
                  </View>
                  <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                    {category.description}
                  </Text>
                  {count === 0 && (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No favorites yet
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  categoriesContainer: {
    gap: SPACING.md,
  },
  categoryCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  categoryCardDisabled: {
    opacity: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs - 2,
    gap: SPACING.xs,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
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
  categoryDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontStyle: 'italic',
    marginTop: SPACING.xs - 2,
  },
});