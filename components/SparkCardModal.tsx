import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, getThemeTagColor } from '@/constants/colors';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Spark } from '@/types';
import FlippableSparkCard from './FlippableSparkCard';
import SparkCardFooter from './SparkCardFooter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - SPACING.lg * 2, 400);

interface SparkCardModalProps {
  visible: boolean;
  spark: Spark | null;
  onBackdropPress: () => void;
  onClosed?: () => void;
  onLogoSideChange?: (isLogoSideShowing: boolean) => void;
  onPressBookmark?: (spark: Spark) => void;
  onPressSend?: (spark: Spark) => void;
  isBookmarked?: boolean;
  useNativeModal?: boolean;
}

export default function SparkCardModal({
  visible,
  spark,
  onBackdropPress,
  onClosed,
  onLogoSideChange,
  onPressBookmark,
  onPressSend,
  isBookmarked,
  useNativeModal = true,
}: SparkCardModalProps) {
  const { colors } = useThemeStyles();
  const opacity = useRef(new Animated.Value(0)).current;
  const isClosing = useRef(false);
  const canDismiss = useRef(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible && spark) {
      console.log('[SparkCardModal] Opening modal for spark:', spark.id);
      onLogoSideChange?.(true);
      isClosing.current = false;
      canDismiss.current = false;
      setShouldRender(true);
      opacity.setValue(0);

      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        console.log('[SparkCardModal] Fade in complete, enabling dismiss');
        canDismiss.current = true;
      });
    } else if (!visible && shouldRender && canDismiss.current) {
      console.log('[SparkCardModal] visible=false, starting fade out');
      if (isClosing.current) return;
      isClosing.current = true;

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          console.log('[SparkCardModal] Fade out complete, calling onClosed');
          setShouldRender(false);
          onClosed?.();
        }
      });
    }
  }, [visible, spark, shouldRender, opacity, onLogoSideChange, onClosed]);

  const handleBackdropPressInternal = useCallback(() => {
    if (!canDismiss.current) {
      console.log('[SparkCardModal] Dismiss blocked - animation not complete');
      return;
    }
    if (isClosing.current) {
      console.log('[SparkCardModal] Already closing, ignoring');
      return;
    }
    console.log('[SparkCardModal] Backdrop pressed, calling parent onBackdropPress');
    onBackdropPress();
  }, [onBackdropPress]);



  const handleCardContainerPress = useCallback(() => {
    console.log('[SparkCardModal] Card container pressed - blocking backdrop');
  }, []);

  const areaTagColors = useMemo(() => {
    if (!spark) {
      return getThemeTagColor('');
    }
    return getThemeTagColor(FOCUS_AREA_INFO[spark.focusArea].title);
  }, [spark]);

  const computedIsBookmarked = useMemo(() => {
    if (!spark) return false;
    return isBookmarked ?? false;
  }, [isBookmarked, spark]);

  const handleBookmarkPress = useCallback(() => {
    if (!spark) return;
    console.log('[SparkCardModal] Bookmark pressed for spark:', spark.id);
    onPressBookmark?.(spark);
  }, [onPressBookmark, spark]);

  const handleSendPress = useCallback(() => {
    if (!spark) return;
    console.log('[SparkCardModal] Send pressed for spark:', spark.id);
    onPressSend?.(spark);
  }, [onPressSend, spark]);

  const centerContainerStyle = useMemo(() => {
    return styles.centerContainer;
  }, []);

  if (!shouldRender || !spark) {
    return null;
  }

  const content = (
    <Animated.View style={[styles.root, { opacity }]}>
        <Pressable 
          style={styles.backdrop} 
          onPress={handleBackdropPressInternal}
        />
        
        <View 
          style={centerContainerStyle} 
          pointerEvents="box-none"
        >
          <Pressable
            onPress={handleCardContainerPress}
            style={styles.cardContainer}
          >
            <FlippableSparkCard
              onFlipChange={onLogoSideChange}
              disabledTouchAreas={
                <View style={styles.footerOverlay} pointerEvents="box-none" testID="spark-modal-footer">
                  <SparkCardFooter
                    spark={spark}
                    isBookmarked={computedIsBookmarked}
                    onPressBookmark={handleBookmarkPress}
                    onPressSend={handleSendPress}
                  />
                </View>
              }
            >
              <View style={[styles.sparkCard, { backgroundColor: colors.card, borderColor: colors.border }]} testID="spark-modal-card-content">
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
                      backgroundColor: areaTagColors.background,
                      borderColor: areaTagColors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text style={styles.focusEmoji}>
                    {FOCUS_AREA_INFO[spark.focusArea].emoji}
                  </Text>
                  <Text style={[styles.focusText, { color: areaTagColors.text }]}>
                    {FOCUS_AREA_INFO[spark.focusArea].title}
                  </Text>
                </View>

                <Text style={[styles.sparkTitle, { color: colors.text }]}>{spark.title}</Text>

                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>IDEA SPARK</Text>
                  <Text style={[styles.lessonText, { color: colors.text }]}>{spark.lesson}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CONVERSATION SPARK</Text>
                  <View
                    style={[
                      styles.starterBox,
                      {
                        backgroundColor: colors.surfaceInset || colors.backgroundSecondary,
                        borderLeftColor: colors.accent,
                      },
                    ]}
                  >
                    <Text style={[styles.starterText, { color: colors.text }]}>
                      &ldquo;{spark.starter}&rdquo;
                    </Text>
                  </View>
                </View>

                <View style={[styles.section, styles.actionSection]}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACTION SPARK</Text>
                  <Text style={[styles.actionText, { color: colors.text }]}>{spark.action}</Text>
                </View>

                <View style={styles.footerSpacer} />
              </View>
            </FlippableSparkCard>
          </Pressable>
        </View>
      </Animated.View>
  );

  if (useNativeModal) {
    return (
      <Modal
        visible={true}
        transparent
        animationType="none"
        onRequestClose={handleBackdropPressInternal}
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  cardContainer: {
    width: CARD_WIDTH,
    maxWidth: '100%',
  },
  sparkCard: {
    padding: SPACING.md,
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
  footerOverlay: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
  },
  footerSpacer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    height: SPACING.sm + 2 + SPACING.sm + 2 + SPACING.md,
  },
  section: {
    marginBottom: SPACING.sm,
  },
  actionSection: {
    marginBottom: 0,
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
});
