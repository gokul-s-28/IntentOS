import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import AIChatAssistant from '../components/AIChatAssistant';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

/* ── Palette ─────────────────────────────────────────────────────────── */
const COLORS = {
  indigo:  '#6366f1',
  purple:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  sky:     '#0ea5e9',
};

const PIE_COLORS = [COLORS.indigo, '#e2e8f0'];

/* ── Tooltip styles ─────────────────────────────────────────────────── */
const tooltipStyle = {
  contentStyle: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    fontSize: 12,
    color: '#e2e8f0',
  },
  labelStyle: { color: '#94a3b8', fontWeight: 600, marginBottom: 4 },
};

/* ── Summary card ───────────────────────────────────────────────────── */
function SummaryCard({ icon, value, label, color, trend }) {
  const gradients = {
    indigo:  'from-indigo-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber:   'from-amber-400 to-orange-500',
    sky:     'from-sky-500 to-cyan-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 border border-slate-100 p-5 flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-extrabold text-slate-800 leading-tight">{value}</p>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
          {trend >= 0 ? `↑ ${trend}%` : `↓ ${Math.abs(trend)}%`}
        </span>
      )}
    </div>
  );
}

/* ── Chart card wrapper ─────────────────────────────────────────────── */
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Custom pie label ──────────────────────────────────────────────── */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

/* ── Main Page ──────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const [records,  setRecords]  = useState([]);
  const [summary,  setSummary]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setRecords(d.records);
          setSummary(d.summary);
        } else throw new Error(d.message);
      })
      .catch(e => setError(e.message || 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Derived chart data ─────────────────────────────────────────── */
  const quizData   = records.map((r, i) => ({ name: `S${i + 1}`, Score: r.score, date: r.date }));
  const videoData  = records.map(r => ({ name: r.date?.slice(5), Videos: r.videosWatched }));
  const focusData  = records.map((r, i) => ({ name: `S${i + 1}`, 'Focus (min)': r.focusTime }));
  const aiData     = records.map((r, i) => ({ name: `S${i + 1}`, 'AI Questions': r.aiQuestions }));

  const avgProgress = records.length
    ? Math.round(records.reduce((s, r) => s + r.plannerProgress, 0) / records.length)
    : 0;
  const pieData = [
    { name: 'Completed', value: avgProgress },
    { name: 'Remaining', value: 100 - avgProgress },
  ];

  return (
    <Layout>
      <div className="page-enter" style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            User Performance Analytics
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Track your study sessions, quiz scores, focus time, and AI interactions.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-600">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500">Loading analytics…</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Summary Cards ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                icon="❓" color="indigo"
                value={summary.totalQuestionsAttempted ?? 0}
                label="Questions Attempted"
                trend={12}
              />
              <SummaryCard
                icon="⭐" color="amber"
                value={`${summary.averageScore ?? 0} / 10`}
                label="Average Score"
                trend={8}
              />
              <SummaryCard
                icon="🎬" color="emerald"
                value={summary.videosWatched ?? 0}
                label="Videos Watched"
                trend={5}
              />
              <SummaryCard
                icon="⏱️" color="sky"
                value={`${summary.totalFocusTime ?? 0} min`}
                label="Total Focus Time"
                trend={15}
              />
            </section>

            {/* ── Charts Grid ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 1. Quiz Performance — Bar Chart */}
              <ChartCard
                title="Quiz Performance"
                subtitle="Score per study session (out of 10)"
              >
                <ResponsiveContainer width="100%" height={240} minWidth={1}>
                  <BarChart data={quizData} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="Score" fill={COLORS.indigo} radius={[6, 6, 0, 0]}>
                      {quizData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? COLORS.indigo : COLORS.purple} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 2. Videos Watched — Line Chart */}
              <ChartCard
                title="Video Learning Activity"
                subtitle="Videos watched per day"
              >
                <ResponsiveContainer width="100%" height={240} minWidth={1}>
                  <LineChart data={videoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip {...tooltipStyle} />
                    <Line
                      type="monotone" dataKey="Videos"
                      stroke={COLORS.emerald} strokeWidth={2.5}
                      dot={{ r: 4, fill: COLORS.emerald, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 3. Study Plan Progress — Pie Chart */}
              <ChartCard
                title="Study Plan Progress"
                subtitle={`Average completion: ${avgProgress}%`}
              >
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={220} minWidth={1}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        labelLine={false}
                        label={renderPieLabel}
                        strokeWidth={0}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={v => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[0] }} />
                      <span className="text-sm text-slate-600">Completed <strong className="text-slate-800">{avgProgress}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-200" />
                      <span className="text-sm text-slate-600">Remaining <strong className="text-slate-800">{100 - avgProgress}%</strong></span>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      Based on {records.length} sessions
                    </div>
                  </div>
                </div>
              </ChartCard>

              {/* 4. Focus Mode Usage — Area Chart */}
              <ChartCard
                title="Focus Mode Usage"
                subtitle="Minutes in focused study per session"
              >
                <ResponsiveContainer width="100%" height={240} minWidth={1}>
                  <AreaChart data={focusData}>
                    <defs>
                      <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS.sky} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.sky} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip {...tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="Focus (min)"
                      stroke={COLORS.sky}
                      strokeWidth={2.5}
                      fill="url(#focusGrad)"
                      dot={{ r: 4, fill: COLORS.sky, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* 5. AI Companion Usage — Bar Chart (full width) */}
              <ChartCard
                title="AI Companion Usage"
                subtitle="Number of questions asked per session"
              >
                <ResponsiveContainer width="100%" height={240} minWidth={1}>
                  <BarChart data={aiData} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="AI Questions" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* All-in-one Overview — Multi-line */}
              <ChartCard
                title="Session Overview"
                subtitle="Score · Focus · AI Questions across all sessions"
              >
                <ResponsiveContainer width="100%" height={240} minWidth={1}>
                  <LineChart data={records.map((r, i) => ({
                    name:    `S${i + 1}`,
                    Score:   r.score,
                    'Focus': Math.round(r.focusTime / 10),
                    AI:      r.aiQuestions,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="Score"  stroke={COLORS.indigo}  strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Focus"  stroke={COLORS.sky}     strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                    <Line type="monotone" dataKey="AI"     stroke={COLORS.amber}   strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

            </section>

        {/* Footer note */}
            <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 32 }}>
              Data refreshed on load · {records.length} sessions tracked ·{' '}
              <span style={{ color: '#3B82F6' }}>IntentOS Analytics</span>
            </p>
          </>
        )}
      </div>
      <AIChatAssistant />
    </Layout>
  );
}
