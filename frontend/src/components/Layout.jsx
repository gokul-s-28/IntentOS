import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useIdleDetection } from '../hooks/useIdleDetection';
import IdleWarningModal from './IdleWarningModal';
import AnimatedBackground from './AnimatedBackground';

/* ── Route → theme map ───────────────────────────────────── */
const ROUTE_THEME = {
  '/login':        'login',
  '/':             'input',
  '/dashboard':    'dashboard',
  '/questions':    'questions',
  '/videos':       'videos',
  '/notes':        'notes',
  '/planner':      'planner',
  '/analytics':    'analytics',
  '/productivity': 'productivity',
  '/profile':      'dashboard',
};

/* ── Compact Navbar Timer ─────────────────────────────────── */
function NavTimer({ forcePause, onTimerStateChange }) {
  const [minutes,   setMinutes]   = useState(25);
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [isActive,  setIsActive]  = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (forcePause && isActive) setIsActive(false); }, [forcePause]);
  useEffect(() => { onTimerStateChange?.(isActive); }, [isActive]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (isActive && timeLeft === 0) {
        setIsActive(false);
        try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {}); } catch {}
      }
      return;
    }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [isActive, timeLeft]);

  const toggle = () => {
    if (!isActive) {
      if (timeLeft === 0) { if (minutes <= 0) return; setTimeLeft(minutes * 60); }
      setIsActive(true);
    } else setIsActive(false);
  };
  const reset = (e) => { e.stopPropagation(); setIsActive(false); setTimeLeft(0); };

  const mm = String(Math.floor((timeLeft || minutes * 60) / 60)).padStart(2, '0');
  const ss = String((timeLeft || 0) % 60).padStart(2, '0');
  const display = timeLeft > 0 ? `${mm}:${ss}` : `${String(minutes).padStart(2,'0')}:00`;
  const timerColor = isActive ? '#10b981' : (timeLeft > 0 ? '#f59e0b' : 'rgba(255,255,255,0.45)');

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <button onClick={() => setShowSetup(s => !s)} style={{ padding: '5px 9px', borderRadius: '8px 0 0 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRight: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }} title="Set duration">⏱</button>
        <button onClick={toggle} style={{ padding: '5px 12px', background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isActive ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)'}`, borderLeft: 'none', borderRight: 'none', color: timerColor, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', transition: 'all 0.2s' }} title={isActive ? 'Pause' : 'Start'}>
          {isActive ? '⏸' : '▶'} {display}
        </button>
        <button onClick={reset} style={{ padding: '5px 8px', borderRadius: '0 8px 8px 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 11, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color='#f43f5e'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.25)'} title="Reset">✕</button>
      </div>
      {showSetup && (
        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 300, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, width: 210, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Focus duration</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {[15, 25, 30, 45, 60].map(m => (
              <button key={m} onClick={() => { setMinutes(m); setTimeLeft(0); setIsActive(false); }} style={{ padding: '4px 10px', borderRadius: 7, background: minutes === m ? '#3B82F6' : 'rgba(255,255,255,0.07)', border: `1px solid ${minutes === m ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`, color: minutes === m ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>{m}m</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input ref={inputRef} type="number" min="1" max="180" defaultValue={minutes} style={{ flex: 1, padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none' }} placeholder="Custom" />
            <button onClick={() => { const v = parseInt(inputRef.current?.value); if (v > 0) { setMinutes(v); setTimeLeft(0); setIsActive(false); } setShowSetup(false); }} style={{ padding: '6px 12px', borderRadius: 8, background: '#3B82F6', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Set</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Focus Mode Overlay ───────────────────────────────────── */
const BLOCKED_KEYWORDS = ['instagram','facebook','twitter','tiktok','snapchat','reddit','netflix','youtube','amazon','flipkart','myntra','poki','miniclip'];

function FocusOverlay({ url, onExit }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(2,6,23,0.97)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
    >
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🛡️</motion.div>
      <h2 style={{ color: '#F8FAFC', fontSize: 26, fontWeight: 800 }}>Focus Mode Active</h2>
      {url && <p style={{ color: '#64748B', fontSize: 14 }}>Blocked: <span style={{ color: '#f87171' }}>{url}</span></p>}
      <p style={{ color: '#475569', fontSize: 14, textAlign: 'center', maxWidth: 340 }}>Distracting sites are blocked. Stay focused on your study session.</p>
      <button onClick={onExit} style={{ padding: '10px 28px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Exit Focus Mode</button>
    </motion.div>
  );
}

/* ── Navbar ───────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Dashboard',    path: '/dashboard' },
  { label: 'Analytics',    path: '/analytics' },
  { label: 'Productivity', path: '/productivity' },
];

function Navbar({ focusMode, onToggleFocus, onTimerStateChange, forcePause }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(8,12,28,0.55)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 1px 40px rgba(0,0,0,0.4)',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Brand */}
        <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', boxShadow: '0 0 20px rgba(139,92,246,0.5)' }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>IntentOS</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 2 }}>
          {NAV_LINKS.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: active ? 'rgba(59,130,246,0.18)' : 'transparent', color: active ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = active ? '#60a5fa' : 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = active ? 'rgba(59,130,246,0.18)' : 'transparent'; }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <NavTimer forcePause={forcePause} onTimerStateChange={onTimerStateChange} />
          <button onClick={onToggleFocus} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.25s', whiteSpace: 'nowrap', background: focusMode ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.07)', color: focusMode ? '#fff' : 'rgba(255,255,255,0.6)', boxShadow: focusMode ? '0 0 20px rgba(16,185,129,0.4)' : 'none' }}>
            {focusMode ? '🛡 Focus ON' : '🎯 Focus'}
          </button>
          {user && (
            <button onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{user.name?.split(' ')[0] || 'Profile'}</span>
            </button>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Page transition wrapper ─────────────────────────────── */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ── Layout ───────────────────────────────────────────────── */
export default function Layout({ children, showNav = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = ROUTE_THEME[location.pathname] || 'dashboard';

  const [focusMode,   setFocusMode]   = useState(false);
  const [blockedUrl,  setBlockedUrl]  = useState(null);
  const [timerRunning,setTimerRunning]= useState(false);
  const [idleWarning, setIdleWarning] = useState(false);
  const [sessionEnded,setSessionEnded]= useState(false);
  const [forcePause,  setForcePause]  = useState(false);

  const handleIdleWarning  = useCallback(() => setIdleWarning(true), []);
  const handleSessionEnd   = useCallback(() => { setSessionEnded(true); setForcePause(true); }, []);
  const handleIdleResume   = useCallback(() => { setIdleWarning(false); setSessionEnded(false); setForcePause(false); }, []);

  useIdleDetection({ warningMs: 5*60*1000, endMs: 10*60*1000, enabled: timerRunning && !idleWarning, onWarning: handleIdleWarning, onSessionEnd: handleSessionEnd, onResume: handleIdleResume });

  const handleToggleFocus = useCallback(() => {
    setFocusMode(prev => {
      if (!prev) { try { document.documentElement.requestFullscreen().catch(()=>{}); } catch {} }
      else { try { if (document.fullscreenElement) document.exitFullscreen().catch(()=>{}); } catch {}; setBlockedUrl(null); }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!focusMode) return;
    const handler = (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (!href.startsWith('http') && !href.startsWith('//')) return;
      if (BLOCKED_KEYWORDS.some(kw => href.toLowerCase().includes(kw))) {
        e.preventDefault();
        setBlockedUrl(href);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [focusMode]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background for this page */}
      <AnimatedBackground theme={theme} />

      {showNav && (
        <Navbar
          focusMode={focusMode}
          onToggleFocus={handleToggleFocus}
          onTimerStateChange={setTimerRunning}
          forcePause={forcePause}
        />
      )}

      {/* Page content with Framer Motion transition */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: showNav ? 62 : 0 }}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Focus overlay */}
      <AnimatePresence>
        {focusMode && blockedUrl && (
          <FocusOverlay url={blockedUrl} onExit={() => { setBlockedUrl(null); setFocusMode(false); try { document.exitFullscreen().catch(()=>{}); } catch {} }} />
        )}
      </AnimatePresence>

      {/* Idle modal */}
      <IdleWarningModal show={idleWarning} sessionEnded={sessionEnded} onResume={handleIdleResume} onEndSession={() => { handleIdleResume(); navigate('/'); }} />
    </div>
  );
}
