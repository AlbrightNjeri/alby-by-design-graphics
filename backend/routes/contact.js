const express     = require('express');
const pool        = require('../db/pool');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ──────────────────────────────────────────────────────────────
// CONTACT FORM (public)
// ──────────────────────────────────────────────────────────────

/**
 * POST /api/contact
 * Body: { name, email, company, subject, budget, message }
 * Frontend sends 'subject' as the service type selected in the form.
 */
router.post('/contact', async (req, res) => {
  const { name, email, company, subject, budget, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO contact_inquiries (name, email, company, subject, budget, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        company?.trim() || null,
        subject || null,
        budget || null,
        message.trim()
      ]
    );

    console.log(`[contact] New inquiry #${rows[0].id} from ${email}`);
    res.status(201).json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error('[POST /contact]', err.message);
    res.status(500).json({ error: 'Could not save your message. Please try again.' });
  }
});

// ──────────────────────────────────────────────────────────────
// INQUIRIES MANAGEMENT (admin)
// ──────────────────────────────────────────────────────────────

const VALID_STATUSES = ['new', 'contacted', 'closed'];

/**
 * GET /api/inquiries   [Auth required]
 * Returns all contact submissions, newest first.
 */
router.get('/inquiries', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM contact_inquiries ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /inquiries]', err.message);
    res.status(500).json({ error: 'Failed to load inquiries.' });
  }
});

/**
 * PATCH /api/inquiries/:id   [Auth required]
 * Body: { status: 'new' | 'contacted' | 'closed' }
 */
router.patch('/inquiries/:id', requireAuth, async (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`
    });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE contact_inquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /inquiries/:id]', err.message);
    res.status(500).json({ error: 'Failed to update inquiry.' });
  }
});

/**
 * DELETE /api/inquiries/:id   [Auth required]
 */
router.delete('/inquiries/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM contact_inquiries WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /inquiries/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete inquiry.' });
  }
});

module.exports = router;
