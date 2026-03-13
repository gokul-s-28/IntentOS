import Layout from '../components/Layout';
import NotesPanel from '../components/NotesPanel';
import AIChatAssistant from '../components/AIChatAssistant';
import { useNavigate } from 'react-router-dom';

export default function NotesPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ color: '#94A3B8', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            📓 Smart Notes
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>
            AI-generated key concept notes, highlighted for fast review.
          </p>
        </div>
        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', minHeight: 500 }}>
          <NotesPanel />
        </div>
      </div>
      <AIChatAssistant />
    </Layout>
  );
}
