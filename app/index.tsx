import React, { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from '@/store/appStore';
import Colors from '@/constants/colors';

export default function Index() {
  const hasNavigated = useRef(false);

  // Read the two values directly from the store (reactive)
  const hasHydrated = useAppStore((s) => s._hasHydrated === true);
  const hasCompletedOnboarding = useAppStore(
    (s) => s.profile?.hasCompletedOnboarding === true
  );

  useEffect(() => {
    if (hasNavigated.current) return;

    // Wait until hydration finishes (this prevents “undefined → false → onboarding”)
    if (!hasHydrated) return;

    hasNavigated.current = true;

    // Small delay to allow state to settle
    const t = setTimeout(() => {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)/library');
      } else {
        router.replace('/onboarding');
      }
    }, 100);

    return () => clearTimeout(t);
  }, [hasHydrated, hasCompletedOnboarding]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.dark.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background ?? '#1a1a2e',
  },
});
