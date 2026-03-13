const express = require('express');
const router = express.Router();
const { chat } = require('../services/groqService');

/**
 * @route   POST /api/chat
 * @desc    Send a message to the AI assistant and receive a response
 * @body    { message: string, topic?: string, history?: [{role, content}] }
 * @access  Public (can add JWT protect middleware later)
 */
router.post('/', async (req, res, next) => {
  try {
    const { message, topic = '', history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const reply = await chat(message.trim(), topic, history);

    res.json({ success: true, reply });
  } catch (err) {
    console.error('[chatRoute] Groq error:', err.message);
    next(err);
  }
});

module.exports = router;
