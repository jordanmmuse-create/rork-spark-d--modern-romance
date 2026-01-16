import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Sparkle, ChevronRight, ShoppingBag, Layers, LockKeyhole, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { useRouter, Stack } from 'expo-router';
import { useTabScroll } from './_layout';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, getThemeTagColor } from '@/constants/colors';
import { HEADER_LAYOUT } from '@/constants/header';
import { Spark } from '@/types';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import FlippableSparkCard from '@/components/FlippableSparkCard';
import SendSparkModal from '@/components/SendSparkModal';
import SparkCardFooter from '@/components/SparkCardFooter';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getSparks, getTodaySpark, saveSpark, unsaveSpark, isSparkSaved, profile, addJournalEntry, ensureTodaySparkExists } = useAppStore();
  const { colors } = useThemeStyles();
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(true);
  const scrollRef = useRef<ScrollView>(null);
  const { registerScroll } = useTabScroll();
  


  useEffect(() => {
    console.log('[LibraryScreen] Component mounted, ensuring today spark exists');
    if (profile?.hasCompletedOnboarding) {
      ensureTodaySparkExists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.hasCompletedOnboarding]);

  useEffect(() => {
    console.log('[LibraryScreen] Relationship status changed, re-checking spark');
    if (profile?.hasCompletedOnboarding && profile?.status) {
      ensureTodaySparkExists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.status]);

  useEffect(() => {
    registerScroll('library', scrollRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todaySparkData = getTodaySpark();
  const sparks = getSparks();
  
  const todaySparkTagColors = todaySparkData 
    ? getThemeTagColor(FOCUS_AREA_INFO[todaySparkData.focusArea].title)
    : null;
  
  const isEarlyDatingUser = profile?.status === 'single' || profile?.status === 'dating';
  
  const previewSparks = React.useMemo(() => {
    if (isEarlyDatingUser) {
      const earlyDatingFeaturedIds = [
        'spark-ed-comm-1',
        'spark-ed-trust-1',
        'spark-ed-play-1',
        'spark-ed-intimacy-1',
        'spark-ed-desire-1',
      ];
      return earlyDatingFeaturedIds
        .map(id => sparks.find(s => s.id === id))
        .filter((s): s is Spark => s !== undefined);
    } else {
      return sparks.slice(0, 5).map((spark) => {
        if (spark.id === 'spark-3') {
          return sparks.find(s => s.id === 'spark-43') || spark;
        }
        if (spark.id === 'spark-41') {
          return sparks.find(s => s.id === 'spark-27') || spark;
        }
        return spark;
      });
    }
  }, [sparks, isEarlyDatingUser]);

  const handleSendSparkPress = () => {
    if (!todaySparkData) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowSendModal(true);
  };

  const handleSendSpark = (message: string) => {
    if (!todaySparkData) return;
    addJournalEntry({
      content: message,
      tags: ['spark'],
      sparkId: todaySparkData.id,
      category: 'notes',
      sendTarget: 'partner',
    });
    setShowSendModal(false);
  };



  const handleSave = () => {
    if (!todaySparkData) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const isSaved = isSparkSaved(todaySparkData.id);
    if (isSaved) {
      unsaveSpark(todaySparkData.id);
    } else {
      saveSpark(todaySparkData.id);
    }
  };

  const openSparkModal = (spark: Spark) => {
    console.log('[LibraryScreen] Opening spark overlay route for:', spark.id);
    router.push({ pathname: '/sparks/modal', params: { sparkId: spark.id } } as any);
  };

  if (!profile) return null;

  console.log('LibraryScreen render: todaySparkData?', !!todaySparkData, 'todaySpark userSpark status:', todaySparkData?.userSpark?.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, position: 'relative' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerSection, { paddingHorizontal: SPACING.lg }]}>
          <View style={styles.header}>
            <View style={[styles.headerLeftSlot, !isCardFlipped && { justifyContent: 'flex-start' }]} testID="library-header-left-slot">
              {isCardFlipped ? (
                <View style={styles.headerLeftWrap} testID="library-header-left-title">
                  <View style={styles.headerLeft}>
                    <Layers size={28} color={colors.tint} strokeWidth={2} />
                    <Text style={[styles.title, { color: colors.text }]}>
                      Sparks
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.headerLogoWrapFlipped} testID="library-header-left-logo">
                  <Image
                    source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
                    style={styles.headerLogoFlipped}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>

            <View style={styles.xpBadgeContainer}>
              <View style={[styles.xpBadge, { backgroundColor: colors.card, borderColor: '#1EADE4' }]}>
                <Zap size={14} color="#1EADE4" fill="#1EADE4" strokeWidth={2} />
                <Text style={[styles.xpBadgeText, { color: '#1EADE4' }]}>{profile.totalXP}</Text>
              </View>
            </View>
          </View>


          <Text style={[styles.pageDescription, { color: colors.textSecondary, opacity: isCardFlipped ? 1 : 0 }]}>
            Cards that move relationships forward
          </Text>
        </View>

        <View style={[styles.mantraContainer, { paddingHorizontal: SPACING.lg }]}>
          <Text style={[styles.mantra, { color: colors.text }]}>
            Light the Spark. Keep the Flame.
          </Text>

          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1wr45gun0gjo59tejd968' }}
            style={styles.lineSeparator}
            resizeMode="contain"
          />
        </View>

        {todaySparkData ? (
          <View style={[styles.todaySection, { paddingHorizontal: SPACING.lg }]}>
            <View style={styles.todayHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.sparkIcon}>💥</Text>
                <Text style={[styles.todayTitle, { color: colors.text }]}>Today&apos;s Spark</Text>
              </View>
            </View>

            <FlippableSparkCard
              onFlipChange={(flipped) => setIsCardFlipped(flipped)}
              disabledTouchAreas={
                <>
                  <View style={styles.todayFooterOverlay} pointerEvents="box-none" testID="today-spark-footer">
                    <SparkCardFooter
                      spark={todaySparkData}
                      isBookmarked={isSparkSaved(todaySparkData.id)}
                      onPressBookmark={handleSave}
                      onPressSend={handleSendSparkPress}
                    />
                  </View>
                </>
              }
            >
              <View style={[styles.sparkCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <LinearGradient
                  colors={[colors.glow, 'transparent']}
                  style={styles.glowOverlay}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View
                  style={[
                    styles.focusBadge,
                    {
                      backgroundColor: todaySparkTagColors?.background,
                      borderColor: todaySparkTagColors?.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={styles.focusEmoji}>
                    {FOCUS_AREA_INFO[todaySparkData.focusArea].emoji}
                  </Text>
                  <Text
                    style={[
                      styles.focusText,
                      { color: todaySparkTagColors?.text },
                    ]}
                  >
                    {FOCUS_AREA_INFO[todaySparkData.focusArea].title}
                  </Text>
                </View>

                <Text style={[styles.sparkTitle, { color: colors.text }]}>{todaySparkData.title}</Text>

                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>IDEA SPARK</Text>
                  <Text style={[styles.lessonText, { color: colors.text }]}>{todaySparkData.lesson}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CONVERSATION SPARK</Text>
                  <View style={[styles.starterBox, { backgroundColor: colors.surfaceInset || colors.backgroundSecondary, borderLeftColor: colors.accent }]}>
                    <Text style={[styles.starterText, { color: colors.text }]}>
                      &ldquo;{todaySparkData.starter}&rdquo;
                    </Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACTION SPARK</Text>
                  <Text style={[styles.actionText, { color: colors.text }]}>{todaySparkData.action}</Text>
                </View>

                <View style={styles.actions} />
              </View>
            </FlippableSparkCard>
          </View>
        ) : null}

        <View style={[styles.librarySection, { paddingHorizontal: SPACING.lg }]}>
          <View style={styles.librarySectionHeader}>
            <Sparkle size={22} color="#1988B2" style={styles.libraryIcon} />
            <Text style={[styles.libraryTitle, { color: colors.text }]}>More Sparks</Text>
          </View>
          <Text style={[styles.librarySubtitle, { color: colors.textSecondary }]}>
            Browse additional Sparks below and find one for your partner
          </Text>
        </View>

        <View style={[styles.sparksList, { paddingHorizontal: SPACING.lg }]}>
          {previewSparks.map((spark) => (
            <SparkCard key={spark.id} spark={spark} onPress={openSparkModal} />
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: SPACING.lg }]}
          onPress={() => router.push('/sparks/explore' as any)}
          activeOpacity={0.7}
        >
          <Text style={[styles.exploreButtonText, { color: colors.text }]}>Explore Sparks!</Text>
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.storeSection, { paddingHorizontal: SPACING.lg }]}>
          <View style={[styles.librarySectionHeader, { marginBottom: SPACING.md }]}>
            <ShoppingBag size={22} color={colors.tint} style={styles.libraryIcon} />
            <Text style={[styles.libraryTitle, { color: colors.text }]}>The Spark&apos;d Store</Text>
          </View>
          
          <View style={styles.storeGlowContainer}>
            <View style={[
              styles.storeGlow,
              {
                backgroundColor: '#FB923C',
                shadowColor: '#FB923C',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 32,
                elevation: 12,
              }
            ]} />
            <View style={[styles.storePlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.storeBadge, { backgroundColor: colors.backgroundSecondary }]}>
                <LockKeyhole size={14} color={colors.textSecondary} />
                <Text style={[styles.storeBadgeText, { color: colors.textSecondary }]}>Coming Soon</Text>
              </View>
              <Flame size={32} color={colors.textSecondary} strokeOpacity={0.5} />
              <View style={styles.storeContent}>
                <Text style={[styles.storePlaceholderTitle, { color: colors.textSecondary }]}>Find Your Spark</Text>
                <Text style={[styles.storePlaceholderDescription, { color: colors.textSecondary }]}>
                  Discover curated Spark Packs tailored to specific relationship needs, focus areas, and growth points.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {todaySparkData && (
        <SendSparkModal
          visible={showSendModal}
          conversationSpark={todaySparkData.starter}
          onClose={() => setShowSendModal(false)}
          onSend={handleSendSpark}
        />
      )}


    </View>
  );
}

function SparkCard({ spark, onPress }: { spark: Spark; onPress: (spark: Spark) => void }) {
  const { colors } = useThemeStyles();
  const areaTagColors = getThemeTagColor(FOCUS_AREA_INFO[spark.focusArea].title);
  
  const handlePress = () => {
    onPress(spark);
  };
  
  return (
    <TouchableOpacity style={[styles.librarySparkCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.7} onPress={handlePress}>
      <View
        style={[
          styles.librarySparkBadge,
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
      <Text style={[styles.librarySparkCardTitle, { color: colors.text }]}>{spark.title}</Text>
      <Text style={[styles.librarySparkCardLesson, { color: colors.textSecondary }]} numberOfLines={1}>{spark.lesson}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {},
  todaySection: {
    marginBottom: SPACING.xl,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEADER_LAYOUT.FIRST_SECTION_HEADER_BOTTOM_MARGIN,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  todayTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.sizes.lg,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  streakText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sparkCard: {
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.15,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs + 2,
  },
  focusEmoji: {
    fontSize: 14,
    marginRight: SPACING.xs - 2,
  },
  focusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  sparkTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs + 4,
    lineHeight: 28,
  },
  section: {
    marginBottom: SPACING.xs + 4,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: SPACING.xs - 2,
  },
  lessonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 21,
  },
  starterBox: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
  },
  starterText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontStyle: 'italic' as const,
    lineHeight: 21,
  },
  actionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    height: SPACING.sm + 2 + SPACING.sm + 2 + SPACING.md,
  },
  todayFooterOverlay: {
    position: 'absolute',
    left: SPACING.sm + 2,
    right: SPACING.sm + 2,
    bottom: SPACING.sm + 2,
  },



  librarySection: {
    marginBottom: SPACING.md,
  },
  librarySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs - 2,
  },
  libraryIcon: {
    marginTop: 2,
  },
  libraryTitle: {
    fontSize: TYPOGRAPHY.sizes.lg + 2.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  librarySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  filterScroll: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    gap: SPACING.xs - 2,
  },
  filterChipActive: {},
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  filterTextActive: {},
  sparksList: {
    gap: SPACING.md,
  },
  librarySparkCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  librarySparkBadge: {
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
  librarySparkCardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  librarySparkCardLesson: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  headerSection: {
    marginBottom: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    height: HEADER_LAYOUT.HEADER_HEIGHT,
  },
  headerLeftSlot: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerLeftWrap: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  xpBadgeContainer: {
    position: 'relative',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
  },
  xpBadgeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sparkIcon: {
    fontSize: HEADER_LAYOUT.FIRST_SECTION_ICON_SIZE,
    lineHeight: HEADER_LAYOUT.FIRST_SECTION_ICON_SIZE,
  },
  smallLogo: {
    width: 144,
    height: 43.2,
    marginLeft: -SPACING.lg,
  },
  headerLogoWrapFlipped: {
    flex: 1,
    height: 36,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  headerLogoFlipped: {
    width: 172.8,
    height: 51.84,
    marginLeft: -SPACING.lg,
    marginTop: 2,
  },
  headerLogo: {
    width: 172.8,
    height: 51.84,
    marginLeft: -SPACING.lg,
  },

  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  exploreButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
    textAlign: 'center',
  },
  storeSection: {
    marginTop: SPACING.xl,
  },
  storeGlowContainer: {
    position: 'relative',
  },
  storeGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  storePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
    borderWidth: 1,
    position: 'relative',
    backgroundColor: '#171A1F',
    opacity: 1,
    overflow: 'hidden',
  },
  storeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
  },
  storeBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase' as const,
  },
  storeContent: {
    flex: 1,
  },
  storePlaceholderTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
  },
  storePlaceholderDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  mantra: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  mantraContainer: {
    marginTop: SPACING.sm + 4,
    marginBottom: SPACING.xs,
  },
  lineSeparator: {
    width: 200,
    height: 12,
    alignSelf: 'center' as const,
    marginBottom: SPACING.md,
  },
  pageDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.xs,
  },
});
