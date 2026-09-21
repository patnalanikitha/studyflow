import React, { useState, useRef, useEffect } from 'react';
import { TutorMessage } from '../../types';
import { askSocraticTutor } from '../../lib/gemini';
import { soundEngine } from '../../lib/soundEngine';
import {
  GraduationCap,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Why do we need virtual memory and paging in OS?',
  'Explain Dijkstra’s algorithm like I am 12',
  'What is the intuition behind Bayes theorem in probability?',
  'Why does ATP release energy when hydrolyzed?',
];

export const SocraticTutor: React.FC = () => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Hello! I am your Socratic AI Academic Tutor 🎓.\n\nI will not just give away the direct answer, but help you break down complex concepts, discover solutions step-by-step, and strengthen deep conceptual intuition.\n\nWhat are you studying or struggling with today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Computer Science');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (contentToSend?: string) => {
    const text = contentToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: selectedSubject,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    soundEngine.playRetroChime('click');

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await askSocraticTutor(history, selectedSubject);

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
        content: `Fresh session initialized for **${selectedSubject}**! What problem or concept shall we tackle?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[740px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Socratic AI Tutor
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full">
                ACTIVE RECALL MODE
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Guides through principles, hints, and step-by-step reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject selector */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="Computer Science">💻 Computer Science</option>
            <option value="Mathematics">📐 Mathematics</option>
            <option value="Biology & Medicine">🧬 Biology & Medicine</option>
            <option value="Physics">⚡ Physics</option>
            <option value="Economics & Finance">📈 Economics</option>
          </select>

          <button
            onClick={handleClear}
            title="Reset Chat"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
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
                  : 'bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none'
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
              Tutor is formulating Socratic guiding questions...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      {messages.length <= 2 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> TRY ASKING:
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
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
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question or explain what you are stuck on..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
