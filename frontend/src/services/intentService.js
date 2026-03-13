import api from './api';

/**
 * intentService
 * Wraps all /api/intents endpoint calls.
 */
export const intentService = {
  /**
   * POST /api/intents – Submit a raw intent and get workspace plan
   * @param {string} rawIntent
   * @param {string|null} userId
   * @returns {Promise<Object>} Intent document with workspacePlan
   */
  createIntent: async (rawIntent, userId = null) => {
    // Send directly to the aliased route requested in the prompt
    const response = await fetch('/generate-workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: rawIntent, userId })
    });
    const result = await response.json();
    if (!result.success && result.message) throw new Error(result.message);
    return result.data || result;
  },

  /**
   * GET /api/intents – Fetch recent intents
   * @returns {Promise<Array>}
   */
  getIntents: async () => {
    const result = await api.get('/intents');
    return result.data;
  },

  /**
   * GET /api/intents/:id – Fetch a single intent
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getIntentById: async (id) => {
    const result = await api.get(`/intents/${id}`);
    return result.data;
  },

  /**
   * PATCH /api/intents/:id/status – Update intent status
   * @param {string} id
   * @param {string} status – 'active' | 'completed' | 'cancelled'
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status) => {
    const result = await api.patch(`/intents/${id}/status`, { status });
    return result.data;
  },

  /**
   * DELETE /api/intents/:id
   * @param {string} id
   * @returns {Promise<Object>}
   */
  deleteIntent: async (id) => {
    const result = await api.delete(`/intents/${id}`);
    return result.data;
  },
};
