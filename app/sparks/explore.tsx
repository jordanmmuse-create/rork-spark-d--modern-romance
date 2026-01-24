import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Library, Filter, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, FOCUS_AREA_COLORS, getThemeTagColor } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Spark, FocusArea, RelationshipStage } from '@/types';


type CategoryId = 'all' | 'communication' | 'trust' | 'conflict' | 'play' | 'growth' | 'gratitude' | 'intimacy' | 'boundaries' | 'desire' | 'intention';

const CATEGORIES: { id: CategoryId; label: string; value: FocusArea | 'all' }[] = [
  { id: 'all', label: 'All', value: 'all' },
  { id: 'communication', label: 'Communication', value: 'communication' },
  { id: 'trust', label: 'Trust', value: 'trust' },
  { id: 'conflict', label: 'Conflict', value: 'conflict' },
  { id: 'play', label: 'Play', value: 'play' },
  { id: 'growth', label: 'Growth', value: 'growth' },
  { id: 'gratitude', label: 'Gratitude', value: 'gratitude' },
  { id: 'intimacy', label: 'Intimacy', value: 'intimacy' },
  { id: 'boundaries', label: 'Boundaries', value: 'boundaries' },
  { id: 'desire', label: 'Desire', value: 'desire' },
  { id: 'intention', label: 'Intention', value: 'intention' },
];

function toggleCategory(
  current: CategoryId[],
  nextId: CategoryId
): CategoryId[] {
  const set = new Set(current);

  if (nextId === 'all') return ['all'];

  set.delete('all');

  if (set.has(nextId)) set.delete(nextId);
  else set.add(nextId);

  if (set.size === 0) return ['all'];

  return Array.from(set);
}

function interleaveByCategory(sparks: Spark[]): Spark[] {
  const grouped = new Map<FocusArea, Spark[]>();
  
  sparks.forEach((spark) => {
    if (!grouped.has(spark.focusArea)) {
      grouped.set(spark.focusArea, []);
    }
    grouped.get(spark.focusArea)!.push(spark);
  });
  
  const categories = Array.from(grouped.keys());
  const result: Spark[] = [];
  let hasMore = true;
  let index = 0;
  
  while (hasMore) {
    hasMore = false;
    for (const category of categories) {
      const categoryCards = grouped.get(category)!;
      if (index < categoryCards.length) {
        result.push(categoryCards[index]);
        hasMore = true;
      }
    }
    index++;
  }
  
  return result;
}

