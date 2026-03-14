import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { IntentProvider, useIntentContext } from './contexts/IntentContext';

// Pages
import AuthPage        from './pages/AuthPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import ProfilePage     from './pages/ProfilePage';
import QuestionsPage   from './pages/QuestionsPage';
import VideosPage      from './pages/VideosPage';
import NotesPage       from './pages/NotesPage';
import PlannerPage     from './pages/PlannerPage';
import ProductivityPage from './pages/ProductivityPage';

// Components
import Dashboard       from './components/Dashboard';
import Layout          from './components/Layout';

/* ── Route Guards ─────────────────────────────────────────── */
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── Loading overlay ──────────────────────────────────────── */
function LoadingOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,23,42,0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{
        width: 48, height: 48, border: '3px solid rgba(59,130,246,0.3)',
        borderTopColor: '#3B82F6', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#94A3B8', fontSize: 15, fontWeight: 500 }}>
        Generating your workspace…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Home / Input page ────────────────────────────────────── */
function HomePage() {
  const { submitIntent, loading, error } = useIntentContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery]       = useState('');
  const [inputError, setInputError] = useState('');

  const SUGGESTIONS = [
    'Learn React basics',
    'Prepare SQL interview',
    'Study Data Analyst roadmap',
    'Learn Machine Learning fundamentals',
    'Prepare React interview for 2 hours',
    'System design interview prep',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) { setInputError('Please enter a topic.'); return; }
    setInputError('');
    const res = await submitIntent(query.trim());
    if (res.success) navigate('/dashboard');
  };

  return (
    <Layout showNav={false}>
      {loading && <LoadingOverlay />}

      {/* Minimal top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #6366f1)',
            boxShadow: '0 0 16px rgba(59,130,246,0.4)',
          }} />
          <span style={{ color: '#F8FAFC', fontWeight: 800, fontSize: 17 }}>IntentOS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <span style={{ color: '#94A3B8', fontSize: 13 }}>👤 {user.name || user.email}</span>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              color: '#3B82F6', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid #1E293B', background: 'transparent',
              color: '#94A3B8', fontSize: 13, cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main hero */}
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 40px',
      }}>
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%', top: '10%', left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />

        <div className="page-enter" style={{ width: '100%', maxWidth: 680, textAlign: 'center' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ fontSize: 10, color: '#3B82F6' }}>✦</span>
            <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>AI-Powered Study Workspace</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #F8FAFC 30%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            lineHeight: 1.15, marginBottom: 16,
          }}>
            What do you want to study today?
          </h1>
          <p style={{ color: '#64748B', fontSize: 16, marginBottom: 36 }}>
            Enter your goal and IntentOS builds a complete learning workspace in seconds.
          </p>

          {/* Input + button */}
          <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex', gap: 10, flexWrap: 'wrap',
              background: '#1E293B',
              border: `1px solid ${inputError || error ? 'rgba(244,63,94,0.4)' : '#334155'}`,
              borderRadius: 14, padding: 6,
            }}>
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setInputError(''); }}
                placeholder="Prepare React interview for 2 hours…"
                style={{
                  flex: 1, minWidth: 200,
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#F8FAFC', fontSize: 15, padding: '10px 14px',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? 'Building…' : 'Generate Workspace →'}
              </button>
            </div>
            {(inputError || error) && (
              <p style={{ color: '#f87171', fontSize: 13, marginTop: 8, textAlign: 'left' }}>
                ⚠️ {inputError || error}
              </p>
            )}
          </form>

          {/* Suggestion pills */}
          <div>
            <p style={{ color: '#475569', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Try these
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  style={{
                    padding: '7px 16px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid #1E293B',
                    color: '#64748B', fontSize: 13, cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                    e.currentTarget.style.color = '#93C5FD';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1E293B';
                    e.currentTarget.style.color = '#64748B';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 48 }}>
            {['🎬 Videos', '❓ MCQs', '📓 Notes', '📋 Planner', '⚡ Productivity', '🤖 AI Guide'].map(f => (
              <span key={f} style={{
                padding: '5px 14px', borderRadius: 99,
                border: '1px solid #1E293B', color: '#475569', fontSize: 13,
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── Routes ────────────────────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
      <Route path="/auth"  element={<Navigate to="/login" replace />} />

      {/* Protected */}
      <Route path="/"            element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/questions"   element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
      <Route path="/videos"      element={<ProtectedRoute><VideosPage /></ProtectedRoute>} />
      <Route path="/notes"       element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
      <Route path="/planner"     element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
      <Route path="/analytics"   element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/productivity" element={<ProtectedRoute><ProductivityPage /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <IntentProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </Router>
      </IntentProvider>
    </AuthProvider>
  );
}
