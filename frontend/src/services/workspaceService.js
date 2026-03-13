import api from './api';

/**
 * workspaceService
 * Wraps all /api/workspace endpoint calls for session management.
 */
export const workspaceService = {
  /**
   * POST /api/workspace/session/start – Begin a focus session
   * @param {string} intentId
   * @param {string|null} userId
   * @returns {Promise<Object>} Session document
   */
  startSession: async (intentId, userId = null) => {
    const result = await api.post('/workspace/session/start', { intentId, userId });
    return result.data;
  },

  /**
   * PATCH /api/workspace/session/:id/end – End an active session
   * @param {string} sessionId
   * @param {Object} results – { actualDurationMinutes, completedTasks, notes }
   * @returns {Promise<Object>} Updated session document
   */
  endSession: async (sessionId, results = {}) => {
    const result = await api.patch(`/workspace/session/${sessionId}/end`, results);
    return result.data;
  },

  /**
   * GET /api/workspace/session/:id – Get a session by ID
   * @param {string} sessionId
   * @returns {Promise<Object>}
   */
  getSession: async (sessionId) => {
    const result = await api.get(`/workspace/session/${sessionId}`);
    return result.data;
  },

  /**
   * GET /api/workspace/sessions – List all sessions
   * @returns {Promise<Array>}
   */
  getSessions: async () => {
    const result = await api.get('/workspace/sessions');
    return result.data;
  },
};
