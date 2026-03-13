import { useState, useEffect } from 'react';
import { useIntentContext } from '../contexts/IntentContext';

export default function NotesPanel() {
  const { workspace } = useIntentContext();
  const topic = workspace?.topic || '';

  const [notes, setNotes]         = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError]          = useState('');
  const [copied, setCopied]        = useState(false);

  // Auto-generate when a new workspace/topic loads
  useEffect(() => {
    if (topic) {
      generateNotes();
    } else {
      setNotes([]);
    }
  }, [topic]);

  const generateNotes = async () => {
    if (!topic) return;
    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Generation failed.');
      setNotes(data.notes);
    } catch (err) {
      setError('Failed to generate notes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const text = notes.map(n => n).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isStarred = (note) => note.startsWith('⭐');

  return (
    <div className="bg-slate-800 shadow-lg rounded-xl border border-slate-700 h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl bg-indigo-500/20 p-2 rounded-lg text-indigo-400">📓</span>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide leading-tight">Key Notes</h2>
            {topic && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Topic: <span className="text-indigo-300">{topic}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {notes.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              title="Copy notes"
              className="text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition flex items-center gap-1.5"
            >
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
            <button
              onClick={generateNotes}
              disabled={generating}
              title="Regenerate notes"
              className="text-[11px] px-2.5 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-400 hover:text-indigo-300 hover:border-indigo-400 transition disabled:opacity-40"
            >
              {generating ? '…' : '↺ Regenerate'}
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      {notes.length > 0 && (
        <div className="px-6 pb-2 flex items-center gap-3 text-[10px] text-slate-500 flex-shrink-0">
          <span className="flex items-center gap-1"><span className="text-amber-400">⭐</span> Critical concept</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" /> Key point</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">

        {/* Empty / no topic */}
        {!topic && (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 text-sm text-center">Set a workspace topic to generate AI key notes.</p>
          </div>
        )}

        {/* Loading */}
        {topic && generating && (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Generating key notes for <span className="text-indigo-300 font-medium">{topic}</span>…</p>
          </div>
        )}

        {/* Error */}
        {error && !generating && (
          <div className="mb-3 bg-rose-900/20 border border-rose-700/40 rounded-xl px-4 py-3 text-xs text-rose-300 flex items-center justify-between gap-3">
            <span>⚠️ {error}</span>
            <button onClick={generateNotes} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">Retry</button>
          </div>
        )}

        {/* Notes list */}
        {!generating && notes.length > 0 && (
          <ul className="space-y-2">
            {notes.map((note, idx) => {
              const starred = isStarred(note);
              const text = note.replace(/^[⭐•]\s*/, '');
              return (
                <li
                  key={idx}
                  className={`relative group flex items-start gap-3 rounded-xl px-4 py-3 border transition-all ${
                    starred
                      ? 'bg-amber-500/5 border-amber-500/25 hover:border-amber-400/40'
                      : 'bg-slate-900/40 border-slate-700/50 hover:border-indigo-500/30'
                  }`}
                >
                  {/* Bullet / star */}
                  <span className={`flex-shrink-0 mt-0.5 text-sm ${starred ? 'text-amber-400' : ''}`}>
                    {starred ? '⭐' : <span className="block w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />}
                  </span>

                  {/* Text */}
                  <p className={`text-sm leading-relaxed ${starred ? 'text-slate-100 font-medium' : 'text-slate-300'}`}>
                    {text}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {/* Generate button (first time, has topic but no notes generated yet) */}
        {topic && !generating && notes.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <p className="text-slate-400 text-sm text-center">
              Click below to generate AI key notes for <span className="text-indigo-300 font-medium">{topic}</span>.
            </p>
            <button
              onClick={generateNotes}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition"
            >
              ✨ Generate Key Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
