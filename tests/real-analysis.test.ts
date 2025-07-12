/**
 * Real Analysis Tests
 * 
 * These tests demonstrate the difference between fake analysis
 * and real analysis, and validate the real analysis system.
 */

import { describe, it, expect } from 'vitest'
import { RealEthicalAnalyzer } from '@/lib/real-ethical-analysis'
import { AnalysisValidator } from '@/lib/analysis-validation'
import { combinatorialGenerator } from '@/lib/combinatorial-values-generator'

describe('🔬 Real vs Fake Analysis Comparison', () => {
  
  const realAnalyzer = new RealEthicalAnalyzer()
  const validator = new AnalysisValidator()
  
  const testResponses = [
    {
      motif: 'NUMBERS_FIRST',
      reasoning: 'I think we should look at the data and statistics to make the best decision. The numbers show that 85% of people benefit from this approach, which seems like good evidence to me.',
      responseTime: 35000,
      difficulty: 6,
      domain: 'medical'
    },
    {
      motif: 'NUMBERS_FIRST',
      reasoning: 'While the cost-benefit analysis favors this option, I worry about the individual people who might be harmed. Each person matters, not just the statistics.',
      responseTime: 48000,
      difficulty: 8,
      domain: 'healthcare'
    },
    {
      motif: 'RULES_FIRST',
      reasoning: 'This violates the principle of informed consent. Even if the outcomes are better statistically, we have a duty to respect individual autonomy.',
      responseTime: 52000,
      difficulty: 9,
      domain: 'medical'
    },
    {
      motif: 'PERSON_FIRST',
      reasoning: 'I keep thinking about the relationships and trust between people. Each individual deserves consideration, not just aggregate outcomes.',
      responseTime: 44000,
      difficulty: 7,
      domain: 'healthcare'
    }
  ]
  
  describe('📊 Analysis Quality Comparison', () => {
    it('should reveal motif inconsistencies that fake analysis misses', () => {
      // Current fake analysis
      const fakeProfile = combinatorialGenerator.analyzeResponses(testResponses)
      
      // Real analysis  
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      // Fake analysis shows consistency
      expect(fakeProfile.primaryMotifs.length + fakeProfile.secondaryMotifs.length).toBeGreaterThan(0)
      
      // Real analysis reveals inconsistency
      expect(realProfile.motifConsistency.claimed).toBe('NUMBERS_FIRST')
      expect(realProfile.motifConsistency.inferred).not.toBe('NUMBERS_FIRST')
      expect(realProfile.motifConsistency.alignment).toBeLessThan(0.5)
      expect(realProfile.motifConsistency.contradictions.length).toBeGreaterThan(0)
    })
    
    it('should provide evidence-based framework alignment', () => {
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      // Each framework should have actual evidence
      Object.values(realProfile.frameworkAlignment).forEach(framework => {
        if (framework.score > 0) {
          expect(framework.evidence.length).toBeGreaterThan(0)
        }
      })
      
      // Should detect mixed reasoning patterns
      expect(realProfile.frameworkAlignment.consequentialist.score).toBeGreaterThan(0)
      expect(realProfile.frameworkAlignment.deontological.score).toBeGreaterThan(0)
      expect(realProfile.frameworkAlignment.careEthics.score).toBeGreaterThan(0)
    })
    
    it('should calculate real decision patterns', () => {
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      // Real consistency calculation
      expect(realProfile.decisionPatterns.consistencyScore).toBe(0.25) // Only 1/4 responses consistent
      
      // Real temporal consistency
      expect(realProfile.decisionPatterns.temporalConsistency).toBeLessThan(1.0)
      
      // Real reasoning style detection
      expect(realProfile.decisionPatterns.reasoningStyle).toBe('mixed')
    })
    
    it('should assess reasoning depth accurately', () => {
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      expect(realProfile.reasoningDepth.score).toBeGreaterThan(0)
      expect(realProfile.reasoningDepth.sophistication).toBe('intermediate')
      expect(realProfile.reasoningDepth.indicators.length).toBeGreaterThan(0)
      
      // Should identify sophisticated reasoning markers
      expect(realProfile.reasoningDepth.indicators).toContain('Multi-stakeholder consideration')
      expect(realProfile.reasoningDepth.indicators).toContain('Recognition of value conflicts')
    })
    
    it('should provide calibrated confidence estimates', () => {
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      // Confidence should be between 0 and 1
      expect(realProfile.confidence.overall).toBeGreaterThan(0)
      expect(realProfile.confidence.overall).toBeLessThan(1)
      
      // Should have per-domain confidence
      expect(Object.keys(realProfile.confidence.perDomain).length).toBeGreaterThan(0)
      
      // Should detect potential overconfidence
      expect(realProfile.confidence.calibration).toBeDefined()
    })
    
    it('should infer cultural context from evidence', () => {
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      // Should have evidence for cultural inferences
      expect(realProfile.culturalContext.evidenceBasis.length).toBeGreaterThan(0)
      
      // Should detect individualistic vs collectivistic patterns
      expect(realProfile.culturalContext.individualistic).toBeGreaterThan(0)
      expect(realProfile.culturalContext.collectivistic).toBeGreaterThan(0)
    })
  })
  
  describe('🎯 Validation Framework', () => {
    it('should validate phenomenological accuracy', async () => {
      const userFeedback = {
        recognizesSelf: false, // User doesn't recognize themselves as "numbers first"
        accurateDescription: true,
        helpfulInsights: true,
        specificComments: ['I do care about data but I also really care about individual people']
      }
      
      const validation = await validator.validateAnalysis(testResponses, { userFeedback })
      
      expect(validation.phenomenologicalAccuracy.selfRecognition).toBeLessThan(0.8)
      expect(validation.phenomenologicalAccuracy.discrepancies.length).toBeGreaterThan(0)
    })
    
    it('should validate predictive accuracy', async () => {
      const trainingResponses = testResponses.slice(0, 3)
      const testResponse = testResponses[3]
      
      const validation = await validator.validateAnalysis(trainingResponses, { testResponse })
      
      expect(validation.predictiveAccuracy.nextChoicePrediction).toBeDefined()
      expect(validation.predictiveAccuracy.frameworkStability).toBeDefined()
      expect(validation.predictiveAccuracy.crossDomainConsistency).toBeDefined()
    })
    
    it('should validate cultural sensitivity', async () => {
      const culturalContext = {
        region: 'Western',
        framework: 'western' as const,
        expectedPatterns: ['individualistic', 'consequentialist']
      }
      
      const validation = await validator.validateAnalysis(testResponses, { culturalContext })
      
      expect(validation.culturalSensitivity.culturalAdaptation).toBeDefined()
      expect(validation.culturalSensitivity.biasDetection).toBeDefined()
      expect(validation.culturalSensitivity.inclusivity).toBeDefined()
    })
  })
  
  describe('⚖️ Real vs Fake Analysis Outcomes', () => {
    it('should generate more accurate VALUES.md recommendations', () => {
      const fakeProfile = combinatorialGenerator.analyzeResponses(testResponses)
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      // Fake analysis would recommend purely numbers-based approach
      const fakeRecommendation = fakeProfile.primaryMotifs[0]?.name || 'Quantitative Analysis'
      
      // Real analysis would recommend balanced approach
      const realRecommendation = realProfile.motifConsistency.inferred
      
      expect(fakeRecommendation).toBe('Quantitative Analysis')
      expect(realRecommendation).not.toBe('NUMBERS_FIRST')
      expect(realProfile.motifConsistency.contradictions.length).toBeGreaterThan(0)
    })
    
    it('should provide actionable AI interaction guidelines', () => {
      const realProfile = realAnalyzer.analyzeEthicalProfile(testResponses)
      
      // Should provide specific, evidence-based recommendations
      expect(realProfile.frameworkAlignment.consequentialist.evidence.length).toBeGreaterThan(0)
      expect(realProfile.frameworkAlignment.deontological.evidence.length).toBeGreaterThan(0)
      expect(realProfile.frameworkAlignment.careEthics.evidence.length).toBeGreaterThan(0)
      
      // Should acknowledge complexity
      expect(realProfile.reasoningDepth.sophistication).toBe('intermediate')
      expect(realProfile.decisionPatterns.reasoningStyle).toBe('mixed')
    })
  })
  
  describe('🧪 Edge Cases and Robustness', () => {
    it('should handle minimal reasoning text', () => {
      const minimalResponses = [
        {
          motif: 'NUMBERS_FIRST',
          reasoning: 'Data.',
          responseTime: 5000,
          difficulty: 5,
          domain: 'general'
        }
      ]
      
      const realProfile = realAnalyzer.analyzeEthicalProfile(minimalResponses)
      
      expect(realProfile.reasoningDepth.score).toBeLessThan(0.3)
      expect(realProfile.reasoningDepth.sophistication).toBe('surface')
      expect(realProfile.confidence.overall).toBeLessThan(0.5)
    })
    
    it('should handle contradictory reasoning', () => {
      const contradictoryResponses = [
        {
          motif: 'NUMBERS_FIRST',
          reasoning: 'I hate numbers and data. I always go with my gut feeling and emotions.',
          responseTime: 30000,
          difficulty: 5,
          domain: 'general'
        }
      ]
      
      const realProfile = realAnalyzer.analyzeEthicalProfile(contradictoryResponses)
      
      expect(realProfile.motifConsistency.alignment).toBeLessThan(0.3)
      expect(realProfile.motifConsistency.contradictions.length).toBeGreaterThan(0)
    })
    
    it('should detect sophisticated ethical reasoning', () => {
      const sophisticatedResponses = [
        {
          motif: 'NUMBERS_FIRST',
          reasoning: 'While the utilitarian calculus suggests maximizing overall welfare, I must consider the deontological principle of treating each person as an end in themselves. The virtue ethics tradition would emphasize the character of the decision-maker, while care ethics reminds us of the importance of relationships and context. This creates a complex ethical landscape where multiple stakeholders - patients, families, healthcare providers, and society - have competing but valid claims.',
          responseTime: 120000,
          difficulty: 9,
          domain: 'medical'
        }
      ]
      
      const realProfile = realAnalyzer.analyzeEthicalProfile(sophisticatedResponses)
      
      expect(realProfile.reasoningDepth.score).toBeGreaterThan(0.7)
      expect(realProfile.reasoningDepth.sophistication).toBe('deep')
      expect(realProfile.reasoningDepth.indicators).toContain('Rich ethical vocabulary')
      expect(realProfile.reasoningDepth.indicators).toContain('Multi-stakeholder consideration')
      expect(realProfile.reasoningDepth.indicators).toContain('Recognition of value conflicts')
    })
  })
})

