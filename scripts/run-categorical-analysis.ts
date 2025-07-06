#!/usr/bin/env tsx

/**
 * Run Categorical Analysis on Values.md Codebase
 * 
 * This script performs mathematical categorical analysis to identify
 * structural nonconformities and potential errors in our code architecture.
 */

import { CategoricalCodeAnalyzer } from '../src/lib/categorical-analysis';
import path from 'path';

async function runCategoricalAnalysis() {
  console.log('🔬 Starting Categorical Analysis of Values.md Codebase');
  console.log('=' .repeat(60));
  
  const projectRoot = path.resolve(__dirname, '..');
  const analyzer = new CategoricalCodeAnalyzer(projectRoot);
  
  try {
    const results = await analyzer.performCategoricalAnalysis();
    
    console.log('\n📊 Category Extraction Results:');
    console.log(`   Code Category Objects: ${results.categories.code}`);
    console.log(`   Test Category Objects: ${results.categories.test}`);
    console.log(`   Architecture Category Objects: ${results.categories.arch}`);
    
    console.log('\n🔍 Functoriality Verification:');
    
    // Test Projection Functor
    console.log('\n   Test → Code Projection:');
    if (results.functoriality.testProjection.valid) {
      console.log('   ✅ Functoriality laws satisfied');
    } else {
      console.log('   ❌ Functoriality violations:');
      results.functoriality.testProjection.violations.forEach(v => {
        console.log(`      • ${v}`);
      });
    }
    
    // Architecture Projection Functor
    console.log('\n   Architecture → Code Projection:');
    if (results.functoriality.archProjection.valid) {
      console.log('   ✅ Functoriality laws satisfied');
    } else {
      console.log('   ❌ Functoriality violations:');
      results.functoriality.archProjection.violations.forEach(v => {
        console.log(`      • ${v}`);
      });
    }
    
    // Fibration Coherence
    console.log('\n🎯 Fibration Coherence Analysis:');
    if (results.fibrationCoherence.valid) {
      console.log('   ✅ Fibration structure is mathematically sound');
    } else {
      console.log('   ❌ Structural issues detected:');
      results.fibrationCoherence.issues.forEach(issue => {
        console.log(`      • ${issue}`);
      });
    }
    
    // Summary
    console.log('\n📋 Analysis Summary:');
    const allValid = results.functoriality.testProjection.valid && 
                     results.functoriality.archProjection.valid && 
                     results.fibrationCoherence.valid;
    
    if (allValid) {
      console.log('   🎉 Codebase exhibits sound mathematical structure');
      console.log('   📐 All categorical laws are satisfied');
      console.log('   🔗 Fibration mappings are coherent');
    } else {
      console.log('   ⚠️  Mathematical nonconformities detected');
      console.log('   🔧 Review flagged issues for potential errors');
      
      const totalViolations = results.functoriality.testProjection.violations.length +
                              results.functoriality.archProjection.violations.length +
                              results.fibrationCoherence.issues.length;
      console.log(`   📊 Total issues: ${totalViolations}`);
    }
    
  } catch (error) {
    console.error('❌ Categorical analysis failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    
    process.exit(1);
  }
}

// Run analysis
runCategoricalAnalysis().catch(console.error);