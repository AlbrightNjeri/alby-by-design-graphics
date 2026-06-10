const express     = require('express');
const pool        = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/projects
 * Public — returns all projects ordered newest first.
 * Frontend expects an array; falls back to static data if empty/error.
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /projects]', err.message);
    res.status(500).json({ error: 'Failed to load projects.' });
  }
});

/**
 * GET /api/projects/:id
 * Public — single project by id.
 */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[GET /projects/:id]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * POST /api/projects   [Auth required]
 * Body: { title, category, description, image_url, video_url, project_url, featured }
 */
router.post('/', requireAuth, async (req, res) => {
  const { title, category, description, image_url, video_url, project_url, featured } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO projects (title, category, description, image_url, video_url, project_url, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, category || null, description || null, image_url || null, video_url || null, project_url || null, featured ?? false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[POST /projects]', err.message);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

/**
 * PUT /api/projects/:id   [Auth required]
 * Body: any subset of project fields
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { title, category, description, image_url, video_url, project_url, featured } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE projects
       SET title       = COALESCE($1, title),
           category    = COALESCE($2, category),
           description = COALESCE($3, description),
           image_url   = COALESCE($4, image_url),
           video_url   = COALESCE($5, video_url),
           project_url = COALESCE($6, project_url),
           featured    = COALESCE($7, featured)
       WHERE id = $8
       RETURNING *`,
      [title, category, description, image_url, video_url, project_url, featured, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[PUT /projects/:id]', err.message);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

/**
 * DELETE /api/projects/:id   [Auth required]
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Project not found.' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error('[DELETE /projects/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

module.exports = router;
