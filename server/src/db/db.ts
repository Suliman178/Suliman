import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

export const hasDatabase = Boolean(process.env.DATABASE_URL);
export const pool = hasDatabase
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } })
  : null;
export const db = pool ? drizzle(pool, { schema }) : null;
