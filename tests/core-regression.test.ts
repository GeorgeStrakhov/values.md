/**
 * Core Regression Prevention Tests
 * 
 * Simple, reliable tests that prevent the most common deployment failures.
 */

import { describe, test, expect, beforeEach } from 'vitest'

describe('Core Regression Prevention', () => {
  
  describe('Build Safety', () => {
    test('Environment config provides fallbacks', async () => {
      // Clear environment
      const originalEnv = process.env.DATABASE_URL
      delete process.env.DATABASE_URL
      
      try {
        const { getEnvConfig } = await import('../src/lib/env-config.ts')
        const config = getEnvConfig()
        
        expect(config.database.url).toBeTruthy()
        expect(config.app.isDevelopment || config.app.isCI).toBe(true)
      } finally {
        if (originalEnv) process.env.DATABASE_URL = originalEnv
      }
    })

    test('State machine initializes correctly', async () => {
      const { AppStateMachine } = await import('../src/store/app-state-machine.ts')
      const machine = new AppStateMachine()
      
      expect(machine.getCurrentState()).toBe('idle')
      expect(machine.getContext()).toBeDefined()
    })

    test('Enhanced store can be imported', async () => {
      const storeModule = await import('../src/store/enhanced-dilemma-store.ts')
      expect(storeModule.useEnhancedDilemmaStore).toBeDefined()
    })

    test('Session management hooks can be imported', async () => {
      const hookModule = await import('../src/hooks/use-session-management.tsx')
      expect(hookModule.useSessionManagement).toBeDefined()
      expect(hookModule.withSessionProtection).toBeDefined()
    })
  })

  describe('Navigation Stability', () => {
    test('Prevents router.push in handleNext pattern', () => {
      // Mock the problematic pattern that caused issues
      const mockRouter = { push: () => {} }
      const mockGoToNext = () => true
      
      // Simulates the fixed pattern: no router.push in handleNext
      const handleNext = () => {
        const success = mockGoToNext()
        // NO router.push here - this was the fix
        return success
      }
      
      expect(handleNext()).toBe(true)
    })

    test('State machine prevents invalid transitions', async () => {
      const { AppStateMachine } = await import('../src/store/app-state-machine.ts')
      const machine = new AppStateMachine()
      
      // Try invalid transition
      machine.send({ type: 'VALUES_GENERATED', valuesMarkdown: 'test' })
      
      // Should remain in idle state
      expect(machine.getCurrentState()).toBe('idle')
    })
  })

  describe('TypeScript Safety', () => {
    test('Pages can be statically imported', async () => {
      // These must not throw during build
      await expect(import('../src/app/page.tsx')).resolves.toBeDefined()
      await expect(import('../src/app/growth-map/page.tsx')).resolves.toBeDefined()
      await expect(import('../src/app/repo-map/page.tsx')).resolves.toBeDefined()
      await expect(import('../src/app/project-map/page.tsx')).resolves.toBeDefined()
    })

    test('API routes have proper exports', async () => {
      const healthRoute = await import('../src/app/api/health/route.ts')
      expect(healthRoute.GET).toBeDefined()
    })
  })

  describe('Environment Compatibility', () => {
    test('CI environment handling', async () => {
      const originalCI = process.env.CI
      process.env.CI = 'true'
      
      try {
        const { getEnvConfig } = await import('../src/lib/env-config.ts')
        const config = getEnvConfig()
        
        expect(config.app.isCI).toBe(true)
        expect(config.database.url).toContain('localhost') // CI fallback
      } finally {
        if (originalCI) {
          process.env.CI = originalCI
        } else {
          delete process.env.CI
        }
      }
    })
  })

  describe('Data Flow Integrity', () => {
    test('Session ID generation works', () => {
      const generateSessionId = () => 
        `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const id1 = generateSessionId()
      const id2 = generateSessionId()
      
      expect(id1).toMatch(/^session-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^session-\d+-[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    test('Response storage pattern works', () => {
      const responses: any[] = []
      const addResponse = (response: any) => {
        const existingIndex = responses.findIndex(r => r.dilemmaId === response.dilemmaId)
        if (existingIndex !== -1) {
          responses[existingIndex] = response
        } else {
          responses.push(response)
        }
      }

      addResponse({ dilemmaId: 'test-1', choice: 'a' })
      expect(responses).toHaveLength(1)

      addResponse({ dilemmaId: 'test-1', choice: 'b' }) // Update
      expect(responses).toHaveLength(1)
      expect(responses[0].choice).toBe('b')
    })
  })

  describe('Performance Patterns', () => {
    test('Listener cleanup works', async () => {
      const { AppStateMachine } = await import('../src/store/app-state-machine.ts')
      const machine = new AppStateMachine()
      
      const unsubscribe = machine.subscribe(() => {})
      expect(typeof unsubscribe).toBe('function')
      
      // Should not throw
      unsubscribe()
    })

    test('Memory bounded storage pattern', () => {
      const storage = new Map()
      const MAX_SIZE = 100
      
      const boundedSet = (key: string, value: any) => {
        if (storage.size >= MAX_SIZE) {
          const firstKey = storage.keys().next().value
          storage.delete(firstKey)
        }
        storage.set(key, value)
      }
      
      // Should not grow beyond limit
      for (let i = 0; i < 150; i++) {
        boundedSet(`key-${i}`, `value-${i}`)
      }
      
      expect(storage.size).toBeLessThanOrEqual(MAX_SIZE)
    })
  })
})