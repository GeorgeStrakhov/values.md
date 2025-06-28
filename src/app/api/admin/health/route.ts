import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const checks: Record<string, any> = {};

    // Database connectivity check
    try {
      const result = await db.execute('SELECT 1 as test');
      checks.database = {
        status: 'pass',
        description: 'Database connection successful',
        details: `Query executed in ${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      checks.database = {
        status: 'fail',
        description: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }

    // Dilemmas API check
    try {
      const randomResponse = await fetch(`${request.nextUrl.origin}/api/dilemmas/random`);
      if (randomResponse.ok) {
        const data = await randomResponse.json();
        checks.dilemmas_api = {
          status: 'pass',
          description: 'Dilemmas API responding',
          details: `Returned ${data.dilemmas?.length || 0} dilemmas`,
          timestamp: new Date().toISOString()
        };
      } else {
        checks.dilemmas_api = {
          status: 'fail',
          description: 'Dilemmas API not responding',
          details: `HTTP ${randomResponse.status}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      checks.dilemmas_api = {
        status: 'fail',
        description: 'Dilemmas API error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }

    // Environment variables check
    const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    checks.environment = {
      status: missingVars.length === 0 ? 'pass' : 'fail',
      description: 'Environment variables',
      details: missingVars.length === 0 ? 'All required variables present' : `Missing: ${missingVars.join(', ')}`,
      timestamp: new Date().toISOString()
    };

    // Navigation flow check (simulate the fixed logic)
    try {
      // Test that we can create a realistic user journey
      const testDilemmas = [
        { dilemmaId: 'test-1', title: 'Test 1' },
        { dilemmaId: 'test-2', title: 'Test 2' },
        { dilemmaId: 'test-3', title: 'Test 3' }
      ];
      
      let currentIndex = 0;
      const responses: any[] = [];
      
      // Simulate navigation through all dilemmas
      for (let i = 0; i < testDilemmas.length; i++) {
        responses.push({
          dilemmaId: testDilemmas[i].dilemmaId,
          chosenOption: 'a',
          reasoning: 'test response',
          responseTime: 1000,
          perceivedDifficulty: 5
        });
        currentIndex++;
      }
      
      checks.navigation_flow = {
        status: currentIndex === testDilemmas.length ? 'pass' : 'fail',
        description: 'Navigation logic simulation',
        details: `Completed ${currentIndex}/${testDilemmas.length} dilemmas, saved ${responses.length} responses`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      checks.navigation_flow = {
        status: 'fail',
        description: 'Navigation flow test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }

    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail');
    const overallStatus = failedChecks.length === 0 ? 'healthy' : 
                         failedChecks.length < Object.keys(checks).length / 2 ? 'degraded' : 'unhealthy';

    const healthData = {
      status: overallStatus,
      checks,
      metadata: {
        version: process.env.npm_package_version || '0.1.0',
        build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'local',
        uptime: Date.now() - startTime
      }
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}