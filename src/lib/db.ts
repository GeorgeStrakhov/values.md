import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Allow build-time execution without DATABASE_URL during static analysis
if (!process.env.DATABASE_URL && typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  console.warn('DATABASE_URL is not set - database operations will fail at runtime');
}

function createDatabase() {
  // Try multiple environment variable names for database URL
  const databaseUrl = process.env.DATABASE_URL || 
                     process.env.POSTGRES_URL || 
                     process.env.NEON_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Database URL not found. Checked environment variables:', {
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL, 
      NEON_DATABASE_URL: !!process.env.NEON_DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      availableEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('NEON'))
    });
    throw new Error('DATABASE_URL is not set - database connection failed');
  }
  
  console.log('✅ Database connection configured:', {
    provider: databaseUrl.includes('neon.tech') ? 'Neon' : 'Other',
    hasSSL: databaseUrl.includes('sslmode=require'),
    NODE_ENV: process.env.NODE_ENV
  });
  
  const sql = neon(databaseUrl);
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