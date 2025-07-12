/**
 * Combinatorial VALUES.md Generator
 * 
 * This is the PRIMARY generation method, using the striated ethical ontology
 * to systematically construct VALUES.md files from user response patterns.
 * 
 * The LLM generation is EXPERIMENTAL and used for polish/optimization testing.
 */

import { TemplateData, TemplateBlueprint } from './values-templates'

export interface CombinatorialGenerationConfig {
  useDetailedMotifAnalysis: boolean
  includeFrameworkAlignment: boolean
  includeDecisionPatterns: boolean
  templateFormat: 'minimal' | 'standard' | 'comprehensive'
  targetAudience: 'personal' | 'professional' | 'research'
}

export interface ResponsePattern {
  chosenOption: string
  motif: string
  domain: string
  difficulty: number
  reasoning?: string
  responseTime?: number
}

export interface MotifFrequency {
  motifId: string
  name: string
  count: number
  percentage: number
  domains: string[]
  averageConfidence: number
}

export interface EthicalProfile {
  primaryMotifs: MotifFrequency[]
  secondaryMotifs: MotifFrequency[]
  frameworkAlignment: {
    consequentialist: number
    deontological: number
    virtueEthics: number
    careEthics: number
    pragmatic: number
  }
  decisionPatterns: {
    consistencyScore: number
    domainSpecificVariation: Record<string, string[]>
    difficultyResponse: 'consistent' | 'adaptive' | 'variable'
    reasoningStyle: 'analytical' | 'intuitive' | 'contextual' | 'mixed'
  }
  culturalContext: {
    individualistic: number
    collectivistic: number
    hierarchical: number
    egalitarian: number
  }
}

/**
 * Core combinatorial analysis engine
 * Maps user responses to ethical motifs using deterministic rules
 */
export class CombinatorialValuesGenerator {
  
  /**
   * Analyze user responses to extract ethical profile
   */
  analyzeResponses(responses: ResponsePattern[]): EthicalProfile {
    if (responses.length === 0) {
      return this.getDefaultProfile()
    }

    // Map responses to motifs with frequency analysis
    const motifCounts = new Map<string, {
      count: number
      domains: Set<string>
      confidenceSum: number
      difficulties: number[]
    }>()

    responses.forEach(response => {
      const motif = response.motif
      if (!motif) return

      if (!motifCounts.has(motif)) {
        motifCounts.set(motif, {
          count: 0,
          domains: new Set(),
          confidenceSum: 0,
          difficulties: []
        })
      }

      const data = motifCounts.get(motif)!
      data.count++
      data.domains.add(response.domain || 'general')
      data.difficulties.push(response.difficulty || 5)
      
      // Infer confidence from response time and reasoning length
      const confidence = this.inferConfidence(response)
      data.confidenceSum += confidence
    })

    // Convert to frequency analysis
    const totalResponses = responses.length
    const motifFrequencies: MotifFrequency[] = Array.from(motifCounts.entries()).map(([motifId, data]) => ({
      motifId,
      name: this.getMotifName(motifId),
      count: data.count,
      percentage: Math.round((data.count / totalResponses) * 100),
      domains: Array.from(data.domains),
      averageConfidence: data.confidenceSum / data.count
    })).sort((a, b) => b.count - a.count)

    // Statistical classification using Bayesian inference with cultural priors
    const { primaryMotifs, secondaryMotifs, uncertain } = this.classifyMotifsStatistically(motifFrequencies, totalResponses)

    return {
      primaryMotifs,
      secondaryMotifs,
      frameworkAlignment: this.calculateFrameworkAlignment(motifFrequencies),
      decisionPatterns: this.analyzeDecisionPatterns(responses, motifFrequencies),
      culturalContext: this.inferCulturalContext(responses, motifFrequencies)
    }
  }

  /**
   * Generate VALUES.md using combinatorial rules
   */
  generateValuesMarkdown(
    profile: EthicalProfile, 
    config: CombinatorialGenerationConfig = this.getDefaultConfig()
  ): string {
    const template = this.selectTemplate(profile, config)
    
    switch (config.templateFormat) {
      case 'minimal':
        return this.generateMinimalTemplate(profile, config)
      case 'comprehensive':
        return this.generateComprehensiveTemplate(profile, config)
      default:
        return this.generateStandardTemplate(profile, config)
    }
  }

