#!/usr/bin/env node

// Minimal audit runner - obviously correct, no complexity
const { exec } = require('child_process');
const fs = require('fs');

console.log('🔍 Starting comprehensive audit...\n');

const auditLog = [];

function logResult(test, status, details = '') {
  const result = { test, status, details, timestamp: new Date().toISOString() };
  auditLog.push(result);
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${test}: ${status} ${details}`);
}

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

async function runAudit() {
  // 1. Basic server health
  try {
    await runCommand('curl -f http://localhost:3004/api/dilemmas');
    logResult('API Health', 'PASS', 'Server responding');
  } catch (e) {
    logResult('API Health', 'FAIL', 'Server not responding');
    return;
  }

  // 2. Database connectivity
  try {
    const result = await runCommand('curl -s http://localhost:3004/api/dilemmas | jq ".dilemmas | length"');
    const count = parseInt(result.stdout.trim());
    if (count > 0) {
      logResult('Database Connection', 'PASS', `${count} dilemmas found`);
    } else {
      logResult('Database Connection', 'FAIL', 'No dilemmas returned');
    }
  } catch (e) {
    logResult('Database Connection', 'FAIL', 'Query failed');
  }

  // 3. Values generation
  try {
    // Get real dilemma ID first
    const dilemmasResult = await runCommand('curl -s http://localhost:3004/api/dilemmas');
    const dilemmas = JSON.parse(dilemmasResult.stdout);
    const realDilemmaId = dilemmas.dilemmas[0].dilemmaId;
    
    const mockData = JSON.stringify({
      responses: [{
        dilemmaId: realDilemmaId,
        chosenOption: 'A',
        reasoning: 'Test',
        responseTime: 5000,
        perceivedDifficulty: 5
      }]
    });
    
    const result = await runCommand(`curl -s -X POST http://localhost:3004/api/generate-values -H "Content-Type: application/json" -d '${mockData}'`);
    const data = JSON.parse(result.stdout);
    
    if (data.valuesMarkdown && data.valuesMarkdown.includes('# My Values')) {
      logResult('Values Generation', 'PASS', 'Values.md generated');
    } else {
      logResult('Values Generation', 'FAIL', 'Invalid values output');
    }
  } catch (e) {
    logResult('Values Generation', 'FAIL', 'API call failed');
  }

  // 4. Research export
  try {
    await runCommand('curl -f http://localhost:3004/api/research/export?type=responses');
    logResult('Research Export', 'PASS', 'CSV export works');
  } catch (e) {
    logResult('Research Export', 'FAIL', 'CSV export failed');
  }

  // 5. Run Playwright tests
  try {
    await runCommand('npx playwright test --reporter=json > playwright-results.json');
    logResult('E2E Tests', 'PASS', 'All user flows work');
  } catch (e) {
    logResult('E2E Tests', 'FAIL', 'Some tests failed');
  }

  // 6. Generate report
  const passCount = auditLog.filter(r => r.status === 'PASS').length;
  const failCount = auditLog.filter(r => r.status === 'FAIL').length;
  const successRate = Math.round((passCount / (passCount + failCount)) * 100);

  console.log(`\n📊 Audit Summary:`);
  console.log(`   Success Rate: ${successRate}%`);
  console.log(`   Passed: ${passCount}/${passCount + failCount}`);
  
  if (failCount > 0) {
    console.log(`\n❌ Failed Tests:`);
    auditLog.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.test}: ${r.details}`);
    });
  }

  // Save detailed log
  fs.writeFileSync('audit-log.json', JSON.stringify(auditLog, null, 2));
  console.log(`\n📝 Detailed log saved to audit-log.json`);
  
  process.exit(failCount > 0 ? 1 : 0);
}

runAudit().catch(console.error);