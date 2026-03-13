const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { parseIntent } = require('../services/intentParser');

/**
 * POST /api/parse-intent
 * ──────────────────────
 * Takes a raw natural-language intent string and returns:
 *  - parsed: structured intent (category, topic, duration, tasks, tags, …)
 *  - plan:   full workspace plan (rich task objects, timer config, blocked sites)
 *
 * Body:
 *   { "intent": "Prepare React interview for 2 hours and block distractions" }
 *
 * Success 200:
 *   {
 *     "success": true,
 *     "parsed": { category, topic, duration, tasks, tags, distractionBlock, rawIntent },
 *     "plan":   { tasks, timerSettings, distractionBlocking, blockedSites, … }
 *   }
 *
 * Error 400: validation failure
 * Error 500: unexpected server error
 */
router.post(
  '/',
  // ── Input validation ─────────────────────────────────────────────────────
  [
    body('intent')
      .trim()
      .notEmpty()
      .withMessage('intent is required')
      .isLength({ min: 3, max: 500 })
      .withMessage('intent must be between 3 and 500 characters'),
  ],

  async (req, res, next) => {
    // ── Validation errors ──────────────────────────────────────────────────
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
      });
    }

    try {
      const { intent } = req.body;
      console.log(`\n[POST /parse-intent] Raw intent: "${intent}"`);

      // ── Step 1: Parse intent via OpenAI (or fallback) ──────────────────
      const parsed = await parseIntent(intent);

      // ── Step 2: The parsed JSON IS the full workspace plan ──────────────────
      const plan = parsed;

      console.log(
        `[POST /parse-intent] Done processing intent.`
      );

      // ── Step 3: Return combined response ───────────────────────────────
      return res.status(200).json({
        success: true,
        parsed,
        plan,
      });

    } catch (err) {
      next(err); // forwarded to global errorHandler middleware
    }
  }
);

module.exports = router;
