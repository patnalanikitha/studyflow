import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Deck,
  Flashcard,
  Quiz,
  ExamPlan,
  DailyStudyActivity,
  PixelPetState,
  CardReviewRating,
} from '../types';
import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  INITIAL_DECKS,
  INITIAL_QUIZZES,
  INITIAL_EXAM_PLANS,
  INITIAL_PIXEL_PET,
  generateSeedActivity,
} from '../lib/storage';
import { calculateSM2 } from '../lib/sm2';
import { soundEngine } from '../lib/soundEngine';
import { getStoredApiKey, saveStoredApiKey } from '../lib/gemini';
import confetti from 'canvas-confetti';

interface StudyContextType {
  // Decks & Flashcards
  decks: Deck[];
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'cards'>) => string;
  deleteDeck: (deckId: string) => void;
  addCardsToDeck: (deckId: string, cards: { front: string; back: string; tags: string[] }[]) => void;
  reviewCard: (deckId: string, cardId: string, rating: CardReviewRating) => void;

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'timesTaken'>) => void;
  recordQuizResult: (quizId: string, score: number) => void;

  // Exam Plans
  examPlans: ExamPlan[];
  addExamPlan: (plan: Omit<ExamPlan, 'id'>) => void;
  deleteExamPlan: (planId: string) => void;
  toggleExamTopic: (planId: string, topicId: string) => void;

  // Study Activity & Stats
  activity: DailyStudyActivity[];
  recordFocusSession: (minutes: number) => void;
  todayStats: { minutes: number; cardsReviewed: number; pomodoros: number };

  // Whimsical Pixel Pet & Gamification
  pixelPet: PixelPetState;
  updatePixelPet: (updates: Partial<PixelPetState>) => void;
  spendCoins: (cost: number) => boolean;

  // App Theme & API Key
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  apiKey: string;
  updateApiKey: (key: string) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage data or rich seed defaults
  const [decks, setDecks] = useState<Deck[]>(() =>
    loadFromStorage<Deck[]>(STORAGE_KEYS.DECKS, INITIAL_DECKS)
  );

  const [quizzes, setQuizzes] = useState<Quiz[]>(() =>
    loadFromStorage<Quiz[]>(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES)
  );

  const [examPlans, setExamPlans] = useState<ExamPlan[]>(() =>
    loadFromStorage<ExamPlan[]>(STORAGE_KEYS.EXAM_PLANS, INITIAL_EXAM_PLANS)
  );

  const [activity, setActivity] = useState<DailyStudyActivity[]>(() =>
    loadFromStorage<DailyStudyActivity[]>(STORAGE_KEYS.ACTIVITY, generateSeedActivity())
  );

  const [pixelPet, setPixelPet] = useState<PixelPetState>(() =>
    loadFromStorage<PixelPetState>(STORAGE_KEYS.PIXEL_PET, INITIAL_PIXEL_PET)
  );

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved !== null ? saved === 'true' : true; // Default to dark for slick aesthetic
  });

  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());

  // Persistence effects
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DECKS, decks);
  }, [decks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.QUIZZES, quizzes);
  }, [quizzes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXAM_PLANS, examPlans);
  }, [examPlans]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVITY, activity);
  }, [activity]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PIXEL_PET, pixelPet);
  }, [pixelPet]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const updateApiKey = (key: string) => {
    saveStoredApiKey(key);
    setApiKey(key);
  };

  // Helper to touch today's activity
  const touchTodayActivity = (updater: (today: DailyStudyActivity) => DailyStudyActivity) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setActivity(prev => {
      const idx = prev.findIndex(a => a.date === todayStr);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updater(next[idx]);
        return next;
      } else {
        const fresh: DailyStudyActivity = {
          date: todayStr,
          minutes: 0,
          cardsReviewed: 0,
          pomodorosCompleted: 0,
          quizzesTaken: 0,
        };
        return [...prev, updater(fresh)];
      }
    });
  };

  // Today's aggregate stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = activity.find(a => a.date === todayStr);
  const todayStats = {
    minutes: todayActivity?.minutes || 0,
    cardsReviewed: todayActivity?.cardsReviewed || 0,
    pomodoros: todayActivity?.pomodorosCompleted || 0,
  };

  // Deck operations
  const addDeck = (deckData: Omit<Deck, 'id' | 'createdAt' | 'cards'>): string => {
    const newId = `deck-${Date.now()}`;
    const newDeck: Deck = {
      ...deckData,
      id: newId,
      createdAt: new Date().toISOString(),
      cards: [],
    };
    setDecks(prev => [newDeck, ...prev]);
    soundEngine.playRetroChime('coin');
    return newId;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
  };

  const addCardsToDeck = (deckId: string, newCardsData: { front: string; back: string; tags: string[] }[]) => {
    setDecks(prev =>
      prev.map(deck => {
        if (deck.id !== deckId) return deck;

        const createdCards: Flashcard[] = newCardsData.map((c, i) => ({
          id: `card-${Date.now()}-${i}`,
          deckId,
          front: c.front,
          back: c.back,
          tags: c.tags,
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          dueDate: new Date().toISOString(),
          state: 'new',
        }));

        return {
          ...deck,
          cards: [...deck.cards, ...createdCards],
        };
      })
    );
    soundEngine.playRetroChime('coin');
  };

  // SM-2 Review Card implementation
  const reviewCard = (deckId: string, cardId: string, rating: CardReviewRating) => {
    setDecks(prev =>
      prev.map(deck => {
        if (deck.id !== deckId) return deck;
        return {
          ...deck,
          cards: deck.cards.map(card => {
            if (card.id !== cardId) return card;
            const sm2 = calculateSM2(card, rating);
            return {
              ...card,
              ...sm2,
              lastReviewedAt: new Date().toISOString(),
            };
          }),
        };
      })
    );

    // Activity tracking & Gamification
    touchTodayActivity(today => ({
      ...today,
      cardsReviewed: today.cardsReviewed + 1,
    }));

    // Reward coins for reviewing (rating 3+ gives 10 coins, rating < 3 gives 4 coins)
    const earnedCoins = rating >= 3 ? 10 : 4;
    awardCoins(earnedCoins);
    soundEngine.playRetroChime('cardFlip');
  };

  // Quiz operations
  const addQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt' | 'timesTaken'>) => {
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`,
      timesTaken: 0,
      createdAt: new Date().toISOString(),
    };
    setQuizzes(prev => [newQuiz, ...prev]);
    soundEngine.playRetroChime('coin');
  };

  const recordQuizResult = (quizId: string, score: number) => {
    setQuizzes(prev =>
      prev.map(q => {
        if (q.id !== quizId) return q;
        return {
          ...q,
          timesTaken: q.timesTaken + 1,
          bestScore: Math.max(q.bestScore ?? 0, score),
        };
      })
    );

    touchTodayActivity(today => ({
      ...today,
      quizzesTaken: today.quizzesTaken + 1,
    }));

    awardCoins(25);
    if (score >= 80) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      soundEngine.playRetroChime('levelUp');
    }
  };

  // Exam Plans
  const addExamPlan = (planData: Omit<ExamPlan, 'id'>) => {
    const newPlan: ExamPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setExamPlans(prev => [...prev, newPlan]);
  };

  const deleteExamPlan = (planId: string) => {
    setExamPlans(prev => prev.filter(p => p.id !== planId));
  };

  const toggleExamTopic = (planId: string, topicId: string) => {
    setExamPlans(prev =>
      prev.map(p => {
        if (p.id !== planId) return p;
        return {
          ...p,
          topics: p.topics.map(t => (t.id === topicId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
    soundEngine.playRetroChime('click');
  };

  // Focus Session completion
  const recordFocusSession = (minutes: number) => {
    touchTodayActivity(today => ({
      ...today,
      minutes: today.minutes + minutes,
      pomodorosCompleted: today.pomodorosCompleted + 1,
    }));

    // Award 30 coins for a full pomodoro
    awardCoins(30);
    soundEngine.playRetroChime('pomodoroDone');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff80bf', '#fcd34d', '#99f6e4', '#bbf7d0'],
    });
  };

  // Pixel Pet & Coins
  const awardCoins = (amount: number) => {
    setPixelPet(prev => {
      const nextCoins = prev.coins + amount;
      const nextLevel = Math.floor(nextCoins / 100) + 1;
      if (nextLevel > prev.level) {
        soundEngine.playRetroChime('levelUp');
      }
      return {
        ...prev,
        coins: nextCoins,
        level: Math.max(prev.level, nextLevel),
      };
    });
  };

  const spendCoins = (cost: number): boolean => {
    if (pixelPet.coins < cost) return false;
    setPixelPet(prev => ({
      ...prev,
      coins: prev.coins - cost,
    }));
    soundEngine.playRetroChime('coin');
    return true;
  };

  const updatePixelPet = (updates: Partial<PixelPetState>) => {
    setPixelPet(prev => ({ ...prev, ...updates }));
  };

  return (
    <StudyContext.Provider
      value={{
        decks,
        addDeck,
        deleteDeck,
        addCardsToDeck,
        reviewCard,
        quizzes,
        addQuiz,
        recordQuizResult,
        examPlans,
        addExamPlan,
        deleteExamPlan,
        toggleExamTopic,
        activity,
        recordFocusSession,
        todayStats,
        pixelPet,
        updatePixelPet,
        spendCoins,
        isDarkMode,
        toggleDarkMode,
        apiKey,
        updateApiKey,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
