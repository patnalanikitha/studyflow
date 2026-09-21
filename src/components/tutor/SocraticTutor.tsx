import React, { useState, useRef, useEffect } from 'react';
import { TutorMessage } from '../../types';
import { askSocraticTutor, TutorPersona } from '../../lib/gemini';
import { extractTextFromDocument } from '../../lib/pdfParser';
import { soundEngine } from '../../lib/soundEngine';
import {
  GraduationCap,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  RefreshCw,
  FileText,
  Paperclip,
  X,
  BookOpen,
  Code2,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Explain Breadth-First Search (BFS) with code and visual trace',
  'Compare BFS vs DFS: When should I choose which?',
  'Dijkstra algorithm step-by-step with complexity',
  'Dynamic Programming intuition: Memoization vs Tabulation',
];

export const SocraticTutor: React.FC = () => {
  const [persona, setPersona] = useState<TutorPersona>('comprehensive');
  const [selectedSubject, setSelectedSubject] = useState<string>('Computer Science');

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        `Hello! I am your Academic AI Professor & Study Companion for **${selectedSubject}**.\n\nI can explain algorithms with code and visual traces, break down tough proofs, or guide you through your homework step-by-step.\n\nWhat concept or problem are we exploring today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);
  const [attachedDocText, setAttachedDocText] = useState<string | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileUpload = async (file: File) => {
    setIsParsingDoc(true);
    try {
      const doc = await extractTextFromDocument(file);
      setAttachedDocName(doc.name);
      setAttachedDocText(doc.text.slice(0, 4000));
      soundEngine.playRetroChime('coin');
    } catch (err) {
      console.error('PDF attachment error:', err);
      alert('Could not parse PDF. Please ensure file contains readable text.');
    } finally {
      setIsParsingDoc(false);
    }
  };

  const handleSend = async (contentToSend?: string) => {
    const rawText = contentToSend || input;
    if (!rawText.trim() || isLoading) return;

    let fullContent = rawText.trim();
    if (attachedDocText) {
      fullContent = `[ATTACHED DOCUMENT: ${attachedDocName}]\n${attachedDocText}\n\n[STUDENT QUERY]:\n${fullContent}`;
    }

    const displayMsg = rawText.trim();

    const userMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: displayMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: selectedSubject,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    soundEngine.playRetroChime('click');

    try {
      // Pass full context including attached document
      const historyForApi = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: fullContent },
      ];

      const reply = await askSocraticTutor(historyForApi, selectedSubject, persona);

      const assistantMsg: TutorMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
      soundEngine.playRetroChime('coin');
    } catch (err) {
      console.error('Tutor error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Fresh session initialized for **${selectedSubject}**! What shall we explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[780px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Academic AI Tutor & Explainer
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-full">
                AI POWERED
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear concept breakdowns, code implementations, and PDF understanding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Persona selector */}
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {(
              [
                { id: 'comprehensive', label: 'Detailed & Code', icon: <Code2 className="w-3.5 h-3.5" /> },
                { id: 'socratic', label: 'Socratic Hints', icon: <Lightbulb className="w-3.5 h-3.5" /> },
                { id: 'summary', label: 'Cheat Sheet', icon: <BookOpen className="w-3.5 h-3.5" /> },
              ] as const
            ).map(p => (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                  persona === p.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.icon}
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Subject selector */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="Computer Science">💻 Computer Science</option>
            <option value="Mathematics">📐 Mathematics</option>
            <option value="Biology & Medicine">🧬 Biology</option>
            <option value="Physics">⚡ Physics</option>
            <option value="Economics">📈 Economics</option>
          </select>

          <button
            onClick={handleClear}
            title="Reset Conversation"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Attached Document Banner */}
      {attachedDocName && (
        <div className="px-5 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Document attached: <strong>{attachedDocName}</strong> (Tutor will ground answers in this PDF)</span>
          </div>
          <button
            onClick={() => {
              setAttachedDocName(null);
              setAttachedDocText(null);
            }}
            className="text-slate-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none font-sans'
              }`}
            >
              {msg.content}
              <div
                className={`text-[10px] mt-2 font-mono ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl rounded-tl-none border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
              Tutor is formulating a detailed explanation...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      {messages.length <= 2 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> QUICK PROMPTS:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-lg text-slate-700 dark:text-slate-300 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Form */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* File Upload Trigger */}
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
            title="Attach PDF or Notes"
            disabled={isParsingDoc}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={attachedDocName ? `Ask anything about ${attachedDocName}...` : "Ask a concept or problem (e.g. Tell me BFS, Explain recursion)..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
