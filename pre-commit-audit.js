#!/usr/bin/env node

// Minimal pre-commit audit - catch obvious problems before commit
const { exec } = require('child_process');

async function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function preCommitAudit() {
  console.log('🔍 Running pre-commit audit...\n');
  
  const checks = [
    {
      name: 'TypeScript compilation',
      command: 'npx tsc --noEmit',
      critical: true
    },
    {
      name: 'Build test',
      command: 'npm run build',
      critical: true
    },
    {
      name: 'API health check',
      command: 'curl -f http://localhost:3004/api/dilemmas',
      critical: false
    }
  ];

  let failCount = 0;
  let criticalFailCount = 0;

  for (const check of checks) {
    try {
      await runCommand(check.command);
      console.log(`✅ ${check.name}: PASS`);
    } catch (e) {
      console.log(`❌ ${check.name}: FAIL`);
      failCount++;
      if (check.critical) {
        criticalFailCount++;
      }
    }
  }

  if (criticalFailCount > 0) {
    console.log(`\n❌ ${criticalFailCount} critical checks failed. Commit blocked.`);
    process.exit(1);
  }

  if (failCount > 0) {
    console.log(`\n⚠️  ${failCount} non-critical checks failed. Consider fixing.`);
  }

  console.log('\n✅ Pre-commit audit passed. Safe to commit.');
}

preCommitAudit().catch(console.error);