
import { BibleKnowledgeLevel, ChristianTradition, OnboardingQuestion, ActivityType, BibleBook, Testament } from './types';
import { SAMPLE_THEOLOGIANS } from './services/MockDb'; 

export const APP_NAME = "GrowthPath";

// --- Subscription Constants ---
export const SUBSCRIPTION_PRICE = 6.99; // Updated price
export const PREMIUM_TIER_NAME = 'Pro'; // Updated tier name

// --- Gemini API Constants ---
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17'; 
// export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002'; 
export const API_DELAY = 500; // ms for simulated API calls

// --- Bible Structure ---
export const BIBLE_STRUCTURE: Testament[] = [
  {
    name: 'Old Testament',
    books: [
      { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 }, { name: 'Leviticus', chapters: 27 },
      { name: 'Numbers', chapters: 36 }, { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
      { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
      { name: '2 Samuel', chapters: 24 }, { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
      { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 }, { name: 'Ezra', chapters: 10 },
      { name: 'Nehemiah', chapters: 13 }, { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
      { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 }, { name: 'Ecclesiastes', chapters: 12 },
      { name: 'Song of Solomon', chapters: 8 }, { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
      { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
      { name: 'Hosea', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
      { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 }, { name: 'Micah', chapters: 7 },
      { name: 'Nahum', chapters: 3 }, { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
      { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 }, { name: 'Malachi', chapters: 4 },
    ],
  },
  {
    name: 'New Testament',
    books: [
      { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 },
      { name: 'John', chapters: 21 }, { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
      { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 }, { name: 'Galatians', chapters: 6 },
      { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
      { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 }, { name: '1 Timothy', chapters: 6 },
      { name: '2 Timothy', chapters: 4 }, { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
      { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 }, { name: '1 Peter', chapters: 5 },
      { name: '2 Peter', chapters: 3 }, { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
      { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 }, { name: 'Revelation', chapters: 22 },
    ],
  },
];

export const getBooksForTestament = (testamentName: string): BibleBook[] => {
  const testament = BIBLE_STRUCTURE.find(t => t.name === testamentName);
  return testament ? testament.books : [];
};

export const getChaptersForBook = (testamentName: string, bookName: string): number[] => {
  const testament = BIBLE_STRUCTURE.find(t => t.name === testamentName);
  if (!testament) return [];
  const book = testament.books.find(b => b.name === bookName);
  return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [];
};

export const getVersesForChapter = (bookName: string, chapterNumber: number): number[] => {
  // Example: Returns 50 verses for any chapter. A real app might need actual verse counts.
  if (bookName && chapterNumber > 0) {
    return Array.from({ length: 50 }, (_, i) => i + 1);
  }
  return [];
};

// --- Onboarding Constants ---
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'spiritualGoal',
    type: 'select',
    label: 'What is your primary spiritual goal right now?',
    options: [
      'Understand the Bible better',
      'Develop a consistent prayer life',
      'Grow in a specific virtue (e.g., patience, love)',
      'Find guidance for a life decision',
      'Connect more deeply with God',
      'Explore theological topics',
    ],
  },
  {
    id: 'bibleKnowledge',
    type: 'radio',
    label: 'How would you describe your current Bible knowledge?',
    options: Object.values(BibleKnowledgeLevel),
  },
  {
    id: 'preferredTradition',
    type: 'select',
    label: 'Which Christian tradition do you most identify with, or are you exploring?',
    options: ['Exploring', 'None', ...Object.values(ChristianTradition)],
  },
];

// --- Tradition and Theologian Constants ---
export const TRADITION_THEOLOGIAN_LISTS: Record<string, string[]> = 
  SAMPLE_THEOLOGIANS.reduce<Record<string, string[]>>((acc, theologian) => {
    const traditionKey = theologian.tradition; 
    if (!acc[traditionKey]) {
      acc[traditionKey] = [];
    }
    acc[traditionKey].push(theologian.name);
    return acc;
  }, {});

export const ALL_CHRISTIAN_TRADITIONS: { value: string; label: string }[] = Array.from(
  new Set(SAMPLE_THEOLOGIANS.map(t => t.tradition))
)
.sort() 
.map(tradition => ({ value: tradition, label: tradition }));


// --- Discipleship Planner Constants ---
export const DAYS_OF_WEEK: string[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const ACTIVITY_TYPES: ActivityType[] = [
  'Bible Study', 
  'Prayer Time', 
  'Journaling', 
  'Meditation', 
  'Community Group',
  'Rest & Reflection'
];

// --- Profile & Settings Constants ---
export const BIBLE_TRANSLATIONS: string[] = ["NIV", "ESV", "KJV", "NASB", "NLT", "Message", "Other"];
export const DEVOTIONAL_TIMES: string[] = ["Morning", "Afternoon", "Evening", "Flexible"];
export const AI_FEEDBACK_LEVELS: { value: 'Brief' | 'Detailed'; label: string }[] = [
  { value: 'Brief', label: 'Brief & Concise' },
  { value: 'Detailed', label: 'Detailed & Comprehensive' },
];
export const AI_CHECK_IN_FREQUENCIES: { value: 'Daily' | 'EveryFewDays' | 'Weekly'; label: string }[] = [
  { value: 'Daily', label: 'Daily' },
  { value: 'EveryFewDays', label: 'Every Few Days' },
  { value: 'Weekly', label: 'Weekly' },
];
export const DEFAULT_NOTIFICATION_SETTINGS = {
  prayerReminders: true,
  milestoneAlerts: true,
  communityUpdates: true,
  journalReminders: true, // New
  aiCoachPrompts: false,   // New
  scriptureSuggestions: true, // New
};

// --- Prayer Journal Constants ---
export const PREDEFINED_JOURNAL_TAGS: string[] = [
  "Gratitude", "Doubt", "Hope", "Scripture Reflection", "Answered Prayer", 
  "Challenge", "Growth", "Peace", "Guidance", "Confession"
];
