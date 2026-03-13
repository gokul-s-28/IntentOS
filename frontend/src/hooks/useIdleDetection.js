import { useEffect, useRef, useCallback } from 'react';

/**
 * useIdleDetection
 *
 * Tracks user activity (mousemove, keydown, click, scroll).
 * After `warningMs` of inactivity → calls `onWarning`.
 * After `endMs` total inactivity → calls `onSessionEnd`.
 * Activity restarting resets both timers and calls `onResume`.
 *
 * @param {object} options
 * @param {number}   options.warningMs    - ms of inactivity before warning (default 5 min)
 * @param {number}   options.endMs        - ms of inactivity before session end (default 10 min)
 * @param {Function} options.onWarning    - called when warning threshold is crossed
 * @param {Function} options.onSessionEnd - called when end threshold is crossed
 * @param {Function} options.onResume     - called when user activity resumes
 * @param {boolean}  options.enabled      - enable/disable detection (default true)
 */
export function useIdleDetection({
  warningMs = 5 * 60 * 1000,   // 5 minutes
  endMs = 10 * 60 * 1000,      // 10 minutes
  onWarning,
  onSessionEnd,
  onResume,
  enabled = true,
} = {}) {
  const warningFired = useRef(false);
  const endFired     = useRef(false);
  const warningTimer = useRef(null);
  const endTimer     = useRef(null);

  const clearTimers = useCallback(() => {
    clearTimeout(warningTimer.current);
    clearTimeout(endTimer.current);
  }, []);

  const startTimers = useCallback(() => {
    clearTimers();
    warningFired.current = false;

    // Warning after 5 minutes
    warningTimer.current = setTimeout(() => {
      if (!warningFired.current) {
        warningFired.current = true;
        onWarning?.();
      }
    }, warningMs);

    // Session end after 10 minutes
    endTimer.current = setTimeout(() => {
      if (!endFired.current) {
        endFired.current = true;
        onSessionEnd?.();
      }
    }, endMs);
  }, [clearTimers, warningMs, endMs, onWarning, onSessionEnd]);

  const handleActivity = useCallback(() => {
    if (!enabled) return;
    // If warning was already shown, treat this activity as a resume
    if (warningFired.current) {
      warningFired.current = false;
      endFired.current = false;
      onResume?.();
    }
    startTimers();
  }, [enabled, startTimers, onResume]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    // Start timers on mount
    startTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimers();
    };
  }, [enabled, handleActivity, startTimers, clearTimers]);

  /** Call this externally to manually reset the idle clock (e.g., on user resume) */
  const resetIdle = useCallback(() => {
    warningFired.current = false;
    endFired.current = false;
    startTimers();
  }, [startTimers]);

  return { resetIdle };
}
