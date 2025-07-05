import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas, userResponses, llmResponses } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface CanaryCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details: any;
  timestamp: string;
  critical: boolean;
}

export async function GET(request: NextRequest) {
  const checks: CanaryCheck[] = [];
  const startTime = Date.now();

  try {
    // 1. Deployment Version Check
    checks.push(await checkDeploymentVersion());
    
    // 2. Database State Hygiene
    checks.push(await checkDatabaseStateHygiene());
    
    // 3. State Transitions & Sync Health
    checks.push(await checkStateTransitions());
    
    // 4. Data Lifecycle Integrity
    checks.push(await checkDataLifecycle());
    
    // 5. Live Test Results
    checks.push(await checkLiveTestResults());
    
    // 6. Critical Path Validation
    checks.push(await checkCriticalPaths());
    
    // 7. System Resource Health
    checks.push(await checkSystemResources());
    
    // 8. API Endpoint Liveness
    checks.push(await checkAPILiveness());

    const overallStatus = checks.some(c => c.status === 'fail' && c.critical) ? 'critical' :
                         checks.some(c => c.status === 'fail') ? 'degraded' :
                         checks.some(c => c.status === 'warning') ? 'warning' : 'healthy';

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      checks,
      summary: {
        total: checks.length,
        passed: checks.filter(c => c.status === 'pass').length,
        warnings: checks.filter(c => c.status === 'warning').length,
        failures: checks.filter(c => c.status === 'fail').length,
        critical: checks.filter(c => c.status === 'fail' && c.critical).length
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      error: String(error),
      checks: []
    }, { status: 500 });
  }
}

async function checkDeploymentVersion(): Promise<CanaryCheck> {
  try {
    // Get current commit hash
    const currentCommit = execSync('git rev-parse HEAD').toString().trim();
    const shortCommit = currentCommit.substring(0, 8);
    
    // Get current branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    // Check if there are uncommitted changes
    const hasUncommittedChanges = execSync('git status --porcelain').toString().trim().length > 0;
    
    // Check last commit timestamp
    const lastCommitTime = execSync('git log -1 --format="%ci"').toString().trim();
    const commitAge = Date.now() - new Date(lastCommitTime).getTime();
    const hoursOld = Math.floor(commitAge / (1000 * 60 * 60));
    
    // Try to fetch remote status (non-critical)
    let remoteStatus = 'unknown';
    let remoteDrift = 0;
    try {
      const remoteCommit = execSync('git rev-parse origin/main').toString().trim();
      remoteDrift = remoteCommit !== currentCommit ? 1 : 0;
      remoteStatus = remoteDrift > 0 ? 'behind' : 'current';
    } catch (e) {
      remoteStatus = 'cannot_fetch';
    }

    const isStale = hoursOld > 24;
    const status = hasUncommittedChanges ? 'warning' : 
                  isStale ? 'warning' : 
                  remoteDrift > 0 ? 'warning' : 'pass';

    return {
      name: 'Deployment Version',
      status,
      message: `Running ${shortCommit} on ${currentBranch} (${hoursOld}h old)`,
      details: {
        commit: currentCommit,
        shortCommit,
        branch: currentBranch,
        commitTime: lastCommitTime,
        ageHours: hoursOld,
        uncommittedChanges: hasUncommittedChanges,
        remoteStatus,
        remoteDrift,
        isStale
      },
      timestamp: new Date().toISOString(),
      critical: false
    };
  } catch (error) {
    return {
      name: 'Deployment Version',
      status: 'fail',
      message: 'Cannot determine deployment version',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: true
    };
  }
}

async function checkDatabaseStateHygiene(): Promise<CanaryCheck> {
  try {
    // Check for orphaned records
    const orphanedResponses = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM user_responses ur 
      LEFT JOIN dilemmas d ON ur.dilemma_id = d.dilemma_id 
      WHERE d.dilemma_id IS NULL
    `);

    // Check for data consistency
    const dataConsistency = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM dilemmas) as dilemma_count,
        (SELECT COUNT(*) FROM user_responses) as response_count,
        (SELECT COUNT(DISTINCT session_id) FROM user_responses) as session_count,
        (SELECT COUNT(*) FROM llm_responses) as llm_count
    `);

    // Check for session integrity
    const sessionIntegrity = await db.execute(sql`
      SELECT session_id, COUNT(*) as response_count
      FROM user_responses 
      GROUP BY session_id 
      HAVING COUNT(*) > 50
      LIMIT 5
    `);

    const orphanCount = Number(orphanedResponses[0]?.count || 0);
    const stats = dataConsistency[0] as any;
    const suspiciousSessions = sessionIntegrity.length;

    const status = orphanCount > 0 ? 'fail' : 
                  suspiciousSessions > 0 ? 'warning' : 'pass';

    return {
      name: 'Database State Hygiene',
      status,
      message: `${orphanCount} orphaned records, ${suspiciousSessions} suspicious sessions`,
      details: {
        orphanedRecords: orphanCount,
        dataStats: stats,
        suspiciousSessions: sessionIntegrity,
        integrityScore: orphanCount === 0 ? 100 : Math.max(0, 100 - orphanCount * 10)
      },
      timestamp: new Date().toISOString(),
      critical: orphanCount > 100
    };
  } catch (error) {
    return {
      name: 'Database State Hygiene',
      status: 'fail',
      message: 'Database hygiene check failed',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: true
    };
  }
}