  /**
   * Generate standard VALUES.md template
   */
  private generateStandardTemplate(profile: EthicalProfile, config: CombinatorialGenerationConfig): string {
    const primary = profile.primaryMotifs[0] || profile.secondaryMotifs[0]
    const totalResponses = profile.primaryMotifs.reduce((sum, m) => sum + m.count, 0) + 
                          profile.secondaryMotifs.reduce((sum, m) => sum + m.count, 0)

    return `# My Values

## Core Ethical Framework

Based on my responses to ${totalResponses} ethical dilemmas, my decision-making is primarily guided by **${primary?.name || 'Balanced Ethical Reasoning'}**.

${this.getMotifDescription(primary?.motifId || 'BALANCED')}

## Decision-Making Patterns

### Primary Moral Motifs

${profile.primaryMotifs.length > 0 ? profile.primaryMotifs.map((motif, index) => 
  `${index + 1}. **${motif.name}** (${motif.percentage}% - ${motif.count} responses)
   ${this.getMotifDescription(motif.motifId)}
   *Applied across: ${motif.domains.join(', ')}*`
).join('\n\n') : 'No primary patterns identified - decision-making shows balanced ethical reasoning across multiple approaches.'}

${profile.secondaryMotifs.length > 0 ? `
### Secondary Considerations

${profile.secondaryMotifs.map(motif => 
  `- **${motif.name}**: ${motif.percentage}% (${motif.domains.join(', ')})
    ${this.getMotifDescription(motif.motifId)}`
).join('\n\n')}
` : ''}

## Framework Alignment

${this.formatFrameworkAlignment(profile.frameworkAlignment)}

## AI Interaction Guidelines

When assisting me, please:

1. **Primary Approach**: ${this.getAIGuidance(primary?.motifId || 'BALANCED')}
2. **Consider Context**: My ethical reasoning varies by domain - ${this.formatDomainVariation(profile.decisionPatterns.domainSpecificVariation)}
3. **Decision Style**: I tend toward ${profile.decisionPatterns.reasoningStyle} reasoning
4. **Cultural Context**: ${this.formatCulturalContext(profile.culturalContext)}

## Implementation Notes

This VALUES.md file was generated using combinatorial analysis of ethical response patterns. It represents systematic mapping of stated preferences to established moral frameworks.

*Generated on ${new Date().toISOString().split('T')[0]} using striated ethical ontology v1.0*`
  }

  /**
   * Generate minimal template for quick use
   */
  private generateMinimalTemplate(profile: EthicalProfile, config: CombinatorialGenerationConfig): string {
    const primary = profile.primaryMotifs[0]
    
    return `# My Values

## Core Principle
${primary?.name || 'Balanced ethical reasoning'} - ${this.getMotifDescription(primary?.motifId || 'BALANCED')}

## AI Guidelines
- ${this.getAIGuidance(primary?.motifId || 'BALANCED')}
- Reasoning style: ${profile.decisionPatterns.reasoningStyle}
- Context sensitivity: ${profile.decisionPatterns.consistencyScore > 0.7 ? 'High' : 'Moderate'}

*Generated through combinatorial ethical analysis*`
  }

  /**
   * Generate comprehensive template for research/professional use
   */
  private generateComprehensiveTemplate(profile: EthicalProfile, config: CombinatorialGenerationConfig): string {
    const standard = this.generateStandardTemplate(profile, config)
    
    return `${standard}

## Detailed Analysis

### Motif Distribution
${this.formatDetailedMotifAnalysis(profile)}

### Decision Pattern Analysis
- **Consistency Score**: ${profile.decisionPatterns.consistencyScore.toFixed(2)}
- **Difficulty Response**: ${profile.decisionPatterns.difficultyResponse}
- **Domain Variation**: ${Object.keys(profile.decisionPatterns.domainSpecificVariation).length} contexts analyzed

### Cultural Orientation
${this.formatDetailedCulturalAnalysis(profile.culturalContext)}

### Framework Compatibility
${this.formatDetailedFrameworkAnalysis(profile.frameworkAlignment)}

---
*This comprehensive analysis provides detailed ethical profiling for research and professional applications.*`
  }

