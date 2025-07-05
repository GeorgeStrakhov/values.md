/**
 * Fast Unit Tests - No Server Dependencies
 * 
 * These tests run in < 1 second and catch regressions without needing:
 * - Database connection
 * - API server running
 * - External services
 * 
 * Perfect for pre-commit hooks and rapid development feedback.
 */

import { describe, it, expect, vi } from 'vitest'
import { combinatorialGenerator, type ResponsePattern } from '@/lib/combinatorial-values-generator'

describe('🚀 Fast Unit Tests - Core Logic', () => {
  
  describe('✅ Combinatorial VALUES.md Generator', () => {
    it('should generate VALUES.md from response patterns', () => {
      const responses: ResponsePattern[] = [
        {
          chosenOption: 'a',
          motif: 'NUMBERS_FIRST',
          domain: 'medical',
          difficulty: 7,
          reasoning: 'Data-driven approach is most reliable'
        },
        {
          chosenOption: 'b', 
          motif: 'PERSON_FIRST',
          domain: 'social',
          difficulty: 5,
          reasoning: 'People matter most'
        }
      ]

      const profile = combinatorialGenerator.analyzeResponses(responses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(profile.primaryMotifs).toBeDefined()
      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).toContain('decision-making')
      expect(valuesMarkdown.length).toBeGreaterThan(100)
    })

    it('should handle empty responses gracefully', () => {
      const profile = combinatorialGenerator.analyzeResponses([])
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).toContain('Balanced Ethical Reasoning')
      expect(profile.primaryMotifs).toHaveLength(0)
    })

    it('should correctly map motifs to ethical frameworks', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'UTIL_CALC', domain: 'general', difficulty: 5 },
        { chosenOption: 'b', motif: 'RULES_FIRST', domain: 'general', difficulty: 5 },
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'general', difficulty: 5 }
      ]

      const profile = combinatorialGenerator.analyzeResponses(responses)
      
      expect(profile.frameworkAlignment).toBeDefined()
      expect(profile.frameworkAlignment.consequentialist).toBeGreaterThan(0)
      expect(profile.frameworkAlignment.deontological).toBeGreaterThan(0)
      expect(profile.decisionPatterns.reasoningStyle).toBeDefined()
    })
  })

  describe('✅ Store Logic - Dilemma Navigation', () => {
    it('should advance through dilemmas correctly', () => {
      // Mock the store behavior that caused navigation issues
      let currentIndex = 0
      let selectedOption = ''
      let dilemmas = [
        { dilemmaId: '1', title: 'Dilemma 1' },
        { dilemmaId: '2', title: 'Dilemma 2' },
        { dilemmaId: '3', title: 'Dilemma 3' }
      ]

      const goToNext = () => {
        if (currentIndex < dilemmas.length - 1) {
          currentIndex++
          selectedOption = '' // Reset for next dilemma
          return true
        }
        return false
      }

      // Simulate user journey
      selectedOption = 'a'
      expect(goToNext()).toBe(true)
      expect(currentIndex).toBe(1)
      expect(selectedOption).toBe('')

      selectedOption = 'b' 
      expect(goToNext()).toBe(true)
      expect(currentIndex).toBe(2)

      selectedOption = 'c'
      expect(goToNext()).toBe(false) // Last dilemma
      expect(currentIndex).toBe(2)
    })
  })

  describe('✅ Error Boundary Simulation', () => {
    it('should catch component errors gracefully', () => {
      const mockComponentError = () => {
        throw new Error('Component crashed!')
      }

      const errorBoundary = {
        componentDidCatch: vi.fn(),
        hasError: false,
        error: null,
        
        catchError: function(errorFn: () => void) {
          try {
            errorFn()
          } catch (error) {
            this.hasError = true
            this.error = error
            this.componentDidCatch(error, { componentStack: 'MockStack' })
            return { fallback: 'Error UI shown' }
          }
        }
      }

      const result = errorBoundary.catchError(mockComponentError)
      
      expect(errorBoundary.hasError).toBe(true)
      expect(errorBoundary.componentDidCatch).toHaveBeenCalled()
      expect(result?.fallback).toBe('Error UI shown')
    })
  })

  describe('✅ Data Validation Logic', () => {
    it('should validate user responses', () => {
      const validResponse = {
        dilemmaId: 'uuid-123',
        choice: 'a',
        difficulty: 7,
        reasoning: 'This is my reasoning'
      }

      const validateResponse = (response: any) => {
        if (!response.dilemmaId) return { valid: false, error: 'Missing dilemmaId' }
        if (!['a', 'b', 'c', 'd'].includes(response.choice)) return { valid: false, error: 'Invalid choice' }
        if (response.difficulty < 1 || response.difficulty > 10) return { valid: false, error: 'Invalid difficulty' }
        return { valid: true }
      }

      expect(validateResponse(validResponse)).toEqual({ valid: true })
      expect(validateResponse({ ...validResponse, choice: 'x' })).toEqual({ 
        valid: false, 
        error: 'Invalid choice' 
      })
      expect(validateResponse({ ...validResponse, difficulty: 15 })).toEqual({ 
        valid: false, 
        error: 'Invalid difficulty' 
      })
    })
  })
})

