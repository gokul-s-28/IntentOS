import { useState, useRef, useEffect, useCallback } from 'react';
import { useIntentContext } from '../contexts/IntentContext';

const LOGO = '/ai-logo.webp';

// ── Markdown renderer (bold + lists) ────────────────────────────────────
function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={j} className="font-semibold text-indigo-300">{p.slice(2, -2)}</strong>
        : p
    );
    if (line.startsWith('- ') || line.startsWith('• '))
      return <li key={i} className="ml-4 list-disc leading-relaxed">{parts}</li>;
    if (/^\d+\./.test(line))
      return <li key={i} className="ml-4 list-decimal leading-relaxed">{parts}</li>;
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="leading-relaxed">{parts}</p>;
  });
}

// ── Avatar component ─────────────────────────────────────────────────────
function Avatar({ size = 'sm' }) {
  const [err, setErr] = useState(false);
  const cls = size === 'lg'
    ? 'w-full h-full'
    : 'w-full h-full';
  if (err) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <span className="text-white font-bold text-xs">AI</span>
      </div>
    );
  }
  return (
    <img
      src={LOGO}
      alt="AI Companion"
      className={`${cls} object-cover`}
      onError={() => setErr(true)}
    />
  );
}

// ── Dynamic quick prompts based on topic ────────────────────────────────
function getQuickPrompts(topic) {
  if (topic) {
    return [
      { label: '📖 Summarize', text: `Give me a concise summary of ${topic}.` },
      { label: '❓ Quiz me', text: `Ask me a challenging practice question about ${topic}.` },
      { label: '🔑 Key concepts', text: `What are the most important concepts in ${topic} I must know?` },
      { label: '🗺️ Study plan', text: `Create a 7-day study plan for mastering ${topic}.` },
      { label: '💡 Explain simply', text: `Explain ${topic} as if I'm a complete beginner.` },
      { label: '🚀 Interview tips', text: `What are common interview questions about ${topic}?` },
    ];
  }
  return [
    { label: '📚 Study help', text: 'How can I study more effectively?' },
    { label: '🧠 Memory tips', text: 'What are the best techniques to memorize information?' },
    { label: '⏰ Time management', text: 'Give me a time management strategy for studying.' },
    { label: '🎯 Focus tips', text: 'How do I improve my focus and concentration?' },
  ];
}

export default function AIChatAssistant() {
  const { workspace } = useIntentContext();
  const topic = workspace?.topic || '';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Build greeting based on topic
  const buildGreeting = useCallback((t) => ({
    role: 'assistant',
    content: t
      ? `👋 Hey there! I'm your **IntentOS AI Study Companion**.\n\nI can see you're studying **${t}** — great choice! I'm here to help you:\n\n- Understand difficult concepts\n- Practice with questions\n- Create study plans\n- Prepare for interviews & exams\n\nWhat would you like to explore first? 🚀`
      : `👋 Hey there! I'm your **IntentOS AI Study Companion**.\n\nI'm here to help you learn anything — explanations, practice questions, study plans, and more!\n\nEnter a topic in the workspace to get personalized help, or just ask me anything! 💡`,
  }), []);

  // Reset on topic change
  useEffect(() => {
    setMessages([buildGreeting(topic)]);
  }, [topic, buildGreeting]);

  // Auto-scroll & focus
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (!messages.some(m => m.role === 'user')) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setError('');

    const history = updated.slice(1, -1).map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, topic, history }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setError('AI companion is temporarily unavailable. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([buildGreeting(topic)]);
    setError('');
  };

  const quickPrompts = getQuickPrompts(topic);

  // ── Glowing orb button ──
  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        {/* Tooltip */}
        <div style={{
          background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(139,92,246,0.3)',
          color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600,
          padding: '7px 14px', borderRadius: 99,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'float 3s ease-in-out infinite',
          whiteSpace: 'nowrap',
        }}>
          ✦ Ask your AI Companion
        </div>

        {/* Orb */}
        <button
          onClick={() => setIsOpen(true)}
          title="Open AI Study Companion"
          style={{
            position: 'relative',
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 0 30px rgba(139,92,246,0.6), 0 0 60px rgba(59,130,246,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(139,92,246,0.8), 0 0 80px rgba(59,130,246,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(139,92,246,0.6), 0 0 60px rgba(59,130,246,0.3)'; }}
        >
          🤖
          {/* Pulse rings */}
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: '2px solid rgba(139,92,246,0.5)',
            animation: 'orbPulse 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
          <span style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            border: '1.5px solid rgba(59,130,246,0.3)',
            animation: 'orbPulse 2s ease-out infinite 0.6s',
            pointerEvents: 'none',
          }} />
        </button>

        <style>{`
          @keyframes orbPulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 ease-in-out ${
        isMinimized ? 'h-[60px] w-[320px]' : 'w-[380px] sm:w-[420px] h-[600px]'
      }`}
      style={{ maxHeight: 'calc(100vh - 96px)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 rounded-t-2xl flex-shrink-0 shadow">
        {/* Avatar bubble */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0 shadow-lg">
          <Avatar />
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-purple-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white tracking-wide leading-tight">IntentOS AI Companion</p>
          <p className="text-[10px] text-indigo-200 mt-0.5">
            {topic ? `📚 Studying: ${topic}` : '🟢 Online · Ready to help'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear */}
          <button onClick={clearChat} title="Clear chat" className="p-1.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {/* Minimize */}
          <button onClick={() => setIsMinimized(m => !m)} title={isMinimized ? 'Expand' : 'Minimize'} className="p-1.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
            </svg>
          </button>
          {/* Close */}
          <button onClick={() => setIsOpen(false)} title="Close" className="p-1.5 rounded-lg text-indigo-200 hover:bg-white/10 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* ── Messages area ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-indigo-500/50 flex-shrink-0 mt-1 shadow">
                    <Avatar />
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-tr-md shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800 text-slate-200 rounded-tl-md border border-slate-700/60'
                }`}>
                  {msg.role === 'assistant'
                    ? <div className="space-y-0.5 text-[13px]">{renderMarkdown(msg.content)}</div>
                    : <p className="text-[13px]">{msg.content}</p>}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 text-white text-xs font-bold shadow">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-indigo-500/50 flex-shrink-0 mt-1">
                  <Avatar />
                </div>
                <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-slate-400 ml-1">AI is thinking…</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-rose-900/30 border border-rose-700/50 rounded-xl px-3 py-2 text-xs text-rose-300 flex items-center gap-2 animate-fade-in">
                <span>⚠️</span> {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick Prompts ── */}
          <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-slate-800 flex-shrink-0">
            {quickPrompts.map((q) => (
              <button
                key={q.label}
                onClick={() => sendMessage(q.text)}
                disabled={loading}
                className="text-[10px] bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/60 px-2.5 py-1 rounded-full transition whitespace-nowrap disabled:opacity-40"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* ── Input ── */}
          <div className="px-3 pb-3 pt-2 flex-shrink-0">
            <div className="flex gap-2 items-end bg-slate-800 border border-slate-700 hover:border-indigo-500/70 focus-within:border-indigo-400 rounded-xl px-3 py-2.5 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                }}
                onKeyDown={handleKey}
                placeholder={topic ? `Ask about ${topic}…` : 'Ask your AI companion…'}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none resize-none leading-relaxed min-h-[22px] max-h-24"
                style={{ scrollbarWidth: 'none' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  loading || !input.trim()
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95'
                }`}
              >
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 text-center">⏎ to send · Shift+⏎ for new line</p>
          </div>
        </>
      )}
    </div>
  );
}
