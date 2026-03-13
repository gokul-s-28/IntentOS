import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIntentContext } from '../contexts/IntentContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import AIChatAssistant from './AIChatAssistant';
import IdleWarningModal from './IdleWarningModal';
import { useIdleDetection } from '../hooks/useIdleDetection';
import { useCallback } from 'react';

/* ── Feature cards ─────────────────────────────────────────── */
const CARDS = [
  {
    id: 'questions', path: '/questions',
    icon: '❓', title: 'Practice Questions',
    desc: 'AI-generated MCQs across easy, medium, and hard difficulty.',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    glow: 'rgba(245,158,11,0.25)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    id: 'videos', path: '/videos',
    icon: '🎬', title: 'Study Videos',
    desc: 'Curated YouTube videos matched to your study topic.',
    gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    glow: 'rgba(99,102,241,0.25)',
    border: 'rgba(99,102,241,0.2)',
  },
  {
    id: 'notes', path: '/notes',
    icon: '📓', title: 'Smart Notes',
    desc: 'AI-structured key concept notes highlighted for recall.',
    gradient: 'linear-gradient(135deg, #14B8A6, #22C55E)',
    glow: 'rgba(20,184,166,0.25)',
    border: 'rgba(20,184,166,0.2)',
  },
  {
    id: 'planner', path: '/planner',
    icon: '📋', title: 'Study Planner',
    desc: 'Step-by-step AI study plan with time estimates.',
    gradient: 'linear-gradient(135deg, #FB923C, #FACC15)',
    glow: 'rgba(251,146,60,0.25)',
    border: 'rgba(251,146,60,0.2)',
  },
  {
    id: 'analytics', path: '/analytics',
    icon: '📊', title: 'Learning Analytics',
    desc: 'Visualise quiz scores, focus time, and AI usage.',
    gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
    glow: 'rgba(6,182,212,0.25)',
    border: 'rgba(6,182,212,0.2)',
  },
  {
    id: 'productivity', path: '/productivity',
    icon: '⚡', title: 'Productivity Score',
    desc: 'Track active time, idle time, and distraction blocks.',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    glow: 'rgba(139,92,246,0.25)',
    border: 'rgba(139,92,246,0.2)',
  },
];

/* ── Glass feature card ────────────────────────────────────── */
function FeatureCard({ card, topicSet, index }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      style={{
        background: hovered && topicSet
          ? 'rgba(255,255,255,0.10)'
          : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(14px)',
        border: `1px solid ${hovered && topicSet ? card.border.replace('0.2', '0.45') : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: '26px 24px',
        cursor: topicSet ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        transform: hovered && topicSet ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered && topicSet
          ? `0 24px 60px rgba(0,0,0,0.4), 0 0 50px ${card.glow}`
          : '0 4px 24px rgba(0,0,0,0.2)',
        opacity: topicSet ? 1 : 0.4,
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex', flexDirection: 'column', gap: 18, width: '100%',
      }}
      onClick={() => topicSet && navigate(card.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient icon */}
      <div style={{
        width: 54, height: 54, borderRadius: 15,
        background: card.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
        boxShadow: `0 8px 24px ${card.glow}`,
        transition: 'transform 0.3s',
        transform: hovered && topicSet ? 'scale(1.1) rotate(-4deg)' : 'scale(1)',
      }}>
        {card.icon}
      </div>

      {/* Text */}
      <div>
        <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 7, letterSpacing: -0.2 }}>
          {card.title}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.65 }}>
          {card.desc}
        </p>
      </div>

      {/* Open arrow */}
      {topicSet && (
        <div style={{
          marginTop: 'auto', color: 'rgba(255,255,255,0.35)',
          fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          Open <span style={{ fontSize: 14 }}>→</span>
        </div>
      )}
    </motion.button>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const { workspace, clearWorkspace } = useIntentContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const topic = workspace?.topic || '';

  const [idleWarning,  setIdleWarning]  = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [forcePause,   setForcePause]   = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);

  const handleIdleWarning  = useCallback(() => setIdleWarning(true), []);
  const handleSessionEnd   = useCallback(() => { setSessionEnded(true); setForcePause(true); }, []);
  const handleIdleResume   = useCallback(() => { setIdleWarning(false); setSessionEnded(false); setForcePause(false); }, []);

  useIdleDetection({ warningMs: 5*60*1000, endMs: 10*60*1000, enabled: timerRunning && !idleWarning, onWarning: handleIdleWarning, onSessionEnd: handleSessionEnd, onResume: handleIdleResume });

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 28px' }}>

        {/* Header */}
        <div style={{ marginBottom: 52, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {topic ? (
              <>
                <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  ✦ Current Session
                </p>
                <h1 style={{
                  fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, letterSpacing: -1,
                  background: 'linear-gradient(135deg,#fff 30%,rgba(255,255,255,0.5) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  marginBottom: 10, lineHeight: 1.1,
                }}>
                  {topic}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                  AI workspace ready · select a module below
                </p>
              </>
            ) : (
              <>
                <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>
                  Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>
                  Start a new session to unlock your AI workspace.
                </p>
              </>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {topic && (
              <div style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                🟢 Active
              </div>
            )}
            <button
              onClick={() => { clearWorkspace?.(); navigate('/'); }}
              style={{
                padding: '9px 22px', borderRadius: 10,
                background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(59,130,246,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              + New Session
            </button>
          </motion.div>
        </div>

        {/* 6-card grid — 3 per row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 48,
        }}>
          {CARDS.map((card, i) => (
            <FeatureCard key={card.id} card={card} topicSet={!!topic} index={i} />
          ))}
        </div>

        {/* No topic CTA */}
        {!topic && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{
              textAlign: 'center', padding: '44px 24px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(59,130,246,0.25)', borderRadius: 18,
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, marginBottom: 18 }}>
              No active study session. Set your study topic to unlock all features.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '11px 32px', borderRadius: 12,
                background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 6px 28px rgba(59,130,246,0.35)',
              }}
            >
              Start a Session →
            </button>
          </motion.div>
        )}
      </div>

      <IdleWarningModal show={idleWarning} sessionEnded={sessionEnded} onResume={handleIdleResume} onEndSession={() => navigate('/')} />
      <AIChatAssistant />
    </Layout>
  );
}
