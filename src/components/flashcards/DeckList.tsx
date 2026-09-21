import React, { useState } from 'react';
import { Deck } from '../../types';
import { useStudy } from '../../context/StudyContext';
import { isCardDue } from '../../lib/sm2';
import {
  Layers,
  Plus,
  Play,
  Sparkles,
  Download,
  Trash2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface DeckListProps {
  onSelectDeck: (deck: Deck) => void;
  onOpenAiGenerator: (deckId?: string) => void;
}

export const DeckList: React.FC<DeckListProps> = ({ onSelectDeck, onOpenAiGenerator }) => {
  const { decks, addDeck, deleteDeck } = useStudy();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newIcon, setNewIcon] = useState<string>('📚');

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addDeck({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom study collection',
      subject: newSubject.trim() || 'General',
      icon: newIcon,
      color: 'from-indigo-500 to-purple-600',
    });

    setNewTitle('');
    setNewDesc('');
    setNewSubject('');
    setShowCreateModal(false);
  };

  const exportAnkiCSV = (deck: Deck) => {
    // Anki format: Front\tBack\tTags
    const rows = deck.cards.map(c => {
      const frontClean = `"${c.front.replace(/"/g, '""')}"`;
      const backClean = `"${c.back.replace(/"/g, '""')}"`;
      const tagsClean = `"${c.tags.join(' ')}"`;
      return `${frontClean}\t${backClean}\t${tagsClean}`;
    });

    const csvContent = 'data:text/tab-separated-values;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${deck.title.replace(/\s+/g, '_')}_anki.tsv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-500" /> Spaced Repetition Decks
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Active recall library powered by the SuperMemo SM-2 interval scheduling algorithm.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiGenerator()}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI Note Synthesizer
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Deck
          </button>
        </div>
      </div>

      {/* Grid of Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {decks.map(deck => {
          const dueCount = deck.cards.filter(c => isCardDue(c)).length;
          const masteredCount = deck.cards.filter(c => c.repetitions >= 3).length;

          return (
            <div
              key={deck.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-3xl p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    {deck.icon}
                  </span>
                  <div className="flex items-center gap-2">
                    {dueCount > 0 ? (
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {dueCount} Due
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All Done
                      </span>
                    )}
                    <button
                      onClick={() => deleteDeck(deck.id)}
                      title="Delete Deck"
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-semibold tracking-wider text-indigo-500 uppercase">
                    {deck.subject}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {deck.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{deck.cards.length} Total Cards</span>
                    <span>{masteredCount} Mastered</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{
                        width: deck.cards.length > 0 ? `${(masteredCount / deck.cards.length) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectDeck(deck)}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Study Deck
                </button>

                <button
                  onClick={() => exportAnkiCSV(deck)}
                  title="Export to Anki TSV/CSV"
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Deck</h3>

            <form onSubmit={handleCreateDeck} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ICON / EMOJI:
                </label>
                <div className="flex gap-2">
                  {['💻', '🧬', '📐', '🧠', '📜', '⚡'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewIcon(emoji)}
                      className={`text-xl p-2 rounded-xl border ${
                        newIcon === emoji
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  TITLE:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry Reactions"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SUBJECT:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  DESCRIPTION:
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the topics covered..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
