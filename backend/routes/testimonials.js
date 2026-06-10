const express     = require('express');
const pool        = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Ensure table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS testimonials (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    role       VARCHAR(255),
    text       TEXT NOT NULL,
    rating     INTEGER DEFAULT 5,
    initials   VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('[testimonials] table init error:', err.message));

// GET /api/testimonials  (public — used by index.html)
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM testimonials ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    console.error('[GET /testimonials]', err.message);
    res.status(500).json({ error: 'Failed to load testimonials.' });
  }
});

// POST /api/testimonials  [Auth required]
router.post('/', requireAuth, async (req, res) => {
  const { name, role, text, rating, initials } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'Name and text are required.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO testimonials (name, role, text, rating, initials)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, role || '', text, rating || 5, initials || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[POST /testimonials]', err.message);
    res.status(500).json({ error: 'Failed to create testimonial.' });
  }
});

// PUT /api/testimonials/:id  [Auth required]
router.put('/:id', requireAuth, async (req, res) => {
  const { name, role, text, rating, initials } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE testimonials SET
         name     = COALESCE($1, name),
         role     = COALESCE($2, role),
         text     = COALESCE($3, text),
         rating   = COALESCE($4, rating),
         initials = COALESCE($5, initials)
       WHERE id = $6 RETURNING *`,
      [name, role, text, rating, initials, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[PUT /testimonials/:id]', err.message);
    res.status(500).json({ error: 'Failed to update testimonial.' });
  }
});

// DELETE /api/testimonials/:id  [Auth required]
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Testimonial not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /testimonials/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete testimonial.' });
  }
});

module.exports = router;