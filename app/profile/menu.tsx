import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Sliders,
} from 'lucide-react-native';
import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';

export default function ProfileMenuScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { reset } = useAppStore();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to reset and start over? This will clear all your data.');
      if (confirmed) {
        reset();
        router.replace('/onboarding');
      }
    } else {
      Alert.alert(
        'Reset & Start Over',
        'Are you sure you want to reset and start over? This will clear all your data.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: () => {
              reset();
              router.replace('/onboarding');
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Profile Menu',
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
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/profile/preferences')}
          activeOpacity={0.7}
        >
          <Sliders size={20} color={colors.text} />
          <Text style={[styles.menuButtonText, { color: colors.text }]}>Preferences</Text>
          <ChevronRight size={20} color={colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/profile/settings')}
          activeOpacity={0.7}
        >
          <SettingsIcon size={20} color={colors.text} />
          <Text style={[styles.menuButtonText, { color: colors.text }]}>Settings</Text>
          <ChevronRight size={20} color={colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuButton,
            styles.logoutButton,
            { backgroundColor: colors.surface, borderColor: colors.error + '30' }
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.menuButtonText, styles.logoutButtonText, { color: colors.error }]}>
            Reset & Start Over
          </Text>
        </TouchableOpacity>
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
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
  },
  menuButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutButton: {},
  logoutButtonText: {},
});
