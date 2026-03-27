import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useAppStore } from '@/store/appStore';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';
import { Sparkles, Heart, Zap, MessageCircle, Moon } from 'lucide-react-native';

const horoscopeSections = [
  {
    icon: Sparkles,
    title: 'Overall Theme',
    content: 'Today has a contemplative, inward feel. The energy invites reflection rather than rushing. You may find yourself naturally drawn to quiet moments and deeper thoughts.',
  },
  {
    icon: Heart,
    title: 'Love & Connection',
    content: 'Emotional currents run steady and grounded. Connections feel authentic when approached with patience. The day favors gentle, honest exchanges over grand gestures.',
  },
  {
    icon: Zap,
    title: 'Energy & Vitality',
    content: 'A slow-but-steady rhythm defines the day. Rather than explosive bursts, energy flows in measured waves. Trust the pace rather than forcing intensity.',
  },
  {
    icon: MessageCircle,
    title: 'Communication',
    content: 'Words carry weight today. Conversations benefit from thoughtfulness and care. Listen as much as you speak, and let meaning emerge naturally.',
  },
  {
    icon: Moon,
    title: 'Emotional Aura',
    content: 'The emotional field feels open and curious, yet protective. You may sense both vulnerability and strength intertwined. Honor whatever surfaces without judgment.',
  },
];

const getZodiacInfo = (birthday?: string): { sign: string; emoji: string } => {
  if (!birthday) return { sign: 'Scorpio', emoji: '♏' };
  
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

export default function HoroscopeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const profile = useAppStore((state) => state.profile);
  
  const zodiacInfo = getZodiacInfo(profile?.birthday);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: `${zodiacInfo.emoji} ${zodiacInfo.sign}`,
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
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '15' }]}>
            <Sparkles size={32} color={colors.tint} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Your Daily Horoscope
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Descriptive insights into today&apos;s celestial energy. Remember, these are observations, not prescriptions.
          </Text>
        </View>

        {horoscopeSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <View
              key={index}
              style={[
                styles.sectionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <Icon size={20} color={colors.tint} strokeWidth={1.5} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
              </View>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {section.content}
              </Text>
            </View>
          );
        })}

        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            These horoscope insights are descriptive interpretations of astrological patterns, not directives. Use them as gentle prompts for self-reflection, never as rules for how you should feel or act.
          </Text>
        </View>
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  sectionContent: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  disclaimer: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  disclaimerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
    textAlign: 'center',
  },
});
