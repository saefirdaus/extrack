import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/extrack_db';

export const db = drizzle(connectionString);
