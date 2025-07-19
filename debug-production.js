#!/usr/bin/env node

// Debug production deployment issues
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

async function debugProduction() {
  console.log('🔍 Debugging production deployment...\n');

  // 1. Check current branch and commit
  try {
    const branch = await runCommand('git branch --show-current');
    const commit = await runCommand('git rev-parse HEAD');
    console.log(`Current branch: ${branch.stdout.trim()}`);
    console.log(`Current commit: ${commit.stdout.trim().slice(0, 8)}`);
  } catch (e) {
    console.log('❌ Could not get git info');
  }

  // 2. Check if results page exists locally
  const resultsPath = './src/app/results/page.tsx';
  const fs = require('fs');
  if (fs.existsSync(resultsPath)) {
    console.log('✅ Results page exists locally');
  } else {
    console.log('❌ Results page missing locally');
  }

  // 3. Check local build
  try {
    console.log('\n🔨 Testing local build...');
    await runCommand('npm run build');
    console.log('✅ Local build succeeds');
  } catch (e) {
    console.log('❌ Local build fails');
    console.log(e.stderr);
  }

  // 4. Check if we can reach the local results page
  try {
    await runCommand('curl -f http://localhost:3004/results');
    console.log('✅ Local results page accessible');
  } catch (e) {
    console.log('❌ Local results page not accessible');
  }

  // 5. Check deployment status
  console.log('\n📊 Deployment Status:');
  console.log('   - Local: Working');
  console.log('   - Production: 404 error');
  console.log('   - Likely cause: Production not updated with latest changes');

  // 6. Generate fix recommendations
  console.log('\n💡 Recommended fixes:');
  console.log('   1. Push current changes to main branch');
  console.log('   2. Trigger new deployment');
  console.log('   3. Verify production has latest commit');
  console.log('   4. Check Vercel/deployment logs for build errors');
}

debugProduction().catch(console.error);