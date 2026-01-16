import React, { useState, useRef, useCallback, useEffect, Children, isValidElement } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Image,
  Easing,
  LayoutChangeEvent,
  Text,
} from 'react-native';
import { Play, ImageOff } from 'lucide-react-native';
import { BORDER_RADIUS } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';

type FlipState = 'logo' | 'media' | 'content';

interface FlippableMediaStoryCardProps {
  children: React.ReactNode;
  disabledTouchAreas?: React.ReactNode;
  borderRadius?: number;
  onFlipChange?: (state: FlipState) => void;
  initialState?: FlipState;
  hasMedia?: boolean;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  storyId?: string;
  visible?: boolean;
}

const MIN_CARD_HEIGHT = 280;

export default function FlippableMediaStoryCard({
  children,
  disabledTouchAreas,
  borderRadius = BORDER_RADIUS.lg,
  onFlipChange,
  initialState = 'logo',
  hasMedia = false,
  mediaType = 'image',
  mediaUrl,
  storyId,
  visible = true,
}: FlippableMediaStoryCardProps) {
  const [flipState, setFlipState] = useState<FlipState>(initialState);
  const [contentHeight, setContentHeight] = useState<number>(MIN_CARD_HEIGHT);
  const [mediaFailed, setMediaFailed] = useState<boolean>(false);
  const rotateAnim = useRef(new Animated.Value(getRotationForState(initialState))).current;
  const { colors } = useThemeStyles();

  const cardHeight = Math.max(contentHeight, MIN_CARD_HEIGHT);

  useEffect(() => {
    console.log('[FlippableMediaStoryCard] Reset triggered - visible:', visible, 'storyId:', storyId, 'mediaUrl:', mediaUrl);
    if (visible) {
      setFlipState('content');
      rotateAnim.setValue(180);
      setMediaFailed(false);
    }
  }, [visible, storyId, rotateAnim, mediaUrl]);

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    console.log('[FlippableMediaStoryCard] Content measured height:', height);
    if (height > 0) {
      setContentHeight(height);
    }
  }, []);

  function getRotationForState(state: FlipState): number {
    switch (state) {
      case 'logo':
        return 0;
      case 'content':
        return 180;
      case 'media':
        return 360;
      default:
        return 0;
    }
  }

  function getNextState(current: FlipState): FlipState {
    if (!hasMedia) {
      return current === 'logo' ? 'content' : 'logo';
    }
    switch (current) {
      case 'logo':
        return 'content';
      case 'content':
        return 'media';
      case 'media':
        return 'logo';
      default:
        return 'logo';
    }
  }

  const handleFlip = () => {
    const nextState = getNextState(flipState);
    const toValue = getRotationForState(nextState);
    
    setFlipState(nextState);
    onFlipChange?.(nextState);
    
    Animated.timing(rotateAnim, {
      toValue,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const logoRotation = rotateAnim.interpolate({
    inputRange: [0, 180, 360],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  const contentRotation = rotateAnim.interpolate({
    inputRange: [0, 180, 360],
    outputRange: ['180deg', '360deg', '540deg'],
  });

  const mediaRotation = rotateAnim.interpolate({
    inputRange: [0, 180, 360],
    outputRange: ['360deg', '540deg', '720deg'],
  });

  const logoOpacity = rotateAnim.interpolate({
    inputRange: [0, 89, 90, 360],
    outputRange: [1, 1, 0, 0],
  });

  const contentOpacity = rotateAnim.interpolate({
    inputRange: [0, 89, 90, 269, 270, 360],
    outputRange: [0, 0, 1, 1, 0, 0],
  });

  const mediaOpacity = rotateAnim.interpolate({
    inputRange: [0, 269, 270, 360],
    outputRange: [0, 0, 1, 1],
  });

  const childArray = Children.toArray(children);
  const singleChild = childArray.length === 1 ? childArray[0] : <View>{children}</View>;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleFlip}>
        <View style={[styles.cardWrapper, { minHeight: cardHeight }]}>
          <Animated.View
            style={[
              styles.cardFace,
              styles.logoFace,
              {
                transform: [{ perspective: 1200 }, { rotateY: logoRotation }],
                opacity: logoOpacity,
                borderRadius,
                height: cardHeight,
              },
            ]}
            pointerEvents={flipState === 'logo' ? 'auto' : 'none'}
          >
            <View style={[styles.logoContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius, height: cardHeight }]}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {hasMedia && mediaUrl && (
            <Animated.View
              style={[
                styles.cardFace,
                styles.mediaFace,
                {
                  transform: [{ perspective: 1200 }, { rotateY: mediaRotation }],
                  opacity: mediaOpacity,
                  borderRadius,
                  height: cardHeight,
                },
              ]}
              pointerEvents={flipState === 'media' ? 'auto' : 'none'}
            >
              <View style={[styles.mediaContent, { borderRadius, height: cardHeight }]}>
                {mediaFailed ? (
                  <View style={[styles.mediaFallback, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius, height: cardHeight }]}>
                    <ImageOff size={48} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.mediaFallbackText, { color: colors.textSecondary }]}>Media unavailable</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: mediaUrl }}
                    style={[styles.mediaImage, { height: cardHeight }]}
                    resizeMode="cover"
                    onError={(e) => {
                      console.log('[FlippableMediaStoryCard] Image load error:', storyId, e.nativeEvent);
                      setMediaFailed(true);
                    }}
                    onLoad={() => console.log('[FlippableMediaStoryCard] Image loaded:', storyId, mediaUrl)}
                  />
                )}
                {mediaType === 'video' && !mediaFailed && (
                  <View style={styles.videoOverlay}>
                    <View style={styles.playButton}>
                      <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.cardFace,
              styles.contentFace,
              {
                transform: [{ perspective: 1200 }, { rotateY: contentRotation }],
                opacity: contentOpacity,
                borderRadius,
              },
            ]}
            pointerEvents={flipState === 'content' ? 'box-none' : 'none'}
          >
            <View style={styles.contentWrapper} onLayout={handleContentLayout}>
              {singleChild}
              {disabledTouchAreas && (
                <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                  {isValidElement(disabledTouchAreas) ? (
                    <View
                      onStartShouldSetResponder={() => true}
                      onResponderRelease={() => {}}
                    >
                      {disabledTouchAreas}
                    </View>
                  ) : disabledTouchAreas}
                </View>
              )}
            </View>
          </Animated.View>

          {/* Hidden measurement view - always mounted to measure content height */}
          <View style={styles.hiddenMeasure} pointerEvents="none">
            <View onLayout={handleContentLayout}>
              {singleChild}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardWrapper: {
    position: 'relative',
    width: '100%',
  },
  cardFace: {
    width: '100%',
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  logoFace: {
    position: 'relative',
    zIndex: 3,
  },
  mediaFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  contentFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  contentWrapper: {
    width: '100%',
  },
  logoContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 331,
    height: 99,
    opacity: 0.8,
  },
  mediaContent: {
    width: '100%',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
  },
  mediaFallback: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mediaFallbackText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  hiddenMeasure: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
  },
});
