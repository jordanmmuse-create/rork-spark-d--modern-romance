import React, { useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';

interface UnreadMailIconProps {
  onPress: () => void;
  onDoubleTap?: () => void;
  size?: number;
  dynamicColor?: boolean;
  color?: string;
}

const DOUBLE_TAP_DELAY = 300;

export default function UnreadMailIcon({ onPress, onDoubleTap, size = 24, dynamicColor = false, color }: UnreadMailIconProps) {
  const lastTapRef = useRef<number>(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const unreadCount = useAppStore((state) => {
    return state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  });

  const iconColor = color ? color : (dynamicColor ? (unreadCount > 0 ? '#FF3B30' : '#FFFFFF') : '#FFFFFF');

  console.log('[UnreadMailIcon] Rendering with unread count:', unreadCount, 'dynamicColor:', dynamicColor, 'iconColor:', iconColor);

  const handlePress = useCallback(() => {
    const now = Date.now();
    
    if (onDoubleTap) {
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onDoubleTap();
        lastTapRef.current = 0;
        return;
      }
      
      lastTapRef.current = now;
      
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      
      tapTimerRef.current = setTimeout(() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
        tapTimerRef.current = null;
      }, DOUBLE_TAP_DELAY);
    } else {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  }, [onPress, onDoubleTap]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Mail size={size} color={iconColor} strokeWidth={2} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#000000',
    zIndex: 9999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
