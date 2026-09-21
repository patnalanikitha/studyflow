import React, { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DeckList } from './components/flashcards/DeckList';
import { FlashcardStudy } from './components/flashcards/FlashcardStudy';
import { AiCardGenerator } from './components/flashcards/AiCardGenerator';
import { QuizGenerator } from './components/quiz/QuizGenerator';
import { QuizRunner } from './components/quiz/QuizRunner';
import { PomodoroTimer } from './components/focus/PomodoroTimer';
import { SocraticTutor } from './components/tutor/SocraticTutor';
import { RevisionPlanner } from './components/planner/RevisionPlanner';
import { StudyStats } from './components/analytics/StudyStats';
import { Deck, Quiz } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('focus');

  // Flashcards state
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [showAiCardGen, setShowAiCardGen] = useState<boolean>(false);

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    // Reset nested sub-views when changing primary tab
    setActiveDeck(null);
    setShowAiCardGen(false);
    setActiveQuiz(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f111a] text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Sidebar Navigation */}
          <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

          {/* Right Main Stage */}
          <div className="flex-1 w-full min-w-0">
            {/* 1. PIXEL FOCUS STUDIO (Whimsical & Cute) */}
            {activeTab === 'focus' && <PomodoroTimer />}

            {/* 2. SPACED REPETITION FLASHCARDS (SM-2) */}
            {activeTab === 'flashcards' && (
              <>
                {showAiCardGen ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowAiCardGen(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                    >
                      ← Back to Deck Library
                    </button>
                    <AiCardGenerator onSuccess={() => setShowAiCardGen(false)} />
                  </div>
                ) : activeDeck ? (
                  <FlashcardStudy deck={activeDeck} onBack={() => setActiveDeck(null)} />
                ) : (
                  <DeckList
                    onSelectDeck={deck => setActiveDeck(deck)}
                    onOpenAiGenerator={() => setShowAiCardGen(true)}
                  />
                )}
              </>
            )}

            {/* 3. PRACTICE QUIZZES */}
            {activeTab === 'quiz' && (
              <>
                {activeQuiz ? (
                  <QuizRunner quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />
                ) : (
                  <QuizGenerator onStartQuiz={quiz => setActiveQuiz(quiz)} />
                )}
              </>
            )}

            {/* 4. SOCRATIC AI TUTOR */}
            {activeTab === 'tutor' && <SocraticTutor />}

            {/* 5. REVISION PLANNER */}
            {activeTab === 'planner' && <RevisionPlanner />}

            {/* 6. STUDY ANALYTICS */}
            {activeTab === 'analytics' && <StudyStats />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 font-mono">
            <span>StudyFlow OS</span>
            <span>•</span>
            <span className="text-indigo-500 font-medium">SM-2 Spaced Repetition</span>
            <span>•</span>
            <span className="text-yellow-500 font-pixel text-[10px]">Cute Pixel Studio</span>
          </div>
          <p>Production GitHub Portfolio Showcase • React, TypeScript, Tailwind, Web Audio & Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