async function checkStateTransitions(): Promise<CanaryCheck> {
  try {
    // Check localStorage state structure
    const stateStructure = {
      expectedKeys: ['responses', 'dilemma-session', 'generated-values'],
      structures: {
        'responses': 'array of response objects',
        'dilemma-session': 'session metadata',
        'generated-values': 'string markdown'
      }
    };

    // Check session state transitions (by analyzing recent responses)
    const recentSessions = await db.execute(sql`
      SELECT 
        session_id,
        COUNT(*) as response_count,
        MIN(created_at) as started_at,
        MAX(created_at) as last_response,
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as session_duration
      FROM user_responses 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY session_id
      ORDER BY last_response DESC
      LIMIT 10
    `);

    // Analyze session patterns
    const sessionMetrics = recentSessions.map((session: any) => ({
      sessionId: session.session_id,
      responseCount: Number(session.response_count),
      durationMinutes: Math.round(Number(session.session_duration) / 60),
      completed: Number(session.response_count) >= 4,
      abandoned: Number(session.response_count) < 4 && Number(session.session_duration) > 600 // 10+ min with <4 responses
    }));

    const abandonedSessions = sessionMetrics.filter(s => s.abandoned).length;
    const completedSessions = sessionMetrics.filter(s => s.completed).length;
    const completionRate = recentSessions.length > 0 ? 
      (completedSessions / recentSessions.length * 100).toFixed(1) : 'N/A';

    const status = abandonedSessions > completedSessions ? 'warning' : 'pass';

    return {
      name: 'State Transitions & Sync',
      status,
      message: `${completionRate}% completion rate, ${abandonedSessions} abandoned sessions`,
      details: {
        stateStructure,
        recentSessions: sessionMetrics,
        metrics: {
          totalSessions: recentSessions.length,
          completedSessions,
          abandonedSessions,
          completionRate: completionRate + '%'
        }
      },
      timestamp: new Date().toISOString(),
      critical: false
    };
  } catch (error) {
    return {
      name: 'State Transitions & Sync',
      status: 'fail',
      message: 'State transition check failed',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: false
    };
  }
}

async function checkDataLifecycle(): Promise<CanaryCheck> {
  try {
    // Map the complete data lifecycle
    const lifecycle = {
      stages: [
        { name: 'User Landing', checkpoint: 'Page load' },
        { name: 'Dilemma Loading', checkpoint: '/api/dilemmas/random' },
        { name: 'Response Collection', checkpoint: 'localStorage storage' },
        { name: 'Database Storage', checkpoint: '/api/responses' },
        { name: 'VALUES Generation', checkpoint: '/api/generate-values*' },
        { name: 'File Download', checkpoint: 'Blob creation' }
      ]
    };

    // Check data flow integrity
    const dataFlowCheck = await db.execute(sql`
      WITH lifecycle_stats AS (
        SELECT 
          'responses_collected' as stage,
          COUNT(*) as count,
          MAX(created_at) as last_activity
        FROM user_responses
        WHERE created_at > NOW() - INTERVAL '24 hours'
        
        UNION ALL
        
        SELECT 
          'values_generated' as stage,
          COUNT(*) as count,
          MAX(created_at) as last_activity
        FROM llm_responses
        WHERE created_at > NOW() - INTERVAL '24 hours'
      )
      SELECT * FROM lifecycle_stats
    `);

    // Check for data retention and cleanup
    const retentionCheck = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as records
      FROM user_responses 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    const flowStats = dataFlowCheck.reduce((acc: any, row: any) => {
      acc[row.stage] = { count: Number(row.count), lastActivity: row.last_activity };
      return acc;
    }, {});

    const responsesCount = flowStats.responses_collected?.count || 0;
    const valuesCount = flowStats.values_generated?.count || 0;
    const conversionRate = responsesCount > 0 ? 
      ((valuesCount / responsesCount) * 100).toFixed(1) : 'N/A';

    const status = responsesCount === 0 ? 'warning' : 'pass';

    return {
      name: 'Data Lifecycle Integrity',
      status,
      message: `${responsesCount} responses → ${valuesCount} VALUES.md (${conversionRate}% conversion)`,
      details: {
        lifecycle,
        flowStats,
        retentionPattern: retentionCheck,
        metrics: {
          dailyResponses: responsesCount,
          dailyValuesGenerated: valuesCount,
          conversionRate: conversionRate + '%'
        }
      },
      timestamp: new Date().toISOString(),
      critical: false
    };
  } catch (error) {
    return {
      name: 'Data Lifecycle Integrity',
      status: 'fail',
      message: 'Data lifecycle check failed',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: false
    };
  }
}

