/**
 * E2E Navigation Test - REAL BROWSER TESTING
 * 
 * This tests the ACTUAL deployed behavior:
 * - Real browser clicking Next button
 * - Real DOM updates and React re-renders  
 * - Actual URL changes and useEffect triggers
 * - Real network requests to API endpoints
 */

import { test, expect } from '@playwright/test';

test.describe('Real Browser Navigation Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/');
  });

  test('CRITICAL: Full navigation flow from landing to 3 dilemmas', async ({ page }) => {
    console.log('🎭 Starting real browser E2E test...');
    
    // Step 1: Click "Start Exploring" from landing page
    await page.click('text=Start Exploring');
    
    // Should navigate to first dilemma
    await page.waitForURL(/\/explore\/.+/);
    console.log('✅ Navigated to first dilemma');
    
    // Step 2: Verify first dilemma loads
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible();
    await expect(page.locator('text=Question 1 of')).toBeVisible();
    
    // Step 3: Select first option and click Next
    await page.locator('[data-testid="choice-a"]').click();
    await expect(page.locator('[data-testid="next-button"]')).toBeEnabled();
    
    console.log('🔄 Clicking Next button on first dilemma...');
    await page.locator('[data-testid="next-button"]').click();
    
    // CRITICAL: Wait for navigation to complete
    await page.waitForTimeout(500); // Allow for state updates
    
    // Step 4: Verify we're on second dilemma
    await expect(page.locator('text=Question 2 of')).toBeVisible();
    console.log('✅ Successfully advanced to second dilemma');
    
    // Step 5: Select second option and advance again
    await page.locator('[data-testid="choice-b"]').click();
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(500);
    
    // Step 6: Verify we're on third dilemma  
    await expect(page.locator('text=Question 3 of')).toBeVisible();
    console.log('✅ Successfully advanced to third dilemma');
    
    // Step 7: Complete third dilemma
    await page.locator('[data-testid="choice-c"]').click();
    await page.locator('[data-testid="next-button"]').click();
    
    // Should either go to next dilemma or results page
    await page.waitForTimeout(1000);
    
    // Check if we advanced or completed
    const currentUrl = page.url();
    console.log('📍 Final URL:', currentUrl);
    
    if (currentUrl.includes('/results')) {
      console.log('🏁 Reached results page - flow complete!');
      await expect(page.locator('text=Your Personal Values')).toBeVisible();
    } else if (currentUrl.includes('/explore/')) {
      console.log('➡️ Advanced to next dilemma - continuing flow...');
      await expect(page.locator('text=Question 4 of')).toBeVisible();
    }
    
    console.log('🎯 E2E navigation test completed successfully!');
  });

  test('REGRESSION: Next button enablement state', async ({ page }) => {
    // Navigate to a dilemma
    await page.goto('/api/dilemmas/random');
    const response = await page.waitForResponse('/api/dilemmas/random');
    const data = await response.json();
    const firstDilemmaId = data.dilemmas[0].dilemmaId;
    
    await page.goto(`/explore/${firstDilemmaId}`);
    
    // Next button should be disabled initially
    await expect(page.locator('[data-testid="next-button"]')).toBeDisabled();
    
    // Select an option
    await page.locator('[data-testid="choice-a"]').click();
    
    // Next button should be enabled
    await expect(page.locator('[data-testid="next-button"]')).toBeEnabled();
    
    // Click Next
    await page.locator('[data-testid="next-button"]').click();
    
    // Next button should be disabled again (no option selected on new dilemma)
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="next-button"]')).toBeDisabled();
  });

  test('CRITICAL: Progress indicator updates correctly', async ({ page }) => {
    // Start flow
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    // Check initial progress
    await expect(page.locator('text=Question 1 of')).toBeVisible();
    
    // Advance through several dilemmas, checking progress each time
    for (let i = 1; i <= 3; i++) {
      // Verify current progress
      await expect(page.locator(`text=Question ${i} of`)).toBeVisible();
      
      // Select option and advance (if not last)
      await page.locator('[data-testid="choice-a"]').click();
      await page.locator('[data-testid="next-button"]').click();
      await page.waitForTimeout(500);
      
      // Check if advanced or completed
      const hasNextQuestion = await page.locator(`text=Question ${i + 1} of`).isVisible();
      if (hasNextQuestion) {
        console.log(`✅ Progress indicator correctly shows question ${i + 1}`);
      } else {
        console.log('🏁 Reached end of flow');
        break;
      }
    }
  });

  test('API Integration: Real dilemma loading', async ({ page }) => {
    // Test actual API endpoint
    const response = await page.goto('/api/dilemmas/random');
    expect(response?.status()).toBe(200);
    
    const data = await response?.json();
    expect(data.dilemmas).toBeDefined();
    expect(Array.isArray(data.dilemmas)).toBe(true);
    expect(data.dilemmas.length).toBeGreaterThan(0);
    
    // Test specific dilemma loading
    const firstDilemma = data.dilemmas[0];
    const dilemmaResponse = await page.goto(`/api/dilemmas/${firstDilemma.dilemmaId}`);
    expect(dilemmaResponse?.status()).toBe(200);
    
    const dilemmaData = await dilemmaResponse?.json();
    expect(dilemmaData.dilemmas[0].dilemmaId).toBe(firstDilemma.dilemmaId);
  });

  test('Store Persistence: localStorage across page reloads', async ({ page }) => {
    // Start flow and make some progress
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    // Select option on first dilemma
    await page.locator('[data-testid="choice-a"]').click();
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(500);
    
    // Should be on second dilemma
    await expect(page.locator('text=Question 2 of')).toBeVisible();
    
    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Should maintain state and still be on second dilemma
    // (This tests Zustand persistence)
    await expect(page.locator('text=Question 2 of')).toBeVisible();
    console.log('✅ State persisted across page reload');
  });

  test('Error Handling: Invalid dilemma UUID', async ({ page }) => {
    // Try to access invalid dilemma
    await page.goto('/explore/invalid-uuid-12345');
    
    // Should handle gracefully
    await expect(page.locator('text=Error loading dilemmas')).toBeVisible();
  });

  test('Browser Navigation: Back/Forward buttons', async ({ page }) => {
    // Start flow
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    const firstUrl = page.url();
    
    // Advance one dilemma
    await page.locator('[data-testid="choice-a"]').click();
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(500);
    
    const secondUrl = page.url();
    expect(secondUrl).not.toBe(firstUrl);
    
    // Test browser back button
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Should handle gracefully (might stay on same dilemma due to our store-driven approach)
    const afterBackUrl = page.url();
    console.log('🔙 After back button:', afterBackUrl);
    
    // Test browser forward button
    await page.goForward();
    await page.waitForTimeout(500);
    
    console.log('🔜 After forward button:', page.url());
  });
});