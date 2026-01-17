import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import * as Speech from 'expo-speech';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserProfile,
  Spark,
  UserSpark,
  Journey,
  UserJourney,
  CheckIn,
  JournalEntry,
  OnboardingData,
  FocusArea,
  RelationshipStatus,
  Tone,
  ParqItem,
  InspoPost,
  InspoReaction,
  InspoComment,
  InspoBookmark,
  PartnerGroup,
  CalendarEvent,
  CoachingSession,
  CheckInSection,
  Conversation,
  Message,
  SparkSharePayload,
  SparkShareContent,
} from '@/types';
import { SEED_SPARKS, SEED_JOURNEYS } from '@/constants/data';
import { SEED_PARQ_ITEMS, SEED_INSPO_POSTS, getUserSeededStories } from '@/constants/parq-data';

interface AppState {
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  _lastSparkCheck: string | null;
  theme: 'light' | 'dark';
  hasSeenSparkFlipHint: boolean;
  badgeDisplayEnabled: boolean;
  sparkCardSpeechEnabled: boolean;
  parqCardSpeechEnabled: boolean;
  profile: UserProfile | null;
  onboardingData: OnboardingData;
  userSparks: UserSpark[];
  userJourneys: UserJourney[];
  checkIns: CheckIn[];
  journalEntries: JournalEntry[];
  
  savedParqIds: string[];
  savedPostIds: string[];
  favoriteSparkIds: string[];
  favoriteParqIds: string[];
  favoritePostIds: string[];
  highlightedSharedStoryIds: string[];
  postReactions: InspoReaction[];
  postComments: InspoComment[];
  postBookmarks: InspoBookmark[];
  pendingPosts: InspoPost[];
  
  partnerGroups: PartnerGroup[];
  calendarEvents: CalendarEvent[];
  coachingSessions: CoachingSession[];
  conversations: Conversation[];
  messages: Message[];
  pendingSparkShare: SparkSharePayload | null;
  
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleAstrology: (enabled: boolean) => void;
  toggleFocusArea: (area: FocusArea) => void;
  updateGoals: (goals: string[]) => void;
  updateTone: (tone: Tone) => void;
  updateStatus: (status: RelationshipStatus) => void;
  updateIntentions: (intentions: string[]) => void;
  updateCheckInSections: (sections: CheckInSection[]) => void;
  toggleBadgeDisplay: (enabled: boolean) => void;
  setSparkCardSpeechEnabled: (enabled: boolean) => void;
  setParqCardSpeechEnabled: (enabled: boolean) => void;
  
  updateOnboarding: (data: Partial<OnboardingData>) => void;
  completeOnboarding: (
    status: RelationshipStatus,
    goals: string[],
    focusAreas: FocusArea[],
    tone: Tone,
    timeCommitment: number,
    name?: string,
    username?: string,
    birthday?: string,
    partnerBirthday?: string,
    anniversary?: string
  ) => void;
  
  getTodaySpark: () => (Spark & { userSpark?: UserSpark }) | null;
  ensureTodaySparkExists: () => void;
  completeSpark: (sparkId: string) => void;
  skipSpark: (sparkId: string) => void;
  saveSpark: (sparkId: string) => void;
  unsaveSpark: (sparkId: string) => void;
  isSparkSaved: (sparkId: string) => boolean;
  swapSpark: () => void;
  rateSpark: (sparkId: string, rating: number) => void;
  
  startJourney: (journeyId: string) => void;
  completeJourneyDay: (journeyId: string, dayIndex: number) => void;
  pauseJourney: (journeyId: string) => void;
  
  addCheckIn: (checkIn: Omit<CheckIn, 'id' | 'userId' | 'createdAt'>) => void;
  resetCheckIn: () => void;
  
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>) => void;
  updateJournalEntry: (id: string, content: string, tags: string[]) => void;
  deleteJournalEntry: (id: string) => void;
  togglePoemShowOnProfile: (id: string) => void;
  
  getSparks: () => Spark[];
  getJourneys: () => Journey[];
  
  getParqItems: () => ParqItem[];
  getPosts: () => InspoPost[];
  getPostsBySection: (sectionId: string) => InspoPost[];
  
  toggleParqSave: (parqId: string) => void;
  togglePostLike: (postId: string) => void;
  togglePostBookmark: (postId: string) => void;
  toggleSparkFavorite: (sparkId: string) => void;
  toggleParqFavorite: (parqId: string) => void;
  togglePostFavorite: (postId: string) => void;
  toggleStoryHighlight: (storyId: string) => void;
  addPostComment: (postId: string, body: string) => void;
  deletePostComment: (commentId: string) => void;
  submitPost: (post: Omit<InspoPost, 'id' | 'likes' | 'commentsCount' | 'createdAt' | 'updatedAt' | 'status' | 'authorUserId' | 'authorDisplayName'>) => void;
  
  getUserReactionsForPost: (postId: string) => InspoReaction[];
  getUserCommentsForPost: (postId: string) => InspoComment[];
  isPostLikedByUser: (postId: string) => boolean;
  isPostBookmarkedByUser: (postId: string) => boolean;
  
  generatePartnerCode: () => string;
  joinPartnerGroup: (code: string) => boolean;
  getPartnerGroup: () => PartnerGroup | null;
  
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  toggleEventComplete: (eventId: string) => void;
  deleteCalendarEvent: (eventId: string) => void;
  getUpcomingEvents: () => CalendarEvent[];
  
  scheduleCoachingSession: (session: Omit<CoachingSession, 'id' | 'userId' | 'createdAt'>) => void;
  syncProfileDatesToCalendar: () => void;
  syncAnniversaryToCalendar: (userId: string, anniversaryDateOrNull: string | undefined) => void;
  
  getConversations: () => Conversation[];
  getUnreadMessagesCount: () => number;
  getMessagesForConversation: (conversationId: string) => Message[];
  markConversationAsRead: (conversationId: string) => void;
  getOrCreateConversation: (conversationId: string, participantName: string, participantAvatar?: string, isPartner?: boolean) => Conversation;
  toggleConversationPin: (conversationId: string) => void;
  toggleConversationMute: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string, replyToMessageId?: string) => void;
  sendSelfChatMessage: (conversationId: string, content: string, replyToMessageId?: string) => { sentId: string; pairId: string };
  addEchoMessage: (conversationId: string, content: string, pairId: string) => void;
  
  toggleMessageReaction: (messageId: string, emoji: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string, forAll: boolean) => void;
  undoSendMessage: (messageId: string) => void;
  canEditOrUndoMessage: (message: Message) => boolean;
  getMessageById: (messageId: string) => Message | undefined;
  
  setPendingSparkShare: (payload: SparkSharePayload | null) => void;
  clearPendingSparkShare: () => void;
  sendSparkShareMessage: (conversationId: string, sparkShare: SparkShareContent, comment?: string) => void;
  
  setTheme: (theme: 'light' | 'dark') => void;
  
  markSparkFlipHintSeen: () => void;
  
  softReload: () => void;
  reset: () => void;
}

const initialOnboardingData: OnboardingData = {
  step: 0,
  status: null,
  goals: [],
  focusAreas: [],
  tone: 'playful',
  timeCommitment: 10,
};

