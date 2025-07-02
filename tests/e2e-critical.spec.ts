/**
 * Critical E2E Tests - What Users Actually Experience
 * 
 * These tests verify the app works from a user's perspective.
 * If these fail, the app is broken for users.
 */

import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  
  test('User can start exploring and see a dilemma', async ({ page }) => {
    // Go to home page
    await page.goto('/')
    
    // Should see the main CTA
    await expect(page.locator('text=Start Exploring')).toBeVisible()
    
    // Click to start
    await page.click('text=Start Exploring')
    
    // Should redirect to explore page with UUID
    await expect(page).toHaveURL(/\/explore\/[a-f0-9-]{36}/)
    
    // Should NOT be stuck on loading spinner
    const loadingText = page.locator('text=Setting up your session...')
    await expect(loadingText).toBeHidden({ timeout: 10000 })
    
    // Should show actual dilemma content
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="dilemma-scenario"]')).toBeVisible()
    await expect(page.locator('[data-testid="choice-a"]')).toBeVisible()
    await expect(page.locator('[data-testid="choice-b"]')).toBeVisible()
    await expect(page.locator('[data-testid="choice-c"]')).toBeVisible()
    await expect(page.locator('[data-testid="choice-d"]')).toBeVisible()
  })

  test('User can select a choice and progress', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Exploring')
    
    // Wait for dilemma to load
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible({ timeout: 10000 })
    
    // Select choice A
    await page.click('[data-testid="choice-a"]')
    
    // Should show as selected
    const choiceA = page.locator('[data-testid="choice-a"]')
    await expect(choiceA).toHaveAttribute('data-selected', 'true')
    
    // Should be able to add reasoning
    const reasoningInput = page.locator('[data-testid="reasoning-input"]')
    await reasoningInput.fill('This is my reasoning for choice A')
    
    // Should be able to submit
    const nextButton = page.locator('[data-testid="next-button"]')
    await expect(nextButton).toBeEnabled()
    await nextButton.click()
    
    // Should progress to next dilemma OR results page
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/explore\/[a-f0-9-]{36}|\/results/)
  })

  test('User cannot get stuck in broken navigation', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Exploring')
    
    // Wait for content to load
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible({ timeout: 15000 })
    
    // Should not have any JavaScript errors
    page.on('pageerror', (error) => {
      expect(error.message).not.toContain('router.push')
      expect(error.message).not.toContain('Cannot read properties')
    })
    
    // Should be able to refresh and maintain progress
    await page.reload()
    
    // Should not show loading spinner forever
    const loadingText = page.locator('text=Setting up your session...')
    await expect(loadingText).toBeHidden({ timeout: 10000 })
  })

  test('Health check reflects actual app status', async ({ request }) => {
    const response = await request.get('/api/health')
    const health = await response.json()
    
    // If app is working, health should be 'pass'
    expect(health.status).toBe('pass')
    
    // Critical components should be working
    expect(health.checks.database.status).toBe('pass')
    expect(health.checks.dilemmas.status).toBe('pass')
    expect(health.checks.responsesAPI.status).toBe('pass')
  })

  test('User sees progress indication', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Exploring')
    
    // Wait for dilemma to load
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible({ timeout: 10000 })
    
    // Should show progress indicator
    const progressBar = page.locator('[data-testid="progress-bar"]')
    await expect(progressBar).toBeVisible()
    
    // Should show something like "1 of 12" or similar
    const progressText = page.locator('[data-testid="progress-text"]')
    await expect(progressText).toContainText(/\d+/)
  })

  test('App does not show "0 responses" bug', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Exploring')
    
    // Complete at least one response
    await expect(page.locator('[data-testid="dilemma-title"]')).toBeVisible({ timeout: 10000 })
    await page.click('[data-testid="choice-a"]')
    await page.locator('[data-testid="reasoning-input"]').fill('Test response')
    
    // Check for the dreaded "0 responses" text
    await expect(page.locator('text=0 responses')).not.toBeVisible()
    
    // Should show actual progress
    const progressText = page.locator('[data-testid="progress-text"]') 
    await expect(progressText).not.toContainText('0')
  })
})

test.describe('Error Scenarios', () => {
  
  test('App handles network errors gracefully', async ({ page }) => {
    // Intercept and fail API calls
    await page.route('/api/dilemmas/*', route => {
      route.abort('failed')
    })
    
    await page.goto('/')
    await page.click('text=Start Exploring')
    
    // Should show error state, not loading forever
    await expect(page.locator('text=Error loading dilemmas')).toBeVisible({ timeout: 10000 })
  })

  test('Invalid routes redirect appropriately', async ({ page }) => {
    // Go to invalid dilemma UUID
    await page.goto('/explore/invalid-uuid')
    
    // Should redirect to home or show error, not crash
    await expect(page).toHaveURL(/\/$|\/explore\/[a-f0-9-]{36}/, { timeout: 10000 })
  })
})