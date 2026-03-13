import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTimer Hook
 * Manages a Pomodoro-style countdown timer with focus/break phases.
 *
 * @param {Object} options
 * @param {number} options.totalMinutes         – total session duration
 * @param {number} options.breakIntervalMinutes – focus interval before a break
 * @param {number} options.breakDurationMinutes – break length
 * @returns timer state and controls
 */
export function useTimer({ totalMinutes = 60, breakIntervalMinutes = 25, breakDurationMinutes = 5 }) {
  const [phase, setPhase]       = useState('focus'); // 'focus' | 'break'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(breakIntervalMinutes * 60);

  const intervalRef = useRef(null);
  const phaseRef    = useRef(phase);
  phaseRef.current  = phase;

  // Tick every second
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Phase switch
            if (phaseRef.current === 'focus') {
              setPhase('break');
              return breakDurationMinutes * 60;
            } else {
              setPhase('focus');
              return breakIntervalMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, breakIntervalMinutes, breakDurationMinutes]);

  const toggle = useCallback(() => setIsRunning((r) => !r), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setPhase('focus');
    setTimeLeft(breakIntervalMinutes * 60);
  }, [breakIntervalMinutes]);

  return { timeLeft, isRunning, phase, toggle, reset };
}
