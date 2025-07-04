import { test, expect, type Page } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete unlimited dilemma answering journey', async ({ page }) => {
    // Start the journey from homepage
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');

    // Answer multiple dilemmas to test unlimited flow
    let dilemmaCount = 0;
    const maxDilemmas = 15; // Test reasonable number for CI
    
    while (dilemmaCount < maxDilemmas) {
      // Wait for dilemma to load
      await page.waitForSelector('[data-testid="dilemma-title"]', { timeout: 10000 });
      
      // Check if we've reached completion
      const completionCard = page.locator('text=Amazing Work!');
      if (await completionCard.isVisible()) {
        break;
      }
      
      // Answer the dilemma
      await page.click('[data-testid="choice-a"]');
      await page.fill('[data-testid="reasoning-input"]', `Test reasoning for dilemma ${dilemmaCount + 1}`);
      await page.click('[data-testid="difficulty-slider"]');
      await page.click('text=Next Question');
      
      dilemmaCount++;
      
      // Check progress indicator
      const progressText = page.locator('text=/Question \\d+ of \\d+/');
      await expect(progressText).toBeVisible();
      
      // After 12 responses, should see early exit option
      if (dilemmaCount >= 12) {
        const earlyExit = page.locator('text=Generate Values Now');
        await expect(earlyExit).toBeVisible();
      }
    }
    
    expect(dilemmaCount).toBeGreaterThan(0);
  });

  test('should handle session persistence across page refresh', async ({ page }) => {
    // Start journey and answer a few dilemmas
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');
    
    // Answer first dilemma
    await page.waitForSelector('[data-testid="dilemma-title"]');
    await page.click('[data-testid="choice-a"]');
    await page.fill('[data-testid="reasoning-input"]', 'First dilemma reasoning');
    await page.click('text=Next Question');
    
    // Answer second dilemma
    await page.waitForSelector('[data-testid="dilemma-title"]');
    await page.click('[data-testid="choice-b"]');
    await page.click('text=Next Question');
    
    // Refresh the page
    await page.reload();
    
    // Should continue from where we left off
    await page.waitForSelector('[data-testid="dilemma-title"]');
    const progressText = page.locator('text=/Question \\d+ of \\d+/');
    await expect(progressText).toBeVisible();
    
    // Should show answered count
    const answeredCount = page.locator('text=/Answered: \\d+/');
    await expect(answeredCount).toBeVisible();
  });

  test('should handle start fresh functionality', async ({ page }) => {
    // Complete some dilemmas first
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');
    
    // Answer a few dilemmas
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('[data-testid="dilemma-title"]');
      await page.click('[data-testid="choice-a"]');
      await page.click('text=Next Question');
    }
    
    // Go back to homepage
    await page.goto('/');
    
    // Start fresh should reset everything
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');
    
    // Should start from question 1
    await page.waitForSelector('text=Question 1 of');
    await page.waitForSelector('text=Answered: 0');
  });

  test('should show completion state with statistics', async ({ page }) => {
    // Mock completion state by using localStorage
    await page.addInitScript(() => {
      const mockResponses = Array.from({ length: 15 }, (_, i) => ({
        dilemmaId: `mock-id-${i}`,
        chosenOption: 'a',
        responseTime: 5000 + i * 100,
        perceivedDifficulty: 5 + (i % 5),
        reasoning: `Mock reasoning ${i}`
      }));
      
      localStorage.setItem('responses', JSON.stringify(mockResponses));
    });
    
    // Navigate to a dilemma that should show completion
    await page.goto('/explore/mock-dilemma-id');
    
    // Should show completion card
    await page.waitForSelector('text=Amazing Work!');
    await expect(page.locator('text=You\'ve completed all')).toBeVisible();
    
    // Should show statistics
    await expect(page.locator('text=/\\d+ Scenarios/')).toBeVisible();
    await expect(page.locator('text=/\\d+s Avg\\. Time/')).toBeVisible();
    await expect(page.locator('text=/\\d+\\.\\d+ Avg\\. Difficulty/')).toBeVisible();
    
    // Should have Generate VALUES.md button
    await expect(page.locator('text=Generate My VALUES.md')).toBeVisible();
    
    // Should have Start Fresh button
    await expect(page.locator('text=Start Fresh Session')).toBeVisible();
  });

  test('should handle storage quota exceeded scenarios', async ({ page }) => {
    // Mock localStorage quota exceeded
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      
      localStorage.setItem = function(key, value) {
        callCount++;
        if (callCount > 5 && key === 'responses') {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        return originalSetItem.call(this, key, value);
      };
    });
    
    // Start journey
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');
    
    // Answer several dilemmas to trigger quota exceeded
    for (let i = 0; i < 8; i++) {
      await page.waitForSelector('[data-testid="dilemma-title"]');
      await page.click('[data-testid="choice-a"]');
      await page.fill('[data-testid="reasoning-input"]', `Long reasoning text for dilemma ${i}`.repeat(10));
      await page.click('text=Next Question');
    }
    
    // Should show storage warning
    await expect(page.locator('text=Storage space low')).toBeVisible();
  });

  test('should handle API rate limiting gracefully', async ({ page }) => {
    // Make rapid requests to trigger rate limiting
    const responses = [];
    
    for (let i = 0; i < 15; i++) {
      const response = await page.request.get('/api/dilemmas/random');
      responses.push(response);
    }
    
    // Some requests should be rate limited
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('should handle network interruptions', async ({ page }) => {
    // Start journey
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');
    
    // Simulate network failure
    await page.route('**/api/dilemmas/**', route => {
      route.abort('failed');
    });
    
    // Try to proceed to next dilemma
    await page.waitForSelector('[data-testid="dilemma-title"]');
    await page.click('[data-testid="choice-a"]');
    await page.click('text=Next Question');
    
    // Should handle error gracefully
    await expect(page.locator('text=Unable to load dilemmas')).toBeVisible();
    
    // Should offer start new session
    await expect(page.locator('text=Start New Session')).toBeVisible();
  });

  test('should maintain progress indicators accurately', async ({ page }) => {
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');
    
    // Answer a few dilemmas and check progress
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[data-testid="dilemma-title"]');
      
      // Check current progress
      const progressText = await page.locator('text=/Question \\d+ of \\d+/').textContent();
      expect(progressText).toContain(`Question ${i + 1} of`);
      
      const answeredText = await page.locator('text=/Answered: \\d+/').textContent();
      expect(answeredText).toContain(`Answered: ${i}`);
      
      // Answer dilemma
      await page.click('[data-testid="choice-a"]');
      await page.click('text=Next Question');
    }
    
    // After 5 answers, should show "Answered: 5"
    await expect(page.locator('text=Answered: 5')).toBeVisible();
  });

  test('should handle early exit after 12 responses', async ({ page }) => {
    // Mock 12 responses
    await page.addInitScript(() => {
      const mockResponses = Array.from({ length: 12 }, (_, i) => ({
        dilemmaId: `mock-id-${i}`,
        chosenOption: 'a',
        responseTime: 5000,
        perceivedDifficulty: 5,
        reasoning: `Mock reasoning ${i}`
      }));
      
      localStorage.setItem('responses', JSON.stringify(mockResponses));
    });
    
    await page.click('text=Generate Your VALUES.md');
    await page.waitForURL('/explore/*');
    
    // Should show early exit option
    await page.waitForSelector('text=Generate Values Now');
    await expect(page.locator('text=You have enough responses for a comprehensive values.md')).toBeVisible();
    
    // Should still allow continuing
    await page.waitForSelector('[data-testid="dilemma-title"]');
    await expect(page.locator('text=Next Question')).toBeVisible();
  });
});