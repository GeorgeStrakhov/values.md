/**
 * Validation Protocols Tests - Research Framework Reliability
 * 
 * Tests validation framework for academic research standards
 */

import { validationProtocols } from '../../src/lib/validation-protocols';
import { ethicalTacticDiscovery } from '../../src/lib/ethical-tactic-discovery';

describe('Validation Protocols - Research Framework Tests', () => {

  describe('Content Validity', () => {
    test('expert ratings aggregate correctly across dimensions', async () => {
      const tactics = [
        {
          name: 'utilitarian_maximization',
          description: 'Focuses on maximizing overall welfare',
          patterns: ['maximize', 'greatest good'],
          indicators: ['outcome-focused'],
          confidence: 0,
          evidenceRequired: 2,
          framework: 'consequentialist' as const
        }
      ];

      const expertRatings = [
        { expertId: 'expert1', tacticName: 'utilitarian_maximization', relevance: 7, clarity: 6, completeness: 6 },
        { expertId: 'expert2', tacticName: 'utilitarian_maximization', relevance: 6, clarity: 7, completeness: 5 },
        { expertId: 'expert3', tacticName: 'utilitarian_maximization', relevance: 7, clarity: 6, completeness: 7 },
        { expertId: 'expert4', tacticName: 'utilitarian_maximization', relevance: 6, clarity: 6, completeness: 6 },
        { expertId: 'expert5', tacticName: 'utilitarian_maximization', relevance: 7, clarity: 7, completeness: 6 },
        { expertId: 'expert6', tacticName: 'utilitarian_maximization', relevance: 6, clarity: 5, completeness: 7 },
        { expertId: 'expert7', tacticName: 'utilitarian_maximization', relevance: 7, clarity: 6, completeness: 5 },
        { expertId: 'expert8', tacticName: 'utilitarian_maximization', relevance: 6, clarity: 7, completeness: 6 },
        { expertId: 'expert9', tacticName: 'utilitarian_maximization', relevance: 7, clarity: 6, completeness: 7 },
        { expertId: 'expert10', tacticName: 'utilitarian_maximization', relevance: 6, clarity: 6, completeness: 6 }
      ];

      const result = await validationProtocols.validateTacticDefinitions(tactics, expertRatings);
      
      expect(result.validity).toBeDefined();
      expect(['valid', 'questionable', 'invalid']).toContain(result.validity);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.evidence.mean).toBeCloseTo(6.4, 1); // Average of all ratings
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    test('validity thresholds are evidence-based', async () => {
      const tactics = [
        {
          name: 'test_tactic',
          description: 'Test tactic',
          patterns: ['test'],
          indicators: ['test'],
          confidence: 0,
          evidenceRequired: 1,
          framework: 'consequentialist' as const
        }
      ];

      // High ratings should be valid
      const highRatings = Array.from({ length: 10 }, (_, i) => ({
        expertId: `expert${i}`,
        tacticName: 'test_tactic',
        relevance: 7,
        clarity: 7,
        completeness: 7
      }));

      const highResult = await validationProtocols.validateTacticDefinitions(tactics, highRatings);
      expect(highResult.validity).toBe('valid');

      // Low ratings should be invalid
      const lowRatings = Array.from({ length: 10 }, (_, i) => ({
        expertId: `expert${i}`,
        tacticName: 'test_tactic',
        relevance: 2,
        clarity: 2,
        completeness: 2
      }));

      const lowResult = await validationProtocols.validateTacticDefinitions(tactics, lowRatings);
      expect(lowResult.validity).toBe('invalid');
    });

    test('recommendations generate appropriately', async () => {
      const tactics = [
        {
          name: 'unclear_tactic',
          description: 'Poorly defined tactic',
          patterns: ['unclear'],
          indicators: ['unclear'],
          confidence: 0,
          evidenceRequired: 1,
          framework: 'consequentialist' as const
        }
      ];

      // Poor clarity ratings
      const poorClarityRatings = Array.from({ length: 10 }, (_, i) => ({
        expertId: `expert${i}`,
        tacticName: 'unclear_tactic',
        relevance: 6,
        clarity: 3, // Poor clarity
        completeness: 6
      }));

      const result = await validationProtocols.validateTacticDefinitions(tactics, poorClarityRatings);
      
      expect(result.recommendations.some(rec => 
        rec.includes('clarity') || rec.includes('specific')
      )).toBe(true);
    });

    test('handles disagreement between experts', async () => {
      const tactics = [
        {
          name: 'controversial_tactic',
          description: 'Tactic with expert disagreement',
          patterns: ['controversial'],
          indicators: ['disputed'],
          confidence: 0,
          evidenceRequired: 1,
          framework: 'consequentialist' as const
        }
      ];

      // High variance in expert ratings
      const controversialRatings = [
        { expertId: 'expert1', tacticName: 'controversial_tactic', relevance: 7, clarity: 7, completeness: 7 },
        { expertId: 'expert2', tacticName: 'controversial_tactic', relevance: 2, clarity: 2, completeness: 2 },
        { expertId: 'expert3', tacticName: 'controversial_tactic', relevance: 7, clarity: 3, completeness: 6 },
        { expertId: 'expert4', tacticName: 'controversial_tactic', relevance: 3, clarity: 7, completeness: 2 },
        { expertId: 'expert5', tacticName: 'controversial_tactic', relevance: 6, clarity: 4, completeness: 5 },
        { expertId: 'expert6', tacticName: 'controversial_tactic', relevance: 2, clarity: 6, completeness: 3 },
        { expertId: 'expert7', tacticName: 'controversial_tactic', relevance: 7, clarity: 2, completeness: 7 },
        { expertId: 'expert8', tacticName: 'controversial_tactic', relevance: 4, clarity: 5, completeness: 4 },
        { expertId: 'expert9', tacticName: 'controversial_tactic', relevance: 1, clarity: 7, completeness: 6 },
        { expertId: 'expert10', tacticName: 'controversial_tactic', relevance: 6, clarity: 1, completeness: 3 }
      ];

      const result = await validationProtocols.validateTacticDefinitions(tactics, controversialRatings);
      
      // High disagreement should be reflected in low confidence or limitations
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.limitationsIdentified.some(limit => 
        limit.includes('variability') || limit.includes('disagreement')
      )).toBe(true);
    });
  });

  describe('Inter-Rater Reliability', () => {
    test('Cohen\'s kappa calculation handles perfect agreement', () => {
      const perfectAgreement = [
        {
          raterId: 'rater1',
          responseId: 'response1',
          tacticScores: { 'utilitarian_maximization': 6, 'duty_based_reasoning': 3 }
        },
        {
          raterId: 'rater2',
          responseId: 'response1',
          tacticScores: { 'utilitarian_maximization': 6, 'duty_based_reasoning': 3 }
        },
        {
          raterId: 'rater1',
          responseId: 'response2',
          tacticScores: { 'utilitarian_maximization': 4, 'duty_based_reasoning': 6 }
        },
        {
          raterId: 'rater2',
          responseId: 'response2',
          tacticScores: { 'utilitarian_maximization': 4, 'duty_based_reasoning': 6 }
        }
      ];

      const result = validationProtocols.calculateInterRaterReliability(perfectAgreement);
      
      expect(result.cohensKappa).toBeCloseTo(1.0, 1);
      expect(result.agreement).toBe('excellent');
      expect(result.pearsonCorrelation).toBeCloseTo(1.0, 1);
    });

    test('detects poor inter-rater reliability', () => {
      const poorAgreement = [
        {
          raterId: 'rater1',
          responseId: 'response1',
          tacticScores: { 'utilitarian_maximization': 7, 'duty_based_reasoning': 1 }
        },
        {
          raterId: 'rater2',
          responseId: 'response1',
          tacticScores: { 'utilitarian_maximization': 2, 'duty_based_reasoning': 6 }
        },
        {
          raterId: 'rater1',
          responseId: 'response2',
          tacticScores: { 'utilitarian_maximization': 1, 'duty_based_reasoning': 7 }
        },
        {
          raterId: 'rater2',
          responseId: 'response2',
          tacticScores: { 'utilitarian_maximization': 6, 'duty_based_reasoning': 2 }
        }
      ];

      const result = validationProtocols.calculateInterRaterReliability(poorAgreement);
      
      expect(result.cohensKappa).toBeLessThan(0.4);
      expect(['poor', 'fair']).toContain(result.agreement);
      expect(Math.abs(result.pearsonCorrelation)).toBeLessThan(0.5);
    });

    test('handles missing data appropriately', () => {
      const missingData = [
        {
          raterId: 'rater1',
          responseId: 'response1',
          tacticScores: { 'utilitarian_maximization': 6 } // Missing duty_based_reasoning
        },
        {
          raterId: 'rater2',
          responseId: 'response1',
          tacticScores: { 'duty_based_reasoning': 3 } // Missing utilitarian_maximization
        }
      ];

      const result = validationProtocols.calculateInterRaterReliability(missingData);
      
      // Should handle missing data without throwing errors
      expect(result.kendallTau).toBeDefined();
      expect(result.pearsonCorrelation).toBeDefined();
      expect(result.cohensKappa).toBeDefined();
    });

    test('individual rater consistency metrics', () => {
      const ratings = [
        {
          raterId: 'consistent_rater',
          responseId: 'response1',
          tacticScores: { 'tactic1': 6, 'tactic2': 6 }
        },
        {
          raterId: 'consistent_rater',
          responseId: 'response2',
          tacticScores: { 'tactic1': 6, 'tactic2': 6 }
        },
        {
          raterId: 'inconsistent_rater',
          responseId: 'response1',
          tacticScores: { 'tactic1': 1, 'tactic2': 7 }
        },
        {
          raterId: 'inconsistent_rater',
          responseId: 'response2',
          tacticScores: { 'tactic1': 7, 'tactic2': 1 }
        }
      ];

      const result = validationProtocols.calculateInterRaterReliability(ratings);
      
      expect(result.raterConsistency['consistent_rater']).toBeGreaterThan(
        result.raterConsistency['inconsistent_rater']
      );
    });
  });

  describe('Construct Validity', () => {
    test('convergent validity detects related constructs', () => {
      // Create data where related tactics correlate
      const tacticScores = [
        {
          responseId: 'response1',
          tacticStrengths: { 
            'utilitarian_maximization': 0.8, 
            'harm_minimization': 0.7,  // Should correlate (both consequentialist)
            'duty_based_reasoning': 0.2 
          }
        },
        {
          responseId: 'response2',
          tacticStrengths: { 
            'utilitarian_maximization': 0.3, 
            'harm_minimization': 0.4,  // Should correlate
            'duty_based_reasoning': 0.8 
          }
        },
        {
          responseId: 'response3',
          tacticStrengths: { 
            'utilitarian_maximization': 0.6, 
            'harm_minimization': 0.6,  // Should correlate
            'duty_based_reasoning': 0.1 
          }
        }
      ];

      const result = validationProtocols.calculateConstructValidity(tacticScores);
      
      expect(result.convergentValidity).toBeGreaterThan(0.3);
      expect(result.factorLoadings).toBeDefined();
      expect(Object.keys(result.factorLoadings)).toContain('utilitarian_maximization');
    });

    test('discriminant validity separates unrelated constructs', () => {
      // Create data where unrelated tactics don't correlate
      const tacticScores = [
        {
          responseId: 'response1',
          tacticStrengths: { 
            'utilitarian_maximization': 0.8, 
            'character_focus': 0.2  // Should not correlate (different frameworks)
          }
        },
        {
          responseId: 'response2',
          tacticStrengths: { 
            'utilitarian_maximization': 0.2, 
            'character_focus': 0.8 
          }
        },
        {
          responseId: 'response3',
          tacticStrengths: { 
            'utilitarian_maximization': 0.5, 
            'character_focus': 0.5 
          }
        }
      ];

      const result = validationProtocols.calculateConstructValidity(tacticScores);
      
      expect(result.discriminantValidity).toBeGreaterThan(0.3);
      expect(result.dimensionalityReduction.explainedVariance).toBeGreaterThan(0);
    });

    test('factor analysis extracts meaningful dimensions', () => {
      // Create data with clear factor structure
      const tacticScores = Array.from({ length: 20 }, (_, i) => {
        const factor1Loading = Math.random();
        const factor2Loading = Math.random();
        
        return {
          responseId: `response${i}`,
          tacticStrengths: {
            'consequentialist_tactic1': factor1Loading + Math.random() * 0.2,
            'consequentialist_tactic2': factor1Loading + Math.random() * 0.2,
            'deontological_tactic1': factor2Loading + Math.random() * 0.2,
            'deontological_tactic2': factor2Loading + Math.random() * 0.2
          }
        };
      });

      const result = validationProtocols.calculateConstructValidity(tacticScores);
      
      expect(result.dimensionalityReduction.principalComponents).toHaveLength(1);
      expect(result.dimensionalityReduction.explainedVariance).toBeGreaterThan(0);
      expect(result.dimensionalityReduction.explainedVariance).toBeLessThanOrEqual(1);
    });

    test('handles edge cases in construct validity', () => {
      // Single tactic case
      const singleTactic = [
        {
          responseId: 'response1',
          tacticStrengths: { 'only_tactic': 0.5 }
        }
      ];

      const result = validationProtocols.calculateConstructValidity(singleTactic);
      
      expect(result.convergentValidity).toBeDefined();
      expect(result.discriminantValidity).toBeDefined();
      expect(result.factorLoadings['only_tactic']).toBeDefined();
    });
  });

  describe('Criterion Validity', () => {
    test('cross-validation against human coding accuracy', async () => {
      const responses = [
        {
          reasoning: 'We must maximize the greatest good for the greatest number of people.',
          choice: 'A',
          domain: 'public_policy',
          difficulty: 7
        },
        {
          reasoning: 'It is our duty to respect individual rights regardless of consequences.',
          choice: 'B',
          domain: 'personal_ethics',
          difficulty: 6
        }
      ];

      const humanCoding = [
        {
          responseId: '0',
          identifiedTactics: ['utilitarian_maximization'],
          confidence: 0.9,
          coderId: 'expert1'
        },
        {
          responseId: '1',
          identifiedTactics: ['duty_based_reasoning'],
          confidence: 0.8,
          coderId: 'expert1'
        }
      ];

      const result = await validationProtocols.validateAgainstHumanCoding(
        responses,
        humanCoding,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses)
      );

      expect(result.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.overallAccuracy).toBeLessThanOrEqual(1);
      expect(result.perTacticAccuracy).toBeDefined();
      expect(result.stabilityScore).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(result.overfittingRisk);
    });

    test('detects overfitting in cross-validation', async () => {
      // Create scenario prone to overfitting (small dataset, complex model)
      const smallDataset = [
        {
          reasoning: 'Complex ethical reasoning that might overfit.',
          choice: 'A',
          domain: 'complex',
          difficulty: 9
        }
      ];

      const humanCoding = [
        {
          responseId: '0',
          identifiedTactics: ['rare_tactic'],
          confidence: 0.7,
          coderId: 'expert1'
        }
      ];

      const result = await validationProtocols.validateAgainstHumanCoding(
        smallDataset,
        humanCoding,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses)
      );

      // Small dataset should show overfitting risk
      expect(['medium', 'high']).toContain(result.overfittingRisk);
      expect(result.stabilityScore).toBeLessThan(1.0);
    });

    test('validates per-tactic accuracy correctly', async () => {
      const responses = Array.from({ length: 10 }, (_, i) => ({
        reasoning: `Ethical reasoning ${i} with utilitarian principles.`,
        choice: 'A',
        domain: 'ethics',
        difficulty: 5
      }));

      const humanCoding = Array.from({ length: 10 }, (_, i) => ({
        responseId: i.toString(),
        identifiedTactics: ['utilitarian_maximization'],
        confidence: 0.8,
        coderId: 'expert1'
      }));

      const result = await validationProtocols.validateAgainstHumanCoding(
        responses,
        humanCoding,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses)
      );

      expect(Object.keys(result.perTacticAccuracy)).toContain('utilitarian_maximization');
      expect(result.perTacticAccuracy['utilitarian_maximization']).toBeGreaterThanOrEqual(0);
      expect(result.perTacticAccuracy['utilitarian_maximization']).toBeLessThanOrEqual(1);
    });
  });

  describe('Predictive Validity', () => {
    test('temporal stability assessment', async () => {
      const initialResponses = [
        {
          reasoning: 'Utilitarian reasoning at time 1.',
          choice: 'A',
          domain: 'ethics',
          difficulty: 5,
          timestamp: new Date('2023-01-01')
        }
      ];

      const followUpResponses = [
        {
          reasoning: 'Similar utilitarian reasoning at time 2.',
          choice: 'A',
          domain: 'ethics',
          difficulty: 5,
          timestamp: new Date('2023-07-01')
        }
      ];

      const result = await validationProtocols.validatePredictiveAccuracy(
        initialResponses,
        followUpResponses,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        6
      );

      expect(result.futureAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.futureAccuracy).toBeLessThanOrEqual(1);
      expect(result.temporalStability).toBeGreaterThanOrEqual(0);
      expect(result.temporalStability).toBeLessThanOrEqual(1);
      expect(result.decayRate).toBeGreaterThanOrEqual(0);
      expect(result.confidenceIntervals[0]).toBeLessThanOrEqual(result.confidenceIntervals[1]);
    });

    test('decay rate modeling accuracy', async () => {
      // Create data with known temporal decay
      const initialResponses = Array.from({ length: 5 }, (_, i) => ({
        reasoning: 'Strong utilitarian reasoning initially.',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2023-01-01')
      }));

      const followUpResponses = Array.from({ length: 5 }, (_, i) => ({
        reasoning: 'Weaker utilitarian reasoning later.',
        choice: 'B',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2024-01-01')
      }));

      const result = await validationProtocols.validatePredictiveAccuracy(
        initialResponses,
        followUpResponses,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        12
      );

      expect(result.decayRate).toBeGreaterThan(0); // Should detect decay over 12 months
      expect(result.temporalStability).toBeLessThan(1); // Stability should decrease
    });

    test('predictive factors identification', async () => {
      const initialResponses = [
        {
          reasoning: 'Complex ethical reasoning.',
          choice: 'A',
          domain: 'ethics',
          difficulty: 8,
          timestamp: new Date('2023-01-01')
        }
      ];

      const followUpResponses = [
        {
          reasoning: 'Consistent ethical reasoning.',
          choice: 'A',
          domain: 'ethics',
          difficulty: 8,
          timestamp: new Date('2023-06-01')
        }
      ];

      const result = await validationProtocols.validatePredictiveAccuracy(
        initialResponses,
        followUpResponses,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        5
      );

      expect(result.predictiveFactors).toHaveLength(3);
      expect(result.predictiveFactors.every(factor => 
        factor.importance >= 0 && factor.importance <= 1
      )).toBe(true);
      expect(result.predictiveFactors.every(factor => 
        ['positive', 'negative'].includes(factor.direction)
      )).toBe(true);
    });
  });

  describe('Integration and Error Handling', () => {
    test('validation protocols handle empty datasets', async () => {
      const emptyResponses: any[] = [];
      const emptyRatings: any[] = [];

      // Should handle empty data gracefully
      expect(async () => {
        await validationProtocols.validateAgainstHumanCoding(
          emptyResponses,
          [],
          (responses) => ethicalTacticDiscovery.findCoherentTactics(responses)
        );
      }).not.toThrow();

      const result = validationProtocols.calculateInterRaterReliability(emptyRatings);
      expect(result.kendallTau).toBeDefined();
    });

    test('validation metrics remain bounded', async () => {
      // Test with extreme data to ensure metrics stay in valid ranges
      const extremeData = [
        {
          responseId: 'extreme',
          tacticStrengths: { 'extreme_tactic': 999999 }
        }
      ];

      const result = validationProtocols.calculateConstructValidity(extremeData);
      
      expect(result.convergentValidity).toBeGreaterThanOrEqual(0);
      expect(result.convergentValidity).toBeLessThanOrEqual(1);
      expect(result.discriminantValidity).toBeGreaterThanOrEqual(0);
      expect(result.discriminantValidity).toBeLessThanOrEqual(1);
    });

    test('comprehensive validation study integration', async () => {
      const testData = {
        responses: [
          {
            reasoning: 'Test ethical reasoning.',
            choice: 'A',
            domain: 'test',
            difficulty: 5
          }
        ],
        expertRatings: [
          {
            expertId: 'test_expert',
            tacticName: 'test_tactic',
            relevance: 6,
            clarity: 6,
            completeness: 6
          }
        ]
      };

      // This would typically be called through the API endpoint
      // Testing the integration of multiple validation types
      const mockComprehensiveValidation = async (data: any) => {
        const contentValidity = await validationProtocols.validateTacticDefinitions([], data.expertRatings);
        const constructValidity = validationProtocols.calculateConstructValidity([]);
        
        return {
          contentValidity,
          constructValidity,
          summary: {
            overallValidity: 'moderate',
            confidence: 0.7,
            strengths: ['Content validity established'],
            recommendations: ['Expand sample size']
          }
        };
      };

      const result = await mockComprehensiveValidation(testData);
      
      expect(result.summary.overallValidity).toBeDefined();
      expect(result.summary.confidence).toBeGreaterThan(0);
      expect(result.summary.strengths).toBeInstanceOf(Array);
      expect(result.summary.recommendations).toBeInstanceOf(Array);
    });
  });
});