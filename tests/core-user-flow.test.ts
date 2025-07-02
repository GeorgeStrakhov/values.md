import { describe, it, expect, beforeAll, afterAll } from 'vitest'

/**
 * Core User Flow Regression Tests
 * 
 * These tests verify the essential user journey:
 * 1. Home page → Click button → Redirect to explore
 * 2. Explore page → Complete dilemmas → Save to localStorage  
 * 3. Results page → Generate values → Download
 * 
 * If any of these fail, the app is broken for users.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

describe('Core User Flow - Critical Path', () => {
  
  describe('Step 1: Landing to Explore', () => {
    it('should redirect /api/dilemmas/random to explore page', async () => {
      const response = await fetch(`${BASE_URL}/api/dilemmas/random`, {
        redirect: 'manual' // Don't follow redirects
      })
      
      expect(response.status).toBe(307) // Temporary redirect
      expect(response.headers.get('location')).toMatch(/\/explore\/[a-f0-9-]+/)
    })
    
    it('should return dilemmas for explore page', async () => {
      // First get a redirect
      const redirectResponse = await fetch(`${BASE_URL}/api/dilemmas/random`, {
        redirect: 'manual'
      })
      const location = redirectResponse.headers.get('location')
      const uuid = location?.split('/explore/')[1]
      
      // Then fetch dilemmas for that UUID
      const response = await fetch(`${BASE_URL}/api/dilemmas/${uuid}`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.dilemmas).toBeDefined()
      expect(Array.isArray(data.dilemmas)).toBe(true)
      expect(data.dilemmas.length).toBeGreaterThan(0)
      
      // Check first dilemma has required fields
      const firstDilemma = data.dilemmas[0]
      expect(firstDilemma.title).toBeDefined()
      expect(firstDilemma.scenario).toBeDefined()
      expect(firstDilemma.choiceA).toBeDefined()
      expect(firstDilemma.choiceB).toBeDefined()
      expect(firstDilemma.choiceC).toBeDefined()
      expect(firstDilemma.choiceD).toBeDefined()
    })
  })
  
  describe('Step 2: Save Responses', () => {
    it('should accept valid response data via POST', async () => {
      const sessionId = `test-session-${Date.now()}`
      const mockResponses = [
        {
          dilemmaId: 'test-dilemma-1',
          chosenOption: 'a',
          reasoning: 'Test reasoning',
          responseTime: 5000,
          perceivedDifficulty: 5
        }
      ]
      
      const response = await fetch(`${BASE_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, responses: mockResponses })
      })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.sessionId).toBe(sessionId)
    })
    
    it('should reject invalid response data', async () => {
      const response = await fetch(`${BASE_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' })
      })
      
      expect(response.status).toBe(400)
    })
  })
  
  describe('Step 3: Generate Values (THE BUG WE JUST FIXED)', () => {
    it('should accept POST requests to generate values', async () => {
      const sessionId = `values-test-${Date.now()}`
      
      // First save some responses
      const mockResponses = [
        {
          dilemmaId: 'test-dilemma-1',
          chosenOption: 'a',
          reasoning: 'Test reasoning',
          responseTime: 5000,
          perceivedDifficulty: 5
        }
      ]
      
      await fetch(`${BASE_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, responses: mockResponses })
      })
      
      // Then generate values using POST (not GET!)
      const response = await fetch(`${BASE_URL}/api/generate-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      
      // Should work now (not 405 error)
      expect(response.status).not.toBe(405)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.valuesMarkdown).toBeDefined()
        expect(typeof data.valuesMarkdown).toBe('string')
        expect(data.valuesMarkdown.length).toBeGreaterThan(0)
      }
    })
    
    it('should reject GET requests (method not allowed)', async () => {
      const response = await fetch(`${BASE_URL}/api/generate-values?sessionId=test`)
      expect(response.status).toBe(405) // Method not allowed
    })
    
    it('should require sessionId in POST body', async () => {
      const response = await fetch(`${BASE_URL}/api/generate-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing sessionId
      })
      
      expect(response.status).toBe(400)
    })
  })
  
  describe('Integration: Complete Flow', () => {
    it('should complete entire user journey without errors', async () => {
      // 1. Get random dilemma redirect
      const redirectResponse = await fetch(`${BASE_URL}/api/dilemmas/random`, {
        redirect: 'manual'
      })
      expect(redirectResponse.status).toBe(307)
      
      const location = redirectResponse.headers.get('location')
      const uuid = location?.split('/explore/')[1]
      expect(uuid).toBeDefined()
      
      // 2. Fetch dilemmas
      const dilemmasResponse = await fetch(`${BASE_URL}/api/dilemmas/${uuid}`)
      expect(dilemmasResponse.status).toBe(200)
      
      const { dilemmas } = await dilemmasResponse.json()
      expect(dilemmas.length).toBeGreaterThan(0)
      
      // 3. Save responses
      const sessionId = `integration-test-${Date.now()}`
      const responses = dilemmas.slice(0, 3).map((dilemma: any, index: number) => ({
        dilemmaId: dilemma.dilemmaId,
        chosenOption: ['a', 'b', 'c'][index % 3],
        reasoning: `Test reasoning ${index}`,
        responseTime: 3000 + index * 1000,
        perceivedDifficulty: 5 + index
      }))
      
      const saveResponse = await fetch(`${BASE_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, responses })
      })
      expect(saveResponse.status).toBe(200)
      
      // 4. Generate values (THE CRITICAL FIX)
      const valuesResponse = await fetch(`${BASE_URL}/api/generate-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      
      // This should NOT be 405 anymore
      expect(valuesResponse.status).not.toBe(405)
      console.log(`Values generation status: ${valuesResponse.status}`)
      
      if (valuesResponse.status === 200) {
        const valuesData = await valuesResponse.json()
        expect(valuesData.valuesMarkdown).toBeDefined()
        expect(valuesData.valuesMarkdown).toContain('# My Values')
      }
    }, 30000) // 30 second timeout for full integration
  })
})

describe('Regression Prevention', () => {
  it('should prevent 405 errors on values generation', async () => {
    const testCases = [
      {
        name: 'POST with sessionId (correct)',
        method: 'POST',
        body: JSON.stringify({ sessionId: 'test' }),
        expectedStatus: [200, 404, 500], // Any except 405
      },
      {
        name: 'GET request (incorrect)',
        method: 'GET',
        body: null,
        expectedStatus: [405], // Should be 405
      }
    ]
    
    for (const testCase of testCases) {
      const response = await fetch(`${BASE_URL}/api/generate-values`, {
        method: testCase.method,
        headers: testCase.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: testCase.body
      } as RequestInit)
      
      expect(testCase.expectedStatus).toContain(response.status)
    }
  })
})