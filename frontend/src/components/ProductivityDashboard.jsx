import { useState, useEffect } from 'react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell,
} from 'recharts';
import { useIntentContext } from '../contexts/IntentContext';
import { useProductivityTracker } from '../hooks/useProductivityTracker';

// Score color helper
function scoreColor(score) {
  if (score >= 80) return '#10b981'; // emerald
  if (score >= 50) return '#f59e0b'; // amber
  return '#f43f5e';                  // rose
}

// Format seconds → m:ss or "Xm Ys"
function fmt(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

// Radial score gauge
function ScoreGauge({ score }) {
  const color  = scoreColor(score);
  const data   = [{ name: 'Score', value: score, fill: color }];
  const label  = score >= 80 ? 'Excellent 🚀' : score >= 60 ? 'Good 👍' : score >= 40 ? 'Fair ⚠️' : 'Needs Work 📖';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={210}
            endAngle={-30}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: '#334155' }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-1" style={{ color }}>{label}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">Productivity Score</p>
    </div>
  );
}

// Stat card
function StatCard({ icon, label, value, color = 'indigo' }) {
  const colors = {
    indigo:  'text-indigo-400  bg-indigo-500/10  border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber:   'text-amber-400   bg-amber-500/10   border-amber-500/20',
    rose:    'text-rose-400    bg-rose-500/10    border-rose-500/20',
  };
  return (
    <div className={`rounded-xl border p-3 flex items-center gap-3 ${colors[color]}`}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 leading-tight">{label}</p>
        <p className={`text-base font-bold truncate ${colors[color].split(' ')[0]}`}>{value}</p>
      </div>
    </div>
  );
}

// History bar chart
function HistoryChart({ sessions }) {
  if (!sessions.length) return null;
  const data = sessions.slice(0, 10).reverse().map((s, i) => ({
    name: `S${i + 1}`,
    Score:      s.productivityScore,
    Active:     Math.round(s.activeTime / 60),
    Idle:       Math.round(s.idleTime   / 60),
  }));
  return (
    <div>
      <p className="text-xs text-slate-400 font-semibold mb-2">Last {data.length} Sessions</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8', fontSize: 11 }}
            itemStyle={{ fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="Score" fill="#6366f1" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={scoreColor(d.Score)} />
            ))}
          </Bar>
          <Bar dataKey="Active" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Idle"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ProductivityDashboard({ distractionCount = 0 }) {
  const { workspace } = useIntentContext();
  const intent   = workspace?.topic || 'Workspace Session';

  const {
    totalTime, activeTime, idleTime,
    distractionAttempts, productivityScore,
    formatTime, saveSession, addDistraction,
  } = useProductivityTracker({ intent, enabled: !!workspace });

  const [history,     setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  // Sync external distractionCount into tracker
  useEffect(() => {
    distractionAttempts < distractionCount && addDistraction();
  }, [distractionCount]);

  // Load history
  useEffect(() => {
    fetch('/api/sessions?limit=10')
      .then(r => r.json())
      .then(d => d.success && setHistory(d.sessions))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveSession();
    setSaving(false);
    setSaved(true);
    // Refresh history
    fetch('/api/sessions?limit=10')
      .then(r => r.json())
      .then(d => d.success && setHistory(d.sessions))
      .catch(() => {});
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-slate-800 shadow-lg rounded-xl border border-slate-700 h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl bg-indigo-500/20 p-2 rounded-lg text-indigo-400">📊</span>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide leading-tight">Productivity</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Live session tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="text-[11px] px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition"
          >
            {showHistory ? '📊 Live' : '🕐 History'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved || totalTime < 10}
            className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold transition ${
              saved
                ? 'bg-emerald-600/20 border border-emerald-600/40 text-emerald-300'
                : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-40'
            }`}
          >
            {saving ? '…' : saved ? '✅ Saved' : '💾 Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        {!showHistory ? (
          <>
            {/* Score Gauge */}
            <div className="flex justify-center mb-4">
              <ScoreGauge score={productivityScore} />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <StatCard icon="⏱️" label="Total Session" value={fmt(totalTime)} color="indigo" />
              <StatCard icon="⚡" label="Active Time"   value={fmt(activeTime)} color="emerald" />
              <StatCard icon="💤" label="Idle Time"     value={fmt(idleTime)}   color="amber" />
              <StatCard icon="🚫" label="Distractions"  value={String(distractionAttempts) + ' blocked'} color="rose" />
            </div>

            {/* Score breakdown */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300 mb-1">📐 Score Breakdown</p>
              <div className="flex justify-between">
                <span>Active ratio ({fmt(activeTime)} / {fmt(totalTime || 1)})</span>
                <span className="text-emerald-400 font-semibold">
                  +{Math.round(Math.min(activeTime / Math.max(totalTime, 1), 1) * 70)} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span>Focus bonus ({Math.min(distractionAttempts, 10)}/10 distractions)</span>
                <span className="text-indigo-400 font-semibold">
                  +{Math.round((1 - Math.min(distractionAttempts, 10) / 10) * 30)} pts
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 font-semibold" style={{ color: scoreColor(productivityScore) }}>
                <span>Total Score</span>
                <span>{productivityScore} / 100</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <HistoryChart sessions={history} />
            {history.length === 0 && (
              <p className="text-slate-500 text-sm text-center mt-6">
                No sessions saved yet. Click <strong>Save</strong> to record your first session!
              </p>
            )}
            {history.length > 0 && (
              <div className="mt-4 space-y-2">
                {history.map((s, i) => (
                  <div key={s._id || i} className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-300 font-medium truncate">{s.intent}</p>
                      <p className="text-[10px] text-slate-500">{fmt(s.totalTime)} · {new Date(s.startTime).toLocaleDateString()}</p>
                    </div>
                    <span
                      className="text-sm font-bold flex-shrink-0"
                      style={{ color: scoreColor(s.productivityScore) }}
                    >
                      {s.productivityScore}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
