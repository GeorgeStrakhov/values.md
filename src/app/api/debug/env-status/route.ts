import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development or with special header for security
  const isDev = process.env.NODE_ENV === 'development';
  const hasDebugAuth = request.headers.get('x-debug-auth') === 'debug-values-md-env';
  
  if (!isDev && !hasDebugAuth) {
    return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  try {
    // Gather environment diagnostic information
    const envDiagnostics = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      platform: {
        isVercel: !!process.env.VERCEL,
        isNetlify: !!process.env.NETLIFY,
        isRailway: !!process.env.RAILWAY_ENVIRONMENT,
        vercelEnv: process.env.VERCEL_ENV,
        vercelUrl: process.env.VERCEL_URL
      },
      databaseConfig: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : null,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        databaseProvider: process.env.DATABASE_URL?.includes('neon.tech') ? 'neon' : 
                         process.env.DATABASE_URL?.includes('supabase') ? 'supabase' : 
                         process.env.DATABASE_URL?.includes('planetscale') ? 'planetscale' : 'unknown'
      },
      otherEnvVars: {
        hasOpenrouterKey: !!process.env.OPENROUTER_API_KEY,
        hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
        hasSiteUrl: !!process.env.SITE_URL,
        nextauthUrl: process.env.NEXTAUTH_URL
      },
      envKeys: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || 
        key.includes('POSTGRES') || 
        key.includes('NEON') ||
        key.includes('NEXTAUTH') ||
        key.includes('SITE') ||
        key.includes('VERCEL')
      ).sort()
    };

    // Try database connection test
    let databaseTest = null;
    try {
      const { db } = await import('@/lib/db');
      const { dilemmas } = await import('@/lib/schema');
      const { sql } = await import('drizzle-orm');
      
      const dilemmaCount = await db.select({ count: sql<number>`COUNT(*)` }).from(dilemmas);
      databaseTest = {
        connectionSuccess: true,
        dilemmaCount: dilemmaCount[0]?.count || 0,
        error: null
      };
    } catch (error) {
      databaseTest = {
        connectionSuccess: false,
        dilemmaCount: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    return NextResponse.json({
      status: 'debug-info',
      environment: envDiagnostics,
      database: databaseTest
    });

  } catch (error) {
    return NextResponse.json({
      status: 'debug-error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}