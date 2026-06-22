const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,              // max pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// Test connection on startup, then run schema init using the SAME client
// so table creation completes before the pool is used elsewhere.
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Connection failed:', err.message);
    return;
  }

  console.log('[DB] PostgreSQL connected successfully');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  client.query(schema)
    .then(() => {
      console.log('[DB] Schema initialized successfully');
    })
    .catch((schemaErr) => {
      console.error('[DB] Schema init error:', schemaErr.message);
    })
    .finally(() => {
      release();
    });
});

module.exports = pool;