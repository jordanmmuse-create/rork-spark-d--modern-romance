import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useTabScroll } from './_layout';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Lightbulb, ChevronLeft, ChevronRight, ChevronDown, Bookmark, Search, Send, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { INSPO_SECTIONS } from '@/constants/parq-data';
import { useAppStore } from '@/store/appStore';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY, getThemeTagColor } from '@/constants/colors';
import { HEADER_LAYOUT } from '@/constants/header';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { ParqType, InspoPost, ParqItem } from '@/types';
import FlippableParqCard from '@/components/FlippableParqCard';
import RandomStoryModal from '@/components/RandomStoryModal';
import { MediaThumbnails } from '@/components/TopStoryThumbnails';
import RotatingMediaThumbnails from '@/components/RotatingMediaThumbnails';
import { useCardSpeech } from '@/hooks/useCardSpeech';
import SendContentModal from '@/components/SendContentModal';

const SWEET_VALENTINES_ALL_POST_IDS = ['post-sv-1', 'post-sv-2', 'post-sv-3', 'post-sv-4', 'post-sv-5'];

const SECTION_THUMBNAIL_POST_IDS: Record<string, string[]> = {
  'sweet-valentines': ['post-sv-1', 'post-sv-2', 'post-sv-3'],
  'top-stories': ['post-3', 'post-5', 'post-9'],
  'weekly-curated': ['post-7', 'post-8', 'post-4'],
  'holiday-magic': ['post-31', 'post-32', 'post-33'],
  'date-night': ['post-45', 'post-46', 'post-49'],
  'meaningful-gestures': ['post-40', 'post-39', 'post-6'],
};

