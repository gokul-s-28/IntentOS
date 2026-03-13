import { useState } from 'react';

/**
 * IntentInput Component
 * The hero input where users type their natural-language intent.
 *
 * Props:
 *   onSubmit(text: string) – called with the raw intent string
 *   loading: boolean       – shows spinner while AI processes
 */
const EXAMPLE_INTENTS = [
  'Prepare React interview for 2 hours and block distractions',
  'Study machine learning basics for 90 minutes',
  'Deep work session on product roadmap for 3 hours',
  'Review pull requests and write tests for 1 hour',
];

export default function IntentInput({ onSubmit, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim());
  };

  const handleExample = (example) => {
    setText(example);
  };

  return (
    <div className="glass-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Intent textarea */}
        <div className="relative">
          <textarea
            id="intent-input"
            className="intent-input resize-none h-24"
            placeholder="Example: Prepare React interview for 2 hours"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {/* Character count */}
          <span className="absolute bottom-3 right-4 text-xs text-gray-600">{text.length}/500</span>
        </div>

        {/* Submit button */}
        <div className="flex items-center gap-4">
          <button
            id="intent-submit-btn"
            type="submit"
            disabled={loading || !text.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Building Workspace…
              </>
            ) : (
              <>Generate Workspace</>
            )}
          </button>
          <span className="text-xs text-gray-600">⏎ Enter to submit</span>
        </div>
      </form>

      {/* Example intents */}
      <div className="mt-4 pt-4 border-t border-surface-border">
        <p className="text-xs text-gray-600 mb-2 uppercase tracking-widest">Examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_INTENTS.map((ex) => (
            <button
              key={ex}
              onClick={() => handleExample(ex)}
              className="text-xs text-gray-400 hover:text-white border border-surface-border hover:border-brand-500
                         px-3 py-1.5 rounded-lg transition-all duration-150 text-left"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
