const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * @route   POST /api/notes/generate
 * @desc    Generate concise key notes on a topic using Groq
 * @body    { topic: string }
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }

    const prompt = `You are an expert academic tutor. Generate concise key notes on the topic: "${topic.trim()}".

Rules:
- Write EXACTLY 7 to 10 bullet points. No more, no less.
- Each point must be a SHORT, standalone sentence (max 20 words).
- Focus ONLY on the most important concepts, definitions, and facts.
- Do NOT use vague generic advice. Every point must be specific to "${topic.trim()}".
- Mark the 2-3 most critical points with a "⭐" prefix. Others get a "•" prefix.
- No nested bullets. No headers. No intro/outro text.
- Return ONLY the bullet points as a plain JSON array of strings.

Example format:
["⭐ Point one here.", "• Point two here.", "⭐ Point three here."]

Return ONLY the JSON array. No markdown, no explanation.`;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.5,
    });

    const raw = completion.choices[0]?.message?.content || '';

    // Extract JSON array
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('AI did not return a valid JSON array.');

    const notes = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(notes) || notes.length === 0) throw new Error('Empty notes array.');

    const cleaned = notes
      .filter(n => typeof n === 'string' && n.trim())
      .map(n => n.trim());

    res.json({ success: true, notes: cleaned, topic: topic.trim() });
  } catch (err) {
    console.error('[notesRoute] Error:', err.message);
    next(err);
  }
});

module.exports = router;
