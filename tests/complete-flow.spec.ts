import { test, expect } from '@playwright/test';

test.describe('Complete User Flow', () => {
  test('user completes full journey: landing → explore → results', async ({ page }) => {
    // 1. Landing page loads
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VALUES.md');
    
    // 2. Click "Generate Your VALUES.md" button
    await page.click('text=Generate Your VALUES.md');
    await expect(page).toHaveURL(/.*explore.*/);
    
    // 3. Wait for dilemmas to load
    await expect(page.locator('text=Question 1 of')).toBeVisible();
    await expect(page.locator('button:has-text("A.")')).toBeVisible();
    
    // 4. Answer first dilemma
    await page.click('button:has-text("A.")');
    await page.fill('textarea[placeholder="Explain your choice..."]', 'Test reasoning');
    await page.click('text=Next');
    
    // 5. Complete all 12 dilemmas (fast automation)
    for (let i = 2; i <= 12; i++) {
      await expect(page.locator(`text=Question ${i} of`)).toBeVisible();
      await page.click('button:has-text("A.")');
      const nextButton = i === 12 ? 'Generate VALUES.md' : 'Next';
      await page.click(`text=${nextButton}`);
    }
    
    // 6. Results page loads
    await expect(page).toHaveURL(/.*results.*/);
    await expect(page.locator('text=Your Values Profile')).toBeVisible();
    
    // 7. Values.md is generated
    await expect(page.locator('text=Your Values.md File')).toBeVisible();
    await expect(page.locator('pre')).toContainText('# My Values');
    
    // 8. Download works
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Download values.md');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('values.md');
  });

  test('handles empty states gracefully', async ({ page }) => {
    // Test API failure scenario
    await page.route('**/api/dilemmas', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ dilemmas: [] })
    }));
    
    await page.goto('/explore');
    await expect(page.locator('text=No dilemmas available')).toBeVisible();
  });

  test('research export works', async ({ page }) => {
    await page.goto('/research');
    await expect(page.locator('text=Research Dataset')).toBeVisible();
    
    // Test CSV download
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Download Responses CSV');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/values-responses-.*\.csv/);
  });
});

test.describe('Error States', () => {
  test('handles API failures', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/dilemmas', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' })
    }));
    
    await page.goto('/explore');
    await expect(page.locator('text=Failed to load dilemmas')).toBeVisible();
  });

  test('handles localStorage issues', async ({ page }) => {
    // Go to results without localStorage data
    await page.goto('/results');
    await expect(page.locator('text=No responses found')).toBeVisible();
    await expect(page.locator('text=Start Over')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('pages load within performance thresholds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    expect(Date.now() - startTime).toBeLessThan(3000);
    
    await page.click('text=Generate Your VALUES.md');
    const exploreStartTime = Date.now();
    await expect(page.locator('text=Question 1 of')).toBeVisible();
    expect(Date.now() - exploreStartTime).toBeLessThan(3000);
  });
});