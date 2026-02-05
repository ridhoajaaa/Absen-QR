const { Pool } = require("pg");
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "attendance",
  port: process.env.PGPORT || 5432
});

async function init() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      created_at TIMESTAMP DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS qr_sessions (
      id UUID PRIMARY KEY,
      token TEXT NOT NULL,
      label TEXT,
      created_at TIMESTAMP DEFAULT now(),
      expires_at TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      qr_session_id UUID REFERENCES qr_sessions(id),
      check_in TIMESTAMP,
      check_out TIMESTAMP,
      lat NUMERIC,
      lng NUMERIC,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  init,
  pool
};
