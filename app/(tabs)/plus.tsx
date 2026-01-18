import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTabScroll } from './_layout';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Platform,
  FlatList,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Plus, Map, Calendar as CalendarIcon, MessageCircle, Link2, LockKeyhole, Play, CheckCircle2, Circle, X, ChevronLeft, ChevronRight, Wrench, Cloud, Trash2, Star, Bot, Users, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/appStore';
import { FOCUS_AREA_INFO } from '@/constants/data';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, FOCUS_AREA_COLORS } from '@/constants/colors';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Journey, CoachProfile, CalendarEvent } from '@/types';
import { SEED_COACHES, SEED_CALENDAR_EVENTS } from '@/constants/plus-data';
import UnreadMailIcon from '@/components/UnreadMailIcon';


const SCREEN_WIDTH = Dimensions.get('window').width;
const COACH_CARD_WIDTH = SCREEN_WIDTH * 0.42;

export default function PlusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useThemeStyles();
  const { getJourneys, userJourneys, startJourney, addCalendarEvent, calendarEvents, toggleEventComplete, deleteCalendarEvent, scheduleCoachingSession, syncProfileDatesToCalendar, profile, checkIns } = useAppStore();
  const unreadMessagesCount = useAppStore((state) => state.getUnreadCountByScope('chats'));
  const isNavigatingToMessagesRef = useRef<boolean>(false);
  const journeys = getJourneys();
  const scrollRef = useRef<ScrollView>(null);
  const { registerScroll } = useTabScroll();
  const hasSeededCalendar = useRef(false);
  const hasSyncedProfile = useRef(false);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [showCoachDetail, setShowCoachDetail] = useState<CoachProfile | null>(null);
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventType, setNewEventType] = useState<'date' | 'coaching' | 'milestones' | 'workshops' | 'gamenight' | 'special'>('date');
  const [newEventTime, setNewEventTime] = useState<Date>(() => {
    const defaultTime = new Date();
    defaultTime.setHours(19, 0, 0, 0);
    return defaultTime;
  });
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [selectedJourneyType, setSelectedJourneyType] = useState<'devotional' | 'workshop'>('workshop');
  const [showJourneyDetail, setShowJourneyDetail] = useState<Journey | null>(null);
  const [showMessagesIcon, setShowMessagesIcon] = useState<boolean>(false);
  const lastLogoTapRef = useRef<number>(0);
  const DOUBLE_TAP_DELAY = 300;

  useEffect(() => {
    registerScroll('plus', scrollRef);
  }, [registerScroll]);

  const handleLogoTap = useCallback(() => {
    const now = Date.now();
    if (now - lastLogoTapRef.current < DOUBLE_TAP_DELAY) {
      console.log('[Plus] Double tap on logo - showing messages icon');
      setShowMessagesIcon(true);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    lastLogoTapRef.current = now;
  }, []);
  
  const handleMessageIconPress = useCallback(() => {
    if (isNavigatingToMessagesRef.current) return;
    isNavigatingToMessagesRef.current = true;
    console.log('[Plus] Navigate to unified messages');
    router.push('/connect/unified-messages' as any);
    setTimeout(() => {
      isNavigatingToMessagesRef.current = false;
    }, 500);
  }, [router]);
  
  const handleMessageIconDoubleTap = useCallback(() => {
    console.log('[Plus] Double tap on message icon - showing logo');
    setShowMessagesIcon(false);
  }, []);
  
  const filteredJourneys = useMemo(() => {
    const filtered = journeys.filter((journey) => {
      const matchesType = journey.journeyType === selectedJourneyType;
      return matchesType;
    });
    return filtered.slice(0, 3);
  }, [journeys, selectedJourneyType]);
  
  useEffect(() => {
    if (!hasSeededCalendar.current && calendarEvents.length === 0) {
      hasSeededCalendar.current = true;
      SEED_CALENDAR_EVENTS.forEach(event => {
        addCalendarEvent(event);
      });
    }
  }, [calendarEvents.length, addCalendarEvent]);
  
  useEffect(() => {
    if (!hasSyncedProfile.current && profile && (profile.birthday || profile.partnerBirthday || profile.anniversary)) {
      const hasBirthdayEvents = calendarEvents.some(e => e.linkedId === 'birthday' || e.linkedId === 'partner-birthday' || e.linkedId === 'anniversary');
      if (!hasBirthdayEvents) {
        hasSyncedProfile.current = true;
        syncProfileDatesToCalendar();
      }
    }
  }, [profile, calendarEvents, syncProfileDatesToCalendar]);

  const handleStartJourney = (journeyId: string) => {
    startJourney(journeyId);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    
    const hours = newEventTime.getHours();
    const minutes = newEventTime.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    addCalendarEvent({
      type: newEventType,
      title: newEventTitle,
      date: selectedDate.toISOString(),
      time: timeString,
      completed: false,
    });
    
    setNewEventTitle('');
    const defaultTime = new Date();
    defaultTime.setHours(19, 0, 0, 0);
    setNewEventTime(defaultTime);
    setShowAddEvent(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleScheduleSession = (coach: CoachProfile, sessionTypeId: string) => {
    const sessionType = coach.availableSessionTypes.find(t => t.id === sessionTypeId);
    if (!sessionType) return;
    
    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    scheduleCoachingSession({
      coachId: coach.id,
      coachName: coach.name,
      sessionTypeId: sessionType.id,
      sessionTypeName: sessionType.name,
      scheduledAt,
      status: 'scheduled',
    });
    
    setShowCoachDetail(null);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const isValentinesDay = (date: Date) => {
    return date.getMonth() === 1 && date.getDate() === 14;
  };

  const days = getDaysInMonth(currentMonth);
  const eventsForSelectedDate = getEventsForDate(selectedDate);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isSelectedDateValentines = isValentinesDay(selectedDate);
  
  const isSelectedDateToday = selectedDate.toDateString() === new Date().toDateString();
  const hasCheckedInToday = checkIns.some(checkIn => {
    const checkInDate = new Date(checkIn.createdAt).toDateString();
    const today = new Date().toDateString();
    return checkInDate === today;
  });
  const canViewHoroscope = profile?.astrologyEnabled && hasCheckedInToday && isSelectedDateToday;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Sparkles size={28} color={colors.tint} strokeWidth={2} />
            <Text style={[styles.title, { color: colors.text }]}>Plus</Text>
          </View>
          <View style={styles.headerRight}>
            {showMessagesIcon ? (
              <View style={styles.headerMessagesIconWrapper}>
                <UnreadMailIcon
                  onPress={handleMessageIconPress}
                  onDoubleTap={handleMessageIconDoubleTap}
                  color={colors.text}
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleLogoTap}
                activeOpacity={0.7}
                style={styles.headerLogoButton}
              >
                <Image
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/edf83u29uve9bh7xd09yg' }}
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Journeys, planner & growth tools
        </Text>

        <Text style={[styles.mantra, { color: colors.text }]}>
          A Journey Guided Toward Connection
        </Text>

        <View style={styles.section}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/s2mpmwp6ta1lsxocbg37p' }}
            style={styles.lineSeparator}
            resizeMode="contain"
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>+ Journeys</Text>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: '#1988B220' }]}>
              <Map size={24} color="#1988B2" />
            </View>
          </View>

          <View style={styles.subsectionContainer}>
            <View style={styles.subsectionHeader}>
              <CalendarIcon size={19} color="#1988B2" />
              <Text style={[styles.subsectionTitleLarge, { color: colors.text }]}>Life Studio</Text>
              <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.tint + '20' }]}
                onPress={() => setShowSyncModal(true)}
                activeOpacity={0.7}
              >
                <Cloud size={14} color={colors.tint} />
                <Text style={[styles.syncButtonText, { color: colors.tint }]}>Sync</Text>
              </TouchableOpacity>
            </View>
          
          <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
                style={styles.monthNavButton}
              >
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: colors.text }]}>{monthName}</Text>
              <TouchableOpacity
                onPress={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
                style={styles.monthNavButton}
              >
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.weekDaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={[styles.weekDayText, { color: colors.textSecondary }]}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.daysGrid}>
              {days.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
                
                const isSelected = selectedDate.toDateString() === day.toDateString();
                const isToday = new Date().toDateString() === day.toDateString();
                const isValentines = isValentinesDay(day);
                const dayEvents = getEventsForDate(day);
                const hasEvents = dayEvents.length > 0;
                const eventColors = dayEvents.slice(0, 3).map(e => getEventColor(e.type, colors));
                const specialOccasionsColor = '#C9A27E';
                
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && [styles.dayCellSelected, { backgroundColor: colors.tint, borderColor: 'transparent' }],
                      isToday && !isSelected && [styles.dayCellToday, { borderColor: colors.tint }],
                      isValentines && !isSelected && !isToday && [styles.dayCellValentines, { borderColor: specialOccasionsColor }],
                    ]}
                    onPress={() => setSelectedDate(day)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: colors.text },
                        isSelected && styles.dayTextSelected,
                        isToday && !isSelected && [styles.dayTextToday, { color: colors.tint }],
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    {hasEvents && (
                      <View style={styles.eventDotsContainer}>
                        {eventColors.map((color, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.eventDot,
                              { backgroundColor: color },
                              isSelected && styles.eventDotSelected,
                            ]}
                          />
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={[styles.eventsSection, { borderTopColor: colors.border }]}>
              <View style={styles.eventsSectionHeader}>
                <Text style={[styles.eventsSectionTitle, { color: colors.text }]}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <TouchableOpacity
                  style={[styles.addEventButton, { backgroundColor: colors.tint + '20' }]}
                  onPress={() => setShowAddEvent(true)}
                  activeOpacity={0.7}
                >
                  <Plus size={16} color={colors.tint} />
                  <Text style={[styles.addEventText, { color: colors.tint }]}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {eventsForSelectedDate.length === 0 ? (
                <Text style={[styles.noEventsText, styles.noEventsTextCompact, { color: colors.textSecondary }]}>
                  {isSelectedDateValentines ? "Create Valentines Day Plans!" : "No events scheduled"}
                </Text>
              ) : (
                <View style={styles.eventsList}>
                  {eventsForSelectedDate.map((event) => (
                    <SwipeableEventItem
                      key={event.id}
                      event={event}
                      onToggleComplete={() => toggleEventComplete(event.id)}
                      onDelete={() => {
                        Alert.alert(
                          'Delete Event',
                          `Are you sure you want to delete "${event.title}"?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                deleteCalendarEvent(event.id);
                                if (Platform.OS !== 'web') {
                                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                }
                              },
                            },
                          ]
                        );
                      }}
                    />
                  ))}
                </View>
              )}
              
              {isSelectedDateToday && (
                <>
                  {!hasCheckedInToday ? (
                    <TouchableOpacity
                      onPress={() => {
                        console.log('[Plus] Navigate to vault check-in with scroll');
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.push({ pathname: '/profile', params: { scrollToCheckIn: 'true' } } as any);
                      }}
                      activeOpacity={0.7}
                      style={styles.horoscopeLink}
                    >
                      <Text style={[styles.horoscopeLinkText, { color: colors.accent }]}>Submit A Check-In &gt;</Text>
                    </TouchableOpacity>
                  ) : canViewHoroscope ? (
                    <TouchableOpacity
                      onPress={() => {
                        console.log('[Plus] Navigate to horoscope');
                        if (Platform.OS !== 'web') {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.push('/profile/horoscope' as any);
                      }}
                      activeOpacity={0.7}
                      style={styles.horoscopeLink}
                    >
                      <Text style={[styles.horoscopeLinkText, { color: colors.accent }]}>View horoscope &gt;</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>
          </View>
          </View>

          <View style={styles.subsectionContainer}>
            <View style={styles.subsectionHeader}>
              <Wrench size={19} color="#007AFF" />
              <Text style={[styles.subsectionTitleLarge, { color: colors.text }]}>Growth Studio</Text>
            </View>
            
            <View style={[styles.journeyToggleContainer, { backgroundColor: colors.tint + '20', borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.journeyToggleButton,
                  { backgroundColor: 'transparent' },
                  selectedJourneyType === 'workshop' && [styles.journeyToggleButtonActive, { backgroundColor: colors.tint }],
                ]}
                onPress={() => setSelectedJourneyType('workshop')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.journeyToggleText,
                    { color: colors.textSecondary },
                    selectedJourneyType === 'workshop' && styles.journeyToggleTextActive,
                  ]}
                >
                  Workshops
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.journeyToggleButton,
                  { backgroundColor: 'transparent' },
                  selectedJourneyType === 'devotional' && [styles.journeyToggleButtonActive, { backgroundColor: colors.tint }],
                ]}
                onPress={() => setSelectedJourneyType('devotional')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.journeyToggleText,
                    { color: colors.textSecondary },
                    selectedJourneyType === 'devotional' && styles.journeyToggleTextActive,
                  ]}
                >
                  Devotionals
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.featuredHeader}>
              <Star size={17} color={colors.warning} fill={colors.warning} />
              <Text style={[styles.featuredTitleSmall, { color: colors.text }]}>Featured Journeys…</Text>
            </View>
            
          {filteredJourneys.map((journey) => {
            const userJourney = userJourneys.find(
              (uj) => uj.journeyId === journey.id
            );
            return (
              <JourneyCard
                key={journey.id}
                journey={journey}
                isActive={userJourney?.status === 'active'}
                progress={userJourney ? userJourney.completedDays.length : 0}
                onStart={() => handleStartJourney(journey.id)}
                onInfoPress={() => setShowJourneyDetail(journey)}
              />
            );
          })}
          
          <TouchableOpacity
            style={[styles.exploreJourneysButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/journeys/explore' as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.exploreJourneysText, { color: colors.text }]}>Explore Journeys!</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/e93jw6x3964lm3qocughu' }}
            style={styles.lineSeparator}
            resizeMode="contain"
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>+ Coaching</Text>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.success + '20' }]}>
              <MessageCircle size={24} color={colors.success} />
            </View>
          </View>
          
          <View style={styles.guidanceSubsection}>
            <View style={styles.subsectionHeader}>
              <User size={19} color={colors.success} />
              <Text style={[styles.guidanceSubsectionTitleLarge, { color: colors.text }]}>Support Studio</Text>
            </View>
            <Text style={[styles.subsectionDescription, { color: colors.textSecondary }]}>
              Connect with coaches, counselors, and relationship experts for personalized support.
            </Text>
            
            <FlatList
              data={SEED_COACHES}
              renderItem={({ item }) => (
                <CoachCard
                  coach={item}
                  onPress={() => setShowCoachDetail(item)}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coachesScrollContainer}
              snapToInterval={COACH_CARD_WIDTH + SPACING.md}
              decelerationRate="fast"
              snapToAlignment="start"
            />
            
            <TouchableOpacity
              style={[styles.seeCoachesButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                console.log('[Plus] Navigate to coaches');
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push('/connect/coaches' as any);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.seeCoachesText, { color: colors.text }]}>See Coaches</Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.guidanceSubsection}>
            <View style={styles.subsectionHeader}>
              <Bot size={19} color={colors.success} />
              <Text style={[styles.guidanceSubsectionTitleLarge, { color: colors.text }]}>inTELL Studio</Text>
            </View>
            <View style={styles.inTellGlowContainer}>
              <View style={[styles.inTellGlow, {
                backgroundColor: '#10B981',
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 32,
                elevation: 12,
              }]} />
              <View style={[styles.inTellCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.comingSoonBadge, { backgroundColor: colors.backgroundSecondary }]}>
                  <LockKeyhole size={14} color={colors.textSecondary} />
                  <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Coming Soon</Text>
                </View>
                <MessageCircle size={32} color={colors.textSecondary} strokeOpacity={0.5} />
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.textSecondary }]}>AI-Powered Guidance</Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    Get personalized advice and recommendations for your relationship
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/v9gwaknmz0m9c15sfnw4g' }}
            style={styles.lineSeparator}
            resizeMode="contain"
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>+ Connect</Text>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Link2 size={24} color={colors.warning} />
            </View>
          </View>

          <View style={styles.subsectionContainerLast}>
            <View style={styles.subsectionHeader}>
              <Users size={19} color={colors.warning} />
              <Text style={[styles.subsectionTitleLarge, { color: colors.text }]}>Social Studio</Text>
            </View>
            <Text style={[styles.subsectionDescription, { color: colors.textSecondary }]}>
              A space to meet others through thoughtful, interest-led conversation.
            </Text>

            <View style={styles.chatSpacesGlowContainer}>
              <View style={[
                styles.chatSpacesGlow,
                {
                  backgroundColor: '#FBBF24',
                  shadowColor: '#FBBF24',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 32,
                  elevation: 12,
                }
              ]} />
              <TouchableOpacity
                testID="plus-chat-spaces-card"
                style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  console.log('[Plus] Navigate to /connect');
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push('/connect' as any);
                }}
                activeOpacity={0.8}
              >
                <MessageCircle size={32} color={colors.warning} />

                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>Chat Spaces</Text>
                  <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                    Connect with people through prompts, rooms, and shared interests.
                  </Text>
                </View>

                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              {unreadMessagesCount > 0 && (
                <View style={styles.chatSpacesNotificationBadge}>
                  <Text style={styles.chatSpacesNotificationText}>
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      <Modal
        visible={showAddEvent}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddEvent(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Event</Text>
              <TouchableOpacity onPress={() => setShowAddEvent(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
              placeholder="Event title"
              placeholderTextColor={colors.textSecondary}
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />
            
            <View style={styles.timePickerContainer}>
              <Text style={[styles.timePickerLabel, { color: colors.text }]}>Time</Text>
              <DateTimePicker
                value={newEventTime}
                mode="time"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setNewEventTime(date);
                }}
                style={styles.timePicker}
                textColor={colors.text}
              />
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventTypeSelector}
            >
              {(['date', 'coaching', 'milestones', 'workshops', 'gamenight', 'special'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.eventTypeButton,
                    { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                    newEventType === type && [styles.eventTypeButtonActive, { backgroundColor: getEventColor(type, colors) + '20', borderColor: getEventColor(type, colors) }],
                  ]}
                  onPress={() => setNewEventType(type)}
                >
                  <Text
                    style={[
                      styles.eventTypeButtonText,
                      { color: colors.textSecondary },
                      newEventType === type && [styles.eventTypeButtonTextActive, { color: getEventColor(type, colors) }],
                    ]}
                  >
                    {getEventTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalSaveButton, { backgroundColor: colors.tint }]}
              onPress={handleAddEvent}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalSaveButtonText, { color: 'white' }]}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showSyncModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSyncModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sync Calendars</Text>
              <TouchableOpacity onPress={() => setShowSyncModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.syncModalDescription, { color: colors.textSecondary }]}>
              Connect your calendar to sync events and stay organized
            </Text>
            
            <TouchableOpacity
              style={[styles.syncOptionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={() => {
                console.log('Sync with Device Calendar');
                setShowSyncModal(false);
              }}
              activeOpacity={0.8}
            >
              <CalendarIcon size={24} color={colors.text} />
              <Text style={[styles.syncOptionText, { color: colors.text }]}>Sync with Device Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.syncOptionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              onPress={() => {
                console.log('Sync with Google Calendar');
                setShowSyncModal(false);
              }}
              activeOpacity={0.8}
            >
              <Cloud size={24} color={colors.text} />
              <Text style={[styles.syncOptionText, { color: colors.text }]}>Sync with Google Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showCoachDetail !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCoachDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {showCoachDetail && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{showCoachDetail.name}</Text>
                  <TouchableOpacity onPress={() => setShowCoachDetail(null)}>
                    <X size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                
                <Image
                  source={{ uri: showCoachDetail.photoUrl }}
                  style={styles.coachDetailPhoto}
                />
                
                <Text style={[styles.coachDetailCredentials, { color: colors.textSecondary }]}>{showCoachDetail.credentials}</Text>
                <Text style={[styles.coachDetailSpecialty, { color: colors.text }]}>{showCoachDetail.specialty}</Text>
                
                <View style={styles.coachDetailRating}>
                  <Text style={[styles.coachDetailRatingText, { color: colors.warning }]}>★ {showCoachDetail.rating}</Text>
                  <Text style={[styles.coachDetailReviewCount, { color: colors.textSecondary }]}>({showCoachDetail.reviewCount} reviews)</Text>
                </View>
                
                <Text style={[styles.coachDetailBio, { color: colors.text }]}>{showCoachDetail.bio}</Text>
                
                <View style={styles.coachDetailTags}>
                  {showCoachDetail.tags.map((tag) => (
                    <View key={tag} style={[styles.coachTag, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.coachTagText, { color: colors.success }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={[styles.sessionTypesTitle, { color: colors.text }]}>Available Sessions</Text>
                {showCoachDetail.availableSessionTypes.map((sessionType) => (
                  <TouchableOpacity
                    key={sessionType.id}
                    style={[styles.sessionTypeCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
                    onPress={() => handleScheduleSession(showCoachDetail, sessionType.id)}
                    activeOpacity={0.8}
                  >
                    <View>
                      <Text style={[styles.sessionTypeName, { color: colors.text }]}>{sessionType.name}</Text>
                      <Text style={[styles.sessionTypeDuration, { color: colors.textSecondary }]}>{sessionType.duration} minutes</Text>
                    </View>
                    {sessionType.price !== undefined && sessionType.price > 0 && (
                      <Text style={[styles.sessionTypePrice, { color: colors.success }]}>${sessionType.price}</Text>
                    )}
                    {sessionType.price === 0 && (
                      <Text style={[styles.sessionTypeFree, { color: colors.success }]}>Free</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showJourneyDetail !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setShowJourneyDetail(null)}
      >
        <View style={styles.journeyModalOverlay}>
          <View style={[styles.journeyModalContent, { backgroundColor: colors.card }]}>
            {showJourneyDetail && (
              <>
                <TouchableOpacity
                  style={[styles.journeyModalClose, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => setShowJourneyDetail(null)}
                  activeOpacity={0.7}
                >
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
                
                <View style={[styles.journeyModalTypeBadge, { backgroundColor: (showJourneyDetail.journeyType === 'workshop' ? '#007AFF' : '#8B5CF6') + '20' }]}>
                  <Text style={[styles.journeyModalTypeText, { color: showJourneyDetail.journeyType === 'workshop' ? '#007AFF' : '#8B5CF6' }]}>
                    {showJourneyDetail.journeyType === 'workshop' ? 'WORKSHOP' : 'DEVOTIONAL'}
                  </Text>
                </View>
                
                <Text style={[styles.journeyModalTitle, { color: colors.text }]}>{showJourneyDetail.title}</Text>
                
                <Text style={[styles.journeyModalDescription, { color: colors.text }]}>
                  {showJourneyDetail.overview}
                </Text>
                
                <View style={styles.journeyModalMeta}>
                  <View style={styles.journeyModalFocusAreas}>
                    {showJourneyDetail.focusAreas.map((area) => (
                      <View
                        key={area}
                        style={[
                          styles.journeyModalAreaTag,
                          { backgroundColor: FOCUS_AREA_COLORS[area] + '20' },
                        ]}
                      >
                        <Text style={styles.journeyModalAreaEmoji}>
                          {FOCUS_AREA_INFO[area].emoji}
                        </Text>
                        <Text style={[styles.journeyModalAreaText, { color: FOCUS_AREA_COLORS[area] }]}>
                          {FOCUS_AREA_INFO[area].title}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={[styles.journeyModalDuration, { backgroundColor: colors.backgroundSecondary }]}>
                    <Text style={[styles.journeyModalDurationText, { color: colors.text }]}>
                      {showJourneyDetail.journeyType === 'devotional' 
                        ? `${showJourneyDetail.durationDays || showJourneyDetail.days} days`
                        : `${showJourneyDetail.durationMinutes || 0} minutes`}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.journeyModalStartButton, { backgroundColor: colors.tint }]}
                  onPress={() => {
                    handleStartJourney(showJourneyDetail.id);
                    setShowJourneyDetail(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Play size={18} color="white" />
                  <Text style={styles.journeyModalStartText}>Start Journey</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getEventColor(type: string, colors: any): string {
  switch (type) {
    case 'date': return '#FF3B30';
    case 'coaching': return '#2ECC71';
    case 'milestones': return '#F6C343';
    case 'workshops': return '#1EADE4';
    case 'gamenight': return '#FF7A18';
    case 'special': return '#C9A27E';
    default: return colors.accent;
  }
}

function getEventTypeLabel(type: string): string {
  switch (type) {
    case 'date': return 'Date Night';
    case 'coaching': return 'Coaching';
    case 'milestones': return 'Milestones';
    case 'workshops': return 'Workshops';
    case 'gamenight': return 'Game Night';
    case 'special': return 'Special Occasions';
    default: return type;
  }
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

interface JourneyCardProps {
  journey: Journey;
  isActive: boolean;
  progress: number;
  onStart: () => void;
  onInfoPress: () => void;
}

interface CoachCardProps {
  coach: CoachProfile;
  onPress: () => void;
}

function CoachCard({ coach, onPress }: CoachCardProps) {
  const { colors } = useThemeStyles();
  
  return (
    <TouchableOpacity
      style={[styles.horizontalCoachCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: coach.photoUrl }}
        style={styles.horizontalCoachPhoto}
      />
      <View style={styles.horizontalCoachInfo}>
        <Text style={[styles.horizontalCoachName, { color: colors.text }]} numberOfLines={1}>{coach.name}</Text>
        <Text style={[styles.horizontalCoachCredentials, { color: colors.textSecondary }]} numberOfLines={1}>{coach.credentials}</Text>
        <Text style={[styles.horizontalCoachSpecialty, { color: colors.text }]} numberOfLines={2}>{coach.specialty}</Text>
        <View style={styles.horizontalCoachRating}>
          <Text style={[styles.horizontalCoachRatingText, { color: colors.warning }]}>★ {coach.rating}</Text>
          <Text style={[styles.horizontalCoachReviewCount, { color: colors.textSecondary }]}>({coach.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface SwipeableEventItemProps {
  event: CalendarEvent;
  onToggleComplete: () => void;
  onDelete: () => void;
}

function SwipeableEventItem({ event, onToggleComplete, onDelete }: SwipeableEventItemProps) {
  const { colors } = useThemeStyles();
  const pan = useRef(new Animated.Value(0)).current;
  
  const SWIPE_THRESHOLD = -80 as const;
  const DELETE_THRESHOLD = -120 as const;
  
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 5;
        },
        onPanResponderGrant: () => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            pan.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < DELETE_THRESHOLD) {
            Animated.timing(pan, {
              toValue: -400,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              onDelete();
            });
          } else if (gestureState.dx < SWIPE_THRESHOLD) {
            Animated.spring(pan, {
              toValue: SWIPE_THRESHOLD,
              useNativeDriver: true,
            }).start();
          } else {
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pan, onDelete]
  );

  return (
    <View style={styles.swipeableContainer}>
      <View style={[styles.deleteBackground, { backgroundColor: colors.error }]}>
        <Trash2 size={20} color="#FFFFFF" />
        <Text style={styles.deleteText}>Delete</Text>
      </View>
      <Animated.View
        style={[
          styles.eventItemAnimated,
          {
            transform: [{ translateX: pan }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.eventItem, { backgroundColor: colors.backgroundSecondary }]}
          onPress={onToggleComplete}
          activeOpacity={1}
        >
          <View style={[styles.eventTypeIndicator, { backgroundColor: getEventColor(event.type, colors) }]} />
          <View style={styles.eventContent}>
            <View style={styles.eventTitleRow}>
              {event.time && (
                <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{formatTime(event.time)} – </Text>
              )}
              <Text style={[styles.eventTitle, { color: colors.text }, event.completed && [styles.eventTitleCompleted, { color: colors.textSecondary }]]}>
                {event.title}
              </Text>
            </View>
            {event.description && (
              <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>{event.description}</Text>
            )}
          </View>
          {event.completed ? (
            <CheckCircle2 size={18} color={colors.success} />
          ) : (
            <Circle size={18} color={colors.textSecondary} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function JourneyCard({ journey, isActive, progress, onStart, onInfoPress }: JourneyCardProps) {
  const { colors } = useThemeStyles();
  const primaryColor = FOCUS_AREA_COLORS[journey.focusAreas[0]] || colors.tint;

  return (
    <View style={[styles.journeyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.journeyHeaderHorizontal}>
        <Text style={[styles.journeyTitle, { color: colors.text, flex: 1 }]}>{journey.title}</Text>
        <TouchableOpacity
          style={[
            styles.journeyIconSmall,
            { backgroundColor: primaryColor + '20' },
          ]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onInfoPress();
          }}
          activeOpacity={0.7}
        >
          <Map size={16} color={primaryColor} />
        </TouchableOpacity>
      </View>
      {isActive && (
        <View style={[styles.activeTag, { backgroundColor: primaryColor }]}>
          <Text style={styles.activeTagText}>Active</Text>
        </View>
      )}

      <Text style={[styles.journeyDescription, { color: colors.textSecondary }]} numberOfLines={1}>
        {journey.overview}
      </Text>

      <View style={styles.journeyMeta}>
        <View style={styles.focusAreas}>
          {journey.focusAreas.slice(0, 2).map((area) => (
            <View
              key={area}
              style={[
                styles.areaTag,
                { backgroundColor: FOCUS_AREA_COLORS[area] + '20' },
              ]}
            >
              <Text style={styles.areaEmoji}>
                {FOCUS_AREA_INFO[area].emoji}
              </Text>
            </View>
          ))}
          {journey.focusAreas.length > 2 && (
            <Text style={[styles.moreAreas, { color: colors.textSecondary }]}>+{journey.focusAreas.length - 2}</Text>
          )}
        </View>
        <Text style={[styles.daysText, { color: colors.textSecondary }]}>
          {journey.journeyType === 'devotional' 
            ? `${journey.durationDays || journey.days} days`
            : `${journey.durationMinutes || 0} minutes`}
        </Text>
      </View>

      {isActive && progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(progress / journey.days) * 100}%`,
                  backgroundColor: primaryColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {progress} / {journey.days} days completed
          </Text>
        </View>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerRight: {
    marginRight: -SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  headerBadgeButton: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },
  headerUnreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  headerUnreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  headerRightButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    position: 'relative',
    marginRight: 3.7,
  },
  headerLogoButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMessagesButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: -8,
  },
  headerMessagesIconWrapper: {
    marginRight: SPACING.lg + 1,
  },
  headerLogo: {
    width: 120,
    height: 36,
  },
  logo: {
    width: 120,
    height: 36,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg + 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
  },
  subsectionContainer: {
    marginBottom: SPACING.lg,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  subsectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  subsectionTitleLarge: {
    fontSize: TYPOGRAPHY.sizes.md + 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.md,
  },
  syncButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  calendarCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  monthNavButton: {
    padding: SPACING.xs,
  },
  monthTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  weekDayText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs - 2,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: BORDER_RADIUS.md,
  },
  dayCellSelected: {
    borderColor: 'transparent',
  },
  dayCellToday: {
    borderColor: 'transparent',
  },
  dayCellValentines: {
    borderWidth: 1,
  },
  dayText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.2,
    textAlign: 'center',
  },
  dayTextSelected: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dayTextToday: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  eventDotsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventDotSelected: {
    backgroundColor: 'white',
  },
  eventsSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  eventsSectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  addEventText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  noEventsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  noEventsTextCompact: {
    paddingVertical: SPACING.sm,
  },
  eventsList: {
    gap: SPACING.sm,
  },
  swipeableContainer: {
    position: 'relative',
    height: undefined,
    marginBottom: 0,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  eventItemAnimated: {
    width: '100%',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  eventTypeIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  eventTime: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  eventTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  eventTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  eventDescription: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  journeyCard: {
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  journeyHeaderHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs - 2,
    gap: SPACING.sm,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
  },
  journeyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activeTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  activeTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: 'white',
  },
  journeyTitle: {
    fontSize: TYPOGRAPHY.sizes.md + 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 20,
  },
  journeyDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  journeyOverview: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.xs + 2,
  },
  journeyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
  },
  focusAreas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  areaTag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaEmoji: {
    fontSize: 10,
  },
  moreAreas: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginLeft: SPACING.xs - 2,
  },
  daysText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  progressContainer: {
    marginBottom: SPACING.xs + 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  guidanceSubsection: {
    marginBottom: SPACING.lg,
  },
  guidanceSubsectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  guidanceSubsectionTitleLarge: {
    fontSize: TYPOGRAPHY.sizes.md + 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  subsectionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  coachesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  coachCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  coachPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: SPACING.sm,
  },
  coachName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
    textAlign: 'center',
  },
  coachCredentials: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  coachSpecialty: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
  },
  coachRatingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  coachReviewCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
    borderWidth: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
    borderWidth: 1,
    opacity: 0.6,
    position: 'relative',
  },
  inTellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalInput: {
    fontSize: TYPOGRAPHY.sizes.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
    outlineStyle: 'none' as const,
  },
  timePickerContainer: {
    marginBottom: SPACING.md,
  },
  timePickerLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
  },
  timePicker: {
    width: '100%',
    height: 120,
  },
  eventTypeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingRight: SPACING.lg,
  },
  eventTypeButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  eventTypeButtonActive: {},
  eventTypeButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  eventTypeButtonTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  modalSaveButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  syncModalDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  syncOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  syncOptionText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  coachDetailPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  coachDetailCredentials: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  coachDetailSpecialty: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  coachDetailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  coachDetailRatingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  coachDetailReviewCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  coachDetailBio: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  coachDetailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  coachTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
  },
  coachTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sessionTypesTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  sessionTypeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  sessionTypeName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sessionTypeDuration: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  sessionTypePrice: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sessionTypeFree: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  coachesScrollContainer: {
    paddingRight: SPACING.lg,
  },
  horizontalCoachCard: {
    width: COACH_CARD_WIDTH,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginRight: SPACING.sm,
    flexDirection: 'column',
    alignItems: 'center',
  },
  horizontalCoachPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: SPACING.sm,
  },
  horizontalCoachInfo: {
    width: '100%',
    alignItems: 'center',
  },
  horizontalCoachName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs - 2,
    textAlign: 'center',
  },
  horizontalCoachCredentials: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs - 2,
    textAlign: 'center',
  },
  horizontalCoachSpecialty: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.xs,
    lineHeight: 16,
    textAlign: 'center',
  },
  horizontalCoachRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs - 2,
    justifyContent: 'center',
  },
  horizontalCoachRatingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  horizontalCoachReviewCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  searchBarInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    padding: 0,
  },
  journeyToggleContainer: {
    flexDirection: 'row',
    padding: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  journeyToggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  journeyToggleButtonActive: {},
  journeyToggleText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  journeyToggleTextActive: {
    color: 'white',
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  exploreJourneysButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  exploreJourneysText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
    textAlign: 'center',
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  featuredTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  featuredTitleSmall: {
    fontSize: TYPOGRAPHY.sizes.md - 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  horoscopeLink: {
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
  },
  horoscopeLinkText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  lastSection: {
    marginBottom: 0,
  },
  subsectionContainerLast: {
    marginBottom: 0,
  },
  seeCoachesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  seeCoachesText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
    textAlign: 'center',
  },
  chatSpacesGlowContainer: {
    position: 'relative',
  },
  chatSpacesGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  inTellGlowContainer: {
    position: 'relative',
  },
  inTellGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
  },
  lineSeparator: {
    width: 200,
    height: 12,
    marginTop: 0,
    marginBottom: SPACING.md,
    alignSelf: 'center',
  },
  chatSpacesNotificationBadge: {
    position: 'absolute',
    top: -9,
    right: -9,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  chatSpacesNotificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mantra: {
    fontSize: TYPOGRAPHY.sizes.lg - 0.5,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginTop: SPACING.sm + 4,
    marginBottom: SPACING.md,
  },
  messagesNotificationBadge: {
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
  messagesNotificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  journeyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  journeyModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    position: 'relative',
  },
  journeyModalClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  journeyModalTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  journeyModalTypeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  journeyModalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
    paddingRight: SPACING.xl,
  },
  journeyModalDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  journeyModalMeta: {
    marginBottom: SPACING.lg,
  },
  journeyModalFocusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  journeyModalAreaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs - 2,
  },
  journeyModalAreaEmoji: {
    fontSize: 12,
  },
  journeyModalAreaText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  journeyModalDuration: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  journeyModalDurationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  journeyModalStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  journeyModalStartText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: 'white',
  },
});
