import { useState, useMemo } from 'react';
import { useIntentContext } from '../contexts/IntentContext';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function PlannerPanel() {
  const { workspace } = useIntentContext();
  const studyPlan = workspace?.studyPlan || [];
  const [checked, setChecked] = useState({});

  const toggle = (idx) => setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  const completedCount = Object.values(checked).filter(Boolean).length;
  const total = studyPlan.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const chartData = useMemo(
    () => [{ name: 'Progress', value: progressPct, fill: '#6366f1' }],
    [progressPct]
  );

  return (
    <div className="bg-slate-800 shadow-lg rounded-xl p-6 hover:scale-[1.02] transition duration-300 border border-slate-700 h-full flex flex-col text-left">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl bg-indigo-500/20 p-2 rounded-lg text-indigo-400">📋</span>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">Study Plan</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Check off steps or drag progress slider below.
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            progressPct === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-indigo-300'
          }`}
        >
          {completedCount}/{total} {progressPct === 100 ? 'Done!' : ''}
        </span>
      </div>

      {/* Progress slider + mini radial chart */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPct}
            readOnly
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>0%</span>
            <span>{progressPct}%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="w-16 h-16 flex items-center justify-center bg-slate-900/70 rounded-full border border-slate-700/80">
          <RadialBarChart
            width={60}
            height={60}
            cx="50%"
            cy="50%"
            innerRadius={18}
            outerRadius={26}
            barSize={6}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 custom-scrollbar">
        {studyPlan.length === 0 ? (
          <p className="text-slate-400 text-sm text-center my-auto">No study plan loaded.</p>
        ) : (
          studyPlan.map((step, idx) => {
            const done = !!checked[idx];
            return (
              <button
                key={idx}
                onClick={() => toggle(idx)}
                className={`w-full group flex items-start text-left gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  done 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-slate-900/40 border-slate-700/50 hover:border-indigo-500/40'
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                  done ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400' : 'border-slate-500 text-slate-400 group-hover:border-indigo-400'
                }`}>
                  {done ? '✓' : idx + 1}
                </div>
                <div>
                  <p className={`text-sm tracking-wide transition-all ${done ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    {step}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
