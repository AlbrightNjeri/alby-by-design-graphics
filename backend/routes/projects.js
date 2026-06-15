const express     = require('express');
const pool        = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── DB migrations ─────────────────────────────────────────────
async function ensureProjectColumns() {
  const migrations = [
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name   VARCHAR(255)`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_year  VARCHAR(10)`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS deliverables  TEXT`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS media_count   INTEGER DEFAULT 0`,
    `CREATE TABLE IF NOT EXISTS project_media (
      id           SERIAL PRIMARY KEY,
      project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      url          TEXT    NOT NULL,
      storage_key  TEXT,
      media_type   VARCHAR(10) NOT NULL DEFAULT 'image',
      mime_type    VARCHAR(80),
      sort_order   INTEGER DEFAULT 0,
      is_thumbnail BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON project_media(project_id)`,
  ];
  for (const sql of migrations) {
    await pool.query(sql).catch(err =>
      console.error('[projects] migration error:', err.message)
    );
  }
}
ensureProjectColumns();

// ── Helpers ───────────────────────────────────────────────────
async function attachMedia(projects) {
  if (!projects.length) return projects;
  const ids = projects.map(p => p.id);
  const { rows: media } = await pool.query(
    `SELECT * FROM project_media
     WHERE project_id = ANY($1::int[])
     ORDER BY project_id, sort_order ASC, created_at ASC`,
    [ids]
  );
  const byProject = {};
  media.forEach(m => {
    if (!byProject[m.project_id]) byProject[m.project_id] = [];
    byProject[m.project_id].push(m);
  });
  return projects.map(p => ({ ...p, media: byProject[p.id] || [] }));
}

