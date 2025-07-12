/**
 * API Integration Tests - Real API Contract Testing
 * 
 * Tests the actual API endpoints and their contracts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([
            {
              chosenOption: 'a',
              reasoning: 'Test reasoning',
              responseTime: 30000,
              perceivedDifficulty: 5,
              choiceAMotif: 'NUMBERS_FIRST',
              choiceBMotif: 'PERSON_FIRST',
              choiceCMotif: 'RULES_FIRST',
              choiceDMotif: 'SAFETY_FIRST',
              domain: 'medical',
              difficulty: 7,
              title: 'Test Dilemma'
            }
          ]))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve({ insertId: 'test-id' }))
    }))
  }
}))

// Mock auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

describe('🌐 API Integration Tests', () => {
  
  describe('📊 /api/generate-values', () => {
    it('should return valid VALUES.md for valid session', async () => {
      const { POST } = await import('@/app/api/generate-values/route')
      
      const request = new NextRequest('http://localhost:3000/api/generate-values', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'test-session-123' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.valuesMarkdown).toContain('# My Values')
      expect(data.valuesMarkdown).toContain('Core Ethical Framework')
      expect(data.generationMethod).toBe('combinatorial')
      expect(data.responseCount).toBe(1)
      expect(data.timestamp).toBeDefined()
    })

    it('should return 400 for missing sessionId', async () => {
      const { POST } = await import('@/app/api/generate-values/route')
      
      const request = new NextRequest('http://localhost:3000/api/generate-values', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Session ID is required')
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const { db } = await import('@/lib/db')
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const { POST } = await import('@/app/api/generate-values/route')
      
      const request = new NextRequest('http://localhost:3000/api/generate-values', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'test-session' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate values')
    })
  })

  describe('🎯 /api/dilemmas/random', () => {
    it('should return valid dilemma redirect', async () => {
      // Mock dilemma data
      const { db } = await import('@/lib/db')
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([
              { dilemmaId: 'test-dilemma-uuid-123' }
            ]))
          }))
        }))
      } as any)

      const { GET } = await import('@/app/api/dilemmas/random/route')
      
      const request = new NextRequest('http://localhost:3000/api/dilemmas/random')
      const response = await GET(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('Location')).toContain('/explore/test-dilemma-uuid-123')
    })
  })

  describe('🔒 Authentication & Security', () => {
    it('should protect admin endpoints', async () => {
      const { getServerSession } = await import('next-auth')
      vi.mocked(getServerSession).mockResolvedValue(null)

      const { POST } = await import('@/app/api/admin/generate-dilemma/route')
      
      const request = new NextRequest('http://localhost:3000/api/admin/generate-dilemma', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Test prompt' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('📊 Performance & Load', () => {
    it('should handle concurrent requests', async () => {
      const { POST } = await import('@/app/api/generate-values/route')
      
      const requests = Array.from({ length: 5 }, (_, i) => 
        new NextRequest('http://localhost:3000/api/generate-values', {
          method: 'POST',
          body: JSON.stringify({ sessionId: `concurrent-session-${i}` })
        })
      )

      const promises = requests.map(request => POST(request))
      const responses = await Promise.all(promises)

      // All requests should complete successfully
      responses.forEach((response, i) => {
        expect(response.status).toBe(200)
      })
    })

    it('should have reasonable response times', async () => {
      const { POST } = await import('@/app/api/generate-values/route')
      
      const request = new NextRequest('http://localhost:3000/api/generate-values', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 'performance-test' })
      })

      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete in under 5 seconds
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
})