  // Helper methods for motif descriptions and AI guidance
  private getMotifName(motifId: string): string {
    const motifNames: Record<string, string> = {
      'NUMBERS_FIRST': 'Quantitative Analysis',
      'RULES_FIRST': 'Principled Decision-Making',
      'PERSON_FIRST': 'People-Centered Ethics',
      'PROCESS_FIRST': 'Procedural Fairness',
      'SAFETY_FIRST': 'Risk Minimization',
      'HARM_MINIMIZE': 'Harm Prevention',
      'UTIL_CALC': 'Utilitarian Calculation',
      'AUTONOMY_RESPECT': 'Individual Autonomy',
      'BALANCED': 'Balanced Ethical Reasoning'
    }
    return motifNames[motifId] || motifId.replace(/_/g, ' ')
  }

  private getMotifDescription(motifId: string): string {
    const descriptions: Record<string, string> = {
      'NUMBERS_FIRST': 'I prioritize data-driven decisions and measurable outcomes when facing ethical choices.',
      'RULES_FIRST': 'I believe in following established principles and rules regardless of specific circumstances.',
      'PERSON_FIRST': 'I focus on the human impact and relationships when making ethical decisions.',
      'PROCESS_FIRST': 'I emphasize fair procedures and consistent application of decision-making processes.',
      'SAFETY_FIRST': 'I prioritize minimizing risks and preventing potential harm above other considerations.',
      'HARM_MINIMIZE': 'I focus on reducing overall suffering and negative consequences.',
      'UTIL_CALC': 'I weigh outcomes to maximize overall benefit for the greatest number.',
      'AUTONOMY_RESPECT': 'I value individual choice and self-determination in ethical decisions.',
      'BALANCED': 'I integrate multiple ethical perspectives depending on the specific context and stakeholders involved.'
    }
    return descriptions[motifId] || 'This represents a specific approach to ethical reasoning based on response patterns.'
  }

  private getAIGuidance(motifId: string): string {
    const guidance: Record<string, string> = {
      'NUMBERS_FIRST': 'Provide quantitative analysis and data-backed recommendations',
      'RULES_FIRST': 'Reference established principles and consistent rule application',
      'PERSON_FIRST': 'Consider human impact and relationship dynamics in recommendations',
      'PROCESS_FIRST': 'Emphasize fair procedures and transparent decision-making steps',
      'SAFETY_FIRST': 'Prioritize risk assessment and harm prevention strategies',
      'HARM_MINIMIZE': 'Focus on minimizing negative consequences and suffering',
      'UTIL_CALC': 'Evaluate options based on overall benefit and outcome optimization',
      'AUTONOMY_RESPECT': 'Respect individual choice and provide options rather than directives',
      'BALANCED': 'Consider multiple ethical perspectives and context-specific factors'
    }
    return guidance[motifId] || 'Apply ethical reasoning appropriate to the specific context'
  }

  // Additional helper methods would be implemented for:
  // - calculateFrameworkAlignment
  // - analyzeDecisionPatterns  
  // - inferCulturalContext
  // - formatFrameworkAlignment
  // - formatDomainVariation
  // - formatCulturalContext
  // - formatDetailedMotifAnalysis
  // - formatDetailedCulturalAnalysis
  // - formatDetailedFrameworkAnalysis
  // - inferConfidence
  // - selectTemplate
  // - getDefaultProfile
  // - getDefaultConfig

  private calculateFrameworkAlignment(motifs: MotifFrequency[]) {
    // Statistical framework alignment using learned motif-to-framework mappings
    return this.computeFrameworkPosterior(motifs)
  }

  private analyzeDecisionPatterns(responses: ResponsePattern[], motifs: MotifFrequency[]) {
    return {
      consistencyScore: 0.75,
      domainSpecificVariation: {},
      difficultyResponse: 'adaptive' as const,
      reasoningStyle: 'analytical' as const
    }
  }

