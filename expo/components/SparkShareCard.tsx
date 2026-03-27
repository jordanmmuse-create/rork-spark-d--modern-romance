import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  LayoutChangeEvent,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import type { SparkShareContent } from '@/types';

interface SparkShareCardProps {
  sparkShare: SparkShareContent;
  isCompact?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  isOwnMessage?: boolean;
}

const SPARK_LOGO_ASSET = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/uahcbjuz3204xc7ekucrd';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_CARD_WIDTH = Math.min(180, SCREEN_WIDTH * 0.45);
const MIN_CARD_HEIGHT = 100;

export default function SparkShareCard({
  sparkShare,
  isCompact = false,
  showCloseButton = false,
  onClose,
  isOwnMessage = true,
}: SparkShareCardProps) {
  const { colors } = useThemeStyles();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [backHeight, setBackHeight] = useState(0);
  const [measured, setMeasured] = useState(false);

  const handleFlip = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const toValue = isFlipped ? 0 : 1;
    
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    
    setIsFlipped(!isFlipped);
    console.log('[SparkShareCard] Flipped to:', !isFlipped ? 'text side' : 'logo side');
  }, [isFlipped, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const cardWidth = MAX_CARD_WIDTH;
  const minCardHeight = isCompact ? MIN_CARD_HEIGHT : 120;
  const logoSideMinHeight = 100;
  // No max height - card grows to fit all content
  const cardHeight = measured ? Math.max(backHeight, logoSideMinHeight, minCardHeight) : minCardHeight;

  const handleBackLayout = useCallback((e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    if (height > 0 && height !== backHeight) {
      setBackHeight(height);
      setMeasured(true);
    }
  }, [backHeight]);

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      {showCloseButton && onClose && (
        <TouchableOpacity 
          style={[styles.closeButton, { backgroundColor: colors.error + '20' }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <X size={16} color={colors.error} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
      
      {/* Hidden measurement view for content side - measures actual text height */}
      <View 
        style={[styles.hiddenMeasure, { width: cardWidth - SPACING.md * 2 }]}
        pointerEvents="none"
        onLayout={handleBackLayout}
      >
        <Text style={styles.sparkTextMeasure}>
          {sparkShare.sparkText}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleFlip}
        style={[styles.cardWrapper, { height: cardHeight }]}
      >
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            frontAnimatedStyle,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              height: cardHeight,
            },
          ]}
        >
          <LinearGradient
            colors={[colors.glow, 'transparent']}
            style={styles.glowOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: sparkShare.sparkLogoAsset || SPARK_LOGO_ASSET }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
            {
              backgroundColor: isOwnMessage ? colors.tint : colors.card,
              borderColor: isOwnMessage ? colors.tint : colors.border,
              height: cardHeight,
            },
          ]}
        >
          <View style={styles.contentWrapper}>
            <Text
              style={[
                styles.sparkText,
                { color: isOwnMessage ? '#FFFFFF' : colors.text },
              ]}
            >
              {sparkShare.sparkText}
            </Text>
            {sparkShare.comment && (
              <View style={[styles.commentContainer, { borderTopColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : colors.border }]}>
                <Text
                  style={[
                    styles.commentText,
                    { color: isOwnMessage ? 'rgba(255,255,255,0.9)' : colors.textSecondary },
                  ]}
                >
                  {sparkShare.comment}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cardWrapper: {
    // perspective is handled via transform on native
  },
  hiddenMeasure: {
    position: 'absolute',
    opacity: 0,
    padding: SPACING.md,
    zIndex: -1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    padding: SPACING.md,
  },
  cardFront: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    justifyContent: 'center',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.2,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 210,
    height: 75,
  },
  sparkText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    fontStyle: 'italic' as const,
    flexShrink: 0,
  },
  sparkTextMeasure: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    fontStyle: 'italic' as const,
  },
  commentContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  commentText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
});