async function checkLiveTestResults(): Promise<CanaryCheck> {
  try {
    // Run a live test of the critical path
    const testResults = [];

    // Test 1: Can we get a random dilemma?
    try {
      const testResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dilemmas/random`);
      testResults.push({
        test: 'Random Dilemma API',
        status: testResponse.ok ? 'pass' : 'fail',
        responseCode: testResponse.status,
        timing: Date.now()
      });
    } catch (e) {
      testResults.push({
        test: 'Random Dilemma API',
        status: 'fail',
        error: String(e),
        timing: Date.now()
      });
    }

    // Test 2: Can we check system status?
    try {
      const statusResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/system-status`);
      testResults.push({
        test: 'System Status API',
        status: statusResponse.ok ? 'pass' : 'fail',
        responseCode: statusResponse.status,
        timing: Date.now()
      });
    } catch (e) {
      testResults.push({
        test: 'System Status API',
        status: 'fail',
        error: String(e),
        timing: Date.now()
      });
    }

    const passedTests = testResults.filter(t => t.status === 'pass').length;
    const totalTests = testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    const status = passedTests === totalTests ? 'pass' : 
                  passedTests > 0 ? 'warning' : 'fail';

    return {
      name: 'Live Test Results',
      status,
      message: `${passedTests}/${totalTests} tests passing (${successRate}%)`,
      details: {
        testResults,
        summary: {
          total: totalTests,
          passed: passedTests,
          failed: totalTests - passedTests,
          successRate: successRate + '%'
        }
      },
      timestamp: new Date().toISOString(),
      critical: passedTests === 0
    };
  } catch (error) {
    return {
      name: 'Live Test Results',
      status: 'fail',
      message: 'Live testing failed',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: true
    };
  }
}

async function checkCriticalPaths(): Promise<CanaryCheck> {
  try {
    const criticalPaths = [
      { path: '/api/dilemmas/random', description: 'Random dilemma generation' },
      { path: '/api/responses', description: 'Response storage' },
      { path: '/api/generate-values-combinatorial', description: 'Primary VALUES.md generation' },
      { path: '/api/health', description: 'Health monitoring' }
    ];

    // Check if critical files exist
    const criticalFiles = [
      'src/lib/combinatorial-values-generator.ts',
      'src/lib/db.ts',
      'src/lib/schema.ts',
      'src/components/system-state.tsx'
    ];

    const fileChecks = criticalFiles.map(file => {
      const fullPath = path.join(process.cwd(), file);
      return {
        file,
        exists: fs.existsSync(fullPath),
        size: fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0
      };
    });

    const missingFiles = fileChecks.filter(f => !f.exists);
    const status = missingFiles.length > 0 ? 'fail' : 'pass';

    return {
      name: 'Critical Path Validation',
      status,
      message: `${criticalPaths.length} paths mapped, ${missingFiles.length} missing files`,
      details: {
        criticalPaths,
        fileChecks,
        missingFiles
      },
      timestamp: new Date().toISOString(),
      critical: missingFiles.length > 0
    };
  } catch (error) {
    return {
      name: 'Critical Path Validation',
      status: 'fail',
      message: 'Critical path check failed',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: true
    };
  }
}

async function checkSystemResources(): Promise<CanaryCheck> {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const resourceStats = {
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      uptime: {
        seconds: Math.round(uptime),
        hours: Math.round(uptime / 3600),
        formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
      },
      nodejs: process.version,
      platform: process.platform
    };

    const memoryUsagePercent = (resourceStats.memory.used / resourceStats.memory.total) * 100;
    const status = memoryUsagePercent > 90 ? 'warning' : 'pass';

    return {
      name: 'System Resources',
      status,
      message: `${resourceStats.memory.used}MB used, ${resourceStats.uptime.formatted} uptime`,
      details: resourceStats,
      timestamp: new Date().toISOString(),
      critical: false
    };
  } catch (error) {
    return {
      name: 'System Resources',
      status: 'fail',
      message: 'Resource check failed',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: false
    };
  }
}

async function checkAPILiveness(): Promise<CanaryCheck> {
  try {
    // Check database connection
    const dbCheck = await db.execute(sql`SELECT 1 as alive`);
    const dbAlive = dbCheck[0]?.alive === 1;

    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY
    };

    const missingEnvVars = Object.entries(envCheck).filter(([_, exists]) => !exists);
    const status = !dbAlive ? 'fail' : 
                  missingEnvVars.length > 1 ? 'warning' : 'pass';

    return {
      name: 'API Liveness',
      status,
      message: `DB: ${dbAlive ? 'connected' : 'failed'}, ${missingEnvVars.length} missing env vars`,
      details: {
        database: dbAlive,
        environment: envCheck,
        missingEnvVars: missingEnvVars.map(([key]) => key)
      },
      timestamp: new Date().toISOString(),
      critical: !dbAlive
    };
  } catch (error) {
    return {
      name: 'API Liveness',
      status: 'fail',
      message: 'API liveness check failed',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      critical: true
    };
  }
}