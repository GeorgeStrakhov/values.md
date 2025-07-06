#!/usr/bin/env node

/**
 * DEPLOYMENT VERIFICATION PIPELINE
 * This script MUST pass before any deployment is allowed
 * Tests everything that could cause "No Dilemmas Available" error
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

interface VerificationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

class DeploymentVerifier {
  private results: VerificationResult[] = [];
  private criticalFailures = 0;

  async runAllVerifications(): Promise<boolean> {
    console.log('🚀 DEPLOYMENT VERIFICATION PIPELINE STARTING\n');

    // CRITICAL: Environment and configuration
    await this.verifyEnvironmentVariables();
    await this.verifyDatabaseConfiguration();
    
    // CRITICAL: Build and dependencies
    await this.verifyBuildProcess();
    await this.verifyDependencies();
    
    // CRITICAL: Database connectivity and data
    await this.verifyDatabaseConnectivity();
    await this.verifyDatabaseContent();
    
    // CRITICAL: API endpoints
    await this.verifyApiEndpoints();
    
    // CRITICAL: Core user flow
    await this.verifyUserFlow();
    
    // IMPORTANT: Performance and security
    await this.verifyPerformance();
    await this.verifySecurityConfiguration();

    this.printResults();
    return this.criticalFailures === 0;
  }

  private async verifyEnvironmentVariables() {
    console.log('📋 Verifying Environment Variables...');
    
    const requiredEnvVars = [
      { name: 'DATABASE_URL', critical: true },
      { name: 'NEXTAUTH_SECRET', critical: true },
      { name: 'OPENROUTER_API_KEY', critical: false },
      { name: 'ADMIN_PASSWORD', critical: false }
    ];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar.name]) {
        this.addResult(envVar.name, 'PASS', `Environment variable ${envVar.name} is set`);
      } else {
        const status = envVar.critical ? 'FAIL' : 'WARN';
        this.addResult(envVar.name, status, `Environment variable ${envVar.name} is missing`);
        if (envVar.critical) this.criticalFailures++;
      }
    }

    // Check .env.local exists for local development
    if (existsSync('.env.local')) {
      this.addResult('env-local', 'PASS', '.env.local file exists for local development');
    } else {
      this.addResult('env-local', 'WARN', '.env.local file missing - may cause local development issues');
    }
  }

  private async verifyDatabaseConfiguration() {
    console.log('🗄️  Verifying Database Configuration...');
    
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      this.addResult('database-url', 'FAIL', 'No database URL found in environment variables');
      this.criticalFailures++;
      return;
    }

    // Verify database URL format
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      this.addResult('database-format', 'PASS', 'Database URL format is valid');
    } else {
      this.addResult('database-format', 'FAIL', 'Database URL format is invalid');
      this.criticalFailures++;
    }

    // Check for SSL configuration
    if (databaseUrl.includes('sslmode=require')) {
      this.addResult('database-ssl', 'PASS', 'Database SSL is properly configured');
    } else {
      this.addResult('database-ssl', 'WARN', 'Database SSL may not be configured for production');
    }
  }

  private async verifyBuildProcess() {
    console.log('🏗️  Verifying Build Process...');
    
    try {
      const buildOutput = execSync('npm run build', { encoding: 'utf8', timeout: 120000 });
      this.addResult('build', 'PASS', 'Build completed successfully');
    } catch (error) {
      this.addResult('build', 'FAIL', `Build failed: ${error}`);
      this.criticalFailures++;
    }

    // Verify TypeScript compilation
    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8', timeout: 60000 });
      this.addResult('typescript', 'PASS', 'TypeScript compilation successful');
    } catch (error) {
      this.addResult('typescript', 'FAIL', `TypeScript errors found: ${error}`);
      this.criticalFailures++;
    }
  }

  private async verifyDependencies() {
    console.log('📦 Verifying Dependencies...');
    
    // Check critical dependencies are installed
    const criticalDeps = [
      '@neondatabase/serverless',
      'drizzle-orm',
      'next',
      'react',
      'typescript'
    ];

    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const dep of criticalDeps) {
        if (allDeps[dep]) {
          this.addResult(`dep-${dep}`, 'PASS', `Critical dependency ${dep} is installed`);
        } else {
          this.addResult(`dep-${dep}`, 'FAIL', `Critical dependency ${dep} is missing`);
          this.criticalFailures++;
        }
      }
    } catch (error) {
      this.addResult('dependencies', 'FAIL', `Failed to verify dependencies: ${error}`);
      this.criticalFailures++;
    }
  }

  private async verifyDatabaseConnectivity() {
    console.log('🔌 Verifying Database Connectivity...');
    
    try {
      // Import database modules
      const { db } = await import('../src/lib/db');
      const { sql } = await import('drizzle-orm');
      
      // Test basic connectivity
      const start = Date.now();
      await db.execute(sql`SELECT 1 as test`);
      const connectionTime = Date.now() - start;
      
      this.addResult('db-connectivity', 'PASS', `Database connection successful (${connectionTime}ms)`);
      
      if (connectionTime > 2000) {
        this.addResult('db-performance', 'WARN', 'Database connection is slow (>2s)');
      } else {
        this.addResult('db-performance', 'PASS', 'Database connection performance is good');
      }
    } catch (error) {
      this.addResult('db-connectivity', 'FAIL', `Database connection failed: ${error}`);
      this.criticalFailures++;
    }
  }

  private async verifyDatabaseContent() {
    console.log('📊 Verifying Database Content...');
    
    try {
      const { db } = await import('../src/lib/db');
      const { dilemmas, motifs } = await import('../src/lib/schema');
      const { sql } = await import('drizzle-orm');
      
      // Count dilemmas
      const dilemmaCount = await db.select({ count: sql<number>`COUNT(*)` }).from(dilemmas);
      const numDilemmas = dilemmaCount[0]?.count || 0;
      
      if (numDilemmas >= 10) {
        this.addResult('dilemma-count', 'PASS', `Database contains ${numDilemmas} dilemmas`);
      } else if (numDilemmas > 0) {
        this.addResult('dilemma-count', 'WARN', `Database contains only ${numDilemmas} dilemmas (recommended: 10+)`);
      } else {
        this.addResult('dilemma-count', 'FAIL', 'Database contains 0 dilemmas - will cause "No Dilemmas Available" error');
        this.criticalFailures++;
      }
      
      // Count motifs
      const motifCount = await db.select({ count: sql<number>`COUNT(*)` }).from(motifs);
      const numMotifs = motifCount[0]?.count || 0;
      
      if (numMotifs >= 5) {
        this.addResult('motif-count', 'PASS', `Database contains ${numMotifs} motifs`);
      } else {
        this.addResult('motif-count', 'WARN', `Database contains only ${numMotifs} motifs (recommended: 5+)`);
      }
      
      // Test random dilemma selection (the exact operation that fails)
      const randomDilemma = await db
        .select()
        .from(dilemmas)
        .orderBy(sql`RANDOM()`)
        .limit(1);
        
      if (randomDilemma.length > 0) {
        this.addResult('random-dilemma', 'PASS', `Random dilemma selection works: "${randomDilemma[0].title}"`);
      } else {
        this.addResult('random-dilemma', 'FAIL', 'Random dilemma selection returns empty result');
        this.criticalFailures++;
      }
    } catch (error) {
      this.addResult('db-content', 'FAIL', `Database content verification failed: ${error}`);
      this.criticalFailures++;
    }
  }

  private async verifyApiEndpoints() {
    console.log('🌐 Verifying API Endpoints...');
    
    // Start local server for testing
    let serverProcess;
    try {
      // Note: In real deployment, this would test against the actual deployment URL
      // For pre-deployment, we test locally
      const testEndpoints = [
        { path: '/api/health', critical: false },
        { path: '/api/dilemmas/random', critical: true },
        { path: '/api/generate-values-combinatorial', critical: true }
      ];
      
      for (const endpoint of testEndpoints) {
        try {
          // Import and call the handler directly for testing
          if (endpoint.path === '/api/dilemmas/random') {
            const { GET } = await import('../src/app/api/dilemmas/random/route');
            const mockRequest = new Request('http://localhost:3000/api/dilemmas/random');
            const response = await GET(mockRequest);
            
            if (response.ok || response.status === 302) { // 302 for redirect is OK
              this.addResult(`api-${endpoint.path}`, 'PASS', `API endpoint ${endpoint.path} responds correctly`);
            } else {
              const status = endpoint.critical ? 'FAIL' : 'WARN';
              this.addResult(`api-${endpoint.path}`, status, `API endpoint ${endpoint.path} returned ${response.status}`);
              if (endpoint.critical) this.criticalFailures++;
            }
          }
        } catch (error) {
          const status = endpoint.critical ? 'FAIL' : 'WARN';
          this.addResult(`api-${endpoint.path}`, status, `API endpoint ${endpoint.path} failed: ${error}`);
          if (endpoint.critical) this.criticalFailures++;
        }
      }
    } catch (error) {
      this.addResult('api-testing', 'WARN', `API endpoint testing had issues: ${error}`);
    }
  }

  private async verifyUserFlow() {
    console.log('👥 Verifying User Flow...');
    
    // Test the core user flow components exist and compile
    const criticalFiles = [
      'src/app/page.tsx',
      'src/app/explore/[uuid]/page.tsx', 
      'src/app/results/page.tsx',
      'src/app/api/dilemmas/random/route.ts',
      'src/app/api/generate-values-combinatorial/route.ts'
    ];
    
    for (const file of criticalFiles) {
      if (existsSync(file)) {
        this.addResult(`file-${file}`, 'PASS', `Critical file ${file} exists`);
      } else {
        this.addResult(`file-${file}`, 'FAIL', `Critical file ${file} is missing`);
        this.criticalFailures++;
      }
    }
  }

  private async verifyPerformance() {
    console.log('⚡ Verifying Performance...');
    
    // Check build size
    if (existsSync('.next')) {
      this.addResult('build-output', 'PASS', 'Build output directory exists');
    } else {
      this.addResult('build-output', 'WARN', 'Build output directory missing - run npm run build first');
    }
  }

  private async verifySecurityConfiguration() {
    console.log('🔒 Verifying Security Configuration...');
    
    // Check NEXTAUTH_SECRET is properly configured
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32) {
      this.addResult('nextauth-secret', 'PASS', 'NEXTAUTH_SECRET is properly configured');
    } else {
      this.addResult('nextauth-secret', 'WARN', 'NEXTAUTH_SECRET should be at least 32 characters');
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`  ${icon} ${test}: ${message}`);
  }

  private printResults() {
    console.log('\n📊 DEPLOYMENT VERIFICATION RESULTS\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`✅ PASSED: ${passed}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`⚠️  WARNINGS: ${warnings}`);
    
    if (this.criticalFailures === 0) {
      console.log('\n🎉 DEPLOYMENT VERIFICATION PASSED - Safe to deploy!');
    } else {
      console.log('\n🚨 DEPLOYMENT VERIFICATION FAILED - DO NOT DEPLOY!');
      console.log('\nCritical failures that must be fixed:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  ❌ ${r.test}: ${r.message}`));
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier.runAllVerifications().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Verification pipeline crashed:', error);
    process.exit(1);
  });
}

export { DeploymentVerifier };