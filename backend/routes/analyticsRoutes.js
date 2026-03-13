const express  = require('express');
const router   = express.Router();
const Analytics = require('../models/Analytics');

// Seed realistic demo data if collection is empty
const DEMO_DATA = [
  { userId: 'demo', score: 5,  videosWatched: 2, focusTime: 20, aiQuestions: 3,  plannerProgress: 30, date: '2026-03-08' },
  { userId: 'demo', score: 7,  videosWatched: 3, focusTime: 35, aiQuestions: 6,  plannerProgress: 45, date: '2026-03-09' },
  { userId: 'demo', score: 6,  videosWatched: 1, focusTime: 15, aiQuestions: 4,  plannerProgress: 50, date: '2026-03-10' },
  { userId: 'demo', score: 9,  videosWatched: 4, focusTime: 50, aiQuestions: 8,  plannerProgress: 65, date: '2026-03-11' },
  { userId: 'demo', score: 8,  videosWatched: 2, focusTime: 40, aiQuestions: 5,  plannerProgress: 72, date: '2026-03-12' },
  { userId: 'demo', score: 10, videosWatched: 5, focusTime: 60, aiQuestions: 10, plannerProgress: 80, date: '2026-03-13' },
  { userId: 'demo', score: 7,  videosWatched: 3, focusTime: 45, aiQuestions: 7,  plannerProgress: 85, date: '2026-03-14' },
];

/**
 * GET /api/analytics
 * Returns all analytics records. Seeds demo data if empty.
 */
router.get('/', async (req, res, next) => {
  try {
    let records = await Analytics.find().sort({ date: 1 }).lean();

    // Seed demo data first run
    if (records.length === 0) {
      await Analytics.insertMany(DEMO_DATA);
      records = await Analytics.find().sort({ date: 1 }).lean();
    }

    // Aggregate summaries
    const totalQuestionsAttempted = records.reduce((s, r) => s + (r.score > 0 ? 8 : 0), 0);
    const averageScore   = records.length ? Math.round(records.reduce((s, r) => s + r.score, 0) / records.length * 10) / 10 : 0;
    const videosWatched  = records.reduce((s, r) => s + r.videosWatched, 0);
    const totalFocusTime = records.reduce((s, r) => s + r.focusTime, 0);

    res.json({
      success: true,
      records,
      summary: { totalQuestionsAttempted, averageScore, videosWatched, totalFocusTime },
    });
  } catch (err) {
    console.error('[analyticsRoute GET]', err.message);
    next(err);
  }
});

/**
 * POST /api/analytics
 * Save one analytics record.
 */
router.post('/', async (req, res, next) => {
  try {
    const { userId, score, videosWatched, focusTime, aiQuestions, plannerProgress, date } = req.body;
    const record = await Analytics.create({
      userId: userId || 'guest',
      score:           Number(score)           || 0,
      videosWatched:   Number(videosWatched)   || 0,
      focusTime:       Number(focusTime)       || 0,
      aiQuestions:     Number(aiQuestions)     || 0,
      plannerProgress: Number(plannerProgress) || 0,
      date: date || new Date().toISOString().split('T')[0],
    });
    res.status(201).json({ success: true, record });
  } catch (err) {
    console.error('[analyticsRoute POST]', err.message);
    next(err);
  }
});

module.exports = router;
