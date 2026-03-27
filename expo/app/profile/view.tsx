import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Copy, Share2, Check, Target, Send as SendIcon, ChevronRight, Heart, MessageCircle, Hand, Link2, ArrowLeft, Bookmark, Plus, Feather } from 'lucide-react-native';
import { router, Stack } from 'expo-router';

import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import Colors, { SPACING, BORDER_RADIUS, TYPOGRAPHY, FOCUS_AREA_COLORS } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { INSPO_SECTIONS } from '@/constants/parq-data';
import ImageCropper from '@/components/ImageCropper';
import StudioRings from '@/components/StudioRings';
import type { RelationshipStatus } from '@/types';

const PROFILE_STATUS_DISPLAY: Record<RelationshipStatus, string> = {
  single: 'Gathering',
  dating: 'Igniting',
  partnered: 'Burning',
  complicated: 'Flickering',
};

const CATEGORY_COLORS: Record<string, { background: string; border: string; text: string }> = {
  'section-weekly-curated': { background: '#FEF3C7', border: '#FFCC00', text: '#B45309' },
  'section-holiday-magic': { background: '#D4E4FF', border: '#007AFF', text: '#2563EB' },
  'section-date-night': { background: '#FFE4E6', border: '#FF3B30', text: '#DC2626' },
  'section-recipes': { background: '#FFEDD5', border: '#FF9500', text: '#C2410C' },
  'section-gift-giving': { background: '#FFE4E6', border: '#FF3B30', text: '#DC2626' },
  'section-celebrate': { background: '#FFE4E6', border: '#FF3B30', text: '#DC2626' },
  'section-making-official': { background: '#D4E4FF', border: '#007AFF', text: '#2563EB' },
  'section-party-of-2': { background: '#FEF3C7', border: '#FFCC00', text: '#B45309' },
  'section-meaningful-gestures': { background: '#EDE6D9', border: '#A2845E', text: '#78716C' },
  'section-swole-mates': { background: '#FFEDD5', border: '#FF9500', text: '#C2410C' },
  'section-diy-projects': { background: '#EDE6D9', border: '#A2845E', text: '#78716C' },
  'section-long-distance': { background: '#D1FAE5', border: '#34C759', text: '#059669' },
  'section-romantic-getaways': { background: '#D4E4FF', border: '#007AFF', text: '#2563EB' },
  'section-self-care': { background: '#D1FAE5', border: '#34C759', text: '#059669' },
  'section-just-because': { background: '#D1FAE5', border: '#34C759', text: '#059669' },
  'section-party-of-1': { background: '#FEF3C7', border: '#FFCC00', text: '#B45309' },
};

const getCategoryColors = (sectionId: string) => {
  return CATEGORY_COLORS[sectionId] || { background: 'rgba(255, 149, 0, 0.15)', border: '#FF9500', text: '#FF9500' };
};

const BADGE_COLORS = {
  red: '#C0392B',
  green: '#27AE60',
  orange: '#E67E22',
  yellow: '#D4AC0D',
  tan: '#C4A77D',
  blue: '#136C8D',
};

