import { useState, useCallback } from 'react';
import { intentService } from '../services/intentService';

/**
 * useIntent Hook
 * Manages the lifecycle of submitting an intent and receiving an AI workspace plan.
 *
 * @returns {Object} { intent, workspace, loading, error, submitIntent, clearWorkspace }
 */
export function useIntent() {
  const [intent, setIntent]     = useState(null);   // full Intent document from DB
  const [workspace, setWorkspace] = useState(null); // workspace plan subset
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  /**
   * Submit a raw intent string to the API and populate workspace state.
   * @param {string} rawIntent
   */
  const submitIntent = useCallback(async (rawIntent) => {
    setLoading(true);
    setError(null);
    setIntent(null);
    setWorkspace(null);

    try {
      const data = await intentService.createIntent(rawIntent);
      setIntent(data);
      setWorkspace(data.workspacePlan);
    } catch (err) {
      setError(err.message || 'Failed to generate workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWorkspace = useCallback(() => {
    setIntent(null);
    setWorkspace(null);
    setError(null);
  }, []);

  return { intent, workspace, loading, error, submitIntent, clearWorkspace };
}
