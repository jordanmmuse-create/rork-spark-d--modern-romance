import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { User, Users } from 'lucide-react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  HEADER_PROFILE_BTN_SIZE,
  HEADER_PROFILE_ICON_SIZE,
} from '@/constants/header';

type HeaderProfileButtonVariant = 'vault' | 'playChallenges';

interface HeaderProfileButtonProps {
  imageUri?: string | null;
  onPress?: () => void;
  variant?: HeaderProfileButtonVariant;
}

export default function HeaderProfileButton({ imageUri, onPress, variant = 'vault' }: HeaderProfileButtonProps) {
  const { colors } = useThemeStyles();

  const isPlayChallenges = variant === 'playChallenges';
  const glowColor = isPlayChallenges ? colors.textSecondary : '#0EA5E9';
  const iconColor = isPlayChallenges ? colors.textSecondary : colors.tint;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.glow,
          {
            backgroundColor: glowColor,
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
            elevation: 8,
          },
        ]}
      />
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : isPlayChallenges ? (
          <Users size={HEADER_PROFILE_ICON_SIZE} color={iconColor} strokeWidth={1.5} />
        ) : (
          <User size={HEADER_PROFILE_ICON_SIZE} color={iconColor} strokeWidth={1.5} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: HEADER_PROFILE_BTN_SIZE,
    height: HEADER_PROFILE_BTN_SIZE,
    borderRadius: HEADER_PROFILE_BTN_SIZE / 2,
  },
  button: {
    width: HEADER_PROFILE_BTN_SIZE,
    height: HEADER_PROFILE_BTN_SIZE,
    borderRadius: HEADER_PROFILE_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: HEADER_PROFILE_BTN_SIZE / 2,
  },
});
