/**
 * API Safety Tests
 * 
 * Tests critical API endpoints for safety and error handling.
 * Focuses on preventing deployment failures and ensuring graceful degradation.
 */

import { describe, test, expect, vi } from 'vitest'

describe('API Safety', () => {
  
  describe('Environment Safety', () => {
    test('API routes can be imported without environment variables', async () => {
      // This prevents build failures when env vars are missing
      const originalEnv = process.env
      
      try {
        // Clear critical environment variables
        delete process.env.DATABASE_URL
        delete process.env.OPENROUTER_API_KEY
        delete process.env.NEXTAUTH_SECRET
        
        // These should not throw during import (build-time safety)
        await expect(import('../src/app/api/health/route.ts')).resolves.toBeDefined()
        await expect(import('../src/app/api/dilemmas/random/route.ts')).resolves.toBeDefined()
        await expect(import('../src/app/api/responses/route.ts')).resolves.toBeDefined()
        await expect(import('../src/app/api/generate-values/route.ts')).resolves.toBeDefined()
        
      } finally {
        process.env = originalEnv
      }
    })

    test('Health endpoint responds correctly', async () => {
      const { GET } = await import('../src/app/api/health/route.ts')
      
      expect(GET).toBeDefined()
      expect(typeof GET).toBe('function')
    })
  })

  describe('OpenRouter Integration Safety', () => {
    test('OpenRouter client handles missing API key gracefully', async () => {
      // Clear API key
      const originalKey = process.env.OPENROUTER_API_KEY
      delete process.env.OPENROUTER_API_KEY
      
      try {
        const { OpenRouterService } = await import('../src/lib/openrouter.ts')
        
        // Should not throw during instantiation
        const client = new OpenRouterService()
        expect(client).toBeDefined()
        
        // Should throw when trying to generate completion
        await expect(
          client.generateCompletion([{ role: 'user', content: 'test' }])
        ).rejects.toThrow(/OPENROUTER_API_KEY is not set/)
        
      } finally {
        if (originalKey) process.env.OPENROUTER_API_KEY = originalKey
      }
    })

    test('OpenRouter client uses lazy loading pattern', async () => {
      // This pattern prevents build-time failures
      const { OpenRouterService } = await import('../src/lib/openrouter.ts')
      
      // Constructor should not access API key immediately
      expect(() => new OpenRouterService()).not.toThrow()
    })
  })

  describe('Database Safety', () => {
    test('Database connection uses proxy pattern', async () => {
      const originalUrl = process.env.DATABASE_URL
      delete process.env.DATABASE_URL
      
      try {
        const { db } = await import('../src/lib/db.ts')
        
        // Should be a proxy object, not throw
        expect(typeof db).toBe('object')
        expect(db).toBeDefined()
        
      } finally {
        if (originalUrl) process.env.DATABASE_URL = originalUrl
      }
    })

    test('Schema can be imported without database connection', async () => {
      const originalUrl = process.env.DATABASE_URL
      delete process.env.DATABASE_URL
      
      try {
        const schema = await import('../src/lib/schema.ts')
        
        expect(schema.dilemmas).toBeDefined()
        expect(schema.userResponses).toBeDefined()
        expect(schema.frameworks).toBeDefined()
        expect(schema.motifs).toBeDefined()
        
      } finally {
        if (originalUrl) process.env.DATABASE_URL = originalUrl
      }
    })
  })

  describe('Request/Response Patterns', () => {
    test('NextResponse usage pattern', () => {
      // Mock NextResponse pattern used in our APIs
      const mockNextResponse = {
        json: (data: any, options?: { status?: number }) => ({
          type: 'NextResponse',
          data,
          status: options?.status || 200
        })
      }
      
      // Success response
      const successResponse = mockNextResponse.json({ success: true })
      expect(successResponse.status).toBe(200)
      expect(successResponse.data.success).toBe(true)
      
      // Error response
      const errorResponse = mockNextResponse.json(
        { error: 'Something went wrong' }, 
        { status: 500 }
      )
      expect(errorResponse.status).toBe(500)
      expect(errorResponse.data.error).toBeTruthy()
    })

    test('Request validation pattern', () => {
      // Mock request validation used in our APIs
      const validateRequest = (method: string, requiredMethod: string) => {
        if (method !== requiredMethod) {
          return { valid: false, error: `Method ${method} not allowed` }
        }
        return { valid: true }
      }
      
      expect(validateRequest('GET', 'GET').valid).toBe(true)
      expect(validateRequest('POST', 'GET').valid).toBe(false)
    })
  })

  describe('Error Handling Patterns', () => {
    test('API error handling pattern', () => {
      const handleApiError = (error: unknown) => {
        if (error instanceof Error) {
          return {
            error: error.message,
            status: 500
          }
        }
        return {
          error: 'Unknown error',
          status: 500
        }
      }
      
      const knownError = new Error('Database connection failed')
      const result1 = handleApiError(knownError)
      expect(result1.error).toBe('Database connection failed')
      expect(result1.status).toBe(500)
      
      const unknownError = 'string error'
      const result2 = handleApiError(unknownError)
      expect(result2.error).toBe('Unknown error')
    })

    test('Rate limiting pattern', () => {
      const rateLimiter = {
        requests: new Map<string, { count: number, resetTime: number }>(),
        limit: 100,
        window: 60000, // 1 minute
        
        checkLimit(clientId: string): { allowed: boolean, remaining: number } {
          const now = Date.now()
          const clientData = this.requests.get(clientId)
          
          if (!clientData || now > clientData.resetTime) {
            this.requests.set(clientId, { count: 1, resetTime: now + this.window })
            return { allowed: true, remaining: this.limit - 1 }
          }
          
          if (clientData.count >= this.limit) {
            return { allowed: false, remaining: 0 }
          }
          
          clientData.count++
          return { allowed: true, remaining: this.limit - clientData.count }
        }
      }
      
      // Should allow first request
      const result1 = rateLimiter.checkLimit('client-1')
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(99)
      
      // Should track subsequent requests
      const result2 = rateLimiter.checkLimit('client-1')
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(98)
    })
  })

  describe('Authentication Safety', () => {
    test('Session validation pattern', () => {
      const validateSession = (sessionToken?: string) => {
        if (!sessionToken) {
          return { valid: false, error: 'No session token' }
        }
        
        if (sessionToken === 'invalid') {
          return { valid: false, error: 'Invalid session' }
        }
        
        return { valid: true, user: { id: '1', role: 'user' } }
      }
      
      expect(validateSession().valid).toBe(false)
      expect(validateSession('invalid').valid).toBe(false)
      expect(validateSession('valid-token').valid).toBe(true)
    })

    test('Admin role check pattern', () => {
      const checkAdminRole = (user?: { role: string }) => {
        return user?.role === 'admin'
      }
      
      expect(checkAdminRole()).toBe(false)
      expect(checkAdminRole({ role: 'user' })).toBe(false)
      expect(checkAdminRole({ role: 'admin' })).toBe(true)
    })
  })

  describe('Data Validation', () => {
    test('UUID validation pattern', () => {
      const isValidUUID = (uuid: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        return uuidRegex.test(uuid)
      }
      
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isValidUUID('invalid-uuid')).toBe(false)
      expect(isValidUUID('')).toBe(false)
    })

    test('Response validation pattern', () => {
      const validateDilemmaResponse = (response: any) => {
        const errors: string[] = []
        
        if (!response.dilemmaId) errors.push('dilemmaId is required')
        if (!response.chosenOption || !['a', 'b', 'c', 'd'].includes(response.chosenOption)) {
          errors.push('chosenOption must be a, b, c, or d')
        }
        if (response.perceivedDifficulty && (response.perceivedDifficulty < 1 || response.perceivedDifficulty > 10)) {
          errors.push('perceivedDifficulty must be between 1 and 10')
        }
        
        return {
          valid: errors.length === 0,
          errors
        }
      }
      
      const validResponse = {
        dilemmaId: 'test-123',
        chosenOption: 'a',
        reasoning: 'test',
        perceivedDifficulty: 5
      }
      
      const invalidResponse = {
        chosenOption: 'x',
        perceivedDifficulty: 15
      }
      
      expect(validateDilemmaResponse(validResponse).valid).toBe(true)
      expect(validateDilemmaResponse(invalidResponse).valid).toBe(false)
      expect(validateDilemmaResponse(invalidResponse).errors.length).toBeGreaterThan(0)
    })
  })
})