#!/usr/bin/env tsx
/**
 * Health Check Script
 * 
 * Quick validation for CI/CD and monitoring
 */


interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  details: string;
  timestamp: string;
}

async function runHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  const timestamp = new Date().toISOString();

  // Check environment variables first
  if (!process.env.DATABASE_URL) {
    checks.push({
      name: 'Environment Variables',
      status: 'fail',
      details: 'DATABASE_URL not set',
      timestamp
    });
    return checks; // Return early if env vars missing
  }

  // Database connectivity
  try {
    const { db } = await import('../src/lib/db');
    const { motifs, frameworks, dilemmas } = await import('../src/lib/schema');
    
    await db.select().from(motifs).limit(1);
    checks.push({
      name: 'Database Connection',
      status: 'pass',
      details: 'Connected successfully',
      timestamp
    });

    // Seed data presence
    const [motifCount, frameworkCount, dilemmaCount] = await Promise.all([
      db.select().from(motifs),
      db.select().from(frameworks), 
      db.select().from(dilemmas)
    ]);

    checks.push({
      name: 'Seed Data',
      status: motifCount.length > 0 && frameworkCount.length > 0 && dilemmaCount.length > 0 ? 'pass' : 'fail',
      details: `${motifCount.length} motifs, ${frameworkCount.length} frameworks, ${dilemmaCount.length} dilemmas`,
      timestamp
    });

    // Data quality check
    const motifWithMetadata = motifCount.find((m: any) => m.behavioralIndicators && m.logicalPatterns);
    checks.push({
      name: 'Data Quality',
      status: motifWithMetadata ? 'pass' : 'fail',
      details: motifWithMetadata ? 'Rich metadata present' : 'Missing behavioral indicators',
      timestamp
    });
    
  } catch (error) {
    checks.push({
      name: 'Database Connection', 
      status: 'fail',
      details: `Connection failed: ${error}`,
      timestamp
    });
    return checks; // Return early if DB is down
  }


  // API endpoints (if BASE_URL is set)
  if (process.env.BASE_URL) {
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/health`);
      checks.push({
        name: 'API Health',
        status: response.ok ? 'pass' : 'fail',
        details: `Status: ${response.status}`,
        timestamp
      });
    } catch (error) {
      checks.push({
        name: 'API Health',
        status: 'fail',
        details: `Request failed: ${error}`,
        timestamp
      });
    }
  }

  return checks;
}

async function main() {
  console.log('🏥 Running Health Checks...\n');
  
  const checks = await runHealthChecks();
  
  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.details}`);
  });

  const failedChecks = checks.filter(c => c.status === 'fail');
  
  console.log(`\n📊 ${checks.length - failedChecks.length}/${checks.length} checks passed`);
  
  if (failedChecks.length > 0) {
    console.log('⚠️  Health check failures detected');
    process.exit(1);
  } else {
    console.log('✅ All health checks passed');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Health check failed:', error);
    process.exit(1);
  });
}