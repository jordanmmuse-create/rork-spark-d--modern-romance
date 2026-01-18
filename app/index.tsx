import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from '@/store/appStore';
import Colors from '@/constants/colors';

export default function Index() {
  const hasCompletedOnboarding = useAppStore((state) => state.profile?.hasCompletedOnboarding);
  const hasHydrated = useAppStore((state) => state._hasHydrated);

  useEffect(() => {
    console.log('Index mounted, hasHydrated:', hasHydrated, 'hasCompletedOnboarding:', hasCompletedOnboarding);
    
    if (!hasHydrated) {
      const timeout = setTimeout(() => {
        console.log('Hydration timeout - proceeding anyway');
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding' as any);
        } else {
          router.replace('/(tabs)/library' as any);
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding' as any);
      } else {
        router.replace('/(tabs)/library' as any);
      }
    }, 100);

    return () => clearTimeout(timer);
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
    backgroundColor: Colors.dark.background,
  },
});

