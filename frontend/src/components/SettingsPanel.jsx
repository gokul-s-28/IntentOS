import { useState } from 'react';

const TIMER_PRESETS = [25, 45, 60, 90];

export default function SettingsPanel() {
  const [selectedTimer, setSelectedTimer] = useState(() => {
    return Number(localStorage.getItem('intentos_timer_preset') || 25);
  });
  const [autoFocus, setAutoFocus] = useState(() => {
    return localStorage.getItem('intentos_auto_focus') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('intentos_sound') !== 'false';
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('intentos_timer_preset', String(selectedTimer));
    localStorage.setItem('intentos_auto_focus', String(autoFocus));
    localStorage.setItem('intentos_sound', String(soundEnabled));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-slate-800 shadow-lg rounded-xl p-6 hover:scale-[1.02] transition duration-300 border border-slate-700 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl bg-slate-700/60 p-2 rounded-lg text-slate-300">⚙️</span>
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide">Settings</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Session & workspace preferences</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5">

        {/* Timer Preset */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
            ⏱ Default Timer Duration
          </p>
          <div className="flex gap-2 flex-wrap">
            {TIMER_PRESETS.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => setSelectedTimer(min)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                  selectedTimer === min
                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-slate-200'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>

        {/* Toggle: Auto-start Focus Mode */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">Auto-start Focus Mode</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automatically enable focus mode when a new workspace is generated.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoFocus}
            onClick={() => setAutoFocus((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              autoFocus ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                autoFocus ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle: Sound notifications */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">Timer Sound Notifications</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Play a sound when the focus timer ends.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => setSoundEnabled((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
              soundEnabled ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className={`mt-auto w-full py-2.5 rounded-lg text-sm font-semibold transition shadow-md ${
            saved
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
