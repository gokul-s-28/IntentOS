const OpenAI = require('openai');

/**
 * OpenAI Service
 * Handles all interactions with the OpenAI API for IntentOS.
 *
 * Key responsibilities:
 * - parseIntent(): Converts raw user intent string into structured data
 * - generateWorkspaceSummary(): Creates a motivational summary for the workspace
 * - suggestResources(): Returns curated resource recommendations
 */

// Lazy-initialise client so the app doesn't crash if key is missing in dev
let openai;
const getClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

/**
 * Parse a raw intent string into a structured object.
 * @param {string} rawIntent - e.g. "Prepare React interview for 2 hours and block distractions"
 * @returns {Promise<Object>} parsedIntent
 */
const parseIntent = async (rawIntent) => {
  // TODO: Replace mock response with actual OpenAI call
  // const client = getClient();
  // const completion = await client.chat.completions.create({ ... });

  // ── MOCK RESPONSE (remove once OpenAI key is configured) ──────────────────
  console.log(`[OpenAI Service] Parsing intent: "${rawIntent}"`);
  return {
    topic: 'React Interview Preparation',
    duration: 120, // minutes
    mode: 'practice',
    tags: ['react', 'interview', 'frontend'],
    distractionBlock: true,
    summary: `A focused 2-hour session to prepare for a React interview. Tasks include reviewing hooks, component lifecycle, state management, and practicing common coding questions.`,
  };
  // ─────────────────────────────────────────────────────────────────────────
};

/**
 * Generate a motivational AI summary for the active workspace.
 * @param {Object} parsedIntent
 * @returns {Promise<string>}
 */
const generateWorkspaceSummary = async (parsedIntent) => {
  // TODO: Implement OpenAI call
  console.log(`[OpenAI Service] Generating workspace summary`);
  return `Your workspace is optimised for "${parsedIntent.topic}". Stay focused — you've got this! 🚀`;
};

/**
 * Suggest relevant resources for the given topic.
 * @param {string} topic
 * @returns {Promise<Array>}
 */
const suggestResources = async (topic) => {
  // TODO: Implement OpenAI call
  console.log(`[OpenAI Service] Suggesting resources for: "${topic}"`);
  return [
    { title: 'React Official Docs', url: 'https://react.dev', type: 'link' },
    { title: 'React Interview Questions', url: 'https://github.com/sudheerj/reactjs-interview-questions', type: 'link' },
    { title: 'Scrimba React Course', url: 'https://scrimba.com/learn/learnreact', type: 'video' },
  ];
};

module.exports = { parseIntent, generateWorkspaceSummary, suggestResources };
