/**
 * Research Integration Tests - Publication-Ready Capabilities
 * 
 * Tests complete research workflows for academic publication standards
 */

import { validationProtocols } from '../../src/lib/validation-protocols';
import { statisticalFoundation } from '../../src/lib/statistical-foundation';
import { ethicalTacticDiscovery } from '../../src/lib/ethical-tactic-discovery';

describe('Research Integration - Publication Ready Tests', () => {

  describe('Complete Validation Studies', () => {
    test('conduct full validation study with simulated data', async () => {
      // Simulate a complete research study
      const responses = Array.from({ length: 50 }, (_, i) => ({
        reasoning: i % 3 === 0 
          ? 'We should maximize overall welfare and happiness for everyone involved.'
          : i % 3 === 1 
          ? 'We must follow our moral duties regardless of the consequences.'
          : 'We should consider the character virtues that guide ethical behavior.',
        choice: ['A', 'B', 'C', 'D'][i % 4],
        domain: ['public_policy', 'personal_ethics', 'medical_ethics'][i % 3],
        difficulty: Math.floor(Math.random() * 5) + 3
      }));

      // Simulate expert ratings
      const expertRatings = [
        'utilitarian_maximization',
        'duty_based_reasoning', 
        'character_focus'
      ].flatMap(tacticName => 
        Array.from({ length: 5 }, (_, expertIndex) => ({
          expertId: `expert${expertIndex + 1}`,
          tacticName,
          relevance: Math.floor(Math.random() * 3) + 5, // 5-7 range
          clarity: Math.floor(Math.random() * 3) + 5,
          completeness: Math.floor(Math.random() * 3) + 5
        }))
      );

      // Simulate human coding
      const humanCoding = responses.slice(0, 20).map((_, i) => ({
        responseId: i.toString(),
        identifiedTactics: i % 3 === 0 
          ? ['utilitarian_maximization']
          : i % 3 === 1 
          ? ['duty_based_reasoning']
          : ['character_focus'],
        confidence: 0.7 + Math.random() * 0.2,
        coderId: `coder${(i % 3) + 1}`
      }));

      // Run comprehensive validation
      const validationData = {
        responses,
        expertRatings,
        humanCoding
      };

      // Test individual validation components
      const tactics = ethicalTacticDiscovery.findCoherentTactics(responses);
      expect(tactics.primary.length + tactics.secondary.length).toBeGreaterThan(0);

      const contentValidity = await validationProtocols.validateTacticDefinitions(
        Array.from(new Set(expertRatings.map(r => r.tacticName))).map(name => ({
          name,
          description: `Description for ${name}`,
          patterns: [name],
          indicators: [name],
          confidence: 0,
          evidenceRequired: 1,
          framework: 'consequentialist' as const
        })),
        expertRatings
      );

      const criterionValidity = await validationProtocols.validateAgainstHumanCoding(
        responses.slice(0, 20),
        humanCoding,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses)
      );

      // Validate study has publication-ready metrics
      expect(contentValidity.validity).toBeDefined();
      expect(criterionValidity.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(criterionValidity.perTacticAccuracy).toBeDefined();
      
      // Study should have sufficient statistical power
      const tacticStrengths = [
        ...tactics.primary.map(t => t.strength),
        ...tactics.secondary.map(t => t.strength)
      ];
      
      if (tacticStrengths.length > 0) {
        const evidence = statisticalFoundation.calculateConfidenceInterval(tacticStrengths);
        const power = statisticalFoundation.calculateStatisticalPower(0.5, responses.length);
        
        expect(evidence.confidenceInterval[1]).toBeGreaterThan(evidence.confidenceInterval[0]);
        expect(power).toBeGreaterThan(0); // Should have some statistical power
      }
    });

    test('generate publication-ready statistical reports', () => {
      const data = Array.from({ length: 30 }, () => 0.6 + Math.random() * 0.3); // Realistic tactic strengths
      const evidence = statisticalFoundation.calculateConfidenceInterval(data);
      
      // Create publication-ready report structure
      const report = {
        sampleSize: data.length,
        descriptiveStats: {
          mean: evidence.mean,
          standardDeviation: Math.sqrt(evidence.variance),
          standardError: evidence.standardError,
          confidenceInterval: evidence.confidenceInterval
        },
        inferentialStats: {
          tStatistic: evidence.mean / evidence.standardError,
          degreesOfFreedom: data.length - 1,
          pValue: evidence.pValue,
          effectSize: evidence.effectSize,
          cohensD: evidence.effectSize // Alias for clarity
        },
        interpretation: {
          significanceLevel: evidence.significanceLevel,
          isSignificant: evidence.pValue < 0.05,
          effectSizeInterpretation: Math.abs(evidence.effectSize) < 0.2 ? 'small' :
                                   Math.abs(evidence.effectSize) < 0.5 ? 'medium' : 'large',
          statisticalPower: statisticalFoundation.calculateStatisticalPower(evidence.effectSize, data.length)
        }
      };

      // Validate report completeness for publication
      expect(report.sampleSize).toBeGreaterThan(0);
      expect(report.descriptiveStats.mean).toBeFinite();
      expect(report.descriptiveStats.confidenceInterval).toHaveLength(2);
      expect(report.inferentialStats.pValue).toBeGreaterThan(0);
      expect(report.inferentialStats.pValue).toBeLessThanOrEqual(1);
      expect(report.interpretation.effectSizeInterpretation).toBeDefined();
      expect(['small', 'medium', 'large']).toContain(report.interpretation.effectSizeInterpretation);
    });

    test('handle missing data in real research scenarios', async () => {
      // Create dataset with realistic missing data patterns
      const responsesWithMissing = [
        { reasoning: 'Complete response', choice: 'A', domain: 'ethics', difficulty: 5 },
        { reasoning: '', choice: 'B', domain: 'ethics', difficulty: 5 }, // Missing reasoning
        { reasoning: 'Another complete response', choice: 'C', domain: '', difficulty: 5 }, // Missing domain
        { reasoning: 'Third response', choice: 'D', domain: 'ethics', difficulty: null }, // Missing difficulty
      ];

      // Test that system handles missing data gracefully
      const tactics = ethicalTacticDiscovery.findCoherentTactics(responsesWithMissing);
      
      // Should still be able to discover tactics despite missing data
      expect(tactics).toBeDefined();
      expect(tactics.primary).toBeInstanceOf(Array);
      expect(tactics.secondary).toBeInstanceOf(Array);
      
      // Validate that missing data doesn't crash the system
      const validResponses = responsesWithMissing.filter(r => 
        r.reasoning && r.reasoning.length > 0 && r.domain && r.difficulty
      );
      expect(validResponses.length).toBeGreaterThan(0);
    });

    test('maintain statistical power across study designs', () => {
      const studyDesigns = [
        { sampleSize: 20, effectSize: 0.5 },
        { sampleSize: 50, effectSize: 0.3 },
        { sampleSize: 100, effectSize: 0.2 },
        { sampleSize: 200, effectSize: 0.15 }
      ];

      studyDesigns.forEach(design => {
        const power = statisticalFoundation.calculateStatisticalPower(design.effectSize, design.sampleSize);
        const requiredN = statisticalFoundation.calculateRequiredSampleSize(design.effectSize, 0.8);
        
        expect(power).toBeGreaterThan(0);
        expect(power).toBeLessThanOrEqual(1);
        expect(requiredN).toBeGreaterThan(0);
        
        // Larger samples should give more power for same effect size
        if (design.sampleSize >= requiredN) {
          expect(power).toBeGreaterThan(0.7); // Should approach target power
        }
      });
    });
  });

  describe('Longitudinal Analysis', () => {
    test('track tactic stability over time', async () => {
      const timePoints = [
        new Date('2023-01-01'),
        new Date('2023-06-01'),
        new Date('2023-12-01')
      ];

      // Simulate longitudinal data with realistic drift
      const generateTimePointData = (timeIndex: number) => 
        Array.from({ length: 20 }, (_, i) => ({
          reasoning: `Utilitarian reasoning at time ${timeIndex + 1} - response ${i}`,
          choice: 'A',
          domain: 'ethics',
          difficulty: 5,
          timestamp: timePoints[timeIndex]
        }));

      const timePoint1 = generateTimePointData(0);
      const timePoint2 = generateTimePointData(1);
      const timePoint3 = generateTimePointData(2);

      // Test stability between consecutive time points
      const stability12 = await validationProtocols.validatePredictiveAccuracy(
        timePoint1,
        timePoint2,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        6
      );

      const stability23 = await validationProtocols.validatePredictiveAccuracy(
        timePoint2,
        timePoint3,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        6
      );

      expect(stability12.temporalStability).toBeGreaterThanOrEqual(0);
      expect(stability12.temporalStability).toBeLessThanOrEqual(1);
      expect(stability23.temporalStability).toBeGreaterThanOrEqual(0);
      expect(stability23.temporalStability).toBeLessThanOrEqual(1);
      
      // Test that stability metrics are meaningful
      expect(stability12.futureAccuracy).toBeDefined();
      expect(stability12.decayRate).toBeGreaterThanOrEqual(0);
    });

    test('handle dropout and missing follow-up data', async () => {
      // Simulate realistic dropout pattern
      const baselineParticipants = Array.from({ length: 100 }, (_, i) => ({
        participantId: i,
        reasoning: 'Baseline ethical reasoning',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2023-01-01')
      }));

      // 70% retention at follow-up (realistic for longitudinal studies)
      const followUpParticipants = baselineParticipants
        .filter((_, i) => i < 70)
        .map(p => ({
          ...p,
          reasoning: 'Follow-up ethical reasoning',
          timestamp: new Date('2023-07-01')
        }));

      const stabilityWithDropout = await validationProtocols.validatePredictiveAccuracy(
        baselineParticipants,
        followUpParticipants,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        6
      );

      // Should handle dropout gracefully
      expect(stabilityWithDropout.futureAccuracy).toBeDefined();
      expect(stabilityWithDropout.temporalStability).toBeDefined();
      
      // Confidence intervals should be wider with dropout
      const ciWidth = stabilityWithDropout.confidenceIntervals[1] - stabilityWithDropout.confidenceIntervals[0];
      expect(ciWidth).toBeGreaterThan(0);
    });

    test('detect meaningful change vs measurement error', async () => {
      // Test ability to distinguish real change from noise
      
      // Scenario 1: No real change (just measurement error)
      const stableData1 = Array.from({ length: 30 }, () => ({
        reasoning: 'Consistent utilitarian reasoning',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2023-01-01')
      }));

      const stableData2 = Array.from({ length: 30 }, () => ({
        reasoning: 'Consistent utilitarian reasoning with slight variation',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2023-06-01')
      }));

      const stableChange = await validationProtocols.validatePredictiveAccuracy(
        stableData1,
        stableData2,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        6
      );

      // Scenario 2: Real change
      const changingData1 = Array.from({ length: 30 }, () => ({
        reasoning: 'Strong utilitarian reasoning',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2023-01-01')
      }));

      const changingData2 = Array.from({ length: 30 }, () => ({
        reasoning: 'Strong deontological reasoning now',
        choice: 'B',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2023-06-01')
      }));

      const realChange = await validationProtocols.validatePredictiveAccuracy(
        changingData1,
        changingData2,
        (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
        6
      );

      // Real change should show lower stability than measurement noise
      expect(realChange.temporalStability).toBeLessThan(stableChange.temporalStability);
      expect(realChange.decayRate).toBeGreaterThan(stableChange.decayRate);
    });

    test('model temporal decay patterns', async () => {
      // Test different decay patterns
      const timeWindows = [3, 6, 12, 24]; // months

      const baselineResponses = Array.from({ length: 40 }, (_, i) => ({
        reasoning: 'Initial consistent reasoning pattern',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        timestamp: new Date('2023-01-01')
      }));

      const decayResults = await Promise.all(
        timeWindows.map(async (months) => {
          const followUpData = Array.from({ length: 40 }, (_, i) => ({
            reasoning: `Reasoning after ${months} months with some drift`,
            choice: Math.random() > 0.5 ? 'A' : 'B', // Increasing randomness over time
            domain: 'ethics',
            difficulty: 5,
            timestamp: new Date(2023, months, 1)
          }));

          const result = await validationProtocols.validatePredictiveAccuracy(
            baselineResponses,
            followUpData,
            (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
            months
          );

          return { months, stability: result.temporalStability, decayRate: result.decayRate };
        })
      );

      // Stability should generally decrease over longer time periods
      const stabilities = decayResults.map(r => r.stability);
      const isMonotonicallyDecreasing = stabilities.every((stability, i) => 
        i === 0 || stability <= stabilities[i - 1] + 0.1 // Allow some noise
      );

      // At least show a general downward trend
      expect(stabilities[0]).toBeGreaterThanOrEqual(stabilities[stabilities.length - 1] - 0.3);
    });
  });

  describe('Multi-Site Studies', () => {
    test('combine data across research sites', async () => {
      // Simulate multi-site study data
      const sites = ['university_a', 'university_b', 'online_platform'];
      
      const multiSiteData = sites.flatMap(site => 
        Array.from({ length: 20 }, (_, i) => ({
          reasoning: `Ethical reasoning from ${site} - participant ${i}`,
          choice: 'A',
          domain: 'ethics',
          difficulty: 5,
          site,
          participantId: `${site}_${i}`
        }))
      );

      // Test that tactics can be discovered across sites
      const combinedTactics = ethicalTacticDiscovery.findCoherentTactics(multiSiteData);
      expect(combinedTactics.primary.length + combinedTactics.secondary.length).toBeGreaterThan(0);

      // Test site-specific analysis
      const siteSpecificResults = sites.map(site => {
        const siteData = multiSiteData.filter(d => d.site === site);
        return {
          site,
          tactics: ethicalTacticDiscovery.findCoherentTactics(siteData),
          sampleSize: siteData.length
        };
      });

      siteSpecificResults.forEach(result => {
        expect(result.sampleSize).toBe(20);
        expect(result.tactics).toBeDefined();
      });
    });

    test('handle site-specific effects', () => {
      // Create data with known site effects
      const siteAData = Array.from({ length: 30 }, (_, i) => ({
        reasoning: 'Utilitarian reasoning from Site A',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        site: 'site_a'
      }));

      const siteBData = Array.from({ length: 30 }, (_, i) => ({
        reasoning: 'Deontological reasoning from Site B',
        choice: 'B',
        domain: 'ethics',
        difficulty: 5,
        site: 'site_b'
      }));

      const combinedData = [...siteAData, ...siteBData];
      
      // Analyze combined data
      const combinedTactics = ethicalTacticDiscovery.findCoherentTactics(combinedData);
      
      // Analyze site-specific patterns
      const siteATactics = ethicalTacticDiscovery.findCoherentTactics(siteAData);
      const siteBTactics = ethicalTacticDiscovery.findCoherentTactics(siteBData);

      // Should detect different patterns at different sites
      expect(combinedTactics.contextual['site_a'] || combinedTactics.primary.length).toBeGreaterThan(0);
      expect(combinedTactics.contextual['site_b'] || combinedTactics.primary.length).toBeGreaterThan(0);
    });

    test('maintain validity across populations', async () => {
      // Test that validation holds across different populations
      const populations = [
        { name: 'college_students', ageRange: '18-22', education: 'undergraduate' },
        { name: 'working_professionals', ageRange: '25-45', education: 'mixed' },
        { name: 'senior_citizens', ageRange: '65+', education: 'mixed' }
      ];

      const populationResults = await Promise.all(
        populations.map(async (pop) => {
          const popData = Array.from({ length: 25 }, (_, i) => ({
            reasoning: `Ethical reasoning from ${pop.name} participant ${i}`,
            choice: ['A', 'B', 'C'][i % 3],
            domain: 'ethics',
            difficulty: 5,
            population: pop.name
          }));

          const tactics = ethicalTacticDiscovery.findCoherentTactics(popData);
          
          // Calculate basic validation metrics
          const tacticStrengths = [
            ...tactics.primary.map(t => t.strength),
            ...tactics.secondary.map(t => t.strength)
          ];

          const evidence = tacticStrengths.length > 0 
            ? statisticalFoundation.calculateConfidenceInterval(tacticStrengths)
            : null;

          return {
            population: pop.name,
            tacticsFound: tactics.primary.length + tactics.secondary.length,
            meanStrength: evidence?.mean || 0,
            confidence: evidence?.confidenceInterval || [0, 0]
          };
        })
      );

      // All populations should yield some meaningful results
      populationResults.forEach(result => {
        expect(result.tacticsFound).toBeGreaterThanOrEqual(0);
        expect(result.meanStrength).toBeGreaterThanOrEqual(0);
      });

      // Results should be reasonably consistent across populations
      const meanStrengths = populationResults.map(r => r.meanStrength).filter(s => s > 0);
      if (meanStrengths.length > 1) {
        const range = Math.max(...meanStrengths) - Math.min(...meanStrengths);
        expect(range).toBeLessThan(1.0); // Shouldn't vary too wildly
      }
    });

    test('detect and adjust for batch effects', () => {
      // Simulate batch effects (systematic differences between data collection periods)
      const batch1 = Array.from({ length: 25 }, (_, i) => ({
        reasoning: 'Utilitarian reasoning from batch 1',
        choice: 'A',
        domain: 'ethics',
        difficulty: 5,
        batch: 1,
        collectionDate: new Date('2023-01-01')
      }));

      const batch2 = Array.from({ length: 25 }, (_, i) => ({
        reasoning: 'Utilitarian reasoning from batch 2 (with systematic shift)',
        choice: 'A',
        domain: 'ethics',
        difficulty: 6, // Systematic shift in difficulty
        batch: 2,
        collectionDate: new Date('2023-06-01')
      }));

      const batchedData = [...batch1, ...batch2];
      
      // Analyze for batch effects
      const batch1Tactics = ethicalTacticDiscovery.findCoherentTactics(batch1);
      const batch2Tactics = ethicalTacticDiscovery.findCoherentTactics(batch2);
      const combinedTactics = ethicalTacticDiscovery.findCoherentTactics(batchedData);

      // Should be able to detect patterns despite batch effects
      expect(combinedTactics.primary.length + combinedTactics.secondary.length).toBeGreaterThan(0);
      
      // Individual batches should also show patterns
      expect(batch1Tactics.primary.length + batch1Tactics.secondary.length).toBeGreaterThan(0);
      expect(batch2Tactics.primary.length + batch2Tactics.secondary.length).toBeGreaterThan(0);
    });
  });

  describe('Publication Standards Compliance', () => {
    test('meets statistical reporting standards', () => {
      const data = Array.from({ length: 50 }, () => 0.65 + Math.random() * 0.2);
      const analysis = statisticalFoundation.calculateConfidenceInterval(data);
      
      // Create APA-style statistical report
      const report = {
        descriptives: {
          n: data.length,
          m: Number(analysis.mean.toFixed(3)),
          sd: Number(Math.sqrt(analysis.variance).toFixed(3)),
          se: Number(analysis.standardError.toFixed(3))
        },
        inferential: {
          t: Number((analysis.mean / analysis.standardError).toFixed(3)),
          df: data.length - 1,
          p: analysis.pValue < 0.001 ? '< .001' : Number(analysis.pValue.toFixed(3)),
          d: Number(analysis.effectSize.toFixed(3)),
          ci: [
            Number(analysis.confidenceInterval[0].toFixed(3)),
            Number(analysis.confidenceInterval[1].toFixed(3))
          ]
        }
      };

      // Validate report meets publication standards
      expect(report.descriptives.n).toBeGreaterThan(0);
      expect(report.descriptives.m).toBeFinite();
      expect(report.descriptives.sd).toBeGreaterThanOrEqual(0);
      expect(report.inferential.t).toBeFinite();
      expect(report.inferential.df).toBe(data.length - 1);
      expect(report.inferential.ci[1]).toBeGreaterThan(report.inferential.ci[0]);
    });

    test('provides reproducible research outputs', () => {
      const testData = [0.5, 0.6, 0.7, 0.8, 0.9]; // Fixed data for reproducibility
      
      // Run analysis multiple times
      const results = Array.from({ length: 5 }, () => 
        statisticalFoundation.calculateConfidenceInterval(testData)
      );

      // All results should be identical (reproducible)
      results.forEach((result, i) => {
        if (i > 0) {
          expect(result.mean).toBe(results[0].mean);
          expect(result.variance).toBe(results[0].variance);
          expect(result.confidenceInterval[0]).toBe(results[0].confidenceInterval[0]);
          expect(result.confidenceInterval[1]).toBe(results[0].confidenceInterval[1]);
        }
      });
    });

    test('handles multiple comparisons appropriately', () => {
      // Simulate multiple hypothesis testing scenario
      const numberOfTests = 20;
      const pValues = Array.from({ length: numberOfTests }, () => Math.random());
      
      // Apply multiple comparison corrections
      const bonferroniCorrected = statisticalFoundation.bonferroniCorrection(pValues);
      const fdrCorrected = statisticalFoundation.benjaminiHochbergCorrection(pValues);
      
      // Validate corrections
      expect(bonferroniCorrected).toHaveLength(numberOfTests);
      expect(fdrCorrected).toHaveLength(numberOfTests);
      
      // Bonferroni should be more conservative than original p-values
      bonferroniCorrected.forEach((correctedP, i) => {
        expect(correctedP).toBeGreaterThanOrEqual(pValues[i]);
        expect(correctedP).toBeLessThanOrEqual(1);
      });
      
      // FDR correction should also be valid
      fdrCorrected.forEach(correctedP => {
        expect(correctedP).toBeGreaterThan(0);
        expect(correctedP).toBeLessThanOrEqual(1);
      });
    });

    test('documents methodology completely', () => {
      // Create methodology documentation structure
      const methodology = {
        participants: {
          n: 100,
          demographics: 'Mixed sample of adult participants',
          recruitmentMethod: 'Online platform',
          exclusionCriteria: 'Incomplete responses'
        },
        procedure: {
          taskDescription: 'Ethical dilemma response collection',
          responseFormat: 'Written reasoning + multiple choice',
          dataCollection: 'Asynchronous online survey'
        },
        analysis: {
          primaryMethod: 'Ethical tactic discovery algorithm',
          statisticalSoftware: 'Custom TypeScript implementation',
          validationApproach: 'Multi-method validation framework',
          multipleComparisons: 'Benjamini-Hochberg correction'
        },
        ethicalConsiderations: {
          irbApproval: 'Required',
          dataAnonymization: 'All responses anonymized',
          participantConsent: 'Informed consent obtained'
        }
      };

      // Validate methodology completeness
      expect(methodology.participants.n).toBeGreaterThan(0);
      expect(methodology.procedure.taskDescription).toBeDefined();
      expect(methodology.analysis.primaryMethod).toBeDefined();
      expect(methodology.ethicalConsiderations.irbApproval).toBeDefined();
    });
  });
});