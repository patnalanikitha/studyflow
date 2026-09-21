export type CardReviewRating = 0 | 1 | 2 | 3 | 4 | 5; // 0=complete blackout, 3=correct with difficulty, 5=perfect recall

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  // SM-2 Spaced Repetition parameters
  interval: number; // Interval in days
  repetitions: number; // Consecutive successful reviews
  easeFactor: number; // Easiness factor (minimum 1.3, default 2.5)
  dueDate: string; // ISO string of when card is due
  lastReviewedAt?: string;
  state: 'new' | 'learning' | 'review';
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  subject: string;
  icon: string;
  color: string;
  createdAt: string;
  cards: Flashcard[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  questions: QuizQuestion[];
  bestScore?: number;
  timesTaken: number;
  createdAt: string;
}

export interface ExamTopic {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hoursEstimated: number;
  completed: boolean;
}

export interface ExamPlan {
  id: string;
  subject: string;
  examDate: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  topics: ExamTopic[];
}

export interface DailyStudyActivity {
  date: string; // YYYY-MM-DD
  minutes: number;
  cardsReviewed: number;
  pomodorosCompleted: number;
  quizzesTaken: number;
}

export type SoundscapeType = 'none' | 'rain' | 'lofi-noise' | 'cafe' | 'binaural-alpha' | 'night-crickets';

export interface PixelPetState {
  species: 'cat' | 'bear' | 'bunny' | 'frog';
  name: string;
  level: number;
  coins: number;
  currentRoomTheme: 'cozy-loft' | 'cyberpunk-study' | 'forest-cabin' | 'matcha-cafe';
  equippedHat: 'none' | 'graduate-cap' | 'headphones' | 'wizard-hat' | 'sprout';
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  topic?: string;
}
