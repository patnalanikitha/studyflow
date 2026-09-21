import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { generateFlashcardsFromNotes } from '../../lib/gemini';
import { Sparkles, Loader2, Plus, Check } from 'lucide-react';

interface AiCardGeneratorProps {
  deckId?: string;
  onSuccess?: () => void;
}

export const AiCardGenerator: React.FC<AiCardGeneratorProps> = ({ deckId, onSuccess }) => {
  const { decks, addCardsToDeck, addDeck } = useStudy();

  const [notes, setNotes] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(4);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(deckId || (decks[0]?.id ?? ''));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCards, setGeneratedCards] = useState<
    { front: string; back: string; tags: string[] }[]
  >([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsGenerating(true);
    setIsSaved(false);

    try {
      const cards = await generateFlashcardsFromNotes(notes, cardCount);
      setGeneratedCards(cards);
    } catch (err) {
      console.error('Failed to generate cards:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    let targetId = selectedDeckId;

    if (!targetId && decks.length === 0) {
      targetId = addDeck({
        title: 'New AI Study Deck',
        description: 'Auto-generated flashcards from study notes',
        subject: 'General',
        icon: '📚',
        color: 'from-purple-500 to-indigo-600',
      });
    }

    if (targetId && generatedCards.length > 0) {
      addCardsToDeck(targetId, generatedCards);
      setIsSaved(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1200);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            AI Note-to-Flashcards Synthesizer
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste textbook passages, bullet points, or lecture transcripts to generate SM-2 ready cards.
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            PASTE STUDY NOTES OR TEXTBOOK EXCERPT:
          </label>
          <textarea
            rows={5}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Mitochondria produce ATP via cellular respiration and oxidative phosphorylation across the inner cristae membrane..."
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              SAVE INTO DECK:
            </label>
            <select
              value={selectedDeckId}
              onChange={e => setSelectedDeckId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {decks.map(d => (
                <option key={d.id} value={d.id}>
                  {d.icon} {d.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              CARDS TO EXTRACT:
            </label>
            <div className="flex gap-2">
              {[3, 5, 8].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCardCount(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    cardCount === num
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {num} Cards
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !notes.trim()}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Synthesizing Active Recall Cards...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Flashcards with Gemini
            </>
          )}
        </button>
      </form>

      {/* Generated Cards Preview */}
      {generatedCards.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Generated Flashcards ({generatedCards.length})
            </h4>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`px-4 py-2 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added to Deck!
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Save All to Deck
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {generatedCards.map((c, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                    Question #{i + 1}
                  </span>
                  <div className="flex gap-1">
                    {c.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.front}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-3 border-l-2 border-purple-500/50">
                  {c.back}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
