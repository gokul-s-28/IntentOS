import { useState, useEffect, useRef, useCallback } from 'react';

const IDLE_THRESHOLD = 30; // seconds of no activity = idle

/**
 * useProductivityTracker
 *
 * Tracks:
 *  - totalTime      (seconds since workspace loaded)
 *  - activeTime     (seconds with user activity)
 *  - idleTime       (totalTime - activeTime)
 *  - distractionAttempts (incremented externally via addDistraction())
 *
 * Formula:
 *  ProductivityScore = (activeTime / totalTime * 70) + (1 - min(distractions,10)/10) * 30
 *  Clamped 0–100.
 */
export function useProductivityTracker({ intent = '', enabled = true } = {}) {
  const [totalTime,           setTotalTime]           = useState(0);
  const [activeTime,          setActiveTime]          = useState(0);
  const [distractionAttempts, setDistractionAttempts] = useState(0);
  const [sessionSaved,        setSessionSaved]        = useState(false);

  const startTimeRef       = useRef(null);
  const lastActivityRef    = useRef(Date.now());
  const isActiveRef        = useRef(true);   // true = user recently active
  const activeSecondsRef   = useRef(0);
  const totalSecondsRef    = useRef(0);
  const distractionsRef    = useRef(0);
  const tickerRef          = useRef(null);

  // Record activity
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    isActiveRef.current = true;
  }, []);

  // Add a distraction attempt (called from FocusMode / Dashboard)
  const addDistraction = useCallback(() => {
    distractionsRef.current += 1;
    setDistractionAttempts(distractionsRef.current);
  }, []);

  // Compute score
  const computeScore = useCallback((active, total, distractions) => {
    if (total === 0) return 0;
    const activeRatio        = Math.min(active / total, 1);
    const distractionPenalty = Math.min(distractions, 10) / 10;
    const raw = activeRatio * 70 + (1 - distractionPenalty) * 30;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }, []);

  // Save session to backend
  const saveSession = useCallback(async () => {
    if (sessionSaved || !intent || totalSecondsRef.current < 10) return;
    const active      = activeSecondsRef.current;
    const total       = totalSecondsRef.current;
    const distractions = distractionsRef.current;
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          startTime:           startTimeRef.current,
          endTime:             new Date().toISOString(),
          totalTime:           total,
          activeTime:          active,
          idleTime:            total - active,
          distractionAttempts: distractions,
        }),
      });
      setSessionSaved(true);
    } catch (err) {
      console.warn('[useProductivityTracker] Failed to save session:', err.message);
    }
  }, [intent, sessionSaved]);

  // Main ticker — runs every second
  useEffect(() => {
    if (!enabled) return;

    startTimeRef.current = new Date().toISOString();
    lastActivityRef.current = Date.now();

    // Attach activity listeners
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, recordActivity, { passive: true }));

    tickerRef.current = setInterval(() => {
      totalSecondsRef.current += 1;
      setTotalTime(totalSecondsRef.current);

      const idleSecs = (Date.now() - lastActivityRef.current) / 1000;
      if (idleSecs < IDLE_THRESHOLD) {
        isActiveRef.current = true;
        activeSecondsRef.current += 1;
        setActiveTime(activeSecondsRef.current);
      } else {
        isActiveRef.current = false;
      }
    }, 1000);

    // Save session when user leaves page
    const handleUnload = () => saveSession();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(tickerRef.current);
      events.forEach(e => window.removeEventListener(e, recordActivity));
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [enabled, recordActivity, saveSession]);

  const idleTime         = totalTime - activeTime;
  const productivityScore = computeScore(activeTime, totalTime, distractionAttempts);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    totalTime,
    activeTime,
    idleTime,
    distractionAttempts,
    productivityScore,
    isActive: isActiveRef.current,
    formatTime,
    addDistraction,
    saveSession,
  };
}
