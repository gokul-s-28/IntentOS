import { useState, useCallback } from 'react';
import { workspaceService } from '../services/workspaceService';

/**
 * useWorkspace Hook
 * Manages workspace sessions — starting, pausing, ending, and tracking.
 *
 * @returns workspace session state and controls
 */
export function useWorkspace() {
  const [session, setSession]       = useState(null);
  const [sessionLoading, setLoading] = useState(false);
  const [sessionError, setError]    = useState(null);

  /**
   * Start a new focus session for the given intentId.
   * @param {string} intentId
   */
  const startSession = useCallback(async (intentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceService.startSession(intentId);
      setSession(data);
    } catch (err) {
      setError(err.message || 'Could not start session');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * End the current session with optional results.
   * @param {string} sessionId
   * @param {Object} results – { actualDurationMinutes, completedTasks, notes }
   */
  const endSession = useCallback(async (sessionId, results = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workspaceService.endSession(sessionId, results);
      setSession(data);
    } catch (err) {
      setError(err.message || 'Could not end session');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return { session, sessionLoading, sessionError, startSession, endSession, clearSession };
}
