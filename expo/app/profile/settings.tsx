import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  ChevronRight,
  X,
  Lock,
  MessageCircle,
  Eye,
  MapPin,
  Volume2,
} from 'lucide-react-native';
import DatePickerModal from '@/components/DatePickerModal';
import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import type { RelationshipStatus } from '@/types';

const STATUSES: RelationshipStatus[] = ['single', 'dating', 'partnered', 'complicated'];

const STATUS_LABELS: Record<RelationshipStatus, string> = {
  single: 'Single',
  dating: 'Dating',
  partnered: 'In A Relationship',
  complicated: 'It\'s Complicated',
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { profile, updateProfile, updateStatus, sparkCardSpeechEnabled, setSparkCardSpeechEnabled, parqCardSpeechEnabled, setParqCardSpeechEnabled } = useAppStore();
  const [activeDatePicker, setActiveDatePicker] = useState<'birthday' | 'partner' | 'anniversary' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showStatusPicker, setShowStatusPicker] = useState<boolean>(false);
  const [showNameEditor, setShowNameEditor] = useState<boolean>(false);
  const [showUsernameEditor, setShowUsernameEditor] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');
  const [editedUsername, setEditedUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [showProfilePrivacyPicker, setShowProfilePrivacyPicker] = useState<boolean>(false);
  const [showStoriesPrivacyPicker, setShowStoriesPrivacyPicker] = useState<boolean>(false);
  const [showLocationEditor, setShowLocationEditor] = useState<boolean>(false);
  const [editedLocation, setEditedLocation] = useState<string>('');

  if (!profile) return null;

  const validateUsername = (value: string): boolean => {
    if (value.length === 0) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 3 || value.length > 20) {
      setUsernameError('Username must be 3-20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Letters, numbers, and underscores only');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleUsernameChange = (value: string) => {
    setEditedUsername(value);
    validateUsername(value);
  };

  const handleSelectStatus = (status: RelationshipStatus) => {
    updateStatus(status);
    setShowStatusPicker(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveName = () => {
    if (editedName.trim().length > 0) {
      updateProfile({ name: editedName.trim(), displayName: editedName.trim() });
      setShowNameEditor(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleSaveUsername = () => {
    if (validateUsername(editedUsername)) {
      updateProfile({ username: editedUsername });
      setShowUsernameEditor(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleDateConfirm = (date: Date) => {
    if (activeDatePicker === 'birthday') {
      updateProfile({ birthday: date.toISOString() });
    } else if (activeDatePicker === 'partner') {
      updateProfile({ partnerBirthday: date.toISOString() });
    } else if (activeDatePicker === 'anniversary') {
      updateProfile({ anniversary: date.toISOString() });
    }
    
    setActiveDatePicker(null);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDateClear = () => {
    if (activeDatePicker === 'partner') {
      updateProfile({ partnerBirthday: undefined });
    } else if (activeDatePicker === 'anniversary') {
      updateProfile({ anniversary: undefined });
    }
    
    setActiveDatePicker(null);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getDatePickerTitle = () => {
    if (activeDatePicker === 'birthday') return 'Select Your Birthday';
    if (activeDatePicker === 'partner') return "Select Partner's Birthday";
    return 'Select Anniversary Date';
  };

  const openDatePicker = (type: 'birthday' | 'partner' | 'anniversary') => {
    let initialDate = new Date();
    
    if (type === 'birthday' && profile.birthday) {
      initialDate = new Date(profile.birthday);
    } else if (type === 'partner' && profile.partnerBirthday) {
      initialDate = new Date(profile.partnerBirthday);
    } else if (type === 'anniversary' && profile.anniversary) {
      initialDate = new Date(profile.anniversary);
    }
    
    setTempDate(initialDate);
    setActiveDatePicker(type);
  };

  const formatBirthday = (birthday?: string): string => {
    if (!birthday) return 'Not Set';
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Settings',
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
          
          <View style={[styles.settingsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setEditedName(profile.name || '');
                setShowNameEditor(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.settingLabel, { color: colors.text }]}>Name</Text>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {profile.name || 'Not Set'}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setEditedUsername(profile.username || '');
                setUsernameError('');
                setShowUsernameEditor(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.settingLabel, { color: colors.text }]}>Username</Text>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {profile.username || 'Not Set'}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => openDatePicker('birthday')}
              activeOpacity={0.7}
            >
              <View style={styles.settingHeader}>
                <Calendar size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Birthday</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {formatBirthday(profile.birthday)}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => openDatePicker('partner')}
              activeOpacity={0.7}
            >
              <View style={styles.settingHeader}>
                <Calendar size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Partner&apos;s Birthday</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {formatBirthday(profile.partnerBirthday)}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => openDatePicker('anniversary')}
              activeOpacity={0.7}
            >
              <View style={styles.settingHeader}>
                <Calendar size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Anniversary</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {formatBirthday(profile.anniversary)}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                setEditedLocation(profile.location || '');
                setShowLocationEditor(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingHeader}>
                <MapPin size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Location</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {profile.location || 'Not Set'}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => setShowProfilePrivacyPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingHeader}>
                <Eye size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {profile.profilePrivacy === 'private' ? 'Private' : 'Public'}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationship</Text>
          <View style={[styles.settingsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => setShowStatusPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.settingLabel, { color: colors.text }]}>Relationship Status</Text>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {STATUS_LABELS[profile.status]}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Read + Speech</Text>
          <View style={[styles.settingsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingHeader}>
                <Volume2 size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Spark Cards</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: sparkCardSpeechEnabled ? colors.tint : colors.border },
                ]}
                onPress={() => {
                  setSparkCardSpeechEnabled(!sparkCardSpeechEnabled);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { backgroundColor: '#FFFFFF' },
                    sparkCardSpeechEnabled && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <View style={styles.settingHeader}>
                <Volume2 size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>PARQ Cards</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: parqCardSpeechEnabled ? colors.tint : colors.border },
                ]}
                onPress={() => {
                  setParqCardSpeechEnabled(!parqCardSpeechEnabled);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { backgroundColor: '#FFFFFF' },
                    parqCardSpeechEnabled && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shared Stories</Text>
          <View style={[styles.settingsList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingHeader}>
                <MessageCircle size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Comments</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: profile.sharedStoriesCommentsEnabled !== false ? colors.tint : colors.border },
                ]}
                onPress={() => {
                  updateProfile({ sharedStoriesCommentsEnabled: profile.sharedStoriesCommentsEnabled === false });
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { backgroundColor: '#FFFFFF' },
                    profile.sharedStoriesCommentsEnabled !== false && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => setShowStoriesPrivacyPicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.settingHeader}>
                <Lock size={20} color={colors.text} strokeWidth={1.5} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {profile.sharedStoriesPrivacy === 'anonymous'
                    ? 'Anonymous'
                    : profile.sharedStoriesPrivacy === 'variable'
                    ? 'Variable'
                    : 'Credited'}
                </Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <DatePickerModal
        visible={activeDatePicker !== null}
        value={tempDate}
        title={getDatePickerTitle()}
        onConfirm={handleDateConfirm}
        onCancel={() => setActiveDatePicker(null)}
        onChange={setTempDate}
        onClear={handleDateClear}
        maximumDate={new Date()}
        minimumDate={new Date(1920, 0, 1)}
        showClearButton={activeDatePicker === 'partner' || activeDatePicker === 'anniversary'}
        clearButtonText="No Selection"
      />

      <Modal
        visible={showProfilePrivacyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfilePrivacyPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowProfilePrivacyPicker(false)}
        >
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Profile Privacy</Text>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                { borderBottomColor: colors.border },
                profile.profilePrivacy !== 'private' && { backgroundColor: colors.tint + '10' },
              ]}
              onPress={() => {
                updateProfile({ profilePrivacy: 'public' });
                setShowProfilePrivacyPicker(false);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text style={[
                styles.pickerOptionText,
                { color: profile.profilePrivacy !== 'private' ? colors.tint : colors.text },
              ]}>
                Public
              </Text>
              <Text style={[styles.pickerOptionDescription, { color: colors.textSecondary }]}>
                Profile is visible to non-friends / non-followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                profile.profilePrivacy === 'private' && { backgroundColor: colors.tint + '10' },
              ]}
              onPress={() => {
                updateProfile({ profilePrivacy: 'private' });
                setShowProfilePrivacyPicker(false);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text style={[
                styles.pickerOptionText,
                { color: profile.profilePrivacy === 'private' ? colors.tint : colors.text },
              ]}>
                Private
              </Text>
              <Text style={[styles.pickerOptionDescription, { color: colors.textSecondary }]}>
                Profile is only visible to approved connections
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showStoriesPrivacyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStoriesPrivacyPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowStoriesPrivacyPicker(false)}
        >
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Shared Stories Privacy</Text>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                { borderBottomColor: colors.border },
                (profile.sharedStoriesPrivacy !== 'anonymous' && profile.sharedStoriesPrivacy !== 'variable') && { backgroundColor: colors.tint + '10' },
              ]}
              onPress={() => {
                updateProfile({ sharedStoriesPrivacy: 'credited' });
                setShowStoriesPrivacyPicker(false);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text style={[
                styles.pickerOptionText,
                { color: (profile.sharedStoriesPrivacy !== 'anonymous' && profile.sharedStoriesPrivacy !== 'variable') ? colors.tint : colors.text },
              ]}>
                Credited
              </Text>
              <Text style={[styles.pickerOptionDescription, { color: colors.textSecondary }]}>
                Stories always show your current username
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                { borderBottomColor: colors.border },
                profile.sharedStoriesPrivacy === 'anonymous' && { backgroundColor: colors.tint + '10' },
              ]}
              onPress={() => {
                updateProfile({ sharedStoriesPrivacy: 'anonymous' });
                setShowStoriesPrivacyPicker(false);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text style={[
                styles.pickerOptionText,
                { color: profile.sharedStoriesPrivacy === 'anonymous' ? colors.tint : colors.text },
              ]}>
                Anonymous
              </Text>
              <Text style={[styles.pickerOptionDescription, { color: colors.textSecondary }]}>
                Stories always display as &quot;Anonymous&quot;
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                profile.sharedStoriesPrivacy === 'variable' && { backgroundColor: colors.tint + '10' },
              ]}
              onPress={() => {
                updateProfile({ sharedStoriesPrivacy: 'variable' });
                setShowStoriesPrivacyPicker(false);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text style={[
                styles.pickerOptionText,
                { color: profile.sharedStoriesPrivacy === 'variable' ? colors.tint : colors.text },
              ]}>
                Variable
              </Text>
              <Text style={[styles.pickerOptionDescription, { color: colors.textSecondary }]}>
                Choose privacy per story at submission time
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showStatusPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <View style={[styles.pickerContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Relationship Status</Text>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.border },
                  profile.status === status && { backgroundColor: colors.tint + '10' },
                ]}
                onPress={() => handleSelectStatus(status)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  { color: profile.status === status ? colors.tint : colors.text },
                ]}>
                  {STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showNameEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameEditor(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Name</Text>
              <TouchableOpacity onPress={() => setShowNameEditor(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSaveButton, { backgroundColor: colors.tint }]}
              onPress={handleSaveName}
            >
              <Text style={styles.modalSaveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showUsernameEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUsernameEditor(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Username</Text>
              <TouchableOpacity onPress={() => setShowUsernameEditor(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
                  usernameError && { borderColor: colors.error }
                ]}
                value={editedUsername}
                onChangeText={handleUsernameChange}
                placeholder="Choose a username"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {usernameError ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{usernameError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.modalSaveButton,
                { backgroundColor: colors.tint },
                usernameError && { opacity: 0.5 }
              ]}
              onPress={handleSaveUsername}
              disabled={!!usernameError}
            >
              <Text style={styles.modalSaveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showLocationEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationEditor(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Location</Text>
              <TouchableOpacity onPress={() => setShowLocationEditor(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                value={editedLocation}
                onChangeText={setEditedLocation}
                placeholder="e.g., Las Vegas, NV"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSaveButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                updateProfile({ location: editedLocation.trim() || undefined });
                setShowLocationEditor(false);
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }}
            >
              <Text style={styles.modalSaveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
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
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  pickerContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  pickerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    padding: SPACING.lg,
    textAlign: 'center',
  },
  pickerOption: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  pickerOptionDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING.xs - 2,
    lineHeight: 16,
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
    paddingBottom: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  input: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.sizes.md,
    outlineStyle: 'none' as const,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs - 2,
  },
  modalSaveButton: {
    marginHorizontal: SPACING.lg,
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
