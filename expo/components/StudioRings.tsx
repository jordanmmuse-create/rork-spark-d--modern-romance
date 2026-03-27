import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Flame, Sparkles } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING } from '@/constants/colors';

interface StudioRingsProps {
  streakDays: number;
  streakGoal?: number;
  xp: number;
  xpGoal?: number;
}

export default function StudioRings({
  streakDays,
  streakGoal = 30,
  xp,
  xpGoal = 1500,
}: StudioRingsProps) {
  const { colors } = useThemeStyles();

  const ringSize = 96;
  const hashCount = 30;
  const radius = 38;
  const hashLength = 6;
  const hashWidth = 2;

  const ORANGE_ACTIVE = '#F97316';
  const ORANGE_ALT_ACTIVE = '#FB923C';
  const BLUE_ACTIVE = '#0EA5E9';
  
  const ORANGE_INACTIVE = 'rgba(249, 115, 22, 0.35)';
  const ORANGE_ALT_INACTIVE = 'rgba(251, 146, 60, 0.35)';
  const BLUE_INACTIVE = 'rgba(14, 165, 233, 0.35)';

  const getCurrentStreakCycle = (days: number) => {
    const cycleNumber = Math.floor(days / 30);
    const daysInCurrentCycle = days % 30;
    const useAltColor = cycleNumber % 2 === 1;
    return { cycleNumber, daysInCurrentCycle, useAltColor };
  };

  const getCurrentXPCycle = (currentXP: number) => {
    const xpInCurrentCycle = currentXP % 1500;
    return xpInCurrentCycle;
  };

  const renderStreakHashRing = () => {
    const { daysInCurrentCycle, useAltColor } = getCurrentStreakCycle(streakDays);
    const activeColor = useAltColor ? ORANGE_ALT_ACTIVE : ORANGE_ACTIVE;
    const inactiveColor = useAltColor ? ORANGE_ALT_INACTIVE : ORANGE_INACTIVE;
    const filledHashes = daysInCurrentCycle;

    return (
      <Svg width={ringSize} height={ringSize} style={styles.svg}>
        {Array.from({ length: hashCount }).map((_, index) => {
          const angle = (index / hashCount) * 2 * Math.PI - Math.PI / 2;
          const isFilled = index < filledHashes;
          
          const x1 = ringSize / 2 + (radius - hashLength) * Math.cos(angle);
          const y1 = ringSize / 2 + (radius - hashLength) * Math.sin(angle);
          const x2 = ringSize / 2 + radius * Math.cos(angle);
          const y2 = ringSize / 2 + radius * Math.sin(angle);

          return (
            <Line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isFilled ? activeColor : inactiveColor}
              strokeWidth={hashWidth}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    );
  };

  const renderXPHashRing = () => {
    const xpInCycle = getCurrentXPCycle(xp);
    const filledHashes = Math.floor(xpInCycle / 50);
    const activeColor = BLUE_ACTIVE;
    const inactiveColor = BLUE_INACTIVE;

    return (
      <Svg width={ringSize} height={ringSize} style={styles.svg}>
        {Array.from({ length: hashCount }).map((_, index) => {
          const angle = (index / hashCount) * 2 * Math.PI - Math.PI / 2;
          const isFilled = index < filledHashes;
          
          const x1 = ringSize / 2 + (radius - hashLength) * Math.cos(angle);
          const y1 = ringSize / 2 + (radius - hashLength) * Math.sin(angle);
          const x2 = ringSize / 2 + radius * Math.cos(angle);
          const y2 = ringSize / 2 + radius * Math.sin(angle);

          return (
            <Line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isFilled ? activeColor : inactiveColor}
              strokeWidth={hashWidth}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    );
  };

  const { useAltColor } = getCurrentStreakCycle(streakDays);
  const streakDisplayColor = useAltColor ? ORANGE_ALT_ACTIVE : ORANGE_ACTIVE;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.ringsRow}>
        <View style={styles.ringModule}>
          <View style={styles.ringContainer}>
            {renderStreakHashRing()}
            <View style={[styles.iconCircle, { backgroundColor: colors.statsTickerBg }]} />
            <View style={styles.ringContent}>
              <Sparkles size={22} color={streakDisplayColor} strokeWidth={2.5} style={{ marginBottom: 4 }} />
              <Text style={[styles.ringNumber, { color: colors.text, marginTop: -6 }]}>{streakDays}</Text>
            </View>
          </View>
          <Text style={[styles.ringLabel, { color: colors.text }]}>Day Streak</Text>
          <Text style={[styles.ringMicroLabel, { color: colors.textSecondary }]}>Consistency</Text>
        </View>

        <View style={styles.ringModule}>
          <View style={styles.ringContainer}>
            {renderXPHashRing()}
            <View style={[styles.iconCircle, { backgroundColor: colors.statsTickerBg }]} />
            <View style={styles.ringContent}>
              <Flame size={22} color={BLUE_ACTIVE} strokeWidth={2.5} style={{ marginBottom: 4 }} />
              <Text style={[styles.ringNumber, { color: colors.text, marginTop: -6 }]}>{xp}</Text>
            </View>
          </View>
          <Text style={[styles.ringLabel, { color: colors.text }]}>XP</Text>
          <Text style={[styles.ringMicroLabel, { color: colors.textSecondary }]}>Growth</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
  },
  ringModule: {
    alignItems: 'center',
    flex: 1,
  },
  ringContainer: {
    position: 'relative',
    width: 96,
    height: 96,
    marginBottom: SPACING.sm,
  },
  svg: {
    position: 'absolute',
    zIndex: 2,
  },
  ringContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  ringNumber: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  ringLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  ringMicroLabel: {
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.7,
    letterSpacing: 0.3,
  },
});
