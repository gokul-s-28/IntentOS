const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * @route   POST /api/mcq/generate
 * @desc    Generate leveled MCQs on a given topic using Groq
 * @body    { topic: string, counts?: { easy: number, medium: number, hard: number } }
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { topic, counts = { easy: 3, medium: 3, hard: 2 } } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }

    const { easy = 3, medium = 3, hard = 2 } = counts;
    const total = easy + medium + hard;

    const prompt = `You are an expert quiz creator. Generate ${total} multiple-choice questions about "${topic.trim()}".

Distribute them as follows:
- ${easy} EASY questions (basic recall / definitions)
- ${medium} MEDIUM questions (application / understanding)
- ${hard} HARD questions (analysis / deeper concepts)

Each question must have exactly 4 options and one correct answer.

Return a valid JSON array ONLY — no markdown, no explanation. Use this exact format:
[
  {
    "level": "easy",
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "A. ...",
    "explanation": "Brief explanation of why this is correct."
  }
]

Rules:
- Questions must be directly about "${topic.trim()}", not generic.
- Options must be distinct and plausible.
- The "answer" field must exactly match one of the "options" strings.
- No trivially obvious wrong answers (e.g. "none of the above").
- Return ONLY the JSON array.`;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.6,
    });

    const raw = completion.choices[0]?.message?.content || '';

    // Extract JSON array from the response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON array.');
    }

    const questions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Parsed questions array is empty.');
    }

    // Validate and sanitize
    const cleaned = questions
      .filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2 && q.answer)
      .map(q => ({
        level: q.level || 'medium',
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation || '',
      }));

    res.json({ success: true, questions: cleaned, topic: topic.trim() });
  } catch (err) {
    console.error('[mcqRoute] Error:', err.message);
    next(err);
  }
});

module.exports = router;
