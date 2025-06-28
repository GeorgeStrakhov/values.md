/**
 * CRITICAL E2E Tests - Real Browser Testing of Fixed Navigation
 * 
 * Tests the ACTUAL deployed fixes:
 * - Next button navigation with router.push()
 * - Auto-advance timer with fresh store calls
 * - Progress tracking with URL sync
 * - Response persistence with auto-save
 */

import { test, expect } from '@playwright/test';

test.describe('Critical Navigation Fixes', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/');
  });

  test('CRITICAL: Next button works and advances through dilemmas', async ({ page }) => {
    console.log('🎭 Testing Next button fix...');
    
    // Navigate to first dilemma
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    // Get initial URL
    const firstURL = page.url();
    console.log('📍 First dilemma URL:', firstURL);
    
    // Select option and click Next
    await page.locator('[data-testid="choice-a"]').click();
    await expect(page.locator('[data-testid="next-button"]')).toBeEnabled();
    
    console.log('🔄 Clicking Next button...');
    await page.locator('[data-testid="next-button"]').click();
    
    // CRITICAL: URL should change (this was broken before)
    await page.waitForFunction((firstURL) => {
      return window.location.href !== firstURL;
    }, firstURL, { timeout: 3000 });
    
    const secondURL = page.url();
    console.log('📍 Second dilemma URL:', secondURL);
    
    // Verify URL actually changed
    expect(secondURL).not.toBe(firstURL);
    expect(secondURL).toMatch(/\/explore\/.+/);
    
    console.log('✅ Next button navigation works!');
  });

  test('CRITICAL: Auto-advance timer works after selection', async ({ page }) => {
    console.log('🎭 Testing auto-advance timer fix...');
    
    // Navigate to first dilemma
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    const firstURL = page.url();
    
    // Select option - should trigger auto-advance
    await page.locator('[data-testid="choice-a"]').click();
    
    // Look for countdown
    await expect(page.locator('text=Auto-advancing in')).toBeVisible({ timeout: 1000 });
    console.log('🔄 Auto-advance countdown started');
    
    // Wait for auto-advance to complete
    await page.waitForFunction((firstURL) => {
      return window.location.href !== firstURL;
    }, firstURL, { timeout: 5000 });
    
    const secondURL = page.url();
    expect(secondURL).not.toBe(firstURL);
    
    console.log('✅ Auto-advance timer works!');
  });

  test('CRITICAL: Progress tracking reflects current dilemma', async ({ page }) => {
    console.log('🎭 Testing progress tracking fix...');
    
    // Navigate to first dilemma
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    // Should show "1 of X"
    await expect(page.locator('text=/\\d+ of \\d+/')).toBeVisible();
    const firstProgress = await page.locator('text=/\\d+ of \\d+/').textContent();
    console.log('📊 First progress:', firstProgress);
    
    // Advance to next dilemma
    await page.locator('[data-testid="choice-a"]').click();
    await page.locator('[data-testid="next-button"]').click();
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Progress should update
    const secondProgress = await page.locator('text=/\\d+ of \\d+/').textContent();
    console.log('📊 Second progress:', secondProgress);
    
    expect(secondProgress).not.toBe(firstProgress);
    expect(secondProgress).toMatch(/^[2-9]+ of \d+$/); // Should be step 2 or higher
    
    console.log('✅ Progress tracking works!');
  });

  test('CRITICAL: Responses are saved and persist', async ({ page }) => {
    console.log('🎭 Testing response persistence fix...');
    
    // Navigate to first dilemma
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    // Select option A
    await page.locator('[data-testid="choice-a"]').click();
    await page.locator('[data-testid="difficulty-slider"]').fill('7');
    
    // Advance to next dilemma
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(1000);
    
    // Select option B on second dilemma
    await page.locator('[data-testid="choice-b"]').click();
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(1000);
    
    // Go back to first dilemma using browser back
    await page.goBack();
    await page.waitForTimeout(1000);
    
    // Check if first response is restored
    await expect(page.locator('[data-testid="choice-a"]')).toBeChecked();
    
    // Go forward again
    await page.goForward();
    await page.waitForTimeout(1000);
    
    // Check if second response is restored
    await expect(page.locator('[data-testid="choice-b"]')).toBeChecked();
    
    console.log('✅ Response persistence works!');
  });

  test('PRODUCTION: Complete flow reaches results page', async ({ page }) => {
    console.log('🎭 Testing complete flow to results...');
    
    // Navigate to first dilemma
    await page.click('text=Start Exploring');
    await page.waitForURL(/\/explore\/.+/);
    
    // Complete 3 dilemmas quickly
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid="choice-a"]').click();
      
      // Check if this is the last dilemma (Finish button)
      const nextButton = page.locator('[data-testid="next-button"]');
      const buttonText = await nextButton.textContent();
      
      await nextButton.click();
      
      if (buttonText?.includes('Finish')) {
        break;
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Should reach results page
    await page.waitForURL('/results', { timeout: 10000 });
    
    // Should show values
    await expect(page.locator('[data-testid="values-title"]')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Complete flow works!');
  });
});