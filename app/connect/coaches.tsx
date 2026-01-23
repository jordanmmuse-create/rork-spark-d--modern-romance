import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { User, X, ChevronLeft, MessageCircle } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { SEED_COACHES } from '@/constants/plus-data';
import { CoachProfile } from '@/types';
import { useAppStore } from '@/store/appStore';
import UnreadMailIcon from '@/components/UnreadMailIcon';

const CATEGORIES = [
  'Behavioral',
  'Familial',
  'Holistic',
  'Developmental',
] as const;

type Category = typeof CATEGORIES[number];

const CATEGORY_MAPPING: Record<string, string[]> = {
  'Behavioral': ['coach-1', 'coach-3', 'coach-4'],
  'Familial': ['coach-2', 'coach-5', 'coach-6', 'coach-8'],
  'Holistic': ['coach-4', 'coach-7'],
  'Developmental': ['coach-2', 'coach-3', 'coach-8'],
};

export default function CoachesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { scheduleCoachingSession } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>('Behavioral');
  const [showCoachDetail, setShowCoachDetail] = useState<CoachProfile | null>(null);

  const filteredCoaches = useMemo(() => {
    const coachIds = CATEGORY_MAPPING[selectedCategory] || [];
    return SEED_COACHES.filter((coach) => coachIds.includes(coach.id));
  }, [selectedCategory]);

  const handleCoachPress = (coach: CoachProfile) => {
    console.log('[Coaches] Selected coach:', coach.name);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowCoachDetail(coach);
  };

  const handleScheduleSession = (coach: CoachProfile, sessionTypeId: string) => {
    const sessionType = coach.availableSessionTypes.find(t => t.id === sessionTypeId);
    if (!sessionType) return;
    
    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    scheduleCoachingSession({
      coachId: coach.id,
      coachName: coach.name,
      sessionTypeId: sessionType.id,
      sessionTypeName: sessionType.name,
      scheduledAt,
      status: 'scheduled',
    });
    
    setShowCoachDetail(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              console.log('[Coaches] Back pressed');
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
            <MessageCircle size={20} color={colors.success} strokeWidth={2.5} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>+ Coaching</Text>
          </View>

          <UnreadMailIcon
            onPress={() => {
              console.log('[Coaches] Messages pressed');
              router.push('/connect/guidance-messages' as any);
            }}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <User size={40} color={colors.success} strokeWidth={2} style={styles.headerIcon} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            Meet the Coaches!
          </Text>
          <Text style={[styles.pageDescription, { color: colors.textSecondary }]}>
            Find the right expert to guide your journey
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category) => {
            const isSelected = category === selectedCategory;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryPill,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                  isSelected && styles.categoryPillActive,
                  isSelected && { backgroundColor: colors.success + '20', borderColor: colors.success },
                ]}
                onPress={() => {
                  console.log('[Coaches] Select category:', category);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedCategory(category);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: colors.textSecondary },
                    isSelected && styles.categoryPillTextActive,
                    isSelected && { color: colors.success },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.coachesList}>
          {filteredCoaches.map((coach) => (
            <TouchableOpacity
              key={coach.id}
              style={[styles.coachCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleCoachPress(coach)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: coach.photoUrl }} style={styles.coachPhoto} />
              <View style={styles.coachInfo}>
                <Text style={[styles.coachName, { color: colors.text }]}>{coach.name}</Text>
                <Text style={[styles.coachCredentials, { color: colors.textSecondary }]}>
                  {coach.credentials}
                </Text>
                <Text style={[styles.coachSpecialty, { color: colors.text }]} numberOfLines={2}>
                  {coach.specialty}
                </Text>
                <View style={styles.coachRating}>
                  <Text style={[styles.coachRatingText, { color: colors.warning }]}>
                    ★ {coach.rating}
                  </Text>
                  <Text style={[styles.coachReviewCount, { color: colors.textSecondary }]}>
                    ({coach.reviewCount} reviews)
                  </Text>
                </View>
                <View style={styles.coachTags}>
                  {coach.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.tagText, { color: colors.success }]}>{tag}</Text>
                    </View>
                  ))}
                  {coach.tags.length > 3 && (
                    <Text style={[styles.moreTags, { color: colors.textSecondary }]}>
                      +{coach.tags.length - 3}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredCoaches.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No coaches found in this category
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCoachDetail !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCoachDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {showCoachDetail && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{showCoachDetail.name}</Text>
                  <TouchableOpacity onPress={() => setShowCoachDetail(null)}>
                    <X size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Image
                    source={{ uri: showCoachDetail.photoUrl }}
                    style={styles.coachDetailPhoto}
                  />
                  
                  <Text style={[styles.coachDetailCredentials, { color: colors.textSecondary }]}>{showCoachDetail.credentials}</Text>
                  <Text style={[styles.coachDetailSpecialty, { color: colors.text }]}>{showCoachDetail.specialty}</Text>
                  
                  <View style={styles.coachDetailRating}>
                    <Text style={[styles.coachDetailRatingText, { color: colors.warning }]}>★ {showCoachDetail.rating}</Text>
                    <Text style={[styles.coachDetailReviewCount, { color: colors.textSecondary }]}>({showCoachDetail.reviewCount} reviews)</Text>
                  </View>
                  
                  <Text style={[styles.coachDetailBio, { color: colors.text }]}>{showCoachDetail.bio}</Text>
                  
                  <View style={styles.coachDetailTags}>
                    {showCoachDetail.tags.map((tag) => (
                      <View key={tag} style={[styles.coachTag, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.coachTagText, { color: colors.success }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={[styles.sessionTypesTitle, { color: colors.text }]}>Available Sessions</Text>
                  {showCoachDetail.availableSessionTypes.map((sessionType) => (
                    <TouchableOpacity
                      key={sessionType.id}
                      style={[styles.sessionTypeCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                      onPress={() => handleScheduleSession(showCoachDetail, sessionType.id)}
                      activeOpacity={0.8}
                    >
                      <View>
                        <Text style={[styles.sessionTypeName, { color: colors.text }]}>{sessionType.name}</Text>
                        <Text style={[styles.sessionTypeDuration, { color: colors.textSecondary }]}>{sessionType.duration} minutes</Text>
                      </View>
                      {sessionType.price !== undefined && sessionType.price > 0 && (
                        <Text style={[styles.sessionTypePrice, { color: colors.success }]}>${sessionType.price}</Text>
                      )}
                      {sessionType.price === 0 && (
                        <Text style={[styles.sessionTypeFree, { color: colors.success }]}>Free</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  pageDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: 0,
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  categoryPill: {
    paddingVertical: SPACING.sm * 1.18,
    paddingHorizontal: SPACING.sm * 1.18,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillActive: {
    borderWidth: 2,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    flexShrink: 0,
  },
  categoryPillTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  coachesList: {
    gap: SPACING.md,
  },
  coachCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  coachPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 4,
  },
  coachCredentials: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
  },
  coachSpecialty: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    marginBottom: SPACING.xs,
  },
  coachRatingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  coachReviewCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  coachTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs - 2,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 4,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  moreTags: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  emptyState: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  coachDetailPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  coachDetailCredentials: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  coachDetailSpecialty: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  coachDetailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  coachDetailRatingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  coachDetailReviewCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  coachDetailBio: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  coachDetailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  coachTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
  },
  coachTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sessionTypesTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  sessionTypeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  sessionTypeName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sessionTypeDuration: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  sessionTypePrice: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sessionTypeFree: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#000000',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
