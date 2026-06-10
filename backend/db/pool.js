const { Pool } = require('pg');

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

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Connection failed:', err.message);
  } else {
    console.log('[DB] PostgreSQL connected successfully');
    release();
  }
});

module.exports = pool;

// Auto-create tables on startup
const fs = require('fs');
const path = require('path');
pool.connect().then(client => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  return client.query(schema).finally(() => client.release());
}).catch(err => console.error('[DB] Schema init error:', err.message));
