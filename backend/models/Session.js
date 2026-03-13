const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    intent:   { type: String, required: true, trim: true },
    startTime:           { type: Date, required: true },
    endTime:             { type: Date, default: null },
    totalTime:           { type: Number, default: 0 },   // seconds
    activeTime:          { type: Number, default: 0 },   // seconds
    idleTime:            { type: Number, default: 0 },   // seconds
    distractionAttempts: { type: Number, default: 0 },
    productivityScore:   { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Auto-compute productivity score before save
SessionSchema.pre('save', function (next) {
  const { activeTime, totalTime, distractionAttempts } = this;
  if (totalTime > 0) {
    const activeRatio      = Math.min(activeTime / totalTime, 1);
    const distractionRatio = Math.min(distractionAttempts, 10) / 10;
    const raw = activeRatio * 70 + (1 - distractionRatio) * 30;
    this.productivityScore = Math.max(0, Math.min(100, Math.round(raw)));
  }
  next();
});

module.exports = mongoose.model('Session', SessionSchema);
