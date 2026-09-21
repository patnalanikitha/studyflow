import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { PixelPetCanvas } from './PixelPetCanvas';
import { PixelShopModal } from './PixelShopModal';
import { soundEngine } from '../../lib/soundEngine';
import { SoundscapeType } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ShoppingBag,
  CheckCircle2,
  Plus,
  Trash2,
  Settings,
  Sliders,
  Check,
} from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  pomodoro: number; // in minutes
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
};

const TIMER_PRESETS = [
  { name: 'Classic', pomodoro: 25, shortBreak: 5, longBreak: 15 },
  { name: 'Deep Work', pomodoro: 50, shortBreak: 10, longBreak: 25 },
  { name: 'Quick Sprint', pomodoro: 15, shortBreak: 3, longBreak: 10 },
  { name: 'Ultradian', pomodoro: 90, shortBreak: 20, longBreak: 30 },
];

export const PomodoroTimer: React.FC = () => {
  const {
    pixelPet,
    updatePixelPet,
    recordFocusSession,
    recordTaskCompleted,
  } = useStudy();

  // Load custom timer settings from localStorage
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(() => {
    try {
      const saved = localStorage.getItem('studyflow_timer_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(() => timerSettings.pomodoro * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<SoundscapeType>('none');
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Temporary state for the settings modal
  const [tempSettings, setTempSettings] = useState<TimerSettings>(timerSettings);

  // Focus Task checklist
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Revise Algorithms Flashcard deck', done: false },
    { id: '2', text: 'Draft Chapter 3 summary notes', done: true },
  ]);
  const [newTaskInput, setNewTaskInput] = useState<string>('');

  const getModeDurationSeconds = (m: TimerMode, settings: TimerSettings = timerSettings) => {
    return settings[m] * 60;
  };

  // Handle timer countdown
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'pomodoro') {
        recordFocusSession(timerSettings.pomodoro);
        setMode('shortBreak');
        setTimeLeft(timerSettings.shortBreak * 60);
        if (timerSettings.autoStartBreaks) {
          setIsRunning(true);
        }
      } else {
        soundEngine.playRetroChime('coin');
        setMode('pomodoro');
        setTimeLeft(timerSettings.pomodoro * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, timerSettings, recordFocusSession]);

  // Soundscape synchronization - plays whenever a soundscape is selected
  useEffect(() => {
    if (soundscape !== 'none' && !isMuted) {
      soundEngine.playSoundscape(soundscape);
    } else {
      soundEngine.stopSoundscape();
    }
    return () => {
      soundEngine.stopSoundscape();
    };
  }, [soundscape, isMuted]);

  useEffect(() => {
    soundEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getModeDurationSeconds(newMode));
    soundEngine.playRetroChime('click');
  };

  const toggleTimer = () => {
    soundEngine.playRetroChime('click');
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    soundEngine.playRetroChime('click');
    setIsRunning(false);
    setTimeLeft(getModeDurationSeconds(mode));
  };

  // Save custom timer settings
  const handleSaveSettings = () => {
    setTimerSettings(tempSettings);
    localStorage.setItem('studyflow_timer_settings', JSON.stringify(tempSettings));
    if (!isRunning) {
      setTimeLeft(tempSettings[mode] * 60);
    }
    setShowSettingsModal(false);
    soundEngine.playRetroChime('coin');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = getModeDurationSeconds(mode);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalTime - timeLeft) / totalTime) * 100)));

  // Generate retro pixel block bar: e.g. [■■■■□□□□]
  const totalBlocks = 12;
  const filledBlocks = Math.round((progressPercent / 100) * totalBlocks);
  const blockString = '■'.repeat(filledBlocks) + '□'.repeat(totalBlocks - filledBlocks);

  // Task actions
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks(prev => [...prev, { id: String(Date.now()), text: newTaskInput.trim(), done: false }]);
    setNewTaskInput('');
    soundEngine.playRetroChime('click');
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextDone = !t.done;
          if (nextDone) {
            recordTaskCompleted();
            soundEngine.playRetroChime('coin');
          }
          return { ...t, done: nextDone };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const petState = isRunning
    ? mode === 'pomodoro'
      ? 'studying'
      : 'break'
    : 'idle';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner: Pixel Theme header */}
      <div className="bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-slate-900 border-4 border-slate-900 dark:border-purple-950/80 rounded-2xl p-5 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👾</span>
            <div>
              <h2 className="text-xl md:text-2xl font-pixel text-yellow-300 tracking-wider">
                PIXEL FOCUS STUDIO
              </h2>
              <p className="text-xs font-pixel-alt text-purple-200 text-base mt-1">
                Study with your cozy pixel companion & procedural soundscapes!
              </p>
            </div>
          </div>

          {/* Pixel Stats & Controls */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border-2 border-slate-700 shadow-pixel-sm">
            <div className="flex items-center gap-1.5 text-yellow-400 font-pixel text-xs">
              <span>🪙</span>
              <span>{pixelPet.coins}</span>
              <span className="text-slate-400 text-[10px]">COINS</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-pink-400 font-pixel text-xs">
              <span>⭐</span>
              <span>LVL {pixelPet.level}</span>
            </div>

            <button
              onClick={() => {
                setTempSettings(timerSettings);
                setShowSettingsModal(true);
              }}
              title="Customize Timer Intervals"
              className="ml-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-lg border border-slate-600 shadow-pixel-sm transition-transform active:translate-y-0.5"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowShop(prev => !prev)}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-pixel flex items-center gap-1 border border-purple-400 shadow-pixel-sm transition-transform active:translate-y-0.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>SHOP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Pixel Pet & Room */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-900/90 dark:bg-[#1a1728] border-4 border-slate-900 rounded-2xl shadow-pixel">
          <PixelPetCanvas pet={pixelPet} state={petState} width={280} height={230} />

          <div className="mt-4 text-center">
            <div className="font-pixel text-sm text-yellow-300 flex items-center justify-center gap-2">
              <span>🐾 {pixelPet.name}</span>
              <span className="text-xs text-purple-300 font-pixel-alt text-base">
                ({pixelPet.species})
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {isRunning
                ? mode === 'pomodoro'
                  ? 'Studying intensely alongside you!'
                  : 'Resting and sipping warm tea...'
                : 'Waiting for study session to start...'}
            </p>
          </div>

          {/* Quick Pet Accessory Customizer */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 pt-3 border-t border-slate-800 w-full">
            <span className="text-[10px] font-pixel text-slate-400 w-full text-center mb-1">
              COMPANION:
            </span>
            {(['cat', 'bear', 'bunny'] as const).map(sp => (
              <button
                key={sp}
                onClick={() => updatePixelPet({ species: sp })}
                className={`px-2 py-1 text-[10px] font-pixel rounded border ${
                  pixelPet.species === sp
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {sp.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Retro Timer & Controls */}
        <div className="md:col-span-7 flex flex-col justify-between p-6 bg-slate-900/90 dark:bg-[#1a1728] border-4 border-slate-900 rounded-2xl shadow-pixel space-y-6">
          {/* Mode Switchers with dynamic customized times */}
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-3 gap-2 flex-1">
              {(
                [
                  { id: 'pomodoro', label: 'FOCUS', time: `${timerSettings.pomodoro}m`, icon: '🎯' },
                  { id: 'shortBreak', label: 'SHORT', time: `${timerSettings.shortBreak}m`, icon: '☕' },
                  { id: 'longBreak', label: 'LONG', time: `${timerSettings.longBreak}m`, icon: '🛋️' },
                ] as const
              ).map(m => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  className={`py-2 px-1 rounded-xl font-pixel text-xs border-2 transition-all flex flex-col items-center gap-1 ${
                    mode === m.id
                      ? 'bg-purple-600 text-white border-yellow-300 shadow-pixel-sm scale-102'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span>{m.label}</span>
                  <span className="text-[9px] opacity-75 font-mono">({m.time})</span>
                </button>
              ))}
            </div>

            {/* Customize button */}
            <button
              onClick={() => {
                setTempSettings(timerSettings);
                setShowSettingsModal(true);
              }}
              title="Customize Minutes"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border-2 border-slate-700 rounded-xl shadow-pixel-sm transition-all flex flex-col items-center justify-center text-[9px] font-pixel shrink-0"
            >
              <Settings className="w-4 h-4 text-yellow-400" />
              <span className="mt-1">EDIT</span>
            </button>
          </div>

          {/* Retro Pixel Clock Display */}
          <div className="text-center py-6 bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-inner relative overflow-hidden">
            {/* CRT scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none" />

            <div className="text-5xl md:text-7xl font-pixel tracking-widest text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
              {formattedTime}
            </div>

            {/* Pixel block progress bar */}
            <div className="mt-4 font-mono text-sm tracking-wider text-purple-300 font-bold">
              [{blockString}] <span className="text-xs text-yellow-300">{progressPercent}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-3 px-6 rounded-xl font-pixel text-sm flex items-center justify-center gap-2 border-2 transition-transform active:translate-y-1 shadow-pixel ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" /> PAUSE
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> START FOCUS
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-slate-700 rounded-xl shadow-pixel active:translate-y-1 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Procedural Audio Soundscapes */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-pixel text-slate-300">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-pink-400" />
                PROCEDURAL SOUNDSCAPES
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await soundEngine.resume();
                    soundEngine.playRetroChime('coin');
                  }}
                  className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-yellow-300 border border-purple-400 rounded text-[9px] font-pixel flex items-center gap-1 active:translate-y-0.5 transition-transform"
                  title="Test Retro Audio Output"
                >
                  <span>🔔 TEST CHIME</span>
                </button>
                <button
                  onClick={() => {
                    setIsMuted(prev => {
                      const next = !prev;
                      soundEngine.setMuted(next);
                      return next;
                    });
                  }}
                  className="text-slate-400 hover:text-white"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'none', label: 'Mute', icon: '🔇' },
                  { id: 'rain', label: 'Rain', icon: '🌧️' },
                  { id: 'lofi-noise', label: 'Brown Noise', icon: '☕' },
                  { id: 'cafe', label: 'Cafe Murmur', icon: '🥐' },
                  { id: 'binaural-alpha', label: '10Hz Alpha', icon: '🧠' },
                  { id: 'night-crickets', label: 'Night Crickets', icon: '🌙' },
                ] as const
              ).map(snd => (
                <button
                  key={snd.id}
                  onClick={async () => {
                    await soundEngine.resume();
                    setSoundscape(snd.id);
                    if (snd.id !== 'none') {
                      soundEngine.playRetroChime('click');
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 border transition-all ${
                    soundscape === snd.id
                      ? 'bg-pink-600 text-white border-pink-400 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>{snd.icon}</span>
                  <span className="truncate">{snd.label}</span>
                </button>
              ))}
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] font-pixel text-slate-400">VOL:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  soundEngine.setVolume(val);
                }}
                className="w-full accent-pink-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Study Tasks & Checklist */}
      <div className="p-5 bg-slate-900/90 dark:bg-[#1a1728] border-4 border-slate-900 rounded-2xl shadow-pixel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-pixel text-xs text-yellow-300 flex items-center gap-2">
            <span>📝</span> FOCUS SESSION OBJECTIVES
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {tasks.filter(t => t.done).length} / {tasks.length} Completed
          </span>
        </div>

        <form onSubmit={addTask} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a goal for this focus session (e.g. Finish 10 cards)..."
            value={newTaskInput}
            onChange={e => setNewTaskInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border-2 border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-xs rounded-xl border border-purple-400 shadow-pixel-sm active:translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        <div className="space-y-2">
          {tasks.map(t => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                t.done
                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-500 line-through'
                  : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-purple-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className={`w-5 h-5 ${t.done ? 'text-emerald-500' : 'text-slate-600'}`}
                />
                <span className="text-sm font-medium">{t.text}</span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteTask(t.id);
                }}
                className="text-slate-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CUSTOM TIMER SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-yellow-400 rounded-2xl max-w-md w-full p-6 shadow-pixel space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-pixel text-xs text-yellow-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-yellow-400" /> CUSTOMIZE TIMER INTERVALS
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-xs font-pixel text-slate-400 hover:text-white"
              >
                [X]
              </button>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[10px] font-pixel text-purple-300 block mb-2">QUICK PRESETS:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {TIMER_PRESETS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setTempSettings(prev => ({
                        ...prev,
                        pomodoro: p.pomodoro,
                        shortBreak: p.shortBreak,
                        longBreak: p.longBreak,
                      }));
                    }}
                    className="p-2 bg-slate-800 hover:bg-purple-900/60 border border-slate-700 rounded-lg text-center"
                  >
                    <div className="text-[10px] font-pixel text-white truncate">{p.name}</div>
                    <div className="text-[9px] font-mono text-yellow-400 mt-0.5">{p.pomodoro}/{p.shortBreak}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2">
              {/* Focus duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-pixel text-emerald-400">
                  <span>FOCUS DURATION:</span>
                  <span className="font-mono text-sm">{tempSettings.pomodoro} MINS</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={tempSettings.pomodoro}
                  onChange={e => setTempSettings(prev => ({ ...prev, pomodoro: parseInt(e.target.value) }))}
                  className="w-full accent-emerald-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Short break duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-pixel text-amber-400">
                  <span>SHORT BREAK:</span>
                  <span className="font-mono text-sm">{tempSettings.shortBreak} MINS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tempSettings.shortBreak}
                  onChange={e => setTempSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) }))}
                  className="w-full accent-amber-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Long break duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-pixel text-blue-400">
                  <span>LONG BREAK:</span>
                  <span className="font-mono text-sm">{tempSettings.longBreak} MINS</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={tempSettings.longBreak}
                  onChange={e => setTempSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) }))}
                  className="w-full accent-blue-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2 text-xs font-pixel text-slate-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-xs rounded-xl border border-emerald-300 shadow-pixel-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> APPLY TIMER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pixel Pet Shop & Quests Modal */}
      <PixelShopModal isOpen={showShop} onClose={() => setShowShop(false)} />
    </div>
  );
};
