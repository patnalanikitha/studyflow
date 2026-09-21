import React, { useState, useEffect } from 'react';
import { Deck, CardReviewRating } from '../../types';
import { useStudy } from '../../context/StudyContext';
import { formatInterval, isCardDue } from '../../lib/sm2';
import { soundEngine } from '../../lib/soundEngine';
import { RotateCw, ArrowLeft, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardStudyProps {
  deck: Deck;
  onBack: () => void;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ deck, onBack }) => {
  const { reviewCard } = useStudy();

  // Filter cards: show due cards first, or all if none due
  const studyQueue = deck.cards.filter(c => isCardDue(c)).length > 0
    ? deck.cards.filter(c => isCardDue(c))
    : deck.cards;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentCard = studyQueue[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || !currentCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
      } else if (isFlipped) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(3);
        if (e.key === '3') handleRate(4);
        if (e.key === '4') handleRate(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, isCompleted, currentCard]);

  const toggleFlip = () => {
    soundEngine.playRetroChime('cardFlip');
    setIsFlipped(prev => !prev);
  };

  const handleRate = (rating: CardReviewRating) => {
    if (!currentCard) return;

    reviewCard(deck.id, currentCard.id, rating);
    setIsFlipped(false);

    if (currentIndex + 1 < studyQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      confetti({ particleCount: 70, spread: 60 });
      soundEngine.playRetroChime('levelUp');
    }
  };

  if (!currentCard || isCompleted) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-3xl">
          🎉
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Deck Review Completed!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            You reviewed {studyQueue.length} card{studyQueue.length !== 1 ? 's' : ''} in <span className="font-semibold text-indigo-500">{deck.title}</span>. Your memory intervals have been updated using SM-2.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs font-mono text-slate-500 dark:text-slate-400">
          +{(studyQueue.length * 10)} Study Coins earned for your Pixel Pet! 🪙
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Deck Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">
            Card {currentIndex + 1} of {studyQueue.length}
          </span>
          <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / studyQueue.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div
        onClick={toggleFlip}
        className="w-full h-80 cursor-pointer [perspective:1000px] select-none"
      >
        <div
          className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                PROMPT / QUESTION
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Tag className="w-3.5 h-3.5" />
                {currentCard.tags.join(', ')}
              </div>
            </div>

            <div className="text-center my-auto px-4">
              <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span>Interval: {formatInterval(currentCard.interval)}</span>
              <span className="flex items-center gap-1 text-indigo-500 font-medium">
                <RotateCw className="w-3.5 h-3.5" /> Click or press Space to flip
              </span>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full bg-slate-900 dark:bg-indigo-950 border-2 border-indigo-500/40 rounded-3xl p-8 shadow-2xl text-white flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg">
                RECALL / EXPLANATION
              </span>
              <span className="text-xs text-slate-400 font-mono">
                EF: {currentCard.easeFactor.toFixed(2)}
              </span>
            </div>

            <div className="text-center my-auto px-4 overflow-y-auto max-h-44">
              <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                {currentCard.back}
              </p>
            </div>

            <div className="text-center text-xs text-indigo-300 pt-2 border-t border-indigo-800/50">
              Rate how easily you remembered this below
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 Recall Rating Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-3 animate-fade-in">
          <button
            onClick={() => handleRate(1)}
            className="p-3 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/40 hover:border-red-500 text-red-600 dark:text-red-400 rounded-2xl flex flex-col items-center gap-1 transition-all group"
          >
            <span className="font-bold text-sm">Again</span>
            <span className="text-[11px] opacity-75 font-mono">1d reset</span>
            <span className="text-[10px] bg-red-500/20 px-1.5 rounded mt-1 opacity-70">Key [1]</span>
          </button>

          <button
            onClick={() => handleRate(3)}
            className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/40 hover:border-amber-500 text-amber-600 dark:text-amber-400 rounded-2xl flex flex-col items-center gap-1 transition-all group"
          >
            <span className="font-bold text-sm">Hard</span>
            <span className="text-[11px] opacity-75 font-mono">{formatInterval(Math.max(1, Math.round(currentCard.interval * 1.2)))}</span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 rounded mt-1 opacity-70">Key [2]</span>
          </button>

          <button
            onClick={() => handleRate(4)}
            className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/40 hover:border-blue-500 text-blue-600 dark:text-blue-400 rounded-2xl flex flex-col items-center gap-1 transition-all group"
          >
            <span className="font-bold text-sm">Good</span>
            <span className="text-[11px] opacity-75 font-mono">{formatInterval(Math.max(2, Math.round(currentCard.interval * currentCard.easeFactor)))}</span>
            <span className="text-[10px] bg-blue-500/20 px-1.5 rounded mt-1 opacity-70">Key [3]</span>
          </button>

          <button
            onClick={() => handleRate(5)}
            className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/40 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-2xl flex flex-col items-center gap-1 transition-all group"
          >
            <span className="font-bold text-sm">Easy</span>
            <span className="text-[11px] opacity-75 font-mono">{formatInterval(Math.max(4, Math.round(currentCard.interval * currentCard.easeFactor * 1.3)))}</span>
            <span className="text-[10px] bg-emerald-500/20 px-1.5 rounded mt-1 opacity-70">Key [4]</span>
          </button>
        </div>
      ) : (
        <div className="text-center p-3 text-xs text-slate-400 font-mono">
          Click the card or press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Space</kbd> to reveal answer
        </div>
      )}
    </div>
  );
};