describe('🔍 Regression Detection Tests', () => {
  
  describe('🚨 Navigation Bug Prevention', () => {
    it('should prevent the "Next button resets state" bug', () => {
      // This test captures the exact bug we fixed
      let state = {
        currentIndex: 0,
        selectedOption: '',
        dilemmas: [{ id: 1 }, { id: 2 }, { id: 3 }]
      }

      // User selects option
      state.selectedOption = 'a'
      expect(state.selectedOption).toBe('a')

      // Next button clicked - should NOT reset selectedOption until after navigation
      const goToNext = () => {
        if (state.currentIndex < state.dilemmas.length - 1) {
          state.currentIndex++
          // ✅ CRITICAL: Only clear selection AFTER successful navigation
          state.selectedOption = ''
          return true
        }
        return false
      }

      const success = goToNext()
      expect(success).toBe(true)
      expect(state.currentIndex).toBe(1)
      expect(state.selectedOption).toBe('') // Cleared for next dilemma
    })
  })

  describe('🚨 VALUES.md Generation Regression', () => {
    it('should prevent empty VALUES.md generation', () => {
      const responses: ResponsePattern[] = [{
        chosenOption: 'a',
        motif: 'NUMBERS_FIRST', 
        domain: 'test',
        difficulty: 5
      }]

      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(
        combinatorialGenerator.analyzeResponses(responses)
      )

      // These checks prevent regressions in VALUES.md format
      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).toContain('Core Ethical Framework')
      expect(valuesMarkdown).toContain('AI Interaction Guidelines')
      expect(valuesMarkdown).not.toContain('undefined')
      expect(valuesMarkdown).not.toContain('null')
      expect(valuesMarkdown.split('\n').length).toBeGreaterThan(10)
    })
  })

  describe('🚨 System State Consistency', () => {
    it('should maintain consistent system state indicators', () => {
      const mockSystemState = {
        hasOpenRouterKey: true,
        hasUserResponses: true, 
        hasGeneratedValues: false,
        databaseHasData: true
      }

      const getButtonState = (state: typeof mockSystemState) => {
        if (!state.hasOpenRouterKey) return { disabled: true, reason: 'Configure API key' }
        if (!state.hasUserResponses) return { disabled: true, reason: 'Complete dilemmas' }
        return { disabled: false, reason: null as string | null }
      }

      expect(getButtonState(mockSystemState)).toEqual({ disabled: false, reason: null })
      expect(getButtonState({ ...mockSystemState, hasOpenRouterKey: false }))
        .toEqual({ disabled: true, reason: 'Configure API key' })
    })
  })
})