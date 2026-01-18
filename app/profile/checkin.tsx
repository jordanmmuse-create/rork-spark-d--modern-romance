import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import type { CheckInSection } from '@/types';
import { Sparkles, ChevronRight, Check } from 'lucide-react-native';

interface MetricSlider {
  key: CheckInSection;
  label: string;
  hint: string;
}

const ALL_METRICS: MetricSlider[] = [
  { key: 'overallMood', label: 'Overall Mood', hint: 'Low → High' },
  { key: 'stressLevel', label: 'Stress Level', hint: 'Calm → Overwhelmed' },
  { key: 'energyLevel', label: 'Energy Level', hint: 'Drained → Energized' },
  { key: 'emotionalBandwidth', label: 'Emotional Bandwidth', hint: 'Limited → Abundant' },
  { key: 'socialCapacity', label: 'Social Capacity', hint: 'Need Space → Ready to Connect' },
  { key: 'connected', label: 'Connected / Understood', hint: 'Distant → Close' },
  { key: 'safe', label: 'Safe / Secure', hint: 'Uncertain → Secure' },
  { key: 'respected', label: 'Respected / Heard', hint: 'Unheard → Valued' },
  { key: 'capacityToGive', label: 'Capacity to Give', hint: 'Empty → Full' },
  { key: 'needSupport', label: 'Need for Support', hint: 'Self-Sufficient → Need Help' },
];

const initialMetrics = {
  overallMood: 5,
  stressLevel: 5,
  energyLevel: 5,
  emotionalBandwidth: 5,
  socialCapacity: 5,
  connected: 5,
  safe: 5,
  respected: 5,
  capacityToGive: 5,
  needSupport: 5,
};

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useThemeStyles();
  const { addCheckIn, profile, checkIns } = useAppStore();
  const [values, setValues] = useState(initialMetrics);
  
  const selectedSections = profile?.checkInSections || ['overallMood', 'stressLevel', 'energyLevel'];
  const metrics = ALL_METRICS.filter(m => selectedSections.includes(m.key));
  
  const today = new Date().toISOString().split('T')[0];
  const todayCheckIn = checkIns.find(c => c.createdAt.split('T')[0] === today);
  const hasCheckedInToday = !!todayCheckIn;
  
  const [submitted, setSubmitted] = useState<boolean>(hasCheckedInToday);

  const handleSliderChange = (key: CheckInSection, value: number) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!hasCheckedInToday) {
      addCheckIn(values);
    }
    setSubmitted(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleViewHoroscope = () => {
    router.push('/profile/horoscope');
  };

  const astrologyEnabled = profile?.astrologyEnabled ?? false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Daily Check-In',
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!submitted ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Today&apos;s Check-In</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Use the sliders to capture how you feel right now.
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {metrics.map((metric, index) => (
                <View
                  key={metric.key}
                  style={[
                    styles.metricSection,
                    index < metrics.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <Text style={[styles.metricLabel, { color: colors.text }]}>{metric.label}</Text>
                    <Text style={[styles.metricValue, { color: colors.tint }]}>
                      {values[metric.key]}
                    </Text>
                  </View>
                  <Text style={[styles.metricHint, { color: colors.textSecondary }]}>
                    {metric.hint}
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={values[metric.key]}
                    onValueChange={(value) => handleSliderChange(metric.key, value)}
                    minimumTrackTintColor={colors.tint}
                    maximumTrackTintColor={theme === 'light' ? '#D2C1AE' : colors.border}
                    thumbTintColor={colors.tint}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Check-In</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.successCard, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
              <Check size={48} color={colors.success} strokeWidth={1.5} />
              <Text style={[styles.successTitle, { color: colors.success }]}>Check-In Saved</Text>
              <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                Your emotional snapshot has been recorded.
              </Text>
            </View>

            {astrologyEnabled && (
              <TouchableOpacity
                style={[styles.horoscopeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleViewHoroscope}
                activeOpacity={0.7}
              >
                <View style={styles.horoscopeIconContainer}>
                  <Sparkles size={28} color={colors.tint} strokeWidth={1.5} />
                </View>
                <View style={styles.horoscopeContent}>
                  <Text style={[styles.horoscopeTitle, { color: colors.text }]}>
                    Your Celestial Snapshot for Today
                  </Text>
                  <Text style={[styles.horoscopeTease, { color: colors.textSecondary }]}>
                    Today&apos;s energy: grounded, reflective, slow-but-steady.
                  </Text>
                  <View style={styles.horoscopeAction}>
                    <Text style={[styles.horoscopeLink, { color: colors.tint }]}>
                      View full horoscope
                    </Text>
                    <ChevronRight size={16} color={colors.tint} />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={[styles.doneButtonText, { color: colors.text }]}>Done</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  metricSection: {
    padding: SPACING.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  metricHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  submitButton: {
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  horoscopeCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.md,
  },
  horoscopeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  horoscopeContent: {
    flex: 1,
  },
  horoscopeTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  horoscopeTease: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  horoscopeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  horoscopeLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  doneButton: {
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  doneButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  successCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
