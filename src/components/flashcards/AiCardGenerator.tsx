import React, { useState, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { generateFlashcardsFromNotes } from '../../lib/gemini';
import { extractTextFromDocument } from '../../lib/pdfParser';
import {
  Sparkles,
  Loader2,
  Plus,
  Check,
  FileText,
  Upload,
  FileUp,
  X,
} from 'lucide-react';

interface AiCardGeneratorProps {
  deckId?: string;
  onSuccess?: () => void;
}

export const AiCardGenerator: React.FC<AiCardGeneratorProps> = ({ deckId, onSuccess }) => {
  const { decks, addCardsToDeck, addDeck } = useStudy();

  const [notes, setNotes] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(5);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(deckId || (decks[0]?.id ?? ''));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [uploadedDocPages, setUploadedDocPages] = useState<number | null>(null);

  const [generatedCards, setGeneratedCards] = useState<
    { front: string; back: string; tags: string[] }[]
  >([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsExtractingPdf(true);
    try {
      const result = await extractTextFromDocument(file);
      setNotes(result.text);
      setUploadedDocName(result.name);
      setUploadedDocPages(result.numPages);
    } catch (err) {
      console.error('Failed to parse document:', err);
      alert('Could not parse PDF. Please ensure the file contains readable text.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleClearDoc = () => {
    setUploadedDocName(null);
    setUploadedDocPages(null);
    setNotes('');
  };

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
        title: uploadedDocName ? `Deck: ${uploadedDocName.replace(/\.[^/.]+$/, '')}` : 'New Study Deck',
        description: 'Flashcards synthesized from uploaded notes/PDF',
        subject: 'General',
        icon: '📄',
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              PDF & Notes Flashcard Synthesizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload textbook PDFs, lecture handouts, or paste notes to generate active recall cards.
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtractingPdf}
          className="px-4 py-2.5 bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          {isExtractingPdf ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              Parsing PDF...
            </>
          ) : (
            <>
              <FileUp className="w-4 h-4" />
              Upload PDF / Document
            </>
          )}
        </button>
      </div>

      {/* PDF Drag & Drop Banner if no doc uploaded */}
      {!uploadedDocName && !notes && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 text-center cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Click to upload or drag and drop a PDF file
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supports PDF lecture slides, syllabus outlines, and markdown notes
          </p>
        </div>
      )}

      {/* Uploaded Doc Indicator */}
      {uploadedDocName && (
        <div className="flex items-center justify-between p-3.5 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 rounded-2xl">
          <div className="flex items-center gap-2.5 text-xs text-purple-900 dark:text-purple-200 font-medium">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-bold truncate max-w-xs">{uploadedDocName}</span>
            {uploadedDocPages && (
              <span className="text-[10px] bg-purple-200/60 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">
                {uploadedDocPages} Page{uploadedDocPages !== 1 ? 's' : ''} Extracted
              </span>
            )}
          </div>
          <button
            onClick={handleClearDoc}
            title="Remove file"
            className="p-1 text-slate-400 hover:text-red-500 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            EXTRACTED TEXT CONTENT:
          </label>
          <textarea
            rows={5}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Paste your lecture notes, textbook excerpt, or upload a PDF above..."
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              TARGET STUDY DECK:
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
              CARDS TO SYNTHESIZE:
            </label>
            <div className="flex gap-2">
              {[3, 5, 8, 12].map(num => (
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
                  {num}
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
              Synthesize Flashcards
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
