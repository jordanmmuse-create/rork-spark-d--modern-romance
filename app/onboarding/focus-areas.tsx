import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { FocusArea } from '@/types';
import { FOCUS_AREA_INFO } from '@/constants/data';
import Colors, { FOCUS_AREA_COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

export default function FocusAreasScreen() {
  const insets = useSafeAreaInsets();
  const { onboardingData, updateOnboarding } = useAppStore();
  const [selectedAreas, setSelectedAreas] = useState<FocusArea[]>(
    onboardingData.focusAreas
  );

  const toggleArea = (area: FocusArea) => {
    setSelectedAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  const handleContinue = () => {
    updateOnboarding({ focusAreas: selectedAreas, step: 2 });
    router.push('/onboarding/goals' as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View
          style={[
            styles.headerBar,
            {
              paddingTop: insets.top,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => {
                console.log('[FocusAreas] Back pressed');
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              style={[styles.backButton, { borderColor: Colors.dark.border }]}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color={Colors.dark.text} strokeWidth={2.5} />
              <Text style={[styles.backButtonText, { color: Colors.dark.text }]}>Back</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: Colors.dark.text }]}>Focus Areas</Text>
            </View>

            <View style={styles.headerRight} />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { 
              paddingBottom: insets.bottom + SPACING.xl + 60 
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Choose your focus areas</Text>
            <Text style={styles.subtitle}>
              Pick 2-4 areas you want to strengthen. We&apos;ll tailor Sparks to
              what matters most to you.
            </Text>
          </View>

          <View style={styles.areas}>
            {(Object.keys(FOCUS_AREA_INFO) as FocusArea[]).map((area) => {
              const info = FOCUS_AREA_INFO[area];
              const isSelected = selectedAreas.includes(area);
              const areaColor = FOCUS_AREA_COLORS[area];

              return (
                <TouchableOpacity
                  key={area}
                  style={[
                    styles.areaCard,
                    isSelected && {
                      borderColor: areaColor,
                      backgroundColor: `${areaColor}20`,
                    },
                  ]}
                  onPress={() => toggleArea(area)}
                  activeOpacity={0.7}
                >
                  <View style={styles.areaHeader}>
                    <Text style={styles.areaEmoji}>{info.emoji}</Text>
                    <Text
                      style={[
                        styles.areaTitle,
                        isSelected && { color: areaColor },
                      ]}
                    >
                      {info.title}
                    </Text>
                  </View>
                  <Text style={styles.areaDescription}>
                    {info.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + SPACING.md }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.button,
              selectedAreas.length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedAreas.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedAreas.length > 0
                  ? [Colors.dark.tint, '#FF6B35']
                  : ['#444444', '#333333']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                Continue ({selectedAreas.length} selected)
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: Colors.dark.surface,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerRight: {
    minWidth: 44,
    height: 44,
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  areas: {
    gap: SPACING.md,
  },
  areaCard: {
    padding: SPACING.md + 2,
    backgroundColor: Colors.dark.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  areaEmoji: {
    fontSize: 26,
    marginRight: SPACING.sm,
  },
  areaTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
  },
  areaDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: Colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  button: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
});