const appStore = create<AppState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      _lastSparkCheck: null,
      theme: 'dark',
      hasSeenSparkFlipHint: false,
      badgeDisplayEnabled: true,
      sparkCardSpeechEnabled: true,
      parqCardSpeechEnabled: true,
      profile: null,
      onboardingData: initialOnboardingData,
      userSparks: [],
      userJourneys: [],
      checkIns: [],
      journalEntries: [],
      
      savedParqIds: [],
      savedPostIds: [],
      favoriteSparkIds: [],
      favoriteParqIds: [],
      favoritePostIds: [],
      highlightedSharedStoryIds: ['post-1', 'post-2'],
      postReactions: [],
      postComments: [],
      postBookmarks: [],
      pendingPosts: [],
      
      partnerGroups: [],
      calendarEvents: [],
      coachingSessions: [],
      conversations: [],
      messages: [],
      pendingSparkShare: null,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        }));
        
        const { profile } = get();
        if (!profile) return;
        
        if (updates.anniversary !== undefined) {
          console.log('[updateProfile] Anniversary changed, syncing to calendar');
          get().syncAnniversaryToCalendar(profile.id, updates.anniversary);
        }
        
        if (updates.birthday || updates.partnerBirthday) {
          get().syncProfileDatesToCalendar();
        }
      },

      toggleAstrology: (enabled) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, astrologyEnabled: enabled } : null,
        })),

      toggleFocusArea: (area) =>
        set((state) => {
          if (!state.profile) return {};
          const currentAreas = state.profile.focusAreas;
          const newAreas = currentAreas.includes(area)
            ? currentAreas.filter(a => a !== area)
            : [...currentAreas, area];
          return {
            profile: { ...state.profile, focusAreas: newAreas },
          };
        }),

      updateGoals: (goals) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, goals } : null,
        })),

      updateTone: (tone) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, tone } : null,
        })),

      updateStatus: (status) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, status } : null,
        }));
        
        const { profile } = get();
        if (profile?.hasCompletedOnboarding) {
          console.log('[updateStatus] Status changed, re-checking today\'s spark');
          setTimeout(() => {
            get().ensureTodaySparkExists();
          }, 50);
        }
      },

      updateIntentions: (intentions) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, intentions } : null,
        })),

      updateCheckInSections: (sections) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, checkInSections: sections } : null,
        })),

      toggleBadgeDisplay: (enabled) => set({ badgeDisplayEnabled: enabled }),

      setSparkCardSpeechEnabled: (enabled) => {
        const prevEnabled = get().sparkCardSpeechEnabled;
        set({ sparkCardSpeechEnabled: enabled });
        
        if (prevEnabled && !enabled) {
          console.log('[setSparkCardSpeechEnabled] Disabling speech, stopping any active playback');
          if (typeof Speech !== 'undefined' && Speech.stop) {
            Speech.stop();
          }
        }
      },

      setParqCardSpeechEnabled: (enabled) => {
        const prevEnabled = get().parqCardSpeechEnabled;
        set({ parqCardSpeechEnabled: enabled });
        
        if (prevEnabled && !enabled) {
          console.log('[setParqCardSpeechEnabled] Disabling speech, stopping any active playback');
          if (typeof Speech !== 'undefined' && Speech.stop) {
            Speech.stop();
          }
        }
      },

      updateOnboarding: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      completeOnboarding: (status, goals, focusAreas, tone, timeCommitment, name, username, birthday, partnerBirthday, anniversary) => {
        const now = new Date().toISOString();
        const profile: UserProfile = {
          id: `user-${Date.now()}`,
          hasCompletedOnboarding: true,
          status,
          goals,
          focusAreas,
          tone,
          timeCommitment,
          name,
          username,
          displayName: name,
          birthday,
          partnerBirthday,
          anniversary,
          astrologyEnabled: true,
          checkInSections: ['overallMood', 'stressLevel', 'energyLevel'],
          profilePrivacy: 'public',
          sharedStoriesCommentsEnabled: true,
          sharedStoriesPrivacy: 'credited',
          createdAt: now,
          streak: 10,
          totalXP: 1000,
          location: 'Las Vegas, NV',
          followersCount: 10100000,
          followingCount: 23,
        };
        
        set({
          profile,
          onboardingData: initialOnboardingData,
        });
        
        get().swapSpark();
        get().syncProfileDatesToCalendar();
      },

      getTodaySpark: () => {
        const { userSparks, profile } = get();
        if (!profile) return null;

        const today = new Date().toISOString().split('T')[0];
        console.log('[getTodaySpark] Checking for today:', today);
        console.log('[getTodaySpark] Total userSparks:', userSparks.length);
        
        let todayUserSpark = userSparks.find(
          (us) => us.assignedDate === today && us.status === 'assigned'
        );
        
        if (!todayUserSpark) {
          console.log('[getTodaySpark] No assigned spark for today, auto-assigning...');
          get().ensureTodaySparkExists();
          
          todayUserSpark = get().userSparks.find(
            (us) => us.assignedDate === today && us.status === 'assigned'
          );
        }

        if (!todayUserSpark) {
          console.log('[getTodaySpark] Still no spark after auto-assignment');
          return null;
        }

        console.log('[getTodaySpark] Found spark:', todayUserSpark.sparkId, 'status:', todayUserSpark.status);
        const spark = SEED_SPARKS.find((s) => s.id === todayUserSpark.sparkId);
        return spark ? { ...spark, userSpark: todayUserSpark } : null;
      },

      completeSpark: (sparkId) => {
        const { userSparks, profile } = get();
        if (!profile) return;

        const now = new Date().toISOString();
        const today = new Date().toISOString().split('T')[0];

        console.log('[completeSpark] Completing spark:', sparkId, 'for date:', today);

        const updatedUserSparks = userSparks.map((us) =>
          us.sparkId === sparkId && us.assignedDate === today && us.status === 'assigned'
            ? { ...us, status: 'completed' as const, completedAt: now }
            : us
        );

        set({
          userSparks: updatedUserSparks,
          profile: {
            ...profile,
            streak: profile.streak + 1,
            totalXP: profile.totalXP + 10,
          },
        });

        console.log('[completeSpark] Spark completed, will assign new one for next access');
      },

      skipSpark: (sparkId) => {
        const { userSparks } = get();
        const today = new Date().toISOString().split('T')[0];

        console.log('[skipSpark] Skipping spark:', sparkId, 'for date:', today);

        set({
          userSparks: userSparks.map((us) =>
            us.sparkId === sparkId && us.assignedDate === today && us.status === 'assigned'
              ? { ...us, status: 'skipped' as const }
              : us
          ),
        });

        console.log('[skipSpark] Spark skipped, will assign new one for next access');
      },

      saveSpark: (sparkId) => {
        const { userSparks, profile } = get();
        if (!profile) return;

        const now = new Date().toISOString().split('T')[0];
        const existing = userSparks.find(
          (us) => us.sparkId === sparkId && us.status === 'saved'
        );

        if (existing) return;

        set({
          userSparks: [
            ...userSparks,
            {
              userId: profile.id,
              sparkId,
              assignedDate: now,
              status: 'saved',
            },
          ],
        });
      },

      unsaveSpark: (sparkId) => {
        const { userSparks } = get();
        
        set({
          userSparks: userSparks.filter(
            (us) => !(us.sparkId === sparkId && us.status === 'saved')
          ),
        });
      },

      isSparkSaved: (sparkId) => {
        const { userSparks } = get();
        return userSparks.some(
          (us) => us.sparkId === sparkId && us.status === 'saved'
        );
      },

      ensureTodaySparkExists: () => {
        const { userSparks, profile } = get();
        if (!profile) {
          console.log('[ensureTodaySparkExists] No profile, skipping');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const isEarlyDatingUser = profile.status === 'single' || profile.status === 'dating';
        const targetStage = isEarlyDatingUser ? 'early' : 'established';
        console.log('[ensureTodaySparkExists] Checking for today:', today, 'targetStage:', targetStage);
        
        const todayAssignedSpark = userSparks.find(
          (us) => us.assignedDate === today && us.status === 'assigned'
        );

        if (todayAssignedSpark) {
          const existingSpark = SEED_SPARKS.find(s => s.id === todayAssignedSpark.sparkId);
          if (existingSpark && existingSpark.relationshipStage === targetStage) {
            console.log('[ensureTodaySparkExists] Spark already exists for today with correct stage');
            return;
          }
          console.log('[ensureTodaySparkExists] Existing spark has wrong stage, replacing...');
        }

        console.log('[ensureTodaySparkExists] No assigned spark for today, creating one...');
        
        const recentSparkIds = userSparks
          .filter((us) => us.status !== 'saved')
          .slice(-30)
          .map((us) => us.sparkId);

        const availableSparks = SEED_SPARKS.filter(
          (s) =>
            s.relationshipStage === targetStage &&
            !recentSparkIds.includes(s.id) &&
            (profile.focusAreas.length === 0 ||
              profile.focusAreas.includes(s.focusArea))
        );

        let sparkToAssign;
        if (availableSparks.length === 0) {
          console.log('[ensureTodaySparkExists] No available sparks with stage filter, using any from target stage');
          const stageSparks = SEED_SPARKS.filter(s => s.relationshipStage === targetStage);
          sparkToAssign = stageSparks.length > 0
            ? stageSparks[Math.floor(Math.random() * stageSparks.length)]
            : SEED_SPARKS[Math.floor(Math.random() * SEED_SPARKS.length)];
        } else {
          sparkToAssign = availableSparks[Math.floor(Math.random() * availableSparks.length)];
        }

        console.log('[ensureTodaySparkExists] Assigning spark:', sparkToAssign.id, 'stage:', sparkToAssign.relationshipStage);

        set({
          userSparks: [
            ...userSparks.filter((us) => !(us.assignedDate === today && us.status === 'assigned')),
            {
              userId: profile.id,
              sparkId: sparkToAssign.id,
              assignedDate: today,
              status: 'assigned',
            },
          ],
        });
      },

      swapSpark: () => {
        const { userSparks, profile } = get();
        if (!profile) return;

        const today = new Date().toISOString().split('T')[0];
        const isEarlyDatingUser = profile.status === 'single' || profile.status === 'dating';
        const targetStage = isEarlyDatingUser ? 'early' : 'established';
        console.log('[swapSpark] Swapping spark for today:', today, 'targetStage:', targetStage);
        
        const recentSparkIds = userSparks
          .filter((us) => us.status !== 'saved')
          .slice(-30)
          .map((us) => us.sparkId);

        const availableSparks = SEED_SPARKS.filter(
          (s) =>
            s.relationshipStage === targetStage &&
            !recentSparkIds.includes(s.id) &&
            (profile.focusAreas.length === 0 ||
              profile.focusAreas.includes(s.focusArea))
        );

        let sparkToAssign;
        if (availableSparks.length === 0) {
          console.log('[swapSpark] No available sparks with stage filter, using any from target stage');
          const stageSparks = SEED_SPARKS.filter(s => s.relationshipStage === targetStage);
          sparkToAssign = stageSparks.length > 0
            ? stageSparks[Math.floor(Math.random() * stageSparks.length)]
            : SEED_SPARKS[Math.floor(Math.random() * SEED_SPARKS.length)];
        } else {
          sparkToAssign = availableSparks[Math.floor(Math.random() * availableSparks.length)];
        }

        console.log('[swapSpark] New spark:', sparkToAssign.id, 'stage:', sparkToAssign.relationshipStage);

        set({
          userSparks: [
            ...userSparks.filter((us) => !(us.assignedDate === today && us.status === 'assigned')),
            {
              userId: profile.id,
              sparkId: sparkToAssign.id,
              assignedDate: today,
              status: 'assigned',
            },
          ],
        });
      },

      rateSpark: (sparkId, rating) => {
        const { userSparks } = get();
        const today = new Date().toISOString().split('T')[0];

        set({
          userSparks: userSparks.map((us) =>
            us.sparkId === sparkId && us.assignedDate === today
              ? { ...us, rating }
              : us
          ),
        });
      },

      startJourney: (journeyId) => {
        const { profile } = get();
        if (!profile) return;

        const now = new Date().toISOString();
        const newUserJourney: UserJourney = {
          userId: profile.id,
          journeyId,
          startedAt: now,
          currentDay: 0,
          completedDays: [],
          status: 'active',
        };

        set((state) => ({
          userJourneys: [...state.userJourneys, newUserJourney],
        }));
      },

      completeJourneyDay: (journeyId, dayIndex) => {
        const { userJourneys, profile } = get();
        if (!profile) return;

        set({
          userJourneys: userJourneys.map((uj) =>
            uj.journeyId === journeyId
              ? {
                  ...uj,
                  currentDay: dayIndex + 1,
                  completedDays: [...uj.completedDays, dayIndex],
                  status:
                    dayIndex ===
                    SEED_JOURNEYS.find((j) => j.id === journeyId)!.days - 1
                      ? 'completed'
                      : uj.status,
                }
              : uj
          ),
          profile: {
            ...profile,
            totalXP: profile.totalXP + 15,
          },
        });
      },

      pauseJourney: (journeyId) => {
        const { userJourneys } = get();

        set({
          userJourneys: userJourneys.map((uj) =>
            uj.journeyId === journeyId ? { ...uj, status: 'paused' } : uj
          ),
        });
      },

      addCheckIn: (checkIn) => {
        const { profile } = get();
        if (!profile) return;

        const newCheckIn: CheckIn = {
          id: `checkin-${Date.now()}`,
          userId: profile.id,
          createdAt: new Date().toISOString(),
          ...checkIn,
        };

        set((state) => ({
          checkIns: [...state.checkIns, newCheckIn],
        }));
      },

      resetCheckIn: () => {
        const { checkIns } = get();
        const today = new Date().toISOString().split('T')[0];
        
        set({
          checkIns: checkIns.filter(c => c.createdAt.split('T')[0] !== today),
        });
      },

      addJournalEntry: (entry) => {
        const { profile } = get();
        if (!profile) return;

        const newEntry: JournalEntry = {
          id: `journal-${Date.now()}`,
          userId: profile.id,
          createdAt: new Date().toISOString(),
          category: entry.category || 'journal',
          sendTarget: entry.sendTarget || 'vault',
          ...entry,
        };

        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
      },

      updateJournalEntry: (id, content, tags) => {
        const { journalEntries } = get();

        set({
          journalEntries: journalEntries.map((entry) =>
            entry.id === id ? { ...entry, content, tags } : entry
          ),
        });
      },

      deleteJournalEntry: (id) => {
        const { journalEntries } = get();

        set({
          journalEntries: journalEntries.filter((entry) => entry.id !== id),
        });
      },

      togglePoemShowOnProfile: (id) => {
        const { journalEntries } = get();
        console.log('[togglePoemShowOnProfile] Toggling showOnProfile for entry:', id);

        set({
          journalEntries: journalEntries.map((entry) =>
            entry.id === id && entry.category === 'poems'
              ? { ...entry, showOnProfile: !entry.showOnProfile }
              : entry
          ),
        });
      },

      getSparks: () => SEED_SPARKS,

      getJourneys: () => SEED_JOURNEYS,
      
      getParqItems: () => SEED_PARQ_ITEMS,
      
      getPosts: () => {
        const { pendingPosts, profile } = get();
        const approvedSeedPosts = SEED_INSPO_POSTS.filter(p => p.status === 'approved');
        const userSeededStories = profile ? getUserSeededStories(profile.id) : [];
        const userApprovedPosts = pendingPosts.filter(p => p.status === 'approved');
        return [...userSeededStories, ...approvedSeedPosts, ...userApprovedPosts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      
      getPostsBySection: (sectionId: string) => {
        const posts = get().getPosts();
        if (sectionId === 'section-top-stories') {
          return posts.filter(p => p.isTopStory === true);
        }
        if (sectionId === 'section-weekly-curated') {
          return posts.filter(p => p.isWeeklyCurated === true && p.isTopStory !== true).sort(
            (a, b) => {
              const aTime = new Date(a.weeklyCuratedAt || a.createdAt).getTime();
              const bTime = new Date(b.weeklyCuratedAt || b.createdAt).getTime();
              return bTime - aTime;
            }
          );
        }
        return posts.filter(p => p.sectionId === sectionId);
      },
      
      toggleParqSave: (parqId: string) => {
        set((state) => ({
          savedParqIds: state.savedParqIds.includes(parqId)
            ? state.savedParqIds.filter(id => id !== parqId)
            : [...state.savedParqIds, parqId],
        }));
      },
      
      togglePostLike: (postId: string) => {
        const { profile, postReactions } = get();
        if (!profile) return;
        
        const existingReaction = postReactions.find(
          r => r.postId === postId && r.userId === profile.id
        );
        
        if (existingReaction) {
          set({
            postReactions: postReactions.filter(r => r.id !== existingReaction.id),
          });
        } else {
          const newReaction: InspoReaction = {
            id: `reaction-${Date.now()}`,
            postId,
            userId: profile.id,
            type: 'like',
            createdAt: new Date().toISOString(),
          };
          set({
            postReactions: [...postReactions, newReaction],
          });
        }
      },
      
      togglePostBookmark: (postId: string) => {
        const { profile, postBookmarks } = get();
        if (!profile) return;
        
        const existingBookmark = postBookmarks.find(
          b => b.postId === postId && b.userId === profile.id
        );
        
        if (existingBookmark) {
          set({
            postBookmarks: postBookmarks.filter(b => b.id !== existingBookmark.id),
          });
        } else {
          const newBookmark: InspoBookmark = {
            id: `bookmark-${Date.now()}`,
            postId,
            userId: profile.id,
            createdAt: new Date().toISOString(),
          };
          set({
            postBookmarks: [...postBookmarks, newBookmark],
          });
        }
      },
      
      toggleSparkFavorite: (sparkId: string) => {
        set((state) => ({
          favoriteSparkIds: state.favoriteSparkIds.includes(sparkId)
            ? state.favoriteSparkIds.filter(id => id !== sparkId)
            : [...state.favoriteSparkIds, sparkId],
        }));
      },
      
      toggleParqFavorite: (parqId: string) => {
        set((state) => ({
          favoriteParqIds: state.favoriteParqIds.includes(parqId)
            ? state.favoriteParqIds.filter(id => id !== parqId)
            : [...state.favoriteParqIds, parqId],
        }));
      },
      
      togglePostFavorite: (postId: string) => {
        set((state) => ({
          favoritePostIds: state.favoritePostIds.includes(postId)
            ? state.favoritePostIds.filter(id => id !== postId)
            : [...state.favoritePostIds, postId],
        }));
      },
      
      toggleStoryHighlight: (storyId: string) => {
        set((state) => ({
          highlightedSharedStoryIds: state.highlightedSharedStoryIds.includes(storyId)
            ? state.highlightedSharedStoryIds.filter(id => id !== storyId)
            : [...state.highlightedSharedStoryIds, storyId],
        }));
      },
      
      addPostComment: (postId: string, body: string) => {
        const { profile, postComments } = get();
        if (!profile) return;
        
        const newComment: InspoComment = {
          id: `comment-${Date.now()}`,
          postId,
          userId: profile.id,
          userDisplayName: profile.displayName,
          body,
          createdAt: new Date().toISOString(),
        };
        
        set({
          postComments: [...postComments, newComment],
        });
      },
      
      deletePostComment: (commentId: string) => {
        set((state) => ({
          postComments: state.postComments.filter(c => c.id !== commentId),
        }));
      },
      
      submitPost: (postData) => {
        const { profile, pendingPosts } = get();
        if (!profile) return;
        
        const now = new Date().toISOString();
        const newPost: InspoPost = {
          ...postData,
          id: `post-user-${Date.now()}`,
          authorUserId: profile.id,
          privacy: postData.privacy || 'credited',
          status: 'pending',
          likes: 0,
          commentsCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        
        set({
          pendingPosts: [...pendingPosts, newPost],
        });
      },
      
      getUserReactionsForPost: (postId: string) => {
        const { postReactions } = get();
        return postReactions.filter(r => r.postId === postId);
      },
      
      getUserCommentsForPost: (postId: string) => {
        const { postComments } = get();
        return postComments.filter(c => c.postId === postId);
      },
      
      isPostLikedByUser: (postId: string) => {
        const { profile, postReactions } = get();
        if (!profile) return false;
        return postReactions.some(r => r.postId === postId && r.userId === profile.id);
      },
      
      isPostBookmarkedByUser: (postId: string) => {
        const { profile, postBookmarks } = get();
        if (!profile) return false;
        return postBookmarks.some(b => b.postId === postId && b.userId === profile.id);
      },
      
      generatePartnerCode: () => {
        const { profile, partnerGroups } = get();
        if (!profile) return '';
        
        const existingGroup = partnerGroups.find(g => g.ownerUserId === profile.id);
        if (existingGroup) return existingGroup.joinCode;
        
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newGroup: PartnerGroup = {
          id: `group-${Date.now()}`,
          ownerUserId: profile.id,
          joinCode: code,
          createdAt: new Date().toISOString(),
        };
        
        set({
          partnerGroups: [...partnerGroups, newGroup],
          profile: { ...profile, partnerGroupId: newGroup.id },
        });
        
        return code;
      },
      
      joinPartnerGroup: (code: string) => {
        const { profile, partnerGroups } = get();
        if (!profile) return false;
        
        const group = partnerGroups.find(g => g.joinCode === code.toUpperCase());
        if (!group) return false;
        
        set({
          profile: { ...profile, partnerGroupId: group.id },
        });
        
        return true;
      },
      
      getPartnerGroup: () => {
        const { profile, partnerGroups } = get();
        if (!profile || !profile.partnerGroupId) return null;
        return partnerGroups.find(g => g.id === profile.partnerGroupId) || null;
      },
      
      addCalendarEvent: (eventData) => {
        const { profile, calendarEvents } = get();
        if (!profile) return;
        
        const newEvent: CalendarEvent = {
          ...eventData,
          id: `event-${Date.now()}`,
          userId: profile.id,
        };
        
        set({
          calendarEvents: [...calendarEvents, newEvent],
        });
      },
      
      toggleEventComplete: (eventId: string) => {
        const { calendarEvents } = get();
        
        set({
          calendarEvents: calendarEvents.map(e => 
            e.id === eventId ? { ...e, completed: !e.completed } : e
          ),
        });
      },
      
      deleteCalendarEvent: (eventId: string) => {
        const { calendarEvents } = get();
        console.log('[deleteCalendarEvent] Deleting event:', eventId);
        
        set({
          calendarEvents: calendarEvents.filter(e => e.id !== eventId),
        });
      },
      
      getUpcomingEvents: () => {
        const { calendarEvents } = get();
        const now = new Date();
        return calendarEvents
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
      
      scheduleCoachingSession: (sessionData) => {
        const { profile, coachingSessions, calendarEvents } = get();
        if (!profile) return;
        
        const newSession: CoachingSession = {
          ...sessionData,
          id: `session-${Date.now()}`,
          userId: profile.id,
          createdAt: new Date().toISOString(),
        };
        
        const calendarEvent: CalendarEvent = {
          id: `event-${Date.now()}-coaching`,
          userId: profile.id,
          type: 'coaching',
          title: `Coaching Session with ${sessionData.coachName}`,
          description: sessionData.sessionTypeName,
          date: sessionData.scheduledAt,
          completed: false,
          linkedId: newSession.id,
        };
        
        set({
          coachingSessions: [...coachingSessions, newSession],
          calendarEvents: [...calendarEvents, calendarEvent],
        });
      },
      
      syncProfileDatesToCalendar: () => {
        const { profile, calendarEvents } = get();
        if (!profile) return;
        
        console.log('[syncProfileDatesToCalendar] Syncing all profile dates');
        const currentYear = new Date().getFullYear();
        let updatedEvents = [...calendarEvents];
        
        const removeOldBirthdayEvents = () => {
          updatedEvents = updatedEvents.filter(e => 
            e.linkedId !== 'birthday' && 
            e.linkedId !== 'partner-birthday' && 
            e.linkedId !== 'anniversary'
          );
        };
        
        removeOldBirthdayEvents();
        
        if (profile.birthday) {
          const birthday = new Date(profile.birthday);
          const thisYearBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate());
          
          updatedEvents.push({
            id: `event-birthday-${currentYear}`,
            userId: profile.id,
            type: 'special',
            title: 'Your Birthday',
            description: 'Happy Birthday! 🎉',
            date: thisYearBirthday.toISOString(),
            completed: false,
            linkedId: 'birthday',
          });
          
          const nextYearBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate());
          updatedEvents.push({
            id: `event-birthday-${currentYear + 1}`,
            userId: profile.id,
            type: 'special',
            title: 'Your Birthday',
            description: 'Happy Birthday! 🎉',
            date: nextYearBirthday.toISOString(),
            completed: false,
            linkedId: 'birthday',
          });
        }
        
        if (profile.partnerBirthday) {
          const partnerBirthday = new Date(profile.partnerBirthday);
          const thisYearPartnerBirthday = new Date(currentYear, partnerBirthday.getMonth(), partnerBirthday.getDate());
          
          updatedEvents.push({
            id: `event-partner-birthday-${currentYear}`,
            userId: profile.id,
            type: 'special',
            title: "Partner's Birthday",
            description: 'Happy Birthday to your partner! 🎉',
            date: thisYearPartnerBirthday.toISOString(),
            completed: false,
            linkedId: 'partner-birthday',
          });
          
          const nextYearPartnerBirthday = new Date(currentYear + 1, partnerBirthday.getMonth(), partnerBirthday.getDate());
          updatedEvents.push({
            id: `event-partner-birthday-${currentYear + 1}`,
            userId: profile.id,
            type: 'special',
            title: "Partner's Birthday",
            description: 'Happy Birthday to your partner! 🎉',
            date: nextYearPartnerBirthday.toISOString(),
            completed: false,
            linkedId: 'partner-birthday',
          });
        }
        
        get().syncAnniversaryToCalendar(profile.id, profile.anniversary);
        return;
      },
      
      syncAnniversaryToCalendar: (userId: string, anniversaryDateOrNull: string | undefined) => {
        const { calendarEvents } = get();
        console.log('[syncAnniversaryToCalendar] Syncing anniversary:', anniversaryDateOrNull);
        
        const currentYear = new Date().getFullYear();
        const deterministicIdCurrent = `sys_anniversary_${userId}_${currentYear}`;
        const deterministicIdNext = `sys_anniversary_${userId}_${currentYear + 1}`;
        
        let updatedEvents = [...calendarEvents];
        
        updatedEvents = updatedEvents.filter(e => 
          e.id !== deterministicIdCurrent && 
          e.id !== deterministicIdNext &&
          !e.id.startsWith(`event-anniversary-`) &&
          e.linkedId !== 'anniversary'
        );
        
        updatedEvents = updatedEvents.filter(e => {
          const isLegacyAnniversary = 
            e.title === 'Anniversary' || 
            (e.description && e.description.includes('Happy Anniversary'));
          return !isLegacyAnniversary;
        });
        
        if (anniversaryDateOrNull) {
          console.log('[syncAnniversaryToCalendar] Creating anniversary events');
          const anniversary = new Date(anniversaryDateOrNull);
          const thisYearAnniversary = new Date(currentYear, anniversary.getMonth(), anniversary.getDate());
          
          updatedEvents.push({
            id: deterministicIdCurrent,
            userId,
            type: 'special',
            title: 'Anniversary',
            description: 'Happy Anniversary! 💕',
            date: thisYearAnniversary.toISOString(),
            completed: false,
            linkedId: 'anniversary',
          });
          
          const nextYearAnniversary = new Date(currentYear + 1, anniversary.getMonth(), anniversary.getDate());
          updatedEvents.push({
            id: deterministicIdNext,
            userId,
            type: 'special',
            title: 'Anniversary',
            description: 'Happy Anniversary! 💕',
            date: nextYearAnniversary.toISOString(),
            completed: false,
            linkedId: 'anniversary',
          });
        } else {
          console.log('[syncAnniversaryToCalendar] Anniversary cleared, no events to create');
        }
        
        set({ calendarEvents: updatedEvents });
        console.log('[syncAnniversaryToCalendar] Total events after sync:', updatedEvents.length);
      },
      
      getConversations: () => {
        const { conversations } = get();
        return conversations.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          if (a.isPartner !== b.isPartner) return a.isPartner ? -1 : 1;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
      },
      
      getUnreadMessagesCount: () => {
        const { conversations } = get();
        return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      },
      
      getMessagesForConversation: (conversationId: string) => {
        const { messages } = get();
        return messages
          .filter(m => m.conversationId === conversationId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },
      
      markConversationAsRead: (conversationId: string) => {
        const { conversations, messages } = get();
        
        set({
          conversations: conversations.map(conv => 
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          ),
          messages: messages.map(msg => 
            msg.conversationId === conversationId ? { ...msg, read: true } : msg
          ),
        });
      },
      
      getOrCreateConversation: (conversationId: string, participantName: string, participantAvatar?: string, isPartner?: boolean) => {
        const { conversations, profile } = get();
        
        const existing = conversations.find(c => c.id === conversationId);
        if (existing) {
          return existing;
        }
        
        console.log('[getOrCreateConversation] Creating new conversation:', conversationId);
        const newConversation: Conversation = {
          id: conversationId,
          userId: profile?.id || '',
          participantId: conversationId,
          participantName,
          participantAvatar,
          isPartner: isPartner || false,
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
        };
        
        set({
          conversations: [...conversations, newConversation],
        });
        
        return newConversation;
      },
      
      toggleConversationPin: (conversationId: string) => {
        const { conversations } = get();
        console.log('[toggleConversationPin] Toggling pin for:', conversationId);
        
        set({
          conversations: conversations.map(conv =>
            conv.id === conversationId ? { ...conv, pinned: !conv.pinned } : conv
          ),
        });
      },
      
      toggleConversationMute: (conversationId: string) => {
        const { conversations } = get();
        console.log('[toggleConversationMute] Toggling mute for:', conversationId);
        
        set({
          conversations: conversations.map(conv =>
            conv.id === conversationId ? { ...conv, muted: !conv.muted } : conv
          ),
        });
      },
      
      deleteConversation: (conversationId: string) => {
        const { conversations, messages } = get();
        console.log('[deleteConversation] Deleting conversation:', conversationId);
        
        set({
          conversations: conversations.filter(conv => conv.id !== conversationId),
          messages: messages.filter(msg => msg.conversationId !== conversationId),
        });
      },
      
      sendMessage: (conversationId: string, content: string, replyToMessageId?: string) => {
        const { profile, conversations, messages } = get();
        if (!profile) return;
        
        const now = new Date().toISOString();
        const newMessage: Message = {
          id: `message-${Date.now()}`,
          conversationId,
          senderId: profile.id,
          content,
          createdAt: now,
          read: true,
          status: 'sent',
          replyToMessageId,
          reactions: [],
        };
        
        set({
          messages: [...messages, newMessage],
          conversations: conversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: content, lastMessageAt: now } 
              : conv
          ),
        });
      },
      
      sendSelfChatMessage: (conversationId: string, content: string, replyToMessageId?: string) => {
        const { profile, conversations, messages } = get();
        if (!profile) return { sentId: '', pairId: '' };
        
        const now = new Date().toISOString();
        const pairId = `pair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const sentId = `message-${Date.now()}`;
        
        const newMessage: Message = {
          id: sentId,
          conversationId,
          senderId: profile.id,
          content,
          createdAt: now,
          read: true,
          status: 'sent',
          replyToMessageId,
          reactions: [],
          pairId,
          isEcho: false,
        };
        
        console.log('[sendSelfChatMessage] Creating message with pairId:', pairId);
        
        set({
          messages: [...messages, newMessage],
          conversations: conversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: content, lastMessageAt: now } 
              : conv
          ),
        });
        
        return { sentId, pairId };
      },
      
      addEchoMessage: (conversationId: string, content: string, pairId: string) => {
        const { profile, conversations, messages } = get();
        if (!profile) return;
        
        const now = new Date().toISOString();
        const echoMessage: Message = {
          id: `echo-${Date.now()}`,
          conversationId,
          senderId: 'echo',
          content,
          createdAt: now,
          read: true,
          reactions: [],
          pairId,
          isEcho: true,
        };
        
        console.log('[addEchoMessage] Creating echo with pairId:', pairId);
        
        set({
          messages: [...messages, echoMessage],
          conversations: conversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: content, lastMessageAt: now } 
              : conv
          ),
        });
      },
      
      toggleMessageReaction: (messageId: string, emoji: string) => {
        const { profile, messages } = get();
        if (!profile) return;
        
        console.log('[toggleMessageReaction] Toggling reaction:', emoji, 'on message:', messageId);
        
        set({
          messages: messages.map(msg => {
            if (msg.id !== messageId) return msg;
            
            const reactions = msg.reactions || [];
            const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);
            
            if (existingReactionIndex >= 0) {
              const existingReaction = reactions[existingReactionIndex];
              const userIndex = existingReaction.userIds.indexOf(profile.id);
              
              if (userIndex >= 0) {
                const newUserIds = existingReaction.userIds.filter(id => id !== profile.id);
                if (newUserIds.length === 0) {
                  return {
                    ...msg,
                    reactions: reactions.filter((_, i) => i !== existingReactionIndex),
                  };
                }
                return {
                  ...msg,
                  reactions: reactions.map((r, i) => 
                    i === existingReactionIndex ? { ...r, userIds: newUserIds } : r
                  ),
                };
              } else {
                return {
                  ...msg,
                  reactions: reactions.map((r, i) => 
                    i === existingReactionIndex 
                      ? { ...r, userIds: [...r.userIds, profile.id] } 
                      : r
                  ),
                };
              }
            } else {
              return {
                ...msg,
                reactions: [...reactions, { emoji, userIds: [profile.id] }],
              };
            }
          }),
        });
      },
      
      editMessage: (messageId: string, newContent: string) => {
        const { messages, conversations } = get();
        
        console.log('[editMessage] Editing message:', messageId);
        
        const message = messages.find(m => m.id === messageId);
        if (!message) return;
        
        const now = Date.now();
        const pairId = message.pairId;
        
        console.log('[editMessage] Message pairId:', pairId);
        
        set({
          messages: messages.map(msg => {
            if (msg.id === messageId) {
              return { ...msg, content: newContent, editedAt: now };
            }
            if (pairId && msg.pairId === pairId) {
              console.log('[editMessage] Also updating paired message:', msg.id);
              return { ...msg, content: newContent, editedAt: now };
            }
            return msg;
          }),
          conversations: conversations.map(conv => {
            if (conv.id !== message.conversationId) return conv;
            const convMessages = messages.filter(m => m.conversationId === conv.id);
            const lastMsg = convMessages[convMessages.length - 1];
            if (lastMsg?.id === messageId || (pairId && lastMsg?.pairId === pairId)) {
              return { ...conv, lastMessage: newContent };
            }
            return conv;
          }),
        });
      },
      
      deleteMessage: (messageId: string, forAll: boolean) => {
        const { messages, conversations, profile } = get();
        if (!profile) return;
        
        console.log('[deleteMessage] Deleting message:', messageId, 'forAll:', forAll);
        
        const message = messages.find(m => m.id === messageId);
        if (!message) return;
        
        const pairId = message.pairId;
        console.log('[deleteMessage] Message pairId:', pairId);
        
        if (forAll) {
          set({
            messages: messages.map(msg => {
              if (msg.id === messageId) {
                return { ...msg, deletedForAll: true, content: '' };
              }
              if (pairId && msg.pairId === pairId) {
                console.log('[deleteMessage] Also deleting paired message:', msg.id);
                return { ...msg, deletedForAll: true, content: '' };
              }
              return msg;
            }),
            conversations: conversations.map(conv => {
              if (conv.id !== message.conversationId) return conv;
              const convMessages = messages.filter(m => m.conversationId === conv.id && !m.deletedForAll && !(pairId && m.pairId === pairId));
              const lastMsg = convMessages[convMessages.length - 1];
              if (lastMsg?.id === messageId || (pairId && lastMsg?.pairId === pairId) || convMessages.length <= 1) {
                const remaining = convMessages.filter(m => m.id !== messageId && !(pairId && m.pairId === pairId));
                const newLast = remaining[remaining.length - 1];
                return { 
                  ...conv, 
                  lastMessage: newLast?.content || 'Message deleted',
                  lastMessageAt: newLast?.createdAt || conv.lastMessageAt,
                };
              }
              return conv;
            }),
          });
        } else {
          set({
            messages: messages.map(msg => {
              if (msg.id === messageId) {
                return { ...msg, deletedForMe: true };
              }
              if (pairId && msg.pairId === pairId) {
                console.log('[deleteMessage] Also marking paired message as deletedForMe:', msg.id);
                return { ...msg, deletedForMe: true };
              }
              return msg;
            }),
          });
        }
      },
      
      undoSendMessage: (messageId: string) => {
        const { messages, conversations } = get();
        
        console.log('[undoSendMessage] Undoing message:', messageId);
        
        const message = messages.find(m => m.id === messageId);
        if (!message) return;
        
        const pairId = message.pairId;
        console.log('[undoSendMessage] Message pairId:', pairId);
        
        const messagesToRemove = pairId 
          ? messages.filter(m => m.pairId === pairId).map(m => m.id)
          : [messageId];
        
        console.log('[undoSendMessage] Removing messages:', messagesToRemove);
        
        set({
          messages: messages.filter(m => !messagesToRemove.includes(m.id)),
          conversations: conversations.map(conv => {
            if (conv.id !== message.conversationId) return conv;
            const remaining = messages.filter(m => m.conversationId === conv.id && !messagesToRemove.includes(m.id));
            const lastMsg = remaining[remaining.length - 1];
            return {
              ...conv,
              lastMessage: lastMsg?.content || '',
              lastMessageAt: lastMsg?.createdAt || conv.lastMessageAt,
            };
          }),
        });
      },
      
      canEditOrUndoMessage: (message: Message) => {
        const { profile } = get();
        if (!profile) return false;
        if (message.senderId !== profile.id) return false;
        if (message.deletedForAll) return false;
        
        if (!message.readAt) return true;
        
        const timeSinceRead = Date.now() - message.readAt;
        return timeSinceRead <= 30000;
      },
      
      getMessageById: (messageId: string) => {
        const { messages } = get();
        return messages.find(m => m.id === messageId);
      },
      
      setPendingSparkShare: (payload: SparkSharePayload | null) => {
        console.log('[setPendingSparkShare] Setting payload:', payload?.id);
        set({ pendingSparkShare: payload });
      },
      
      clearPendingSparkShare: () => {
        console.log('[clearPendingSparkShare] Clearing pending spark share');
        set({ pendingSparkShare: null });
      },
      
      sendSparkShareMessage: (conversationId: string, sparkShare: SparkShareContent, comment?: string) => {
        const { profile, conversations, messages } = get();
        if (!profile) return;
        
        const now = new Date().toISOString();
        const isSelfTest = conversationId === 'self-test';
        const pairId = isSelfTest ? `spark-pair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : undefined;
        
        const sparkShareWithComment: SparkShareContent = {
          ...sparkShare,
          comment: comment?.trim() || undefined,
        };
        
        const newMessage: Message = {
          id: `message-spark-${Date.now()}`,
          conversationId,
          senderId: profile.id,
          content: comment?.trim() || '',
          createdAt: now,
          read: true,
          status: 'sent',
          reactions: [],
          type: 'sparkShare',
          sparkShare: sparkShareWithComment,
          pairId,
          isEcho: false,
        };
        
        console.log('[sendSparkShareMessage] Sending spark share to:', conversationId, 'isSelfTest:', isSelfTest, 'comment:', comment?.trim() || '(none)');
        
        let updatedMessages = [...messages, newMessage];
        
        // For self-test thread, immediately add an echo message so user sees recipient experience
        if (isSelfTest) {
          const echoTime = new Date(Date.now() + 100).toISOString();
          const echoMessage: Message = {
            id: `echo-spark-${Date.now()}`,
            conversationId,
            senderId: 'echo',
            content: comment?.trim() || '',
            createdAt: echoTime,
            read: true,
            reactions: [],
            type: 'sparkShare',
            sparkShare: sparkShareWithComment,
            pairId,
            isEcho: true,
          };
          updatedMessages = [...updatedMessages, echoMessage];
          console.log('[sendSparkShareMessage] Added echo spark share for self-test');
        }
        
        const lastMessageText = comment?.trim() ? `✨ ${comment.trim()}` : '✨ Shared a Spark';
        
        set({
          messages: updatedMessages,
          conversations: conversations.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: lastMessageText, lastMessageAt: now } 
              : conv
          ),
          pendingSparkShare: null,
        });
      },
      
      setTheme: (theme) => set({ theme }),

      markSparkFlipHintSeen: () => set({ hasSeenSparkFlipHint: true }),

      softReload: () => {
        console.log('[softReload] Performing soft reload - preserving all data');
        const state = get();
        
        // Re-trigger data refresh without clearing anything
        if (state.profile?.hasCompletedOnboarding) {
          // Ensure today's spark exists
          state.ensureTodaySparkExists();
          
          // Re-sync calendar events
          state.syncProfileDatesToCalendar();
          
          console.log('[softReload] Soft reload complete - data preserved');
        }
      },

      reset: () =>
        set({
          _lastSparkCheck: null,
          theme: 'dark',
          hasSeenSparkFlipHint: false,
          badgeDisplayEnabled: true,
          sparkCardSpeechEnabled: true,
          parqCardSpeechEnabled: true,
          profile: null,
          onboardingData: initialOnboardingData,
          userSparks: [],
          userJourneys: [],
          checkIns: [],
          journalEntries: [],
          savedParqIds: [],
          savedPostIds: [],
          favoriteSparkIds: [],
          favoriteParqIds: [],
          favoritePostIds: [],
          postReactions: [],
          postComments: [],
          postBookmarks: [],
          pendingPosts: [],
          partnerGroups: [],
          calendarEvents: [],
          coachingSessions: [],
          conversations: [],
          messages: [],
          pendingSparkShare: null,
        }),
    }),
    {
      name: 'sparkd-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const value = await AsyncStorage.getItem(name);
            if (value === null) return null;
            // Validate that it's actually JSON before returning
            JSON.parse(value);
            return value;
          } catch (error) {
            console.warn('[Storage] Corrupted data detected, clearing storage:', error);
            await AsyncStorage.removeItem(name);
            return null;
          }
        },
        setItem: async (name: string, value: string) => {
          await AsyncStorage.setItem(name, value);
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      })),
      partialize: (state) => {
        const { _hasHydrated, setHasHydrated, ...rest } = state;
        return rest as AppState;
      },
      onRehydrateStorage: () => {
        console.log('Starting hydration...');
        return (state, error) => {
          if (error) {
            console.log('Hydration error:', error);
          }
          console.log('Hydration complete');
          if (state) {
            // Use the setter to properly trigger React re-renders
            state.setHasHydrated(true);
            
            if (state.profile && state.profile.hasCompletedOnboarding) {
              if (state.profile.streak === undefined || state.profile.streak === 0) {
                state.profile.streak = 10;
                console.log('Migrated streak to 10');
              }
              if (state.profile.totalXP === undefined || state.profile.totalXP === 0 || state.profile.totalXP === 600) {
                state.profile.totalXP = 1000;
                console.log('Migrated totalXP to 1000');
              }
              if (state.profile.profilePrivacy === undefined) {
                state.profile.profilePrivacy = 'public';
                console.log('Migrated profilePrivacy to public');
              }
              if (state.profile.sharedStoriesCommentsEnabled === undefined) {
                state.profile.sharedStoriesCommentsEnabled = true;
                console.log('Migrated sharedStoriesCommentsEnabled to true');
              }
              if (state.profile.sharedStoriesPrivacy === undefined) {
                state.profile.sharedStoriesPrivacy = 'credited';
                console.log('Migrated sharedStoriesPrivacy to credited');
              }
              if (state.profile.location === undefined) {
                state.profile.location = 'Las Vegas, NV';
                console.log('Migrated location to Las Vegas, NV');
              }
              if (state.profile.followersCount === undefined) {
                state.profile.followersCount = 10100000;
                console.log('Migrated followersCount to 10.1M');
              }
              if (state.profile.followingCount === undefined) {
                state.profile.followingCount = 23;
                console.log('Migrated followingCount to 23');
              }
              
              console.log('[Hydration] Ensuring today spark exists...');
              setTimeout(() => {
                state.ensureTodaySparkExists();
              }, 100);
              
              console.log('[Hydration] Syncing anniversary to calendar...');
              setTimeout(() => {
                if (state.profile) {
                  state.syncAnniversaryToCalendar(state.profile.id, state.profile.anniversary);
                }
              }, 150);
              
              const now = new Date();
              
              if (!state.conversations || state.conversations.length === 0) {
                console.log('[Hydration] Seeding sample conversations...');
                
                const jan2 = '2026-01-02T10:00:00.000Z';
                const jan1 = '2026-01-01T14:00:00.000Z';
                const dec31 = '2025-12-31T16:00:00.000Z';
                
                state.conversations = [
                  {
                    id: 'conv-partner',
                    userId: state.profile.id,
                    participantId: 'user-partner',
                    participantName: 'Alex',
                    participantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
                    isPartner: true,
                    relationshipType: 'partner',
                    lastMessage: 'Can\'t wait to see you tonight! 💕',
                    lastMessageAt: jan2,
                    unreadCount: 0,
                  },
                  {
                    id: 'conv-friend-sarah-lopez',
                    userId: state.profile.id,
                    participantId: 'user-sarah-lopez',
                    participantName: 'Dr. Sarah Lopez',
                    participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
                    isPartner: false,
                    relationshipType: 'friend',
                    lastMessage: 'I\'d love to discuss some strategies that could help...',
                    lastMessageAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                    unreadCount: 1,
                  },
                  {
                    id: 'conv-friend1',
                    userId: state.profile.id,
                    participantId: 'user-friend1',
                    participantName: 'Sarah',
                    participantAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
                    isPartner: false,
                    relationshipType: 'friend',
                    lastMessage: 'Hey! Did you see the new coffee shop?',
                    lastMessageAt: jan2,
                    unreadCount: 0,
                  },
                  {
                    id: 'conv-friend2',
                    userId: state.profile.id,
                    participantId: 'user-friend2',
                    participantName: 'Mike',
                    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                    isPartner: false,
                    relationshipType: 'friend',
                    lastMessage: 'Thanks for the advice!',
                    lastMessageAt: jan1,
                    unreadCount: 0,
                  },
                  {
                    id: 'conv-friend3',
                    userId: state.profile.id,
                    participantId: 'user-friend3',
                    participantName: 'Emma',
                    participantAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop',
                    isPartner: false,
                    relationshipType: 'friend',
                    lastMessage: 'Let me know when you\'re free!',
                    lastMessageAt: dec31,
                    unreadCount: 0,
                  },
                  {
                    id: 'conv-community-kai',
                    userId: state.profile.id,
                    participantId: 'user-community-kai',
                    participantName: 'Kai Bennett',
                    participantAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
                    isPartner: false,
                    relationshipType: 'community',
                    lastMessage: 'Yo I saw your post in Singles & Thriving...',
                    lastMessageAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                    unreadCount: 1,
                  },
                ];
                
                state.messages = [
                  {
                    id: 'msg-1',
                    conversationId: 'conv-partner',
                    senderId: 'user-partner',
                    content: 'Good morning! ☀️',
                    createdAt: '2026-01-02T08:00:00.000Z',
                    read: true,
                  },
                  {
                    id: 'msg-2',
                    conversationId: 'conv-partner',
                    senderId: state.profile.id,
                    content: 'Morning babe! How did you sleep?',
                    createdAt: '2026-01-02T08:30:00.000Z',
                    read: true,
                  },
                  {
                    id: 'msg-3',
                    conversationId: 'conv-partner',
                    senderId: 'user-partner',
                    content: 'So good! Excited for dinner tonight',
                    createdAt: '2026-01-02T09:00:00.000Z',
                    read: true,
                  },
                  {
                    id: 'msg-4',
                    conversationId: 'conv-partner',
                    senderId: 'user-partner',
                    content: 'Can\'t wait to see you tonight! 💕',
                    createdAt: jan2,
                    read: true,
                  },
                  {
                    id: 'msg-sarah-lopez-1',
                    conversationId: 'conv-friend-sarah-lopez',
                    senderId: 'user-sarah-lopez',
                    content: 'Hi there! I saw your profile and thought we might connect well.',
                    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                    read: true,
                  },
                  {
                    id: 'msg-sarah-lopez-2',
                    conversationId: 'conv-friend-sarah-lopez',
                    senderId: state.profile.id,
                    content: 'Hi Dr. Lopez! Thanks for reaching out.',
                    createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
                    read: true,
                  },
                  {
                    id: 'msg-sarah-lopez-3',
                    conversationId: 'conv-friend-sarah-lopez',
                    senderId: 'user-sarah-lopez',
                    content: 'I\'d love to discuss some strategies that could help...',
                    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                    read: false,
                  },
                  {
                    id: 'msg-5',
                    conversationId: 'conv-friend1',
                    senderId: 'user-friend1',
                    content: 'Hey! Did you see the new coffee shop?',
                    createdAt: jan2,
                    read: true,
                  },
                  {
                    id: 'msg-6',
                    conversationId: 'conv-friend2',
                    senderId: state.profile.id,
                    content: 'What do you think about this?',
                    createdAt: '2026-01-01T12:00:00.000Z',
                    read: true,
                  },
                  {
                    id: 'msg-7',
                    conversationId: 'conv-friend2',
                    senderId: 'user-friend2',
                    content: 'Thanks for the advice!',
                    createdAt: jan1,
                    read: true,
                  },
                  {
                    id: 'msg-8',
                    conversationId: 'conv-friend3',
                    senderId: 'user-friend3',
                    content: 'Let me know when you\'re free!',
                    createdAt: dec31,
                    read: true,
                  },
                  {
                    id: 'msg-community-kai-1',
                    conversationId: 'conv-community-kai',
                    senderId: 'user-community-kai',
                    content: 'Hey! Just saw you in the Singles & Thriving room',
                    createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
                    read: true,
                  },
                  {
                    id: 'msg-community-kai-2',
                    conversationId: 'conv-community-kai',
                    senderId: state.profile.id,
                    content: 'Oh hey! Yeah I\'ve been hanging out there lately',
                    createdAt: new Date(now.getTime() - 4.5 * 60 * 60 * 1000).toISOString(),
                    read: true,
                  },
                  {
                    id: 'msg-community-kai-3',
                    conversationId: 'conv-community-kai',
                    senderId: 'user-community-kai',
                    content: 'Yo I saw your post in Singles & Thriving...',
                    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                    read: false,
                  },
                ];
              } else {
                console.log('[Hydration] Conversations exist, checking for missing seeded data...');
                
                const hasPartner = state.conversations.some(c => c.isPartner || c.relationshipType === 'partner');
                const hasFriends = state.conversations.some(c => c.relationshipType === 'friend');
                const hasCommunity = state.conversations.some(c => c.relationshipType === 'community');
                
                if (!hasPartner || !hasFriends || !hasCommunity) {
                  console.log('[Hydration] Missing conversation categories, re-seeding all...');
                  
                  const jan2 = '2026-01-02T10:00:00.000Z';
                  const jan1 = '2026-01-01T14:00:00.000Z';
                  const dec31 = '2025-12-31T16:00:00.000Z';
                  
                  state.conversations = [
                    {
                      id: 'conv-partner',
                      userId: state.profile.id,
                      participantId: 'user-partner',
                      participantName: 'Alex',
                      participantAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
                      isPartner: true,
                      relationshipType: 'partner',
                      lastMessage: 'Can\'t wait to see you tonight! 💕',
                      lastMessageAt: jan2,
                      unreadCount: 0,
                    },
                    {
                      id: 'conv-friend-sarah-lopez',
                      userId: state.profile.id,
                      participantId: 'user-sarah-lopez',
                      participantName: 'Dr. Sarah Lopez',
                      participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
                      isPartner: false,
                      relationshipType: 'friend',
                      lastMessage: 'I\'d love to discuss some strategies that could help...',
                      lastMessageAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                      unreadCount: 1,
                    },
                    {
                      id: 'conv-friend1',
                      userId: state.profile.id,
                      participantId: 'user-friend1',
                      participantName: 'Sarah',
                      participantAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
                      isPartner: false,
                      relationshipType: 'friend',
                      lastMessage: 'Hey! Did you see the new coffee shop?',
                      lastMessageAt: jan2,
                      unreadCount: 0,
                    },
                    {
                      id: 'conv-friend2',
                      userId: state.profile.id,
                      participantId: 'user-friend2',
                      participantName: 'Mike',
                      participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                      isPartner: false,
                      relationshipType: 'friend',
                      lastMessage: 'Thanks for the advice!',
                      lastMessageAt: jan1,
                      unreadCount: 0,
                    },
                    {
                      id: 'conv-friend3',
                      userId: state.profile.id,
                      participantId: 'user-friend3',
                      participantName: 'Emma',
                      participantAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop',
                      isPartner: false,
                      relationshipType: 'friend',
                      lastMessage: 'Let me know when you\'re free!',
                      lastMessageAt: dec31,
                      unreadCount: 0,
                    },
                    {
                      id: 'conv-community-kai',
                      userId: state.profile.id,
                      participantId: 'user-community-kai',
                      participantName: 'Kai Bennett',
                      participantAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
                      isPartner: false,
                      relationshipType: 'community',
                      lastMessage: 'Yo I saw your post in Singles & Thriving...',
                      lastMessageAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                      unreadCount: 1,
                    },
                  ];
                  
                  state.messages = [
                    {
                      id: 'msg-1',
                      conversationId: 'conv-partner',
                      senderId: 'user-partner',
                      content: 'Good morning! ☀️',
                      createdAt: '2026-01-02T08:00:00.000Z',
                      read: true,
                    },
                    {
                      id: 'msg-2',
                      conversationId: 'conv-partner',
                      senderId: state.profile.id,
                      content: 'Morning babe! How did you sleep?',
                      createdAt: '2026-01-02T08:30:00.000Z',
                      read: true,
                    },
                    {
                      id: 'msg-3',
                      conversationId: 'conv-partner',
                      senderId: 'user-partner',
                      content: 'So good! Excited for dinner tonight',
                      createdAt: '2026-01-02T09:00:00.000Z',
                      read: true,
                    },
                    {
                      id: 'msg-4',
                      conversationId: 'conv-partner',
                      senderId: 'user-partner',
                      content: 'Can\'t wait to see you tonight! 💕',
                      createdAt: jan2,
                      read: true,
                    },
                    {
                      id: 'msg-sarah-lopez-1',
                      conversationId: 'conv-friend-sarah-lopez',
                      senderId: 'user-sarah-lopez',
                      content: 'Hi there! I saw your profile and thought we might connect well.',
                      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                      read: true,
                    },
                    {
                      id: 'msg-sarah-lopez-2',
                      conversationId: 'conv-friend-sarah-lopez',
                      senderId: state.profile.id,
                      content: 'Hi Dr. Lopez! Thanks for reaching out.',
                      createdAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
                      read: true,
                    },
                    {
                      id: 'msg-sarah-lopez-3',
                      conversationId: 'conv-friend-sarah-lopez',
                      senderId: 'user-sarah-lopez',
                      content: 'I\'d love to discuss some strategies that could help...',
                      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                      read: false,
                    },
                    {
                      id: 'msg-5',
                      conversationId: 'conv-friend1',
                      senderId: 'user-friend1',
                      content: 'Hey! Did you see the new coffee shop?',
                      createdAt: jan2,
                      read: true,
                    },
                    {
                      id: 'msg-6',
                      conversationId: 'conv-friend2',
                      senderId: state.profile.id,
                      content: 'What do you think about this?',
                      createdAt: '2026-01-01T12:00:00.000Z',
                      read: true,
                    },
                    {
                      id: 'msg-7',
                      conversationId: 'conv-friend2',
                      senderId: 'user-friend2',
                      content: 'Thanks for the advice!',
                      createdAt: jan1,
                      read: true,
                    },
                    {
                      id: 'msg-8',
                      conversationId: 'conv-friend3',
                      senderId: 'user-friend3',
                      content: 'Let me know when you\'re free!',
                      createdAt: dec31,
                      read: true,
                    },
                    {
                      id: 'msg-community-kai-1',
                      conversationId: 'conv-community-kai',
                      senderId: 'user-community-kai',
                      content: 'Hey! Just saw you in the Singles & Thriving room',
                      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
                      read: true,
                    },
                    {
                      id: 'msg-community-kai-2',
                      conversationId: 'conv-community-kai',
                      senderId: state.profile.id,
                      content: 'Oh hey! Yeah I\'ve been hanging out there lately',
                      createdAt: new Date(now.getTime() - 4.5 * 60 * 60 * 1000).toISOString(),
                      read: true,
                    },
                    {
                      id: 'msg-community-kai-3',
                      conversationId: 'conv-community-kai',
                      senderId: 'user-community-kai',
                      content: 'Yo I saw your post in Singles & Thriving...',
                      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                      read: false,
                    },
                  ];
                }
              }
              
              const convCounts = {
                total: state.conversations.length,
                partner: state.conversations.filter(c => c.relationshipType === 'partner' || c.isPartner).length,
                coach: state.conversations.filter(c => c.relationshipType === 'coach').length,
                friend: state.conversations.filter(c => c.relationshipType === 'friend' || (!c.relationshipType && !c.isPartner)).length,
                community: state.conversations.filter(c => c.relationshipType === 'community').length,
              };
              console.log('[Hydration] Conversation counts by type:', convCounts);
              console.log('[Hydration] Community conversations exist:', 
                state.conversations.some(c => c.id === 'conv-community-kai'),
                state.conversations.some(c => c.id === 'conv-community-maya')
              );
            }
          }
        };
      },
    }
  )
);

// Set up hydration tracking after store creation
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  // Subscribe to hydration completion
  appStore.persist.onFinishHydration(() => {
    console.log('[Hydration] onFinishHydration callback triggered');
    appStore.setState({ _hasHydrated: true });
  });
  
  // Check if already hydrated (for hot reloads)
  if (appStore.persist.hasHydrated()) {
    console.log('[Hydration] Already hydrated on initial check');
    appStore.setState({ _hasHydrated: true });
  }
}

export const useAppStore = appStore;
