import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Deck,
  Flashcard,
  Quiz,
  ExamPlan,
  DailyStudyActivity,
  PixelPetState,
  CardReviewRating,
  HatId,
  RoomThemeId,
  DeskTrinketId,
  Quest,
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

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q-cards',
    title: 'Active Memory Drill',
    description: 'Review at least 4 flashcards with SM-2 spaced repetition.',
    rewardCoins: 35,
    rewardXp: 60,
    target: 4,
    current: 0,
    claimed: false,
    category: 'cards',
  },
  {
    id: 'q-pomodoro',
    title: 'Deep Focus Flow',
    description: 'Complete at least 1 focus session in the Pixel Studio.',
    rewardCoins: 40,
    rewardXp: 80,
    target: 1,
    current: 0,
    claimed: false,
    category: 'focus',
  },
  {
    id: 'q-quiz',
    title: 'Knowledge Challenge',
    description: 'Complete 1 practice quiz or mock exam.',
    rewardCoins: 45,
    rewardXp: 70,
    target: 1,
    current: 0,
    claimed: false,
    category: 'quiz',
  },
  {
    id: 'q-task',
    title: 'Goal Crusher',
    description: 'Complete at least 2 study objectives on your checklist.',
    rewardCoins: 30,
    rewardXp: 50,
    target: 2,
    current: 0,
    claimed: false,
    category: 'task',
  },
];

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
  recordTaskCompleted: () => void;
  todayStats: { minutes: number; cardsReviewed: number; pomodoros: number };

  // Whimsical Pixel Pet & Gamification
  pixelPet: PixelPetState;
  updatePixelPet: (updates: Partial<PixelPetState>) => void;
  awardXpAndCoins: (xp: number, coins: number) => void;
  spendCoins: (cost: number) => boolean;
  unlockShopItem: (category: 'hat' | 'theme' | 'trinket', id: string, cost: number) => boolean;
  equipShopItem: (category: 'hat' | 'theme' | 'trinket', id: string) => void;

  // Quests
  quests: Quest[];
  claimQuest: (questId: string) => void;

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

  const [quests, setQuests] = useState<Quest[]>(() =>
    loadFromStorage<Quest[]>('studyflow_daily_quests', INITIAL_QUESTS)
  );

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved !== null ? saved === 'true' : true;
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
    saveToStorage('studyflow_daily_quests', quests);
  }, [quests]);

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

  // Touch today's study metrics
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

  // Leveling & Coin progression formula
  const awardXpAndCoins = (xp: number, coins: number) => {
    setPixelPet(prev => {
      let currentXp = (prev.xp ?? 0) + xp;
      let currentLevel = prev.level ?? 1;
      let currentThreshold = prev.xpToNextLevel ?? 200;
      let didLevelUp = false;

      while (currentXp >= currentThreshold) {
        currentXp -= currentThreshold;
        currentLevel += 1;
        currentThreshold = Math.round(currentThreshold * 1.35);
        didLevelUp = true;
      }

      if (didLevelUp) {
        soundEngine.playRetroChime('levelUp');
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#fcd34d', '#ff80bf', '#38bdf8', '#4ade80', '#c084fc'],
        });
      }

      return {
        ...prev,
        xp: currentXp,
        level: currentLevel,
        xpToNextLevel: currentThreshold,
        coins: (prev.coins ?? 0) + coins + (didLevelUp ? 50 : 0),
        totalCoinsEarned: (prev.totalCoinsEarned ?? 0) + coins + (didLevelUp ? 50 : 0),
      };
    });
  };

  // Track quest progress
  const advanceQuestProgress = (category: Quest['category'], amount: number = 1) => {
    setQuests(prev =>
      prev.map(q => {
        if (q.category === category && !q.claimed) {
          return {
            ...q,
            current: Math.min(q.target, q.current + amount),
          };
        }
        return q;
      })
    );
  };

  const claimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.claimed || quest.current < quest.target) return;

    setQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, claimed: true } : q))
    );

    awardXpAndCoins(quest.rewardXp, quest.rewardCoins);
    soundEngine.playRetroChime('coin');
    confetti({ particleCount: 50, spread: 50 });
  };

  // Today stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = activity.find(a => a.date === todayStr);
  const todayStats = {
    minutes: todayActivity?.minutes || 0,
    cardsReviewed: todayActivity?.cardsReviewed || 0,
    pomodoros: todayActivity?.pomodorosCompleted || 0,
  };

  // Decks
  const addDeck = (deckData: Omit<Deck, 'id' | 'createdAt' | 'cards'>): string => {
    const newId = `deck-${Date.now()}`;
    const newDeck: Deck = {
      ...deckData,
      id: newId,
      createdAt: new Date().toISOString(),
      cards: [],
    };
    setDecks(prev => [newDeck, ...prev]);
    awardXpAndCoins(25, 15);
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
    awardXpAndCoins(newCardsData.length * 10, newCardsData.length * 5);
    soundEngine.playRetroChime('coin');
  };

  // Review card with SM-2
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

    touchTodayActivity(today => ({
      ...today,
      cardsReviewed: today.cardsReviewed + 1,
    }));

    advanceQuestProgress('cards', 1);

    // XP & Coin distribution: Higher recall rating yields higher XP!
    const earnedXp = rating >= 4 ? 20 : rating === 3 ? 12 : 6;
    const earnedCoins = rating >= 4 ? 15 : rating === 3 ? 10 : 4;
    awardXpAndCoins(earnedXp, earnedCoins);
    soundEngine.playRetroChime('cardFlip');
  };

  // Quizzes
  const addQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt' | 'timesTaken'>) => {
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`,
      timesTaken: 0,
      createdAt: new Date().toISOString(),
    };
    setQuizzes(prev => [newQuiz, ...prev]);
    awardXpAndCoins(35, 20);
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

    advanceQuestProgress('quiz', 1);

    const bonus = score >= 80 ? 40 : 15;
    awardXpAndCoins(60 + bonus, 30 + (score >= 80 ? 25 : 10));
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
    awardXpAndCoins(20, 10);
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
          topics: p.topics.map(t => {
            if (t.id === topicId) {
              const nextDone = !t.completed;
              if (nextDone) {
                awardXpAndCoins(25, 15);
                advanceQuestProgress('task', 1);
              }
              return { ...t, completed: nextDone };
            }
            return t;
          }),
        };
      })
    );
    soundEngine.playRetroChime('click');
  };

  // Focus sessions
  const recordFocusSession = (minutes: number) => {
    touchTodayActivity(today => ({
      ...today,
      minutes: today.minutes + minutes,
      pomodorosCompleted: today.pomodorosCompleted + 1,
    }));

    advanceQuestProgress('focus', 1);

    // XP & Coins scale with time spent studying!
    const earnedXp = Math.round(minutes * 3);
    const earnedCoins = Math.round(minutes * 1.5);
    awardXpAndCoins(earnedXp, earnedCoins);

    soundEngine.playRetroChime('pomodoroDone');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff80bf', '#fcd34d', '#99f6e4', '#bbf7d0'],
    });
  };

  const recordTaskCompleted = () => {
    advanceQuestProgress('task', 1);
    awardXpAndCoins(25, 15);
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

  // Shop item unlock & equip
  const unlockShopItem = (category: 'hat' | 'theme' | 'trinket', id: string, cost: number): boolean => {
    if (pixelPet.coins < cost) return false;

    setPixelPet(prev => {
      const remainingCoins = prev.coins - cost;
      if (category === 'hat') {
        const unlocked = Array.from(new Set([...(prev.unlockedHats || []), id as HatId]));
        return {
          ...prev,
          coins: remainingCoins,
          unlockedHats: unlocked,
          equippedHat: id as HatId,
        };
      } else if (category === 'theme') {
        const unlocked = Array.from(new Set([...(prev.unlockedThemes || []), id as RoomThemeId]));
        return {
          ...prev,
          coins: remainingCoins,
          unlockedThemes: unlocked,
          currentRoomTheme: id as RoomThemeId,
        };
      } else {
        const unlocked = Array.from(new Set([...(prev.unlockedTrinkets || []), id as DeskTrinketId]));
        return {
          ...prev,
          coins: remainingCoins,
          unlockedTrinkets: unlocked,
          deskTrinket: id as DeskTrinketId,
        };
      }
    });

    soundEngine.playRetroChime('coin');
    confetti({ particleCount: 60, spread: 60 });
    return true;
  };

  const equipShopItem = (category: 'hat' | 'theme' | 'trinket', id: string) => {
    setPixelPet(prev => {
      if (category === 'hat') return { ...prev, equippedHat: id as HatId };
      if (category === 'theme') return { ...prev, currentRoomTheme: id as RoomThemeId };
      return { ...prev, deskTrinket: id as DeskTrinketId };
    });
    soundEngine.playRetroChime('click');
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
        recordTaskCompleted,
        todayStats,
        pixelPet,
        updatePixelPet,
        awardXpAndCoins,
        spendCoins,
        unlockShopItem,
        equipShopItem,
        quests,
        claimQuest,
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
