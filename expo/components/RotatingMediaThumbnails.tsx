import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Play } from 'lucide-react-native';
import { SPACING, BORDER_RADIUS } from '@/constants/colors';
import { InspoPost } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_GAP = SPACING.sm;
const THUMBNAIL_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - THUMBNAIL_GAP * 2) / 3;

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop';

const SLOT_INITIAL_DELAYS = [10000, 20000, 30000];
const SLOT_INTERVAL = 30000;
const FADE_DURATION = 2000;

interface RotatingMediaThumbnailsProps {
  allPosts: InspoPost[];
  postIds: string[];
  onThumbnailPress: (story: InspoPost) => void;
  isPaused: boolean;
}

function isValidMediaPost(post: InspoPost | null | undefined): post is InspoPost {
  if (!post) return false;
  if (typeof post !== 'object') return false;
  if (!post.id) return false;
  if (post.hasMedia !== true) return false;
  const hasValidUrl = 
    (typeof post.mediaThumbnailUrl === 'string' && post.mediaThumbnailUrl.length > 0) ||
    (typeof post.mediaUrl === 'string' && post.mediaUrl.length > 0);
  return hasValidUrl;
}

export default function RotatingMediaThumbnails({
  allPosts,
  postIds,
  onThumbnailPress,
  isPaused,
}: RotatingMediaThumbnailsProps) {
  const validPosts = postIds
    .map(id => allPosts.find(p => p.id === id))
    .filter(isValidMediaPost);

  const [slotIndices, setSlotIndices] = useState<[number, number, number]>([0, 1, 2]);
  
  const nextFireAtRef = useRef<[number, number, number]>([0, 0, 0]);
  const remainingMsRef = useRef<[number, number, number]>([
    SLOT_INITIAL_DELAYS[0],
    SLOT_INITIAL_DELAYS[1],
    SLOT_INITIAL_DELAYS[2],
  ]);
  const timersRef = useRef<(ReturnType<typeof setTimeout> | null)[]>([null, null, null]);
  const hasStartedRef = useRef<boolean>(false);
  const wasPausedRef = useRef<boolean>(false);

  const fadeAnims = useRef<Animated.Value[]>([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const getNextIndex = useCallback((slotIndex: number, currentIndices: [number, number, number]): number => {
    if (validPosts.length <= 3) return currentIndices[slotIndex];
    
    const currentIndex = currentIndices[slotIndex];
    let nextIndex = (currentIndex + 1) % validPosts.length;
    
    const otherIndices = currentIndices.filter((_, i) => i !== slotIndex);
    let attempts = 0;
    while (otherIndices.includes(nextIndex) && attempts < validPosts.length) {
      nextIndex = (nextIndex + 1) % validPosts.length;
      attempts++;
    }
    
    return nextIndex;
  }, [validPosts.length]);

  const clearTimer = useCallback((slotIndex: number) => {
    if (timersRef.current[slotIndex]) {
      clearTimeout(timersRef.current[slotIndex]!);
      timersRef.current[slotIndex] = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    for (let i = 0; i < 3; i++) {
      clearTimer(i);
    }
  }, [clearTimer]);

  const scheduleSlot = useCallback((slotIndex: number) => {
    clearTimer(slotIndex);

    const now = Date.now();
    const delay = Math.max(50, nextFireAtRef.current[slotIndex] - now);

    console.log(`[RotatingThumbnails] Scheduling slot ${slotIndex} to fire in ${delay}ms`);

    timersRef.current[slotIndex] = setTimeout(() => {
      console.log(`[RotatingThumbnails] Slot ${slotIndex} firing at ${Date.now()}`);
      
      Animated.sequence([
        Animated.timing(fadeAnims[slotIndex], {
          toValue: 0,
          duration: FADE_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[slotIndex], {
          toValue: 1,
          duration: FADE_DURATION / 2,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setSlotIndices(prev => {
          const newIndices: [number, number, number] = [...prev];
          newIndices[slotIndex] = getNextIndex(slotIndex, prev);
          console.log(`[RotatingThumbnails] Slot ${slotIndex} changed: ${prev[slotIndex]} -> ${newIndices[slotIndex]}`);
          return newIndices;
        });
      }, FADE_DURATION / 2);

      const fireTime = Date.now();
      nextFireAtRef.current[slotIndex] = fireTime + SLOT_INTERVAL;
      remainingMsRef.current[slotIndex] = SLOT_INTERVAL;
      
      scheduleSlot(slotIndex);
    }, delay);
  }, [clearTimer, fadeAnims, getNextIndex]);

  const pauseAllSlots = useCallback(() => {
    const now = Date.now();
    
    for (let i = 0; i < 3; i++) {
      const remaining = Math.max(0, nextFireAtRef.current[i] - now);
      remainingMsRef.current[i] = remaining;
      clearTimer(i);
    }
    
    console.log('[RotatingThumbnails] PAUSED. Remaining ms per slot:', [...remainingMsRef.current]);
  }, [clearTimer]);

  const resumeAllSlots = useCallback(() => {
    const now = Date.now();
    
    for (let i = 0; i < 3; i++) {
      nextFireAtRef.current[i] = now + remainingMsRef.current[i];
    }
    
    console.log('[RotatingThumbnails] RESUMING. NextFireAt per slot:', nextFireAtRef.current.map(t => t - now));
    
    for (let i = 0; i < 3; i++) {
      scheduleSlot(i);
    }
  }, [scheduleSlot]);

  const startRotation = useCallback(() => {
    const now = Date.now();
    
    for (let i = 0; i < 3; i++) {
      nextFireAtRef.current[i] = now + SLOT_INITIAL_DELAYS[i];
      remainingMsRef.current[i] = SLOT_INITIAL_DELAYS[i];
    }
    
    console.log('[RotatingThumbnails] STARTING. Initial delays:', SLOT_INITIAL_DELAYS);
    
    for (let i = 0; i < 3; i++) {
      scheduleSlot(i);
    }
    
    hasStartedRef.current = true;
  }, [scheduleSlot]);

  useEffect(() => {
    if (validPosts.length <= 3) {
      console.log('[RotatingThumbnails] Not enough posts to rotate, skipping timers');
      return;
    }

    if (isPaused) {
      if (hasStartedRef.current && !wasPausedRef.current) {
        pauseAllSlots();
        wasPausedRef.current = true;
      }
      return;
    }

    if (!hasStartedRef.current) {
      startRotation();
      wasPausedRef.current = false;
    } else if (wasPausedRef.current) {
      resumeAllSlots();
      wasPausedRef.current = false;
    }

    return () => {
      clearAllTimers();
    };
  }, [isPaused, validPosts.length, startRotation, pauseAllSlots, resumeAllSlots, clearAllTimers]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  if (validPosts.length === 0) {
    return null;
  }

  const displayedPosts = slotIndices.map(idx => validPosts[idx]).filter(Boolean);

  return (
    <View style={styles.container}>
      {displayedPosts.map((post, slotIndex) => (
        <AnimatedThumbnailItem
          key={`slot-${slotIndex}`}
          story={post}
          index={slotIndex}
          onPress={onThumbnailPress}
          fadeAnim={fadeAnims[slotIndex]}
        />
      ))}
    </View>
  );
}

interface AnimatedThumbnailItemProps {
  story: InspoPost;
  index: number;
  onPress: (story: InspoPost) => void;
  fadeAnim: Animated.Value;
}

function AnimatedThumbnailItem({ story, index, onPress, fadeAnim }: AnimatedThumbnailItemProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!story || !story.id) {
    return null;
  }
  
  const thumbnailUri = story.mediaThumbnailUrl || story.mediaUrl || PLACEHOLDER_IMAGE;
  const showImage = !imageError && thumbnailUri !== PLACEHOLDER_IMAGE;

  return (
    <TouchableOpacity
      style={styles.thumbnailWrapper}
      onPress={() => {
        console.log('[RotatingThumbnails] Thumbnail pressed:', story.id, story.title);
        onPress(story);
      }}
      activeOpacity={0.8}
      testID={`rotating-thumbnail-${index}-${story.id}`}
    >
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {showImage ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            source={{ uri: PLACEHOLDER_IMAGE }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        {story.mediaType === 'video' && showImage && (
          <View style={styles.videoOverlay}>
            <View style={styles.playButton}>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </View>
        )}
        {showImage && <View style={styles.gradientOverlay} />}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: THUMBNAIL_GAP,
    marginTop: SPACING.sm,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  animatedContainer: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'transparent',
  },
});