export default function InspoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useThemeStyles();
  
  const [selectedParqType, setSelectedParqType] = useState<ParqType>('prompt');
  const [currentParqIndex, setCurrentParqIndex] = useState<number>(0);
  const [isParqFlipped, setIsParqFlipped] = useState<boolean>(false);
  const [randomCardModalVisible, setRandomCardModalVisible] = useState(false);
  const [randomPost, setRandomPost] = useState<InspoPost | null>(null);
  const [sendParqModalVisible, setSendParqModalVisible] = useState(false);
  
  const scrollRef = useRef<ScrollView>(null);
  const { registerScroll } = useTabScroll();
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useEffect(() => {
    registerScroll('inspo', scrollRef);
  }, [registerScroll]);

  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      console.log('[Inspo] Screen focused');
      return () => {
        setIsScreenFocused(false);
        console.log('[Inspo] Screen unfocused');
      };
    }, [])
  );
  
  const getParqItems = useAppStore((state) => state.getParqItems);
  const toggleParqSave = useAppStore((state) => state.toggleParqSave);
  const savedParqIds = useAppStore((state) => state.savedParqIds);
  const parqCardSpeechEnabled = useAppStore((state) => state.parqCardSpeechEnabled);
  const getPosts = useAppStore((state) => state.getPosts);
  const togglePostLike = useAppStore((state) => state.togglePostLike);
  const togglePostBookmark = useAppStore((state) => state.togglePostBookmark);
  const isRandomPostLiked = useAppStore((state) => randomPost ? state.isPostLikedByUser(randomPost.id) : false);
  const isRandomPostBookmarked = useAppStore((state) => randomPost ? state.isPostBookmarkedByUser(randomPost.id) : false);
  
  
  const isValidMediaPost = (post: InspoPost | null | undefined): post is InspoPost => {
    if (!post || typeof post !== 'object' || !post.id) return false;
    if (post.hasMedia !== true) return false;
    const hasValidThumb = typeof post.mediaThumbnailUrl === 'string' && post.mediaThumbnailUrl.length > 0;
    const hasValidMedia = typeof post.mediaUrl === 'string' && post.mediaUrl.length > 0;
    return hasValidThumb || hasValidMedia;
  };

  const allPosts = useMemo(() => {
    try {
      const posts = getPosts();
      const safePosts = Array.isArray(posts) ? posts.filter(p => p && typeof p === 'object' && p.id) : [];
      console.log('[Inspo] Total posts available for randomizer:', safePosts.length);
      return safePosts;
    } catch (error) {
      console.error('[Inspo] Error getting posts:', error);
      return [];
    }
  }, [getPosts]);

  const deduplicatedSectionMedia = useMemo(() => {
    const result: Record<string, InspoPost[]> = {
      'sweet-valentines': [],
      'top-stories': [],
      'weekly-curated': [],
      'holiday-magic': [],
      'date-night': [],
      'meaningful-gestures': [],
    };

    const sectionOrder = ['sweet-valentines', 'top-stories', 'weekly-curated', 'holiday-magic', 'date-night', 'meaningful-gestures'];
    const globalUsedMedia = new Set<string>();

    const normalizeMediaKey = (url?: string): string => {
      if (!url) return '';
      return url.split('?')[0].trim();
    };

    for (const section of sectionOrder) {
      const postIds = SECTION_THUMBNAIL_POST_IDS[section] || [];
      const selected: InspoPost[] = [];

      for (const postId of postIds) {
        if (selected.length >= 3) break;

        const post = allPosts.find(p => p.id === postId);
        if (!post || !isValidMediaPost(post)) {
          console.log('[Inspo] Post not found or invalid media:', postId);
          continue;
        }

        const mediaKey = normalizeMediaKey(post.mediaThumbnailUrl || post.mediaUrl);
        if (mediaKey && globalUsedMedia.has(mediaKey)) {
          console.log('[Inspo] Skipping duplicate media for post:', postId, mediaKey);
          continue;
        }

        if (mediaKey) {
          globalUsedMedia.add(mediaKey);
        }
        selected.push(post);
      }

      result[section] = selected;
      console.log(`[Inspo] Section ${section} thumbnails:`, selected.length, selected.map(s => s.id));
    }

    return result;
  }, [allPosts])
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'sweet-valentines': false,
    'top-stories': true,
    'date-night': true,
    'weekly-curated': false,
    'holiday-magic': true,
    'meaningful-gestures': false,
  });
  
  const toggleSectionExpand = (slug: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedSections(prev => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };
  
  const isExpandableSection = (slug: string): boolean => {
    return ['sweet-valentines', 'top-stories', 'date-night', 'weekly-curated', 'holiday-magic', 'meaningful-gestures'].includes(slug);
  };
  
  const getMediaForSection = (slug: string): InspoPost[] => {
    return deduplicatedSectionMedia[slug] || [];
  };
  
  const allParqItems = getParqItems();
  const filteredParqItems = allParqItems.filter(item => item.type === selectedParqType);
  const currentParq = filteredParqItems[currentParqIndex];
  
  const { isSpeaking, speakText } = useCardSpeech();
  
  const SpeakerIcon = Volume2;
  
  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentParqIndex((prev) => (prev + 1) % filteredParqItems.length);
  };

  const handlePrevious = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentParqIndex((prev) => 
      prev === 0 ? filteredParqItems.length - 1 : prev - 1
    );
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (currentParq) {
      toggleParqSave(currentParq.id);
    }
  };
  
  const handleSpeak = () => {
    if (currentParq) {
      speakText(currentParq.id, currentParq.text);
    }
  };
  
  const handleSend = () => {
    console.log('[PARQ] Send tapped - opening modal');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSendParqModalVisible(true);
  };
  
  const handleSendParq = (message: string, attachmentUri?: string) => {
    console.log('[PARQ] Sending:', message);
    setSendParqModalVisible(false);
  };
  
  const getParqTypeColor = (type: ParqType): string => {
    switch (type) {
      case 'prompt':
        return '#60A5FA';
      case 'affirmation':
        return '#EF4444';
      case 'ritual':
        return '#FBBF24';
      case 'quote':
        return '#FF9500';
      default:
        return colors.tint;
    }
  };
  
  const getParqTypeLabel = (type: ParqType): string => {
    switch (type) {
      case 'prompt':
        return 'Prompt';
      case 'affirmation':
        return 'Affirmation';
      case 'ritual':
        return 'Routine';
      case 'quote':
        return 'Quote';
      default:
        return 'PARQ';
    }
  };
  
  const getAffirmationAdjective = (toneTag: string): string => {
    const tag = toneTag.toLowerCase();
    if (tag.endsWith('ed')) {
      return tag.slice(0, -2) + 'ing';
    }
    return tag;
  };
  
  const getArticle = (word: string): string => {
    const lower = word.toLowerCase();
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const silentHPrefixes = ['hon', 'hour'];
    const startsWithVowel = vowels.includes(lower.charAt(0));
    const startsWithSilentH = silentHPrefixes.some(prefix => lower.startsWith(prefix));
    return (startsWithVowel || startsWithSilentH) ? 'an' : 'a';
  };
  
  const getRoutineFrequency = (themeTags: string[]): string => {
    const frequencyTags = ['Daily', 'Weekly', 'Monthly'];
    const found = themeTags.find(tag => frequencyTags.includes(tag));
    return found ? found.toLowerCase() : 'daily';
  };
  
  const getRoutineTheme = (themeTags: string[]): string => {
    const frequencyTags = ['Daily', 'Weekly', 'Monthly'];
    const themeTag = themeTags.find(tag => !frequencyTags.includes(tag));
    return themeTag ? themeTag.toLowerCase() : 'connection';
  };
  
  const getSendParqInitialText = (parq: ParqItem): string => {
    return parq.text;
  };
  
  const getParqDefaultMessage = (parq: ParqItem): string => {
    switch (parq.type) {
      case 'prompt':
        return '';
      case 'affirmation': {
        const adj = getAffirmationAdjective(parq.toneTag);
        return `Here is an affirmation I find ${adj}!`;
      }
      case 'ritual': {
        const frequency = getRoutineFrequency(parq.themeTags);
        const theme = getRoutineTheme(parq.themeTags);
        return `Here's a ${frequency} routine I find useful for practicing ${theme}.`;
      }
      case 'quote': {
        const label = parq.toneTag.toLowerCase();
        const article = getArticle(label);
        return `Here is ${article} ${label} quote that made me think of you!`;
      }
      default:
        return '';
    }
  };
  
  const handleTypeChange = (type: ParqType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedParqType(type);
    setCurrentParqIndex(0);
  };
  
  const handleSectionPress = (sectionId: string | undefined, sectionSlug: string | undefined, isComingSoon: boolean | undefined) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isComingSoon || !sectionId || !sectionSlug) {
      console.log('[Inspo] Section press blocked - coming soon or missing data:', { sectionId, sectionSlug, isComingSoon });
      return;
    }
    
    try {
      if (sectionSlug === 'tell-story') {
        router.push('/inspo/submit-story' as any);
      } else {
        router.push({
          pathname: '/inspo/section/[id]' as any,
          params: { id: sectionId, slug: sectionSlug },
        } as any);
      }
    } catch (error) {
      console.error('[Inspo] Navigation error:', error);
    }
  };

  const isSaved = currentParq ? savedParqIds.includes(currentParq.id) : false;

  const handleRandomize = () => {
    console.log('[Inspo] 🎲 Randomize button pressed!');
    console.log('[Inspo] Available posts:', allPosts.length);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (allPosts.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPosts.length);
      console.log('[Inspo] Selected random post index:', randomIndex);
      setRandomPost(allPosts[randomIndex]);
      setRandomCardModalVisible(true);
    } else {
      console.log('[Inspo] No posts available to randomize');
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

  const handleThumbnailPress = (story: InspoPost) => {
    console.log('[Inspo] Thumbnail pressed, opening in randomizer modal:', story.id);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setRandomPost(story);
    setRandomCardModalVisible(true);
  };

  const getTypeColor = (type: ParqType) => {
    switch (type) {
      case 'quote':
        return '#FF9500';
      case 'affirmation':
        return '#EF4444';
      case 'ritual':
        return '#FBBF24';
      case 'prompt':
        return '#60A5FA';
      default:
        return Colors.dark.tint;
    }
  };

  const getTypeEmoji = (type: ParqType) => {
    switch (type) {
      case 'quote':
        return '💬';
      case 'affirmation':
        return '❤️';
      case 'ritual':
        return '🔁';
      case 'prompt':
        return '💭';
      default:
        return '✨';
    }
  };

  const typeColor = currentParq ? getTypeColor(currentParq.type) : Colors.dark.tint;
  const typeEmoji = currentParq ? getTypeEmoji(currentParq.type) : '✨';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="inspo-screen">
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Lightbulb size={28} color={colors.tint} strokeWidth={2} />
              <Text style={[styles.title, { color: colors.text }]}>Inspo</Text>
            </View>
            {isParqFlipped ? (
              <TouchableOpacity
                onPress={handleRandomize}
                style={styles.randomizerButton}
                activeOpacity={0.7}
              >
                <Text style={styles.diceEmoji}>🎲</Text>
              </TouchableOpacity>
            ) : (
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
                style={styles.logo}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your inspiration hub for modern romance
          </Text>
        </View>

        <View style={styles.mantraContainer}>
          <Text style={[styles.mantra, { color: colors.text }]}>
            A World of Ideas & Possibilities
          </Text>

          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/s2mpmwp6ta1lsxocbg37p' }}
            style={styles.divider}
            resizeMode="contain"
          />
        </View>

        <View style={styles.parqSection}>
          <View style={styles.parqHeader}>
            <View style={styles.parqHeaderContainer}>
              <Text style={styles.parqIcon}>💥</Text>
              <Text style={[styles.parqTitle, { color: colors.text }]}>PARQs of the Week!</Text>
            </View>
          </View>
          
          <View style={styles.typeSelector}>
            {(['prompt', 'affirmation', 'ritual', 'quote'] as ParqType[]).map((type) => {
              const typeLabels: Record<ParqType, string> = {
                prompt: 'Prompts',
                affirmation: 'Affirmations',
                ritual: 'Routines',
                quote: 'Quotes',
              };
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    selectedParqType === type && styles.typeButtonActive,
                    selectedParqType === type && {
                      backgroundColor: getTypeColor(type) + '20',
                      borderColor: getTypeColor(type),
                    },
                  ]}
                  onPress={() => handleTypeChange(type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: colors.textSecondary },
                      selectedParqType === type && styles.typeButtonTextActive,
                      selectedParqType === type && { color: getTypeColor(type) },
                    ]}
                  >
                    {typeLabels[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {currentParq && (
            <View style={styles.cardContainer}>
              <LinearGradient
                colors={[typeColor + '30', 'transparent']}
                style={styles.cardGlow}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              <FlippableParqCard
                borderRadius={BORDER_RADIUS.xl}
                onFlipChange={setIsParqFlipped}
                disabledTouchAreas={
                  <>
                    <View style={[styles.disabledTouchArea, styles.actionButtonsArea]} />
                  </>
                }
              >
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: typeColor + '20' },
                      ]}
                    >
                      <Text style={styles.typeEmoji}>{typeEmoji}</Text>
                      <Text style={[styles.typeText, { color: typeColor }]}>
                        {getParqTypeLabel(currentParq.type)}
                      </Text>
                    </View>
                    <Text style={[styles.toneText, { color: colors.textSecondary }]}>{currentParq.toneTag}</Text>
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={[styles.parqText, { color: colors.text }]}>{currentParq.text}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.actionButtons}>
                      {parqCardSpeechEnabled && (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: colors.backgroundSecondary },
                            isSpeaking && { borderColor: colors.tint, borderWidth: 2 },
                          ]}
                          onPress={handleSpeak}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <SpeakerIcon
                            size={15}
                            color={isSpeaking ? colors.tint : colors.textSecondary}
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={handleSave}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Bookmark
                          size={15}
                          color={isSaved ? colors.tint : colors.textSecondary}
                          fill={isSaved ? colors.tint : 'transparent'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={handleSend}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Send
                          size={15}
                          color={colors.textSecondary}
                          strokeWidth={2}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.tags}>
                      {currentParq.themeTags.slice(0, 2).map((tag, index) => {
                        const tagColors = getThemeTagColor(tag);
                        return (
                          <View
                            key={index}
                            style={[
                              styles.tag,
                              {
                                backgroundColor: tagColors.background,
                                borderColor: tagColors.border,
                                borderWidth: 1,
                              },
                            ]}
                          >
                            <Text style={[styles.tagText, { color: tagColors.text }]}>{tag}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </FlippableParqCard>

              <View style={styles.navigation}>
                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={handlePrevious}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={[styles.indicator, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.indicatorText, { color: colors.text }]}>
                    {currentParqIndex + 1} / {filteredParqItems.length}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.navButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={handleNext}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionsContainer}>
          <View style={styles.exploreTitleRow}>
            <Search size={18} color={colors.text} strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Explore…</Text>
          </View>
          <View style={styles.verticalSections}>
            {[
              INSPO_SECTIONS.find(s => s.slug === 'sweet-valentines'),
              INSPO_SECTIONS.find(s => s.slug === 'top-stories'),
              INSPO_SECTIONS.find(s => s.slug === 'weekly-curated'),
              INSPO_SECTIONS.find(s => s.slug === 'date-night'),
              INSPO_SECTIONS.find(s => s.slug === 'meaningful-gestures'),
              INSPO_SECTIONS.find(s => s.slug === 'holiday-magic'),
              INSPO_SECTIONS.find(s => s.slug === 'tell-story'),
            ].filter(Boolean).map((section) => {
              const isExpandable = isExpandableSection(section!.slug);
              const isExpanded = expandedSections[section!.slug] ?? false;
              const mediaStories = getMediaForSection(section!.slug);
              const hasMedia = mediaStories.length > 0;
              
              return (
                <View key={section!.id}>
                  <View style={[styles.sectionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TouchableOpacity
                      style={styles.sectionRowContent}
                      onPress={() => handleSectionPress(section!.id, section!.slug, section!.isComingSoon)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.sectionRowLeft}>
                        <Text style={styles.sectionRowEmoji}>{section!.emoji}</Text>
                        <Text style={[styles.sectionRowLabel, { color: colors.text }]}>{section!.label}</Text>
                      </View>
                    </TouchableOpacity>
                    {isExpandable && hasMedia ? (
                      <TouchableOpacity
                        style={styles.chevronButton}
                        onPress={() => toggleSectionExpand(section!.slug)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {isExpanded ? (
                          <ChevronDown size={20} color={colors.textSecondary} />
                        ) : (
                          <ChevronRight size={20} color={colors.textSecondary} />
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.chevronButton}
                        onPress={() => handleSectionPress(section!.id, section!.slug, section!.isComingSoon)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <ChevronRight size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {isExpandable && isExpanded && hasMedia && (
                    section!.slug === 'sweet-valentines' ? (
                      <RotatingMediaThumbnails
                        allPosts={allPosts}
                        postIds={SWEET_VALENTINES_ALL_POST_IDS}
                        onThumbnailPress={handleThumbnailPress}
                        isPaused={randomCardModalVisible || !isScreenFocused}
                      />
                    ) : (
                      <MediaThumbnails
                        stories={mediaStories}
                        onThumbnailPress={handleThumbnailPress}
                      />
                    )
                  )}
                </View>
              );
            })}
            <View style={[styles.sectionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.sectionRowContent}
                onPress={() => router.push('/inspo/all-categories' as any)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionRowLeft}>
                  <Text style={styles.sectionRowEmoji}>💡</Text>
                  <Text style={[styles.sectionRowLabel, { color: colors.text }]}>More!</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chevronButton}
                onPress={() => router.push('/inspo/all-categories' as any)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={[styles.comingSoonContainer, styles.lastSection]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Coming Soon</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionsScrollLast}
          >
            {INSPO_SECTIONS.filter(s => s.isComingSoon).sort((a, b) => a.sortOrder - b.sortOrder).map((section) => (
              <View
                key={section.id}
                style={[styles.sectionChip, { backgroundColor: colors.card, borderColor: colors.border }, styles.sectionChipDisabled]}
              >
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={[styles.sectionLabel, { color: colors.text }, styles.sectionLabelDisabled, { color: colors.textSecondary }]}>
                  {section.label}
                </Text>
                <View style={[styles.comingSoonBadge, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Soon</Text>
                </View>
              </View>
            ))}
          </ScrollView>
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
      
      <SendContentModal
        visible={sendParqModalVisible}
        onClose={() => setSendParqModalVisible(false)}
        onSend={handleSendParq}
        title="Send PARQ"
        categoryLabel={currentParq ? getParqTypeLabel(currentParq.type) : 'PARQ'}
        accentColor={currentParq ? getParqTypeColor(currentParq.type) : colors.tint}
        initialText={currentParq ? getSendParqInitialText(currentParq) : ''}
        mode="parq"
        parqType={currentParq?.type}
        parqDefaultMessage={currentParq ? getParqDefaultMessage(currentParq) : undefined}
      />
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 120,
    height: 36,
    marginRight: -SPACING.lg,
  },
  randomizerButton: {
    minWidth: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 0,
  },
  diceEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.textSecondary,
    marginBottom: SPACING.xs,
  },
  mantraContainer: {
    marginTop: SPACING.sm + 4,
    marginBottom: SPACING.xs,
  },
  mantra: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  divider: {
    width: 200,
    height: 12,
    alignSelf: 'center' as const,
    marginBottom: SPACING.md,
  },
  parqSection: {
    marginBottom: SPACING.xl,
  },
  parqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEADER_LAYOUT.FIRST_SECTION_HEADER_BOTTOM_MARGIN,
  },
  parqIcon: {
    fontSize: HEADER_LAYOUT.FIRST_SECTION_ICON_SIZE,
    lineHeight: HEADER_LAYOUT.FIRST_SECTION_ICON_SIZE,
  },
  exploreTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  parqHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  parqTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.sizes.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
    marginBottom: SPACING.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.textSecondary,
  },
  typeButtonTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs - 0.5,
  },
  cardContainer: {
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    borderRadius: BORDER_RADIUS.xl,
    opacity: 0.2,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 280,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  typeEmoji: {
    fontSize: 14,
  },
  typeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'capitalize' as const,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 3,
    flexShrink: 0,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  parqText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.text,
    lineHeight: 28,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: -14,
    paddingLeft: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flex: 1,
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.text,
  },
  toneText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  indicator: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  indicatorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
  },
  sectionsContainer: {
    marginBottom: SPACING.xl,
  },
  sectionsScroll: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  sectionChip: {
    backgroundColor: Colors.dark.card,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    minWidth: 120,
    maxWidth: 140,
  },
  sectionChipDisabled: {
    opacity: 0.5,
  },
  sectionEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs - 2,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  sectionLabelDisabled: {
    color: Colors.dark.textSecondary,
  },
  comingSoonBadge: {
    marginTop: SPACING.xs - 2,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BORDER_RADIUS.xs,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase' as const,
  },
  savedSection: {
    backgroundColor: Colors.dark.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs - 2,
  },
  savedTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
  },
  savedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  verticalSections: {
    gap: SPACING.sm,
  },
  sectionRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.dark.card,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionRowLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.md,
  },
  sectionRowEmoji: {
    fontSize: 24,
  },
  sectionRowLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
  },
  sectionRowArrow: {
    fontSize: 24,
    color: Colors.dark.textSecondary,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  sectionRowContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  chevronButton: {
    padding: SPACING.xs,
    marginRight: -SPACING.xs,
  },
  chevronIcon: {
    marginRight: 0,
  },
  comingSoonContainer: {
    marginBottom: SPACING.xl,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionsScrollLast: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
    paddingBottom: 0,
  },
  disabledTouchArea: {
    position: 'absolute' as const,
    zIndex: 10,
  },
  actionButtonsArea: {
    bottom: SPACING.xl,
    left: SPACING.xl,
    width: 110,
    height: 32,
  },
  saveButtonArea: {
    bottom: SPACING.xl,
    left: SPACING.xl,
    width: 36,
    height: 36,
  },
});
