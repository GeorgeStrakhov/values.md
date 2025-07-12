/**
 * Edge Case Tests - Breaking Points & Boundary Conditions
 * 
 * Tests the system's behavior at extremes and unusual conditions
 */

import { describe, it, expect, vi } from 'vitest'
import { combinatorialGenerator, type ResponsePattern } from '@/lib/combinatorial-values-generator'

describe('🔥 Edge Case Testing', () => {
  
  describe('🚨 Data Quality Edge Cases', () => {
    it('should handle corrupted motif data gracefully', () => {
      const corruptedResponses: ResponsePattern[] = [
        {
          chosenOption: 'a',
          motif: '', // Empty motif
          domain: 'test',
          difficulty: 5
        },
        {
          chosenOption: 'b',
          motif: 'INVALID_MOTIF_ID', // Non-existent motif
          domain: 'test',
          difficulty: 5
        },
        {
          chosenOption: 'c',
          motif: 'null', // String 'null'
          domain: 'test',
          difficulty: 5
        },
        {
          chosenOption: 'd',
          motif: '   ', // Whitespace only
          domain: 'test',
          difficulty: 5
        }
      ]

      const profile = combinatorialGenerator.analyzeResponses(corruptedResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).not.toContain('undefined')
      expect(valuesMarkdown).not.toContain('null')
      expect(valuesMarkdown.length).toBeGreaterThan(200)
    })

    it('should handle extreme difficulty ratings', () => {
      const extremeResponses: ResponsePattern[] = [
        {
          chosenOption: 'a',
          motif: 'NUMBERS_FIRST',
          domain: 'test',
          difficulty: 0 // Below minimum
        },
        {
          chosenOption: 'b',
          motif: 'PERSON_FIRST',
          domain: 'test',
          difficulty: 15 // Above maximum
        },
        {
          chosenOption: 'c',
          motif: 'RULES_FIRST',
          domain: 'test',
          difficulty: -5 // Negative
        },
        {
          chosenOption: 'd',
          motif: 'SAFETY_FIRST',
          domain: 'test',
          difficulty: 999 // Extreme high
        }
      ]

      const profile = combinatorialGenerator.analyzeResponses(extremeResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(profile.primaryMotifs.length + profile.secondaryMotifs.length).toBeGreaterThan(0)
    })

    it('should handle extreme response times', () => {
      const timeExtremes: ResponsePattern[] = [
        {
          chosenOption: 'a',
          motif: 'NUMBERS_FIRST',
          domain: 'test',
          difficulty: 5,
          responseTime: 1 // 1ms - too fast
        },
        {
          chosenOption: 'b',
          motif: 'PERSON_FIRST',
          domain: 'test',
          difficulty: 5,
          responseTime: 3600000 // 1 hour - too slow
        },
        {
          chosenOption: 'c',
          motif: 'RULES_FIRST',
          domain: 'test',
          difficulty: 5,
          responseTime: 0 // Zero time
        },
        {
          chosenOption: 'd',
          motif: 'SAFETY_FIRST',
          domain: 'test',
          difficulty: 5,
          responseTime: -1000 // Negative time
        }
      ]

      const profile = combinatorialGenerator.analyzeResponses(timeExtremes)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).not.toContain('NaN')
      expect(valuesMarkdown).not.toContain('Infinity')
    })
  })

  describe('🚨 Scale Edge Cases', () => {
    it('should handle maximum response volume (100 responses)', () => {
      const maxResponses: ResponsePattern[] = Array.from({ length: 100 }, (_, i) => ({
        chosenOption: ['a', 'b', 'c', 'd'][i % 4] as any,
        motif: ['NUMBERS_FIRST', 'PERSON_FIRST', 'RULES_FIRST', 'SAFETY_FIRST'][i % 4],
        domain: ['medical', 'legal', 'social', 'technical'][i % 4],
        difficulty: (i % 10) + 1,
        reasoning: `Response ${i} reasoning with varying length and complexity`,
        responseTime: 30000 + (i * 1000)
      }))

      const profile = combinatorialGenerator.analyzeResponses(maxResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).toContain('100 ethical dilemmas')
      expect(profile.primaryMotifs.length).toBeGreaterThan(0)
      expect(valuesMarkdown.length).toBeGreaterThan(1000)
    })

    it('should handle single response minimum', () => {
      const singleResponse: ResponsePattern[] = [{
        chosenOption: 'a',
        motif: 'NUMBERS_FIRST',
        domain: 'test',
        difficulty: 5,
        reasoning: 'Single response reasoning',
        responseTime: 45000
      }]

      const profile = combinatorialGenerator.analyzeResponses(singleResponse)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).toContain('1 ethical dilemma')
      expect(valuesMarkdown).toContain('Quantitative Analysis')
      expect(valuesMarkdown.length).toBeGreaterThan(400)
    })

    it('should handle extremely long reasoning text', () => {
      const longReasoning = 'This is a very long reasoning text that goes on and on and on. '.repeat(100)
      
      const longReasoningResponse: ResponsePattern[] = [{
        chosenOption: 'a',
        motif: 'NUMBERS_FIRST',
        domain: 'test',
        difficulty: 5,
        reasoning: longReasoning,
        responseTime: 120000
      }]

      const profile = combinatorialGenerator.analyzeResponses(longReasoningResponse)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).not.toContain('undefined')
      expect(valuesMarkdown.length).toBeGreaterThan(200)
    })
  })

  describe('🚨 Statistical Edge Cases', () => {
    it('should handle perfect ties in motif frequencies', () => {
      const tiedResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'b', motif: 'PERSON_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'c', motif: 'RULES_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'd', motif: 'SAFETY_FIRST', domain: 'test', difficulty: 5 }
      ]

      const profile = combinatorialGenerator.analyzeResponses(tiedResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).toContain('25%') // Each should be 25%
      expect(profile.primaryMotifs.length + profile.secondaryMotifs.length).toBe(4)
    })

    it('should handle extreme consistency (all same choice)', () => {
      const consistentResponses: ResponsePattern[] = Array.from({ length: 10 }, () => ({
        chosenOption: 'a',
        motif: 'NUMBERS_FIRST',
        domain: 'test',
        difficulty: 5,
        reasoning: 'Always the same reasoning',
        responseTime: 30000
      }))

      const profile = combinatorialGenerator.analyzeResponses(consistentResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).toContain('100%') // Should be 100% numbers first
      expect(profile.primaryMotifs.length).toBe(1)
      expect(profile.primaryMotifs[0].motifId).toBe('NUMBERS_FIRST')
    })

    it('should handle zero variance in response times', () => {
      const sameTimeResponses: ResponsePattern[] = Array.from({ length: 5 }, (_, i) => ({
        chosenOption: ['a', 'b', 'c', 'd', 'a'][i] as any,
        motif: ['NUMBERS_FIRST', 'PERSON_FIRST', 'RULES_FIRST', 'SAFETY_FIRST', 'NUMBERS_FIRST'][i],
        domain: 'test',
        difficulty: 5,
        responseTime: 30000 // Exactly the same time
      }))

      const profile = combinatorialGenerator.analyzeResponses(sameTimeResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).not.toContain('NaN')
      expect(valuesMarkdown).not.toContain('undefined')
    })
  })

  describe('🚨 Template Generation Edge Cases', () => {
    it('should handle empty motif names gracefully', () => {
      // Mock a response with empty motif that somehow gets through
      const mockProfile = {
        primaryMotifs: [],
        secondaryMotifs: [
          {
            motifId: 'UNKNOWN_MOTIF',
            name: '',
            count: 1,
            percentage: 100,
            domains: ['test'],
            averageConfidence: 0.5
          }
        ],
        frameworkAlignment: {
          consequentialist: 100,
          deontological: 0,
          virtueEthics: 0,
          careEthics: 0,
          pragmatic: 0
        },
        decisionPatterns: {
          consistencyScore: 1.0,
          domainSpecificVariation: {},
          difficultyResponse: 'consistent' as const,
          reasoningStyle: 'analytical' as const
        },
        culturalContext: {
          individualistic: 50,
          collectivistic: 50,
          hierarchical: 50,
          egalitarian: 50
        }
      }

      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(mockProfile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).not.toContain('undefined')
      expect(valuesMarkdown.length).toBeGreaterThan(200)
    })

    it('should handle framework alignment that doesn\'t sum to 100%', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 }
      ]

      const profile = combinatorialGenerator.analyzeResponses(responses)
      
      // Manually corrupt the framework alignment
      profile.frameworkAlignment = {
        consequentialist: 33,
        deontological: 33,
        virtueEthics: 33,
        careEthics: 33,
        pragmatic: 33
      } // Sum = 165%, not 100%

      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).not.toContain('undefined')
      expect(valuesMarkdown.length).toBeGreaterThan(200)
    })
  })

  describe('🚨 Performance Edge Cases', () => {
    it('should complete generation within reasonable time for large datasets', async () => {
      const largeDataset: ResponsePattern[] = Array.from({ length: 50 }, (_, i) => ({
        chosenOption: ['a', 'b', 'c', 'd'][i % 4] as any,
        motif: ['NUMBERS_FIRST', 'PERSON_FIRST', 'RULES_FIRST', 'SAFETY_FIRST'][i % 4],
        domain: ['medical', 'legal', 'social'][i % 3],
        difficulty: (i % 10) + 1,
        reasoning: `Complex reasoning for response ${i} with detailed analysis`,
        responseTime: 30000 + (i * 500)
      }))

      const startTime = Date.now()
      const profile = combinatorialGenerator.analyzeResponses(largeDataset)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)
      const endTime = Date.now()

      expect(valuesMarkdown).toContain('# My Values')
      expect(endTime - startTime).toBeLessThan(5000) // Should complete in under 5 seconds
      expect(valuesMarkdown.length).toBeGreaterThan(1000)
    })

    it('should handle repeated rapid generation requests', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'b', motif: 'PERSON_FIRST', domain: 'test', difficulty: 5 }
      ]

      // Generate multiple times rapidly
      const results = []
      for (let i = 0; i < 10; i++) {
        const profile = combinatorialGenerator.analyzeResponses(responses)
        const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)
        results.push(valuesMarkdown)
      }

      // All should succeed and be consistent
      results.forEach(result => {
        expect(result).toContain('# My Values')
        expect(result).toContain('Quantitative Analysis')
        expect(result).toContain('People-Centered Ethics')
      })

      // Results should be identical (deterministic)
      expect(results[0]).toBe(results[9])
    })
  })

  describe('🚨 Memory and Resource Edge Cases', () => {
    it('should not leak memory during repeated operations', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 }
      ]

      // Simulate memory pressure
      const initialMemory = process.memoryUsage().heapUsed

      for (let i = 0; i < 100; i++) {
        const profile = combinatorialGenerator.analyzeResponses(responses)
        combinatorialGenerator.generateValuesMarkdown(profile)
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })

    it('should handle null/undefined values in critical paths', () => {
      const problematicResponses: any[] = [
        {
          chosenOption: null,
          motif: 'NUMBERS_FIRST',
          domain: 'test',
          difficulty: 5
        },
        {
          chosenOption: 'a',
          motif: null,
          domain: 'test',
          difficulty: 5
        },
        {
          chosenOption: 'b',
          motif: 'PERSON_FIRST',
          domain: null,
          difficulty: 5
        },
        {
          chosenOption: 'c',
          motif: 'RULES_FIRST',
          domain: 'test',
          difficulty: null
        }
      ]

      const profile = combinatorialGenerator.analyzeResponses(problematicResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown).not.toContain('null')
      expect(valuesMarkdown).not.toContain('undefined')
      expect(valuesMarkdown.length).toBeGreaterThan(200)
    })
  })
})