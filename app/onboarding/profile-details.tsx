import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Keyboard,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import DatePickerModal from '@/components/DatePickerModal';

export default function ProfileDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { onboardingData, completeOnboarding } = useAppStore();
  
  const [name, setName] = useState<string>(onboardingData.name || '');
  const [username, setUsername] = useState<string>(onboardingData.username || '');
  const [birthday, setBirthday] = useState<Date | undefined>(
    onboardingData.birthday ? new Date(onboardingData.birthday) : undefined
  );
  const [partnerBirthday, setPartnerBirthday] = useState<Date | undefined>(
    onboardingData.partnerBirthday ? new Date(onboardingData.partnerBirthday) : undefined
  );
  const [anniversary, setAnniversary] = useState<Date | undefined>(
    onboardingData.anniversary ? new Date(onboardingData.anniversary) : undefined
  );
  
  const [activeDatePicker, setActiveDatePicker] = useState<'birthday' | 'partner' | 'anniversary' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  
  const [usernameError, setUsernameError] = useState<string>('');

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
    setUsername(value);
    validateUsername(value);
  };

  const isValid = name.trim().length > 0 && birthday !== undefined && username.trim().length > 0 && !usernameError;

  const handleContinue = () => {
    if (!isValid || !onboardingData.status) return;

    completeOnboarding(
      onboardingData.status,
      onboardingData.goals,
      onboardingData.focusAreas,
      'practical',
      10,
      name,
      username,
      birthday?.toISOString(),
      partnerBirthday?.toISOString(),
      anniversary?.toISOString()
    );
    router.replace('/(tabs)/library' as any);
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const openDatePicker = (type: 'birthday' | 'partner' | 'anniversary') => {
    Keyboard.dismiss();
    
    let initialDate = new Date();
    
    if (type === 'birthday' && birthday) {
      initialDate = birthday;
    } else if (type === 'partner' && partnerBirthday) {
      initialDate = partnerBirthday;
    } else if (type === 'anniversary' && anniversary) {
      initialDate = anniversary;
    }
    
    setTempDate(initialDate);
    setActiveDatePicker(type);
  };

  const handleDateConfirm = (date: Date) => {
    if (activeDatePicker === 'birthday') {
      setBirthday(date);
    } else if (activeDatePicker === 'partner') {
      setPartnerBirthday(date);
    } else if (activeDatePicker === 'anniversary') {
      setAnniversary(date);
    }
    setActiveDatePicker(null);
  };

  const handleDateClear = () => {
    if (activeDatePicker === 'partner') {
      setPartnerBirthday(undefined);
    } else if (activeDatePicker === 'anniversary') {
      setAnniversary(undefined);
    }
    setActiveDatePicker(null);
  };

  const getDatePickerTitle = () => {
    if (activeDatePicker === 'birthday') return 'Select Your Birthday';
    if (activeDatePicker === 'partner') return "Select Partner's Birthday";
    return 'Select Anniversary Date';
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile Details',
          headerStyle: { backgroundColor: Colors.dark.surface },
          headerTintColor: Colors.dark.text,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { 
              paddingBottom: insets.bottom + SPACING.xl + 60 
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View>
          <View style={styles.header}>
            <Text style={styles.title}>About You</Text>
            <Text style={styles.subtitle}>
              Help us personalize your Spark&apos;d experience.
            </Text>
          </View>

          <View style={styles.fields}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.dark.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  usernameError && styles.inputError,
                ]}
                value={username}
                onChangeText={handleUsernameChange}
                placeholder="Choose a username"
                placeholderTextColor={Colors.dark.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {usernameError ? (
                <Text style={styles.errorText}>{usernameError}</Text>
              ) : null}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Birthday <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => openDatePicker('birthday')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    !birthday && styles.dateButtonPlaceholder,
                  ]}
                >
                  {birthday ? formatDate(birthday) : 'Select your birthday'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Partner&apos;s Birthday <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => openDatePicker('partner')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    !partnerBirthday && styles.dateButtonPlaceholder,
                  ]}
                >
                  {partnerBirthday ? formatDate(partnerBirthday) : "Select partner's birthday"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                Anniversary <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => openDatePicker('anniversary')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    !anniversary && styles.dateButtonPlaceholder,
                  ]}
                >
                  {anniversary ? formatDate(anniversary) : 'Select anniversary date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
              !isValid && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isValid
                  ? [Colors.dark.tint, '#FF6B35']
                  : ['#444444', '#333333']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Start Your Journey</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
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
  fields: {
    gap: SPACING.lg,
  },
  fieldContainer: {
    gap: SPACING.xs,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
  },
  required: {
    color: Colors.dark.tint,
  },
  optional: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.text,
    outlineStyle: 'none' as const,
  },
  inputError: {
    borderColor: Colors.dark.tint,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.tint,
    marginTop: SPACING.xs - 2,
  },
  dateButton: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  dateButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.text,
  },
  dateButtonPlaceholder: {
    color: Colors.dark.textSecondary,
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
