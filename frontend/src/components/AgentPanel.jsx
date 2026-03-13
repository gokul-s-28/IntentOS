import { useState } from 'react';

const MOCK_AGENTS = [
  {
    id: 'planner',
    name: 'Task Planner',
    icon: '🗂',
    status: 'active',
    description: 'Decomposes your intent into actionable tasks with time estimates.',
    lastAction: 'Generated 5-step study plan for "React Hooks"',
    metrics: { tasks: 12, accuracy: '94%' },
  },
  {
    id: 'researcher',
    name: 'Resource Scout',
    icon: '🔍',
    status: 'active',
    description: 'Searches the web and curates top learning resources for your goal.',
    lastAction: 'Found 4 YouTube videos + 3 documentation links',
    metrics: { resources: 7, quality: '★★★★☆' },
  },
  {
    id: 'coach',
    name: 'Focus Coach',
    icon: '🎯',
    status: 'idle',
    description: 'Monitors your session, suggests breaks, and adjusts focus duration.',
    lastAction: 'Recommended 25-min Pomodoro blocks',
    metrics: { suggestions: 3, adherence: '80%' },
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    icon: '📋',
    status: 'idle',
    description: 'Generates concise summaries of what you have studied each session.',
    lastAction: 'Waiting for session end to summarize',
    metrics: { summaries: 0, pending: 1 },
  },
  {
    id: 'distraction',
    name: 'Distraction Guard',
    icon: '🛡',
    status: 'error',
    description: 'Blocks distracting sites during focus sessions via intent config.',
    lastAction: 'Failed to load blocklist — check permissions',
    metrics: { blocked: 0, attempts: 2 },
  },
];

const STATUS_CONFIG = {
  active: { label: 'Active',  dot: 'ap-dot--active',  badge: 'ap-badge--active'  },
  idle:   { label: 'Idle',    dot: 'ap-dot--idle',    badge: 'ap-badge--idle'    },
  error:  { label: 'Error',   dot: 'ap-dot--error',   badge: 'ap-badge--error'   },
};

export default function AgentPanel() {
  const [selected, setSelected] = useState(null);
  const agent = MOCK_AGENTS.find((a) => a.id === selected);

  return (
    <div className="ap-root">
      {agent ? (
        /* ── Detail view ── */
        <div className="ap-detail">
          <button className="ap-back" onClick={() => setSelected(null)}>← All Agents</button>
          <div className="ap-detail-header">
            <span className="ap-detail-icon">{agent.icon}</span>
            <div>
              <h3 className="ap-detail-name">{agent.name}</h3>
              <span className={`ap-badge ${STATUS_CONFIG[agent.status].badge}`}>
                <span className={`ap-dot ${STATUS_CONFIG[agent.status].dot}`} />
                {STATUS_CONFIG[agent.status].label}
              </span>
            </div>
          </div>
          <p className="ap-detail-desc">{agent.description}</p>
          <div className="ap-detail-last">
            <span className="ap-detail-last-label">Last action</span>
            <p>{agent.lastAction}</p>
          </div>
          <div className="ap-metrics">
            {Object.entries(agent.metrics).map(([k, v]) => (
              <div key={k} className="ap-metric-card">
                <span className="ap-metric-val">{v}</span>
                <span className="ap-metric-key">{k}</span>
              </div>
            ))}
          </div>
          <button
            className={`ap-action-btn${agent.status === 'error' ? ' ap-action-btn--retry' : ''}`}
            onClick={() => {}}
          >
            {agent.status === 'active' ? '⏸ Pause' : agent.status === 'error' ? '↺ Retry' : '▶ Activate'}
          </button>
        </div>
      ) : (
        /* ── List view ── */
        <ul className="ap-list">
          {MOCK_AGENTS.map((a) => (
            <li key={a.id}>
              <button className="ap-item" onClick={() => setSelected(a.id)}>
                <span className="ap-item-icon">{a.icon}</span>
                <div className="ap-item-info">
                  <div className="ap-item-row">
                    <span className="ap-item-name">{a.name}</span>
                    <span className={`ap-badge ${STATUS_CONFIG[a.status].badge}`}>
                      <span className={`ap-dot ${STATUS_CONFIG[a.status].dot}`} />
                      {STATUS_CONFIG[a.status].label}
                    </span>
                  </div>
                  <p className="ap-item-last">{a.lastAction}</p>
                </div>
                <span className="ap-item-caret">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
