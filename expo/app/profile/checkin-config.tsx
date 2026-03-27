import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import type { CheckInSection } from '@/types';

interface CheckInOption {
  key: CheckInSection;
  label: string;
  description: string;
}

const CHECK_IN_OPTIONS: CheckInOption[] = [
  { key: 'overallMood', label: 'Overall Mood', description: 'How you feel overall' },
  { key: 'stressLevel', label: 'Stress Level', description: 'Current stress intensity' },
  { key: 'energyLevel', label: 'Energy Level', description: 'Physical and mental energy' },
  { key: 'emotionalBandwidth', label: 'Emotional Bandwidth', description: 'Capacity to process emotions' },
  { key: 'socialCapacity', label: 'Social Capacity', description: 'Desire for social interaction' },
  { key: 'connected', label: 'Connected / Understood', description: 'Feeling seen and heard' },
  { key: 'safe', label: 'Safe / Secure', description: 'Emotional security level' },
  { key: 'respected', label: 'Respected / Heard', description: 'Feeling valued' },
  { key: 'capacityToGive', label: 'Capacity to Give', description: 'Ability to support others' },
  { key: 'needSupport', label: 'Need for Support', description: 'Desire for help from others' },
];

export default function CheckInConfigScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { profile, updateCheckInSections } = useAppStore();
  
  const [selectedSections, setSelectedSections] = useState<CheckInSection[]>(
    profile?.checkInSections || ['overallMood', 'stressLevel', 'energyLevel']
  );

  const handleToggle = (section: CheckInSection) => {
    if (selectedSections.includes(section)) {
      if (selectedSections.length > 1) {
        setSelectedSections(selectedSections.filter(s => s !== section));
      }
    } else {
      setSelectedSections([...selectedSections, section]);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = () => {
    updateCheckInSections(selectedSections);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Set Check-In',
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Customize Your Check-In
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select the sections you want to track in your daily check-in. You must choose at least one section.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {CHECK_IN_OPTIONS.map((option, index) => {
            const isSelected = selectedSections.includes(option.key);
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.tint : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleToggle(option.key)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: colors.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: colors.tint }]}>
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + SPACING.md,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            Save Changes ({selectedSections.length} selected)
          </Text>
        </TouchableOpacity>
      </View>
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
  optionsContainer: {
    gap: SPACING.md,
  },
  optionCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});
