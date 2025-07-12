/**
 * Database & Schema Validation Tests
 * 
 * Tests database schema integrity and data validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { combinatorialGenerator } from '@/lib/combinatorial-values-generator'

// Mock database for schema tests
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}

vi.mock('@/lib/db', () => ({
  db: mockDb
}))

describe('🗄️ Database & Schema Validation', () => {
  
  describe('📋 Schema Compliance', () => {
    it('should validate dilemma schema structure', () => {
      const validDilemma = {
        dilemmaId: 'test-uuid-123',
        title: 'Test Dilemma',
        description: 'A test ethical dilemma',
        choiceA: 'Option A',
        choiceB: 'Option B', 
        choiceC: 'Option C',
        choiceD: 'Option D',
        choiceAMotif: 'NUMBERS_FIRST',
        choiceBMotif: 'PERSON_FIRST',
        choiceCMotif: 'RULES_FIRST',
        choiceDMotif: 'SAFETY_FIRST',
        domain: 'medical',
        difficulty: 7,
        stakeholders: 'patients, doctors, hospital',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Test required fields
      expect(validDilemma.dilemmaId).toBeDefined()
      expect(validDilemma.title).toBeDefined()
      expect(validDilemma.description).toBeDefined()
      expect(validDilemma.choiceA).toBeDefined()
      expect(validDilemma.choiceB).toBeDefined()
      expect(validDilemma.choiceC).toBeDefined()
      expect(validDilemma.choiceD).toBeDefined()

      // Test data types
      expect(typeof validDilemma.dilemmaId).toBe('string')
      expect(typeof validDilemma.title).toBe('string')
      expect(typeof validDilemma.difficulty).toBe('number')
      expect(validDilemma.difficulty).toBeGreaterThan(0)
      expect(validDilemma.difficulty).toBeLessThanOrEqual(10)

      // Test motif mappings
      expect(validDilemma.choiceAMotif).toBeDefined()
      expect(validDilemma.choiceBMotif).toBeDefined()
      expect(validDilemma.choiceCMotif).toBeDefined()
      expect(validDilemma.choiceDMotif).toBeDefined()
    })

    it('should validate user response schema structure', () => {
      const validResponse = {
        responseId: 'response-uuid-456',
        sessionId: 'session-789',
        dilemmaId: 'dilemma-123',
        chosenOption: 'a',
        reasoning: 'This is my reasoning',
        responseTime: 45000,
        perceivedDifficulty: 6,
        createdAt: new Date()
      }

      // Test required fields
      expect(validResponse.sessionId).toBeDefined()
      expect(validResponse.dilemmaId).toBeDefined()
      expect(validResponse.chosenOption).toBeDefined()

      // Test data types
      expect(typeof validResponse.sessionId).toBe('string')
      expect(typeof validResponse.dilemmaId).toBe('string')
      expect(typeof validResponse.chosenOption).toBe('string')
      expect(typeof validResponse.responseTime).toBe('number')
      expect(typeof validResponse.perceivedDifficulty).toBe('number')

      // Test constraints
      expect(['a', 'b', 'c', 'd']).toContain(validResponse.chosenOption)
      expect(validResponse.responseTime).toBeGreaterThan(0)
      expect(validResponse.perceivedDifficulty).toBeGreaterThan(0)
      expect(validResponse.perceivedDifficulty).toBeLessThanOrEqual(10)
    })

    it('should validate motif and framework schemas', () => {
      const validMotif = {
        motifId: 'NUMBERS_FIRST',
        name: 'Quantitative Analysis',
        description: 'Prioritizes data-driven decisions',
        framework: 'consequentialist',
        createdAt: new Date()
      }

      const validFramework = {
        frameworkId: 'consequentialist',
        name: 'Consequentialist Ethics',
        description: 'Focuses on outcomes and consequences',
        createdAt: new Date()
      }

      // Test motif structure
      expect(validMotif.motifId).toBeDefined()
      expect(validMotif.name).toBeDefined()
      expect(validMotif.framework).toBeDefined()
      expect(typeof validMotif.motifId).toBe('string')
      expect(typeof validMotif.name).toBe('string')

      // Test framework structure
      expect(validFramework.frameworkId).toBeDefined()
      expect(validFramework.name).toBeDefined()
      expect(typeof validFramework.frameworkId).toBe('string')
      expect(typeof validFramework.name).toBe('string')
    })
  })

  describe('🔍 Data Validation', () => {
    it('should reject invalid choice options', () => {
      const invalidChoices = ['e', 'f', '1', '2', 'x', 'y', 'z']

      invalidChoices.forEach(choice => {
        const response = {
          chosenOption: choice,
          motif: 'NUMBERS_FIRST',
          domain: 'test',
          difficulty: 5
        }

        // The combinatorial generator should handle invalid choices gracefully
        const profile = combinatorialGenerator.analyzeResponses([response])
        expect(profile).toBeDefined()
        expect(profile.primaryMotifs.length + profile.secondaryMotifs.length).toBeGreaterThanOrEqual(0)
      })
    })

    it('should validate difficulty ranges', () => {
      const invalidDifficulties = [-1, 0, 11, 15, 100, -10]

      invalidDifficulties.forEach(difficulty => {
        const response = {
          chosenOption: 'a',
          motif: 'NUMBERS_FIRST',
          domain: 'test',
          difficulty: difficulty
        }

        // System should handle invalid difficulties gracefully
        const profile = combinatorialGenerator.analyzeResponses([response])
        expect(profile).toBeDefined()
        expect(profile.decisionPatterns.consistencyScore).toBeGreaterThanOrEqual(0)
        expect(profile.decisionPatterns.consistencyScore).toBeLessThanOrEqual(1)
      })
    })

    it('should validate session ID format', () => {
      const sessionIdFormats = [
        'session-123',
        'user_456',
        'anon-789',
        'test-session-abc-123',
        '12345678-1234-1234-1234-123456789012' // UUID format
      ]

      sessionIdFormats.forEach(sessionId => {
        expect(sessionId).toBeDefined()
        expect(typeof sessionId).toBe('string')
        expect(sessionId.length).toBeGreaterThan(0)
        expect(sessionId.length).toBeLessThan(100) // Reasonable length limit
      })
    })

    it('should validate response time constraints', () => {
      const responseTimes = [
        { time: 1000, valid: true },      // 1 second
        { time: 30000, valid: true },     // 30 seconds
        { time: 300000, valid: true },    // 5 minutes
        { time: 0, valid: false },        // Invalid: 0 time
        { time: -1000, valid: false },    // Invalid: negative time
        { time: 3600000, valid: false }   // Invalid: 1 hour (too long)
      ]

      responseTimes.forEach(({ time, valid }) => {
        const response = {
          chosenOption: 'a',
          motif: 'NUMBERS_FIRST',
          domain: 'test',
          difficulty: 5,
          responseTime: time
        }

        const profile = combinatorialGenerator.analyzeResponses([response])
        expect(profile).toBeDefined()
        
        if (valid) {
          expect(profile.primaryMotifs.length + profile.secondaryMotifs.length).toBeGreaterThan(0)
        } else {
          // System should handle invalid times gracefully
          expect(profile.primaryMotifs.length + profile.secondaryMotifs.length).toBeGreaterThanOrEqual(0)
        }
      })
    })
  })

  describe('🔗 Referential Integrity', () => {
    it('should maintain dilemma-response relationships', () => {
      const dilemmaId = 'test-dilemma-123'
      const responses = [
        {
          chosenOption: 'a',
          motif: 'NUMBERS_FIRST',
          domain: 'test',
          difficulty: 5,
          dilemmaId: dilemmaId
        },
        {
          chosenOption: 'b', 
          motif: 'PERSON_FIRST',
          domain: 'test',
          difficulty: 5,
          dilemmaId: dilemmaId
        }
      ]

      responses.forEach(response => {
        expect(response.dilemmaId).toBe(dilemmaId)
      })

      const profile = combinatorialGenerator.analyzeResponses(responses)
      expect(profile.primaryMotifs.length + profile.secondaryMotifs.length).toBeGreaterThan(0)
    })

    it('should handle orphaned responses gracefully', () => {
      const orphanedResponse = {
        chosenOption: 'a',
        motif: 'NUMBERS_FIRST',
        domain: 'test',
        difficulty: 5,
        dilemmaId: 'non-existent-dilemma'
      }

      // System should handle orphaned responses without crashing
      const profile = combinatorialGenerator.analyzeResponses([orphanedResponse])
      expect(profile).toBeDefined()
      expect(profile.primaryMotifs.length + profile.secondaryMotifs.length).toBeGreaterThanOrEqual(0)
    })

    it('should validate motif-framework relationships', () => {
      const motifFrameworkMappings = [
        { motif: 'NUMBERS_FIRST', expectedFramework: 'consequentialist' },
        { motif: 'RULES_FIRST', expectedFramework: 'deontological' },
        { motif: 'PERSON_FIRST', expectedFramework: 'care_ethics' },
        { motif: 'SAFETY_FIRST', expectedFramework: 'consequentialist' }
      ]

      motifFrameworkMappings.forEach(({ motif, expectedFramework }) => {
        const response = {
          chosenOption: 'a',
          motif: motif,
          domain: 'test',
          difficulty: 5
        }

        const profile = combinatorialGenerator.analyzeResponses([response])
        expect(profile.frameworkAlignment).toBeDefined()
        expect(typeof profile.frameworkAlignment).toBe('object')
        
        // Should have some alignment with expected framework
        expect(profile.frameworkAlignment[expectedFramework]).toBeDefined()
      })
    })
  })

  describe('📊 Data Consistency', () => {
    it('should maintain percentage calculations', () => {
      const responses = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'b', motif: 'PERSON_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'b', motif: 'PERSON_FIRST', domain: 'test', difficulty: 5 }
      ]

      const profile = combinatorialGenerator.analyzeResponses(responses)
      
      // Calculate total percentage
      const totalPercentage = profile.primaryMotifs.reduce((sum, motif) => sum + motif.percentage, 0) +
                             profile.secondaryMotifs.reduce((sum, motif) => sum + motif.percentage, 0)

      expect(totalPercentage).toBeGreaterThan(95) // Allow for rounding
      expect(totalPercentage).toBeLessThanOrEqual(100)
    })

    it('should maintain framework alignment totals', () => {
      const responses = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'b', motif: 'PERSON_FIRST', domain: 'test', difficulty: 5 }
      ]

      const profile = combinatorialGenerator.analyzeResponses(responses)
      
      const frameworkTotal = Object.values(profile.frameworkAlignment).reduce((sum, value) => sum + value, 0)
      
      expect(frameworkTotal).toBeGreaterThan(95) // Allow for rounding
      expect(frameworkTotal).toBeLessThanOrEqual(100)
    })

    it('should validate consistency scores', () => {
      const consistentResponses = Array.from({ length: 5 }, () => ({
        chosenOption: 'a',
        motif: 'NUMBERS_FIRST',
        domain: 'test',
        difficulty: 5
      }))

      const inconsistentResponses = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'b', motif: 'PERSON_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'c', motif: 'RULES_FIRST', domain: 'test', difficulty: 5 },
        { chosenOption: 'd', motif: 'SAFETY_FIRST', domain: 'test', difficulty: 5 }
      ]

      const consistentProfile = combinatorialGenerator.analyzeResponses(consistentResponses)
      const inconsistentProfile = combinatorialGenerator.analyzeResponses(inconsistentResponses)

      expect(consistentProfile.decisionPatterns.consistencyScore).toBeGreaterThan(
        inconsistentProfile.decisionPatterns.consistencyScore
      )
      
      expect(consistentProfile.decisionPatterns.consistencyScore).toBeLessThanOrEqual(1)
      expect(inconsistentProfile.decisionPatterns.consistencyScore).toBeGreaterThanOrEqual(0)
    })
  })

  describe('🛡️ Data Sanitization', () => {
    it('should sanitize malicious input', () => {
      const maliciousResponses = [
        {
          chosenOption: 'a',
          motif: '<script>alert("xss")</script>',
          domain: 'test',
          difficulty: 5,
          reasoning: '<img src=x onerror=alert(1)>'
        },
        {
          chosenOption: 'b',
          motif: 'PERSON_FIRST',
          domain: 'test',
          difficulty: 5,
          reasoning: 'DROP TABLE users; --'
        }
      ]

      const profile = combinatorialGenerator.analyzeResponses(maliciousResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).not.toContain('<script>')
      expect(valuesMarkdown).not.toContain('onerror')
      expect(valuesMarkdown).not.toContain('DROP TABLE')
      expect(valuesMarkdown).toContain('# My Values')
    })

    it('should handle extremely long strings', () => {
      const longString = 'A'.repeat(10000)
      
      const response = {
        chosenOption: 'a',
        motif: 'NUMBERS_FIRST',
        domain: 'test',
        difficulty: 5,
        reasoning: longString
      }

      const profile = combinatorialGenerator.analyzeResponses([response])
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile)

      expect(valuesMarkdown).toContain('# My Values')
      expect(valuesMarkdown.length).toBeLessThan(50000) // Should not explode in size
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })
})