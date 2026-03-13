const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');

/** Helper: Sign JWT */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, preferences: user.preferences },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Login and get JWT
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, preferences: user.preferences },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile (JWT in Authorization header)
 * @access  Private
 */
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided.' });

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, data: user });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(error);
  }
});

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided.' });

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, email, role, interestedFields } = req.body;
    const update = {};
    if (name)             update.name             = name.trim();
    if (email)            update.email            = email.toLowerCase().trim();
    if (role)             update.role             = role.trim();
    if (Array.isArray(interestedFields)) update.interestedFields = interestedFields;

    const user = await User.findByIdAndUpdate(decoded.id, update, {
      new: true, runValidators: true, select: '-password',
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, data: user, message: 'Profile updated successfully!' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(error);
  }
});

module.exports = router;

