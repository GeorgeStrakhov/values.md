#!/usr/bin/env tsx

/**
 * Categorical Analysis Report Generator
 * 
 * This script analyzes the categorical structure of our codebase and generates
 * a focused report on the most critical structural nonconformities that need fixing.
 */

import { CategoricalCodeAnalyzer } from '../src/lib/categorical-analysis';
import path from 'path';
import fs from 'fs';

async function generateAnalysisReport() {
  console.log('🔬 Categorical Analysis Report for Values.md Codebase');
  console.log('=' .repeat(60));
  
  const projectRoot = path.resolve(__dirname, '..');
  const analyzer = new CategoricalCodeAnalyzer(projectRoot);
  
  try {
    const results = await analyzer.performCategoricalAnalysis();
    
    // Analyze the fibration coherence issues to categorize them
    const issues = results.fibrationCoherence.issues;
    const categorizedIssues = {
      missingTestUtilities: [] as string[],
      missingBusinessLogic: [] as string[],
      orphanedTests: [] as string[],
      uncoveredCriticalFunctions: [] as string[]
    };
    
    for (const issue of issues) {
      if (issue.includes('setupTestDatabase') || issue.includes('cleanupTestDatabase') || 
          issue.includes('insertTestResponses') || issue.includes('callAPI') ||
          issue.includes('createTestSession') || issue.includes('createTestDilemmas')) {
        categorizedIssues.missingTestUtilities.push(issue);
      } else if (issue.includes('combinatorialGenerator') || issue.includes('type ResponsePattern')) {
        categorizedIssues.missingBusinessLogic.push(issue);
      } else if (issue.includes('Orphaned test')) {
        categorizedIssues.orphanedTests.push(issue);
      } else if (issue.includes('Critical function') && issue.includes('has no test coverage')) {
        categorizedIssues.uncoveredCriticalFunctions.push(issue);
      }
    }
    
    console.log('\n📊 Categorical Structure Analysis:');
    console.log(`   Code Functions: ${results.categories.code}`);
    console.log(`   Test Cases: ${results.categories.test}`);
    console.log(`   Architecture Components: ${results.categories.arch}`);
    
    console.log('\n🎯 Functoriality Laws:');
    console.log(`   Test → Code Projection: ${results.functoriality.testProjection.valid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Architecture → Code Projection: ${results.functoriality.archProjection.valid ? '✅ Valid' : '❌ Invalid'}`);
    
    console.log('\n🚨 Critical Structural Nonconformities:');
    
    if (categorizedIssues.missingTestUtilities.length > 0) {
      console.log('\n   📋 Missing Test Utilities (High Priority):');
      const utilities = new Set<string>();
      categorizedIssues.missingTestUtilities.forEach(issue => {
        const match = issue.match(/"([^"]+)"/);
        if (match) {
          const funcName = match[1];
          if (funcName.includes('setupTestDatabase') || funcName.includes('cleanupTestDatabase') ||
              funcName.includes('insertTestResponses') || funcName.includes('callAPI') ||
              funcName.includes('createTestSession') || funcName.includes('createTestDilemmas')) {
            utilities.add(funcName);
          }
        }
      });
      
      Array.from(utilities).forEach(util => {
        console.log(`      • Missing: ${util}`);
      });
      
      console.log(`\n   📝 Recommendation: Create test utility functions in tests/test-utils.ts`);
    }
    
    if (categorizedIssues.missingBusinessLogic.length > 0) {
      console.log('\n   🧠 Missing Business Logic (High Priority):');
      const logic = new Set<string>();
      categorizedIssues.missingBusinessLogic.forEach(issue => {
        const match = issue.match(/"([^"]+)"/);
        if (match) {
          logic.add(match[1]);
        }
      });
      
      Array.from(logic).forEach(func => {
        console.log(`      • Missing: ${func}`);
      });
      
      console.log(`\n   📝 Recommendation: Implement missing combinatorial generator functions`);
    }
    
    if (categorizedIssues.uncoveredCriticalFunctions.length > 0) {
      console.log('\n   🔍 Critical Functions Without Tests (Medium Priority):');
      categorizedIssues.uncoveredCriticalFunctions.slice(0, 5).forEach(issue => {
        const match = issue.match(/function (\w+) \((\w+)\)/);
        if (match) {
          console.log(`      • ${match[1]} (${match[2]})`);
        }
      });
      
      if (categorizedIssues.uncoveredCriticalFunctions.length > 5) {
        console.log(`      • ... and ${categorizedIssues.uncoveredCriticalFunctions.length - 5} more`);
      }
    }
    
    console.log('\n🔧 Mathematical Integrity Assessment:');
    const totalIssues = issues.length;
    const criticalIssues = categorizedIssues.missingTestUtilities.length + categorizedIssues.missingBusinessLogic.length;
    
    if (totalIssues === 0) {
      console.log('   ✅ Perfect categorical structure - all fibration laws satisfied');
    } else if (criticalIssues === 0) {
      console.log('   🟡 Minor structural issues - core fibration is sound');
    } else {
      console.log('   🔴 Significant structural violations - fibration coherence broken');
    }
    
    console.log(`\n📈 Metrics:`);
    console.log(`   Total structural issues: ${totalIssues}`);
    console.log(`   Critical missing functions: ${criticalIssues}`);
    console.log(`   Test coverage gaps: ${categorizedIssues.uncoveredCriticalFunctions.length}`);
    console.log(`   Functoriality violations: ${results.functoriality.testProjection.violations.length + results.functoriality.archProjection.violations.length}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Implement missing test utilities to fix test infrastructure');
    console.log('   2. Create missing business logic functions identified by tests');
    console.log('   3. Add test coverage for critical stateful/IO functions');
    console.log('   4. Re-run categorical analysis to verify mathematical consistency');
    
    // Write detailed report to file
    const reportPath = path.join(projectRoot, 'CATEGORICAL_ANALYSIS_REPORT.md');
    const reportContent = `# Categorical Analysis Report
    
Generated: ${new Date().toISOString()}

## Summary
The categorical analysis identified ${totalIssues} structural nonconformities in the codebase fibration.

## Missing Functions Detected
${Array.from(new Set([
  ...categorizedIssues.missingTestUtilities,
  ...categorizedIssues.missingBusinessLogic
].map(issue => {
  const match = issue.match(/"([^"]+)"/);
  return match ? match[1] : '';
}).filter(Boolean))).map(func => `- ${func}`).join('\n')}

## Mathematical Structure
- Code Category Objects: ${results.categories.code}
- Test Category Objects: ${results.categories.test}  
- Architecture Category Objects: ${results.categories.arch}
- Functoriality Laws: ${results.functoriality.testProjection.valid && results.functoriality.archProjection.valid ? 'SATISFIED' : 'VIOLATED'}

## Recommendations
1. Implement missing test infrastructure functions
2. Create missing business logic identified by categorical analysis
3. Add test coverage for critical functions to complete the fibration
4. Verify mathematical consistency after fixes
`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Detailed report written to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Generate the report
generateAnalysisReport().catch(console.error);