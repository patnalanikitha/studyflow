import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';

interface PixelShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShopTab = 'quests' | 'hats' | 'themes' | 'trinkets' | 'species';

export const PixelShopModal: React.FC<PixelShopModalProps> = ({ isOpen, onClose }) => {
  const {
    pixelPet,
    updatePixelPet,
    unlockShopItem,
    equipShopItem,
    quests,
    claimQuest,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<ShopTab>('quests');

  if (!isOpen) return null;

  const xpPercent = Math.min(
    100,
    Math.round(((pixelPet.xp || 0) / (pixelPet.xpToNextLevel || 200)) * 100)
  );

  const HATS = [
    { id: 'headphones', name: 'Lo-Fi Headphones', icon: '🎧', cost: 0, desc: 'Cozy pastel ear warmers' },
    { id: 'graduate-cap', name: 'Graduation Cap', icon: '🎓', cost: 50, desc: 'Prestigious academic cap' },
    { id: 'sprout', name: 'Lucky Sprout', icon: '🌱', cost: 75, desc: 'Fresh seedling of wisdom' },
    { id: 'strawberry-beret', name: 'Strawberry Beret', icon: '🍓', cost: 100, desc: 'Cute french berry cap' },
    { id: 'wizard-hat', name: 'Arcane Wizard Hat', icon: '🧙', cost: 120, desc: 'Imbued with exam luck' },
    { id: 'viking-helm', name: 'Viking Helm', icon: '⚔️', cost: 160, desc: 'For ruthless cramming' },
    { id: 'golden-crown', name: 'Golden Crown', icon: '👑', cost: 250, desc: 'Royalty of academics' },
  ];

  const THEMES = [
    { id: 'cozy-loft', name: 'Cozy Loft', icon: '🪵', cost: 0, desc: 'Warm wooden studio with rain window' },
    { id: 'forest-cabin', name: 'Forest Cabin', icon: '🌲', cost: 90, desc: 'Pine log retreat with fresh air' },
    { id: 'matcha-cafe', name: 'Matcha Tea House', icon: '🍵', cost: 140, desc: 'Tatami floors and zen vibes' },
    { id: 'cyberpunk-study', name: 'Cyberpunk Hub', icon: '🌆', cost: 180, desc: 'Neon cyan desk & city glow' },
    { id: 'starlight-observatory', name: 'Starlight Observatory', icon: '🌌', cost: 240, desc: 'Space telescope & constellations' },
  ];

  const TRINKETS = [
    { id: 'matcha-latte', name: 'Steamy Matcha', icon: '🍵', cost: 0, desc: 'Always fresh and warm' },
    { id: 'bonsai', name: 'Zen Bonsai Tree', icon: '🪴', cost: 70, desc: 'Centuries of calm patience' },
    { id: 'lava-lamp', name: 'Neon Lava Lamp', icon: '💡', cost: 110, desc: 'Hypnotic retro floating blobs' },
    { id: 'golden-trophy', name: 'Honors Cup', icon: '🏆', cost: 200, desc: 'A testament to your dedication' },
  ];

  const SPECIES = [
    { id: 'cat', name: 'Mochi', species: 'Cat', icon: '🐱', desc: 'Curious and diligent typist' },
    { id: 'bear', name: 'Barnaby', species: 'Bear', icon: '🐻', desc: 'Calm, patient, and cozy' },
    { id: 'bunny', name: 'Pip', species: 'Bunny', icon: '🐰', desc: 'Bouncy and eager to learn' },
    { id: 'frog', name: 'Kero', species: 'Frog', icon: '🐸', desc: 'Philosophical green buddy' },
    { id: 'duck', name: 'Duckie', species: 'Duck', icon: '🦆', desc: 'Always ready to debug code' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl max-w-2xl w-full p-6 shadow-pixel max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h3 className="font-pixel text-sm text-yellow-300 flex items-center gap-2">
                PIXEL EMPORIUM & QUESTS
              </h3>
              <p className="text-xs text-purple-300 font-pixel-alt text-base mt-0.5">
                Earn XP, level up your pet, and customize your study realm!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white font-pixel text-xs"
          >
            [X]
          </button>
        </div>

        {/* Level & XP Banner */}
        <div className="my-4 p-4 bg-slate-950 rounded-2xl border-2 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-pixel text-xs text-pink-400">
              <span>⭐ LEVEL {pixelPet.level}</span>
              <span className="text-slate-400 text-[10px] font-sans">({pixelPet.species})</span>
            </div>
            <div className="flex items-center gap-2 font-pixel text-xs text-yellow-300">
              <span>🪙 {pixelPet.coins} COINS</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Experience: {pixelPet.xp} / {pixelPet.xpToNextLevel} XP</span>
              <span className="text-yellow-400">{xpPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 transition-all duration-500 rounded-full"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {(
            [
              { id: 'quests', label: '🎯 Quests & XP' },
              { id: 'hats', label: '👒 Hats' },
              { id: 'themes', label: '🏰 Themes' },
              { id: 'trinkets', label: '☕ Desk Decor' },
              { id: 'species', label: '🐾 Companion' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-pixel whitespace-nowrap transition-all border ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold shadow-pixel-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* 1. DAILY QUESTS */}
          {activeTab === 'quests' && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-900/60 text-xs text-purple-200 flex items-center justify-between">
                <span>Complete daily study drills to earn massive XP and coins!</span>
                <span className="font-pixel text-[10px] text-yellow-300">DAILY REFRESH</span>
              </div>

              {quests.map(q => {
                const isReady = q.current >= q.target && !q.claimed;
                const progressPct = Math.min(100, Math.round((q.current / q.target) * 100));

                return (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-yellow-300">{q.title}</span>
                        <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                          +{q.rewardCoins} 🪙 | +{q.rewardXp} XP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{q.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-36 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {q.current} / {q.target}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!isReady || q.claimed}
                      onClick={() => claimQuest(q.id)}
                      className={`px-4 py-2 rounded-xl font-pixel text-xs border transition-all shrink-0 ${
                        q.claimed
                          ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60'
                          : isReady
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 shadow-pixel-sm animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700 opacity-50'
                      }`}
                    >
                      {q.claimed ? 'CLAIMED ✓' : isReady ? 'CLAIM REWARD!' : 'IN PROGRESS'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. HATS SHOP */}
          {activeTab === 'hats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HATS.map(hat => {
                const isUnlocked = (pixelPet.unlockedHats || []).includes(hat.id as any) || hat.cost === 0;
                const isEquipped = pixelPet.equippedHat === hat.id;

                return (
                  <div
                    key={hat.id}
                    className="p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                        {hat.icon}
                      </span>
                      <div>
                        <h4 className="font-pixel text-xs text-white">{hat.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{hat.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isEquipped) {
                          equipShopItem('hat', 'none');
                        } else if (isUnlocked) {
                          equipShopItem('hat', hat.id);
                        } else {
                          const ok = unlockShopItem('hat', hat.id, hat.cost);
                          if (!ok) alert('Not enough coins! Complete more Pomodoros or review flashcards!');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-pixel-sm transition-all shrink-0 ${
                        isEquipped
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : isUnlocked
                          ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-300'
                      }`}
                    >
                      {isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : `🪙 ${hat.cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. ROOM THEMES */}
          {activeTab === 'themes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map(theme => {
                const isUnlocked = (pixelPet.unlockedThemes || []).includes(theme.id as any) || theme.cost === 0;
                const isEquipped = pixelPet.currentRoomTheme === theme.id;

                return (
                  <div
                    key={theme.id}
                    className="p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                        {theme.icon}
                      </span>
                      <div>
                        <h4 className="font-pixel text-xs text-white">{theme.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{theme.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isEquipped) return;
                        if (isUnlocked) {
                          equipShopItem('theme', theme.id);
                        } else {
                          const ok = unlockShopItem('theme', theme.id, theme.cost);
                          if (!ok) alert('Not enough coins! Complete more Pomodoros or review flashcards!');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-pixel-sm transition-all shrink-0 ${
                        isEquipped
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : isUnlocked
                          ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-300'
                      }`}
                    >
                      {isEquipped ? 'ACTIVE' : isUnlocked ? 'SET THEME' : `🪙 ${theme.cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. DESK DECOR */}
          {activeTab === 'trinkets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRINKETS.map(trinket => {
                const isUnlocked = (pixelPet.unlockedTrinkets || []).includes(trinket.id as any) || trinket.cost === 0;
                const isEquipped = pixelPet.deskTrinket === trinket.id;

                return (
                  <div
                    key={trinket.id}
                    className="p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                        {trinket.icon}
                      </span>
                      <div>
                        <h4 className="font-pixel text-xs text-white">{trinket.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{trinket.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isEquipped) {
                          equipShopItem('trinket', 'none');
                        } else if (isUnlocked) {
                          equipShopItem('trinket', trinket.id);
                        } else {
                          const ok = unlockShopItem('trinket', trinket.id, trinket.cost);
                          if (!ok) alert('Not enough coins! Complete more Pomodoros or review flashcards!');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-pixel-sm transition-all shrink-0 ${
                        isEquipped
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : isUnlocked
                          ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-300'
                      }`}
                    >
                      {isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : `🪙 ${trinket.cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. SPECIES */}
          {activeTab === 'species' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPECIES.map(sp => {
                const isCurrent = pixelPet.species === sp.id;
                return (
                  <div
                    key={sp.id}
                    className="p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                        {sp.icon}
                      </span>
                      <div>
                        <h4 className="font-pixel text-xs text-white">
                          {sp.name} <span className="text-purple-300 text-[10px]">({sp.species})</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sp.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => updatePixelPet({ species: sp.id as any, name: sp.name })}
                      className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] border shadow-pixel-sm transition-all shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 border-yellow-300'
                      }`}
                    >
                      {isCurrent ? 'ACTIVE' : 'SELECT'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How to Earn Points info footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
          <span>✨ Review card: +15 XP / +10 🪙</span>
          <span>🎯 Pomodoro: +75 XP / +40 🪙</span>
          <span>🏆 Quiz: +60 XP / +30 🪙</span>
        </div>
      </div>
    </div>
  );
};
