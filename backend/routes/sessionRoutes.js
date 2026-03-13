const express = require('express');
const router  = express.Router();
const Session = require('../models/Session');

/**
 * POST /api/sessions
 * Save a completed productivity session.
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      intent, userId, startTime, endTime,
      totalTime, activeTime, idleTime, distractionAttempts,
    } = req.body;

    if (!intent || !startTime) {
      return res.status(400).json({ success: false, message: 'intent and startTime are required.' });
    }

    const session = new Session({
      intent, userId: userId || null,
      startTime: new Date(startTime),
      endTime:   endTime ? new Date(endTime) : new Date(),
      totalTime:           Number(totalTime)           || 0,
      activeTime:          Number(activeTime)          || 0,
      idleTime:            Number(idleTime)            || 0,
      distractionAttempts: Number(distractionAttempts) || 0,
    });

    await session.save(); // pre-save hook computes productivityScore
    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error('[sessionRoute POST]', err.message);
    next(err);
  }
});

/**
 * GET /api/sessions
 * Retrieve the last N sessions (default 20), most recent first.
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const sessions = await Session.find()
      .sort({ startTime: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, sessions });
  } catch (err) {
    console.error('[sessionRoute GET]', err.message);
    next(err);
  }
});

module.exports = router;
