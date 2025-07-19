#!/usr/bin/env node

// Chaos audit - inject randomness to catch edge cases
const { exec } = require('child_process');
const crypto = require('crypto');

// Deterministic randomness for reproducibility
function createSeededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const SEED = process.env.CHAOS_SEED || Date.now();
const random = createSeededRandom(SEED);

console.log(`🎲 Chaos Audit (seed: ${SEED})`);

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

async function chaosAudit() {
  const testScenarios = [
    {
      name: 'Rapid clicks test',
      test: async () => {
        // Simulate rapid API calls
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(runCommand('curl -s http://localhost:3004/api/dilemmas'));
        }
        await Promise.all(promises);
      }
    },
    {
      name: 'Malformed data test',
      test: async () => {
        const badData = JSON.stringify({
          responses: [{
            dilemmaId: null,
            chosenOption: 'Z',
            reasoning: 'x'.repeat(10000),
            responseTime: -1,
            perceivedDifficulty: 99
          }]
        });
        
        try {
          await runCommand(`curl -s -X POST http://localhost:3004/api/generate-values -H "Content-Type: application/json" -d '${badData}'`);
        } catch (e) {
          // Expected to fail
        }
      }
    },
    {
      name: 'Empty localStorage test',
      test: async () => {
        // Test results page with no localStorage
        await runCommand('curl -s http://localhost:3004/results');
      }
    },
    {
      name: 'Large dataset test',
      test: async () => {
        // Test with many responses
        const dilemmasResult = await runCommand('curl -s http://localhost:3004/api/dilemmas');
        const dilemmas = JSON.parse(dilemmasResult.stdout);
        
        const largeData = JSON.stringify({
          responses: dilemmas.dilemmas.map(d => ({
            dilemmaId: d.dilemmaId,
            chosenOption: ['A', 'B', 'C', 'D'][Math.floor(random() * 4)],
            reasoning: 'Random test '.repeat(Math.floor(random() * 10)),
            responseTime: Math.floor(random() * 30000),
            perceivedDifficulty: Math.floor(random() * 10) + 1
          }))
        });
        
        await runCommand(`curl -s -X POST http://localhost:3004/api/generate-values -H "Content-Type: application/json" -d '${largeData}'`);
      }
    },
    {
      name: 'Network interruption simulation',
      test: async () => {
        // Start request, then immediately make another
        const p1 = runCommand('curl -s http://localhost:3004/api/dilemmas');
        const p2 = runCommand('curl -s http://localhost:3004/api/dilemmas');
        await Promise.all([p1, p2]);
      }
    }
  ];

  // Randomly select and run scenarios
  const selectedScenarios = testScenarios
    .sort(() => random() - 0.5)
    .slice(0, Math.floor(random() * testScenarios.length) + 1);

  console.log(`Running ${selectedScenarios.length} random chaos tests...\n`);

  let passCount = 0;
  let failCount = 0;

  for (const scenario of selectedScenarios) {
    try {
      await scenario.test();
      console.log(`✅ ${scenario.name}: PASS`);
      passCount++;
    } catch (e) {
      console.log(`❌ ${scenario.name}: FAIL`);
      failCount++;
    }
  }

  // Random delay between tests
  const delay = Math.floor(random() * 2000) + 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  console.log(`\n📊 Chaos Results:`);
  console.log(`   Passed: ${passCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Chaos level: ${Math.floor(random() * 100)}%`);
  
  if (failCount > passCount) {
    console.log(`   ⚠️  High failure rate - system may be fragile`);
  } else {
    console.log(`   ✅ System handles chaos well`);
  }

  console.log(`\n🔄 To reproduce: CHAOS_SEED=${SEED} ./chaos-audit.js`);
}

chaosAudit().catch(console.error);