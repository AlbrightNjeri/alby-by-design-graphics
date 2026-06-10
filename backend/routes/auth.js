const express  = require('express');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const pool     = require('../db/pool');

const router = express.Router();

/**
 * POST /api/login
 * Body: { email, password }
 * Returns: { token }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    const user = rows[0];
    if (!user) {
      // Consistent response to prevent email enumeration
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, admin: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

/**
 * POST /api/register-admin  (use once to seed first admin, then remove or lock down)
 * Body: { email, password, secret }
 * Requires ADMIN_SEED_SECRET env var to prevent public access
 */
router.post('/register-admin', async (req, res) => {
  const { email, password, secret } = req.body;

  if (secret !== process.env.ADMIN_SEED_SECRET) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and password (min 8 chars) required.' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.toLowerCase().trim(), hash]
    );
    res.status(201).json({ admin: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    console.error('[register-admin]', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
