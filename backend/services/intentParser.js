const OpenAI = require('openai');
const { searchYouTube } = require('./youtubeService');

/**
 * intentParser.js
 * ───────────────
 * Uses the OpenAI Chat Completions API to convert a raw natural-language
 * intent string into a structured JSON object.
 *
 * Output contract:
 * {
 *   category : string   – "study" | "work" | "creative" | "fitness" | "general"
 *   topic    : string   – human-readable topic label
 *   duration : number   – session length in minutes
 *   tasks    : string[] – ordered list of action keys for taskPlanner
 *   tags     : string[] – short keyword tags
 *   distractionBlock: boolean
 *   rawIntent: string   – original user input (echoed for traceability)
 * }
 */

// ── AI client (lazy init) ─────────────────────────────────────────────────────
// Supports both OpenAI keys (sk_...) and Groq keys (gsk_...).
// Groq exposes an OpenAI-compatible REST API so we just override the baseURL.
let _client = null;
const getClient = () => {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key === 'your_openai_api_key_here') {
      return null; // signals caller to use fallback
    }
    const isGroqKey = key.startsWith('gsk_');
    _client = new OpenAI({
      apiKey: key,
      ...(isGroqKey ? { baseURL: 'https://api.groq.com/openai/v1' } : {}),
    });
  }
  return _client;
};

// ── System prompt ──
const SYSTEM_PROMPT = `
You are IntentOS, an AI productivity assistant.
Your job is to parse a user's natural-language intent into a strict JSON object.

Rules:
1. Return ONLY valid JSON — no markdown, no extra text.
2. "topic" must be a clean, human-readable title (e.g. "Kubernetes", "Machine Learning Basics", "React Interview").
3. "questions" must be exactly 5 relevant study or interview questions (array of strings).
4. "video" must be an object with a "title" and a "url" pointing to a relevant YouTube embed (e.g. "https://www.youtube.com/embed?listType=search&list=kubernetes+tutorial").
5. "studyPlan" must be a 4-step actionable study plan (array of strings).

JSON schema:
{
 "topic": "<string>",
 "questions": [
   "<string>",
   "<string>",
   "<string>",
   "<string>",
   "<string>"
 ],
 "video": {
   "title": "<string>",
   "url": "<string>"
 },
 "studyPlan": [
   "<string>",
   "<string>",
   "<string>",
   "<string>"
 ]
}
`.trim();

// New study-workspace focused system prompt used by the app
const STUDY_SYSTEM_PROMPT = `
You are IntentOS, an AI study workspace generator.
Given a user's learning or exam-prep topic, you must return a STRICT JSON object
with rich study material. Follow these rules exactly:

1. Respond with ONLY valid JSON. No markdown, no explanations.
2. "topic" must be a clear, human-readable learning topic.
3. "questions" must be an array of EXACTLY 5 multiple-choice questions.
   Each question object MUST have:
   - "question": the question text (string)
   - "options": an array of EXACTLY 4 answer choices (strings)
   - "answer": the FULL TEXT of the correct option, and it MUST match exactly
     one of the strings inside "options".
4. "video" must be an object with:
   - "title": a short title for the recommended video
   - "youtubeSearch": a short search query that can be used to find a good
     YouTube video for this topic (example: "machine learning tutorial for beginners").
5. "notes" must be an array of 5–8 concise bullet-point strings with key
   concepts, definitions, or formulas for the topic.
6. "studyPlan" must be an ordered array of 4–6 actionable steps that a learner
   should follow (for example: "Revise fundamentals", "Watch tutorial video",
   "Solve 10 MCQs", "Review mistakes", ...).

JSON schema (structure only, values are examples):
{
  "topic": "Machine Learning Basics",
  "questions": [
    {
      "question": "What is supervised learning?",
      "options": [
        "Learning from labeled examples",
        "Learning without any data",
        "Randomly guessing outputs",
        "Optimizing hardware resources only"
      ],
      "answer": "Learning from labeled examples"
    }
  ],
  "video": {
    "title": "Machine Learning for Beginners",
    "youtubeSearch": "machine learning tutorial for beginners"
  },
  "notes": [
    "Machine learning is a subset of artificial intelligence.",
    "Supervised learning uses labeled input-output pairs.",
    "Unsupervised learning discovers patterns in unlabeled data."
  ],
  "studyPlan": [
    "Revise core definitions and terminology.",
    "Watch a beginner-friendly tutorial video.",
    "Solve practice MCQs to test understanding.",
    "Review notes and clarify weak areas."
  ]
}
`.trim();

// Default unused for now, retained if needed
const DEFAULT_TASKS = {};

// ── Heuristic fallback parser ────────────────────────────────────────────────
/**
 * Parses the intent locally without calling OpenAI.
 * Used when no API key is present or the API call fails.
 * @param {string} raw
 * @returns {Object}
 */
