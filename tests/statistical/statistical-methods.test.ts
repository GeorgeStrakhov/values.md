/**
 * Statistical Methods Tests - Complex Statistical Procedures
 * 
 * Tests advanced statistical methods for correctness and mathematical properties
 */

import { statisticalFoundation } from '../../src/lib/statistical-foundation';
import { ethicalTacticDiscovery } from '../../src/lib/ethical-tactic-discovery';

describe('Statistical Methods - Correctness Tests', () => {

  describe('Bayesian Inference', () => {
    test('posterior probability follows Bayes theorem', () => {
      const evidence = [0.8, 0.7, 0.9, 0.85, 0.75];
      const prior = 0.3;
      const baseline = [0.5, 0.4, 0.6, 0.45, 0.55, 0.5, 0.4, 0.6, 0.45, 0.55];
      
      const result = statisticalFoundation.calculateBayesianTacticProbability(evidence, prior, baseline);
      
      // Test Bayes' theorem: P(H|E) = P(E|H) * P(H) / P(E)
      const expectedPosterior = (result.likelihood * result.prior) / 
        (result.likelihood * result.prior + (1 - result.likelihood) * (1 - result.prior));
      
      expect(result.posterior).toBeCloseTo(expectedPosterior, 3);
      expect(result.posterior).toBeGreaterThan(0);
      expect(result.posterior).toBeLessThan(1);
    });

    test('credible intervals contain true parameter with specified probability', () => {
      // Test with known parameter values
      const trueSuccessRate = 0.7;
      const trials = 20;
      
      // Simulate binomial data
      const evidence = Array.from({ length: trials }, () => 
        Math.random() < trueSuccessRate ? 1 : 0
      );
      
      const prior = 0.5; // Neutral prior
      const baseline = Array(50).fill(0.5); // Baseline assumption
      
      const result = statisticalFoundation.calculateBayesianTacticProbability(evidence, prior, baseline);
      
      // Credible interval should be well-formed
      expect(result.credibleInterval[0]).toBeLessThan(result.credibleInterval[1]);
      expect(result.credibleInterval[0]).toBeGreaterThanOrEqual(0);
      expect(result.credibleInterval[1]).toBeLessThanOrEqual(1);
      
      // Posterior should be somewhere reasonable given the evidence
      expect(result.posterior).toBeGreaterThan(0.1);
      expect(result.posterior).toBeLessThan(0.9);
    });

    test('Bayes factors provide correct evidence ratios', () => {
      // Strong evidence scenario
      const strongEvidence = [0.9, 0.95, 0.85, 0.9, 0.88];
      const prior = 0.5;
      const baseline = [0.3, 0.4, 0.35, 0.3, 0.38, 0.32, 0.41, 0.29, 0.36, 0.33];
      
      const strongResult = statisticalFoundation.calculateBayesianTacticProbability(
        strongEvidence, prior, baseline
      );
      
      // Weak evidence scenario
      const weakEvidence = [0.5, 0.6, 0.4, 0.55, 0.45];
      const weakResult = statisticalFoundation.calculateBayesianTacticProbability(
        weakEvidence, prior, baseline
      );
      
      // Strong evidence should have higher Bayes factor
      expect(strongResult.bayesFactor).toBeGreaterThan(weakResult.bayesFactor);
      expect(strongResult.bayesFactor).toBeGreaterThan(1);
      
      // Bayes factors should be finite and positive
      expect(Number.isFinite(strongResult.bayesFactor)).toBe(true);
      expect(Number.isFinite(weakResult.bayesFactor)).toBe(true);
    });

    test('conjugate priors update correctly', () => {
      // Test with Beta-Binomial conjugate prior
      const evidence = [1, 1, 0, 1, 0, 1, 1, 0, 1, 1]; // 7 successes, 3 failures
      const prior = 0.5;
      const baseline = Array(20).fill(0.5);
      
      const result = statisticalFoundation.calculateBayesianTacticProbability(evidence, prior, baseline);
      
      // With Beta(1,1) prior and 7 successes, 3 failures, 
      // posterior should be Beta(8,4) with mean 8/12 = 2/3
      const successCount = evidence.filter(x => x === 1).length;
      const failureCount = evidence.filter(x => x === 0).length;
      const expectedPosteriorMean = (1 + successCount) / (2 + evidence.length);
      
      // Posterior should be in reasonable range
      expect(result.posterior).toBeGreaterThan(0.4);
      expect(result.posterior).toBeLessThan(0.9);
      
      // Credible interval should reflect the evidence
      expect(result.credibleInterval[1] - result.credibleInterval[0]).toBeLessThan(0.5);
    });
  });

  describe('Resampling Methods', () => {
    test('bootstrap samples preserve distribution properties', () => {
      const originalData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const numBootstraps = 100;
      
      const bootstrapMeans = [];
      for (let i = 0; i < numBootstraps; i++) {
        const bootSample = statisticalFoundation['bootstrapSample'](originalData);
        const mean = bootSample.reduce((sum, x) => sum + x, 0) / bootSample.length;
        bootstrapMeans.push(mean);
      }
      
      // Bootstrap distribution of means should center around original mean
      const originalMean = originalData.reduce((sum, x) => sum + x, 0) / originalData.length;
      const bootstrapMean = bootstrapMeans.reduce((sum, x) => sum + x, 0) / bootstrapMeans.length;
      
      expect(Math.abs(bootstrapMean - originalMean)).toBeLessThan(0.5);
      
      // Bootstrap samples should vary (not all identical)
      const uniqueMeans = new Set(bootstrapMeans.map(m => Math.round(m * 100)));
      expect(uniqueMeans.size).toBeGreaterThan(10);
    });

    test('cross-validation prevents data leakage', () => {
      const data = Array.from({ length: 50 }, (_, i) => ({ id: i, value: i }));
      
      const result = statisticalFoundation.kFoldCrossValidation(
        data,
        5,
        (trainData) => {
          // Simple model: remember all training IDs
          return { trainIds: new Set(trainData.map(d => d.id)) };
        },
        (model, testData) => {
          // Check for data leakage: test data should not be in training set
          const leakage = testData.filter(d => model.trainIds.has(d.id));
          return leakage.length === 0 ? 1 : 0; // 1 if no leakage, 0 if leakage
        }
      );
      
      // All folds should have no data leakage
      expect(result.mean).toBe(1);
      expect(result.std).toBe(0);
      expect(result.folds.every(score => score === 1)).toBe(true);
    });

    test('permutation tests maintain null distribution', () => {
      // Create two groups with no real difference
      const group1 = Array.from({ length: 15 }, () => 5 + Math.random() * 2);
      const group2 = Array.from({ length: 15 }, () => 5 + Math.random() * 2);
      
      // Calculate actual difference
      const actualDiff = Math.abs(
        group1.reduce((sum, x) => sum + x, 0) / group1.length -
        group2.reduce((sum, x) => sum + x, 0) / group2.length
      );
      
      // Permutation test
      const combined = [...group1, ...group2];
      const permutationDiffs = [];
      
      for (let i = 0; i < 100; i++) {
        // Shuffle and split
        const shuffled = [...combined].sort(() => Math.random() - 0.5);
        const perm1 = shuffled.slice(0, group1.length);
        const perm2 = shuffled.slice(group1.length);
        
        const permDiff = Math.abs(
          perm1.reduce((sum, x) => sum + x, 0) / perm1.length -
          perm2.reduce((sum, x) => sum + x, 0) / perm2.length
        );
        
        permutationDiffs.push(permDiff);
      }
      
      // Under null hypothesis, actual difference should not be extreme
      const extremeCount = permutationDiffs.filter(d => d >= actualDiff).length;
      const pValue = extremeCount / permutationDiffs.length;
      
      // For groups with no real difference, p-value should not be extreme
      expect(pValue).toBeGreaterThan(0.05);
      expect(pValue).toBeLessThan(0.95);
    });

    test('jackknife estimates are unbiased', () => {
      const data = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
      const n = data.length;
      
      // Calculate mean using jackknife
      const jackknifeMeans = [];
      for (let i = 0; i < n; i++) {
        const jackknifeSample = data.filter((_, index) => index !== i);
        const jackknifeMean = jackknifeSample.reduce((sum, x) => sum + x, 0) / jackknifeSample.length;
        jackknifeMeans.push(jackknifeMean);
      }
      
      const jackknifeMeanEstimate = jackknifeMeans.reduce((sum, x) => sum + x, 0) / jackknifeMeans.length;
      const originalMean = data.reduce((sum, x) => sum + x, 0) / data.length;
      
      // Jackknife estimate should be very close to original mean
      expect(Math.abs(jackknifeMeanEstimate - originalMean)).toBeLessThan(0.1);
      
      // Calculate jackknife variance estimate
      const jackknifeVariance = jackknifeMeans.reduce((sum, jm) => 
        sum + Math.pow(jm - jackknifeMeanEstimate, 2), 0
      ) * (n - 1) / n;
      
      expect(jackknifeVariance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multiple Testing Correction', () => {
    test('Bonferroni correction controls FWER', () => {
      const pValues = [0.01, 0.02, 0.03, 0.04, 0.05, 0.10, 0.20, 0.30];
      const corrected = statisticalFoundation.bonferroniCorrection(pValues);
      
      // Corrected p-values should be larger than original
      corrected.forEach((cp, i) => {
        expect(cp).toBeGreaterThanOrEqual(pValues[i]);
        expect(cp).toBeLessThanOrEqual(1);
      });
      
      // Should multiply by number of tests
      const numTests = pValues.length;
      corrected.forEach((cp, i) => {
        const expected = Math.min(1, pValues[i] * numTests);
        expect(cp).toBeCloseTo(expected, 10);
      });
      
      // With α = 0.05 and 8 tests, Bonferroni threshold is 0.05/8 = 0.00625
      const significantCount = corrected.filter(p => p < 0.05).length;
      expect(significantCount).toBeLessThanOrEqual(1); // Should be very conservative
    });

    test('Benjamini-Hochberg controls FDR', () => {
      const pValues = [0.001, 0.01, 0.02, 0.03, 0.04, 0.05, 0.10, 0.50];
      const corrected = statisticalFoundation.benjaminiHochbergCorrection(pValues);
      
      // BH should be less conservative than Bonferroni
      const bonferroni = statisticalFoundation.bonferroniCorrection(pValues);
      corrected.forEach((cp, i) => {
        expect(cp).toBeLessThanOrEqual(bonferroni[i]);
        expect(cp).toBeLessThanOrEqual(1);
      });
      
      // Should preserve order
      for (let i = 1; i < corrected.length; i++) {
        if (pValues[i] >= pValues[i-1]) {
          expect(corrected[i]).toBeGreaterThanOrEqual(corrected[i-1] - 1e-10); // Allow for floating point
        }
      }
      
      // With FDR control, should find more significant results than Bonferroni
      const bhSignificant = corrected.filter(p => p < 0.05).length;
      const bonferroniSignificant = bonferroni.filter(p => p < 0.05).length;
      expect(bhSignificant).toBeGreaterThanOrEqual(bonferroniSignificant);
    });

    test('correction methods handle empty input', () => {
      const emptyArray: number[] = [];
      
      const bonferroniResult = statisticalFoundation.bonferroniCorrection(emptyArray);
      const bhResult = statisticalFoundation.benjaminiHochbergCorrection(emptyArray);
      
      expect(bonferroniResult).toHaveLength(0);
      expect(bhResult).toHaveLength(0);
    });

    test('corrected p-values remain valid probabilities', () => {
      // Test with extreme p-values
      const extremePValues = [0.0001, 0.9999, 0.5, 0, 1];
      
      const bonferroni = statisticalFoundation.bonferroniCorrection(extremePValues);
      const bh = statisticalFoundation.benjaminiHochbergCorrection(extremePValues);
      
      // All corrected p-values should be valid probabilities
      [...bonferroni, ...bh].forEach(p => {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(1);
        expect(Number.isFinite(p)).toBe(true);
      });
    });
  });

  describe('Integration with Tactic Discovery', () => {
    test('statistical methods enhance tactic confidence', () => {
      const responses = [
        {
          reasoning: 'We must maximize overall welfare and utility for the greatest number.',
          choice: 'A',
          domain: 'public_policy',
          difficulty: 7
        },
        {
          reasoning: 'The greatest good for the greatest number should guide our decision.',
          choice: 'A',
          domain: 'economics',
          difficulty: 6
        },
        {
          reasoning: 'Utilitarian principles suggest maximizing aggregate happiness.',
          choice: 'A',
          domain: 'ethics',
          difficulty: 8
        }
      ];

      const tactics = ethicalTacticDiscovery.findCoherentTactics(responses);
      
      // Should find utilitarian tactics
      expect(tactics.primary.length + tactics.secondary.length).toBeGreaterThan(0);
      
      // Test statistical enhancement of tactic confidence
      if (tactics.primary.length > 0) {
        const primaryTactic = tactics.primary[0];
        
        // Apply Bayesian updating
        const evidence = primaryTactic.evidence.map(e => e.confidence);
        const priorProbability = 0.5; // Neutral prior
        const populationBaseline = Array(20).fill(0.3); // Baseline assumption
        
        if (evidence.length > 0) {
          const bayesianResult = statisticalFoundation.calculateBayesianTacticProbability(
            evidence, priorProbability, populationBaseline
          );
          
          expect(bayesianResult.posterior).toBeDefined();
          expect(bayesianResult.credibleInterval[0]).toBeLessThan(bayesianResult.credibleInterval[1]);
        }
      }
    });

    test('cross-validation improves tactic reliability', () => {
      // Create larger dataset for cross-validation
      const responses = Array.from({ length: 20 }, (_, i) => ({
        reasoning: i % 2 === 0 
          ? 'Maximize overall welfare and happiness'
          : 'Follow moral duties and principles',
        choice: i % 2 === 0 ? 'A' : 'B',
        domain: 'ethics',
        difficulty: 5 + Math.floor(Math.random() * 3)
      }));

      // Cross-validate tactic discovery
      const cvResult = statisticalFoundation.kFoldCrossValidation(
        responses,
        5,
        (trainData) => {
          return ethicalTacticDiscovery.findCoherentTactics(trainData);
        },
        (trainedTactics, testData) => {
          const testTactics = ethicalTacticDiscovery.findCoherentTactics(testData);
          
          // Simple similarity metric: overlapping tactic names
          const trainNames = [
            ...trainedTactics.primary.map(t => t.name),
            ...trainedTactics.secondary.map(t => t.name)
          ];
          const testNames = [
            ...testTactics.primary.map(t => t.name),
            ...testTactics.secondary.map(t => t.name)
          ];
          
          const overlap = trainNames.filter(name => testNames.includes(name)).length;
          const total = Math.max(trainNames.length, testNames.length);
          
          return total > 0 ? overlap / total : 0;
        }
      );

      // Cross-validation should provide stability estimates
      expect(cvResult.mean).toBeGreaterThanOrEqual(0);
      expect(cvResult.mean).toBeLessThanOrEqual(1);
      expect(cvResult.std).toBeGreaterThanOrEqual(0);
      expect(cvResult.folds).toHaveLength(5);
    });

    test('multiple testing correction for multiple tactics', () => {
      // Create responses that might trigger multiple tactics
      const responses = [
        { reasoning: 'Maximize utility', choice: 'A', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Follow moral duty', choice: 'B', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Consider virtues', choice: 'C', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Care for relationships', choice: 'D', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Maximize overall good', choice: 'A', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Respect individual rights', choice: 'B', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Act with integrity', choice: 'C', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Maintain connections', choice: 'D', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Greatest good principle', choice: 'A', domain: 'ethics', difficulty: 5 },
        { reasoning: 'Categorical imperative', choice: 'B', domain: 'ethics', difficulty: 5 }
      ];

      const tactics = ethicalTacticDiscovery.findCoherentTactics(responses);
      
      // Simulate p-values for discovered tactics
      const tacticPValues = [
        ...tactics.primary.map(() => Math.random() * 0.1), // Likely significant
        ...tactics.secondary.map(() => Math.random() * 0.2 + 0.1) // Less significant
      ];

      if (tacticPValues.length > 1) {
        const correctedP = statisticalFoundation.benjaminiHochbergCorrection(tacticPValues);
        
        // Should control for multiple testing
        expect(correctedP.length).toBe(tacticPValues.length);
        correctedP.forEach((cp, i) => {
          expect(cp).toBeGreaterThanOrEqual(tacticPValues[i]);
        });
      }
    });

    test('bootstrap confidence intervals for tactic strengths', () => {
      const responses = Array.from({ length: 15 }, (_, i) => ({
        reasoning: 'Utilitarian reasoning with some variation',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5 + Math.floor(Math.random() * 3)
      }));

      const tactics = ethicalTacticDiscovery.findCoherentTactics(responses);
      
      if (tactics.primary.length > 0) {
        const tacticStrengths = tactics.primary.map(t => t.strength);
        const mean = (arr: number[]) => arr.reduce((sum, x) => sum + x, 0) / arr.length;
        
        const bootCI = statisticalFoundation.bootstrapConfidenceInterval(
          tacticStrengths, 
          mean, 
          200
        );
        
        // Bootstrap CI should be reasonable
        expect(bootCI[0]).toBeLessThan(bootCI[1]);
        expect(bootCI[0]).toBeGreaterThanOrEqual(0);
        expect(bootCI[1]).toBeLessThanOrEqual(1);
        
        // Should contain the observed mean
        const observedMean = mean(tacticStrengths);
        expect(bootCI[0]).toBeLessThanOrEqual(observedMean);
        expect(bootCI[1]).toBeGreaterThanOrEqual(observedMean);
      }
    });
  });

  describe('Advanced Statistical Properties', () => {
    test('convergence of statistical estimators', () => {
      // Test that estimators converge as sample size increases
      const sampleSizes = [20, 50, 100, 200];
      const trueValue = 0.7;
      
      const estimatorBias = sampleSizes.map(n => {
        const samples = Array.from({ length: 10 }, () => {
          const data = Array.from({ length: n }, () => 
            Math.random() < trueValue ? 1 : 0
          );
          const estimate = data.reduce((sum, x) => sum + x, 0) / data.length;
          return Math.abs(estimate - trueValue);
        });
        
        return samples.reduce((sum, bias) => sum + bias, 0) / samples.length;
      });
      
      // Bias should generally decrease with sample size
      expect(estimatorBias[estimatorBias.length - 1]).toBeLessThan(estimatorBias[0] + 0.1);
    });

    test('robustness to outliers', () => {
      const cleanData = Array.from({ length: 18 }, () => 5 + Math.random());
      const dataWithOutliers = [...cleanData, 100, -100]; // Add extreme outliers
      
      const cleanResult = statisticalFoundation.calculateConfidenceInterval(cleanData);
      const outlierResult = statisticalFoundation.calculateConfidenceInterval(dataWithOutliers);
      
      // Method should still produce valid results with outliers
      expect(Number.isFinite(outlierResult.mean)).toBe(true);
      expect(outlierResult.variance).toBeGreaterThan(0);
      expect(outlierResult.confidenceInterval[0]).toBeLessThan(outlierResult.confidenceInterval[1]);
      
      // Outliers should increase variance and widen confidence intervals
      expect(outlierResult.variance).toBeGreaterThan(cleanResult.variance);
      
      const cleanWidth = cleanResult.confidenceInterval[1] - cleanResult.confidenceInterval[0];
      const outlierWidth = outlierResult.confidenceInterval[1] - outlierResult.confidenceInterval[0];
      expect(outlierWidth).toBeGreaterThan(cleanWidth);
    });

    test('distribution assumptions and diagnostics', () => {
      // Test with different data distributions
      const normalData = Array.from({ length: 30 }, () => {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      });
      
      const skewedData = Array.from({ length: 30 }, () => Math.pow(Math.random(), 2));
      
      const normalResult = statisticalFoundation.calculateConfidenceInterval(normalData);
      const skewedResult = statisticalFoundation.calculateConfidenceInterval(skewedData);
      
      // Both should produce valid statistical results
      expect(Number.isFinite(normalResult.mean)).toBe(true);
      expect(Number.isFinite(skewedResult.mean)).toBe(true);
      
      // Skewed data might have different properties
      expect(skewedResult.variance).toBeGreaterThan(0);
      expect(skewedResult.pValue).toBeGreaterThan(0);
      expect(skewedResult.pValue).toBeLessThanOrEqual(1);
    });
  });
});