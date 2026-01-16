import React, { useState, useRef, Children, isValidElement } from 'react';
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

interface FlippableStoryCardProps {
  children: React.ReactNode;
  disabledTouchAreas?: React.ReactNode;
  borderRadius?: number;
  onFlipChange?: (isFlipped: boolean) => void;
  initiallyFlipped?: boolean;
}

export default function FlippableStoryCard({
  children,
  disabledTouchAreas,
  borderRadius = BORDER_RADIUS.lg,
  onFlipChange,
  initiallyFlipped = false,
}: FlippableStoryCardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(initiallyFlipped);
  const rotateAnim = useRef(new Animated.Value(initiallyFlipped ? 180 : 0)).current;
  const { colors } = useThemeStyles();

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 180;
    const newFlipState = !isFlipped;
    
    setIsFlipped(newFlipState);
    onFlipChange?.(newFlipState);
    
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

  const childArray = Children.toArray(children);
  const singleChild = childArray.length === 1 ? childArray[0] : <View>{children}</View>;

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
            <View style={styles.contentWrapper}>
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
  contentWrapper: {
    width: '100%',
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
    width: 331,
    height: 99,
    opacity: 0.8,
  },
});