const fallbackParse = (raw) => {
  const topic = raw
    .replace(/\b\d+(\.\d+)?\s*(hour|hr|min|minute)s?\b/gi, '')
    .replace(/\band\b.*$/i, '')
    .replace(/\bfor\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || 'General Learning';

  const video = {
    title: `${topic} Tutorial`,
    youtubeSearch: `${topic} tutorial for beginners`,
  };

  // Very lightweight MCQ generation so the system works for ANY topic
  const questions = [
    {
      question: `What best describes ${topic}?`,
      options: [
        `A key concept or technology related to ${topic}`,
        `An unrelated programming language`,
        `A hardware-only optimization technique`,
        `A random marketing term`,
      ],
      answer: `A key concept or technology related to ${topic}`,
    },
    {
      question: `Which of the following is a common use case of ${topic}?`,
      options: [
        `Solving real-world problems related to ${topic}`,
        `Formatting documents only`,
        `Designing clothing`,
        `Cooking recipes`,
      ],
      answer: `Solving real-world problems related to ${topic}`,
    },
    {
      question: `When starting with ${topic}, what should you focus on first?`,
      options: [
        `Understanding the core fundamentals and terminology`,
        `Memorizing random trivia`,
        `Ignoring theory and only guessing`,
        `Avoiding hands-on practice entirely`,
      ],
      answer: `Understanding the core fundamentals and terminology`,
    },
    {
      question: `How can you strengthen your understanding of ${topic}?`,
      options: [
        `By practicing problems and small projects`,
        `By never writing code or notes`,
        `By avoiding all tutorials`,
        `By only reading unrelated blogs`,
      ],
      answer: `By practicing problems and small projects`,
    },
    {
      question: `What is a good way to revise ${topic}?`,
      options: [
        `Review notes, solve MCQs, and summarize key ideas`,
        `Forget everything after a single read`,
        `Avoid checking mistakes`,
        `Only read titles without details`,
      ],
      answer: `Review notes, solve MCQs, and summarize key ideas`,
    },
  ];

  const notes = [
    `${topic} is an important topic for many modern technical interviews and exams.`,
    `Start by clarifying the core definitions and terminology used in ${topic}.`,
    `Identify the main subtopics within ${topic} and cover them one by one.`,
    `Practice applying ${topic} concepts to small, realistic examples.`,
    `Use high-quality tutorials and official documentation whenever possible.`,
  ];

  const studyPlan = [
    `Scan the syllabus or outline what you need to know about ${topic}.`,
    `Study the core concepts and terminology of ${topic} in detail.`,
    `Watch a focused tutorial video on ${topic} and take notes.`,
    `Solve multiple-choice questions and small exercises on ${topic}.`,
    `Review your mistakes, refine your notes, and summarise key insights.`,
  ];

  return { topic, questions, video, notes, studyPlan };
};

// ── Main exported function ───────────────────────────────────────────────────
/**
 * Parse a raw intent using OpenAI (with local fallback).
 * @param {string} rawIntent
 * @returns {Promise<Object>} Structured intent JSON
 */
const parseIntent = async (rawIntent) => {
  if (!rawIntent || typeof rawIntent !== 'string') {
    throw new Error('rawIntent must be a non-empty string');
  }

  const client = getClient();

  // ── Real OpenAI call ──────────────────────────────────────────────────────
  if (client) {
    try {
      console.log(`[intentParser] Calling AI API for: "${rawIntent}"`);
      const completion = await client.chat.completions.create({
        model: 'llama3-8b-8192',         // Groq: fast + accurate; works with gsk_ keys
        temperature: 0.4,
        max_tokens: 1500,                // enough for 5 MCQs with 4 options each
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: STUDY_SYSTEM_PROMPT },
          { role: 'user',   content: rawIntent },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      const parsed = JSON.parse(raw);

      // Validate required fields for the dashboard contract
      if (
        !parsed.topic ||
        !Array.isArray(parsed.questions) ||
        !parsed.video ||
        !Array.isArray(parsed.studyPlan)
      ) {
        throw new Error('OpenAI response missing required fields');
      }

      console.log(`[intentParser] AI parsed → topic="${parsed.topic}"`);
      // Enrich video with multiple real YouTube suggestions
      const searchQuery = parsed.video?.youtubeSearch || parsed.video?.title || parsed.topic;
      const ytVideos = await searchYouTube(searchQuery, 5);
      if (ytVideos && ytVideos.length > 0) {
        parsed.video = {
          ...parsed.video,
          videoId: ytVideos[0].videoId,
          embedUrl: ytVideos[0].embedUrl,
          suggestions: ytVideos,
        };
      }
      return { ...parsed, rawIntent };

    } catch (err) {
      console.warn(`[intentParser] OpenAI failed (${err.message}), falling back to heuristic parser`);
    }
  } else {
    console.log(`[intentParser] No API key – using heuristic fallback for: "${rawIntent}"`);
  }

  // ── Heuristic fallback ──
  const fallback = fallbackParse(rawIntent);
  console.log(`[intentParser] Fallback → topic="${fallback.topic}"`);
  // Still try to get real videos even on fallback
  const searchQuery = fallback.video?.youtubeSearch || `${fallback.topic} tutorial`;
  const ytVideos = await searchYouTube(searchQuery, 5);
  if (ytVideos && ytVideos.length > 0) {
    fallback.video = {
      ...fallback.video,
      videoId: ytVideos[0].videoId,
      embedUrl: ytVideos[0].embedUrl,
      suggestions: ytVideos,
    };
  }
  return { ...fallback, rawIntent };
};

module.exports = { parseIntent };
