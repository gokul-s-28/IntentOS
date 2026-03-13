const openaiService = require('./openaiService');

/**
 * Workspace Service
 * Builds comprehensive workspace plans from parsed intents.
 *
 * This service is the core business logic layer between
 * the AI (OpenAI service) and the database (Intent model).
 */

/**
 * Generate a task list based on the intent topic and mode.
 * @param {Object} parsedIntent
 * @returns {Array} tasks
 */
const generateTasks = (parsedIntent) => {
  const { topic, mode, duration } = parsedIntent;

  // TODO: Replace with AI-generated task list via openaiService
  const taskTemplates = {
    practice: [
      { title: `Review core concepts of ${topic}`, description: 'Go through fundamentals', completed: false, order: 1 },
      { title: 'Solve 3 practice problems', description: 'Focus on common interview patterns', completed: false, order: 2 },
      { title: 'Review solutions and edge cases', description: 'Understand the "why"', completed: false, order: 3 },
      { title: 'Take a short break', description: `${Math.floor(duration * 0.1)} min break`, completed: false, order: 4 },
      { title: 'Mock interview round', description: 'Simulate real interview conditions', completed: false, order: 5 },
    ],
    research: [
      { title: `Read about ${topic}`, description: 'Gather core understanding', completed: false, order: 1 },
      { title: 'Take structured notes', description: 'Summarise key points', completed: false, order: 2 },
      { title: 'Identify gaps', description: 'List what you need to explore further', completed: false, order: 3 },
    ],
    focus: [
      { title: `Start deep work session on ${topic}`, description: 'No distractions', completed: false, order: 1 },
      { title: 'Mid-session review', description: 'Check progress at halfway mark', completed: false, order: 2 },
      { title: 'Finalise and document', description: 'Write a summary of outputs', completed: false, order: 3 },
    ],
    general: [
      { title: `Work on ${topic}`, description: 'Main task', completed: false, order: 1 },
      { title: 'Review work done', description: 'Quality check', completed: false, order: 2 },
    ],
  };

  return taskTemplates[mode] || taskTemplates['general'];
};

/**
 * Build a complete workspace plan from a parsed intent.
 * @param {Object} parsedIntent
 * @returns {Promise<Object>} workspacePlan
 */
const buildWorkspacePlan = async (parsedIntent) => {
  const { duration, distractionBlock, topic } = parsedIntent;

  // Generate tasks
  const tasks = generateTasks(parsedIntent);

  // Suggest resources via AI service
  const resources = await openaiService.suggestResources(topic);

  // Calculate timer settings (Pomodoro-style)
  const breakIntervalMinutes = Math.min(25, Math.floor(duration / 4));
  const breakDurationMinutes = duration >= 60 ? 5 : 3;

  return {
    tasks,
    resources,
    timerSettings: {
      totalMinutes: duration,
      breakIntervalMinutes,
      breakDurationMinutes,
    },
    distractionBlocking: distractionBlock || false,
    blockedSites: distractionBlock ? ['twitter.com', 'reddit.com', 'youtube.com', 'facebook.com', 'instagram.com'] : [],
  };
};

module.exports = { buildWorkspacePlan, generateTasks };
