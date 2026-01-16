import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Image,
  Easing,
} from 'react-native';
import { BORDER_RADIUS } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useAppStore } from '@/store/appStore';

interface FlippableSparkCardProps {
  children: React.ReactNode;
  disabledTouchAreas?: React.ReactNode;
  borderRadius?: number;
  onFlipChange?: (isLogoSideShowing: boolean) => void;
}

export default function FlippableSparkCard({
  children,
  disabledTouchAreas,
  borderRadius = BORDER_RADIUS.xl,
  onFlipChange,
}: FlippableSparkCardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(true);
  const rotateAnim = useRef(new Animated.Value(180)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;
  const { colors } = useThemeStyles();
  const hasSeenSparkFlipHint = useAppStore((state) => state.hasSeenSparkFlipHint);
  const markSparkFlipHintSeen = useAppStore((state) => state.markSparkFlipHintSeen);

  useEffect(() => {
    if (onFlipChange) {
      onFlipChange(isFlipped);
    }
  }, [isFlipped, onFlipChange]);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    const newFlipState = !isFlipped;
    
    if (isFlipped && !hasSeenSparkFlipHint) {
      markSparkFlipHintSeen();
      
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    setIsFlipped(newFlipState);
    
    Animated.timing(rotateAnim, {
      toValue,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const frontRotation = rotateAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = rotateAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = rotateAnim.interpolate({
    inputRange: [0, 90, 90.01, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = rotateAnim.interpolate({
    inputRange: [0, 90, 90.01, 180],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleFlip}>
        <View style={styles.cardWrapper}>
          <Animated.View
            style={[
              styles.cardFace,
              styles.frontFace,
              {
                transform: [{ perspective: 1200 }, { rotateY: frontRotation }],
                opacity: frontOpacity,
                borderRadius,
              },
            ]}
            pointerEvents={isFlipped ? 'none' : 'box-none'}
          >
            {children}
            {disabledTouchAreas && (
              <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                {disabledTouchAreas}
              </View>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.cardFace,
              styles.backFace,
              {
                transform: [{ perspective: 1200 }, { rotateY: backRotation }],
                opacity: backOpacity,
                borderRadius,
              },
            ]}
            pointerEvents={isFlipped ? 'auto' : 'none'}
          >
            <View style={[styles.backContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius }]}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
                style={styles.backLogo}
                resizeMode="contain"
              />
              {!hasSeenSparkFlipHint && (
                <Animated.Text 
                  style={[
                    styles.tapToRevealText, 
                    { color: colors.textSecondary, opacity: hintOpacity }
                  ]}
                >
                  Tap To Reveal
                </Animated.Text>
              )}
            </View>
          </Animated.View>
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
  frontFace: {
    position: 'relative',
    zIndex: 2,
  },
  backFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backLogo: {
    width: 381,
    height: 114,
    opacity: 0.8,
    zIndex: -1,
  },
  tapToRevealText: {
    position: 'absolute',
    bottom: 24,
    fontSize: 14,
    fontWeight: '500' as const,
    opacity: 0.7,
  },
});
