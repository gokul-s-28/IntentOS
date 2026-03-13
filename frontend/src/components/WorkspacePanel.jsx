import Draggable from 'react-draggable';
import TaskCard from './TaskCard';
import Timer from './Timer';
import AIAssistant from './AIAssistant';

/**
 * WorkspacePanel Component
 * The main workspace rendered after an intent is processed by AI.
 * Contains draggable panels for Tasks, Timer, and AI Assistant.
 *
 * Props:
 *   workspace {Object} – AI-generated workspace plan from Intent model
 *   intent    {Object} – The full intent document (includes parsedIntent)
 *   onClear   {Function} – Resets the workspace back to the input state
 */
export default function WorkspacePanel({ workspace, intent, onClear }) {
  if (!workspace) return null;

  const { tasks = [], resources = [], timerSettings = {}, distractionBlocking, blockedSites = [] } = workspace;
  const parsedIntent = intent?.parsedIntent || {};

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="glass-card p-5 flex items-center justify-between border-gradient">
        <div>
          <h2 className="text-xl font-bold text-white">{parsedIntent.topic || 'Your Workspace'}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{intent?.aiSummary || 'AI workspace ready — stay focused!'}</p>
          <div className="flex gap-2 mt-2">
            {(parsedIntent.tags || []).map((tag) => (
              <span key={tag} className="tag-indigo">{tag}</span>
            ))}
            {distractionBlocking && (
              <span className="tag bg-red-950 text-rose-300 border-red-800">🛡 Distraction Blocked</span>
            )}
          </div>
        </div>
        <button
          id="workspace-clear-btn"
          onClick={onClear}
          className="btn-ghost text-sm"
        >
          ✕ Clear
        </button>
      </div>

      {/* Draggable Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tasks Panel (draggable) */}
        <Draggable handle=".drag-handle" bounds="parent">
          <div className="glass-card p-5 lg:col-span-2 cursor-default">
            <div className="drag-handle flex items-center gap-2 mb-4 cursor-grab active:cursor-grabbing">
              <span className="text-gray-600 text-xs select-none">⠿</span>
              <h3 className="font-semibold text-white">Tasks</h3>
              <span className="ml-auto text-xs text-gray-500">{tasks.filter(t => t.completed).length}/{tasks.length} done</span>
            </div>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No tasks generated yet</p>
              ) : (
                tasks.map((task, idx) => <TaskCard key={idx} task={task} index={idx} />)
              )}
            </div>
          </div>
        </Draggable>

        {/* Right Column: Timer + AI Assistant */}
        <div className="space-y-6">
          {/* Timer */}
          <Draggable handle=".drag-handle" bounds="parent">
            <div className="glass-card p-5">
              <div className="drag-handle flex items-center gap-2 mb-4 cursor-grab active:cursor-grabbing">
                <span className="text-gray-600 text-xs select-none">⠿</span>
                <h3 className="font-semibold text-white">Focus Timer</h3>
              </div>
              <Timer settings={timerSettings} />
            </div>
          </Draggable>

          {/* AI Assistant */}
          <Draggable handle=".drag-handle" bounds="parent">
            <div className="glass-card p-5">
              <div className="drag-handle flex items-center gap-2 mb-4 cursor-grab active:cursor-grabbing">
                <span className="text-gray-600 text-xs select-none">⠿</span>
                <h3 className="font-semibold text-white">AI Assistant</h3>
              </div>
              <AIAssistant intent={intent} />
            </div>
          </Draggable>
        </div>
      </div>

      {/* Resources Panel */}
      {resources.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-3">📚 Suggested Resources</h3>
          <div className="flex flex-wrap gap-3">
            {resources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-surface-border hover:border-brand-500
                           text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all duration-150"
              >
                <span>{r.type === 'video' ? '🎬' : '🔗'}</span>
                {r.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
