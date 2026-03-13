require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const intentRoutes    = require('./routes/intent');
const workspaceRoutes = require('./routes/workspace');
const userRoutes      = require('./routes/user');
const parseIntentRoute = require('./routes/parseIntent');
const chatRoutes      = require('./routes/chatRoutes');
const mcqRoutes       = require('./routes/mcqRoutes');
const notesRoutes     = require('./routes/notesRoutes');
const sessionRoutes   = require('./routes/sessionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ──────────────────────────────
//  Middleware
// ──────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ──────────────────────────────
//  Routes
// ──────────────────────────────
app.use('/api/intents',        intentRoutes);
app.use('/generate-workspace', intentRoutes); // Legacy alias used by current frontend
app.use('/generate-content',   intentRoutes); // Alias to match prompt's POST /generate-content
app.use('/api/workspace',    workspaceRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/parse-intent', parseIntentRoute);
app.use('/api/chat',         chatRoutes);
app.use('/api/mcq',          mcqRoutes);
app.use('/api/notes',        notesRoutes);
app.use('/api/sessions',     sessionRoutes);
app.use('/api/analytics',    analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IntentOS API is running 🚀', timestamp: new Date() });
});

// ──────────────────────────────
//  Error Handler (must be last)
// ──────────────────────────────
app.use(errorHandler);

// Bind to a fixed port to avoid clashing with any other app configuration.
// We intentionally ignore process.env.PORT here so the frontend proxy can rely
// on a stable backend URL.
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 IntentOS Server running on http://localhost:${PORT}`);
});