const BADGE_TRIOS: { color1: string; color2: string; color3: string }[] = [
  { color1: BADGE_COLORS.red, color2: BADGE_COLORS.blue, color3: BADGE_COLORS.tan },
  { color1: BADGE_COLORS.green, color2: BADGE_COLORS.orange, color3: BADGE_COLORS.yellow },
  { color1: BADGE_COLORS.blue, color2: BADGE_COLORS.red, color3: BADGE_COLORS.green },
  { color1: BADGE_COLORS.orange, color2: BADGE_COLORS.tan, color3: BADGE_COLORS.blue },
  { color1: BADGE_COLORS.yellow, color2: BADGE_COLORS.green, color3: BADGE_COLORS.red },
  { color1: BADGE_COLORS.tan, color2: BADGE_COLORS.yellow, color3: BADGE_COLORS.orange },
  { color1: BADGE_COLORS.red, color2: BADGE_COLORS.green, color3: BADGE_COLORS.blue },
  { color1: BADGE_COLORS.orange, color2: BADGE_COLORS.blue, color3: BADGE_COLORS.tan },
  { color1: BADGE_COLORS.green, color2: BADGE_COLORS.yellow, color3: BADGE_COLORS.red },
  { color1: BADGE_COLORS.blue, color2: BADGE_COLORS.tan, color3: BADGE_COLORS.orange },
  { color1: BADGE_COLORS.yellow, color2: BADGE_COLORS.red, color3: BADGE_COLORS.green },
  { color1: BADGE_COLORS.tan, color2: BADGE_COLORS.blue, color3: BADGE_COLORS.yellow },
  { color1: BADGE_COLORS.red, color2: BADGE_COLORS.orange, color3: BADGE_COLORS.green },
  { color1: BADGE_COLORS.green, color2: BADGE_COLORS.blue, color3: BADGE_COLORS.tan },
  { color1: BADGE_COLORS.orange, color2: BADGE_COLORS.yellow, color3: BADGE_COLORS.blue },
  { color1: BADGE_COLORS.blue, color2: BADGE_COLORS.green, color3: BADGE_COLORS.yellow },
  { color1: BADGE_COLORS.yellow, color2: BADGE_COLORS.tan, color3: BADGE_COLORS.red },
  { color1: BADGE_COLORS.tan, color2: BADGE_COLORS.red, color3: BADGE_COLORS.orange },
  { color1: BADGE_COLORS.red, color2: BADGE_COLORS.yellow, color3: BADGE_COLORS.blue },
  { color1: BADGE_COLORS.green, color2: BADGE_COLORS.tan, color3: BADGE_COLORS.orange },
];

const BADGE_WIDTH = 10;
const BADGE_GAP = 3;
const BADGE_DOCK_WIDTH = 120;
const BADGE_ROW_GAP = 4;
const AVATAR_SIZE = 96;
const AVATAR_RADIUS = AVATAR_SIZE / 2;
const HEADER_RIGHT_INSET = 0;

const calculateBadgeRows = (totalBadges: number) => {
  const badgeItemWidth = BADGE_WIDTH + BADGE_GAP;
  const rows: { startIndex: number; count: number; paddingLeft: number }[] = [];
  let remaining = totalBadges;
  let currentIndex = 0;
  let rowIndex = 0;
  
  while (remaining > 0) {
    const rowPaddingLeft = calculateRowPaddingLeft(rowIndex);
    const availableWidth = BADGE_DOCK_WIDTH - rowPaddingLeft;
    const maxBadgesInRow = Math.max(1, Math.floor((availableWidth + BADGE_GAP) / badgeItemWidth));
    const count = Math.min(maxBadgesInRow, remaining);
    
    rows.push({ 
      startIndex: currentIndex, 
      count, 
      paddingLeft: rowPaddingLeft 
    });
    
    currentIndex += count;
    remaining -= count;
    rowIndex++;
  }
  
  return rows;
};

const calculateRowPaddingLeft = (rowIndex: number): number => {
  if (rowIndex === 0 || rowIndex === 4) {
    const targetBadges = 9;
    const neededWidth = (targetBadges * BADGE_WIDTH) + ((targetBadges - 1) * BADGE_GAP);
    return Math.max(0, BADGE_DOCK_WIDTH - neededWidth);
  } else if (rowIndex === 1 || rowIndex === 3) {
    const targetBadges = 8;
    const neededWidth = (targetBadges * BADGE_WIDTH) + ((targetBadges - 1) * BADGE_GAP);
    return Math.max(0, BADGE_DOCK_WIDTH - neededWidth);
  } else if (rowIndex === 2) {
    const targetBadges = 7;
    const neededWidth = (targetBadges * BADGE_WIDTH) + ((targetBadges - 1) * BADGE_GAP);
    return Math.max(0, BADGE_DOCK_WIDTH - neededWidth);
  }
  
  const rowHeight = 15;
  const rowCenterY = rowIndex * (rowHeight + BADGE_ROW_GAP) + rowHeight / 2;
  const avatarCenterY = AVATAR_SIZE / 2;
  const yFromCenter = Math.abs(rowCenterY - avatarCenterY);
  
  if (yFromCenter < AVATAR_RADIUS) {
    const xAtCircleEdge = Math.sqrt(Math.pow(AVATAR_RADIUS, 2) - Math.pow(yFromCenter, 2));
    const offsetFromCenter = AVATAR_RADIUS - xAtCircleEdge;
    return Math.max(0, Math.round(offsetFromCenter - 25));
  } else {
    return 0;
  }
};

