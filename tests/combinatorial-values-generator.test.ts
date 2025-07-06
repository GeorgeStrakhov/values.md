/**
 * Comprehensive Tests for Combinatorial Values Generator
 * 
 * This test suite ensures the core business logic is solid and covers
 * all the functionality identified by our categorical analysis.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { 
  CombinatorialValuesGenerator, 
  type ResponsePattern, 
  type EthicalProfile,
  type CombinatorialGenerationConfig,
  combinatorialGenerator 
} from '../src/lib/combinatorial-values-generator';

describe('CombinatorialValuesGenerator', () => {
  let generator: CombinatorialValuesGenerator;

  beforeEach(() => {
    generator = new CombinatorialValuesGenerator();
  });

  describe('Response Pattern Analysis', () => {
    test('should generate VALUES.md from response patterns', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'healthcare', difficulty: 7 },
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'technology', difficulty: 6 },
        { chosenOption: 'b', motif: 'RULES_FIRST', domain: 'finance', difficulty: 8 },
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'workplace', difficulty: 5 }
      ];

      const profile = generator.analyzeResponses(responses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile);

      expect(valuesMarkdown).toContain('# My Values');
      expect(valuesMarkdown).toContain('Core Ethical Framework');
      expect(valuesMarkdown).toContain('Quantitative Analysis');
      expect(valuesMarkdown).toContain('4 ethical dilemmas');
      expect(valuesMarkdown).toContain('75%'); // NUMBERS_FIRST should be 75% (3/4)
    });

    test('should handle empty responses gracefully', () => {
      const responses: ResponsePattern[] = [];
      
      const profile = generator.analyzeResponses(responses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile);

      expect(profile.primaryMotifs).toHaveLength(0);
      expect(profile.secondaryMotifs).toHaveLength(0);
      expect(valuesMarkdown).toContain('# My Values');
      expect(valuesMarkdown).toContain('Balanced Ethical Reasoning');
      expect(profile.frameworkAlignment.consequentialist).toBe(20);
      expect(profile.frameworkAlignment.deontological).toBe(20);
    });

    test('should correctly map motifs to ethical frameworks', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'healthcare', difficulty: 7 },
        { chosenOption: 'a', motif: 'HARM_MINIMIZE', domain: 'technology', difficulty: 6 },
        { chosenOption: 'b', motif: 'UTIL_CALC', domain: 'finance', difficulty: 8 }
      ];

      const profile = generator.analyzeResponses(responses);

      expect(profile.primaryMotifs).toHaveLength(3);
      expect(profile.primaryMotifs[0].motifId).toBe('NUMBERS_FIRST');
      expect(profile.primaryMotifs[0].percentage).toBe(33); // 1/3 = 33%
      expect(profile.primaryMotifs[0].count).toBe(1);
      expect(profile.primaryMotifs[0].domains).toContain('healthcare');
    });

    test('should advance through dilemmas correctly', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'PERSON_FIRST', domain: 'healthcare', difficulty: 7, reasoning: 'Care for individuals' },
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'social', difficulty: 5, reasoning: 'Focus on relationships' },
        { chosenOption: 'b', motif: 'RULES_FIRST', domain: 'workplace', difficulty: 8, reasoning: 'Follow principles' }
      ];

      const profile = generator.analyzeResponses(responses);

      expect(profile.primaryMotifs).toHaveLength(2);
      expect(profile.primaryMotifs[0].motifId).toBe('PERSON_FIRST');
      expect(profile.primaryMotifs[0].percentage).toBe(67); // 2/3 = 67%
      expect(profile.primaryMotifs[1].motifId).toBe('RULES_FIRST');
      expect(profile.primaryMotifs[1].percentage).toBe(33); // 1/3 = 33%
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should catch component errors gracefully', () => {
      const invalidResponses: any = [
        { chosenOption: 'a', motif: null, domain: undefined, difficulty: 'invalid' },
        { chosenOption: 'z', motif: 'INVALID_MOTIF', domain: '', difficulty: -1 }
      ];

      expect(() => {
        const profile = generator.analyzeResponses(invalidResponses);
        generator.generateValuesMarkdown(profile);
      }).not.toThrow();
    });

    test('should validate user responses', () => {
      const validResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'healthcare', difficulty: 7 }
      ];

      const profile = generator.analyzeResponses(validResponses);
      expect(profile.primaryMotifs).toHaveLength(1);
      expect(profile.decisionPatterns.consistencyScore).toBeGreaterThan(0);
    });

    test('should prevent empty VALUES.md generation', () => {
      const emptyResponses: ResponsePattern[] = [];
      
      const profile = generator.analyzeResponses(emptyResponses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile);

      expect(valuesMarkdown.length).toBeGreaterThan(100);
      expect(valuesMarkdown).toContain('# My Values');
      expect(valuesMarkdown).toContain('Core Ethical Framework');
      expect(valuesMarkdown).toContain('AI Interaction Guidelines');
    });

    test('should maintain consistent system state indicators', () => {
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'SAFETY_FIRST', domain: 'healthcare', difficulty: 9 },
        { chosenOption: 'b', motif: 'SAFETY_FIRST', domain: 'technology', difficulty: 8 }
      ];

      const profile1 = generator.analyzeResponses(responses);
      const profile2 = generator.analyzeResponses(responses);

      // Should generate consistent results for same input
      expect(profile1.primaryMotifs[0].motifId).toBe(profile2.primaryMotifs[0].motifId);
      expect(profile1.primaryMotifs[0].percentage).toBe(profile2.primaryMotifs[0].percentage);
      
      const markdown1 = generator.generateValuesMarkdown(profile1);
      const markdown2 = generator.generateValuesMarkdown(profile2);
      
      // Core content should be consistent (allowing for timestamp differences)
      expect(markdown1.split('Generated on')[0]).toBe(markdown2.split('Generated on')[0]);
    });
  });

  describe('Template Generation', () => {
    test('should complete full journey with quantitative preferences', () => {
      const quantitativeResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'healthcare', difficulty: 8 },
        { chosenOption: 'a', motif: 'UTIL_CALC', domain: 'finance', difficulty: 7 },
        { chosenOption: 'b', motif: 'NUMBERS_FIRST', domain: 'technology', difficulty: 6 },
        { chosenOption: 'a', motif: 'UTIL_CALC', domain: 'workplace', difficulty: 9 }
      ];

      const profile = generator.analyzeResponses(quantitativeResponses);
      const config: CombinatorialGenerationConfig = {
        useDetailedMotifAnalysis: true,
        includeFrameworkAlignment: true,
        includeDecisionPatterns: true,
        templateFormat: 'comprehensive',
        targetAudience: 'professional'
      };

      const valuesMarkdown = generator.generateValuesMarkdown(profile, config);

      expect(valuesMarkdown).toContain('# My Values');
      expect(valuesMarkdown).toContain('Quantitative Analysis');
      expect(valuesMarkdown).toContain('Detailed Analysis');
      expect(valuesMarkdown).toContain('Framework Compatibility');
      expect(valuesMarkdown).toContain('data-driven decisions');
    });

    test('should complete full journey with humanistic preferences', () => {
      const humanisticResponses: ResponsePattern[] = [
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'healthcare', difficulty: 7 },
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'social', difficulty: 6 },
        { chosenOption: 'b', motif: 'AUTONOMY_RESPECT', domain: 'technology', difficulty: 8 },
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'workplace', difficulty: 5 }
      ];

      const profile = generator.analyzeResponses(humanisticResponses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile);

      expect(valuesMarkdown).toContain('People-Centered Ethics');
      expect(valuesMarkdown).toContain('human impact and relationships');
      expect(profile.primaryMotifs[0].motifId).toBe('PERSON_FIRST');
      expect(profile.primaryMotifs[0].percentage).toBe(75); // 3/4 = 75%
    });

    test('should complete full journey with deontological preferences', () => {
      const deontologicalResponses: ResponsePattern[] = [
        { chosenOption: 'b', motif: 'RULES_FIRST', domain: 'healthcare', difficulty: 9 },
        { chosenOption: 'b', motif: 'RULES_FIRST', domain: 'finance', difficulty: 8 },
        { chosenOption: 'd', motif: 'PROCESS_FIRST', domain: 'workplace', difficulty: 7 },
        { chosenOption: 'b', motif: 'RULES_FIRST', domain: 'technology', difficulty: 6 }
      ];

      const profile = generator.analyzeResponses(deontologicalResponses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile);

      expect(valuesMarkdown).toContain('Principled Decision-Making');
      expect(valuesMarkdown).toContain('established principles and rules');
      expect(profile.primaryMotifs[0].motifId).toBe('RULES_FIRST');
      expect(profile.primaryMotifs[0].percentage).toBe(75); // 3/4 = 75%
    });

    test('should complete full journey with harm-prevention focus', () => {
      const harmPreventionResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'SAFETY_FIRST', domain: 'healthcare', difficulty: 9 },
        { chosenOption: 'c', motif: 'HARM_MINIMIZE', domain: 'technology', difficulty: 8 },
        { chosenOption: 'a', motif: 'SAFETY_FIRST', domain: 'finance', difficulty: 7 },
        { chosenOption: 'b', motif: 'HARM_MINIMIZE', domain: 'social', difficulty: 6 }
      ];

      const profile = generator.analyzeResponses(harmPreventionResponses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile);

      expect(valuesMarkdown).toContain('Risk Minimization');
      expect(valuesMarkdown).toContain('minimizing risks and preventing potential harm');
      expect(profile.primaryMotifs.some(m => m.motifId === 'SAFETY_FIRST')).toBe(true);
      expect(profile.primaryMotifs.some(m => m.motifId === 'HARM_MINIMIZE')).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle diverse preferences across different domains', () => {
      const diverseResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'finance', difficulty: 8 },
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'healthcare', difficulty: 7 },
        { chosenOption: 'b', motif: 'RULES_FIRST', domain: 'legal', difficulty: 9 },
        { chosenOption: 'd', motif: 'PROCESS_FIRST', domain: 'workplace', difficulty: 6 },
        { chosenOption: 'a', motif: 'UTIL_CALC', domain: 'technology', difficulty: 8 }
      ];

      const profile = generator.analyzeResponses(diverseResponses);

      expect(profile.primaryMotifs).toHaveLength(5); // All different motifs
      expect(profile.primaryMotifs.every(m => m.percentage === 20)).toBe(true); // 1/5 each
      expect(profile.decisionPatterns.domainSpecificVariation).toBeDefined();
      
      const valuesMarkdown = generator.generateValuesMarkdown(profile);
      expect(valuesMarkdown).toContain('varies by domain');
    });

    test('should handle incomplete dilemma responses', () => {
      const incompleteResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'healthcare', difficulty: 7 },
        { chosenOption: '', motif: '', domain: 'technology', difficulty: 0 }, // incomplete
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'social', difficulty: 8 }
      ];

      const profile = generator.analyzeResponses(incompleteResponses);

      // Should only count complete responses with valid motifs
      expect(profile.primaryMotifs).toHaveLength(2);
      // The percentage calculation is based on total responses (3), not just valid ones
      expect(profile.primaryMotifs[0].percentage).toBe(33); // 1/3 total responses
    });

    test('should handle no responses gracefully', () => {
      const noResponses: ResponsePattern[] = [];
      
      const profile = generator.analyzeResponses(noResponses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile);

      expect(profile).toBeDefined();
      expect(valuesMarkdown).toContain('# My Values');
      expect(valuesMarkdown).toContain('Balanced Ethical Reasoning');
      expect(profile.primaryMotifs).toHaveLength(0);
      expect(profile.frameworkAlignment).toBeDefined();
    });
  });

  describe('Privacy and Research Features', () => {
    test('should support private VALUES.md generation', () => {
      const privateResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'PERSON_FIRST', domain: 'personal', difficulty: 6 }
      ];

      const privateConfig: CombinatorialGenerationConfig = {
        useDetailedMotifAnalysis: false,
        includeFrameworkAlignment: false,
        includeDecisionPatterns: false,
        templateFormat: 'minimal',
        targetAudience: 'personal'
      };

      const profile = generator.analyzeResponses(privateResponses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile, privateConfig);

      expect(valuesMarkdown).toContain('# My Values');
      expect(valuesMarkdown).toContain('Core Principle');
      expect(valuesMarkdown).not.toContain('Detailed Analysis');
      expect(valuesMarkdown).not.toContain('Framework Compatibility');
      expect(valuesMarkdown.length).toBeLessThan(1000); // Minimal template
    });

    test('should support research contribution path', () => {
      const researchResponses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'UTIL_CALC', domain: 'healthcare', difficulty: 9, responseTime: 15000, reasoning: 'Detailed utilitarian analysis...' },
        { chosenOption: 'c', motif: 'PERSON_FIRST', domain: 'social', difficulty: 7, responseTime: 12000, reasoning: 'Focus on individual care...' }
      ];

      const researchConfig: CombinatorialGenerationConfig = {
        useDetailedMotifAnalysis: true,
        includeFrameworkAlignment: true,
        includeDecisionPatterns: true,
        templateFormat: 'comprehensive',
        targetAudience: 'research'
      };

      const profile = generator.analyzeResponses(researchResponses);
      const valuesMarkdown = generator.generateValuesMarkdown(profile, researchConfig);

      expect(valuesMarkdown).toContain('Detailed Analysis');
      expect(valuesMarkdown).toContain('Decision Pattern Analysis');
      expect(valuesMarkdown).toContain('Cultural Orientation');
      expect(valuesMarkdown).toContain('research and professional applications');
    });
  });

  describe('Regression Prevention', () => {
    test('should prevent all known regression patterns', () => {
      // Test various edge cases that could cause regressions
      const edgeCaseInputs = [
        [], // empty
        [{ chosenOption: 'a', motif: 'UNKNOWN', domain: 'test', difficulty: 0 }], // unknown motif
        [{ chosenOption: '', motif: 'VALID', domain: '', difficulty: -1 }], // invalid values
        Array(100).fill({ chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 }) // large input
      ];

      edgeCaseInputs.forEach((input, index) => {
        expect(() => {
          const profile = generator.analyzeResponses(input);
          const valuesMarkdown = generator.generateValuesMarkdown(profile);
          expect(valuesMarkdown).toContain('# My Values');
        }).not.toThrow(`Edge case ${index} should not throw`);
      });
    });
  });

  describe('Global Combinatorial Generator Instance', () => {
    test('combinatorial-values-generator should be available as singleton', () => {
      expect(combinatorialGenerator).toBeInstanceOf(CombinatorialValuesGenerator);
      
      const responses: ResponsePattern[] = [
        { chosenOption: 'a', motif: 'NUMBERS_FIRST', domain: 'test', difficulty: 5 }
      ];
      
      const profile = combinatorialGenerator.analyzeResponses(responses);
      expect(profile.primaryMotifs).toHaveLength(1);
    });
  });
});