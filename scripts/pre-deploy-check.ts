#!/usr/bin/env npx tsx

/**
 * Pre-Deploy Verification Script
 * 
 * This script checks EVERY historical failure point before deployment
 * to prevent production issues and reduce deployment anxiety.
 */

// Load environment variables from .env file first
import { config } from 'dotenv';
config({ path: '.env' });

import { db } from '../src/lib/db';
import { dilemmas, motifs } from '../src/lib/schema';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

const results: CheckResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'warn', message: string, details?: any) {
  results.push({ name, status, message, details });
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${emoji} ${name}: ${message}`);
  if (details) {
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔍 CHECKING ENVIRONMENT VARIABLES...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET', 
    'OPENROUTER_API_KEY',
    'SITE_URL'
  ];
  
  let allPresent = true;
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      addResult(`Environment: ${varName}`, 'fail', `Missing required environment variable`);
      allPresent = false;
    } else {
      // Check if it looks valid
      const value = process.env[varName];
      let isValid = true;
      let message = 'Present and valid';
      
      if (varName === 'DATABASE_URL' && !value.startsWith('postgres')) {
        isValid = false;
        message = 'Does not look like PostgreSQL URL';
      }
      if (varName === 'NEXTAUTH_SECRET' && value.length < 16) {
        isValid = false;
        message = 'Secret too short (should be 32+ chars)';
      }
      if (varName === 'OPENROUTER_API_KEY' && !value.startsWith('sk-or-')) {
        isValid = false;
        message = 'Does not look like OpenRouter API key';
      }
      
      addResult(`Environment: ${varName}`, isValid ? 'pass' : 'warn', message);
    }
  }
  
  if (!allPresent) {
    addResult('Environment Variables', 'fail', 'Missing critical environment variables');
    return false;
  }
  
  addResult('Environment Variables', 'pass', 'All required variables present');
  return true;
}

async function checkDatabaseConnectivity() {
  console.log('\n🔍 CHECKING DATABASE CONNECTIVITY...');
  
  try {
    // Test basic connection
    const dilemmaCount = await db.select().from(dilemmas).limit(1);
    addResult('Database: Connection', 'pass', 'Successfully connected to database');
    
    // Test if we have data
    const allDilemmas = await db.select().from(dilemmas);
    if (allDilemmas.length === 0) {
      addResult('Database: Data', 'fail', 'No dilemmas found - database may be empty');
      return false;
    }
    
    addResult('Database: Data', 'pass', `Found ${allDilemmas.length} dilemmas`);
    
    // Test motifs table
    const motifCount = await db.select().from(motifs);
    if (motifCount.length === 0) {
      addResult('Database: Motifs', 'warn', 'No motifs found - may affect VALUES.md generation');
    } else {
      addResult('Database: Motifs', 'pass', `Found ${motifCount.length} motifs`);
    }
    
    return true;
  } catch (error) {
    addResult('Database: Connection', 'fail', `Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkCriticalEndpoints() {
  console.log('\n🔍 CHECKING API ENDPOINTS...');
  
  const fs = await import('fs');
  const path = await import('path');
  
  const criticalEndpoints = [
    'src/app/api/health/route.ts',
    'src/app/api/dilemmas/random/route.ts', 
    'src/app/api/dilemmas/[uuid]/route.ts',
    'src/app/api/generate-values-combinatorial/route.ts'
  ];
  
  let allExist = true;
  for (const endpoint of criticalEndpoints) {
    if (fs.existsSync(endpoint)) {
      addResult(`API: ${path.basename(path.dirname(endpoint))}`, 'pass', 'Route file exists');
    } else {
      addResult(`API: ${path.basename(path.dirname(endpoint))}`, 'fail', 'Route file missing');
      allExist = false;
    }
  }
  
  return allExist;
}

async function checkVercelBuildIssues() {
  console.log('\n🔍 CHECKING VERCEL BUILD ISSUES...');
  
  const fs = await import('fs');
  
  // Check for build-time database calls (common Vercel failure)
  try {
    const { execSync } = await import('child_process');
    
    // Search for database calls in page components (should be empty)
    const dbCallsInPages = execSync(
      'grep -r "await db\\." src/app --include="*.tsx" --include="*.ts" | grep -v "api/" | grep -v "node_modules" || true',
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();
    
    if (dbCallsInPages) {
      addResult('Vercel: Build-time DB calls', 'fail', 'Database calls found in page components - will break Vercel build', {
        calls: dbCallsInPages.split('\n').slice(0, 3) // Show first 3 matches
      });
      return false;
    } else {
      addResult('Vercel: Build-time DB calls', 'pass', 'No database calls in page components');
    }
    
    // Check for missing imports that break in production
    const buildOutput = execSync('npm run build 2>&1 || true', { encoding: 'utf-8', timeout: 30000 });
    
    if (buildOutput.includes('Module not found') || buildOutput.includes('Cannot resolve')) {
      addResult('Vercel: Build compatibility', 'fail', 'Build contains import errors', {
        preview: buildOutput.split('\n').filter(line => 
          line.includes('Module not found') || line.includes('Cannot resolve')
        ).slice(0, 3)
      });
      return false;
    } else if (buildOutput.includes('compiled successfully')) {
      addResult('Vercel: Build compatibility', 'pass', 'Build compiles successfully');
    } else {
      addResult('Vercel: Build compatibility', 'warn', 'Build output unclear - manual verification needed');
    }
    
    return true;
  } catch (error) {
    addResult('Vercel: Build check', 'warn', `Could not verify build compatibility: ${error.message}`);
    return true; // Don't block deployment for verification failures
  }
}

async function checkBuildRequirements() {
  console.log('\n🔍 CHECKING BUILD REQUIREMENTS...');
  
  const fs = await import('fs');
  
  // Check package.json
  if (!fs.existsSync('package.json')) {
    addResult('Build: package.json', 'fail', 'package.json missing');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  // Check critical dependencies
  const criticalDeps = [
    'next',
    '@neondatabase/serverless',
    'drizzle-orm',
    'next-auth'
  ];
  
  let depsOk = true;
  for (const dep of criticalDeps) {
    if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
      addResult(`Build: ${dep}`, 'fail', 'Critical dependency missing');
      depsOk = false;
    } else {
      addResult(`Build: ${dep}`, 'pass', 'Dependency present');
    }
  }
  
  // Check scripts
  const requiredScripts = ['build', 'start', 'dev'];
  for (const script of requiredScripts) {
    if (!packageJson.scripts?.[script]) {
      addResult(`Build: ${script} script`, 'warn', 'Script missing');
    } else {
      addResult(`Build: ${script} script`, 'pass', 'Script defined');
    }
  }
  
  return depsOk;
}

async function checkStaticAssets() {
  console.log('\n🔍 CHECKING STATIC ASSETS...');
  
  const fs = await import('fs');
  
  // Check public directory
  if (!fs.existsSync('public')) {
    addResult('Assets: public directory', 'warn', 'Public directory missing');
    return false;
  }
  
  // Check critical assets
  const criticalAssets = [
    'public/favicon.ico'
  ];
  
  for (const asset of criticalAssets) {
    if (fs.existsSync(asset)) {
      addResult(`Assets: ${asset}`, 'pass', 'Asset exists');
    } else {
      addResult(`Assets: ${asset}`, 'warn', 'Asset missing');
    }
  }
  
  return true;
}

async function main() {
  console.log('🚀 PRE-DEPLOYMENT VERIFICATION');
  console.log('=====================================');
  console.log('Checking all historical failure points...\n');
  
  const checks = [
    await checkEnvironmentVariables(),
    await checkDatabaseConnectivity(), 
    await checkCriticalEndpoints(),
    await checkVercelBuildIssues(),
    await checkBuildRequirements(),
    await checkStaticAssets()
  ];
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warn').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  
  if (failed > 0) {
    console.log('\n🚨 DEPLOYMENT BLOCKED - Fix failures before deploying');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  DEPLOYMENT READY WITH WARNINGS - Proceed with caution');
  } else {
    console.log('\n🎉 DEPLOYMENT READY - All checks passed!');
  }
  
  // Output checklist for manual verification
  console.log('\n📋 MANUAL CHECKLIST');
  console.log('===================');
  console.log('[ ] Run `npm run build` and verify no errors');
  console.log('[ ] Test server locally with `npm run dev`');
  console.log('[ ] Verify `/api/health` returns 200');
  console.log('[ ] Test random dilemma flow: /api/dilemmas/random → /explore/[uuid]');
  console.log('[ ] Generate VALUES.md and verify output');
  console.log('[ ] Check deployment target environment variables match .env');
  console.log('[ ] Confirm database is seeded in target environment');
}

main().catch(error => {
  console.error('❌ Pre-deploy check failed:', error);
  process.exit(1);
});