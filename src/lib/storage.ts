import { Deck, Quiz, ExamPlan, DailyStudyActivity, PixelPetState } from '../types';

const STORAGE_KEYS = {
  DECKS: 'studyflow_decks',
  QUIZZES: 'studyflow_quizzes',
  EXAM_PLANS: 'studyflow_exam_plans',
  ACTIVITY: 'studyflow_activity',
  PIXEL_PET: 'studyflow_pixel_pet',
  THEME: 'studyflow_theme',
};

// Seed decks to ensure rich experience out of the box
export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-1',
    title: 'Computer Science: Algorithms & Complexity',
    description: 'Big-O notation, dynamic programming, graph traversal, and tree rotations.',
    subject: 'Computer Science',
    icon: '💻',
    color: 'from-blue-500 to-indigo-600',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c1',
        deckId: 'deck-1',
        front: 'What is the worst-case and average-case time complexity of QuickSort?',
        back: 'Average case: O(n log n). Worst case: O(n²) when the pivot selected is consistently the minimum or maximum element.',
        tags: ['Sorting', 'Algorithms'],
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        state: 'new',
      },
      {
        id: 'c2',
        deckId: 'deck-1',
        front: 'What is the difference between Dijkstra and A* Search?',
        back: 'Dijkstra explores paths solely based on actual cost from origin g(n). A* guides the search using a heuristic function h(n) estimating remaining distance: f(n) = g(n) + h(n).',
        tags: ['Graphs', 'Search'],
        interval: 3,
        repetitions: 1,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        state: 'learning',
      },
      {
        id: 'c3',
        deckId: 'deck-1',
        front: 'What are the four necessary conditions for Deadlock?',
        back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait (Coffman conditions)',
        tags: ['Operating Systems', 'Concurrency'],
        interval: 6,
        repetitions: 2,
        easeFactor: 2.6,
        dueDate: new Date().toISOString(),
        state: 'review',
      },
    ],
  },
  {
    id: 'deck-2',
    title: 'Cell Biology & Genetics',
    description: 'Mitosis, DNA replication forks, transcription, and translation machinery.',
    subject: 'Biology',
    icon: '🧬',
    color: 'from-emerald-500 to-teal-600',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c4',
        deckId: 'deck-2',
        front: 'What role does DNA Helicase play in DNA replication?',
        back: 'Helicase unwinds the double helix at the replication fork by breaking hydrogen bonds between complementary base pairs.',
        tags: ['Molecular Bio'],
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        state: 'new',
      },
      {
        id: 'c5',
        deckId: 'deck-2',
        front: 'What is the function of the ribosome during translation?',
        back: 'It coordinates mRNA codons with tRNA anticodons and catalyzes peptide bond formation between adjacent amino acids to assemble protein chains.',
        tags: ['Genetics', 'Proteins'],
        interval: 2,
        repetitions: 1,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        state: 'learning',
      },
    ],
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Operating Systems & Concurrency Mastery',
    subject: 'Computer Science',
    description: 'Test your grasp on semaphores, process scheduling, and virtual memory.',
    timesTaken: 3,
    bestScore: 100,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        question: 'Which page replacement algorithm suffers from Belady’s Anomaly?',
        options: ['LRU (Least Recently Used)', 'FIFO (First-In, First-Out)', 'Optimal Page Replacement', 'LFU (Least Frequently Used)'],
        correctOptionIndex: 1,
        explanation: 'FIFO can cause more page faults when allocated more page frames, known as Belady’s anomaly.',
        difficulty: 'medium',
      },
      {
        id: 'q2',
        question: 'What is the difference between a mutex and a binary semaphore?',
        options: [
          'A mutex has an ownership principle (only locking thread can release); semaphores can be signaled by any thread.',
          'There is zero difference; they are identical in all implementations.',
          'Semaphores cannot prevent race conditions.',
          'Mutexes are only implemented in hardware.',
        ],
        correctOptionIndex: 0,
        explanation: 'Mutex ownership dictates that only the thread that acquired the mutex lock may unlock it.',
        difficulty: 'hard',
      },
      {
        id: 'q3',
        question: 'In virtual memory, what is thrashing?',
        options: [
          'A hardware memory bus failure',
          'When a system spends more time swapping pages in/out than executing user instructions',
          'Fast sequential memory allocation in cache',
          'Deleting orphaned cache lines',
        ],
        correctOptionIndex: 1,
        explanation: 'Thrashing occurs when memory is oversubscribed and processes constantly incur page faults.',
        difficulty: 'medium',
      },
    ],
  },
];

export const INITIAL_EXAM_PLANS: ExamPlan[] = [
  {
    id: 'exam-1',
    subject: 'Algorithms & Data Structures Final',
    examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'high',
    topics: [
      { id: 't1', name: 'Dynamic Programming & Memoization', difficulty: 'hard', hoursEstimated: 6, completed: true },
      { id: 't2', name: 'Graph Theory & Shortest Path (Dijkstra, Bellman-Ford)', difficulty: 'hard', hoursEstimated: 5, completed: false },
      { id: 't3', name: 'Balanced Trees (AVL & Red-Black Trees)', difficulty: 'medium', hoursEstimated: 4, completed: false },
      { id: 't4', name: 'Sorting & Selection Algorithms', difficulty: 'easy', hoursEstimated: 2, completed: true },
    ],
  },
  {
    id: 'exam-2',
    subject: 'Cellular Neuroscience Midterm',
    examDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    topics: [
      { id: 't5', name: 'Action Potential & Voltage-Gated Ion Channels', difficulty: 'hard', hoursEstimated: 4, completed: false },
      { id: 't6', name: 'Synaptic Plasticity & LTP/LTD', difficulty: 'medium', hoursEstimated: 3, completed: false },
      { id: 't7', name: 'Neurotransmitter Synthesis & Vesicle Release', difficulty: 'easy', hoursEstimated: 2, completed: true },
    ],
  },
];

// Generate last 60 days of realistic study activity heatmap data
export function generateSeedActivity(): DailyStudyActivity[] {
  const activities: DailyStudyActivity[] = [];
  const today = new Date();

  for (let i = 60; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic study pattern (weekdays higher, occasional breaks)
    const isStudyDay = (i % 7 !== 0 && i % 5 !== 0) || i < 5;
    if (isStudyDay) {
      activities.push({
        date: dateStr,
        minutes: Math.floor(Math.random() * 90) + 30,
        cardsReviewed: Math.floor(Math.random() * 35) + 10,
        pomodorosCompleted: Math.floor(Math.random() * 4) + 1,
        quizzesTaken: i % 4 === 0 ? 1 : 0,
      });
    } else {
      activities.push({
        date: dateStr,
        minutes: 0,
        cardsReviewed: 0,
        pomodorosCompleted: 0,
        quizzesTaken: 0,
      });
    }
  }

  return activities;
}

export const INITIAL_PIXEL_PET: PixelPetState = {
  species: 'cat',
  name: 'Mochi',
  level: 4,
  xp: 140,
  xpToNextLevel: 250,
  coins: 160,
  totalCoinsEarned: 520,
  currentRoomTheme: 'cozy-loft',
  equippedHat: 'headphones',
  deskTrinket: 'matcha-latte',
  unlockedHats: ['none', 'headphones'],
  unlockedThemes: ['cozy-loft'],
  unlockedTrinkets: ['none', 'matcha-latte'],
};

// Storage helper methods
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export { STORAGE_KEYS };
