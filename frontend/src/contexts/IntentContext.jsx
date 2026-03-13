import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { intentService } from '../services/intentService';

const IntentContext = createContext(null);

export function IntentProvider({ children }) {
  const [intent, setIntent] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load from local storage on mount (with simple schema guard to avoid legacy data)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('intentos_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        const ws = parsed.workspace;

        const looksNewSchema =
          ws &&
          Array.isArray(ws.questions) &&
          ws.questions.length > 0 &&
          typeof ws.questions[0] === 'object' &&
          Array.isArray(ws.studyPlan) &&
          Array.isArray(ws.notes || []);

        if (looksNewSchema) {
          setIntent(parsed.intent);
          setWorkspace(ws);
        } else {
          // Clear legacy / incompatible sessions so user generates a fresh workspace
          localStorage.removeItem('intentos_session');
        }
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
      localStorage.removeItem('intentos_session');
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (intent && workspace) {
      localStorage.setItem('intentos_session', JSON.stringify({ intent, workspace }));
    } else {
      localStorage.removeItem('intentos_session');
    }
  }, [intent, workspace]);

  /**
   * Submit raw intent text to the backend for AI parsing
   */
  const submitIntent = useCallback(async (rawIntent) => {
    setLoading(true);
    setError(null);
    try {
      const result = await intentService.createIntent(rawIntent);
      
      // result.parsedIntent holds the exact JSON from the LLM (topic, questions, video, studyPlan)
      setIntent(result);
      setWorkspace(result.parsedIntent);
      return { success: true, data: result };
    } catch (err) {
      console.error('Intent generation failed:', err);
      setError(err.message || 'Failed to generate workspace. Please try again.');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWorkspace = useCallback(() => {
    setIntent(null);
    setWorkspace(null);
    setError(null);
  }, []);

  const value = {
    intent,
    workspace,
    loading,
    error,
    submitIntent,
    clearWorkspace,
  };

  return <IntentContext.Provider value={value}>{children}</IntentContext.Provider>;
}

export const useIntentContext = () => {
  const ctx = useContext(IntentContext);
  if (!ctx) throw new Error('useIntentContext must be used within IntentProvider');
  return ctx;
};
