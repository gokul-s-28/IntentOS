import { useEffect, useState } from 'react';

/**
 * IdleWarningModal
 * Shown when no user activity is detected for 5 minutes.
 * Displays a live countdown towards session end (next 5 minutes).
 *
 * @param {object}   props
 * @param {boolean}  props.show          - whether to show the modal
 * @param {boolean}  props.sessionEnded  - whether the session has been auto-ended
 * @param {Function} props.onResume      - called when user clicks "I'm Here"
 * @param {Function} props.onEndSession  - called when user manually ends the session
 * @param {number}   props.countdownSecs - seconds remaining until auto session end
 */
export default function IdleWarningModal({
  show,
  sessionEnded,
  onResume,
  onEndSession,
  countdownSecs = 300,
}) {
  const [remaining, setRemaining] = useState(countdownSecs);

  // Reset countdown each time the modal opens
  useEffect(() => {
    if (show && !sessionEnded) {
      setRemaining(countdownSecs);
      const interval = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) { clearInterval(interval); return 0; }
          return r - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [show, sessionEnded, countdownSecs]);

  if (!show) return null;

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const pct  = ((countdownSecs - remaining) / countdownSecs) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">

        {/* Animated top bar */}
        <div
          className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />

        <div className="p-8 flex flex-col items-center text-center gap-4">
          {sessionEnded ? (
            <>
              {/* Session ended state */}
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <span className="text-3xl">🛑</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">Session Ended</h2>
              <p className="text-sm text-slate-400">
                No activity was detected for <span className="text-rose-400 font-semibold">10 minutes</span>.
                Your timer has been stopped and the session has ended.
              </p>
              <button
                onClick={onResume}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-500/20 mt-2"
              >
                Start a New Session
              </button>
            </>
          ) : (
            <>
              {/* Warning state */}
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">Are you still there?</h2>
              <p className="text-sm text-slate-400">
                No activity detected for{' '}
                <span className="text-amber-400 font-semibold">5 minutes</span>.
                Your timer has been paused.
              </p>

              {/* Countdown ring */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Session ends in
                </p>
                <span className="text-4xl font-extrabold text-white tabular-nums">
                  {mins}:{secs}
                </span>
              </div>

              {/* Action buttons */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <button
                  onClick={onResume}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-lg shadow-emerald-500/20"
                >
                  ✅ I'm Here — Resume Timer
                </button>
                <button
                  onClick={onEndSession}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  End Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