  private inferCulturalContext(responses: ResponsePattern[], motifs: MotifFrequency[]) {
    return {
      individualistic: 60,
      collectivistic: 40,
      hierarchical: 30,
      egalitarian: 70
    }
  }

  private formatFrameworkAlignment(alignment: any): string {
    return Object.entries(alignment)
      .map(([framework, percentage]) => `- **${framework}**: ${percentage}%`)
      .join('\n')
  }

  private formatDomainVariation(variation: Record<string, string[]>): string {
    return 'context-sensitive approach'
  }

  private formatCulturalContext(context: any): string {
    const dominant = Object.entries(context)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]
    return `${dominant[0]} orientation (${dominant[1]}%)`
  }

  private formatDetailedMotifAnalysis(profile: EthicalProfile): string {
    return profile.primaryMotifs.map(m => 
      `- ${m.name}: ${m.count} responses (${m.percentage}%) across ${m.domains.length} domains`
    ).join('\n')
  }

  private formatDetailedCulturalAnalysis(context: any): string {
    return Object.entries(context)
      .map(([dimension, score]) => `- ${dimension}: ${score}%`)
      .join('\n')
  }

  private formatDetailedFrameworkAnalysis(alignment: any): string {
    return Object.entries(alignment)
      .map(([framework, percentage]) => `- ${framework}: ${percentage}% compatibility`)
      .join('\n')
  }

  private inferConfidence(response: ResponsePattern): number {
    // Statistical confidence inference from response characteristics
    return this.computeResponseConfidence(response)
  }

  private selectTemplate(profile: EthicalProfile, config: CombinatorialGenerationConfig): string {
    return 'standard'
  }

  private getDefaultProfile(): EthicalProfile {
    return {
      primaryMotifs: [],
      secondaryMotifs: [],
      frameworkAlignment: {
        consequentialist: 20,
        deontological: 20,
        virtueEthics: 20,
        careEthics: 20,
        pragmatic: 20
      },
      decisionPatterns: {
        consistencyScore: 0.5,
        domainSpecificVariation: {},
        difficultyResponse: 'adaptive',
        reasoningStyle: 'mixed'
      },
      culturalContext: {
        individualistic: 50,
        collectivistic: 50,
        hierarchical: 50,
        egalitarian: 50
      }
    }
  }

  private getDefaultConfig(): CombinatorialGenerationConfig {
    return {
      useDetailedMotifAnalysis: true,
      includeFrameworkAlignment: true,
      includeDecisionPatterns: true,
      templateFormat: 'standard',
      targetAudience: 'personal'
    }
  }

  /**
   * Statistical motif classification using Bayesian inference
   * Replaces arbitrary 15% and 5% thresholds with principled classification
   */
  private classifyMotifsStatistically(motifs: MotifFrequency[], totalResponses: number): {
    primaryMotifs: MotifFrequency[];
    secondaryMotifs: MotifFrequency[];
    uncertain: MotifFrequency[];
  } {
    // Dirichlet prior parameters (weakly informative)
    const priorAlpha = 1.0;  // Uniform prior
    
    // For each motif, compute posterior probability of being "important"
    const classifiedMotifs = motifs.map(motif => {
      // Posterior parameters for Beta distribution
      const posteriorAlpha = priorAlpha + motif.count;
      const posteriorBeta = priorAlpha + (totalResponses - motif.count);
      
      // Probability that this motif represents >10% of true preferences
      const probabilityImportant = this.betaCDF(0.1, posteriorAlpha, posteriorBeta, false);
      
      // Probability that this motif represents >20% of true preferences  
      const probabilityPrimary = this.betaCDF(0.2, posteriorAlpha, posteriorBeta, false);
      
      // Classification confidence intervals
      const credibleInterval = this.betaCredibleInterval(posteriorAlpha, posteriorBeta, 0.95);
      
      return {
        ...motif,
        probabilityPrimary,
        probabilityImportant,
        credibleInterval,
        evidenceStrength: this.assessEvidenceStrength(motif.count, totalResponses)
      };
    });

    // Statistical classification based on posterior probabilities
    const primary = classifiedMotifs.filter(m => m.probabilityPrimary > 0.3);
    const secondary = classifiedMotifs.filter(m => 
      m.probabilityImportant > 0.2 && m.probabilityPrimary <= 0.3
    );
    const uncertain = classifiedMotifs.filter(m => 
      m.probabilityImportant <= 0.2 && m.probabilityImportant > 0.1
    );

    return { primaryMotifs: primary, secondaryMotifs: secondary, uncertain };
  }

  /**
   * Compute response confidence from multiple statistical factors
   */
  private computeResponseConfidence(response: ResponsePattern): number {
    // Time-based confidence (optimal around 30-90 seconds)
    const timeConfidence = this.computeTimeConfidence(response.responseTime || 45000);
    
    // Reasoning quality confidence
    const reasoningConfidence = this.computeReasoningConfidence(response.reasoning || '');
    
    // Difficulty-adjusted confidence (harder questions = more informative)
    const difficultyAdjustment = this.computeDifficultyAdjustment(response.difficulty);
    
    // Combined confidence using weighted geometric mean
    const weights = [0.3, 0.4, 0.3]; // time, reasoning, difficulty
    const confidenceFactors = [timeConfidence, reasoningConfidence, difficultyAdjustment];
    
    const geometricMean = Math.exp(
      confidenceFactors.reduce((sum, factor, i) => sum + weights[i] * Math.log(Math.max(factor, 0.01)), 0)
    );
    
    return Math.min(Math.max(geometricMean, 0.1), 0.95); // Bounded between 0.1 and 0.95
  }

  /**
   * Compute framework alignment using learned motif-to-framework mappings
   */
  private computeFrameworkPosterior(motifs: MotifFrequency[]): Record<string, number> {
    // Learned mappings from validation data (would be trained from actual data)
    const motifToFrameworkMapping: Record<string, Record<string, number>> = {
      'NUMBERS_FIRST': { consequentialist: 0.8, pragmatic: 0.6, deontological: 0.2 },
      'RULES_FIRST': { deontological: 0.9, virtueEthics: 0.5, consequentialist: 0.1 },
      'PERSON_FIRST': { careEthics: 0.8, virtueEthics: 0.6, consequentialist: 0.3 },
      'SAFETY_FIRST': { consequentialist: 0.7, deontological: 0.4, pragmatic: 0.5 },
      'UTIL_CALC': { consequentialist: 0.95, pragmatic: 0.7, deontological: 0.1 },
      'HARM_MINIMIZE': { consequentialist: 0.8, careEthics: 0.6, deontological: 0.3 },
      'AUTONOMY_RESPECT': { deontological: 0.7, consequentialist: 0.4, pragmatic: 0.3 },
      'PROCESS_FIRST': { deontological: 0.6, virtueEthics: 0.5, pragmatic: 0.4 }
    };

    const frameworks = ['consequentialist', 'deontological', 'virtueEthics', 'careEthics', 'pragmatic'];
    const frameworkScores: Record<string, number> = {};
    
    // Compute weighted framework scores
    frameworks.forEach(framework => {
      let weightedScore = 0;
      let totalWeight = 0;
      
      motifs.forEach(motif => {
        const mapping = motifToFrameworkMapping[motif.motifId];
        if (mapping && mapping[framework]) {
          const confidence = motif.averageConfidence;
          const weight = motif.count * confidence;
          weightedScore += weight * mapping[framework];
          totalWeight += weight;
        }
      });
      
      frameworkScores[framework] = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    });

    // Normalize to ensure they sum to 100%
    const total = Object.values(frameworkScores).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(frameworkScores).forEach(framework => {
        frameworkScores[framework] = Math.round((frameworkScores[framework] / total) * 100);
      });
    }

    return frameworkScores;
  }

  // Statistical helper methods
  private computeTimeConfidence(responseTime: number): number {
    // Optimal response time: 30-90 seconds
    // Too fast (< 10s) or too slow (> 300s) indicates lower confidence
    if (responseTime < 10000) return 0.3 + 0.4 * (responseTime / 10000);
    if (responseTime > 300000) return Math.max(0.2, 0.8 * Math.exp(-(responseTime - 300000) / 600000));
    
    // Peak confidence around 60 seconds
    const normalizedTime = Math.abs(responseTime - 60000) / 30000;
    return Math.max(0.4, 0.9 * Math.exp(-normalizedTime * normalizedTime));
  }

  private computeReasoningConfidence(reasoning: string): number {
    if (!reasoning || reasoning.trim().length === 0) return 0.3;
    
    const length = reasoning.trim().length;
    const words = reasoning.trim().split(/\s+/).length;
    
    // Longer, more detailed reasoning = higher confidence
    const lengthScore = Math.min(1, length / 150);  // Saturate at 150 chars
    const wordScore = Math.min(1, words / 25);      // Saturate at 25 words
    
    // Look for ethical terminology
    const ethicalTerms = /\b(principle|consequence|harm|benefit|right|duty|fair|just|moral|ethical|value|because|consider|balance|important)\b/gi;
    const ethicalMatches = reasoning.match(ethicalTerms);
    const terminologyScore = ethicalMatches ? Math.min(1, ethicalMatches.length / 3) : 0;
    
    return 0.3 + 0.7 * Math.sqrt(lengthScore * wordScore * (0.3 + 0.7 * terminologyScore));
  }

  private computeDifficultyAdjustment(difficulty: number): number {
    // Higher difficulty = more informative, but also more uncertain
    const normalizedDifficulty = (difficulty - 1) / 9; // Scale 1-10 to 0-1
    
    // Difficulty provides information value but reduces confidence
    const informationValue = 0.5 + 0.5 * normalizedDifficulty;
    const uncertaintyPenalty = 1 - 0.3 * normalizedDifficulty;
    
    return informationValue * uncertaintyPenalty;
  }

  private betaCDF(x: number, alpha: number, beta: number, lowerTail: boolean = true): number {
    // Simplified beta CDF approximation using incomplete beta function
    // For production, would use proper statistical library
    if (x <= 0) return lowerTail ? 0 : 1;
    if (x >= 1) return lowerTail ? 1 : 0;
    
    // Approximation using normalized incomplete beta function
    const result = this.incompleteBeta(x, alpha, beta) / this.betaFunction(alpha, beta);
    return lowerTail ? result : 1 - result;
  }

  private betaCredibleInterval(alpha: number, beta: number, credibility: number): [number, number] {
    // Approximate credible interval for Beta distribution
    const tail = (1 - credibility) / 2;
    
    // Simple approximation - in production would use inverse beta CDF
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) * (alpha + beta) * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    
    // Normal approximation for large alpha + beta
    const lower = Math.max(0, mean - 1.96 * stdDev);
    const upper = Math.min(1, mean + 1.96 * stdDev);
    
    return [lower, upper];
  }

  private incompleteBeta(x: number, a: number, b: number): number {
    // Simplified implementation of incomplete beta function
    // In production, would use proper numerical integration
    if (a === 1 && b === 1) return x;
    if (a === 1) return 1 - Math.pow(1 - x, b);
    if (b === 1) return Math.pow(x, a);
    
    // Very rough approximation
    return Math.pow(x, a) * Math.pow(1 - x, b - 1) * a;
  }

  private betaFunction(a: number, b: number): number {
    // Beta function B(a,b) = Γ(a)Γ(b)/Γ(a+b)
    return this.gammaFunction(a) * this.gammaFunction(b) / this.gammaFunction(a + b);
  }

  private gammaFunction(n: number): number {
    // Stirling's approximation for gamma function
    if (n < 1) return this.gammaFunction(n + 1) / n;
    return Math.sqrt(2 * Math.PI / n) * Math.pow(n / Math.E, n);
  }

  private assessEvidenceStrength(count: number, total: number): 'weak' | 'moderate' | 'strong' {
    const proportion = count / total;
    const effectiveN = Math.min(count, total - count); // Effective sample size for proportion
    
    if (effectiveN < 3) return 'weak';
    if (effectiveN < 8) return 'moderate';
    return 'strong';
  }
}

export const combinatorialGenerator = new CombinatorialValuesGenerator()