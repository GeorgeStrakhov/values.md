#!/usr/bin/env node

// Minimal log analyzer - obviously correct pattern detection
const { exec } = require('child_process');
const fs = require('fs');

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

async function analyzeHistory() {
  console.log('📊 Analyzing development history...\n');
  
  const analysis = {
    commits: [],
    errorPatterns: {},
    regressionTrends: {},
    frequentIssues: {}
  };

  // 1. Git commit analysis
  try {
    const result = await runCommand('git log --oneline --grep="FIX\\|CRITICAL\\|MAJOR\\|ERROR" -20');
    const commits = result.stdout.trim().split('\n').filter(Boolean);
    
    commits.forEach(commit => {
      const [hash, ...msgParts] = commit.split(' ');
      const message = msgParts.join(' ');
      
      // Pattern detection
      if (message.includes('No responses found')) {
        analysis.errorPatterns['localStorage_mismatch'] = (analysis.errorPatterns['localStorage_mismatch'] || 0) + 1;
      }
      if (message.includes('No dilemmas')) {
        analysis.errorPatterns['database_connection'] = (analysis.errorPatterns['database_connection'] || 0) + 1;
      }
      if (message.includes('404') || message.includes('502') || message.includes('504')) {
        analysis.errorPatterns['api_failures'] = (analysis.errorPatterns['api_failures'] || 0) + 1;
      }
      if (message.includes('data flow') || message.includes('mismatch')) {
        analysis.errorPatterns['data_flow_issues'] = (analysis.errorPatterns['data_flow_issues'] || 0) + 1;
      }
      
      analysis.commits.push({ hash, message });
    });
    
    console.log(`✅ Analyzed ${commits.length} error-related commits`);
  } catch (e) {
    console.log('❌ Could not analyze git history');
  }

  // 2. Recent audit logs
  if (fs.existsSync('audit-log.json')) {
    const auditLog = JSON.parse(fs.readFileSync('audit-log.json', 'utf8'));
    auditLog.forEach(log => {
      if (log.status === 'FAIL') {
        analysis.frequentIssues[log.test] = (analysis.frequentIssues[log.test] || 0) + 1;
      }
    });
    console.log(`✅ Analyzed recent audit log`);
  }

  // 3. Generate insights
  console.log('\n📈 Error Pattern Analysis:');
  Object.entries(analysis.errorPatterns)
    .sort(([,a], [,b]) => b - a)
    .forEach(([pattern, count]) => {
      console.log(`   ${pattern}: ${count} occurrences`);
    });

  console.log('\n🔍 Most Common Issues:');
  Object.entries(analysis.frequentIssues)
    .sort(([,a], [,b]) => b - a)
    .forEach(([issue, count]) => {
      console.log(`   ${issue}: ${count} failures`);
    });

  // 4. Recommendations
  console.log('\n💡 Recommendations:');
  if (analysis.errorPatterns['localStorage_mismatch'] > 2) {
    console.log('   - Add localStorage validation in results page');
  }
  if (analysis.errorPatterns['database_connection'] > 2) {
    console.log('   - Add database health checks');
  }
  if (analysis.errorPatterns['api_failures'] > 2) {
    console.log('   - Add API retry mechanisms');
  }
  if (analysis.errorPatterns['data_flow_issues'] > 2) {
    console.log('   - Add schema validation to all API endpoints');
  }

  // 5. Health score
  const totalErrors = Object.values(analysis.errorPatterns).reduce((sum, count) => sum + count, 0);
  const healthScore = Math.max(0, 100 - (totalErrors * 5));
  
  console.log(`\n🏥 Project Health Score: ${healthScore}%`);
  if (healthScore < 80) {
    console.log('   ⚠️  Consider focusing on error prevention');
  } else {
    console.log('   ✅ Good error management');
  }

  // Save analysis
  fs.writeFileSync('history-analysis.json', JSON.stringify(analysis, null, 2));
  console.log('\n📝 Analysis saved to history-analysis.json');
}

analyzeHistory().catch(console.error);