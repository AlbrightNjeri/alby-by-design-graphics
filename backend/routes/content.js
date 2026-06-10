const express     = require('express');
const pool        = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

/**
 * Ensure the site_content table exists.
 * key VARCHAR(100) PRIMARY KEY, value TEXT, updated_at TIMESTAMP
 * This is a simple key-value store for singleton site content.
 */
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key        VARCHAR(100) PRIMARY KEY,
      value      TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
ensureTable().catch(err => console.error('[site_content] table init error:', err.message));

// ── Helpers ────────────────────────────────────────────────────
async function getContent(key) {
  const { rows } = await pool.query('SELECT value FROM site_content WHERE key = $1', [key]);
  if (!rows[0]) return null;
  try { return JSON.parse(rows[0].value); } catch { return rows[0].value; }
}

async function setContent(key, value) {
  const serialised = typeof value === 'string' ? value : JSON.stringify(value);
  await pool.query(`
    INSERT INTO site_content (key, value, updated_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
  `, [key, serialised]);
}

async function deleteContent(key) {
  await pool.query('DELETE FROM site_content WHERE key = $1', [key]);
}

// ── ABOUT ME ────────────────────────────────────────────────────

// GET /api/content/about  (public — used by index.html)
router.get('/about', async (_req, res) => {
  try {
    const data = await getContent('about');
    res.json(data || {});
  } catch (err) {
    console.error('[GET /content/about]', err.message);
    res.status(500).json({ error: 'Failed to load About Me content.' });
  }
});

// PUT /api/content/about  [Auth required]
router.put('/about', requireAuth, async (req, res) => {
  const { title, subtitle, description, image_url } = req.body;
  try {
    const payload = { title: title || '', subtitle: subtitle || '', description: description || '', image_url: image_url || '' };
    await setContent('about', payload);
    res.json(payload);
  } catch (err) {
    console.error('[PUT /content/about]', err.message);
    res.status(500).json({ error: 'Failed to save About Me content.' });
  }
});

// ── LOGO ────────────────────────────────────────────────────────

// GET /api/content/logo  (public — used by index.html)
router.get('/logo', async (_req, res) => {
  try {
    const data = await getContent('logo');
    res.json(data || {});
  } catch (err) {
    console.error('[GET /content/logo]', err.message);
    res.status(500).json({ error: 'Failed to load logo.' });
  }
});

// PUT /api/content/logo  [Auth required]
router.put('/logo', requireAuth, async (req, res) => {
  const { image_url } = req.body;
  if (!image_url) return res.status(400).json({ error: 'image_url is required.' });
  try {
    await setContent('logo', { image_url });
    res.json({ image_url });
  } catch (err) {
    console.error('[PUT /content/logo]', err.message);
    res.status(500).json({ error: 'Failed to save logo.' });
  }
});

// DELETE /api/content/logo  [Auth required]
router.delete('/logo', requireAuth, async (req, res) => {
  try {
    await deleteContent('logo');
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /content/logo]', err.message);
    res.status(500).json({ error: 'Failed to remove logo.' });
  }
});

module.exports = router;