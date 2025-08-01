/**
 * Test suite for Statistical Foundation and Validation Protocols
 */

import { statisticalFoundation } from '../src/lib/statistical-foundation';
import { validationProtocols } from '../src/lib/validation-protocols';
import { ethicalTacticDiscovery } from '../src/lib/ethical-tactic-discovery';

describe('Statistical Foundation', () => {
  test('calculates confidence intervals correctly', () => {
    const data = [0.7, 0.8, 0.6, 0.9, 0.75, 0.65, 0.85, 0.7, 0.8, 0.75];
    const result = statisticalFoundation.calculateConfidenceInterval(data);
    
    expect(result.observations).toBe(10);
    expect(result.mean).toBeCloseTo(0.75, 2); // Corrected expected mean
    expect(result.confidenceInterval[0]).toBeLessThan(result.mean);
    expect(result.confidenceInterval[1]).toBeGreaterThan(result.mean);
    expect(result.pValue).toBeGreaterThan(0);
    expect(result.effectSize).toBeGreaterThan(0);
  });

  test('calculates Bayesian tactic probability', () => {
    const evidence = [0.8, 0.7, 0.9];
    const prior = 0.3;
    const baseline = [0.5, 0.4, 0.6, 0.45, 0.55];
    
    const result = statisticalFoundation.calculateBayesianTacticProbability(evidence, prior, baseline);
    
    expect(result.posterior).toBeGreaterThan(0);
    expect(result.posterior).toBeLessThan(1);
    expect(result.prior).toBe(prior);
    expect(result.likelihood).toBeGreaterThan(0);
    expect(result.credibleInterval[0]).toBeLessThan(result.credibleInterval[1]);
    expect(result.bayesFactor).toBeGreaterThan(0);
  });

  test('performs cross-validation correctly', () => {
    const data = Array.from({ length: 20 }, (_, i) => ({ id: i, value: Math.random() }));
    
    const result = statisticalFoundation.kFoldCrossValidation(
      data,
      5,
      (trainData) => ({ model: 'trained', size: trainData.length }),
      (model, testData) => testData.length > 0 ? 0.8 : 0
    );
    
    expect(result.folds).toHaveLength(5);
    expect(result.mean).toBeGreaterThan(0);
    expect(result.std).toBeGreaterThanOrEqual(0);
  });

  test('calculates bootstrap confidence intervals', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const statistic = (data: number[]) => data.reduce((sum, x) => sum + x, 0) / data.length;
    
    const result = statisticalFoundation.bootstrapConfidenceInterval(data, statistic, 100);
    
    expect(result[0]).toBeLessThan(result[1]);
    expect(result[0]).toBeGreaterThan(0);
    expect(result[1]).toBeLessThan(15);
  });

  test('calculates effect sizes correctly', () => {
    const group1 = [1, 2, 3, 4, 5];
    const group2 = [3, 4, 5, 6, 7];
    
    const cohenD = statisticalFoundation.calculateCohenD(group1, group2);
    
    expect(Math.abs(cohenD)).toBeGreaterThan(0); // Effect should exist
    expect(Math.abs(cohenD)).toBeLessThan(5); // reasonable effect size
    // Note: Cohen's D can be negative if group1 > group2
  });

  test('calculates statistical power', () => {
    const power = statisticalFoundation.calculateStatisticalPower(0.5, 30);
    
    expect(power).toBeGreaterThan(0);
    expect(power).toBeLessThanOrEqual(1);
  });

  test('calculates required sample size', () => {
    const sampleSize = statisticalFoundation.calculateRequiredSampleSize(0.5, 0.8);
    
    expect(sampleSize).toBeGreaterThan(0);
    expect(sampleSize).toBeLessThan(10000);
  });
});

describe('Validation Protocols', () => {
  test('validates tactic definitions with expert ratings', async () => {
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

    // Create enough expert ratings to meet minimum sample size
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
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.evidence).toBeDefined();
    expect(result.recommendations).toBeInstanceOf(Array);
    expect(result.limitationsIdentified).toBeInstanceOf(Array);
  });

  test('calculates inter-rater reliability', () => {
    const ratings = [
      {
        raterId: 'rater1',
        responseId: 'response1',
        tacticScores: { 'utilitarian_maximization': 6, 'duty_based_reasoning': 3 }
      },
      {
        raterId: 'rater2',
        responseId: 'response1',
        tacticScores: { 'utilitarian_maximization': 7, 'duty_based_reasoning': 2 }
      },
      {
        raterId: 'rater1',
        responseId: 'response2',
        tacticScores: { 'utilitarian_maximization': 4, 'duty_based_reasoning': 6 }
      },
      {
        raterId: 'rater2',
        responseId: 'response2',
        tacticScores: { 'utilitarian_maximization': 5, 'duty_based_reasoning': 7 }
      }
    ];

    const result = validationProtocols.calculateInterRaterReliability(ratings);
    
    expect(result.kendallTau).toBeDefined();
    expect(result.pearsonCorrelation).toBeDefined();
    expect(result.cohensKappa).toBeDefined();
    expect(result.agreement).toBeDefined();
    expect(result.raterConsistency).toBeDefined();
  });

  test('calculates construct validity', () => {
    const tacticScores = [
      {
        responseId: 'response1',
        tacticStrengths: { 'utilitarian_maximization': 0.8, 'duty_based_reasoning': 0.2 }
      },
      {
        responseId: 'response2',
        tacticStrengths: { 'utilitarian_maximization': 0.3, 'duty_based_reasoning': 0.7 }
      },
      {
        responseId: 'response3',
        tacticStrengths: { 'utilitarian_maximization': 0.6, 'duty_based_reasoning': 0.4 }
      }
    ];

    const result = validationProtocols.calculateConstructValidity(tacticScores);
    
    expect(result.convergentValidity).toBeDefined();
    expect(result.discriminantValidity).toBeDefined();
    expect(result.factorLoadings).toBeDefined();
    expect(result.dimensionalityReduction).toBeDefined();
    expect(result.dimensionalityReduction.explainedVariance).toBeGreaterThan(0);
  });
});

