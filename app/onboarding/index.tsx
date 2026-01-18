import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { TAGLINE_WORDS } from '@/constants/data';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [wordIndex, setWordIndex] = useState<number>(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setWordIndex((prev) => (prev + 1) % TAGLINE_WORDS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + SPACING.xxl }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/05aqrmldvdfdqxfaavc1x' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.taglineContainer}>
              <Animated.Text
                style={[styles.tagline, { opacity: fadeAnim }]}
              >
                {TAGLINE_WORDS[wordIndex]}
              </Animated.Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>Your Relationship Lifestyle App</Text>
            <Text style={styles.description}>
              This is your pocket guide for daily practice in building deeper connections through micro-lessons, conversation starters, & mindful action!
            </Text>

            <View style={styles.features}>
              <FeatureItem
                emoji="🤝"
                text="Solo or with a partner"
              />
              <FeatureItem
                emoji="💬"
                text="Daily Sparks tailored to you"
              />
              <FeatureItem
                emoji="🌱"
                text="Journeys for leveled growth"
              />
              <FeatureItem
                emoji="💡"
                text="Daily curated inspiration"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/status' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.dark.tint, '#FF6B35']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Begin Journey!</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>Takes less than 1 minute</Text>
        </ScrollView>
      </View>
    </>
  );
}

function FeatureItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  logo: {
    width: '85%',
    height: 144,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  taglineContainer: {
    height: 32,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.tint,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: SPACING.xs + 2,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.md + 4,
  },
  features: {
    gap: SPACING.sm + 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: Colors.dark.text,
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.md + 4,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
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
  footer: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    marginTop: SPACING.md,
  },
});
