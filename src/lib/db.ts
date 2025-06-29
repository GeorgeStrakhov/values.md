import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Allow build-time execution without DATABASE_URL during static analysis
if (!process.env.DATABASE_URL && typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  console.warn('DATABASE_URL is not set - database operations will fail at runtime');
}

function createDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql);
}

// Lazy database connection for build compatibility
let _db: ReturnType<typeof drizzle> | null = null;
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!_db) {
      _db = createDatabase();
    }
    return _db[prop as keyof typeof _db];
  }
});