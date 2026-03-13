import { useState, useEffect } from 'react';

/**
 * TimerPanel
 *
 * Props:
 *  - onStartFocusMode: optional callback to enter focus mode
 *  - forcePause: boolean - when true, externally pauses the timer (used by idle detection)
 *  - onTimerStateChange: (isActive: boolean) => void - notifies parent of timer state
 */
export default function TimerPanel({ onStartFocusMode, forcePause, onTimerStateChange }) {
  const [minutes, setMinutes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // External pause control (from idle detection)
  useEffect(() => {
    if (forcePause && isActive) {
      setIsActive(false);
    }
  }, [forcePause]);

  // Notify parent when timer state changes
  useEffect(() => {
    onTimerStateChange?.(isActive);
  }, [isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    if (!isActive) {
      const totalSeconds = minutes > 0 ? minutes * 60 : 0;
      if (totalSeconds === 0 && timeLeft === 0) return;
      if (timeLeft === 0 && totalSeconds > 0) {
        setTimeLeft(totalSeconds);
      }
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  /** Called externally to resume after idle */
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  const totalTime = minutes * 60 || 1;
  const pct = timeLeft > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <div className="bg-slate-800 shadow-lg rounded-xl p-6 hover:scale-[1.02] transition duration-300 border border-slate-700 h-full flex flex-col justify-between text-left items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl bg-indigo-500/20 p-2 rounded-lg text-indigo-400">⏱</span>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide">Session Timer</h2>
        </div>
        {onStartFocusMode && (
          <button
            type="button"
            onClick={onStartFocusMode}
            className="hidden sm:inline-flex text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 transition"
          >
            Start Focus Mode
          </button>
        )}
      </div>

      {/* Settings input */}
      <div className="w-full bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mt-2 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Minutes
          </label>
          <input
            type="number"
            min="0"
            max="240"
            className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-center text-sm text-slate-200 outline-none focus:border-indigo-500"
            value={minutes}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              const safe = Number.isFinite(val) && val >= 0 ? val : 0;
              setMinutes(safe);
              if (!isActive) setTimeLeft(0);
            }}
            disabled={isActive}
          />
        </div>
        <p className="text-[11px] text-slate-500">Timer starts from 0, you control the duration.</p>
      </div>

      {/* Circle display */}
      <div className="relative w-40 h-40 flex items-center justify-center my-2">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r="74" fill="transparent" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="80"
            cy="80"
            r="74"
            fill="transparent"
            stroke="#6366f1"
            strokeWidth="8"
            strokeDasharray="465"
            strokeDashoffset={465 - (465 * pct) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="text-center z-10 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-indigo-400">
            {forcePause && !isActive && timeLeft > 0 ? '⏸ Paused' : 'Focus Session'}
          </span>
          <span className="text-4xl font-extrabold text-white tracking-tighter tabular-nums drop-shadow-md">
            {m}:{s}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full mt-4">
        <button
          type="button"
          onClick={handleStart}
          className={`flex-1 py-3 px-4 rounded-xl font-bold tracking-wide transition shadow-lg ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20'
          }`}
        >
          {isActive ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-5 py-3 rounded-xl font-bold text-slate-400 bg-slate-700/50 border border-slate-600 hover:bg-slate-700 hover:text-slate-200 transition"
        >
          ↺
        </button>
      </div>

      {onStartFocusMode && (
        <button
          type="button"
          onClick={onStartFocusMode}
          className="mt-3 w-full sm:hidden text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition"
        >
          Start Focus Mode
        </button>
      )}
    </div>
  );
}
