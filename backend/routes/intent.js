const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/auth'); // Uncomment when auth is implemented
// const intentController = require('../controllers/intentController'); // Future: extract to controller

const Intent = require('../models/Intent');
const openaiService = require('../services/openaiService'); // Keep if needed for summary/resources
const { parseIntent } = require('../services/intentParser');

/**
 * @route   POST /api/intents
 * @desc    Submit a new intent and get AI-generated workspace plan
 * @access  Public (will be protected later)
 */
router.post('/', async (req, res, next) => {
  try {
    const rawIntent = req.body.intent || req.body.rawIntent || req.body.topic;
    const userId = req.body.userId;
    if (!rawIntent) return res.status(400).json({ success: false, message: 'Intent text is required' });

    // Step 1: Parse intent using AI
    const parsedIntent = await parseIntent(rawIntent);

    // Step 2: The parsed intent IS the full workspace plan (topic, questions, video, studyPlan)
    const workspacePlan = parsedIntent;

    // Step 3: Save to DB
    const intent = await Intent.create({
      userId: userId || null,
      rawIntent,
      parsedIntent,
      workspacePlan,
      aiSummary: parsedIntent.summary || '',
      status: 'active',
    });

    res.status(201).json({ success: true, data: intent });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/intents
 * @desc    Get all intents (for logged-in user or all in dev)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const intents = await Intent.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: intents.length, data: intents });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/intents/:id
 * @desc    Get a single intent by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const intent = await Intent.findById(req.params.id);
    if (!intent) return res.status(404).json({ success: false, message: 'Intent not found' });
    res.json({ success: true, data: intent });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/intents/:id/status
 * @desc    Update intent status (active, completed, cancelled)
 * @access  Public
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const intent = await Intent.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!intent) return res.status(404).json({ success: false, message: 'Intent not found' });
    res.json({ success: true, data: intent });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/intents/:id
 * @desc    Delete an intent
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const intent = await Intent.findByIdAndDelete(req.params.id);
    if (!intent) return res.status(404).json({ success: false, message: 'Intent not found' });
    res.json({ success: true, message: 'Intent deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
