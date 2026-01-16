import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Modal,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Images, X, Trash2, ChevronLeft, Lightbulb, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '@/store/appStore';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/colors';


const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;

interface SwipeableEntryProps {
  entry: any;
  colors: any;
  onPress: () => void;
  onDelete: () => void;
  onToggleShowOnProfile?: () => void;
  getCategorizedTitle: (entry: any) => string;
  getEntryGlimpse: (content: string) => string;
  getCategoryColor: (category: string) => string;
  getCategoryLabel: (category: string) => string;
}

function SwipeableEntry({ entry, colors, onPress, onDelete, onToggleShowOnProfile, getCategorizedTitle, getEntryGlimpse, getCategoryColor, getCategoryLabel }: SwipeableEntryProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        setSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, SWIPE_THRESHOLD * 1.5));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setSwiping(false);
        if (gestureState.dx < SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: SWIPE_THRESHOLD,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  const handlePress = () => {
    if (!swiping) {
      const currentValue = (translateX as any)._value;
      if (currentValue < -10) {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else {
        onPress();
      }
    }
  };

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.deleteBackground, { backgroundColor: '#EF4444' }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={24} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      <Animated.View
        style={[{ transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <View
            style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {entry.category === 'poems' && onToggleShowOnProfile && (
              <TouchableOpacity
                style={[
                  styles.showOnProfilePill,
                  entry.showOnProfile
                    ? { backgroundColor: '#EF444420', borderColor: '#EF4444' }
                    : { backgroundColor: colors.surfaceAlt, borderColor: colors.border }
                ]}
                onPressIn={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  onToggleShowOnProfile();
                }}
                activeOpacity={0.7}
              >
                {entry.showOnProfile && (
                  <Check size={12} color="#EF4444" strokeWidth={2.5} />
                )}
                <Text style={[
                  styles.showOnProfilePillText,
                  { color: entry.showOnProfile ? '#EF4444' : colors.textSecondary }
                ]}>
                  {entry.showOnProfile ? 'On Profile' : 'Show on profile'}
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.entryCardContent}>
              <View style={styles.entryTextSection}>
                <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
                  {new Date(entry.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }).toUpperCase()}
                </Text>
                
                <Text style={[styles.entryTitle, { color: colors.text }]}>
                  {getCategorizedTitle(entry)}
                </Text>
                
                <Text 
                  style={[styles.entryGlimpse, { color: colors.textSecondary }]} 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {getEntryGlimpse(entry.content)}
                </Text>

                <View style={[styles.categoryPill, { backgroundColor: getCategoryColor(entry.category || 'notes') + '30', borderColor: getCategoryColor(entry.category || 'notes') }]}>
                  <Text style={[styles.categoryPillText, { color: getCategoryColor(entry.category || 'notes') }]}>
                    {getCategoryLabel(entry.category || 'notes')}
                  </Text>
                </View>
              </View>
              
              {entry.attachmentUri && (
                <Image
                  source={{ uri: entry.attachmentUri }}
                  style={styles.entryThumbnail}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function SharedMemoriesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { journalEntries, deleteJournalEntry, togglePoemShowOnProfile } = useAppStore();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);


  console.log('[SharedMemories] Component mounted - Header bar should be visible');
  console.log('[SharedMemories] Total memory entries:', journalEntries.filter(e => e.category === 'notes' || e.category === 'love_letter' || e.category === 'poems').length);

  const memoryEntries = journalEntries
    .filter(entry => entry.category === 'notes' || entry.category === 'love_letter' || entry.category === 'poems')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  const getCategorizedTitle = (entry: any): string => {
    if (entry.title && entry.title.trim().length > 0) {
      return entry.title;
    }

    const category = entry.category;
    const sendTarget = entry.sendTarget;

    if (category === 'notes') {
      return sendTarget === 'partner' ? 'Sweet Nothings' : 'Note To Self';
    } else if (category === 'love_letter') {
      return sendTarget === 'partner' ? 'Sent Letter' : 'Saved Letter';
    } else if (category === 'poems') {
      return sendTarget === 'partner' ? 'Sent Poem' : 'Saved Poem';
    }

    return 'Moment Reflection';
  };

  const getCategoryColor = (category: string): string => {
    if (category === 'notes') return '#FF6B35';
    if (category === 'love_letter') return '#60A5FA';
    if (category === 'poems') return '#EF4444';
    return '#9CA3AF';
  };

  const getCategoryLabel = (category: string): string => {
    if (category === 'notes') return 'Note';
    if (category === 'love_letter') return 'Letter';
    if (category === 'poems') return 'Poem';
    return 'Memory';
  };

  const getEntryGlimpse = (content: string): string => {
    if (content.length > 120) {
      return content.substring(0, 120) + '...';
    }
    return content;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + SPACING.md,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              console.log('[SharedMemories] Back pressed');
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
            style={[styles.backButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={colors.text} strokeWidth={2.5} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Shared Memories</Text>
          </View>

          <View style={styles.headerRight} />
        </View>
      </View>
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: SPACING.md,
            paddingBottom: insets.bottom + 140,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Images size={32} color="#F97316" strokeWidth={2} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>For Your Reflection</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Photos, notes & inside jokes you&apos;ve captured
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addEntryButton, { backgroundColor: '#F97316' }]}
          onPress={() => router.push('/profile/shared-memories-entry' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.addEntryButtonText}>Add An Entry</Text>
        </TouchableOpacity>

        {memoryEntries.length > 0 && (
          <View style={styles.entriesList}>
            {memoryEntries.map((entry) => (
              <SwipeableEntry
                key={entry.id}
                entry={entry}
                colors={colors}
                onPress={() => {
                  setSelectedEntry(entry);
                  setModalVisible(true);
                }}
                onDelete={() => deleteJournalEntry(entry.id)}
                onToggleShowOnProfile={entry.category === 'poems' ? () => togglePoemShowOnProfile(entry.id) : undefined}
                getCategorizedTitle={getCategorizedTitle}
                getEntryGlimpse={getEntryGlimpse}
                getCategoryColor={getCategoryColor}
                getCategoryLabel={getCategoryLabel}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomButtonContainer,
          {
            paddingBottom: insets.bottom + SPACING.md,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.sharedInspoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push('/inspo/shared-inspo' as any);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.sharedInspoIconContainer, { backgroundColor: '#10B981' + '20' }]}>
            <Lightbulb size={32} color="#10B981" strokeWidth={2} />
          </View>
          
          <View style={styles.sharedInspoContent}>
            <Text style={[styles.sharedInspoTitle, { color: colors.text }]}>
              Shared Inspo
            </Text>
            <Text style={[styles.sharedInspoDescription, { color: colors.textSecondary }]}>
              The stories you&apos;ve shared
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={{ width: 40 }} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Shared Memory</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {selectedEntry && (
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={[
                styles.modalContent,
                { paddingBottom: insets.bottom + SPACING.xl }
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalDate, { color: colors.textSecondary }]}>
                {new Date(selectedEntry.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>

              <Text style={[styles.modalCategory, { color: '#F97316' }]}>
                {getCategorizedTitle(selectedEntry)}
              </Text>

              <Text style={[styles.modalText, { color: colors.text }]}>
                {selectedEntry.content}
              </Text>

              {selectedEntry.attachmentUri && (
                <Image
                  source={{ uri: selectedEntry.attachmentUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              )}
            </ScrollView>
          )}
        </View>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    pointerEvents: 'none',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerRight: {
    minWidth: 44,
    height: 44,
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pageSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  entriesList: {
    gap: SPACING.sm,
  },
  entryCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    position: 'relative' as const,
  },
  showOnProfilePill: {
    position: 'absolute' as const,
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    zIndex: 10,
  },
  showOnProfilePillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  entryCardContent: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  entryTextSection: {
    flex: 1,
  },
  entryThumbnail: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  entryDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  entryTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  entryGlimpse: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  addEntryButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  addEntryButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  swipeContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalCategory: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.lg,
  },
  modalText: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    marginTop: SPACING.sm,
  },
  categoryPillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sharedInspoButton: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  sharedInspoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedInspoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sharedInspoTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
  },
  sharedInspoDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
});
