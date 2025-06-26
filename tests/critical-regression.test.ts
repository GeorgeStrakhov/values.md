/**
 * Critical Regression Tests
 * 
 * These tests would have caught the exact errors we experienced:
 * 1. "No responses found" error
 * 2. Broken manual navigation after auto-advance
 * 3. Missing motif data from broken seed scripts
 */

import { test, expect } from '@playwright/test';
import { setupBrowserTest, waitForDilemmaToLoad, fillDilemmaForm, getLocalStorageData } from './test-utils';

test.describe('Critical Regression Tests', () => {

  test.beforeEach(async ({ page }) => {
    await setupBrowserTest(page);
  });

  test('REGRESSION 1: Complete dilemma flow does NOT show "No responses found"', async ({ page }) => {
    // This test would have caught our biggest bug
    
    // Start the flow
    await page.goto('/');
    await page.click('text=Start Exploring');
    
    // Wait for first dilemma to load
    await waitForDilemmaToLoad(page);
    
    // Complete 3 dilemmas to ensure we have data
    for (let i = 0; i < 3; i++) {
      await fillDilemmaForm(page, 'a', `Reasoning for dilemma ${i + 1}`, 7);
      
      // Verify response is saved to localStorage immediately
      const storedData = await getLocalStorageData(page, 'dilemma-session');
      expect(storedData).toBeTruthy();
      expect(storedData.responses).toHaveLength(i + 1);
      expect(storedData.sessionId).toBeTruthy();
      
      // Navigate to next (or finish if last)
      if (i === 2) {
        await page.click('[data-testid="next-button"]');
      } else {
        await page.click('[data-testid="next-button"]');
        await waitForDilemmaToLoad(page);
      }
    }
    
    // Should be on results page
    await page.waitForURL('/results');
    
    // CRITICAL: Should NOT show "No responses found" error
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    
    // Should show actual values content
    await expect(page.locator('[data-testid="values-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible();
    
    // Verify values contain real data, not placeholder content
    const valuesContent = await page.locator('pre').textContent();
    expect(valuesContent).toBeTruthy();
    expect(valuesContent).toContain('My Values');
    expect(valuesContent).toContain('Based on my responses');
    
    // Should NOT contain placeholder text that indicates missing motif data
    expect(valuesContent).not.toContain('Mixed Approaches');
    expect(valuesContent).not.toContain('Apply consistent ethical principles');
  });

  test('REGRESSION 2: Manual navigation works after auto-advance', async ({ page }) => {
    // This test would have caught the coordination bug
    
    await page.goto('/');
    await page.click('text=Start Exploring');
    await waitForDilemmaToLoad(page);
    
    const initialUrl = page.url();
    
    // Select an option to trigger auto-advance
    await page.click('[data-testid="choice-a"]');
    
    // Should show auto-advance countdown
    await expect(page.locator('text=Auto-advancing')).toBeVisible();
    
    // Wait for auto-advance to complete (3 seconds + buffer)
    await page.waitForTimeout(4000);
    
    // URL should have changed from auto-advance
    expect(page.url()).not.toBe(initialUrl);
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible();
    
    // Now test that MANUAL navigation still works
    const urlAfterAutoAdvance = page.url();
    
    // Select another option and manually click Next
    await page.click('[data-testid="choice-b"]');
    await page.click('[data-testid="next-button"]');
    
    // Should navigate to next dilemma
    await page.waitForTimeout(1000);
    expect(page.url()).not.toBe(urlAfterAutoAdvance);
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible();
    
    // Manual Previous navigation should also work
    await page.click('[data-testid="previous-button"]');
    await page.waitForTimeout(1000);
    expect(page.url()).toBe(urlAfterAutoAdvance);
  });

  test('REGRESSION 3: Previous responses are restored correctly', async ({ page }) => {
    // This would catch localStorage persistence issues
    
    await page.goto('/');
    await page.click('text=Start Exploring');
    await waitForDilemmaToLoad(page);
    
    // Fill first dilemma
    await fillDilemmaForm(page, 'a', 'First reasoning', 6);
    await page.click('[data-testid="next-button"]');
    await waitForDilemmaToLoad(page);
    
    // Fill second dilemma  
    await fillDilemmaForm(page, 'c', 'Second reasoning', 8);
    await page.click('[data-testid="next-button"]');
    await waitForDilemmaToLoad(page);
    
    // Go back to second dilemma
    await page.click('[data-testid="previous-button"]');
    await page.waitForTimeout(500);
    
    // Second response should be restored
    await expect(page.locator('[data-testid="choice-c"]')).toBeChecked();
    await expect(page.locator('textarea')).toHaveValue('Second reasoning');
    
    // Go back to first dilemma
    await page.click('[data-testid="previous-button"]');
    await page.waitForTimeout(500);
    
    // First response should be restored
    await expect(page.locator('[data-testid="choice-a"]')).toBeChecked();
    await expect(page.locator('textarea')).toHaveValue('First reasoning');
    
    // Verify localStorage has both responses
    const storedData = await getLocalStorageData(page, 'dilemma-session');
    expect(storedData.responses).toHaveLength(2);
    expect(storedData.responses[0].chosenOption).toBe('a');
    expect(storedData.responses[1].chosenOption).toBe('c');
  });

  test('REGRESSION 4: Database contains real motif data', async ({ page }) => {
    // This would catch broken seed script paths
    
    // Test that we can access the API and get real data
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/dilemmas/random');
      return { status: res.status, redirected: res.redirected, url: res.url };
    });
    
    expect(response.status).toBe(200);
    expect(response.redirected).toBe(true);
    expect(response.url).toMatch(/\/explore\/[a-f0-9-]+/);
    
    // Go to that dilemma page
    const dilemmaId = response.url.split('/').pop();
    await page.goto(`/explore/${dilemmaId}`);
    await waitForDilemmaToLoad(page);
    
    // Complete one dilemma and check that values generation has real motif data
    await fillDilemmaForm(page, 'a', 'Test reasoning');
    await page.click('[data-testid="next-button"]');
    
    // Complete the remaining dilemmas quickly
    for (let i = 0; i < 10; i++) {
      const isVisible = await page.locator('[data-testid="dilemma-title"]').isVisible();
      if (!isVisible) break;
      
      await fillDilemmaForm(page, 'b');
      await page.click('[data-testid="next-button"]');
      await page.waitForTimeout(500);
    }
    
    // Should reach results
    await page.waitForURL('/results', { timeout: 10000 });
    
    const valuesContent = await page.locator('pre').textContent();
    
    // Should contain actual framework names from CSV data
    expect(valuesContent).toMatch(/(Utilitarian|Deontological|Virtue|Care|Justice)/);
    
    // Should contain computational signatures or logical patterns
    expect(valuesContent).toMatch(/(IF|THEN|maximize|minimize|argmax|optimize)/);
    
    // Should NOT contain generic fallback text
    expect(valuesContent).not.toContain('Mixed Approaches');
    expect(valuesContent).not.toContain('Apply consistent ethical principles');
  });

  test('EDGE CASE: Handles missing localStorage gracefully', async ({ page }) => {
    // Test what happens when localStorage is corrupted/missing
    
    await page.goto('/');
    await page.click('text=Start Exploring');
    await waitForDilemmaToLoad(page);
    
    // Complete one dilemma
    await fillDilemmaForm(page, 'a');
    
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('dilemma-session', 'invalid json{');
    });
    
    // Try to navigate - should handle gracefully
    await page.click('[data-testid="next-button"]');
    
    // Should either recover or show proper error, not crash
    await page.waitForTimeout(2000);
    
    // Page should be functional
    const title = await page.locator('[data-testid="dilemma-title"]');
    const errorMsg = await page.locator('[data-testid="error-message"]');
    
    // Either we're on a dilemma page OR we have a clear error message
    const hasTitle = await title.isVisible();
    const hasError = await errorMsg.isVisible();
    
    expect(hasTitle || hasError).toBe(true);
  });

  test('EDGE CASE: API errors are handled gracefully', async ({ page }) => {
    // Test resilience to API failures
    
    // Try to access non-existent dilemma
    await page.goto('/explore/00000000-0000-0000-0000-000000000000');
    
    // Should show error, not crash
    await expect(page.locator('text=Error loading dilemmas')).toBeVisible();
    
    // Try to go to results without data
    await page.goto('/results');
    
    // Should show "No responses found" error with recovery option
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Start Over')).toBeVisible();
  });

});