import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

export function createDatabase() {
  if (!process.env.DATABASE_URL) return null;
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool, { schema });
}

export const db = createDatabase();
