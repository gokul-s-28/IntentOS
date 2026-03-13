/**
 * AIAssistant Component
 * Placeholder for the AI chat assistant panel within the workspace.
 * Will integrate with /api/intents and OpenAI streaming in future phases.
 *
 * Props:
 *   intent {Object} – the current intent document
 */
export default function AIAssistant({ intent }) {
  const topic = intent?.parsedIntent?.topic || 'your session';

  return (
    <div className="flex flex-col gap-3">
      {/* AI message bubble */}
      <div className="bg-surface-hover border border-surface-border rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-xs">🤖</div>
          <span className="text-xs font-semibold text-brand-400">IntentOS AI</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          Your workspace is ready for{' '}
          <span className="text-white font-medium">{topic}</span>.
          Stay focused — I'll keep track of your progress and surface hints as needed.
        </p>
      </div>

      {/* Placeholder message input */}
      <div className="flex gap-2">
        <input
          id="ai-chat-input"
          type="text"
          placeholder="Ask me anything…"
          className="flex-1 bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-sm
                     text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
          disabled
        />
        <button
          id="ai-chat-send-btn"
          className="btn-primary py-2 px-3 text-sm disabled:opacity-40"
          disabled
          title="AI chat coming soon"
        >
          ➤
        </button>
      </div>
      <p className="text-xs text-gray-600 text-center">AI chat – coming soon 🚧</p>
    </div>
  );
}
