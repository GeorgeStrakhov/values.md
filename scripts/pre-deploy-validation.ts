#!/usr/bin/env tsx
/**
 * Pre-Deploy Validation Script
 * 
 * Comprehensive validation with nested checkmarks to ensure deployment readiness
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  details?: string;
  subChecks?: CheckResult[];
  duration?: number;
}

class ValidationRunner {
  private results: CheckResult[] = [];
  private startTime = Date.now();

  async runCommand(command: string, description: string): Promise<CheckResult> {
    const start = Date.now();
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { stdio: 'pipe' });
      
      let output = '';
      let error = '';
      
      process.stdout?.on('data', (data) => output += data.toString());
      process.stderr?.on('data', (data) => error += data.toString());
      
      process.on('close', (code) => {
        const duration = Date.now() - start;
        resolve({
          name: description,
          passed: code === 0,
          details: code === 0 ? output.slice(-200) : error.slice(-500),
          duration
        });
      });
    });
  }

  async checkDatabase(): Promise<CheckResult> {
    const subChecks: CheckResult[] = [];
    
    // Check environment variables first
    if (!process.env.DATABASE_URL) {
      return {
        name: 'Database Integrity',
        passed: false,
        details: 'DATABASE_URL not set',
        subChecks: [{
          name: 'Environment Variables',
          passed: false,
          details: 'DATABASE_URL missing'
        }]
      };
    }
    
    try {
      const { db } = await import('../src/lib/db');
      const { motifs, frameworks, dilemmas } = await import('../src/lib/schema');
      
      // Check motifs
      const motifData = await db.select().from(motifs).limit(1);
      subChecks.push({
        name: 'Motifs table populated',
        passed: motifData.length > 0,
        details: `Found ${motifData.length} motifs`
      });

      // Check frameworks
      const frameworkData = await db.select().from(frameworks).limit(1);
      subChecks.push({
        name: 'Frameworks table populated',
        passed: frameworkData.length > 0,
        details: `Found ${frameworkData.length} frameworks`
      });

      // Check dilemmas
      const dilemmaData = await db.select().from(dilemmas).limit(1);
      subChecks.push({
        name: 'Dilemmas table populated',
        passed: dilemmaData.length > 0,
        details: `Found ${dilemmaData.length} dilemmas`
      });

      // Check motif metadata quality
      if (motifData.length > 0) {
        const motif = motifData[0];
        subChecks.push({
          name: 'Motif metadata complete',
          passed: !!(motif.behavioralIndicators && motif.logicalPatterns && motif.description),
          details: motif.behavioralIndicators ? 'Rich metadata present' : 'Missing behavioral indicators'
        });
      }

      const allPassed = subChecks.every(check => check.passed);
      
      return {
        name: 'Database Integrity',
        passed: allPassed,
        subChecks,
        details: allPassed ? 'All database checks passed' : 'Some database checks failed'
      };
    } catch (error) {
      return {
        name: 'Database Integrity',
        passed: false,
        details: `Database connection failed: ${error}`,
        subChecks: []
      };
    }
  }

  async checkFileSystem(): Promise<CheckResult> {
    const subChecks: CheckResult[] = [];
    
    // Check critical files
    const criticalFiles = [
      'src/app/page.tsx',
      'src/app/explore/[uuid]/page.tsx',
      'src/app/results/page.tsx',
      'src/store/dilemma-store.ts',
      'src/lib/db.ts',
      'src/lib/schema.ts',
      'striated/motifs.csv',
      'striated/frameworks.csv',
      'striated/dilemmas.csv'
    ];

    for (const file of criticalFiles) {
      subChecks.push({
        name: `${file}`,
        passed: existsSync(join(process.cwd(), file)),
        details: existsSync(join(process.cwd(), file)) ? 'Present' : 'Missing'
      });
    }

    // Check package.json integrity
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      subChecks.push({
        name: 'package.json valid',
        passed: true,
        details: `Version ${packageJson.version}`
      });
    } catch (error) {
      subChecks.push({
        name: 'package.json valid',
        passed: false,
        details: 'Invalid JSON'
      });
    }

    // Check environment variables
    const requiredEnvVars = ['DATABASE_URL'];
    for (const envVar of requiredEnvVars) {
      subChecks.push({
        name: `${envVar} set`,
        passed: !!process.env[envVar],
        details: process.env[envVar] ? 'Configured' : 'Missing'
      });
    }

    const allPassed = subChecks.every(check => check.passed);
    
    return {
      name: 'File System & Configuration',
      passed: allPassed,
      subChecks
    };
  }

  async checkCodeQuality(): Promise<CheckResult> {
    const subChecks: CheckResult[] = [];
    
    // TypeScript compilation
    const tscResult = await this.runCommand('npm run typecheck', 'TypeScript compilation');
    subChecks.push(tscResult);
    
    // ESLint
    const lintResult = await this.runCommand('npm run lint', 'ESLint validation');
    subChecks.push(lintResult);
    
    // Build process
    const buildResult = await this.runCommand('npm run build', 'Next.js build');
    subChecks.push(buildResult);

    const allPassed = subChecks.every(check => check.passed);
    
    return {
      name: 'Code Quality',
      passed: allPassed,
      subChecks,
      details: allPassed ? 'All quality checks passed' : 'Some quality checks failed'
    };
  }

  async checkTestSuite(): Promise<CheckResult> {
    const subChecks: CheckResult[] = [];
    
    // Unit tests
    const unitResult = await this.runCommand('npm run test:run', 'Unit & Integration tests');
    subChecks.push(unitResult);
    
    // E2E tests (if server is running)
    try {
      const e2eResult = await this.runCommand('npm run test:e2e', 'End-to-end tests');
      subChecks.push(e2eResult);
    } catch (error) {
      subChecks.push({
        name: 'End-to-end tests',
        passed: false,
        details: 'Server not running or E2E tests failed'
      });
    }

    const allPassed = subChecks.every(check => check.passed);
    
    return {
      name: 'Test Suite',
      passed: allPassed,
      subChecks,
      details: allPassed ? 'All tests passed' : 'Some tests failed'
    };
  }

  async checkAPIEndpoints(): Promise<CheckResult> {
    const subChecks: CheckResult[] = [];
    
    const endpoints = [
      { path: '/api/health', expected: 200 },
      { path: '/api/dilemmas/random', expected: [200, 302, 307] }, // Redirect is OK
      { path: '/api/generate-values', method: 'POST', body: { sessionId: 'test' }, expected: [404] }, // 404 is expected for non-existent session
    ];

    for (const endpoint of endpoints) {
      try {
        const baseURL = process.env.BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseURL}${endpoint.path}`, {
          method: endpoint.method || 'GET',
          headers: endpoint.body ? { 'Content-Type': 'application/json' } : {},
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
        });

        const expectedStatuses = Array.isArray(endpoint.expected) ? endpoint.expected : [endpoint.expected];
        const passed = expectedStatuses.includes(response.status);
        
        subChecks.push({
          name: `${endpoint.method || 'GET'} ${endpoint.path}`,
          passed,
          details: `Status: ${response.status} (expected: ${expectedStatuses.join(' or ')})`
        });
      } catch (error) {
        subChecks.push({
          name: `${endpoint.method || 'GET'} ${endpoint.path}`,
          passed: false,
          details: `Request failed: ${error}`
        });
      }
    }

    const allPassed = subChecks.every(check => check.passed);
    
    return {
      name: 'API Endpoints',
      passed: allPassed,
      subChecks,
      details: allPassed ? 'All endpoints responding' : 'Some endpoints not responding'
    };
  }

  async checkCriticalUserFlow(): Promise<CheckResult> {
    const subChecks: CheckResult[] = [];
    
    if (!process.env.DATABASE_URL) {
      return {
        name: 'Critical User Flow Prerequisites',
        passed: false,
        details: 'DATABASE_URL not set - cannot check user flow',
        subChecks: []
      };
    }
    
    // This would be a simplified version - full E2E tests would be more comprehensive
    try {
      const { db } = await import('../src/lib/db');
      const { motifs, frameworks, dilemmas } = await import('../src/lib/schema');
      
      // Test database seeding worked
      const motifCount = await db.select().from(motifs);
      const frameworkCount = await db.select().from(frameworks);
      const dilemmaCount = await db.select().from(dilemmas);
      
      subChecks.push({
        name: 'Seed data available',
        passed: motifCount.length > 0 && frameworkCount.length > 0 && dilemmaCount.length > 0,
        details: `${motifCount.length} motifs, ${frameworkCount.length} frameworks, ${dilemmaCount.length} dilemmas`
      });

      // Test motif data quality (the bug we had)
      const motifWithMetadata = motifCount.find(m => m.behavioralIndicators && m.logicalPatterns);
      subChecks.push({
        name: 'Motif metadata quality',
        passed: !!motifWithMetadata,
        details: motifWithMetadata ? 'Rich psychological data present' : 'Missing behavioral indicators'
      });

      // Test that CSV paths are correct (the bug we had)
      const csvFiles = ['striated/motifs.csv', 'striated/frameworks.csv', 'striated/dilemmas.csv'];
      const csvChecks = csvFiles.map(file => ({
        name: `${file} accessible`,
        passed: existsSync(file),
        details: existsSync(file) ? 'Present' : 'Missing - check seed script paths'
      }));
      subChecks.push(...csvChecks);

      const allPassed = subChecks.every(check => check.passed);
      
      return {
        name: 'Critical User Flow Prerequisites',
        passed: allPassed,
        subChecks,
        details: allPassed ? 'User flow prerequisites met' : 'Critical prerequisites missing'
      };
    } catch (error) {
      return {
        name: 'Critical User Flow Prerequisites',
        passed: false,
        details: `Flow check failed: ${error}`,
        subChecks: []
      };
    }
  }

  renderCheck(check: CheckResult, depth = 0): void {
    const indent = '  '.repeat(depth);
    const icon = check.passed ? '✅' : '❌';
    const duration = check.duration ? ` (${check.duration}ms)` : '';
    
    console.log(`${indent}${icon} ${check.name}${duration}`);
    
    if (check.details && (!check.passed || process.env.VERBOSE)) {
      console.log(`${indent}   ${check.details}`);
    }
    
    if (check.subChecks) {
      check.subChecks.forEach(subCheck => this.renderCheck(subCheck, depth + 1));
    }
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Pre-Deploy Validation...\n');

    // Run all checks
    const checks = [
      await this.checkFileSystem(),
      await this.checkDatabase(),
      await this.checkCodeQuality(),
      await this.checkAPIEndpoints(),
      await this.checkCriticalUserFlow(),
      // Note: Test suite check would require server to be running
    ];

    // Render results
    console.log('📋 Validation Results:\n');
    
    checks.forEach(check => {
      this.renderCheck(check);
      console.log(); // Empty line between main checks
    });

    // Summary
    const totalDuration = Date.now() - this.startTime;
    const totalChecks = checks.length + checks.reduce((sum, check) => sum + (check.subChecks?.length || 0), 0);
    const passedChecks = checks.filter(c => c.passed).length + 
                        checks.reduce((sum, check) => sum + (check.subChecks?.filter(sc => sc.passed).length || 0), 0);

    console.log('📊 Summary:');
    console.log(`   Total checks: ${totalChecks}`);
    console.log(`   Passed: ${passedChecks}`);
    console.log(`   Failed: ${totalChecks - passedChecks}`);
    console.log(`   Duration: ${totalDuration}ms`);

    const allPassed = checks.every(check => check.passed);
    
    if (allPassed) {
      console.log('\n🎉 All validations passed! Ready for deployment.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some validations failed. Review issues before deploying.');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const runner = new ValidationRunner();
  runner.run().catch(error => {
    console.error('💥 Validation runner failed:', error);
    process.exit(1);
  });
}

export default ValidationRunner;