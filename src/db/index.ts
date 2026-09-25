import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/extrack_db?schema=public';

const pool = new Pool({
  connectionString,
});

export const db = drizzle({ client: pool });
