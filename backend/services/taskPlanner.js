/**
 * taskPlanner.js
 * ──────────────
 * Converts the action key array from intentParser into rich, human-readable
 * task objects with titles, descriptions, and estimated durations.
 *
 * Each task key maps to a Task Definition. The planner also:
 *  - Calculates per-task time allocations based on total session duration
 *  - Inserts smart break tasks for sessions longer than 45 minutes
 *  - Returns a Pomodoro timer config based on session length
 */

// ── Task Definition Registry ─────────────────────────────────────────────────
// weight: relative proportion of session time to allocate to this task
const TASK_REGISTRY = {
  load_questions: {
    title: 'Load Practice Questions',
    description: 'Pull up curated interview questions for your topic',
    icon: '📋',
    weight: 0.15,
    category: 'prep',
  },
  open_video: {
    title: 'Watch Reference Video',
    description: 'Watch a focused tutorial or lecture on the topic',
    icon: '🎬',
    weight: 0.20,
    category: 'learn',
  },
  generate_notes: {
    title: 'Generate Study Notes',
    description: 'Summarise key concepts into structured notes',
    icon: '📝',
    weight: 0.20,
    category: 'document',
  },
  start_timer: {
    title: 'Start Focus Timer',
    description: 'Begin your timed deep-work session',
    icon: '⏱',
    weight: 0.05,
    category: 'system',
  },
  activate_focus_mode: {
    title: 'Activate Focus Mode',
    description: 'Minimise distractions and enter deep-work state',
    icon: '🎯',
    weight: 0.05,
    category: 'system',
  },
  block_distractions: {
    title: 'Block Distracting Sites',
    description: 'Enable site blocking (social media, news, etc.)',
    icon: '🛡',
    weight: 0.03,
    category: 'system',
  },
  open_editor: {
    title: 'Open Code / Text Editor',
    description: 'Launch your preferred editor for the task',
    icon: '💻',
    weight: 0.10,
    category: 'tool',
  },
  load_resources: {
    title: 'Load Reference Resources',
    description: 'Gather docs, articles, and links you may need',
    icon: '🔗',
    weight: 0.10,
    category: 'prep',
  },
  create_outline: {
    title: 'Create Outline / Plan',
    description: 'Draft a structured outline before diving in',
    icon: '🗂',
    weight: 0.15,
    category: 'plan',
  },
  review_flashcards: {
    title: 'Review Flashcards',
    description: 'Quick-fire recall for key definitions and concepts',
    icon: '🃏',
    weight: 0.15,
    category: 'learn',
  },
  run_pomodoro: {
    title: 'Run Pomodoro Cycles',
    description: 'Work in focused intervals with short breaks',
    icon: '🍅',
    weight: 0.30,
    category: 'system',
  },
  schedule_breaks: {
    title: 'Schedule Breaks',
    description: 'Set up regular rest intervals to maintain focus',
    icon: '☕',
    weight: 0.05,
    category: 'system',
  },
  open_whiteboard: {
    title: 'Open Whiteboard',
    description: 'Use a canvas for brainstorming and mind-mapping',
    icon: '🖊',
    weight: 0.15,
    category: 'tool',
  },
  load_reference_docs: {
    title: 'Load Reference Docs',
    description: 'Open relevant documentation for quick access',
    icon: '📚',
    weight: 0.10,
    category: 'prep',
  },
  compile_checklist: {
    title: 'Build Task Checklist',
    description: 'Break down the goal into actionable checklist items',
    icon: '✅',
    weight: 0.15,
    category: 'plan',
  },
  start_workout_tracker: {
    title: 'Start Workout Tracker',
    description: 'Log your exercise sets, reps, and rest periods',
    icon: '💪',
    weight: 0.30,
    category: 'fitness',
  },
};

// ── Utility helpers ───────────────────────────────────────────────────────────
/**
 * Calculate Pomodoro timer settings from total duration (minutes).
 * Short sessions (< 45 min): no breaks
 * Medium (45–90 min): 25/5 pomodoro
 * Long (> 90 min): 45/10 deep-work intervals
 */
const buildTimerSettings = (durationMinutes) => {
  if (durationMinutes < 45) {
    return { totalMinutes: durationMinutes, breakIntervalMinutes: durationMinutes, breakDurationMinutes: 0 };
  }
  if (durationMinutes <= 90) {
    return { totalMinutes: durationMinutes, breakIntervalMinutes: 25, breakDurationMinutes: 5 };
  }
  return { totalMinutes: durationMinutes, breakIntervalMinutes: 45, breakDurationMinutes: 10 };
};

/**
 * Resolve a task key to its definition, with a safe fallback for unknown keys.
 * @param {string} key
 * @returns {Object}
 */
const resolveTask = (key) =>
  TASK_REGISTRY[key] || {
    title: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    description: 'Custom task generated from your intent',
    icon: '🔹',
    weight: 0.10,
    category: 'custom',
  };

// ── Main exported function ────────────────────────────────────────────────────
/**
 * Build a full workspace plan from a parsed intent object.
 *
 * @param {Object} parsedIntent – output from intentParser.parseIntent()
 * @param {string[]} parsedIntent.tasks
 * @param {number}   parsedIntent.duration
 * @param {string}   parsedIntent.category
 * @param {boolean}  parsedIntent.distractionBlock
 * @returns {Object} workspacePlan
 */
const buildPlan = (parsedIntent) => {
  const { tasks: taskKeys = [], duration = 60, distractionBlock = false, videos = [], questions = [] } = parsedIntent;

  if (!Array.isArray(taskKeys) || taskKeys.length === 0) {
    throw new Error('taskPlanner: tasks array is empty or invalid');
  }

  // ── Resolve keys → definitions ──────────────────────────────────────────
  const resolvedTasks = taskKeys.map((key, idx) => {
    const def = resolveTask(key);
    // Proportional time allocation
    const allocatedMinutes = Math.round((def.weight / taskKeys.length) * duration * taskKeys.length * def.weight);
    return {
      id: `task_${idx + 1}`,
      key,
      order: idx + 1,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      estimatedMinutes: Math.max(1, Math.min(allocatedMinutes, duration)),
      completed: false,
    };
  });

  // ── Insert a break task for long sessions ──────────────────────────────
  if (duration > 60) {
    const breakIdx = Math.floor(resolvedTasks.length / 2);
    resolvedTasks.splice(breakIdx, 0, {
      id: 'task_break',
      key: 'break',
      order: breakIdx + 1,
      title: '☕ Mid-Session Break',
      description: `Step away for ${duration > 90 ? 10 : 5} minutes — rest helps retention`,
      icon: '☕',
      category: 'break',
      estimatedMinutes: duration > 90 ? 10 : 5,
      completed: false,
    });
    // Re-number orders after splice
    resolvedTasks.forEach((t, i) => { t.order = i + 1; });
  }

  // ── Blocked sites list ─────────────────────────────────────────────────
  const blockedSites = distractionBlock
    ? ['twitter.com', 'x.com', 'reddit.com', 'youtube.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'netflix.com']
    : [];

  // ── Timer settings ─────────────────────────────────────────────────────
  const timerSettings = buildTimerSettings(duration);

  return {
    tasks: resolvedTasks,
    timerSettings,
    distractionBlocking: distractionBlock,
    blockedSites,
    videos,
    questions,
    totalTasks: resolvedTasks.length,
    estimatedCompletionMinutes: duration,
  };
};

module.exports = { buildPlan, resolveTask, buildTimerSettings, TASK_REGISTRY };
