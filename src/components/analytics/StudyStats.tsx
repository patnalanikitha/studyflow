import React from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Flame,
  Clock,
  Brain,
  Download,
  Calendar,
} from 'lucide-react';

export const StudyStats: React.FC = () => {
  const { decks, quizzes, activity, pixelPet } = useStudy();

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const totalMastered = decks.reduce(
    (acc, d) => acc + d.cards.filter(c => c.repetitions >= 3).length,
    0
  );
  const masteryPercentage = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  const totalMinutesStudied = activity.reduce((acc, a) => acc + a.minutes, 0);
  const totalPomodoros = activity.reduce((acc, a) => acc + a.pomodorosCompleted, 0);

  // Calculate current study streak
  let currentStreak = 0;
  const sortedActivity = [...activity].sort((a, b) => b.date.localeCompare(a.date));
  for (const day of sortedActivity) {
    if (day.minutes > 0 || day.cardsReviewed > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Export full user study profile as JSON
  const exportAllData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      decks,
      quizzes,
      activity,
      pixelPet,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `studyflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Streak
            </span>
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {currentStreak} <span className="text-sm font-medium text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-500">Consecutive active study days</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Focus Time
            </span>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {(totalMinutesStudied / 60).toFixed(1)}{' '}
            <span className="text-sm font-medium text-slate-400">hrs</span>
          </div>
          <p className="text-[11px] text-slate-500">{totalPomodoros} Pomodoro blocks logged</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Retention Rate
            </span>
            <Brain className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {masteryPercentage}%
          </div>
          <p className="text-[11px] text-slate-500">
            {totalMastered} of {totalCards} cards in long-term memory
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-yellow-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pixel Companion
            </span>
            <span className="text-lg">⭐</span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            Lvl {pixelPet.level}
          </div>
          <p className="text-[11px] text-slate-500">
            {pixelPet.coins} study coins earned
          </p>
        </div>
      </div>

      {/* GitHub-style Study Activity Heatmap */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Study Activity Heatmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual consistency log across past 60 days
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-900" />
              <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-x-auto">
          <div className="flex gap-1.5 min-w-[500px]">
            {activity.slice(-56).map((day, idx) => {
              let colorClass = 'bg-slate-200 dark:bg-slate-800';
              if (day.minutes > 60 || day.cardsReviewed > 25) {
                colorClass = 'bg-emerald-500';
              } else if (day.minutes > 30 || day.cardsReviewed > 10) {
                colorClass = 'bg-emerald-400 dark:bg-emerald-600';
              } else if (day.minutes > 0 || day.cardsReviewed > 0) {
                colorClass = 'bg-emerald-300 dark:bg-emerald-800';
              }

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${day.minutes} mins, ${day.cardsReviewed} cards reviewed`}
                  className={`w-3.5 h-3.5 rounded-sm ${colorClass} transition-transform hover:scale-125 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Backup & Portability */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">
            Data Portability & Offline Backup
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your study data belongs to you. Export decks, review intervals, and analytics anytime.
          </p>
        </div>

        <button
          onClick={exportAllData}
          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" /> Download JSON Backup
        </button>
      </div>
    </div>
  );
};
