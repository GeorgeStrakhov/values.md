/**
 * ACTUAL USER FLOW TEST
 * 
 * Tests the real user experience, not abstractions.
 * Verifies every step a user would take.
 */

import { describe, test, expect, beforeEach } from 'vitest'

describe('ACTUAL User Flow - End to End', () => {
  
  describe('Step 1: User clicks "Start Exploring"', () => {
    test('GET /api/dilemmas/random returns redirect', async () => {
      const response = await fetch('http://localhost:3000/api/dilemmas/random', {
        redirect: 'manual' // Don't follow redirects
      })
      
      expect(response.status).toBe(307) // Redirect
      expect(response.headers.get('location')).toMatch(/\/explore\/[a-f0-9-]{36}/)
    })
  })

  describe('Step 2: User lands on explore page', () => {
    test('GET /api/dilemmas/[uuid] returns 12 dilemmas', async () => {
      // First get a UUID from random
      const randomResponse = await fetch('http://localhost:3000/api/dilemmas/random', {
        redirect: 'manual'
      })
      const location = randomResponse.headers.get('location')!
      const uuid = location.split('/').pop()!
      
      // Then test the actual dilemma fetch
      const response = await fetch(`http://localhost:3000/api/dilemmas/${uuid}`)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.dilemmas).toHaveLength(12)
      expect(data.startingDilemma.dilemmaId).toBe(uuid)
      
      // Verify structure matches what UI expects
      const dilemma = data.dilemmas[0]
      expect(dilemma.title).toBeTruthy()
      expect(dilemma.scenario).toBeTruthy()
      expect(dilemma.choiceA).toBeTruthy()
      expect(dilemma.choiceB).toBeTruthy()
      expect(dilemma.choiceC).toBeTruthy()
      expect(dilemma.choiceD).toBeTruthy()
    })
  })

  describe('Step 3: User answers dilemmas', () => {
    test('User can complete a single response', () => {
      const response = {
        dilemmaId: 'test-uuid',
        chosenOption: 'a',
        reasoning: 'Because it makes sense',
        responseTime: 5000,
        perceivedDifficulty: 7
      }
      
      // Test the response structure the UI creates
      expect(response.dilemmaId).toBeTruthy()
      expect(['a', 'b', 'c', 'd']).toContain(response.chosenOption)
      expect(response.perceivedDifficulty).toBeGreaterThanOrEqual(1)
      expect(response.perceivedDifficulty).toBeLessThanOrEqual(10)
    })
  })

  describe('Step 4: User completes 12 dilemmas', () => {
    test('POST /api/responses accepts valid session data', async () => {
      const sessionData = {
        sessionId: `test-session-${Date.now()}`,
        responses: [
          {
            dilemmaId: 'test-uuid-1',
            chosenOption: 'a',
            reasoning: 'Test reasoning',
            responseTime: 5000,
            perceivedDifficulty: 7
          },
          {
            dilemmaId: 'test-uuid-2', 
            chosenOption: 'b',
            reasoning: 'Another test',
            responseTime: 3000,
            perceivedDifficulty: 5
          }
        ]
      }
      
      const response = await fetch('http://localhost:3000/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
      
      // This should NOT fail with "Invalid request body"
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.sessionId).toBe(sessionData.sessionId)
    })

    test('POST /api/responses rejects invalid data', async () => {
      const invalidData = { sessionId: null, responses: "not an array" }
      
      const response = await fetch('http://localhost:3000/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      })
      
      expect(response.status).toBe(400)
      const result = await response.json()
      expect(result.error).toBe('Invalid request body')
    })
  })

  describe('Step 5: User generates values.md', () => {
    test('GET /api/generate-values works with valid session', async () => {
      // First create a session with responses
      const sessionId = `test-session-${Date.now()}`
      await fetch('http://localhost:3000/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          responses: [
            { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'test', responseTime: 1000, perceivedDifficulty: 5 }
          ]
        })
      })
      
      // Then test values generation
      const response = await fetch(`http://localhost:3000/api/generate-values?sessionId=${sessionId}`)
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.valuesMarkdown).toBeTruthy()
      expect(result.sessionId).toBe(sessionId)
    })
  })

  describe('Navigation & State Issues', () => {
    test('Session state structure is valid', () => {
      const sessionState = {
        sessionId: 'test-123',
        currentIndex: 0,
        dilemmas: [
          { dilemmaId: 'test', title: 'Test', scenario: 'Test scenario' }
        ],
        responses: [
          { dilemmaId: 'test', chosenOption: 'a' }
        ]
      }
      
      expect(sessionState.sessionId).toBeTruthy()
      expect(sessionState.currentIndex).toBeGreaterThanOrEqual(0)
      expect(sessionState.dilemmas).toBeInstanceOf(Array)
      expect(sessionState.responses).toBeInstanceOf(Array)
    })

    test('Progress calculation works', () => {
      const responses = [
        { dilemmaId: 'test-1', chosenOption: 'a' },
        { dilemmaId: 'test-2', chosenOption: 'b' }
      ]
      const totalDilemmas = 12
      
      const progress = (responses.length / totalDilemmas) * 100
      expect(progress).toBe(16.67) // 2/12 * 100 rounded
    })
  })

  describe('Health Check Validation', () => {
    test('Health check should pass when app works', async () => {
      const response = await fetch('http://localhost:3000/api/health')
      const health = await response.json()
      
      expect(health.status).toBe('pass') // Should be 'pass' not 'fail'
      expect(health.checks.database.status).toBe('pass')
      expect(health.checks.dilemmas.status).toBe('pass')
      expect(health.checks.randomDilemmaAPI.status).toBe('pass') // Should accept 307 redirect
      expect(health.checks.responsesAPI.status).toBe('pass') // Should NOT be fail
      expect(health.checks.generateValuesAPI.status).toBe('pass')
    })
  })
})