// ── PUBLIC ROUTES ─────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    const projects  = await attachMedia(rows);
    res.json(projects);
  } catch (err) {
    console.error('[GET /projects]', err.message);
    res.status(500).json({ error: 'Failed to load projects.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
    const [project] = await attachMedia([rows[0]]);
    res.json(project);
  } catch (err) {
    console.error('[GET /projects/:id]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── ADMIN ROUTES ─────────────────────────────────────────────

router.post('/', requireAuth, async (req, res) => {
  const { title, category, description, image_url, video_url, project_url, featured,
          client_name, project_year, deliverables, thumbnail_url } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const delivStr = Array.isArray(deliverables) ? deliverables.join(', ') : (deliverables || null);
  const cover    = thumbnail_url || image_url || null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO projects
         (title, category, description, image_url, video_url, project_url, featured,
          client_name, project_year, deliverables, thumbnail_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [title, category||null, description||null, image_url||null, video_url||null,
       project_url||null, featured??false, client_name||null, project_year||null,
       delivStr, cover]
    );
    res.status(201).json({ ...rows[0], media: [] });
  } catch (err) {
    console.error('[POST /projects]', err.message);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { title, category, description, image_url, video_url, project_url, featured,
          client_name, project_year, deliverables, thumbnail_url } = req.body;

  const delivStr = deliverables === undefined ? undefined
    : Array.isArray(deliverables) ? deliverables.join(', ') : deliverables;

  try {
    const { rows } = await pool.query(
      `UPDATE projects SET
         title         = COALESCE($1,  title),
         category      = COALESCE($2,  category),
         description   = COALESCE($3,  description),
         image_url     = COALESCE($4,  image_url),
         video_url     = COALESCE($5,  video_url),
         project_url   = COALESCE($6,  project_url),
         featured      = COALESCE($7,  featured),
         client_name   = COALESCE($8,  client_name),
         project_year  = COALESCE($9,  project_year),
         deliverables  = COALESCE($10, deliverables),
         thumbnail_url = COALESCE($11, thumbnail_url)
       WHERE id = $12 RETURNING *`,
      [title||null, category||null, description||null, image_url||null, video_url||null,
       project_url||null, featured??null, client_name||null, project_year||null,
       delivStr??null, thumbnail_url||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
    const [project] = await attachMedia([rows[0]]);
    res.json(project);
  } catch (err) {
    console.error('[PUT /projects/:id]', err.message);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Project not found.' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error('[DELETE /projects/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// ── MEDIA SUB-ROUTES ─────────────────────────────────────────

router.get('/:id/media', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM project_media WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /projects/:id/media]', err.message);
    res.status(500).json({ error: 'Failed to load media.' });
  }
});

router.post('/:id/media', requireAuth, async (req, res) => {
  const { url, storage_key, media_type, mime_type, sort_order, is_thumbnail } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_thumbnail) {
      await client.query(
        'UPDATE project_media SET is_thumbnail = FALSE WHERE project_id = $1',
        [req.params.id]
      );
    }
    const { rows } = await client.query(
      `INSERT INTO project_media
         (project_id, url, storage_key, media_type, mime_type, sort_order, is_thumbnail)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, url, storage_key||null,
       media_type||'image', mime_type||null,
       sort_order||0, !!is_thumbnail]
    );
    await client.query(
      `UPDATE projects SET
         media_count   = (SELECT COUNT(*) FROM project_media WHERE project_id = $1),
         thumbnail_url = COALESCE(
           (SELECT url FROM project_media WHERE project_id = $1 AND is_thumbnail = TRUE LIMIT 1),
           (SELECT url FROM project_media WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC LIMIT 1),
           thumbnail_url
         )
       WHERE id = $1`,
      [req.params.id]
    );
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[POST /projects/:id/media]', err.message);
    res.status(500).json({ error: 'Failed to add media.' });
  } finally {
    client.release();
  }
});

router.patch('/:id/media/:mediaId', requireAuth, async (req, res) => {
  const { sort_order, is_thumbnail } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_thumbnail) {
      await client.query(
        'UPDATE project_media SET is_thumbnail = FALSE WHERE project_id = $1',
        [req.params.id]
      );
    }
    const { rows } = await client.query(
      `UPDATE project_media SET
         sort_order   = COALESCE($1, sort_order),
         is_thumbnail = COALESCE($2, is_thumbnail)
       WHERE id = $3 AND project_id = $4 RETURNING *`,
      [sort_order??null, is_thumbnail??null, req.params.mediaId, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Media not found.' });
    await client.query(
      `UPDATE projects SET
         thumbnail_url = COALESCE(
           (SELECT url FROM project_media WHERE project_id = $1 AND is_thumbnail = TRUE LIMIT 1),
           (SELECT url FROM project_media WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC LIMIT 1),
           thumbnail_url
         )
       WHERE id = $1`,
      [req.params.id]
    );
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PATCH /projects/:id/media/:mediaId]', err.message);
    res.status(500).json({ error: 'Failed to update media.' });
  } finally {
    client.release();
  }
});

router.delete('/:id/media/:mediaId', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM project_media WHERE id = $1 AND project_id = $2',
      [req.params.mediaId, req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Media not found.' });
    await pool.query(
      `UPDATE projects SET
         media_count   = (SELECT COUNT(*) FROM project_media WHERE project_id = $1),
         thumbnail_url = COALESCE(
           (SELECT url FROM project_media WHERE project_id = $1 AND is_thumbnail = TRUE LIMIT 1),
           (SELECT url FROM project_media WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC LIMIT 1)
         )
       WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /projects/:id/media/:mediaId]', err.message);
    res.status(500).json({ error: 'Failed to delete media.' });
  }
});

router.put('/:id/media/reorder', requireAuth, async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required.' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of order) {
      await client.query(
        'UPDATE project_media SET sort_order = $1 WHERE id = $2 AND project_id = $3',
        [item.sort_order, item.id, req.params.id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PUT /projects/:id/media/reorder]', err.message);
    res.status(500).json({ error: 'Failed to reorder media.' });
  } finally {
    client.release();
  }
});

module.exports = router;