describe('📈 Performance and Scalability', () => {
  const realAnalyzer = new RealEthicalAnalyzer()
  
  it('should handle large response sets efficiently', () => {
    const largeResponseSet = Array.from({ length: 50 }, (_, i) => ({
      motif: ['NUMBERS_FIRST', 'RULES_FIRST', 'PERSON_FIRST', 'SAFETY_FIRST'][i % 4],
      reasoning: `Response ${i} with detailed reasoning about ethical considerations and stakeholder impacts.`,
      responseTime: 30000 + (i * 1000),
      difficulty: (i % 10) + 1,
      domain: ['medical', 'legal', 'social', 'technical'][i % 4]
    }))
    
    const startTime = Date.now()
    const realProfile = realAnalyzer.analyzeEthicalProfile(largeResponseSet)
    const endTime = Date.now()
    
    expect(realProfile).toBeDefined()
    expect(endTime - startTime).toBeLessThan(10000) // Should complete in under 10 seconds
    expect(realProfile.confidence.overall).toBeGreaterThan(0)
    expect(realProfile.decisionPatterns.consistencyScore).toBeGreaterThan(0)
  })
  
  it('should provide consistent results across runs', () => {
    const testResponses = [
      {
        motif: 'NUMBERS_FIRST',
        reasoning: 'Data-driven approach with stakeholder consideration.',
        responseTime: 35000,
        difficulty: 6,
        domain: 'medical'
      }
    ]
    
    const profile1 = realAnalyzer.analyzeEthicalProfile(testResponses)
    const profile2 = realAnalyzer.analyzeEthicalProfile(testResponses)
    
    expect(profile1.motifConsistency.alignment).toBe(profile2.motifConsistency.alignment)
    expect(profile1.reasoningDepth.score).toBe(profile2.reasoningDepth.score)
    expect(profile1.confidence.overall).toBe(profile2.confidence.overall)
  })
})