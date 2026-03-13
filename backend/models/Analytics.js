const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    userId:          { type: String, default: 'guest' },
    score:           { type: Number, default: 0 },   // quiz score for the session
    videosWatched:   { type: Number, default: 0 },
    focusTime:       { type: Number, default: 0 },   // minutes
    aiQuestions:     { type: Number, default: 0 },
    plannerProgress: { type: Number, default: 0 },   // % 0-100
    date:            { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);
