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

    // Classify into primary (>15%) and secondary (5-15%) motifs
    const primaryMotifs = motifFrequencies.filter(m => m.percentage >= 15)
    const secondaryMotifs = motifFrequencies.filter(m => m.percentage >= 5 && m.percentage < 15)

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
    const primary = profile.primaryMotifs[0]
    const totalResponses = profile.primaryMotifs.reduce((sum, m) => sum + m.count, 0) + 
                          profile.secondaryMotifs.reduce((sum, m) => sum + m.count, 0)

    return `# My Values

## Core Ethical Framework

Based on my responses to ${totalResponses} ethical dilemmas, my decision-making is primarily guided by **${primary?.name || 'Balanced Ethical Reasoning'}**.

${this.getMotifDescription(primary?.motifId || 'BALANCED')}

## Decision-Making Patterns

### Primary Moral Motifs

${profile.primaryMotifs.map((motif, index) => 
  `${index + 1}. **${motif.name}** (${motif.percentage}% - ${motif.count} responses)
   ${this.getMotifDescription(motif.motifId)}
   *Applied across: ${motif.domains.join(', ')}*`
).join('\n\n')}

${profile.secondaryMotifs.length > 0 ? `
### Secondary Considerations

${profile.secondaryMotifs.map(motif => 
  `- **${motif.name}**: ${motif.percentage}% (${motif.domains.join(', ')})`
).join('\n')}
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
    // Simplified implementation - would map motifs to framework percentages
    return {
      consequentialist: 25,
      deontological: 30,
      virtueEthics: 20,
      careEthics: 15,
      pragmatic: 10
    }
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
    // Simplified confidence inference
    return 0.8
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
}

export const combinatorialGenerator = new CombinatorialValuesGenerator()