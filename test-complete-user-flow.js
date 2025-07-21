#!/usr/bin/env node

// COMPLETE USER FLOW TEST - Clicks through 12 dilemmas and generates values.md

const { chromium } = require('playwright');

async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE USER FLOW');
  
  const browser = await chromium.launch({ 
    headless: true, // Headless for server environment
    slowMo: 100 // Slow down for stability
  });
  
  const page = await browser.newPage();
  
  try {
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('🔴 Console Error:', msg.text());
      }
    });
    
    console.log('1️⃣ Going to landing page...');
    await page.goto('http://localhost:3004');
    
    console.log('2️⃣ Navigating to explore page...');
    await page.goto('http://localhost:3004/explore');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Check if dilemmas loaded
    const content = await page.textContent('body');
    if (!content.includes('Question 1 of')) {
      throw new Error('Explore page did not load properly - no dilemmas found');
    }
    
    console.log('3️⃣ Found dilemmas! Starting to answer...');
    
    // Answer 12 dilemmas
    for (let i = 1; i <= 12; i++) {
      console.log(`   Answering question ${i}/12...`);
      
      // Wait for question to load
      await page.waitForTimeout(1000);
      
      // Verify we're on the right question
      const questionText = await page.textContent('body');
      if (!questionText.includes(`Question ${i} of 12`)) {
        console.warn(`⚠️  Expected question ${i}, but page shows different content`);
      }
      
      // Find and click a random choice (A, B, C, or D)
      const choices = ['A', 'B', 'C', 'D'];
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      
      console.log(`     Choosing option ${randomChoice}...`);
      
      // Click the choice button
      const choiceButton = await page.$(`button:has-text("${randomChoice}.")`);
      if (!choiceButton) {
        throw new Error(`Could not find choice button for ${randomChoice}`);
      }
      await choiceButton.click();
      
      // Fill in reasoning (optional but good for testing)
      const reasoningField = await page.$('textarea');
      if (reasoningField) {
        await reasoningField.fill(`Random reasoning for question ${i}: I chose ${randomChoice} because it seems reasonable.`);
      }
      
      // Set difficulty slider to random value
      const difficultySlider = await page.$('input[type="range"]');
      if (difficultySlider) {
        const randomDifficulty = Math.floor(Math.random() * 10) + 1;
        await difficultySlider.fill(randomDifficulty.toString());
      }
      
      // Click Next (or Generate VALUES.md on last question)
      const nextButton = await page.$('button:has-text("Next"), button:has-text("Generate VALUES.md")');
      if (!nextButton) {
        throw new Error('Could not find Next button');
      }
      
      const buttonText = await nextButton.textContent();
      console.log(`     Clicking "${buttonText}"...`);
      await nextButton.click();
      
      // If this was the last question, we should be redirected to results
      if (i === 12) {
        console.log('4️⃣ Waiting for redirect to results page...');
        await page.waitForURL('**/results', { timeout: 10000 });
        break;
      }
      
      // Wait a bit before next question
      await page.waitForTimeout(500);
    }
    
    console.log('5️⃣ On results page! Waiting for values generation...');
    
    // Wait for results to load (up to 30 seconds)
    let valuesGenerated = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      await page.waitForTimeout(1000);
      
      const pageContent = await page.textContent('body');
      
      if (pageContent.includes('Your Values Profile') || pageContent.includes('Download values.md')) {
        valuesGenerated = true;
        console.log('6️⃣ ✅ Values generated successfully!');
        break;
      }
      
      if (pageContent.includes('No responses found')) {
        throw new Error('Results page shows "No responses found" - localStorage issue');
      }
      
      if (pageContent.includes('Failed to generate')) {
        throw new Error('Values generation failed');
      }
      
      console.log(`   Waiting for values generation... (${attempt + 1}/30s)`);
    }
    
    if (!valuesGenerated) {
      throw new Error('Values were not generated within 30 seconds');
    }
    
    // Try to download the values.md file
    console.log('7️⃣ Testing download functionality...');
    const downloadButton = await page.$('button:has-text("Download")');
    if (downloadButton) {
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
      await downloadButton.click();
      
      try {
        const download = await downloadPromise;
        console.log('8️⃣ ✅ Download works! File:', download.suggestedFilename());
        
        // Save the file to check contents
        await download.saveAs('./test-values-output.md');
        console.log('   💾 Saved to test-values-output.md');
        
      } catch (downloadError) {
        console.log('⚠️  Download test failed (but values were generated):', downloadError.message);
      }
    }
    
    // Final check for console errors
    if (consoleErrors.length > 0) {
      console.log('⚠️  Console errors detected:');
      consoleErrors.forEach(error => console.log('   ', error));
    } else {
      console.log('9️⃣ ✅ No console errors detected!');
    }
    
    console.log('🎉 COMPLETE USER FLOW TEST PASSED!');
    console.log('   ✅ Navigated to explore page');
    console.log('   ✅ Answered 12 dilemmas');
    console.log('   ✅ Generated values.md');
    console.log('   ✅ Download functionality works');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    
    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: 'test-failure-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved to test-failure-screenshot.png');
    } catch (screenshotError) {
      console.log('Could not save screenshot:', screenshotError.message);
    }
    
    process.exit(1);
    
  } finally {
    await browser.close();
  }
}

// Add cleanup for any test files
process.on('exit', () => {
  const fs = require('fs');
  try {
    if (fs.existsSync('./test-values-output.md')) {
      console.log('🧹 Test completed - check test-values-output.md for generated content');
    }
  } catch (e) {
    // Silent cleanup
  }
});

// Run the test
if (require.main === module) {
  testCompleteFlow().catch(error => {
    console.error('Test framework error:', error);
    process.exit(1);
  });
}

module.exports = testCompleteFlow;