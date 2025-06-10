import { IconProps } from './components/common/IconComponents';

export interface UserProfile {
  name?: string; // Made optional
  spiritualGoal: string;
  bibleKnowledge: BibleKnowledgeLevel;
  preferredTradition: ChristianTradition | 'Exploring' | 'None';
  isSubscribed?: boolean; // New field for subscription status
  subscriptionTier?: string; // New field for subscription tier (e.g., 'premium')
  spiritualInterests?: string; // e.g., "Theology, Apologetics, Early Church History"
  preferredBibleTranslation?: string; // e.g., "NIV", "ESV"
  devotionalTimePreference?: string; // e.g., "Morning", "Evening"
  aiFeedbackLevel?: 'Brief' | 'Detailed';
  aiCheckInFrequency?: 'Daily' | 'EveryFewDays' | 'Weekly';
  notificationSettings?: {
    prayerReminders: boolean;
    milestoneAlerts: boolean;
    communityUpdates: boolean;
    journalReminders?: boolean; // New
    aiCoachPrompts?: boolean; // New - for proactive AI engagement suggestions
    scriptureSuggestions?: boolean; // New - for daily/contextual verse suggestions
  };
  readChapters?: string[]; // Array of "Book Chapter", e.g., ["Genesis 1", "John 3"]
  savedInterpretations?: Interpretation[];
}

export enum BibleKnowledgeLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum ChristianTradition {
  CATHOLIC = 'Catholic',
  ORTHODOX = 'Orthodox',
  PROTESTANT_REFORMED = 'Protestant (Reformed)',
  PROTESTANT_METHODIST = 'Protestant (Methodist)',
  PROTESTANT_BAPTIST = 'Protestant (Baptist)',
  PROTESTANT_PENTECOSTAL = 'Protestant (Pentecostal)',
  PROTESTANT_NON_DENOMINATIONAL = 'Protestant (Non-Denominational)',
  ANGLICAN = 'Anglican',
  LUTHERAN = 'Lutheran',
}

export interface Theologian {
  id: string;
  name: string;
  tradition: ChristianTradition | string; // String for broader categories like 'Church Father'
  era: string; // e.g., "Early Church", "Reformation"
  bio?: string;
}

export interface Interpretation {
  id: string;
  passage: string; // e.g., "John 3:16"
  theologianId?: string; // Made optional as AI might not provide one
  summary: string;
  fullText?: string; // Optional longer excerpt
  keywords?: string[];
  theologianName?: string; // For AI-generated or directly named theologians
  theologianTradition?: string; // For AI-generated or directly named traditions
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestions?: string[]; // AI can suggest next questions or topics
}

export interface PrayerRequest {
  id:string;
  text: string;
  timestamp: Date;
  isAnswered: boolean;
  sharedWithCommunity?: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  timestamp: Date;
  mood?: string; // e.g., "Hopeful", "Reflective" - could be AI analyzed
  themes?: string[]; // AI identified themes
  tags?: string[]; // New: For user-defined tags like "Gratitude", "Doubt"
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  focusArea: string; // e.g., "Men's Bible Study", "New Parents Support"
  isPrivate: boolean;
}

export interface SpiritualMilestone {
  id: string;
  title: string;
  description: string;
  achievedDate?: Date;
  iconName?: string; // e.g., "BookOpenIcon"
  progress?: number; // 0-100 for milestones in progress
}

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactElement<IconProps>;
}

// Onboarding Question Types
interface OnboardingQuestionBase {
  label: string;
}

export interface TextOnboardingQuestion extends OnboardingQuestionBase {
  id: 'name'; // Corresponds to UserProfile.name
  type: 'text';
  placeholder: string;
}

export interface SelectOnboardingQuestion extends OnboardingQuestionBase {
  id: 'spiritualGoal' | 'preferredTradition'; // Corresponds to UserProfile keys
  type: 'select';
  options: string[];
}

export interface RadioOnboardingQuestion extends OnboardingQuestionBase {
  id: 'bibleKnowledge'; // Corresponds to UserProfile key
  type: 'radio';
  options: string[];
}

export type OnboardingQuestion = TextOnboardingQuestion | SelectOnboardingQuestion | RadioOnboardingQuestion;

// Discipleship Planner Types
export type ActivityType = 
  | 'Bible Study' 
  | 'Prayer Time' 
  | 'Journaling' 
  | 'Meditation' 
  | 'Community Group'
  | 'Rest & Reflection';

export interface PlannedActivity {
  id: string;
  dayOfWeek: string; // e.g., "Monday"
  activityType: ActivityType;
  timeSlot?: string; // e.g., "Morning", "8:00 AM" (optional)
  aiSuggestion: string; // The core suggestion from AI, e.g., "Focus on the theme of forgiveness in Matthew 18"
  passageRef?: string; // Specific Bible passage, e.g., "Matthew 18:21-35"
  userNotes?: string; // User-added notes
  isCompleted?: boolean;
}

// Bible Structure Types
export interface BibleBook {
  name: string;
  chapters: number;
}

export interface Testament {
  name: string;
  books: BibleBook[];
}

export enum BibleStudyIntensity {
  LIGHT = "Light",
  MODERATE = "Moderate",
  DEEP_DIVE = "Deep Dive",
}

export interface AIWeeklyStudyPlan {
  title: string;
  dailyPlan: Array<{
    day: string; // e.g., "Monday"
    focus: string; // Main theme or instruction for the day
    passage?: string; // Optional specific passage
    tasks?: string[]; // Optional list of tasks/questions
  }>;
}