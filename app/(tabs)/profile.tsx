import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useTabScroll } from './_layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PenLine, Bookmark, Images, BookOpen, Star, Flag, Film, Lock, Heart, Check, RefreshCw, Sparkles, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { useAppStore } from '@/store/appStore';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { HEADER_RIGHT_OFFSET, HEADER_TOP_OFFSET } from '@/constants/header';
import HeaderProfileButton from '@/components/HeaderProfileButton';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SAMPLE_TIMELINE_ITEMS, VAULT_CATEGORIES } from '@/constants/vault-data';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useThemeStyles();
  const { profile, journalEntries, userSparks, postBookmarks, favoriteSparkIds, favoriteParqIds, favoritePostIds, checkIns, resetCheckIn } = useAppStore();
  const scrollRef = useRef<ScrollView>(null);
  const { registerScroll } = useTabScroll();
  const params = useLocalSearchParams<{ scrollToCheckIn?: string }>();
  const checkInSectionRef = useRef<View>(null);
  const [checkInSectionY, setCheckInSectionY] = useState<number>(0);

  useEffect(() => {
    registerScroll('profile', scrollRef);
  }, [registerScroll]);

  useEffect(() => {
    if (params.scrollToCheckIn === 'true' && checkInSectionY > 0 && scrollRef.current) {
      console.log('[VaultScreen] Scrolling to check-in section at Y:', checkInSectionY);
      
      setTimeout(() => {
        if (scrollRef.current) {
          const centerOffset = checkInSectionY - (SCREEN_HEIGHT / 2) + 100;
          scrollRef.current.scrollTo({ 
            y: Math.max(0, centerOffset), 
            animated: true 
          });
        }
      }, 300);
    }
  }, [params.scrollToCheckIn, checkInSectionY]);

  if (!profile) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileButtonAbsolute, { top: insets.top + HEADER_TOP_OFFSET, right: HEADER_RIGHT_OFFSET }]}>
        <HeaderProfileButton
          imageUri={profile?.profilePicture}
          onPress={() => router.push('/profile/view' as any)}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: (insets.bottom + SPACING.xs) / 4,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Lock size={28} color={colors.tint} strokeWidth={2} />
            <Text style={[styles.title, { color: colors.text }]}>Vault</Text>
          </View>
        </View>
        <Text style={[styles.pageDescription, { color: colors.textSecondary }]}>
          A reflective heart and memory space
        </Text>

        <View style={styles.vaultSection}>
          <Text style={[styles.vaultMantra, { color: colors.text }]}>
            Where Our Chapters Are Quietly Written
          </Text>

          <View style={styles.decorativeDividerContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/s2mpmwp6ta1lsxocbg37p' }}
              style={styles.decorativeDivider}
              resizeMode="contain"
            />
          </View>

          <View style={styles.vaultJournalSection}>
            <View style={styles.notebookHeaderRow}>
              <PenLine size={20} color="#FF6B35" strokeWidth={2} />
              <Text style={[styles.vaultJournalTitle, { color: colors.text }]}>My Notebook</Text>
            </View>
            
            {journalEntries.length > 0 ? (
              <TouchableOpacity
                style={[styles.journalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/profile/journal' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.journalEmoji}>✍️</Text>
                <Text style={[styles.journalDateText, { color: colors.text }]}>
                  {new Date(journalEntries[0].createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '/')}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.journalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/profile/journal' as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.journalEmoji}>✍️</Text>
                <Text style={[styles.journalDateText, { color: colors.textSecondary }]}>No entries yet</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.addJournalButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/profile/journal' as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.addJournalButtonText, { color: colors.text }]}>Let&apos;s Write!</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Film size={20} color="#1988B2" strokeWidth={2} />
              <Text style={[styles.vaultSectionTitle, { color: colors.text }]}>Timeline Highlight Reel</Text>
            </View>
            <Text style={[styles.vaultSectionSubtitle, { color: colors.textSecondary }]}>A living story of your relationship, one moment at a time.</Text>
            
            <View style={styles.timelineContainer}>
              {SAMPLE_TIMELINE_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.timelineItem}
                  activeOpacity={0.7}
                >
                  <View style={styles.timelineLeftColumn}>
                    <View style={[styles.timelineDot, { backgroundColor: '#F97316' }]} />
                    {index < SAMPLE_TIMELINE_ITEMS.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  
                  <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <View style={[styles.timelineBadge, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                      <Text style={[styles.timelineBadgeText, { color: colors.text }]}>{item.badge}</Text>
                    </View>
                    <Text style={[styles.timelineTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.timelineSummary, { color: colors.textSecondary }]} numberOfLines={3}>{item.summary}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {SAMPLE_TIMELINE_ITEMS.length === 0 && (
                <View style={[styles.timelineEmptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.timelineEmptyTitle, { color: colors.text }]}>Your story starts here.</Text>
                  <Text style={[styles.timelineEmptyBody, { color: colors.textSecondary }]}>
                    As you save Sparks, milestones and memories, they&apos;ll appear in your Reflective Timeline.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View 
            style={styles.section}
            ref={checkInSectionRef}
            onLayout={(event) => {
              checkInSectionRef.current?.measureInWindow((x, y) => {
                console.log('[VaultScreen] Check-in section Y position:', y);
                setCheckInSectionY(y);
              });
            }}
          >
            <View style={styles.sectionTitleRow}>
              <Image
                source={{ uri: 'https://r2-pub.rork.com/generated-images/53705cbd-da28-4a54-9f9f-8fa244a12451.png' }}
                style={styles.checkInIcon}
                resizeMode="contain"
              />
              <Text style={[styles.vaultSectionTitle, { color: colors.text }]}>Daily Check-In</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkInCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                const today = new Date().toISOString().split('T')[0];
                const todayCheckIn = checkIns.find(c => c.createdAt.split('T')[0] === today);
                const hasCheckedInToday = !!todayCheckIn;
                if (hasCheckedInToday) {
                  router.push('/profile/checkin' as any);
                }
              }}
              activeOpacity={0.8}
              disabled={!(() => {
                const today = new Date().toISOString().split('T')[0];
                const todayCheckIn = checkIns.find(c => c.createdAt.split('T')[0] === today);
                return !!todayCheckIn;
              })()}
            >
              <Text style={[styles.checkInDescription, { color: colors.textSecondary }]}>
                Take a 30-second emotional snapshot for today.
              </Text>
              {(() => {
                const today = new Date().toISOString().split('T')[0];
                const todayCheckIn = checkIns.find(c => c.createdAt.split('T')[0] === today);
                const hasCheckedInToday = !!todayCheckIn;
                
                if (hasCheckedInToday) {
                  return (
                    <View style={styles.checkedInRow}>
                      <View style={[styles.checkedInPill, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                        <Check size={14} color={colors.success} strokeWidth={2.5} />
                        <Text style={[styles.checkedInPillText, { color: colors.success }]}>Checked In</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.resetButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          resetCheckIn();
                        }}
                        activeOpacity={0.7}
                      >
                        <RefreshCw size={16} color={colors.text} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  );
                } else {
                  return (
                    <TouchableOpacity 
                      style={[styles.checkInButton, { backgroundColor: colors.tint }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push('/profile/checkin' as any);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.checkInButtonText}>Submit Check-In</Text>
                    </TouchableOpacity>
                  );
                }
              })()}
            </TouchableOpacity>
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              const todayCheckIn = checkIns.find(c => c.createdAt.split('T')[0] === today);
              const hasCheckedInToday = !!todayCheckIn;
              
              if (hasCheckedInToday && profile?.astrologyEnabled) {
                return (
                  <TouchableOpacity
                    style={[styles.horoscopeSnapshotCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => router.push('/profile/horoscope' as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.horoscopeSnapshotContent}>
                      <Text style={[styles.horoscopeSnapshotTitle, { color: colors.text }]}>
                        Your Celestial Snapshot for Today
                      </Text>
                      <Text style={[styles.horoscopeSnapshotTease, { color: colors.textSecondary }]}>
                        Today&apos;s energy: grounded, reflective, slow-but-steady.
                      </Text>
                      <View style={styles.horoscopeSnapshotAction}>
                        <Text style={[styles.horoscopeSnapshotLink, { color: colors.tint }]}>
                          View full horoscope
                        </Text>
                        <ChevronRight size={16} color={colors.tint} strokeWidth={2} />
                      </View>
                    </View>
                    <Sparkles size={24} color={colors.tint} strokeWidth={1.5} />
                  </TouchableOpacity>
                );
              }
              return null;
            })()}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Heart size={20} color={theme === 'dark' ? '#EF4444' : '#EF4444'} strokeWidth={2} fill={theme === 'dark' ? '#EF4444' : '#EF4444'} />
              <Text style={[styles.vaultSectionTitle, { color: colors.text }]}>Heart of the Vault</Text>
            </View>
            <Text style={[styles.vaultSectionSubtitle, { color: colors.textSecondary }]}>Your saved sparks, milestones, and favorite moments in one place.</Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.heartOfVaultScroll}
              style={styles.heartOfVaultScrollContainer}
            >
              {VAULT_CATEGORIES.map((category) => {
                const getIcon = () => {
                  switch (category.icon) {
                    case 'bookmark':
                      return <Bookmark size={28} color={category.color} />;
                    case 'images':
                      return <Images size={28} color={category.color} />;
                    case 'book-open':
                      return <BookOpen size={28} color={category.color} />;
                    case 'star':
                      return <Star size={28} color={category.color} />;
                    case 'flag':
                      return <Flag size={28} color={category.color} />;
                    default:
                      return <Bookmark size={28} color={category.color} />;
                  }
                };

                const handleCategoryPress = () => {
                  if (category.id === 'saved-sparks') {
                    router.push('/sparks/saved' as any);
                  } else if (category.id === 'shared-memories') {
                    router.push('/profile/shared-memories' as any);
                  } else if (category.id === 'my-journal') {
                    router.push('/profile/my-journal' as any);
                  } else if (category.id === 'milestones') {
                    router.push('/profile/milestones' as any);
                  } else if (category.id === 'favorites') {
                    router.push('/favorites' as any);
                  }
                };

                const savedSparksCount = userSparks.filter(us => us.status === 'saved').length;
                const savedInspoCount = postBookmarks.length;
                const savedGamesCount = 0;
                const journalEntriesCount = journalEntries.filter(entry => entry.category === 'journal').length;
                
                const calculateMilestonesCount = () => {
                  if (!profile) return 0;
                  let count = 0;
                  const completedSparks = userSparks.filter(us => us.status === 'completed').length;
                  const totalJournalEntries = journalEntries.length;
                  const hasIntentions = profile.intentions && profile.intentions.length > 0;
                  
                  if (profile.hasCompletedOnboarding) count++;
                  if (hasIntentions) count++;
                  if (completedSparks >= 1 && completedSparks < 10) count++;
                  if (totalJournalEntries >= 1 && totalJournalEntries < 5) count++;
                  
                  if (profile.anniversary) {
                    const anniversaryDate = new Date(profile.anniversary);
                    const now = new Date();
                    const yearsSince = now.getFullYear() - anniversaryDate.getFullYear();
                    if (yearsSince >= 1) count++;
                  }
                  
                  if (profile.totalXP >= 100) count++;
                  if (completedSparks >= 10) count++;
                  if (profile.streak >= 7) count++;
                  if (totalJournalEntries >= 5) count++;
                  if (profile.status === 'partnered' && profile.partnerGroupId) count++;
                  
                  return count;
                };
                
                let displayCount = category.count;
                if (category.id === 'saved-sparks') {
                  displayCount = savedSparksCount + savedInspoCount + savedGamesCount;
                } else if (category.id === 'my-journal') {
                  displayCount = journalEntriesCount;
                } else if (category.id === 'shared-memories') {
                  displayCount = journalEntries.filter(entry => entry.category === 'notes' || entry.category === 'love_letter' || entry.category === 'poems').length;
                } else if (category.id === 'milestones') {
                  displayCount = calculateMilestonesCount();
                } else if (category.id === 'favorites') {
                  displayCount = favoriteSparkIds.length + favoriteParqIds.length + favoritePostIds.length;
                }

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.heartOfVaultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    activeOpacity={0.7}
                    onPress={handleCategoryPress}
                  >
                    <View style={styles.heartOfVaultIconContainer}>
                      {getIcon()}
                    </View>
                    <Text style={[styles.heartOfVaultLabel, { color: colors.text }]}>{category.label}</Text>
                    <Text style={[styles.heartOfVaultSubtext, { color: colors.textSecondary }]}>{category.subtext}</Text>
                    {displayCount > 0 && (
                      <View style={[styles.heartOfVaultBadge, { backgroundColor: category.color + '20', borderColor: category.color }]}>
                        <Text style={[styles.heartOfVaultBadgeText, { color: category.color }]}>{displayCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.footerLogoContainer}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
            style={styles.footerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.footerCopyrightContainer}>
          <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
            © 2025 Spark&apos;d. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  pageDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.xs,
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
  profileButtonAbsolute: {
    position: 'absolute',
    zIndex: 10,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  vaultSection: {
    flex: 1,
  },
  vaultMantra: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginTop: SPACING.sm + 4,
    marginBottom: SPACING.md,
  },
  vaultJournalSection: {
    marginBottom: SPACING.xl,
  },
  notebookHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  vaultJournalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  journalCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  journalEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  journalDateText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  addJournalButton: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addJournalButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  vaultSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  vaultSectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  heartOfVaultScrollContainer: {
    marginTop: SPACING.xs,
  },
  heartOfVaultScroll: {
    gap: SPACING.md,
    paddingRight: SPACING.lg,
  },
  heartOfVaultCard: {
    width: 180,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    minHeight: 160,
  },
  heartOfVaultIconContainer: {
    marginBottom: SPACING.sm,
  },
  heartOfVaultLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
  },
  heartOfVaultSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  heartOfVaultBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  heartOfVaultBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  timelineContainer: {
    marginTop: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: SPACING.xs - 2,
  },
  timelineCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  timelineDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
  },
  timelineBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  timelineBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  timelineTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
    lineHeight: 20,
  },
  timelineSummary: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  timelineEmptyCard: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  timelineEmptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  timelineEmptyBody: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  decorativeDividerContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: SPACING.md,
  },
  decorativeDivider: {
    width: 200,
    height: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  footerLogoContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl * 1.275,
  },
  footerLogo: {
    width: 165.6,
    height: 49.68,
  },
  footerCopyrightContainer: {
    alignItems: 'center',
    paddingBottom: 0,
  },
  copyrightText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center' as const,
  },
  checkInCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    flexDirection: 'column',
  },
  checkInDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  checkInButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkInButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
  checkedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkedInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    flex: 1,
  },
  checkedInPillText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  horoscopeSnapshotCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  horoscopeSnapshotContent: {
    flex: 1,
  },
  horoscopeSnapshotTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
  },
  horoscopeSnapshotTease: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  horoscopeSnapshotAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  horoscopeSnapshotLink: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  checkInIcon: {
    width: 20,
    height: 20,
  },
});
