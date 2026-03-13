const mongoose = require('mongoose');

/**
 * Intent Model
 * Stores user-submitted intents and the AI-generated workspace plan.
 *
 * Example document:
 * {
 *   userId: ObjectId,
 *   rawIntent: "Prepare React interview for 2 hours and block distractions",
 *   parsedIntent: { topic: "React Interview", duration: 120, mode: "focus" },
 *   workspacePlan: { tasks: [], resources: [], timerSettings: {} },
 *   status: "active",
 *   createdAt: Date
 * }
 */

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const IntentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow anonymous for demo
    },
    rawIntent: {
      type: String,
      required: [true, 'Intent text is required'],
      trim: true,
      maxlength: [500, 'Intent cannot exceed 500 characters'],
    },
    parsedIntent: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    workspacePlan: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    aiSummary: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Intent', IntentSchema);