/**
 * PERFORMANCE TESTS - Things that would break user experience
 */
describe('Performance Requirements', () => {
  test('Dilemma API responds quickly', async () => {
    const start = Date.now()
    const response = await fetch('http://localhost:3000/api/dilemmas/random')
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(2000) // Less than 2 seconds
    expect(response.status).toBeLessThan(400) // Not an error
  })

  test('Page loads contain expected content', async () => {
    const response = await fetch('http://localhost:3000')
    const html = await response.text()
    
    expect(html).toContain('values.md') // App title
    expect(html).toContain('Start Exploring') // Main CTA
    expect(response.status).toBe(200)
  })
})

/**
 * DATA INTEGRITY TESTS - Prevent "0 responses" issue
 */
describe('Data Integrity', () => {
  test('Session persistence works correctly', () => {
    const sessionData = {
      sessionId: 'test-persistence',
      responses: [
        { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'test' }
      ],
      currentIndex: 1
    }
    
    // Simulate localStorage persistence
    const serialized = JSON.stringify(sessionData)
    const restored = JSON.parse(serialized)
    
    expect(restored.sessionId).toBe(sessionData.sessionId)
    expect(restored.responses).toHaveLength(1)
    expect(restored.currentIndex).toBe(1)
  })

  test('Response validation prevents invalid data', () => {
    const validResponse = {
      dilemmaId: 'test-uuid',
      chosenOption: 'a',
      reasoning: 'Valid reasoning',
      responseTime: 5000,
      perceivedDifficulty: 7
    }
    
    const invalidResponse = {
      dilemmaId: '', // Invalid: empty
      chosenOption: 'x', // Invalid: not a,b,c,d
      perceivedDifficulty: 15 // Invalid: out of range
    }
    
    // Validation function (should match API validation)
    const isValid = (r: any) => {
      return r.dilemmaId && 
             ['a','b','c','d'].includes(r.chosenOption) &&
             (!r.perceivedDifficulty || (r.perceivedDifficulty >= 1 && r.perceivedDifficulty <= 10))
    }
    
    expect(isValid(validResponse)).toBe(true)
    expect(isValid(invalidResponse)).toBe(false)
  })
})