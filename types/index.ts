export type RelationshipStatus = 'single' | 'dating' | 'partnered' | 'complicated';

export type FocusArea = 
  | 'communication' 
  | 'trust' 
  | 'play' 
  | 'intimacy' 
  | 'conflict' 
  | 'gratitude'
  | 'growth'
  | 'boundaries'
  | 'desire';

export type Tone = 'playful' | 'practical' | 'poetic';

export type CheckInSection = 
  | 'overallMood'
  | 'stressLevel'
  | 'energyLevel'
  | 'emotionalBandwidth'
  | 'socialCapacity'
  | 'connected'
  | 'safe'
  | 'respected'
  | 'capacityToGive'
  | 'needSupport';

export type Difficulty = 'light' | 'deeper' | 'brave';

export type SparkStatus = 'assigned' | 'completed' | 'skipped' | 'saved';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  hasCompletedOnboarding: boolean;
  status: RelationshipStatus;
  goals: string[];
  focusAreas: FocusArea[];
  tone: Tone;
  timeCommitment: number;
  createdAt: string;
  streak: number;
  totalXP: number;
  partnerGroupId?: string;
  astrologyEnabled?: boolean;
  birthday?: string;
  partnerBirthday?: string;
  anniversary?: string;
  intentions?: string[];
  checkInSections?: CheckInSection[];
  profilePrivacy?: 'public' | 'private';
  sharedStoriesCommentsEnabled?: boolean;
  sharedStoriesPrivacy?: 'credited' | 'anonymous' | 'variable';
  location?: string;
  followersCount?: number;
  followingCount?: number;
  title?: string;
}

export type RelationshipStage = 'early' | 'established' | 'any';

export interface Spark {
  id: string;
  title: string;
  focusArea: FocusArea;
  difficulty: Difficulty;
  lesson: string;
  starter: string;
  action: string;
  estTime: number;
  tags: string[];
  createdBy: 'system' | 'curator';
  relationshipStage: RelationshipStage;
}

export interface UserSpark {
  userId: string;
  sparkId: string;
  assignedDate: string;
  status: SparkStatus;
  completedAt?: string;
  rating?: number;
}

export interface Journey {
  id: string;
  title: string;
  days: number;
  overview: string;
  focusAreas: FocusArea[];
  difficulty: Difficulty;
  slug: string;
  steps: JourneyStep[];
  journeyType: 'devotional' | 'workshop';
  durationDays?: number;
  durationMinutes?: number;
}

export interface JourneyStep {
  dayIndex: number;
  title: string;
  sparkId?: string;
  customLesson?: string;
  customStarter?: string;
  customAction?: string;
}

export interface UserJourney {
  userId: string;
  journeyId: string;
  startedAt: string;
  currentDay: number;
  completedDays: number[];
  status: 'active' | 'completed' | 'paused';
}

export interface CheckIn {
  id: string;
  userId: string;
  createdAt: string;
  overallMood: number;
  stressLevel: number;
  energyLevel: number;
  emotionalBandwidth: number;
  socialCapacity: number;
  connected: number;
  safe: number;
  respected: number;
  capacityToGive: number;
  needSupport: number;
  sharedMetrics?: {
    overallMood: boolean;
    stressLevel: boolean;
    energyLevel: boolean;
    emotionalBandwidth: boolean;
    socialCapacity: boolean;
    connected: boolean;
    safe: boolean;
    respected: boolean;
    capacityToGive: boolean;
    needSupport: boolean;
  };
}

export type NotebookCategory = 'notes' | 'journal' | 'love_letter' | 'poems';

export type SendTarget = 'partner' | 'vault';

export interface JournalEntry {
  id: string;
  userId: string;
  createdAt: string;
  content: string;
  tags: string[];
  sparkId?: string;
  category?: NotebookCategory;
  sendTarget?: SendTarget;
  attachmentUri?: string;
  title?: string;
  showOnProfile?: boolean;
}

export interface OnboardingData {
  step: number;
  status: RelationshipStatus | null;
  goals: string[];
  focusAreas: FocusArea[];
  tone: Tone | null;
  timeCommitment: number;
  name?: string;
  username?: string;
  birthday?: string;
  partnerBirthday?: string;
  anniversary?: string;
}

export interface VaultItem {
  id: string;
  userId: string;
  type: 'photo' | 'spark' | 'inspo' | 'memory' | 'moment';
  title: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  tags: string[];
  favorite: boolean;
}

