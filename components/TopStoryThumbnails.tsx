import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Play } from 'lucide-react-native';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { InspoPost } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_GAP = SPACING.sm;
const THUMBNAIL_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - THUMBNAIL_GAP * 2) / 3;

interface MediaThumbnailsProps {
  stories: InspoPost[];
  onThumbnailPress: (story: InspoPost) => void;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop';

function isValidMediaStory(story: InspoPost | null | undefined): story is InspoPost {
  if (!story) return false;
  if (typeof story !== 'object') return false;
  if (!story.id) return false;
  if (story.hasMedia !== true) return false;
  const hasValidUrl = 
    (typeof story.mediaThumbnailUrl === 'string' && story.mediaThumbnailUrl.length > 0) ||
    (typeof story.mediaUrl === 'string' && story.mediaUrl.length > 0);
  return hasValidUrl;
}

export default function MediaThumbnails({
  stories,
  onThumbnailPress,
}: MediaThumbnailsProps) {
  const safeStories = Array.isArray(stories) ? stories : [];
  const mediaStories = safeStories
    .filter(isValidMediaStory)
    .slice(0, 3);

  console.log('[MediaThumbnails] Rendering thumbnails:', mediaStories.length, mediaStories.map(s => ({ id: s.id, thumb: s.mediaThumbnailUrl, media: s.mediaUrl })));

  if (mediaStories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {mediaStories.map((story, index) => (
        <ThumbnailItem
          key={story.id}
          story={story}
          index={index}
          onPress={onThumbnailPress}
        />
      ))}
    </View>
  );
}

interface ThumbnailItemProps {
  story: InspoPost;
  index: number;
  onPress: (story: InspoPost) => void;
}

function ThumbnailItem({ story, index, onPress }: ThumbnailItemProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!story || !story.id) {
    console.warn('[ThumbnailItem] Invalid story object, skipping render');
    return null;
  }
  
  const thumbnailUri = story.mediaThumbnailUrl || story.mediaUrl || PLACEHOLDER_IMAGE;
  const showImage = !imageError && thumbnailUri !== PLACEHOLDER_IMAGE;

  return (
    <TouchableOpacity
      style={styles.thumbnailWrapper}
      onPress={() => {
        console.log('[MediaThumbnails] Thumbnail pressed:', story.id, story.title);
        onPress(story);
      }}
      activeOpacity={0.8}
      testID={`media-thumbnail-${index}-${story.id}`}
    >
      {showImage ? (
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
          onError={(e) => {
            console.log('[MediaThumbnails] Image load error:', story.id, e.nativeEvent);
            setImageError(true);
          }}
          onLoad={() => console.log('[MediaThumbnails] Image loaded:', story.id, thumbnailUri)}
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
    </TouchableOpacity>
  );
}

export { MediaThumbnails }

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
  fallbackThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  fallbackText: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
});
