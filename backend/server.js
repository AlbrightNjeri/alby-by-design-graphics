require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// ── Route handlers ───────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const projectRoutes      = require('./routes/projects');
const contactRoutes      = require('./routes/contact');
const uploadRoutes       = require('./routes/upload');
const contentRoutes      = require('./routes/content');
const testimonialsRoutes = require('./routes/testimonials');
const servicesRoutes     = require('./routes/services');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ─────────────────────────────────────────────────────────
// In production, replace with your actual domain(s).
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://alby-by-design-graphics.vercel.app',
  'https://alby-by-design-graphics.onrender.com',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, same-origin in prod)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Upload timeout — give large video uploads up to 5 minutes ────
app.use('/api/upload', (req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

// ── Static frontend ───────────────────────────────────────────────
// Serve index.html + assets from the project root (one level up).
// Adjust this path if your folder layout differs.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────
app.use('/api',          authRoutes);     // POST /api/login, /api/register-admin
app.use('/api/projects', projectRoutes);  // GET|POST|PUT|DELETE /api/projects
app.use('/api',          contactRoutes);  // POST /api/contact, GET|PATCH /api/inquiries
app.use('/api/upload',   uploadRoutes);   // POST /api/upload
app.use('/api/content',      contentRoutes);      // GET|PUT /api/content/about, /api/content/logo
app.use('/api/testimonials', testimonialsRoutes); // GET|POST|PUT|DELETE /api/testimonials
app.use('/api/services',     servicesRoutes);     // GET|POST|PUT|DELETE /api/services

// ── SPA fallback — serve index.html for any unmatched GET ─────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;