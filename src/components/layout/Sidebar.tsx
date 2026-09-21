import React from 'react';
import {
  Layers,
  Sparkles,
  GraduationCap,
  Calendar,
  BarChart3,
} from 'lucide-react';

export type NavTab = 'focus' | 'flashcards' | 'quiz' | 'tutor' | 'planner' | 'analytics';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'focus',
      label: 'Pixel Focus Studio',
      icon: <span className="text-lg">👾</span>,
      badge: 'CUTE',
    },
    {
      id: 'flashcards',
      label: 'Spaced Decks (SM-2)',
      icon: <Layers className="w-5 h-5 text-indigo-500" />,
    },
    {
      id: 'quiz',
      label: 'Practice Quizzes',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 'tutor',
      label: 'Socratic AI Tutor',
      icon: <GraduationCap className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: 'planner',
      label: 'Revision Planner',
      icon: <Calendar className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'analytics',
      label: 'Study Heatmap & Stats',
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-2">
      <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 md:shrink ${
                isActive
                  ? item.id === 'focus'
                    ? 'bg-purple-900/60 text-yellow-300 border-2 border-yellow-400 shadow-pixel-sm'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className={item.id === 'focus' ? 'font-pixel text-xs' : ''}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className="hidden md:inline-block text-[9px] font-pixel px-1.5 py-0.5 bg-yellow-400 text-slate-950 rounded shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
