import { useState, useCallback } from 'react';
import { useIntentContext } from '../contexts/IntentContext';

const LEVEL_CONFIG = {
  easy:   { label: 'Easy',   color: 'emerald', icon: '🟢' },
  medium: { label: 'Medium', color: 'amber',   icon: '🟡' },
  hard:   { label: 'Hard',   color: 'rose',    icon: '🔴' },
};

const COUNTS = { easy: 3, medium: 3, hard: 2 };

// Performance analysis based on score %
function getAnalysis(pct, byLevel) {
  const lines = [];
  if (pct === 100) lines.push('🎉 Perfect score! Outstanding mastery of this topic.');
  else if (pct >= 80) lines.push('✅ Excellent performance! You have a strong grasp of this topic.');
  else if (pct >= 60) lines.push("👍 Good effort! You understand the core concepts but there's room to improve.");
  else if (pct >= 40) lines.push('⚠️ Fair attempt. Review the fundamentals and try again.');
  else lines.push('📖 Keep practicing! Focus on building foundational knowledge first.');

  // Level-specific feedback
  const easy = byLevel.easy;
  const med  = byLevel.medium;
  const hard = byLevel.hard;

  if (easy && easy.correct < easy.total) lines.push(`• Easy questions: ${easy.correct}/${easy.total} — revisit basic definitions.`);
  if (med  && med.correct  < med.total)  lines.push(`• Medium questions: ${med.correct}/${med.total} — practice applying concepts.`);
  if (hard && hard.correct < hard.total && hard.total > 0) lines.push(`• Hard questions: ${hard.correct}/${hard.total} — challenge yourself with deeper analysis.`);

  return lines;
}

