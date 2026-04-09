// lib/db.ts
import { Pool } from 'pg';

// Beautiful Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;