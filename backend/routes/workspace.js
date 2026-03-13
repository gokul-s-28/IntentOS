const express = require('express');
const router = express.Router();

const Session = require('../models/Session');
const Intent = require('../models/Intent');

/**
 * @route   POST /api/workspace/session/start
 * @desc    Start a new focus session for a given intent
 * @access  Public
 */
router.post('/session/start', async (req, res, next) => {
  try {
    const { intentId, userId } = req.body;

    const intent = await Intent.findById(intentId);
    if (!intent) return res.status(404).json({ success: false, message: 'Intent not found' });

    const session = await Session.create({
      intentId,
      userId: userId || null,
      plannedDurationMinutes: intent.workspacePlan.timerSettings.totalMinutes || 60,
      status: 'active',
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/workspace/session/:id/end
 * @desc    End a focus session and save results
 * @access  Public
 */
router.patch('/session/:id/end', async (req, res, next) => {
  try {
    const { actualDurationMinutes, completedTasks, notes, status } = req.body;

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      {
        endTime: new Date(),
        actualDurationMinutes,
        completedTasks,
        notes,
        status: status || 'completed',
        // focusScore will be computed by AI service in future
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/workspace/session/:id
 * @desc    Get session details
 * @access  Public
 */
router.get('/session/:id', async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate('intentId');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/workspace/sessions
 * @desc    List all sessions (paginated in future)
 * @access  Public
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(20).populate('intentId', 'rawIntent');
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