export default function QuestionsPanel() {
  const { workspace } = useIntentContext();
  const topic = workspace?.topic || '';

  const [questions, setQuestions]   = useState([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError]     = useState('');
  const [activeTab, setActiveTab]   = useState('all');
  const [answers, setAnswers]       = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  // Generate fresh questions from Groq
  const handleGenerate = useCallback(async () => {
    if (!topic) { setGenError('Please set a workspace topic first.'); return; }
    setGenerating(true);
    setGenError('');
    setAnswers({});
    setSubmitted(false);
    setShowExplanations(false);
    setActiveTab('all');

    try {
      const res = await fetch('/api/mcq/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, counts: COUNTS }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Generation failed.');
      setQuestions(data.questions);
    } catch (err) {
      setGenError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [topic]);

  const handleSelect = (idx, opt) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [idx]: opt }));
  };

  const handleSubmit = () => { if (questions.length) setSubmitted(true); };
  const handleReset  = () => { setAnswers({}); setSubmitted(false); setShowExplanations(false); };

  // Compute score
  const allCorrect = submitted
    ? questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
    : 0;
  const total   = questions.length;
  const pct     = total > 0 ? Math.round((allCorrect / total) * 100) : 0;

  // Score by level
  const byLevel = ['easy', 'medium', 'hard'].reduce((acc, lvl) => {
    const qs = questions.filter(q => q.level === lvl);
    const correct = qs.reduce((s, q, i) => {
      const realIdx = questions.indexOf(q);
      return s + (answers[realIdx] === q.answer ? 1 : 0);
    }, 0);
    acc[lvl] = { total: qs.length, correct };
    return acc;
  }, {});

  const analysis = submitted ? getAnalysis(pct, byLevel) : [];

  // Filtered questions by tab
  const displayed = activeTab === 'all'
    ? questions
    : questions.filter(q => q.level === activeTab);

  const answeredCount = Object.keys(answers).length;
  const unanswered    = total - answeredCount;

  return (
    <div className="bg-slate-800 shadow-lg rounded-xl border border-slate-700 h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl bg-indigo-500/20 p-2 rounded-lg text-indigo-400">❓</span>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide leading-tight">MCQ Practice</h2>
            {topic && <p className="text-[11px] text-slate-400 mt-0.5">Topic: <span className="text-indigo-300">{topic}</span></p>}
          </div>
        </div>
        {submitted && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            pct >= 80 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : pct >= 50 ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            {allCorrect}/{total} · {pct}%
          </div>
        )}
      </div>

      {/* Generate button area */}
      {questions.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 pb-6 gap-4">
          {!topic ? (
            <p className="text-slate-400 text-sm text-center">Set a workspace topic first, then generate your quiz.</p>
          ) : (
            <>
              <div className="text-center">
                <p className="text-slate-300 font-semibold mb-1">Ready to test your knowledge?</p>
                <p className="text-slate-500 text-xs">
                  Generates {COUNTS.easy} Easy + {COUNTS.medium} Medium + {COUNTS.hard} Hard questions on <span className="text-indigo-300 font-medium">{topic}</span>
                </p>
              </div>
              {genError && <p className="text-rose-400 text-xs text-center">{genError}</p>}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generating
                  ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>)
                  : '✨ Generate Quiz'}
              </button>
            </>
          )}
        </div>
      )}

      {questions.length > 0 && (
        <>
          {/* Difficulty filter tabs */}
          <div className="flex gap-1 px-6 pb-2 flex-shrink-0">
            {['all', 'easy', 'medium', 'hard'].map(tab => {
              const cfg = LEVEL_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition border ${
                    isActive
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-slate-200'
                  }`}
                >
                  {tab === 'all' ? 'All' : `${cfg.icon} ${cfg.label}`}
                </button>
              );
            })}
            <button
              onClick={handleGenerate}
              disabled={generating}
              title="Re-generate questions"
              className="ml-auto text-[10px] text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/60 px-2 py-1 rounded-full transition disabled:opacity-40"
            >
              {generating ? '…' : '↺ Regenerate'}
            </button>
          </div>

          {/* Questions list */}
          <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-2 custom-scrollbar">
            {displayed.map((q, displayIdx) => {
              const realIdx = questions.indexOf(q);
              const selected = answers[realIdx];
              const isCorrect = submitted && selected === q.answer;
              const isWrong   = submitted && selected && selected !== q.answer;
              const cfg = LEVEL_CONFIG[q.level] || LEVEL_CONFIG.medium;

              return (
                <div
                  key={realIdx}
                  className={`bg-slate-900/60 p-4 rounded-xl border transition-colors ${
                    !submitted ? 'border-slate-700/50 hover:border-indigo-500/30'
                              : isCorrect ? 'border-emerald-600/40 bg-emerald-900/10'
                              : isWrong   ? 'border-rose-600/40 bg-rose-900/10'
                              : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                      cfg.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : cfg.color === 'amber' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="text-indigo-400 font-bold text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded flex-shrink-0">
                      Q{realIdx + 1}
                    </span>
                    <p className="text-slate-200 text-sm leading-relaxed">{q.question}</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, oi) => {
                      const isSel  = selected === opt;
                      const isAns  = submitted && q.answer === opt;
                      const isWrng = submitted && isSel && q.answer !== opt;

                      return (
                        <button
                          key={oi}
                          onClick={() => handleSelect(realIdx, opt)}
                          disabled={submitted}
                          className={`w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all ${
                            isAns  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-semibold'
                            : isWrng ? 'border-rose-500 bg-rose-500/15 text-rose-200'
                            : isSel  ? 'border-indigo-500 bg-indigo-500/20 text-white'
                            : 'border-slate-700/60 bg-slate-900/40 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/80'
                          } disabled:cursor-default`}
                        >
                          <span className="flex items-center gap-2">
                            {isAns && submitted && <span>✓</span>}
                            {isWrng && <span>✗</span>}
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (after submit) */}
                  {submitted && showExplanations && q.explanation && (
                    <div className="mt-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg px-3 py-2 text-xs text-slate-300 leading-relaxed">
                      <span className="text-indigo-400 font-semibold">💡 </span>{q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Score summary (after submit) */}
          {submitted && (
            <div className="mx-6 mb-3 bg-slate-900/70 border border-slate-700 rounded-xl p-4 flex-shrink-0">
              {/* Overall score bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-200">Overall Score</span>
                <span className={`text-lg font-extrabold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {pct}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Per-level breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['easy', 'medium', 'hard'].map(lvl => {
                  const cfg = LEVEL_CONFIG[lvl];
                  const d = byLevel[lvl];
                  if (!d || d.total === 0) return null;
                  return (
                    <div key={lvl} className={`text-center rounded-lg p-2 border ${
                      cfg.color === 'emerald' ? 'bg-emerald-900/20 border-emerald-700/30'
                      : cfg.color === 'amber' ? 'bg-amber-900/20 border-amber-700/30'
                      : 'bg-rose-900/20 border-rose-700/30'
                    }`}>
                      <p className="text-[10px] text-slate-400">{cfg.icon} {cfg.label}</p>
                      <p className={`font-bold text-sm ${cfg.color === 'emerald' ? 'text-emerald-300' : cfg.color === 'amber' ? 'text-amber-300' : 'text-rose-300'}`}>
                        {d.correct}/{d.total}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Performance analysis */}
              <div className="space-y-1">
                {analysis.map((line, i) => (
                  <p key={i} className="text-xs text-slate-400 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-4 flex items-center justify-between gap-3 flex-shrink-0 border-t border-slate-800 pt-3">
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitted || !questions.length || answeredCount === 0}
                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Submit Quiz
              </button>
              {submitted && (
                <button
                  onClick={() => setShowExplanations(s => !s)}
                  className="px-3 py-2 rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs font-semibold transition"
                >
                  {showExplanations ? 'Hide' : 'Show'} Explanations
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!submitted && answeredCount > 0 && (
                <span className="text-[10px] text-slate-500">{answeredCount}/{total} answered{unanswered > 0 ? ` · ${unanswered} left` : ''}</span>
              )}
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