interface BadgeProps {
  color1: string;
  color2: string;
  color3: string;
  style?: any;
}

const Badge: React.FC<BadgeProps> = ({ color1, color2, color3, style }) => {
  return (
    <View style={[styles.badge, style]}>
      <View style={[styles.badgeThirdLeft, { backgroundColor: color1 }]} />
      <View style={[styles.badgeThirdCenter, { backgroundColor: color2 }]} />
      <View style={[styles.badgeThirdRight, { backgroundColor: color3 }]} />
    </View>
  );
};

const BadgeCluster: React.FC = () => {
  const badgeRows = calculateBadgeRows(BADGE_TRIOS.length);
  
  return (
    <View style={styles.badgeDockContainer}>
      <View style={styles.badgeDockInner}>
        {badgeRows.map((row, rowIndex) => {
          const rowBadges = BADGE_TRIOS.slice(row.startIndex, row.startIndex + row.count);
          
          return (
            <View 
              key={rowIndex} 
              style={[styles.badgeRow, { paddingLeft: row.paddingLeft }]}
            >
              {rowBadges.map((trio, idx) => (
                <Badge
                  key={idx}
                  color1={trio.color1}
                  color2={trio.color2}
                  color3={trio.color3}
                />
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function ProfileViewScreen() {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useThemeStyles();
  const { profile, updateProfile, generatePartnerCode, joinPartnerGroup, getPartnerGroup, getPosts, highlightedSharedStoryIds, badgeDisplayEnabled, journalEntries } = useAppStore();
  const scrollRef = useRef<ScrollView>(null);
  const [partnerCode, setPartnerCode] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');
  const [codeGenerated, setCodeGenerated] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editedDisplayName, setEditedDisplayName] = useState<string>(profile?.displayName || '');
  const [editedUsername, setEditedUsername] = useState<string>(profile?.username || '');
  const [editedBio, setEditedBio] = useState<string>(profile?.bio || '');
  const [editedProfilePicture, setEditedProfilePicture] = useState<string | undefined>(profile?.profilePicture);
  const [editedLocation, setEditedLocation] = useState<string>(profile?.location || '');
  const [cropperVisible, setCropperVisible] = useState<boolean>(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const isOwnProfile = false;

  const handleEditPress = useCallback(() => {
    setEditedDisplayName(profile?.displayName || '');
    setEditedUsername(profile?.username || '');
    setEditedBio(profile?.bio || '');
    setEditedProfilePicture(profile?.profilePicture);
    setEditedLocation(profile?.location || '');
    setIsEditMode(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [profile?.displayName, profile?.username, profile?.bio, profile?.profilePicture, profile?.location]);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditedDisplayName(profile?.displayName || '');
    setEditedUsername(profile?.username || '');
    setEditedBio(profile?.bio || '');
    setEditedProfilePicture(profile?.profilePicture);
    setEditedLocation(profile?.location || '');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [profile?.displayName, profile?.username, profile?.bio, profile?.profilePicture, profile?.location]);

  const handleSaveEdit = useCallback(() => {
    updateProfile({
      name: editedDisplayName,
      displayName: editedDisplayName,
      username: editedUsername,
      bio: editedBio,
      profilePicture: editedProfilePicture,
      location: editedLocation,
    });
    setIsEditMode(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [editedDisplayName, editedUsername, editedBio, editedProfilePicture, editedLocation, updateProfile]);

  const handleProfilePicturePress = useCallback(async () => {
    if (!isEditMode) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' && mediaStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera or photo library to change your profile picture.'
      );
      return;
    }

    Alert.alert(
      'Change Profile Picture',
      'Choose a photo from:',
      [
        {
          text: 'Camera',
          onPress: async () => {
            if (cameraStatus === 'granted') {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: false,
                quality: 1,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedImageUri(result.assets[0].uri);
                setCropperVisible(true);
              }
            } else {
              Alert.alert('Camera access not granted');
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            if (mediaStatus === 'granted') {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: false,
                quality: 1,
              });

              if (!result.canceled && result.assets[0]) {
                setSelectedImageUri(result.assets[0].uri);
                setCropperVisible(true);
              }
            } else {
              Alert.alert('Photo library access not granted');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, [isEditMode]);

  const handleCropSave = useCallback((croppedUri: string) => {
    setEditedProfilePicture(croppedUri);
    setCropperVisible(false);
    setSelectedImageUri('');
  }, []);

  const handleCropCancel = useCallback(() => {
    setCropperVisible(false);
    setSelectedImageUri('');
  }, []);

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      const millions = count / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    }
    if (count >= 1000) {
      const thousands = count / 1000;
      return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!profile) return null;

  const bio = profile?.bio || '';

  const handleGenerateCode = () => {
    const code = generatePartnerCode();
    setPartnerCode(code);
    setCodeGenerated(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleJoinWithCode = () => {
    if (joinCode.length !== 6) {
      setJoinError('Code must be 6 characters');
      return;
    }
    
    const success = joinPartnerGroup(joinCode);
    if (success) {
      setJoinCode('');
      setJoinError('');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setJoinError('Invalid code. Please try again.');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const partnerGroup = getPartnerGroup();

  const handleSendSpark = () => {
    router.push('/(tabs)/library');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.md, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.topBarBackButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
          style={styles.topBarLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.topBarMenuButton}
          onPress={() => router.push('/profile/menu')}
          activeOpacity={0.7}
        >
          <View style={styles.hamburgerIcon}>
            <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
            <View style={[styles.hamburgerLine, { backgroundColor: colors.text }]} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.profileContainer}>
          {isEditMode ? (
            <TextInput
              style={[styles.fullNameInput, { color: colors.text, borderColor: colors.border }]}
              value={editedDisplayName}
              onChangeText={setEditedDisplayName}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              autoFocus={false}
            />
          ) : (
            <View style={styles.nameRow}>
              <View style={styles.nameContainer}>
                <Text 
                  style={[styles.fullName, { color: colors.text }]} 
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {profile.displayName || profile.name || "Spark'd User"}
                </Text>
              </View>
              {profile.title && (
                <View style={styles.titleContainer}>
                  <Text style={[styles.titleText, { color: colors.textSecondary }]}>
                    {profile.title}
                  </Text>
                </View>
              )}
              {!profile.title && (
                <View style={styles.titleContainer}>
                  <Text style={[styles.titleText, { color: colors.textSecondary }]}>
                    &ldquo;La Romantíque&rdquo;
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.profileHeader}>
            {badgeDisplayEnabled && <BadgeCluster />}
            <View style={styles.avatarGlowContainer}>
              <View style={[
                styles.avatarGlow,
                {
                  backgroundColor: theme === 'light' ? '#FF6B35' : '#0EA5E9',
                  shadowColor: theme === 'light' ? '#FF6B35' : '#0EA5E9',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 28,
                  elevation: 12,
                }
              ]} />
              <TouchableOpacity
                style={[styles.avatar, { backgroundColor: colors.surfaceInset }]}
                onPress={handleProfilePicturePress}
                disabled={!isEditMode}
                activeOpacity={isEditMode ? 0.7 : 1}
              >
                {editedProfilePicture || profile.profilePicture ? (
                  <Image
                    source={{ uri: editedProfilePicture || profile.profilePicture }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <User size={48} color={colors.tint} strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>

            {!isEditMode && (
              <TouchableOpacity onPress={handleEditPress} activeOpacity={0.7} style={styles.editLinkContainer}>
                <Text style={[styles.editLink, { color: theme === 'light' ? '#FF6B35' : '#0EA5E9' }]}>Edit</Text>
              </TouchableOpacity>
            )}
            
            {isEditMode ? (
              <TextInput
                style={[styles.usernameInput, { color: colors.text, borderColor: colors.border }]}
                value={editedUsername}
                onChangeText={setEditedUsername}
                placeholder="username"
                placeholderTextColor={colors.textSecondary}
                autoFocus={false}
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>
                @{profile.username || profile.name?.toLowerCase().replace(/\s+/g, '') || 'sparkduser'}
              </Text>
            )}
            
            <Text style={[styles.profileStatus, { color: colors.text }]}>
              {PROFILE_STATUS_DISPLAY[profile.status]?.toUpperCase()}{profile.location ? ` · ${profile.location.toUpperCase()}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.followStatsSection}>
          <View style={styles.followStatsRow}>
            <TouchableOpacity style={styles.followStatItem} activeOpacity={0.7}>
              <Text style={[styles.followStatCount, { color: colors.text }]}>
                {formatFollowerCount(profile.followersCount || 0)}
              </Text>
              <Text style={[styles.followStatLabel, { color: colors.textSecondary }]}> Followers</Text>
            </TouchableOpacity>
            <Text style={[styles.followStatDot, { color: colors.textSecondary }]}>•</Text>
            <TouchableOpacity style={styles.followStatItem} activeOpacity={0.7}>
              <Text style={[styles.followStatCount, { color: colors.text }]}>
                {profile.followingCount || 0}
              </Text>
              <Text style={[styles.followStatLabel, { color: colors.textSecondary }]}> Following</Text>
            </TouchableOpacity>
          </View>
          {!isOwnProfile && (
            <View style={styles.followActionsRow}>
              <TouchableOpacity
                style={[
                  styles.followPillButton,
                  {
                    backgroundColor: isFollowing ? colors.backgroundSecondary : colors.backgroundSecondary,
                    borderColor: isFollowing ? (theme === 'light' ? '#FF6B35' : '#0EA5E9') : colors.border,
                  },
                ]}
                onPress={() => {
                  setIsFollowing(!isFollowing);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                {isFollowing ? (
                  <Check size={14} color={theme === 'light' ? '#FF6B35' : '#0EA5E9'} strokeWidth={2.5} />
                ) : (
                  <Plus size={14} color={colors.text} strokeWidth={2.5} />
                )}
                <Text
                  style={[
                    styles.followPillButtonText,
                    { color: isFollowing ? (theme === 'light' ? '#FF6B35' : '#0EA5E9') : colors.text },
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendIconButton}
                onPress={() => {
                  console.log('[ProfileView] Send button pressed - opening self-test chat');
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/connect/chat/self-test' as any);
                }}
                activeOpacity={0.7}
              >
                <SendIcon size={18} color={colors.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bioSection}>
          {isEditMode ? (
            <TextInput
              style={[styles.bioInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={editedBio}
              onChangeText={setEditedBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : bio ? (
            <Text style={[styles.bioText, { color: colors.text }]}>{bio}</Text>
          ) : (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              No bio yet
            </Text>
          )}
        </View>
        
        <View style={styles.focusAreasSection}>
          <View style={styles.focusAreas}>
            {profile.focusAreas.map((area) => (
              <View
                key={area}
                style={[
                  styles.focusChip,
                  {
                    backgroundColor: FOCUS_AREA_COLORS[area] + '30',
                    borderWidth: 2,
                    borderColor: FOCUS_AREA_COLORS[area],
                  },
                ]}
              >
                <Text style={styles.focusEmoji}>
                  {FOCUS_AREA_INFO[area].emoji}
                </Text>
                <Text
                  style={[
                    styles.focusText,
                    { color: FOCUS_AREA_COLORS[area] },
                  ]}
                >
                  {FOCUS_AREA_INFO[area].title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Hand size={20} color="#FF6B35" strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Intentions</Text>
          </View>
          {isEditMode ? (
            <TouchableOpacity
              style={[styles.intentionsEditCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                router.push('/profile/intentions');
              }}
              activeOpacity={0.7}
            >
              {profile.intentions && profile.intentions.length > 0 ? (
                <View style={styles.intentionsListContainer}>
                  {profile.intentions.map((intention, index) => (
                    <View
                      key={index}
                      style={[styles.intentionChip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    >
                      <Text style={[styles.intentionChipText, { color: colors.text }]}>{intention}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.intentionsEmptyCentered}>
                  <Target size={24} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Tap to set intentions
                  </Text>
                </View>
              )}
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} style={styles.chevronIcon} />
            </TouchableOpacity>
          ) : profile.intentions && profile.intentions.length > 0 ? (
            <View style={styles.intentionsFloatingList}>
              {profile.intentions.map((intention, index) => (
                <Text
                  key={index}
                  style={[styles.floatingText, { color: colors.text }]}
                >
                  • {intention}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.floatingText, { color: colors.textSecondary }]}>
              No intentions set yet
            </Text>
          )}
        </View>

        {isEditMode && (
          <View style={styles.editActionsContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleCancelEdit}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={handleSaveEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MessageCircle size={20} color="#10B981" strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shared Stories</Text>
          </View>
          {(() => {
            const allUserStories = getPosts().filter(post => post.authorUserId === profile?.id);
            const storiesToShow = allUserStories.filter(post => 
              highlightedSharedStoryIds.includes(post.id)
            );
            
            if (storiesToShow.length === 0) {
              return (
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No shared stories yet
                </Text>
              );
            }
            
            return (
              <View style={styles.sharedStoriesContainer}>
                {storiesToShow.map((post) => {
                  const section = INSPO_SECTIONS.find(s => s.id === post.sectionId);
                  const categoryColors = getCategoryColors(post.sectionId);
                  const isLiked = false;
                  const isBookmarked = false;
                  
                  return (
                    <TouchableOpacity
                      key={post.id}
                      style={[styles.storyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      activeOpacity={0.8}
                      onPress={() => router.push('/inspo/shared-inspo')}
                    >
                      <View style={[styles.storyCategoryBadge, { backgroundColor: categoryColors.background, borderColor: categoryColors.border }]}>
                        <Text style={[styles.storyCategoryBadgeText, { color: categoryColors.text }]}>
                          {section?.emoji} {post.isTopStory ? 'TOP STORY' : (section?.label || 'Story').toUpperCase()}
                        </Text>
                      </View>
                      
                      <Text style={[styles.storyTitle, { color: colors.text }]}>{post.title}</Text>
                      <Text style={[styles.storyBody, { color: colors.textSecondary }]} numberOfLines={3}>
                        {post.body}
                      </Text>
                      
                      <View style={styles.storyTags}>
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <View key={index} style={[styles.storyTag, { backgroundColor: colors.backgroundSecondary }]}>
                            <Text style={[styles.storyTagText, { color: colors.text }]}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.storyStats}>
                        <View style={styles.storyStat}>
                          <Heart size={14} color={isLiked ? colors.tint : colors.textSecondary} fill={isLiked ? colors.tint : 'transparent'} strokeWidth={2} />
                          <Text style={[styles.storyStatText, { color: colors.textSecondary }]}>{post.likes}</Text>
                        </View>
                        <View style={styles.storyStat}>
                          <MessageCircle size={14} color={colors.textSecondary} strokeWidth={2} />
                          <Text style={[styles.storyStatText, { color: colors.textSecondary }]}>{post.commentsCount}</Text>
                        </View>
                        <View style={styles.storyStat}>
                          <Bookmark size={14} color={isBookmarked ? colors.tint : colors.textSecondary} fill={isBookmarked ? colors.tint : 'transparent'} strokeWidth={2} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })()}
        </View>

        {(() => {
          const poemsOnProfile = journalEntries.filter(
            (entry) => entry.category === 'poems' && entry.showOnProfile === true
          );
          
          if (poemsOnProfile.length === 0) return null;
          
          return (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Feather size={20} color="#EF4444" strokeWidth={2} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Shared Poetry</Text>
              </View>
              <View style={styles.sharedStoriesContainer}>
                {poemsOnProfile.slice(0, 3).map((poem) => {
                  const getDisplayTitle = () => {
                    if (poem.title && poem.title.trim().length > 0) {
                      return poem.title;
                    }
                    return poem.sendTarget === 'partner' ? 'Sent Poem' : 'Saved Poem';
                  };
                  
                  return (
                    <TouchableOpacity
                      key={poem.id}
                      style={[styles.storyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      activeOpacity={0.8}
                      onPress={() => router.push('/profile/shared-memories' as any)}
                    >
                      <View style={styles.poemCardHeader}>
                        <View style={[styles.storyCategoryBadge, { backgroundColor: '#EF444420', borderColor: '#EF4444', marginBottom: 0 }]}>
                          <Text style={[styles.storyCategoryBadgeText, { color: '#EF4444' }]}>
                            POEM
                          </Text>
                        </View>
                        <Text style={[styles.poemDateTopRight, { color: colors.textSecondary }]}>
                          {new Date(poem.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                      
                      <Text style={[styles.storyTitle, { color: colors.text }]}>{getDisplayTitle()}</Text>
                      <Text style={[styles.poemFullBody, { color: colors.textSecondary }]}>
                        {poem.content}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })()}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Link2 size={20} color="#60A5FA" strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Partner Sync</Text>
          </View>
          <View style={[styles.partnerModeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.partnerModeDescription, { color: colors.textSecondary }]}>
              Invite your partner to share Today&apos;s Spark and see each other&apos;s progress.
            </Text>
            
            {partnerGroup ? (
              <>
                <View style={[styles.partnerConnected, { backgroundColor: colors.success + '20' }]}>
                  <Check size={20} color={colors.success} />
                  <Text style={[styles.partnerConnectedText, { color: colors.success }]}>Partner Connected</Text>
                </View>
                <TouchableOpacity
                  style={[styles.sendSparkButton, { backgroundColor: colors.tint }]}
                  onPress={handleSendSpark}
                  activeOpacity={0.8}
                >
                  <SendIcon size={18} color="#FFFFFF" />
                  <Text style={styles.sendSparkButtonText}>Send Spark?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.partnerInputRow}>
                  <TextInput
                    style={[styles.partnerCodeInput, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
                    placeholder="ENTER 6-DIGIT CODE"
                    placeholderTextColor={theme === 'light' ? '#9A8D7E' : colors.textSecondary}
                    value={joinCode}
                    onChangeText={(text) => {
                      setJoinCode(text.toUpperCase());
                      setJoinError('');
                    }}
                    maxLength={6}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: colors.tint }]}
                    onPress={handleJoinWithCode}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.joinButtonText}>Join</Text>
                  </TouchableOpacity>
                </View>
                {joinError ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>{joinError}</Text>
                ) : null}
                
                <Text style={[styles.joinOrGenerateText, { color: colors.textSecondary }]}>Join with partner&apos;s code or generate code!</Text>
                
                {codeGenerated ? (
                  <View style={[styles.generatedCodeContainer, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <Text style={[styles.generatedCode, { color: colors.tint }]}>{partnerCode}</Text>
                    <View style={styles.codeActions}>
                      <TouchableOpacity
                        style={[styles.codeActionButton, { backgroundColor: colors.card, borderColor: colors.tint + '40' }]}
                        onPress={() => {
                          if (Platform.OS === 'web') {
                            navigator.clipboard.writeText(partnerCode);
                          } else {
                            Clipboard.setString(partnerCode);
                          }
                          if (Platform.OS !== 'web') {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Copy size={16} color={colors.tint} />
                        <Text style={[styles.codeActionText, { color: colors.tint }]}>Copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.codeActionButton, { backgroundColor: colors.card, borderColor: colors.tint + '40' }]}
                        activeOpacity={0.7}
                      >
                        <Share2 size={16} color={colors.tint} />
                        <Text style={[styles.codeActionText, { color: colors.tint }]}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.generateButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    onPress={handleGenerateCode}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.generateButtonText, { color: colors.text }]}>Generate Invite Code</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        <StudioRings
          streakDays={profile.streak}
          streakGoal={7}
          xp={profile.totalXP}
          xpGoal={500}
        />
      </ScrollView>

      <ImageCropper
        visible={cropperVisible}
        imageUri={selectedImageUri}
        onSave={handleCropSave}
        onCancel={handleCropCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.md,
  },
  topBarBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarLogo: {
    width: 140,
    height: 42,
  },
  topBarMenuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: '100%',
    height: 2.5,
    borderRadius: 2,
  },
  profileContainer: {
    marginBottom: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingRight: HEADER_RIGHT_INSET,
  },
  nameContainer: {
    maxWidth: '60%',
    flexShrink: 1,
  },
  titleContainer: {
    flexShrink: 0,
    paddingLeft: SPACING.sm,
    marginRight: 0,
  },
  titleText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontStyle: 'italic' as const,
    fontWeight: TYPOGRAPHY.weights.medium,
    opacity: 0.8,
  },
  fullName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
  },
  fullNameInput: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
    minWidth: 200,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
    paddingBottom: 0,
    marginBottom: 0,
    position: 'relative',
  },
  avatarGlowContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
    width: 96,
    height: 96,
  },
  badgeDockContainer: {
    position: 'absolute',
    right: 0,
    top: SPACING.xs,
    width: BADGE_DOCK_WIDTH,
    height: AVATAR_SIZE,
    zIndex: 1,
  },
  badgeDockInner: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: BADGE_ROW_GAP,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: BADGE_GAP,
    justifyContent: 'flex-end',
  },
  badge: {
    width: 10,
    height: 15,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
  },
  badgeThirdLeft: {
    width: '33.33%',
    height: '100%',
  },
  badgeThirdCenter: {
    width: '33.34%',
    height: '100%',
  },
  badgeThirdRight: {
    width: '33.33%',
    height: '100%',
  },
  avatarGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    zIndex: 0,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  profileUsername: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.text,
    marginBottom: SPACING.xs,
  },
  usernameInput: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.text,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs - 2,
    marginBottom: SPACING.xs - 4,
    textAlign: 'center',
    minWidth: 150,
  },
  editLinkContainer: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  editLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.tint,
  },
  profileStatus: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'uppercase' as const,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: 0.5,
    marginBottom: 0,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
    marginBottom: SPACING.sm,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs - 2,
  },
  focusEmoji: {
    fontSize: 12,
  },
  focusText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  intentionsListContainer: {
    gap: SPACING.xs - 2,
    marginBottom: SPACING.md,
  },
  intentionsEditCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  intentionsEmptyCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  intentionChip: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.md,
  },
  intentionChipText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: SPACING.sm,
  },
  partnerModeCard: {
    backgroundColor: Colors.dark.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: SPACING.sm,
  },
  partnerModeDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  partnerConnected: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.xs,
    backgroundColor: Colors.dark.success + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  partnerConnectedText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.success,
  },
  sendSparkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  sendSparkButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  joinOrGenerateText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: Colors.dark.textSecondary,
    textAlign: 'center' as const,
  },
  partnerInputRow: {
    flexDirection: 'row' as const,
    gap: SPACING.sm,
  },
  partnerCodeInput: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundSecondary,
    color: Colors.dark.text,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    textAlign: 'center' as const,
    letterSpacing: 2,
  },
  joinButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  joinButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: Colors.dark.error,
    marginTop: SPACING.xs,
  },
  generatedCodeContainer: {
    backgroundColor: Colors.dark.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center' as const,
  },
  generatedCode: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: Colors.dark.tint,
    letterSpacing: 4,
    marginBottom: SPACING.sm,
  },
  codeActions: {
    flexDirection: 'row' as const,
    gap: SPACING.sm,
  },
  codeActionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '40',
  },
  codeActionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.tint,
  },
  generateButton: {
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  generateButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: Colors.dark.text,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  checkInCard: {
    backgroundColor: Colors.dark.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: SPACING.sm,
    flexDirection: 'column',
  },
  checkInDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  checkInButton: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkInButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
  checkedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkedInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    flex: 1,
  },
  checkedInPillText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
  },
  horoscopeSnapshotCard: {
    backgroundColor: Colors.dark.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  horoscopeSnapshotContent: {
    flex: 1,
  },
  horoscopeSnapshotTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
  },
  horoscopeSnapshotTease: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  horoscopeSnapshotAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  horoscopeSnapshotLink: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  floatingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
  },
  intentionsFloatingList: {
    gap: SPACING.xs,
  },
  bioSection: {
    marginTop: 0,
    marginBottom: SPACING.sm,
    paddingTop: 0,
  },
  bioText: {
    fontSize: TYPOGRAPHY.sizes.md - 1,
    lineHeight: 22,
  },
  focusAreasSection: {
    marginBottom: SPACING.sm,
  },
  followStatsSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  followStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs - 2,
    paddingVertical: SPACING.xs - 1,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minWidth: 100,
  },
  followPillButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  followActionsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.xs,
  },
  sendIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  followStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followStatCount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  followStatLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  followStatDot: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginHorizontal: SPACING.sm,
    opacity: 0.5,
  },
  bioInput: {
    fontSize: TYPOGRAPHY.sizes.md - 1,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    minHeight: 100,
  },
  sharedStoriesContainer: {
    gap: SPACING.md,
  },
  storyCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  storyHeader: {
    marginBottom: SPACING.xs,
  },
  storySectionBadge: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  storyTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  storyBody: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  storyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs - 2,
    marginBottom: SPACING.sm,
  },
  storyTag: {
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
  },
  storyTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  storyStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  storyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  storyStatText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  editActionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  storyCategoryBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start' as const,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  storyCategoryBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
  },
  storyAuthor: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
  },
  poemDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.sm,
  },
  poemCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.sm,
  },
  poemDateTopRight: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  poemFullBody: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.md - 1,
    lineHeight: 22,
  },
});
