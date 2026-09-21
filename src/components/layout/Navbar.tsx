import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ApiKeyModal } from './ApiKeyModal';
import { Moon, Sun, Key, Github } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isDarkMode, toggleDarkMode, pixelPet, apiKey } = useStudy();
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-xl shadow-md shadow-indigo-500/20">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  StudyFlow
                </h1>
                <span className="text-[10px] font-bold font-pixel px-1.5 py-0.5 bg-yellow-400 text-slate-950 rounded">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                AI Academic Companion & Pixel Studio
              </p>
            </div>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-2.5">
            {/* Pixel Pet Currency Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full text-xs font-pixel border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <span className="text-sm">🪙</span>
              <span className="text-yellow-500 dark:text-yellow-400 font-bold">{pixelPet.coins}</span>
              <span className="text-slate-400 text-[10px]">COINS</span>
            </div>

            {/* API Key Modal Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                apiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{apiKey ? 'Gemini Active' : 'Gemini Key'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              title="Toggle Theme"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* GitHub Project Link */}
            <a
              href="https://github.com/patnalanikitha/studyflow"
              target="_blank"
              rel="noreferrer"
              title="View on GitHub"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <ApiKeyModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} />
    </>
  );
};
