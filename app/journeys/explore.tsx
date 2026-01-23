import React, { useState, useMemo } from 'react';
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
import { Search, Map, Play, CheckCircle2, Library, Filter, ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, FOCUS_AREA_COLORS } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Journey, FocusArea } from '@/types';

type CategoryId = 'all' | 'communication' | 'trust' | 'conflict' | 'play' | 'growth' | 'gratitude' | 'intimacy' | 'boundaries';

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

function getCategoryColor(categoryId: string): string {
  const colorMap: Record<string, string> = {
    all: '#F97316',
    communication: '#60A5FA',
    trust: '#A78BFA',
    conflict: '#F97316',
    play: '#FBBF24',
    growth: '#4ADE80',
    gratitude: '#34D399',
    intimacy: '#F472B6',
    boundaries: '#C084FC',
  };
  return colorMap[categoryId] || '#F97316';
}

export default function ExploreJourneysScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const router = useRouter();
  const { getJourneys, userJourneys, startJourney } = useAppStore();
  const journeys = getJourneys();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<CategoryId[]>(['all']);
  const [selectedJourneyType, setSelectedJourneyType] = useState<'devotional' | 'workshop'>('workshop');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  
  const hasActiveFilters = selectedCategoryIds.length > 0 && !selectedCategoryIds.includes('all');
  
  const filteredJourneys = useMemo(() => {
    return journeys.filter((journey) => {
      const matchesSearch = searchQuery === '' ||
        journey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journey.overview.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryIds.includes('all') ||
        journey.focusAreas.some((area) => selectedCategoryIds.includes(area as CategoryId));
      const matchesType = journey.journeyType === selectedJourneyType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [journeys, searchQuery, selectedCategoryIds, selectedJourneyType]);
  
  const resetFilters = () => {
    setSelectedCategoryIds(['all']);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleStartJourney = (journeyId: string) => {
    startJourney(journeyId);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
              console.log('[ExploreJourneys] Back pressed');
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Explore Journeys!</Text>
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
              <View style={[styles.filterBadge, { backgroundColor: '#1988B2' }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>
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
          <Library size={24} color="#1988B2" style={styles.pageHeaderIcon} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Journeys Library</Text>
        </View>
        
        <View style={[styles.journeyToggleContainer, { backgroundColor: colors.tint + '20', borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.journeyToggleButton,
              { backgroundColor: 'transparent' },
              selectedJourneyType === 'workshop' && [styles.journeyToggleButtonActive, { backgroundColor: colors.tint }],
            ]}
            onPress={() => {
              setSelectedJourneyType('workshop');
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.journeyToggleText,
                { color: colors.textSecondary },
                selectedJourneyType === 'workshop' && styles.journeyToggleTextActive,
              ]}
            >
              Workshops
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.journeyToggleButton,
              { backgroundColor: 'transparent' },
              selectedJourneyType === 'devotional' && [styles.journeyToggleButtonActive, { backgroundColor: colors.tint }],
            ]}
            onPress={() => {
              setSelectedJourneyType('devotional');
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.journeyToggleText,
                { color: colors.textSecondary },
                selectedJourneyType === 'devotional' && styles.journeyToggleTextActive,
              ]}
            >
              Devotionals
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchBarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchBarInput, { color: colors.text }]}
            placeholder="Search Journeys…"
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
            const categoryColor = getCategoryColor(category.id);
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
        
        {filteredJourneys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No journeys found matching your criteria.
            </Text>
          </View>
        ) : (
          filteredJourneys.map((journey) => {
            const userJourney = userJourneys.find(
              (uj) => uj.journeyId === journey.id
            );
            return (
              <JourneyCard
                key={journey.id}
                journey={journey}
                isActive={userJourney?.status === 'active'}
                progress={userJourney ? userJourney.completedDays.length : 0}
                onStart={() => handleStartJourney(journey.id)}
              />
            );
          })
        )}
      </ScrollView>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        selectedCategoryIds={selectedCategoryIds}
        onApply={(categoryIds) => {
          setSelectedCategoryIds(categoryIds);
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
  onApply: (categoryIds: CategoryId[]) => void;
  onReset: () => void;
}

function FilterModal({ visible, onClose, selectedCategoryIds, onApply, onReset }: FilterModalProps) {
  const { colors } = useThemeStyles();
  const [tempCategoryIds, setTempCategoryIds] = useState<CategoryId[]>(selectedCategoryIds);

  React.useEffect(() => {
    if (visible) {
      setTempCategoryIds(selectedCategoryIds);
    }
  }, [visible, selectedCategoryIds]);

  const handleApply = () => {
    onApply(tempCategoryIds);
  };

  const handleReset = () => {
    setTempCategoryIds(['all']);
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Journeys</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Category</Text>
            <View style={styles.filterOptions}>
              {CATEGORIES.map((category) => {
                const categoryColor = getCategoryColor(category.id);
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
              style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: '#1988B2' }]}
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

interface JourneyCardProps {
  journey: Journey;
  isActive: boolean;
  progress: number;
  onStart: () => void;
}

function JourneyCard({ journey, isActive, progress, onStart }: JourneyCardProps) {
  const { colors } = useThemeStyles();
  const primaryColor = FOCUS_AREA_COLORS[journey.focusAreas[0]] || colors.tint;

  return (
    <View style={[styles.journeyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.journeyHeaderHorizontal}>
        <Text style={[styles.journeyTitle, { color: colors.text, flex: 1 }]}>{journey.title}</Text>
        <View
          style={[
            styles.journeyIconSmall,
            { backgroundColor: primaryColor + '20' },
          ]}
        >
          <Map size={16} color={primaryColor} />
        </View>
      </View>
      {isActive && (
        <View style={[styles.activeTag, { backgroundColor: primaryColor }]}>
          <Text style={styles.activeTagText}>Active</Text>
        </View>
      )}
      <Text style={[styles.journeyOverview, { color: colors.textSecondary }]} numberOfLines={2}>
        {journey.overview}
      </Text>

      <View style={styles.journeyMeta}>
        <View style={styles.focusAreas}>
          {journey.focusAreas.slice(0, 2).map((area) => (
            <View
              key={area}
              style={[
                styles.areaTag,
                { backgroundColor: FOCUS_AREA_COLORS[area] + '20' },
              ]}
            >
              <Text style={styles.areaEmoji}>
                {FOCUS_AREA_INFO[area].emoji}
              </Text>
            </View>
          ))}
          {journey.focusAreas.length > 2 && (
            <Text style={[styles.moreAreas, { color: colors.textSecondary }]}>+{journey.focusAreas.length - 2}</Text>
          )}
        </View>
        <Text style={[styles.daysText, { color: colors.textSecondary }]}>
          {journey.journeyType === 'devotional' 
            ? `${journey.durationDays || journey.days} days`
            : `${journey.durationMinutes || 0} minutes`}
        </Text>
      </View>

      {isActive && progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(progress / journey.days) * 100}%`,
                  backgroundColor: primaryColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {progress} / {journey.days} days completed
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.journeyButton,
          { backgroundColor: colors.tint },
          isActive && [
            styles.journeyButtonActive,
            { backgroundColor: primaryColor },
          ],
        ]}
        onPress={onStart}
        activeOpacity={0.8}
      >
        {isActive ? (
          <CheckCircle2 size={18} color="white" />
        ) : (
          <Play size={18} color="white" />
        )}
        <Text style={styles.journeyButtonText}>
          {isActive ? 'Continue' : 'Start Journey'}
        </Text>
      </TouchableOpacity>
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
  filterBadge: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.xs,
  },
  categoryChipActive: {
    borderWidth: 2,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  categoryChipTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  journeyToggleContainer: {
    flexDirection: 'row',
    padding: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  journeyToggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  journeyToggleButtonActive: {},
  journeyToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  journeyToggleTextActive: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  journeyCard: {
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  journeyHeaderHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs - 2,
    gap: SPACING.sm,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
  },
  journeyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activeTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  activeTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: 'white',
  },
  journeyTitle: {
    fontSize: TYPOGRAPHY.sizes.md + 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 20,
  },
  journeyOverview: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.xs + 2,
  },
  journeyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
  },
  focusAreas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  areaTag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaEmoji: {
    fontSize: 10,
  },
  moreAreas: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginLeft: SPACING.xs - 2,
  },
  daysText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  progressContainer: {
    marginBottom: SPACING.xs + 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  journeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  journeyButtonActive: {},
  journeyButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: 'white',
  },
  emptyState: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
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
    maxHeight: '70%',
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
