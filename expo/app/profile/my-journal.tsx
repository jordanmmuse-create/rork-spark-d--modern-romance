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
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, X, Trash2 } from 'lucide-react-native';

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
  getCategorizedTitle: (date: string) => string;
  getEntryGlimpse: (content: string) => string;
}

function SwipeableEntry({ entry, colors, onPress, onDelete, getCategorizedTitle, getEntryGlimpse }: SwipeableEntryProps) {
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
                  {getCategorizedTitle(entry.createdAt)}
                </Text>
                
                <Text style={[styles.entryGlimpse, { color: colors.textSecondary }]} numberOfLines={3}>
                  {getEntryGlimpse(entry.content)}
                </Text>
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

export default function MyJournalScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();
  const { journalEntries, deleteJournalEntry } = useAppStore();
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const journalOnlyEntries = journalEntries
    .filter(entry => entry.category === 'journal')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getCategorizedTitle = (entryDate: string): string => {
    const entryDateOnly = entryDate.split('T')[0];
    const entriesOnSameDay = journalOnlyEntries.filter(e => 
      e.createdAt.split('T')[0] === entryDateOnly
    );

    if (entriesOnSameDay.length > 1) {
      return 'Moment Reflection';
    }

    const entryDateObj = new Date(entryDate);
    const weekStart = new Date(entryDateObj);
    weekStart.setDate(entryDateObj.getDate() - entryDateObj.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const entriesInSameWeek = journalOnlyEntries.filter(e => {
      const eDate = new Date(e.createdAt);
      return eDate >= weekStart && eDate <= weekEnd;
    });

    const uniqueDaysInWeek = new Set(
      entriesInSameWeek.map(e => e.createdAt.split('T')[0])
    ).size;

    if (uniqueDaysInWeek > 1) {
      return 'Daily Reflection';
    }

    return 'Weekly Reflection';
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
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'My Journal',
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
        <View style={styles.headerSection}>
          <BookOpen size={32} color="#10B981" strokeWidth={2} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Pages In Time</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Revisit the moments that moved you
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addEntryButton, { backgroundColor: '#10B981' }]}
          onPress={() => router.push('/profile/journal-entry' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.addEntryButtonText}>Add An Entry</Text>
        </TouchableOpacity>

        {journalOnlyEntries.length > 0 && (
          <View style={styles.entriesList}>
            {journalOnlyEntries.map((entry) => (
              <SwipeableEntry
                key={entry.id}
                entry={entry}
                colors={colors}
                onPress={() => {
                  setSelectedEntry(entry);
                  setModalVisible(true);
                }}
                onDelete={() => deleteJournalEntry(entry.id)}
                getCategorizedTitle={getCategorizedTitle}
                getEntryGlimpse={getEntryGlimpse}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={{ width: 40 }} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Journal Entry</Text>
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

              <Text style={[styles.modalCategory, { color: '#10B981' }]}>
                {getCategorizedTitle(selectedEntry.createdAt)}
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
    gap: SPACING.md,
  },
  entryCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
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
    marginBottom: SPACING.md,
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
    marginTop: SPACING.lg,
  },
});
