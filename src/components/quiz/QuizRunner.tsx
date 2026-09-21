import React, { useState } from 'react';
import { Quiz } from '../../types';
import { useStudy } from '../../context/StudyContext';
import { soundEngine } from '../../lib/soundEngine';
import { ArrowLeft, CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react';

interface QuizRunnerProps {
  quiz: Quiz;
  onBack: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, onBack }) => {
  const { recordQuizResult } = useStudy();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const question = quiz.questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctOptionIndex;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      soundEngine.playRetroChime('coin');
    } else {
      soundEngine.playRetroChime('click');
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const finalScore = Math.round(((correctCount + (selectedOption === question.correctOptionIndex ? 1 : 0)) / quiz.questions.length) * 100);
      recordQuizResult(quiz.id, finalScore);
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = finalScore >= 70;

    return (
      <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-6">
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner ${
            passed
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-500'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-500'
          }`}
        >
          {passed ? '🏆' : '📚'}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quiz Completed!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {quiz.title}
          </p>
        </div>

        {/* Score pill */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {finalScore}%
          </span>
          <p className="text-xs text-slate-500 font-mono">
            {correctCount} of {quiz.questions.length} Questions Correct
          </p>
          <div className="pt-2 text-xs font-semibold text-yellow-500">
            +25 Study Coins Added! 🪙
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restartQuiz}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Award className="w-4 h-4" /> Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Quiz
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <div className="w-28 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all"
              style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 rounded-lg">
            {question.difficulty} DIFFICULTY
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Score: {correctCount} / {currentIndex}
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
          {question.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correctOptionIndex;

            let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200';

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium';
              } else if (isSelected) {
                btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-medium';
              } else {
                btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>

                {isAnswered && (
                  <div>
                    {isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation when answered */}
        {isAnswered && (
          <div className="p-4 bg-slate-100 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-fade-in">
            <h5 className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
              Explanation
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
          >
            {currentIndex + 1 < quiz.questions.length ? 'Next Question →' : 'View Results 🏆'}
          </button>
        )}
      </div>
    </div>
  );
};
