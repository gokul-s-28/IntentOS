import { useTimer } from '../hooks/useTimer';

/**
 * Timer Component
 * Pomodoro-style countdown timer driven by the useTimer hook.
 *
 * Props:
 *   settings {Object} – { totalMinutes, breakIntervalMinutes, breakDurationMinutes }
 */
export default function Timer({ settings = {} }) {
  const {
    totalMinutes = 60,
    breakIntervalMinutes = 25,
    breakDurationMinutes = 5,
  } = settings;

  const { timeLeft, isRunning, phase, toggle, reset } = useTimer({ totalMinutes, breakIntervalMinutes, breakDurationMinutes });

  const totalSeconds = totalMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Format mm:ss
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  const circumference = 2 * Math.PI * 56; // radius = 56

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular progress */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="#2a2a45" strokeWidth="8" />
          <circle
            cx="64" cy="64" r="56" fill="none"
            stroke={phase === 'break' ? '#22d3ee' : '#6366f1'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono text-white">{mm}:{ss}</span>
          <span className={`text-xs font-medium uppercase tracking-widest mt-0.5 ${phase === 'break' ? 'text-accent-cyan' : 'text-brand-400'}`}>
            {phase}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          id="timer-toggle-btn"
          onClick={toggle}
          className={`btn-primary text-sm py-2 px-5 ${phase === 'break' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}`}
        >
          {isRunning ? '⏸  Pause' : '▶ Start'}
        </button>
        <button
          id="timer-reset-btn"
          onClick={reset}
          className="btn-ghost text-sm py-2 px-4"
        >
          ↺ Reset
        </button>
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-2 text-center">
        <div className="bg-surface-hover rounded-lg p-2">
          <p className="text-xs text-gray-500">Break every</p>
          <p className="text-sm font-semibold text-white">{breakIntervalMinutes} min</p>
        </div>
        <div className="bg-surface-hover rounded-lg p-2">
          <p className="text-xs text-gray-500">Break for</p>
          <p className="text-sm font-semibold text-white">{breakDurationMinutes} min</p>
        </div>
      </div>
    </div>
  );
}
