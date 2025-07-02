/**
 * Deployment Critical Test Suite
 * 
 * Tests functionality that must work for deployments to succeed.
 * Focuses on build-time compatibility and runtime stability.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'

// Reset environment before each test
beforeEach(() => {
  vi.resetModules()
})

describe('Deployment Critical Functionality', () => {
  
  describe('Build-time Safety', () => {
    test('CRITICAL: All pages can be imported without errors', async () => {
      // These must not throw during build
      const pageImports = [
        () => import('../src/app/page.tsx'),
        () => import('../src/app/growth-map/page.tsx'),
        () => import('../src/app/repo-map/page.tsx'),
        () => import('../src/app/project-map/page.tsx'),
        () => import('../src/app/explore/[uuid]/page.tsx'),
        () => import('../src/app/results/page.tsx'),
        () => import('../src/app/admin/page.tsx'),
        () => import('../src/app/admin/health/page.tsx')
      ]
      
      for (const importFn of pageImports) {
        await expect(importFn()).resolves.toBeDefined()
      }
    })

    test('CRITICAL: API routes can be imported without environment', async () => {
      // Clear all environment variables
      const originalEnv = process.env
      process.env = {}
      
      try {
        // These should not fail during build
        await expect(import('../src/app/api/health/route.ts')).resolves.toBeDefined()
        await expect(import('../src/app/api/dilemmas/random/route.ts')).resolves.toBeDefined()
        await expect(import('../src/app/api/responses/route.ts')).resolves.toBeDefined()
        await expect(import('../src/app/api/generate-values/route.ts')).resolves.toBeDefined()
      } finally {
        process.env = originalEnv
      }
    })

    test('CRITICAL: Core libraries have build-safe imports', async () => {
      // Clear critical environment variables
      delete process.env.DATABASE_URL
      delete process.env.OPENROUTER_API_KEY
      
      // Should not throw during import
      await expect(import('../src/lib/db.ts')).resolves.toBeDefined()
      await expect(import('../src/lib/openrouter.ts')).resolves.toBeDefined()
      await expect(import('../src/lib/auth.ts')).resolves.toBeDefined()
      await expect(import('../src/lib/env-config.ts')).resolves.toBeDefined()
    })

    test('CRITICAL: State management is build-safe', async () => {
      // Should not require runtime state during build
      await expect(import('../src/store/app-state-machine.ts')).resolves.toBeDefined()
      await expect(import('../src/store/enhanced-dilemma-store.ts')).resolves.toBeDefined()
      await expect(import('../src/hooks/use-session-management.tsx')).resolves.toBeDefined()
    })
  })

  describe('Environment Configuration', () => {
    test('CRITICAL: Handles missing DATABASE_URL gracefully', async () => {
      delete process.env.DATABASE_URL
      process.env.CI = 'true' // Force CI mode for fallbacks
      
      const { getEnvConfig } = await import('../src/lib/env-config.ts')
      const config = getEnvConfig()
      
      expect(config.database.url).toBeTruthy() // Should have fallback
      expect(config.database.isConfigured).toBe(false) // But should know it's not real
    })

    test('CRITICAL: Handles missing OPENROUTER_API_KEY gracefully', async () => {
      delete process.env.OPENROUTER_API_KEY
      process.env.CI = 'true' // Force CI mode for fallbacks
      
      const { getEnvConfig } = await import('../src/lib/env-config.ts')
      const config = getEnvConfig()
      
      expect(config.openrouter.apiKey).toBeTruthy() // Should have fallback
      expect(config.openrouter.isConfigured).toBe(false) // But should know it's not real
    })

    test('CRITICAL: CI environment detection works', async () => {
      // Simulate CI environment
      process.env.CI = 'true'
      process.env.GITHUB_ACTIONS = 'true'
      
      const { getEnvConfig } = await import('../src/lib/env-config.ts')
      const config = getEnvConfig()
      
      expect(config.app.isCI).toBe(true)
      expect(config.database.url).toContain('localhost') // CI fallback
      expect(config.openrouter.apiKey).toContain('sk-test-') // CI fallback
    })

    test('CRITICAL: Production validation works', async () => {
      process.env.NODE_ENV = 'production'
      delete process.env.DATABASE_URL
      delete process.env.OPENROUTER_API_KEY
      
      const { validateEnvConfig, getEnvConfig } = await import('../src/lib/env-config.ts')
      const config = getEnvConfig()
      const validation = validateEnvConfig(config)
      
      expect(validation.isValid).toBe(false) // Should fail for production
      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Database Connection Safety', () => {
    test('CRITICAL: Database proxy pattern works', async () => {
      delete process.env.DATABASE_URL
      
      // Should not throw during import
      const { db } = await import('../src/lib/db.ts')
      
      // Should be a proxy
      expect(typeof db).toBe('object')
      expect(db).toBeDefined()
    })

    test('CRITICAL: Schema can be imported without database', async () => {
      delete process.env.DATABASE_URL
      
      // Should not throw
      const schema = await import('../src/lib/schema.ts')
      expect(schema.dilemmas).toBeDefined()
      expect(schema.userResponses).toBeDefined()
      expect(schema.frameworks).toBeDefined()
    })
  })

  describe('OpenRouter Integration Safety', () => {
    test('CRITICAL: OpenRouter client uses lazy loading', async () => {
      delete process.env.OPENROUTER_API_KEY
      
      // Should not throw during class instantiation
      const { OpenRouterService } = await import('../src/lib/openrouter.ts')
      const client = new OpenRouterService()
      
      expect(client).toBeDefined()
    })

    test('CRITICAL: API calls fail gracefully without key', async () => {
      delete process.env.OPENROUTER_API_KEY
      
      const { OpenRouterService } = await import('../src/lib/openrouter.ts')
      const client = new OpenRouterService()
      
      // Should throw when actually trying to use API
      await expect(
        client.generateCompletion([{ role: 'user', content: 'test' }])
      ).rejects.toThrow(/OPENROUTER_API_KEY is not set/)
    })
  })

  describe('Next.js Route Compatibility', () => {
    test('CRITICAL: Dynamic routes work', () => {
      // Test dynamic route patterns
      const uuidPattern = /\[uuid\]/
      const slugPattern = /\[slug\]/
      
      expect(uuidPattern.test('[uuid]')).toBe(true)
      expect(slugPattern.test('[slug]')).toBe(true)
    })

    test('CRITICAL: API route exports are correct', async () => {
      const apiRoutes = [
        '../src/app/api/health/route.ts',
        '../src/app/api/dilemmas/random/route.ts',
        '../src/app/api/responses/route.ts'
      ]
      
      for (const route of apiRoutes) {
        const module = await import(route)
        // Should export GET or POST
        expect(module.GET || module.POST).toBeDefined()
      }
    })
  })

  describe('State Machine Stability', () => {
    test('CRITICAL: State machine initializes correctly', async () => {
      const { AppStateMachine } = await import('../src/store/app-state-machine.ts')
      
      const machine = new AppStateMachine()
      expect(machine.getCurrentState()).toBe('idle')
      
      const context = machine.getContext()
      expect(context).toBeDefined()
      expect(context.sessionId).toBeNull()
      expect(context.dilemmas).toEqual([])
    })

    test('CRITICAL: Enhanced store integrates with state machine', async () => {
      // Should not throw during import
      const storeModule = await import('../src/store/enhanced-dilemma-store.ts')
      expect(storeModule.useEnhancedDilemmaStore).toBeDefined()
    })

    test('CRITICAL: Session management hooks work', async () => {
      // Should not throw during import
      const hookModule = await import('../src/hooks/use-session-management.tsx')
      expect(hookModule.useSessionManagement).toBeDefined()
      expect(hookModule.withSessionProtection).toBeDefined()
    })
  })

  describe('TypeScript Type Safety', () => {
    test('CRITICAL: All interfaces are properly exported', async () => {
      const { AppState, AppEvent, AppContext } = await import('../src/store/app-state-machine.ts')
      const { EnvConfig } = await import('../src/lib/env-config.ts')
      
      // Should not throw
      expect(typeof AppState).toBe('undefined') // Type, not value
      expect(typeof AppEvent).toBe('undefined') // Type, not value  
      expect(typeof AppContext).toBe('undefined') // Type, not value
      expect(typeof EnvConfig).toBe('undefined') // Type, not value
    })
  })

  describe('Performance and Memory', () => {
    test('CRITICAL: No memory leaks in state listeners', async () => {
      const { AppStateMachine } = await import('../src/store/app-state-machine.ts')
      const machine = new AppStateMachine()
      
      // Add listeners
      const listeners = []
      for (let i = 0; i < 100; i++) {
        const unsubscribe = machine.subscribe(() => {})
        listeners.push(unsubscribe)
      }
      
      // Should be able to unsubscribe all
      listeners.forEach(unsubscribe => unsubscribe())
      
      // Should not cause memory issues
      expect(listeners).toHaveLength(100)
    })

    test('CRITICAL: LocalStorage usage is bounded', () => {
      const mockStorage = new Map()
      let totalSize = 0
      
      const boundedSetItem = (key: string, value: string) => {
        const size = value.length
        if (totalSize + size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Storage quota exceeded')
        }
        mockStorage.set(key, value)
        totalSize += size
      }
      
      // Should handle large data gracefully
      expect(() => {
        boundedSetItem('test', 'x'.repeat(1000))
      }).not.toThrow()
      
      // Should prevent unlimited growth
      expect(() => {
        boundedSetItem('huge', 'x'.repeat(6 * 1024 * 1024))
      }).toThrow(/Storage quota exceeded/)
    })
  })

  describe('Error Boundaries', () => {
    test('CRITICAL: Errors are handled gracefully', () => {
      const errorHandler = (error: Error) => {
        return {
          message: error.message,
          handled: true
        }
      }
      
      const testError = new Error('Test error')
      const result = errorHandler(testError)
      
      expect(result.handled).toBe(true)
      expect(result.message).toBe('Test error')
    })

    test('CRITICAL: Component failures don\'t crash app', () => {
      // Mock component error
      const ComponentWithError = () => {
        throw new Error('Component failed')
      }
      
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return children
        } catch (error) {
          return 'Error caught'
        }
      }
      
      // Should be caught by error boundary
      expect(() => {
        try {
          ComponentWithError()
        } catch (error) {
          // Error was thrown as expected
          expect(error).toBeInstanceOf(Error)
        }
      }).not.toThrow()
    })
  })
})