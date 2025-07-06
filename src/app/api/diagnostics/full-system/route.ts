import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  
  // Security: Only allow with special header or in development
  const isDev = process.env.NODE_ENV === 'development';
  const hasDebugAuth = request.headers.get('x-debug-auth') === 'values-md-full-diagnostic';
  
  if (!isDev && !hasDebugAuth) {
    return NextResponse.json({ 
      error: 'Full system diagnostics requires authentication',
      hint: 'Add x-debug-auth: values-md-full-diagnostic header'
    }, { status: 403 });
  }

  const diagnostics = {
    timestamp,
    systemInfo: {
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
    },
    
    deploymentPlatform: {
      isVercel: !!process.env.VERCEL,
      isNetlify: !!process.env.NETLIFY,
      isRailway: !!process.env.RAILWAY_ENVIRONMENT,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      vercelRegion: process.env.VERCEL_REGION,
    },

    environmentVariables: {
      // Database
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasNeonDatabaseUrl: !!process.env.NEON_DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : null,
      
      // Auth & APIs
      hasOpenrouterKey: !!process.env.OPENROUTER_API_KEY,
      openrouterKeyPrefix: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) + '...' : null,
      hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      
      // URLs
      nextauthUrl: process.env.NEXTAUTH_URL,
      siteUrl: process.env.SITE_URL,
      
      // All environment keys containing relevant terms
      relevantEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || 
        key.includes('POSTGRES') || 
        key.includes('NEON') ||
        key.includes('NEXTAUTH') ||
        key.includes('OPENROUTER') ||
        key.includes('SITE') ||
        key.includes('VERCEL') ||
        key.includes('URL')
      ).sort()
    }
  };

  // Test database connection
  let databaseDiagnostics = null;
  try {
    const { db } = await import('@/lib/db');
    const { dilemmas, motifs } = await import('@/lib/schema');
    const { sql } = await import('drizzle-orm');
    
    // Test basic connectivity
    const connectionStart = Date.now();
    const dilemmaCount = await db.select({ count: sql<number>`COUNT(*)` }).from(dilemmas);
    const motifCount = await db.select({ count: sql<number>`COUNT(*)` }).from(motifs);
    const connectionTime = Date.now() - connectionStart;
    
    // Test random dilemma selection (core functionality)
    const randomDilemmaStart = Date.now();
    const randomDilemma = await db
      .select()
      .from(dilemmas)
      .orderBy(sql`RANDOM()`)
      .limit(1);
    const randomDilemmaTime = Date.now() - randomDilemmaStart;

    databaseDiagnostics = {
      connectionSuccess: true,
      connectionTime: connectionTime,
      dilemmaCount: dilemmaCount[0]?.count || 0,
      motifCount: motifCount[0]?.count || 0,
      randomDilemmaTest: {
        success: randomDilemma.length > 0,
        time: randomDilemmaTime,
        dilemmaTitle: randomDilemma[0]?.title || null,
        dilemmaId: randomDilemma[0]?.dilemmaId || null
      },
      error: null
    };
  } catch (error) {
    databaseDiagnostics = {
      connectionSuccess: false,
      connectionTime: null,
      dilemmaCount: 0,
      motifCount: 0,
      randomDilemmaTest: {
        success: false,
        time: null,
        dilemmaTitle: null,
        dilemmaId: null
      },
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      } : String(error)
    };
  }

  // Test API endpoints
  const apiEndpointTests = {};
  const testEndpoints = [
    '/api/health',
    '/api/dilemmas/random',
    '/api/examples'
  ];

  for (const endpoint of testEndpoints) {
    try {
      const testStart = Date.now();
      const baseUrl = new URL(request.url).origin;
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'internal-diagnostic'
        }
      });
      const testTime = Date.now() - testStart;
      
      apiEndpointTests[endpoint] = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime: testTime,
        contentType: response.headers.get('content-type')
      };
    } catch (error) {
      apiEndpointTests[endpoint] = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseTime: null
      };
    }
  }

  return NextResponse.json({
    status: 'full-system-diagnostic',
    system: diagnostics,
    database: databaseDiagnostics,
    apiEndpoints: apiEndpointTests,
    recommendations: generateRecommendations(diagnostics, databaseDiagnostics, apiEndpointTests)
  });
}

function generateRecommendations(system: any, database: any, api: any): string[] {
  const recommendations = [];

  // Environment variable issues
  if (!system.environmentVariables.hasDatabaseUrl && 
      !system.environmentVariables.hasPostgresUrl && 
      !system.environmentVariables.hasNeonDatabaseUrl) {
    recommendations.push('🚨 CRITICAL: No database URL environment variable found');
  }

  // Database connection issues
  if (!database?.connectionSuccess) {
    recommendations.push('🚨 CRITICAL: Database connection failed - check DATABASE_URL and network connectivity');
  } else if (database.dilemmaCount === 0) {
    recommendations.push('⚠️  WARNING: Database connected but contains 0 dilemmas - run database seeding');
  }

  // API endpoint issues
  Object.entries(api).forEach(([endpoint, result]: [string, any]) => {
    if (!result.success) {
      recommendations.push(`🚨 API FAILURE: ${endpoint} returned ${result.status || 'error'}`);
    }
  });

  // Performance warnings
  if (database?.connectionTime > 1000) {
    recommendations.push('⚠️  PERFORMANCE: Database connection is slow (>1s)');
  }

  // Platform-specific recommendations
  if (system.deploymentPlatform.isVercel && !system.environmentVariables.hasDatabaseUrl) {
    recommendations.push('💡 VERCEL: Set DATABASE_URL in Vercel dashboard environment variables');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All systems appear healthy');
  }

  return recommendations;
}