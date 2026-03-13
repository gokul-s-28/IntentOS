const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Auth Middleware (placeholder)
 * Protects routes by verifying the JWT in the Authorization header.
 *
 * Usage: router.get('/protected', protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorised – no token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorised – token invalid or expired' });
  }
};

module.exports = { protect };
