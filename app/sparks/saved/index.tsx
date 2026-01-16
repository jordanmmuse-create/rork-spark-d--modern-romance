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
import { Layers, Gamepad2, Lightbulb, Bookmark } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { useAppStore } from '@/store/appStore';

interface SavedCategory {
  id: string;
  title: string;
  description: string;
  icon: 'layers' | 'gamepad' | 'lightbulb';
  color: string;
  route?: string;
}

const SAVED_CATEGORIES: SavedCategory[] = [
  {
    id: 'saved-sparks',
    title: 'Saved Sparks',
    description: 'Prompts, games & ideas to keep',
    icon: 'layers',
    color: '#3B82F6',
    route: '/sparks/saved/sparks',
  },
  {
    id: 'saved-games',
    title: 'Saved Games',
    description: 'Your favorite games to play together',
    icon: 'gamepad',
    color: '#F97316',
  },
  {
    id: 'saved-inspo',
    title: 'Saved Inspo',
    description: 'Stories and ideas that inspired you',
    icon: 'lightbulb',
    color: '#10B981',
    route: '/inspo/saved',
  },
];

export default function SavedIndexScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const router = useRouter();
  const { userSparks } = useAppStore();

  const savedSparksCount = userSparks.filter(us => us.status === 'saved').length;
  const { postBookmarks } = useAppStore();
  const savedInspoCount = postBookmarks.length;

  const handleCategoryPress = (category: SavedCategory) => {
    if (category.route) {
      router.push(category.route as any);
    }
  };

  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'layers':
        return <Layers size={32} color={color} strokeWidth={2} />;
      case 'gamepad':
        return <Gamepad2 size={32} color={color} strokeWidth={2} />;
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
          title: 'Saved',
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
          <Bookmark size={32} color="#3B82F6" strokeWidth={2} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Saved Content</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Access your bookmarked sparks, games, and inspiration
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {SAVED_CATEGORIES.map((category) => {
            const count = category.id === 'saved-sparks' ? savedSparksCount : 
                          category.id === 'saved-inspo' ? savedInspoCount : 0;
            
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
                  <View style={styles.categoryHeader}>
                    <Text style={[styles.categoryTitle, { color: colors.text }]}>
                      {category.title}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.countBadge, { backgroundColor: category.color + '20', borderColor: category.color }]}>
                        <Text style={[styles.countText, { color: category.color }]}>{count}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                    {category.description}
                  </Text>
                  {!category.route && (
                    <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                      Coming soon
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
    opacity: 0.6,
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
  categoryHeader: {
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
  comingSoonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontStyle: 'italic',
    marginTop: SPACING.xs - 2,
  },
});