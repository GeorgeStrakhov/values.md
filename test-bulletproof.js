#!/usr/bin/env node

// BULLETPROOF TESTING - Catches the issues we actually had

const { chromium } = require('playwright');

const ENVIRONMENTS = {
  local: 'http://localhost:3004',
  production: 'https://values-md.vercel.app'
};

class BulletproofTester {
  constructor() {
    this.failures = [];
    this.browser = null;
  }

  fail(test, error) {
    this.failures.push({ test, error: error.message });
    console.error(`❌ ${test}: ${error.message}`);
  }

  pass(test) {
    console.log(`✅ ${test}`);
  }

  // TEST 1: API Contract Verification (Catches endpoint mismatches)
  async testAPIContracts(env) {
    const baseUrl = ENVIRONMENTS[env];
    
    try {
      // Test dilemmas API
      const response = await fetch(`${baseUrl}/api/dilemmas`);
      if (!response.ok) throw new Error(`Dilemmas API returned ${response.status}`);
      
      const data = await response.json();
      if (!data.dilemmas || !Array.isArray(data.dilemmas)) {
        throw new Error('Dilemmas API missing dilemmas array');
      }
      
      if (data.dilemmas.length === 0) {
        throw new Error('No dilemmas returned');
      }

      // Verify dilemma structure
      const dilemma = data.dilemmas[0];
      const requiredFields = ['dilemmaId', 'title', 'scenario', 'choiceA', 'choiceB', 'choiceC', 'choiceD'];
      for (const field of requiredFields) {
        if (!dilemma[field]) {
          throw new Error(`Dilemma missing required field: ${field}`);
        }
      }

      this.pass(`${env} API contracts`);
    } catch (error) {
      this.fail(`${env} API contracts`, error);
    }
  }

  // TEST 2: Full Browser E2E (Catches SSR, hydration, routing issues)
  async testFullUserFlow(env) {
    const baseUrl = ENVIRONMENTS[env];
    let page;

    try {
      this.browser = await chromium.launch({ headless: true });
      const context = await this.browser.newContext();
      page = await context.newPage();

      // Listen for console errors (catches React errors)
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Step 1: Landing page loads without errors
      await page.goto(baseUrl, { waitUntil: 'networkidle' });
      
      // Check for React hydration errors
      await page.waitForTimeout(2000);
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors: ${consoleErrors.join(', ')}`);
      }

      // Verify landing page content
      const title = await page.textContent('h1');
      if (!title?.includes('values')) {
        throw new Error('Landing page title missing or incorrect');
      }

      // Step 2: Navigate to explore page
      await page.goto(`${baseUrl}/explore`, { waitUntil: 'networkidle' });
      
      // Wait for dilemmas to load
      await page.waitForTimeout(3000);
      
      // Check for loading states
      const loadingText = await page.textContent('body');
      if (loadingText.includes('Loading dilemmas...')) {
        await page.waitForTimeout(5000); // Wait longer
      }

      // Verify dilemma content appears
      const dilemmaContent = await page.textContent('body');
      if (!dilemmaContent.includes('Question 1 of')) {
        throw new Error('Explore page not showing dilemmas');
      }

      // Step 3: Try to answer a dilemma
      const choiceButtons = await page.$$('button:has-text("A.")');
      if (choiceButtons.length === 0) {
        throw new Error('No choice buttons found');
      }

      await choiceButtons[0].click();
      
      // Fill reasoning
      const reasoningField = await page.$('textarea');
      if (reasoningField) {
        await reasoningField.fill('Test reasoning for automated test');
      }

      // Try to proceed
      const nextButton = await page.$('button:has-text("Next")');
      if (!nextButton) {
        throw new Error('Next button not found');
      }

      const isEnabled = await nextButton.isEnabled();
      if (!isEnabled) {
        throw new Error('Next button not enabled after making choice');
      }

      // Step 4: Check results page exists
      await page.goto(`${baseUrl}/results`, { waitUntil: 'networkidle' });
      
      const resultsContent = await page.textContent('body');
      if (resultsContent.includes('404') || resultsContent.includes('not found')) {
        throw new Error('Results page returns 404');
      }

      // Check for final console errors
      await page.waitForTimeout(2000);
      const finalErrors = consoleErrors.filter(error => 
        !error.includes('Warning') && // Ignore React warnings
        !error.includes('Download') // Ignore download-related errors
      );
      
      if (finalErrors.length > 0) {
        throw new Error(`Console errors during flow: ${finalErrors.join(', ')}`);
      }

      this.pass(`${env} full user flow`);

    } catch (error) {
      this.fail(`${env} full user flow`, error);
    } finally {
      if (page) await page.close();
      if (this.browser) await this.browser.close();
    }
  }

  // TEST 3: Cross-Environment Consistency (Catches deployment issues)
  async testCrossEnvironmentConsistency() {
    try {
      const localData = await fetch(`${ENVIRONMENTS.local}/api/dilemmas`).then(r => r.json());
      const prodData = await fetch(`${ENVIRONMENTS.production}/api/dilemmas`).then(r => r.json());

      if (localData.dilemmas?.length !== prodData.dilemmas?.length) {
        throw new Error(`Data mismatch: local has ${localData.dilemmas?.length}, prod has ${prodData.dilemmas?.length}`);
      }

      this.pass('Cross-environment consistency');
    } catch (error) {
      this.fail('Cross-environment consistency', error);
    }
  }

  // TEST 4: Build Verification (Catches TypeScript issues)
  async testBuildVerification() {
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec('npm run build', (error, stdout, stderr) => {
        if (error) {
          this.fail('Build verification', error);
        } else if (stderr.includes('Error')) {
          this.fail('Build verification', new Error(stderr));
        } else {
          this.pass('Build verification');
        }
        resolve();
      });
    });
  }

  async runAllTests() {
    console.log('🧪 BULLETPROOF TESTING - Catching Real Issues\n');

    // Test build first (fastest failure)
    await this.testBuildVerification();

    // Test API contracts
    for (const env of Object.keys(ENVIRONMENTS)) {
      await this.testAPIContracts(env);
    }

    // Test full user flows (most comprehensive)
    for (const env of Object.keys(ENVIRONMENTS)) {
      await this.testFullUserFlow(env);
    }

    // Test cross-environment consistency
    await this.testCrossEnvironmentConsistency();

    // Report results
    console.log('\n📊 TEST RESULTS:');
    if (this.failures.length === 0) {
      console.log('🎉 ALL TESTS PASSED - System is bulletproof!');
      process.exit(0);
    } else {
      console.log(`❌ ${this.failures.length} FAILURES DETECTED:`);
      this.failures.forEach(({ test, error }) => {
        console.log(`   ${test}: ${error}`);
      });
      console.log('\n🚨 DO NOT DEPLOY - Fix issues first!');
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new BulletproofTester();
  tester.runAllTests().catch(error => {
    console.error('Testing framework error:', error);
    process.exit(1);
  });
}

module.exports = BulletproofTester;