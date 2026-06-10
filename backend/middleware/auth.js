const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT Bearer token on protected routes.
 * Attach this as middleware before any admin-only handler.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorised — no token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // { id, email, iat, exp }
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expired — please log in again.'
      : 'Invalid token.';
    return res.status(401).json({ error: msg });
  }
}

module.exports = requireAuth;
