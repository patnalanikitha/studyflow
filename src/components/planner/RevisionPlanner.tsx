import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Calendar, CheckCircle2, Circle, Plus, Trash2, Clock } from 'lucide-react';

export const RevisionPlanner: React.FC = () => {
  const { examPlans, addExamPlan, deleteExamPlan, toggleExamTopic } = useStudy();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [topicsInput, setTopicsInput] = useState<string>('');

  const calculateDaysRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !examDate) return;

    const topicLines = topicsInput
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    const topics = (topicLines.length > 0
      ? topicLines
      : ['Fundamental Concepts Review', 'Practice Exam Problems', 'Formula & Diagram Memorization']
    ).map((name, i) => ({
      id: `topic-${Date.now()}-${i}`,
      name,
      difficulty: (i % 2 === 0 ? 'hard' : 'medium') as 'easy' | 'medium' | 'hard',
      hoursEstimated: 3,
      completed: false,
    }));

    addExamPlan({
      subject: subject.trim(),
      examDate,
      priority,
      topics,
    });

    setSubject('');
    setExamDate('');
    setTopicsInput('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-500" /> Exam Revision Planner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track upcoming test deadlines, subject difficulty weights, and topic milestone completions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Exam Schedule
        </button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {examPlans.map(plan => {
          const daysLeft = calculateDaysRemaining(plan.examDate);
          const completedTopics = plan.topics.filter(t => t.completed).length;
          const progress = plan.topics.length > 0 ? (completedTopics / plan.topics.length) * 100 : 0;

          return (
            <div
              key={plan.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        plan.priority === 'high'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : plan.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {plan.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Exam: {plan.examDate}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                    {plan.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {daysLeft}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Days Left
                    </span>
                  </div>
                  <button
                    onClick={() => deleteExamPlan(plan.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>Progress: {completedTopics} of {plan.topics.length} Milestones</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Topics list */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  REVISION TOPICS:
                </span>
                {plan.topics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => toggleExamTopic(plan.id, topic.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      topic.completed
                        ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-400 line-through'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {topic.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs font-medium">{topic.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {topic.hoursEstimated}h
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          topic.difficulty === 'hard'
                            ? 'bg-red-500/15 text-red-500'
                            : topic.difficulty === 'medium'
                            ? 'bg-amber-500/15 text-amber-500'
                            : 'bg-emerald-500/15 text-emerald-500'
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Exam Revision Schedule
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  EXAM / COURSE TITLE:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Midterm"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    EXAM DATE:
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PRIORITY:
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  REVISION TOPICS (ONE PER LINE):
                </label>
                <textarea
                  rows={4}
                  placeholder="Consensus Algorithms (Raft/Paxos)&#10;RPC & Network Partitions&#10;Clock Synchronization"
                  value={topicsInput}
                  onChange={e => setTopicsInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-xs text-slate-500 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
