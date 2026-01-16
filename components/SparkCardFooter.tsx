import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Bookmark, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSparkSpeech } from '@/hooks/useSparkSpeech';
import { useAppStore } from '@/store/appStore';
import { Spark } from '@/types';

const getSpeakerIcon = () => {
  return (
    (LucideIcons as any).Volume2 ||
    (LucideIcons as any).Volume1 ||
    (LucideIcons as any).Volume
  );
};

export type SparkCardFooterProps = {
  spark: Spark;
  isBookmarked: boolean;
  onPressBookmark: () => void;
  onPressSend: () => void;
  sendLabel?: string;
  testID?: string;
};

function SparkCardFooterComponent({
  spark,
  isBookmarked,
  onPressBookmark,
  onPressSend,
  sendLabel = 'Send Spark?',
  testID,
}: SparkCardFooterProps) {
  const { colors } = useThemeStyles();
  const { isSpeaking, speakSpark } = useSparkSpeech();
  const sparkCardSpeechEnabled = useAppStore(s => s.sparkCardSpeechEnabled);
  const SpeakerIcon = useMemo(() => getSpeakerIcon(), []);

  console.log('[SparkCardFooter] SpeakerIcon chosen:', (SpeakerIcon as any)?.name ?? 'unknown');

  const handleBookmark = useCallback(() => {
    console.log('[SparkCardFooter] Bookmark pressed');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressBookmark();
  }, [onPressBookmark]);

  const handleSend = useCallback(() => {
    console.log('[SparkCardFooter] Send pressed');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPressSend();
  }, [onPressSend]);

  const handleSpeak = useCallback(() => {
    console.log('[SparkCardFooter] Speak pressed');
    speakSpark(spark);
  }, [speakSpark, spark]);

  return (
    <View style={styles.row} testID={testID ?? 'spark-card-footer'}>
      {sparkCardSpeechEnabled && (
        <TouchableOpacity
          testID="spark-card-footer-speak"
          style={[
            styles.iconButton,
            {
              backgroundColor: isSpeaking ? colors.tint + '20' : colors.backgroundSecondary,
              borderColor: isSpeaking ? colors.tint : colors.border,
            },
          ]}
          onPress={handleSpeak}
          activeOpacity={0.7}
        >
          <SpeakerIcon
            size={18}
            color={isSpeaking ? colors.tint : colors.text}
            strokeWidth={2}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        testID="spark-card-footer-bookmark"
        style={[
          styles.iconButton,
          {
            backgroundColor: isBookmarked ? colors.tint + '20' : colors.backgroundSecondary,
            borderColor: isBookmarked ? colors.tint : colors.border,
          },
        ]}
        onPress={handleBookmark}
        activeOpacity={0.7}
      >
        <Bookmark
          size={18}
          color={isBookmarked ? colors.tint : colors.text}
          fill={isBookmarked ? colors.tint : 'transparent'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        testID="spark-card-footer-send"
        style={[styles.sendButton, { backgroundColor: colors.tint }]}
        onPress={handleSend}
        activeOpacity={0.85}
      >
        <Send size={18} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.sendText}>{sendLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    flex: 1,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: SPACING.xs,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sendText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});

const SparkCardFooter = memo(SparkCardFooterComponent);
export default SparkCardFooter;