describe('Integrated System Validation', () => {
  test('ethical tactic discovery with validation', () => {
    const responses = [
      {
        reasoning: 'We must maximize the greatest good for the greatest number of people in this situation.',
        choice: 'A',
        domain: 'public_policy',
        difficulty: 7
      },
      {
        reasoning: 'It is our duty to respect individual rights regardless of the consequences.',
        choice: 'B',
        domain: 'personal_ethics',
        difficulty: 6
      },
      {
        reasoning: 'The most important thing is to minimize harm and prevent suffering.',
        choice: 'C',
        domain: 'medical_ethics',
        difficulty: 8
      }
    ];

    const tacticSet = ethicalTacticDiscovery.findCoherentTactics(responses);
    
    expect(tacticSet.primary).toBeInstanceOf(Array);
    expect(tacticSet.secondary).toBeInstanceOf(Array);
    expect(tacticSet.contextual).toBeInstanceOf(Object);
    expect(tacticSet.metaTactics).toBeInstanceOf(Array);

    // Check that tactics were discovered
    const allTactics = [
      ...tacticSet.primary,
      ...tacticSet.secondary,
      ...Object.values(tacticSet.contextual).flat()
    ];
    
    expect(allTactics.length).toBeGreaterThan(0);
    
    // Validate discovered tactics have required properties
    allTactics.forEach(tactic => {
      expect(tactic.name).toBeDefined();
      expect(tactic.description).toBeDefined();
      expect(tactic.strength).toBeGreaterThan(0);
      expect(tactic.consistency).toBeGreaterThanOrEqual(0);
      expect(tactic.evidence).toBeInstanceOf(Array);
      expect(tactic.aiGuidance).toBeDefined();
    });
  });

  test('validation metrics calculation', async () => {
    const responses = [
      { reasoning: 'Maximize utility for all', choice: 'A', domain: 'ethics', difficulty: 5 },
      { reasoning: 'Follow moral duty', choice: 'B', domain: 'ethics', difficulty: 6 },
      { reasoning: 'Consider character virtues', choice: 'C', domain: 'ethics', difficulty: 7 }
    ];

    // Mock tactic profile structure with enough tactics to meet minimum sample size
    const tacticProfile = {
      discoveredTactics: {
        primary: [
          { name: 'utilitarian_maximization', strength: 0.7, description: 'Test tactic' },
          { name: 'harm_minimization', strength: 0.6, description: 'Test tactic' },
          { name: 'duty_based_reasoning', strength: 0.8, description: 'Test tactic' },
          { name: 'rights_protection', strength: 0.5, description: 'Test tactic' },
          { name: 'character_focus', strength: 0.7, description: 'Test tactic' }
        ],
        secondary: [
          { name: 'relational_focus', strength: 0.4, description: 'Test tactic' },
          { name: 'contextual_adaptation', strength: 0.3, description: 'Test tactic' },
          { name: 'multi_framework_integration', strength: 0.5, description: 'Test tactic' },
          { name: 'value_conflict_recognition', strength: 0.6, description: 'Test tactic' },
          { name: 'pragmatic_reasoning', strength: 0.4, description: 'Test tactic' }
        ]
      }
    };

    // This would be called from the API endpoint
    const calculateValidationMetrics = async (responses: any[], tacticProfile: any) => {
      const tacticStrengths = [
        ...tacticProfile.discoveredTactics.primary.map((t: any) => t.strength),
        ...tacticProfile.discoveredTactics.secondary.map((t: any) => t.strength)
      ];

      if (tacticStrengths.length === 0) {
        return {
          reliability: 'insufficient_data',
          confidence: 0,
          sampleAdequacy: 'low',
          warnings: ['No tactics discovered - may indicate insufficient response data']
        };
      }

      const reliabilityEvidence = statisticalFoundation.calculateConfidenceInterval(tacticStrengths);
      
      const sampleAdequacy = responses.length >= 12 ? 'high' : 
                            responses.length >= 8 ? 'medium' : 'low';
      
      const avgConfidence = reliabilityEvidence.mean;
      const confidenceLevel = avgConfidence >= 0.7 ? 'high' :
                             avgConfidence >= 0.5 ? 'medium' : 'low';
      
      return {
        reliability: confidenceLevel,
        confidence: avgConfidence,
        sampleAdequacy,
        statisticalEvidence: {
          mean: reliabilityEvidence.mean,
          confidenceInterval: reliabilityEvidence.confidenceInterval,
          effectSize: reliabilityEvidence.effectSize
        },
        warnings: responses.length < 8 ? ['Small sample size may reduce reliability'] : []
      };
    };

    const metrics = await calculateValidationMetrics(responses, tacticProfile);
    
    expect(metrics.reliability).toBeDefined();
    expect(metrics.confidence).toBeGreaterThan(0);
    expect(metrics.sampleAdequacy).toBeDefined();
    expect(metrics.warnings).toBeInstanceOf(Array);
  });
});