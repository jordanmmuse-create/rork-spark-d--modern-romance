import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from '@/store/appStore';
import Colors from '@/constants/colors';

export default function Index() {
  const hasRoutedThisSession = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Poll for hydration completion - more reliable than reactive state
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds max wait

    const checkHydration = () => {
      checkCount++;
      const state = useAppStore.getState();
      const hydrated = state._hasHydrated;
      
      console.log(`[Index] Hydration check #${checkCount}: hydrated=${hydrated}, profile=${!!state.profile}`);
      
      if (hydrated) {
        console.log('[Index] Hydration confirmed, setting ready');
        setIsReady(true);
      } else if (checkCount < maxChecks) {
        timeoutId = setTimeout(checkHydration, 100);
      } else {
        // Safety timeout - proceed anyway after 5 seconds
        console.log('[Index] Hydration timeout reached, proceeding anyway');
        setIsReady(true);
      }
    };

    // Start checking immediately
    checkHydration();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Navigate once ready
  useEffect(() => {
    if (!isReady || hasRoutedThisSession.current) {
      return;
    }

    // Get fresh state directly from store to ensure we have latest values
    const currentState = useAppStore.getState();
    const currentProfile = currentState.profile;
    const hasCompletedOnboarding = currentProfile?.hasCompletedOnboarding === true;

    console.log('[Index] Ready to navigate. Profile exists:', !!currentProfile, 'hasCompletedOnboarding:', hasCompletedOnboarding);

    // Small delay to ensure state is fully settled
    const timer = setTimeout(() => {
      if (hasRoutedThisSession.current) return;
      hasRoutedThisSession.current = true;

      if (hasCompletedOnboarding) {
        console.log('[Index] Navigating to tabs (onboarding completed)');
        router.replace('/(tabs)/library');
      } else {
        console.log('[Index] Navigating to onboarding (not completed)');
        router.replace('/onboarding');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isReady]);

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
    backgroundColor: '#1a1a2e',
  },
});
