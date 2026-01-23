import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, RefreshCw, Send } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, getThemeTagColor } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import FlippableSparkCard from '@/components/FlippableSparkCard';
import SendSparkModal from '@/components/SendSparkModal';

export default function SparkDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSparks, saveSpark, unsaveSpark, isSparkSaved, swapSpark, profile, addJournalEntry } = useAppStore();
  const { colors } = useThemeStyles();
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(true);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const handleExitPage = async () => {
    if (isExiting) return;
    setIsExiting(true);
    console.log('Exit triggered - starting sequence');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTimeout(() => {
      console.log('Navigating back');
      router.back();
    }, 100);
  };
  
  const spark = getSparks().find((s) => s.id === id);
  
  if (!spark || !profile) {
    return null;
  }
  
  const areaTagColors = getThemeTagColor(FOCUS_AREA_INFO[spark.focusArea].title);
  
  const handleSendSparkPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowSendModal(true);
  };

  const handleSendSpark = (message: string) => {
    addJournalEntry({
      content: message,
      tags: ['spark'],
      sparkId: spark.id,
      category: 'notes',
      sendTarget: 'partner',
    });
    router.back();
  };

  const handleSwap = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    swapSpark();
    router.back();
  };

  const isSaved = isSparkSaved(spark.id);

  const handleToggleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (isSaved) {
      unsaveSpark(spark.id);
    } else {
      saveSpark(spark.id);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: colors.background }]}
        activeOpacity={0.7}
        onPress={handleExitPage}
      >
        <TouchableOpacity 
          style={[styles.customHeader, { backgroundColor: colors.backgroundSecondary, paddingTop: insets.top }]}
          activeOpacity={0.7}
          onPress={handleExitPage}
        >
          <View style={styles.headerContent} pointerEvents="none">
            {isCardFlipped ? (
              <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                {spark.title}
              </Text>
            ) : (
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
                style={{ width: 184, height: 59 }}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: SPACING.lg,
              paddingBottom: insets.bottom + SPACING.xl,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <FlippableSparkCard
            onFlipChange={setIsCardFlipped}
            disabledTouchAreas={
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, position: 'absolute', bottom: SPACING.sm + 2, left: SPACING.sm + 2, width: 48 }]}
                  onPress={handleSwap}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={18} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary, { backgroundColor: isSaved ? colors.tint + '20' : colors.backgroundSecondary, borderColor: isSaved ? colors.tint : colors.border, position: 'absolute', bottom: SPACING.sm + 2, left: SPACING.sm + 2 + 48 + SPACING.sm, width: 48 }]}
                  onPress={handleToggleSave}
                  activeOpacity={0.7}
                >
                  <Bookmark size={18} color={isSaved ? colors.tint : colors.text} fill={isSaved ? colors.tint : 'transparent'} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary, { backgroundColor: colors.tint, position: 'absolute', bottom: SPACING.sm + 2, right: SPACING.sm + 2, left: SPACING.sm + 2 + 48 + SPACING.sm + 48 + SPACING.sm }]}
                  onPress={handleSendSparkPress}
                  activeOpacity={0.8}
                >
                  <Send size={18} color="white" strokeWidth={2} />
                  <Text style={styles.actionButtonPrimaryText}>Send Spark?</Text>
                </TouchableOpacity>
              </>
            }
          >
            <View style={[styles.sparkCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                <Text
                  style={[
                    styles.focusText,
                    { color: areaTagColors.text },
                  ]}
                >
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
                <View style={[styles.starterBox, { backgroundColor: colors.backgroundSecondary, borderLeftColor: colors.tint }]}>
                  <Text style={[styles.starterText, { color: colors.text }]}>
                    &ldquo;{spark.starter}&rdquo;
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACTION SPARK</Text>
                <Text style={[styles.actionText, { color: colors.text }]}>{spark.action}</Text>
              </View>

              <View style={styles.actions} />
            </View>
          </FlippableSparkCard>
        </ScrollView>

      <SendSparkModal
        visible={showSendModal}
        conversationSpark={spark.starter}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendSpark}
      />
    </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
customHeader: {
    width: '100%',
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  sparkCard: {
    padding: SPACING.sm + 2,
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
  section: {
    marginBottom: SPACING.xs + 4,
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
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    height: SPACING.sm + 2 + SPACING.sm + 2 + SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  actionButtonSecondary: {
    borderWidth: 1,
    flex: 0.5,
  },
  actionButtonPrimary: {
    flex: 1.5,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonPrimaryText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
});
