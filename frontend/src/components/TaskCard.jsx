import { useState } from 'react';

/**
 * TaskCard Component
 * Displays a single task with a checkbox toggle.
 *
 * Props:
 *   task  {Object} – { title, description, completed, order }
 *   index {number} – position in the tasks array
 */
export default function TaskCard({ task, index }) {
  const [completed, setCompleted] = useState(task.completed || false);

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer group
        ${completed
          ? 'border-surface-border bg-surface/50 opacity-60'
          : 'border-surface-border hover:border-brand-500 bg-surface/30'
        }`}
      onClick={() => setCompleted(!completed)}
    >
      {/* Checkbox */}
      <div
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
          ${completed ? 'bg-accent-green border-accent-green' : 'border-gray-600 group-hover:border-brand-400'}`}
      >
        {completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${completed ? 'line-through text-gray-500' : 'text-white'}`}>
          <span className="text-gray-600 mr-1.5 font-mono text-xs">{String(index + 1).padStart(2, '0')}.</span>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
        )}
      </div>
    </div>
  );
}
