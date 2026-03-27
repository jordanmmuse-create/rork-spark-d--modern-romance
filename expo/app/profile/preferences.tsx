import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { Stack, router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ChevronRight,
  Plus,
  Trash2,
  X,
  Sparkles,
  Moon,
  Sun,
  ClipboardCheck,
} from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, FOCUS_AREA_COLORS } from '@/constants/colors';
import type { FocusArea, Tone } from '@/types';

const TONE_LABELS: Record<Tone, string> = {
  playful: 'Playful',
  practical: 'Practical',
  poetic: 'Poetic',
};

const getZodiacInfo = (birthday?: string): { sign: string; emoji: string } => {
  if (!birthday) return { sign: 'Not Set', emoji: '' };
  
  const date = new Date(birthday);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { sign: 'Aries', emoji: '♈' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { sign: 'Taurus', emoji: '♉' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { sign: 'Gemini', emoji: '♊' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { sign: 'Cancer', emoji: '♋' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { sign: 'Leo', emoji: '♌' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { sign: 'Virgo', emoji: '♍' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { sign: 'Libra', emoji: '♎' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { sign: 'Scorpio', emoji: '♏' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { sign: 'Sagittarius', emoji: '♐' };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { sign: 'Capricorn', emoji: '♑' };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { sign: 'Aquarius', emoji: '♒' };
  return { sign: 'Pisces', emoji: '♓' };
};

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors, theme } = useThemeStyles();
  const { profile, toggleFocusArea, updateGoals, toggleAstrology, toggleBadgeDisplay, badgeDisplayEnabled, setTheme } = useAppStore();
  const [showGoalsEditor, setShowGoalsEditor] = useState<boolean>(false);
  const [editedGoals, setEditedGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState<string>('');
  const initialFocusAreas = useRef<FocusArea[]>([]);

  useEffect(() => {
    if (profile) {
      initialFocusAreas.current = [...profile.focusAreas];
      console.log('[Preferences] Initial focus areas:', initialFocusAreas.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!profile) return;

      const removedAreas = initialFocusAreas.current.filter(
        area => !profile.focusAreas.includes(area)
      );

      console.log('[Preferences] Removed focus areas:', removedAreas);

      if (removedAreas.length > 0) {
        const updatedGoals = profile.goals.filter(goal => {
          const [category] = goal.split(':');
          return !removedAreas.includes(category as FocusArea);
        });

        console.log('[Preferences] Updating goals from', profile.goals.length, 'to', updatedGoals.length);
        console.log('[Preferences] Removed goals:', profile.goals.filter(g => !updatedGoals.includes(g)));

        if (updatedGoals.length !== profile.goals.length) {
          updateGoals(updatedGoals);
        }
      }
    });

    return unsubscribe;
  }, [navigation, profile, updateGoals]);

  if (!profile) return null;

  const allFocusAreas = Object.keys(FOCUS_AREA_INFO) as FocusArea[];
  const zodiacInfo = getZodiacInfo(profile.birthday);

  const handleToggleFocusArea = (area: FocusArea) => {
    toggleFocusArea(area);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEditGoals = () => {
    router.push('/profile/focus-areas-edit' as any);
  };

  const handleSaveGoals = () => {
    updateGoals(editedGoals.filter(g => g.trim().length > 0));
    setShowGoalsEditor(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim().length > 0) {
      setEditedGoals([...editedGoals, newGoal.trim()]);
      setNewGoal('');
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleRemoveGoal = (index: number) => {
    setEditedGoals(editedGoals.filter((_, i) => i !== index));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggleAstrology = (value: boolean) => {
    toggleAstrology(value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleToggleBadgeDisplay = (value: boolean) => {
    toggleBadgeDisplay(value);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Preferences',
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Content</Text>
          <View style={[styles.preferencesList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.preferenceItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/profile/tone')}
              activeOpacity={0.7}
            >
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>Tone</Text>
              <View style={styles.preferenceRight}>
                <Text style={[styles.preferenceValue, { color: colors.textSecondary }]}>
                  {TONE_LABELS[profile.tone]}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Focus Areas</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Tap to toggle areas you want to focus on
          </Text>
          <View style={styles.focusAreas}>
            {allFocusAreas.map((area) => (
              <TouchableOpacity
                key={area}
                onPress={() => handleToggleFocusArea(area)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.focusChip,
                    { 
                      backgroundColor: profile.focusAreas.includes(area)
                        ? FOCUS_AREA_COLORS[area] + '30'
                        : colors.surfaceAlt,
                      borderWidth: 2,
                      borderColor: profile.focusAreas.includes(area)
                        ? FOCUS_AREA_COLORS[area]
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.focusEmoji}>
                    {FOCUS_AREA_INFO[area].emoji}
                  </Text>
                  <Text
                    style={[
                      styles.focusText,
                      { 
                        color: profile.focusAreas.includes(area)
                          ? FOCUS_AREA_COLORS[area]
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {FOCUS_AREA_INFO[area].title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Growth Points</Text>
            <TouchableOpacity onPress={handleEditGoals} activeOpacity={0.7}>
              <Text style={[styles.editLink, { color: colors.tint }]}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.goalsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {profile.goals.map((goal, index) => {
              const displayText = goal.includes(':') ? goal.split(':')[1] : goal;
              return (
                <View key={index} style={styles.goalItem}>
                  <View style={[styles.goalBullet, { backgroundColor: colors.tint }]} />
                  <Text style={[styles.goalText, { color: colors.text }]}>{displayText}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Badge Display</Text>
          <View style={[styles.settingsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingHeader}>
                <Sparkles size={20} color={colors.tint} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Show Badges on Profile</Text>
              </View>
              <Switch
                value={badgeDisplayEnabled}
                onValueChange={handleToggleBadgeDisplay}
                trackColor={{ false: colors.border, true: colors.tint + '60' }}
                thumbColor={badgeDisplayEnabled ? colors.tint : colors.textSecondary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Toggle the visibility of your achievement badges on your profile.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Astrology</Text>
          
          <View style={[styles.settingsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.settingItem, { borderBottomColor: profile.astrologyEnabled ? colors.border : 'transparent', borderBottomWidth: profile.astrologyEnabled ? 1 : 0 }]}>
              <View style={styles.settingHeader}>
                <Sparkles size={20} color={colors.tint} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Astrology Features</Text>
              </View>
              <Switch
                value={profile.astrologyEnabled ?? false}
                onValueChange={handleToggleAstrology}
                trackColor={{ false: colors.border, true: colors.tint + '60' }}
                thumbColor={profile.astrologyEnabled ? colors.tint : colors.textSecondary}
                ios_backgroundColor={colors.border}
              />
            </View>

            {profile.astrologyEnabled && profile.birthday && (
              <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Zodiac Sign</Text>
                <Text style={[styles.zodiacText, { color: colors.tint }]}>
                  {zodiacInfo.emoji} {zodiacInfo.sign}
                </Text>
              </View>
            )}
          </View>

          {profile.astrologyEnabled && (
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              When enabled, you&apos;ll see horoscope insights after check-ins and personalized astrological guidance.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Check-In</Text>
          <View style={[styles.preferencesList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.preferenceItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/profile/checkin-config')}
              activeOpacity={0.7}
            >
              <View style={styles.settingHeader}>
                <ClipboardCheck size={20} color={colors.tint} strokeWidth={1.5} />
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>Set Check-In</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Customize which sections appear in your daily check-in.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.themeContainer}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: colors.card, borderColor: theme === 'dark' ? colors.tint : colors.border },
                theme === 'dark' && [styles.themeOptionActive, { backgroundColor: colors.tint + '10' }]
              ]}
              onPress={() => {
                setTheme('dark');
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              activeOpacity={0.7}
            >
              <Moon size={20} color={theme === 'dark' ? colors.tint : colors.textSecondary} />
              <Text style={[
                styles.themeText,
                { color: theme === 'dark' ? colors.tint : colors.textSecondary },
                theme === 'dark' && styles.themeTextActive
              ]}>Dark</Text>
              {theme === 'dark' && <View style={[styles.activeIndicator, { backgroundColor: colors.tint }]} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                { backgroundColor: colors.card, borderColor: theme === 'light' ? colors.tint : colors.border },
                theme === 'light' && [styles.themeOptionActive, { backgroundColor: colors.tint + '10' }]
              ]}
              onPress={() => {
                setTheme('light');
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              activeOpacity={0.7}
            >
              <Sun size={20} color={theme === 'light' ? colors.tint : colors.textSecondary} />
              <Text style={[
                styles.themeText,
                { color: theme === 'light' ? colors.tint : colors.textSecondary },
                theme === 'light' && styles.themeTextActive
              ]}>Light</Text>
              {theme === 'light' && <View style={[styles.activeIndicator, { backgroundColor: colors.tint }]} />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showGoalsEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalsEditor(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Your Growth Points</Text>
              <TouchableOpacity onPress={() => setShowGoalsEditor(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {editedGoals.map((goal, index) => (
                <View key={index} style={[styles.goalEditItem, { borderColor: colors.border }]}>
                  <Text style={[styles.goalEditText, { color: colors.text }]}>{goal}</Text>
                  <TouchableOpacity onPress={() => handleRemoveGoal(index)}>
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={[styles.addGoalContainer, { borderColor: colors.border }]}>
                <TextInput
                  style={[styles.addGoalInput, { color: colors.text }]}
                  placeholder="Add a new goal..."
                  placeholderTextColor={colors.textSecondary}
                  value={newGoal}
                  onChangeText={setNewGoal}
                  onSubmitEditing={handleAddGoal}
                />
                <TouchableOpacity onPress={handleAddGoal}>
                  <Plus size={24} color={colors.tint} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalSaveButton, { backgroundColor: colors.tint }]}
              onPress={handleSaveGoals}
            >
              <Text style={styles.modalSaveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  editLink: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs - 2,
  },
  focusEmoji: {
    fontSize: 14,
  },
  focusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  goalsList: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
    borderWidth: 1,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  goalText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  preferencesList: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  preferenceLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  preferenceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  preferenceValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  settingsList: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  zodiacText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    gap: SPACING.xs,
    position: 'relative',
  },
  themeOptionActive: {},
  themeText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  themeTextActive: {},
  activeIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalBody: {
    paddingHorizontal: SPACING.lg,
    maxHeight: 400,
  },
  goalEditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  goalEditText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  addGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  addGoalInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  modalSaveButton: {
    margin: SPACING.lg,
    padding: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
