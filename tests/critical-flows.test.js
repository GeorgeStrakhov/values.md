/**
 * Critical Flow Tests - Would Have Caught Our Regressions
 * 
 * These tests simulate the exact user interactions that broke:
 * 1. "No responses found" error
 * 2. Broken navigation (manual next button)
 * 3. Auto-advance not working
 * 4. Missing motif data
 */

import { test, expect } from '@playwright/test';

// Helper to create a consistent test session
async function setupTestSession(page) {
  // Clear any existing localStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Start fresh session
  await page.goto('/');
  await page.click('text=Start Exploring');
  await page.waitForLoadState('networkidle');
  
  // Should be on a dilemma page
  await expect(page.url()).toMatch(/\/explore\/[a-f0-9-]+/);
  return page.url();
}

test.describe('Critical User Flows', () => {
  
  test('THE BIG ONE: Complete dilemma journey produces valid results', async ({ page }) => {
    // This test would have caught the "No responses found" error
    
    await setupTestSession(page);
    
    // Answer 3 dilemmas completely
    for (let i = 0; i < 3; i++) {
      // Wait for dilemma to load
      await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible();
      
      // Select an option
      await page.click('[data-testid="choice-a"]');
      
      // Add reasoning
      await page.fill('textarea[placeholder*="reasoning"]', `Test reasoning for dilemma ${i + 1}`);
      
      // Set difficulty
      await page.click('[data-testid="difficulty-slider"]');
      
      // Click Next (testing manual navigation)
      await page.click('text=Next');
      
      // Verify URL changed (this would catch broken navigation)
      await page.waitForURL(/\/explore\/[a-f0-9-]+/);
      
      // Verify responses are being saved to localStorage
      const storedData = await page.evaluate(() => {
        const stored = localStorage.getItem('dilemma-session');
        return stored ? JSON.parse(stored) : null;
      });
      
      expect(storedData).toBeTruthy();
      expect(storedData.responses).toHaveLength(i + 1);
      expect(storedData.sessionId).toBeTruthy();
    }
    
    // Complete final dilemma
    await page.click('[data-testid="choice-b"]');
    await page.click('text=Finish');
    
    // Should redirect to results
    await page.waitForURL('/results');
    
    // CRITICAL: Should NOT show "No responses found"
    await expect(page.locator('text=No responses found')).not.toBeVisible();
    
    // Should show actual values content
    await expect(page.locator('text=My Values')).toBeVisible();
    await expect(page.locator('text=Download values.md')).toBeVisible();
    
    // Verify values.md contains real motif data (not placeholders)
    const valuesContent = await page.locator('pre').textContent();
    expect(valuesContent).toContain('Based on my responses');
    expect(valuesContent).not.toContain('Mixed Approaches'); // Placeholder text
  });

  test('Auto-advance works and coordinates with manual navigation', async ({ page }) => {
    // This test would have caught the auto-advance navigation bug
    
    await setupTestSession(page);
    
    // Select an option to trigger auto-advance
    await page.click('[data-testid="choice-a"]');
    
    // Should show auto-advance countdown
    await expect(page.locator('text=Auto-advancing')).toBeVisible();
    
    // Wait for auto-advance to complete (3 seconds)
    await page.waitForTimeout(3500);
    
    // Should have automatically navigated to next dilemma
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible();
    
    // URL should have changed
    await expect(page.url()).toMatch(/\/explore\/[a-f0-9-]+/);
    
    // Now test manual navigation still works
    await page.click('[data-testid="choice-c"]');
    await page.click('text=Next');
    
    // Should navigate manually without issues
    await page.waitForURL(/\/explore\/[a-f0-9-]+/);
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible();
  });

  test('Responses persist correctly across navigation', async ({ page }) => {
    // This test would have caught localStorage persistence issues
    
    await setupTestSession(page);
    
    // Answer first dilemma
    await page.click('[data-testid="choice-a"]');
    await page.fill('textarea', 'First dilemma reasoning');
    await page.click('text=Next');
    
    // Answer second dilemma  
    await page.click('[data-testid="choice-b"]');
    await page.fill('textarea', 'Second dilemma reasoning');
    await page.click('text=Next');
    
    // Go back to previous dilemma
    await page.click('text=Previous');
    
    // Previous response should be restored
    await expect(page.locator('[data-testid="choice-b"]')).toBeChecked();
    await expect(page.locator('textarea')).toHaveValue('Second dilemma reasoning');
    
    // Go back again
    await page.click('text=Previous');
    
    // First response should be restored
    await expect(page.locator('[data-testid="choice-a"]')).toBeChecked();
    await expect(page.locator('textarea')).toHaveValue('First dilemma reasoning');
    
    // Verify localStorage contains both responses
    const storedData = await page.evaluate(() => {
      const stored = localStorage.getItem('dilemma-session');
      return stored ? JSON.parse(stored) : null;
    });
    
    expect(storedData.responses).toHaveLength(2);
    expect(storedData.responses[0].chosenOption).toBe('a');
    expect(storedData.responses[1].chosenOption).toBe('b');
  });

  test('Database integration works with real motif data', async ({ page }) => {
    // This test would have caught missing motif data and broken seed scripts
    
    await setupTestSession(page);
    
    // Complete at least one dilemma
    await page.click('[data-testid="choice-a"]');
    await page.click('text=Finish');
    
    await page.waitForURL('/results');
    
    // Should generate values with REAL motif data
    const valuesContent = await page.locator('pre').textContent();
    
    // Should contain actual framework names from our CSV data
    expect(valuesContent).toMatch(/(Utilitarian|Deontological|Virtue|Care|Justice)/);
    
    // Should contain actual motif descriptions, not fallbacks
    expect(valuesContent).not.toContain('Apply consistent ethical principles'); // Fallback text
    
    // Should contain behavioral indicators from motif data
    expect(valuesContent).toMatch(/(chooses|weighs|considers|focuses|prioritizes)/);
    
    // Should contain logical patterns
    expect(valuesContent).toMatch(/(IF|THEN|maximize|minimize|optimize)/);
  });

  test('Error states are handled gracefully', async ({ page }) => {
    // Test what happens when things go wrong
    
    // Try to access results without completing dilemmas
    await page.goto('/results');
    
    await expect(page.locator('text=No responses found')).toBeVisible();
    await expect(page.locator('text=Start Over')).toBeVisible();
    
    // Try to access non-existent dilemma
    await page.goto('/explore/00000000-0000-0000-0000-000000000000');
    
    await expect(page.locator('text=Error loading dilemmas')).toBeVisible();
  });

  test('API endpoints handle edge cases correctly', async ({ page }) => {
    // Test API reliability under various conditions
    
    // Test responses API with invalid data
    const responseInvalid = await page.evaluate(async () => {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: '', responses: [] })
      });
      return { status: response.status, data: await response.json() };
    });
    
    expect(responseInvalid.status).toBe(400);
    expect(responseInvalid.data.error).toContain('Invalid request body');
    
    // Test values generation with non-existent session
    const responseNonExistent = await page.evaluate(async () => {
      const response = await fetch('/api/generate-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'non-existent-session' })
      });
      return { status: response.status, data: await response.json() };
    });
    
    expect(responseNonExistent.status).toBe(404);
    expect(responseNonExistent.data.error).toContain('No responses found');
  });

});

test.describe('Performance and Reliability', () => {
  
  test('App loads quickly and handles concurrent users', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    
    // Test that multiple sessions don't interfere
    const sessionId1 = await page.evaluate(() => {
      const stored = localStorage.getItem('dilemma-session');
      return stored ? JSON.parse(stored).sessionId : null;
    });
    
    // Open in new context (simulating different user)
    const context2 = await page.context().browser().newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    
    const sessionId2 = await page2.evaluate(() => {
      const stored = localStorage.getItem('dilemma-session');
      return stored ? JSON.parse(stored).sessionId : null;
    });
    
    expect(sessionId1).not.toBe(sessionId2);
    await context2.close();
  });

});