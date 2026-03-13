const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model
 * Stores user accounts with hashed passwords.
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      default: 'Student',
      trim: true,
    },
    interestedFields: {
      type: [String],
      default: [],
    },
    preferences: {
      defaultFocusDuration: { type: Number, default: 25 },
      defaultBreakDuration: { type: Number, default: 5 },
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      notifications: { type: Boolean, default: true },
    },
    intentsCount: { type: Number, default: 0 },
    totalFocusMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