export default function ExploreSparksScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { getSparks, profile } = useAppStore();
  const sparks = getSparks();
  const hasSetDefaultFilter = useRef(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<CategoryId[]>(['all']);
  const [filterStage, setFilterStage] = useState<RelationshipStage | 'all'>('all');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  

  
  useEffect(() => {
    if (!hasSetDefaultFilter.current && profile) {
      const status = profile.status;
      if (status === 'single' || status === 'dating') {
        setFilterStage('early');
      } else if (status === 'partnered' || status === 'complicated') {
        setFilterStage('established');
      }
      hasSetDefaultFilter.current = true;
    }
  }, [profile]);
  
  const hasActiveFilters = filterStage !== 'all' || (selectedCategoryIds.length > 0 && !selectedCategoryIds.includes('all'));
  
  const filteredSparks = useMemo(() => {
    const filtered = sparks.filter((spark) => {
      const matchesSearch = searchQuery === '' ||
        spark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spark.lesson.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategoryIds.includes('all') ||
        selectedCategoryIds.includes(spark.focusArea as CategoryId);
      
      const matchesFilterStage = filterStage === 'all' ||
        spark.relationshipStage === filterStage ||
        spark.relationshipStage === 'any';
      
      return matchesSearch && matchesCategory && matchesFilterStage;
    });
    
    if (selectedCategoryIds.includes('all')) {
      return interleaveByCategory(filtered);
    }
    
    return filtered;
  }, [sparks, searchQuery, selectedCategoryIds, filterStage]);
  
  const resetFilters = () => {
    setSelectedCategoryIds(['all']);
    setFilterStage('all');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const router = useRouter();
  
  const openSparkModal = (spark: Spark) => {
    console.log('[ExploreSparks] Opening spark overlay route for:', spark.id);
    router.push({ pathname: '/sparks/modal', params: { sparkId: spark.id } } as any);
  };
  
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
              console.log('[ExploreSparks] Back pressed');
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Explore Sparks!</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setIsFilterModalVisible(true);
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={styles.headerRight}
            activeOpacity={0.7}
          >
            <Filter size={24} color={colors.text} strokeWidth={2} />
            {hasActiveFilters && (
              <View style={[styles.filterBadge, { backgroundColor: '#3B82F6' }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: SPACING.lg,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Library size={24} color="#3B82F6" style={styles.pageHeaderIcon} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Sparks Library</Text>
        </View>
        <Text style={[styles.pageDescription, { color: colors.textSecondary }]}>
          Find thoughtful Spark Packs designed to meet you where you&rsquo;re at.
        </Text>
        
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
            const isSelected = selectedCategoryIds.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && [
                    styles.categoryChipActive,
                    { backgroundColor: categoryColor + '20', borderColor: categoryColor },
                  ],
                ]}
                onPress={() => {
                  setSelectedCategoryIds(prev => toggleCategory(prev, category.id));
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
                    isSelected && [
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
              No sparks found matching your criteria.
            </Text>
          </View>
        ) : (
          filteredSparks.map((spark) => (
            <SparkCard key={spark.id} spark={spark} onPress={openSparkModal} />
          ))
        )}
      </ScrollView>


      
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        selectedCategoryIds={selectedCategoryIds}
        filterStage={filterStage}
        onApply={(categoryIds, stage) => {
          setSelectedCategoryIds(categoryIds);
          setFilterStage(stage);
          setIsFilterModalVisible(false);
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        onReset={resetFilters}
      />
    </View>
  );
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategoryIds: CategoryId[];
  filterStage: RelationshipStage | 'all';
  onApply: (categoryIds: CategoryId[], stage: RelationshipStage | 'all') => void;
  onReset: () => void;
}

function FilterModal({ visible, onClose, selectedCategoryIds, filterStage, onApply, onReset }: FilterModalProps) {
  const { colors } = useThemeStyles();
  const [tempCategoryIds, setTempCategoryIds] = useState<CategoryId[]>(selectedCategoryIds);
  const [tempStage, setTempStage] = useState<RelationshipStage | 'all'>(filterStage);

  useEffect(() => {
    if (visible) {
      setTempCategoryIds(selectedCategoryIds);
      setTempStage(filterStage);
    }
  }, [visible, selectedCategoryIds, filterStage]);

  const handleApply = () => {
    onApply(tempCategoryIds, tempStage);
  };

  const handleReset = () => {
    setTempCategoryIds(['all']);
    setTempStage('all');
    onReset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Sparks</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Relationship Stage</Text>
            <View style={styles.filterOptions}>
              {[
                { label: 'All', value: 'all' as const },
                { label: 'Early Dating', value: 'early' as const },
                { label: 'Established', value: 'established' as const },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    tempStage === option.value && [
                      styles.filterOptionActive,
                      { backgroundColor: '#3B82F6' + '20', borderColor: '#3B82F6' },
                    ],
                  ]}
                  onPress={() => {
                    setTempStage(option.value);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: colors.textSecondary },
                      tempStage === option.value && [
                        styles.filterOptionTextActive,
                        { color: '#3B82F6' },
                      ],
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Category</Text>
            <View style={styles.filterOptions}>
              {CATEGORIES.map((category) => {
                const categoryColor = FOCUS_AREA_COLORS[category.value as FocusArea] || '#3B82F6';
                const isSelected = tempCategoryIds.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterOption,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      isSelected && [
                        styles.filterOptionActive,
                        { backgroundColor: categoryColor + '20', borderColor: categoryColor },
                      ],
                    ]}
                    onPress={() => {
                      setTempCategoryIds(prev => toggleCategory(prev, category.id));
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    {category.value !== 'all' && (
                      <Text style={styles.filterOptionEmoji}>
                        {FOCUS_AREA_INFO[category.value as FocusArea].emoji}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: colors.textSecondary },
                        isSelected && [
                          styles.filterOptionTextActive,
                          { color: categoryColor },
                        ],
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colors.border }]}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: '#3B82F6' }]}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface SparkCardProps {
  spark: Spark;
  onPress: (spark: Spark) => void;
}

function SparkCard({ spark, onPress }: SparkCardProps) {
  const { colors } = useThemeStyles();
  const areaTagColors = getThemeTagColor(FOCUS_AREA_INFO[spark.focusArea].title);

  const handlePress = () => {
    onPress(spark);
  };

  return (
    <TouchableOpacity
      style={[styles.sparkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
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
    position: 'absolute' as const,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as const,
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
    position: 'relative' as const,
    flexShrink: 0,
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
  pageDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.md,
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
  filterBadge: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalClose: {
    padding: SPACING.xs,
  },
  modalCloseText: {
    fontSize: 24,
  },
  modalScroll: {
    paddingHorizontal: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    gap: SPACING.xs - 2,
  },
  filterOptionActive: {
    borderWidth: 2,
  },
  filterOptionEmoji: {
    fontSize: 14,
  },
  filterOptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterOptionTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    borderWidth: 1.5,
  },
  modalButtonPrimary: {},
  modalButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
});
