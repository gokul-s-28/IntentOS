import Layout from '../components/Layout';
import QuestionsPanel from '../components/QuestionsPanel';
import AIChatAssistant from '../components/AIChatAssistant';
import { useNavigate } from 'react-router-dom';

export default function QuestionsPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ color: '#94A3B8', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            ❓ Practice Questions
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>
            AI-generated MCQs across easy, medium, and hard difficulty levels.
          </p>
        </div>
        {/* Reuse existing QuestionsPanel */}
        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', minHeight: 600 }}>
          <QuestionsPanel />
        </div>
      </div>
      <AIChatAssistant />
    </Layout>
  );
}
