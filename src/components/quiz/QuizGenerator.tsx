import React, { useState, useRef } from 'react';
import { Quiz } from '../../types';
import { useStudy } from '../../context/StudyContext';
import { generateQuizFromTopic } from '../../lib/gemini';
import { extractTextFromDocument } from '../../lib/pdfParser';
import {
  Sparkles,
  Play,
  Award,
  Loader2,
  BookOpen,
  Clock,
  FileUp,
  FileText,
  X,
} from 'lucide-react';

interface QuizGeneratorProps {
  onStartQuiz: (quiz: Quiz) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onStartQuiz }) => {
  const { quizzes, addQuiz } = useStudy();

  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // PDF upload for Quiz
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [uploadedDocText, setUploadedDocText] = useState<string | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsParsingPdf(true);
    try {
      const doc = await extractTextFromDocument(file);
      setUploadedDocName(doc.name);
      setUploadedDocText(doc.text.slice(0, 4000));
      // Pre-fill topic with document name
      if (!topic) {
        setTopic(doc.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err) {
      console.error('PDF error:', err);
      alert('Could not parse PDF. Ensure it has readable text.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTopic = uploadedDocText
      ? `Material from document "${uploadedDocName}": ${uploadedDocText.slice(0, 2000)}`
      : topic.trim();

    if (!targetTopic) return;

    setIsGenerating(true);
    try {
      const generatedQuestions = await generateQuizFromTopic(targetTopic, questionCount, difficulty);

      addQuiz({
        title: uploadedDocName
          ? `Quiz: ${uploadedDocName.replace(/\.[^/.]+$/, '')}`
          : `${topic.trim()} Assessment`,
        subject: 'AI Generated',
        description: `Custom ${difficulty} difficulty practice quiz${
          uploadedDocName ? ` synthesized from ${uploadedDocName}` : ` covering ${topic.trim()}`
        }`,
        questions: generatedQuestions,
      });

      setShowAiModal(false);
      setTopic('');
      setUploadedDocName(null);
      setUploadedDocText(null);
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-purple-500" /> Practice Quizzes & Mock Exams
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test active recall under pressure with instant scoring, feedback, and coin rewards.
          </p>
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
        >
          <Sparkles className="w-4 h-4" /> AI Quiz Generator
        </button>
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map(quiz => (
          <div
            key={quiz.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/60 rounded-lg">
                  {quiz.subject}
                </span>
                {quiz.bestScore !== undefined && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Award className="w-3.5 h-3.5" /> Best: {quiz.bestScore}%
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3 line-clamp-1">
                {quiz.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {quiz.description}
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {quiz.questions.length} Questions
                </span>
                <span>Taken: {quiz.timesTaken}x</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => onStartQuiz(quiz)}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Quiz
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Quiz Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-500 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Generate Custom AI Quiz
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PDF Upload Option */}
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

            {!uploadedDocName ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsingPdf}
                className="w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-500 rounded-2xl flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
              >
                <FileUp className="w-4 h-4 text-purple-500" />
                {isParsingPdf ? 'Parsing document...' : 'Upload PDF slides or syllabus to generate quiz directly'}
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-medium truncate">
                  <FileText className="w-4 h-4 shrink-0 text-purple-500" />
                  <span className="truncate">{uploadedDocName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedDocName(null);
                    setUploadedDocText(null);
                  }}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {uploadedDocName ? 'QUIZ TOPIC / EMPHASIS:' : 'WHAT TOPIC DO YOU WANT TO BE TESTED ON?'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Algorithms (BFS/DFS), Cell Mitosis, World War II..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    DIFFICULTY:
                  </label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    <option value="easy">Easy (Fundamentals)</option>
                    <option value="medium">Medium (Analytical)</option>
                    <option value="hard">Hard (Advanced / Edge Cases)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    QUESTIONS:
                  </label>
                  <div className="flex gap-2">
                    {[3, 4, 6].map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`flex-1 py-2 text-xs font-medium rounded-xl border ${
                          questionCount === count
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGenerating || (!topic.trim() && !uploadedDocText)}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Create Quiz
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
