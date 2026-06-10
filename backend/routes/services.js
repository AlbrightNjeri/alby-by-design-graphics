const express     = require('express');
const pool        = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

/**
 * Ensure the services table exists.
 * Mirrors the pattern used by testimonials.js.
 */
pool.query(`
  CREATE TABLE IF NOT EXISTS services (
    id          SERIAL PRIMARY KEY,
    icon        VARCHAR(20)  DEFAULT '✦',
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    items       TEXT,           -- comma-separated list of service items
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('[services] table init error:', err.message));

// ── Helpers ────────────────────────────────────────────────────

/** Convert stored comma-separated string → array for the API response. */
function parseItems(itemsStr) {
  if (!itemsStr) return [];
  return itemsStr.split(',').map(s => s.trim()).filter(Boolean);
}

/** Normalise inbound items: accept array or comma-separated string → store as string. */
function serialiseItems(items) {
  if (!items) return null;
  return Array.isArray(items)
    ? items.join(', ')
    : String(items);
}

function formatService(row) {
  return { ...row, items: parseItems(row.items) };
}

// ── PUBLIC ──────────────────────────────────────────────────────

/**
 * GET /api/services
 * Returns all services ordered by sort_order, then creation date.
 */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM services ORDER BY sort_order ASC, created_at ASC'
    );
    res.json(rows.map(formatService));
  } catch (err) {
    console.error('[GET /services]', err.message);
    res.status(500).json({ error: 'Failed to load services.' });
  }
});

/**
 * GET /api/services/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Service not found.' });
    res.json(formatService(rows[0]));
  } catch (err) {
    console.error('[GET /services/:id]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── ADMIN ───────────────────────────────────────────────────────

/**
 * POST /api/services  [Auth required]
 * Body: { icon, title, description, items, sort_order }
 */
router.post('/', requireAuth, async (req, res) => {
  const { icon, title, description, items, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO services (icon, title, description, items, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        icon        || '✦',
        title.trim(),
        description || null,
        serialiseItems(items),
        sort_order  || 0,
      ]
    );
    res.status(201).json(formatService(rows[0]));
  } catch (err) {
    console.error('[POST /services]', err.message);
    res.status(500).json({ error: 'Failed to create service.' });
  }
});

/**
 * PUT /api/services/:id  [Auth required]
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { icon, title, description, items, sort_order } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE services
       SET icon        = COALESCE($1, icon),
           title       = COALESCE($2, title),
           description = COALESCE($3, description),
           items       = COALESCE($4, items),
           sort_order  = COALESCE($5, sort_order)
       WHERE id = $6
       RETURNING *`,
      [
        icon        || null,
        title       || null,
        description !== undefined ? description : null,
        items       !== undefined ? serialiseItems(items) : null,
        sort_order  !== undefined ? sort_order : null,
        req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Service not found.' });
    res.json(formatService(rows[0]));
  } catch (err) {
    console.error('[PUT /services/:id]', err.message);
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

/**
 * DELETE /api/services/:id  [Auth required]
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Service not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /services/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

module.exports = router;