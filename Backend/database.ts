import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => {
  logger.error('Unexpected DB pool error', { error: err.message });
});

/** Run a single query, returning rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  logger.debug('Query executed', {
    text: text.slice(0, 80),
    duration: Date.now() - start,
    rows: result.rowCount,
  });
  return result.rows;
}

/** Run a single query that returns one row or null. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Execute multiple queries inside a transaction. */
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export { pool };