export interface TimelineItem {
  id: string;
  type: 'milestone' | 'spark-saved' | 'memory' | 'journal' | 'parq-saved' | 'game-saved';
  date: string;
  title: string;
  summary: string;
  badge: string;
  icon?: string;
  source?: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface MessageAttachment {
  type: 'image' | 'sticker';
  uri: string;
  meta?: Record<string, any>;
}

export interface SparkSharePayload {
  id: string;
  createdAt: number;
  sparkText: string;
  sparkLogoAsset: string;
  isParq?: boolean;
  parqType?: ParqType;
  parqDefaultMessage?: string;
}

export interface SparkShareContent {
  sparkText: string;
  sparkLogoAsset: string;
  comment?: string;
}

export type MessageType = 'text' | 'sparkShare';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  status?: MessageStatus;
  readAt?: number;
  deletedForAll?: boolean;
  deletedForMe?: boolean;
  editedAt?: number;
  replyToMessageId?: string;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  pairId?: string;
  isEcho?: boolean;
  type?: MessageType;
  sparkShare?: SparkShareContent;
}

export type ConversationRelationshipType = 'partner' | 'coach' | 'friend' | 'community' | 'ai';

export interface Conversation {
  id: string;
  userId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  isPartner: boolean;
  relationshipType?: ConversationRelationshipType;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  pinned?: boolean;
  muted?: boolean;
}

export interface InspirationEntry {
  id: string;
  type: 'quote' | 'affirmation' | 'ritual' | 'prompt';
  content: string;
  author?: string;
  category: string;
  tags: string[];
  mood?: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  type: 'turn-based' | 'local' | 'challenge' | 'collaborative';
  category: 'fun' | 'romantic' | 'deep' | 'competitive';
  minPlayers: number;
  maxPlayers: number;
  estTime: number;
}

export interface GameSession {
  id: string;
  gameId: string;
  players: string[];
  currentTurn: number;
  status: 'active' | 'completed' | 'paused';
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  emoji?: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  category: FocusArea;
  status: 'upcoming' | 'active' | 'completed';
}

export interface CalendarEvent {
  id: string;
  userId: string;
  type: 'spark' | 'journey' | 'date' | 'milestones' | 'coaching' | 'checkin' | 'workshops' | 'gamenight' | 'special';
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
  linkedId?: string;
}

export interface SavedItem {
  userId: string;
  itemType: 'spark' | 'inspo' | 'game' | 'challenge' | 'parq' | 'parq-post';
  itemId: string;
  savedAt: string;
}

export type ParqType = 'prompt' | 'affirmation' | 'ritual' | 'quote';

export interface ParqItem {
  id: string;
  type: ParqType;
  text: string;
  themeTags: string[];
  toneTag: string;
  source: 'curated' | 'ai';
  createdAt: string;
}

export interface InspoSection {
  id: string;
  slug: string;
  label: string;
  emoji: string;
  description: string;
  isComingSoon: boolean;
  isPremium: boolean;
  sortOrder: number;
}

export interface InspoPost {
  id: string;
  sectionId: string;
  title: string;
  body: string;
  actionSparkText?: string;
  actionSparkType?: 'prompt' | 'affirmation' | 'ritual' | 'quote' | 'link' | 'other';
  tags: string[];
  source: 'user' | 'curated' | 'ai';
  status: 'pending' | 'approved' | 'rejected';
  authorUserId?: string;
  authorDisplayName?: string;
  privacy?: 'credited' | 'anonymous';
  isTopStory: boolean;
  isWeeklyCurated: boolean;
  weeklyCuratedAt?: string;
  likes: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  recipeIngredients?: string;
  recipeSteps?: string;
  recipeLink?: string;
  attachmentUri?: string;
  hasMedia?: boolean;
  mediaType?: 'image' | 'video';
  mediaThumbnailUrl?: string;
  mediaUrl?: string;
  thumbnailRank?: number;
}

export interface InspoReaction {
  id: string;
  postId: string;
  userId: string;
  type: 'like';
  createdAt: string;
}

export interface InspoComment {
  id: string;
  postId: string;
  userId: string;
  userDisplayName?: string;
  body: string;
  createdAt: string;
}

export interface InspoBookmark {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface PartnerGroup {
  id: string;
  ownerUserId: string;
  joinCode: string;
  createdAt: string;
}

export interface CoachProfile {
  id: string;
  name: string;
  photoUrl: string;
  credentials: string;
  specialty: string;
  bio: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  availableSessionTypes: CoachSessionType[];
}

export interface CoachSessionType {
  id: string;
  name: string;
  duration: number;
  price?: number;
}

export interface CoachingSession {
  id: string;
  userId: string;
  coachId: string;
  coachName: string;
  sessionTypeId: string;
  sessionTypeName: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}
