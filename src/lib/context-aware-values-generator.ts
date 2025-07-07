/**
 * Context-Aware VALUES.md Generator
 * 
 * A layered, systematic approach to authentic values extraction that goes beyond
 * simple motif categorization to understand WHY people make decisions and HOW
 * their values operate across different contexts.
 * 
 * Architecture:
 * Layer 1: Combinatorial Foundation (fast, systematic)
 * Layer 2: Reasoning Pattern Analysis (contextual understanding)
 * Layer 3: Value Conflict Resolution (authentic complexity)
 * Layer 4: Domain-Specific Application (practical guidance)
 */

import { CombinatorialValuesGenerator, EthicalProfile, ResponsePattern } from './combinatorial-values-generator'

export interface ReasoningPattern {
  id: string
  name: string
  description: string
  indicators: {
    linguistic: string[]      // Words/phrases that indicate this pattern
    structural: string[]      // Reasoning structure markers
    contextual: string[]      // Situational factors that trigger this pattern
  }
  consistency: number         // How consistent this pattern is across responses
  domains: string[]          // Where this pattern appears
  triggers: {
    stakeholders: string[]    // Who is involved when this pattern emerges
    constraints: string[]     // Situational constraints that activate it
    values: string[]         // Core values this pattern serves
  }
}

export interface ValueConflict {
  conflictId: string
  description: string
  competingValues: [string, string]
  resolutionStrategy: 'prioritize' | 'balance' | 'contextual' | 'integrate'
  resolutionReasoning: string
  domains: string[]
  confidence: number
}

export interface DomainContext {
  domain: string
  valuePriorities: string[]
  decisionFactors: string[]
  stakeholderConsiderations: string[]
  constraintSensitivity: string[]
  reasoningStyle: 'analytical' | 'intuitive' | 'collaborative' | 'principled'
  exampleApplications: string[]
}

export interface ContextualEthicalProfile extends EthicalProfile {
  reasoningPatterns: ReasoningPattern[]
  valueConflicts: ValueConflict[]
  domainContexts: DomainContext[]
  authenticLanguage: {
    coreValuePhrases: string[]
    reasoningStyle: string[]
    decisionFactors: string[]
  }
  metaValues: {
    consistencyImportance: number
    adaptabilityImportance: number
    stakeholderInclusivity: number
    consequenceOrientation: number
  }
}

export interface ContextAwareConfig {
  useReasoningAnalysis: boolean
  includeValueConflicts: boolean
  generateDomainSpecific: boolean
  preserveAuthenticLanguage: boolean
  includeImplementationGuidance: boolean
  complexityLevel: 'essential' | 'nuanced' | 'comprehensive'
}

/**
 * Enhanced values generator that maintains systematic structure while
 * adding contextual understanding and authentic language preservation
 */
export class ContextAwareValuesGenerator {
  private combinatorialGenerator: CombinatorialValuesGenerator
  
  constructor() {
    this.combinatorialGenerator = new CombinatorialValuesGenerator()
  }

  /**
   * Layer 1: Start with combinatorial foundation for systematic structure
   */
  private getSystematicFoundation(responses: ResponsePattern[]): EthicalProfile {
    return this.combinatorialGenerator.analyzeResponses(responses)
  }

  /**
   * Layer 2: Analyze reasoning patterns to understand HOW decisions are made
   */
  private extractReasoningPatterns(responses: ResponsePattern[]): ReasoningPattern[] {
    const patterns: ReasoningPattern[] = []
    
    // Group responses by reasoning style indicators
    const reasoningGroups = this.groupByReasoningPatterns(responses)
    
    for (const [patternType, groupedResponses] of reasoningGroups.entries()) {
      const pattern = this.analyzeReasoningPattern(patternType, groupedResponses)
      if (pattern.consistency > 0.3) { // Only include patterns with reasonable consistency
        patterns.push(pattern)
      }
    }
    
    return patterns.sort((a, b) => b.consistency - a.consistency)
  }

  /**
   * Layer 3: Identify value conflicts and resolution strategies
   */
  private identifyValueConflicts(responses: ResponsePattern[], reasoningPatterns: ReasoningPattern[]): ValueConflict[] {
    const conflicts: ValueConflict[] = []
    
    // Look for responses where reasoning indicates tension between values
    const conflictIndicators = [
      'difficult choice', 'trade-off', 'competing', 'balance', 'weigh',
      'on one hand', 'however', 'but also', 'tension', 'prioritize'
    ]
    
    const conflictResponses = responses.filter(r => 
      r.reasoning && conflictIndicators.some(indicator => 
        r.reasoning!.toLowerCase().includes(indicator)
      )
    )
    
    // Analyze how conflicts are resolved
    for (const response of conflictResponses) {
      const conflict = this.analyzeValueConflict(response, responses)
      if (conflict) {
        conflicts.push(conflict)
      }
    }
    
    return this.deduplicateConflicts(conflicts)
  }

  /**
   * Layer 4: Extract domain-specific value applications
   */
  private generateDomainContexts(responses: ResponsePattern[], patterns: ReasoningPattern[]): DomainContext[] {
    const domainGroups = this.groupResponsesByDomain(responses)
    const contexts: DomainContext[] = []
    
    for (const [domain, domainResponses] of domainGroups.entries()) {
      const context = this.analyzeDomainContext(domain, domainResponses, patterns)
      contexts.push(context)
    }
    
    return contexts
  }

  /**
   * Main analysis method that orchestrates all layers
   */
  analyzeContextualResponses(
    responses: ResponsePattern[], 
    config: ContextAwareConfig = this.getDefaultConfig()
  ): ContextualEthicalProfile {
    
    // Layer 1: Systematic foundation
    const foundation = this.getSystematicFoundation(responses)
    
    // Layer 2: Reasoning patterns
    const reasoningPatterns = config.useReasoningAnalysis 
      ? this.extractReasoningPatterns(responses)
      : []
    
    // Layer 3: Value conflicts
    const valueConflicts = config.includeValueConflicts
      ? this.identifyValueConflicts(responses, reasoningPatterns)
      : []
    
    // Layer 4: Domain contexts
    const domainContexts = config.generateDomainSpecific
      ? this.generateDomainContexts(responses, reasoningPatterns)
      : []
    
    // Extract authentic language patterns
    const authenticLanguage = config.preserveAuthenticLanguage
      ? this.extractAuthenticLanguage(responses)
      : { coreValuePhrases: [], reasoningStyle: [], decisionFactors: [] }
    
    // Calculate meta-values (how they approach decision-making itself)
    const metaValues = this.calculateMetaValues(responses, reasoningPatterns)
    
    return {
      ...foundation,
      reasoningPatterns,
      valueConflicts,
      domainContexts,
      authenticLanguage,
      metaValues
    }
  }

  /**
   * Generate contextual VALUES.md that preserves complexity and authenticity
   */
  generateContextualValuesMarkdown(
    profile: ContextualEthicalProfile,
    config: ContextAwareConfig = this.getDefaultConfig()
  ): string {
    
    switch (config.complexityLevel) {
      case 'essential':
        return this.generateEssentialTemplate(profile, config)
      case 'comprehensive':
        return this.generateComprehensiveTemplate(profile, config)
      default:
        return this.generateNuancedTemplate(profile, config)
    }
  }

  /**
   * Essential template: Clear core values with key contextual factors
   */
  private generateEssentialTemplate(profile: ContextualEthicalProfile, config: ContextAwareConfig): string {
    const primaryReasoning = profile.reasoningPatterns[0]
    const coreConflict = profile.valueConflicts[0]
    
    return `# My Values

## Core Decision-Making Approach

${this.generateAuthenticDescription(profile, primaryReasoning)}

## Key Value Tensions

${coreConflict ? this.describeValueConflict(coreConflict) : 'I maintain relatively consistent values across different situations.'}

## Context-Specific Applications

${profile.domainContexts.slice(0, 3).map(domain => 
  `**${domain.domain}**: ${domain.valuePriorities.slice(0, 2).join(', ')}`
).join('\n')}

## AI Collaboration Guidelines

${this.generateAIGuidance(profile, 'essential')}

*Generated through contextual values analysis - reflecting actual decision patterns rather than categorical assignments.*`
  }

  /**
   * Nuanced template: Balanced depth with practical applicability
   */
  private generateNuancedTemplate(profile: ContextualEthicalProfile, config: ContextAwareConfig): string {
    return `# My Values

## How I Make Decisions

${this.generateAuthenticDescription(profile)}

### Primary Reasoning Patterns

${profile.reasoningPatterns.slice(0, 3).map((pattern, i) => 
  `${i + 1}. **${pattern.name}** (${Math.round(pattern.consistency * 100)}% consistency)
   ${pattern.description}
   
   *Appears when: ${pattern.triggers.constraints.slice(0, 2).join(', ')}*
   *Key consideration: ${pattern.triggers.values.slice(0, 2).join(', ')}*`
).join('\n\n')}

## Value Integration & Conflicts

${profile.valueConflicts.length > 0 ? 
  profile.valueConflicts.slice(0, 2).map(conflict => 
    `### ${conflict.competingValues[0]} vs ${conflict.competingValues[1]}
${conflict.resolutionReasoning}

*Resolution approach: ${conflict.resolutionStrategy}*`
  ).join('\n\n') : 
  'My values generally align harmoniously, with context determining emphasis rather than creating fundamental conflicts.'
}

## Domain-Specific Applications

${profile.domainContexts.map(domain => this.generateDomainSection(domain)).join('\n\n')}

## AI Collaboration Framework

${this.generateAIGuidance(profile, 'nuanced')}

## Implementation Notes

This VALUES.md reflects analysis of actual decision patterns rather than theoretical preferences. It captures both consistency and adaptability in my ethical reasoning.

*Generated ${new Date().toISOString().split('T')[0]} using contextual values extraction*`
  }

  /**
   * Comprehensive template: Full depth for research/professional use
   */
  private generateComprehensiveTemplate(profile: ContextualEthicalProfile, config: ContextAwareConfig): string {
    const nuanced = this.generateNuancedTemplate(profile, config)
    
    return `${nuanced}

## Detailed Analysis

### Reasoning Pattern Analysis
${profile.reasoningPatterns.map(pattern => this.generateDetailedPatternAnalysis(pattern)).join('\n\n')}

### Meta-Value Structure
- **Consistency Orientation**: ${profile.metaValues.consistencyImportance}% - ${this.interpretMetaValue('consistency', profile.metaValues.consistencyImportance)}
- **Adaptability Orientation**: ${profile.metaValues.adaptabilityImportance}% - ${this.interpretMetaValue('adaptability', profile.metaValues.adaptabilityImportance)}
- **Stakeholder Inclusivity**: ${profile.metaValues.stakeholderInclusivity}% - ${this.interpretMetaValue('stakeholder', profile.metaValues.stakeholderInclusivity)}
- **Consequence Focus**: ${profile.metaValues.consequenceOrientation}% - ${this.interpretMetaValue('consequence', profile.metaValues.consequenceOrientation)}

### Authentic Language Patterns
**Core Value Expressions**: ${profile.authenticLanguage.coreValuePhrases.join(', ')}
**Reasoning Style Indicators**: ${profile.authenticLanguage.reasoningStyle.join(', ')}
**Decision Factors**: ${profile.authenticLanguage.decisionFactors.join(', ')}

### Framework Compatibility Analysis
${this.generateFrameworkCompatibilityAnalysis(profile)}

---
*This comprehensive analysis provides research-grade insight into ethical decision-making patterns for advanced AI alignment applications.*`
  }

  // Helper methods for pattern analysis
  private groupByReasoningPatterns(responses: ResponsePattern[]): Map<string, ResponsePattern[]> {
    const groups = new Map<string, ResponsePattern[]>()
    
    // Define reasoning pattern indicators
    const patternIndicators = {
      'Stakeholder-First': ['people', 'person', 'individual', 'family', 'community', 'relationship'],
      'Evidence-Based': ['data', 'evidence', 'research', 'facts', 'statistics', 'proven'],
      'Principle-Driven': ['rule', 'principle', 'right', 'wrong', 'should', 'ought', 'duty'],
      'Outcome-Focused': ['result', 'consequence', 'impact', 'effect', 'outcome', 'benefit'],
      'Process-Oriented': ['fair', 'process', 'procedure', 'systematic', 'consistent', 'transparent'],
      'Context-Sensitive': ['depends', 'situation', 'context', 'circumstance', 'case-by-case', 'nuanced']
    }
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const reasoning = response.reasoning.toLowerCase()
      let bestMatch = 'General'
      let bestScore = 0
      
      for (const [pattern, indicators] of Object.entries(patternIndicators)) {
        const score = indicators.reduce((count, indicator) => 
          count + (reasoning.includes(indicator) ? 1 : 0), 0
        )
        if (score > bestScore) {
          bestMatch = pattern
          bestScore = score
        }
      }
      
      if (!groups.has(bestMatch)) {
        groups.set(bestMatch, [])
      }
      groups.get(bestMatch)!.push(response)
    })
    
    return groups
  }

  private analyzeReasoningPattern(patternType: string, responses: ResponsePattern[]): ReasoningPattern {
    const totalResponses = responses.length
    const domains = [...new Set(responses.map(r => r.domain || 'general'))]
    
    // Extract common phrases and concepts
    const reasoningTexts = responses.map(r => r.reasoning || '').filter(r => r.length > 0)
    const commonPhrases = this.extractCommonPhrases(reasoningTexts)
    
    // Calculate consistency by looking at similar reasoning across different dilemmas
    const consistency = this.calculatePatternConsistency(responses)
    
    return {
      id: patternType.toLowerCase().replace(/[^a-z]/g, '_'),
      name: patternType,
      description: this.generatePatternDescription(patternType, commonPhrases),
      indicators: {
        linguistic: commonPhrases.slice(0, 5),
        structural: this.extractStructuralIndicators(reasoningTexts),
        contextual: domains
      },
      consistency,
      domains,
      triggers: this.extractPatternTriggers(responses)
    }
  }

  private extractCommonPhrases(texts: string[]): string[] {
    // Simple phrase extraction - in practice would use more sophisticated NLP
    const phrases = new Map<string, number>()
    
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/)
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1)
      }
    })
    
    return Array.from(phrases.entries())
      .filter(([phrase, count]) => count > 1 && phrase.length > 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase]) => phrase)
  }

  private calculatePatternConsistency(responses: ResponsePattern[]): number {
    // Calculate how consistently this pattern appears across different difficulty levels and domains
    if (responses.length < 2) return 0.5
    
    const difficulties = responses.map(r => r.difficulty || 5)
    const domains = responses.map(r => r.domain || 'general')
    
    // Higher consistency if pattern appears across different difficulties and domains
    const difficultySpread = new Set(difficulties).size
    const domainSpread = new Set(domains).size
    
    return Math.min(1.0, (difficultySpread / 3 + domainSpread / 3) * 0.6 + 0.4)
  }

  private extractStructuralIndicators(texts: string[]): string[] {
    const structures = []
    
    texts.forEach(text => {
      if (text.includes('because')) structures.push('causal reasoning')
      if (text.includes('should') || text.includes('ought')) structures.push('normative reasoning')
      if (text.includes('if') && text.includes('then')) structures.push('conditional reasoning')
      if (text.includes('however') || text.includes('but')) structures.push('contrastive reasoning')
      if (text.includes('consider') || text.includes('factors')) structures.push('multi-factor analysis')
    })
    
    return [...new Set(structures)]
  }

  private extractPatternTriggers(responses: ResponsePattern[]): { stakeholders: string[], constraints: string[], values: string[] } {
    // Extract what situations and considerations trigger this reasoning pattern
    const stakeholders = new Set<string>()
    const constraints = new Set<string>()
    const values = new Set<string>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const reasoning = response.reasoning.toLowerCase()
      
      // Extract stakeholder mentions
      if (reasoning.includes('family')) stakeholders.add('family')
      if (reasoning.includes('employee') || reasoning.includes('worker')) stakeholders.add('employees')
      if (reasoning.includes('customer') || reasoning.includes('client')) stakeholders.add('customers')
      if (reasoning.includes('public') || reasoning.includes('society')) stakeholders.add('public')
      
      // Extract constraint mentions
      if (reasoning.includes('time') || reasoning.includes('urgent')) constraints.add('time pressure')
      if (reasoning.includes('resource') || reasoning.includes('budget')) constraints.add('resource constraints')
      if (reasoning.includes('legal') || reasoning.includes('compliance')) constraints.add('legal requirements')
      if (reasoning.includes('risk') || reasoning.includes('safety')) constraints.add('risk factors')
      
      // Extract value mentions
      if (reasoning.includes('fair') || reasoning.includes('justice')) values.add('fairness')
      if (reasoning.includes('honest') || reasoning.includes('truth')) values.add('honesty')
      if (reasoning.includes('harm') || reasoning.includes('safety')) values.add('safety')
      if (reasoning.includes('respect') || reasoning.includes('dignity')) values.add('respect')
    })
    
    return {
      stakeholders: Array.from(stakeholders),
      constraints: Array.from(constraints),
      values: Array.from(values)
    }
  }

  // Additional helper methods would be implemented for:
  // - analyzeValueConflict
  // - deduplicateConflicts  
  // - groupResponsesByDomain
  // - analyzeDomainContext
  // - extractAuthenticLanguage
  // - calculateMetaValues
  // - generateAuthenticDescription
  // - describeValueConflict
  // - generateAIGuidance
  // - generateDomainSection
  // - generateDetailedPatternAnalysis
  // - interpretMetaValue
  // - generateFrameworkCompatibilityAnalysis
  // - generatePatternDescription

  private getDefaultConfig(): ContextAwareConfig {
    return {
      useReasoningAnalysis: true,
      includeValueConflicts: true,
      generateDomainSpecific: true,
      preserveAuthenticLanguage: true,
      includeImplementationGuidance: true,
      complexityLevel: 'nuanced'
    }
  }

  // Placeholder implementations for remaining methods
  private analyzeValueConflict(response: ResponsePattern, allResponses: ResponsePattern[]): ValueConflict | null {
    // Implementation would analyze conflicting values in reasoning
    return null
  }

  private deduplicateConflicts(conflicts: ValueConflict[]): ValueConflict[] {
    return conflicts
  }

  private groupResponsesByDomain(responses: ResponsePattern[]): Map<string, ResponsePattern[]> {
    const groups = new Map<string, ResponsePattern[]>()
    responses.forEach(r => {
      const domain = r.domain || 'general'
      if (!groups.has(domain)) groups.set(domain, [])
      groups.get(domain)!.push(r)
    })
    return groups
  }

  private analyzeDomainContext(domain: string, responses: ResponsePattern[], patterns: ReasoningPattern[]): DomainContext {
    return {
      domain,
      valuePriorities: ['placeholder'],
      decisionFactors: ['placeholder'],
      stakeholderConsiderations: ['placeholder'],
      constraintSensitivity: ['placeholder'],
      reasoningStyle: 'analytical',
      exampleApplications: ['placeholder']
    }
  }

  private extractAuthenticLanguage(responses: ResponsePattern[]) {
    const reasoningTexts = responses
      .map(r => r.reasoning || '')
      .filter(r => r.length > 10)
    
    if (reasoningTexts.length === 0) {
      return {
        coreValuePhrases: [],
        reasoningStyle: [],
        decisionFactors: []
      }
    }
    
    return {
      coreValuePhrases: this.extractValuePhrases(reasoningTexts),
      reasoningStyle: this.extractReasoningStyle(reasoningTexts),
      decisionFactors: this.extractDecisionFactors(reasoningTexts)
    }
  }

  private extractValuePhrases(texts: string[]): string[] {
    const valueIndicators = ['important to me', 'I believe', 'I value', 'matters to me', 'I think']
    const phrases: string[] = []
    
    texts.forEach(text => {
      valueIndicators.forEach(indicator => {
        const index = text.toLowerCase().indexOf(indicator.toLowerCase())
        if (index !== -1) {
          // Extract the sentence containing the value statement
          const sentences = text.split(/[.!?]+/)
          const valueSentence = sentences.find(s => 
            s.toLowerCase().includes(indicator.toLowerCase())
          )
          if (valueSentence && valueSentence.trim().length > 20) {
            phrases.push(valueSentence.trim())
          }
        }
      })
    })
    
    // Return unique phrases, sorted by length (prefer more complete thoughts)
    return [...new Set(phrases)]
      .sort((a, b) => b.length - a.length)
      .slice(0, 5)
  }

  private extractReasoningStyle(texts: string[]): string[] {
    const styles = new Set<string>()
    
    texts.forEach(text => {
      const lower = text.toLowerCase()
      
      if (lower.includes('because') || lower.includes('therefore')) {
        styles.add('analytical reasoning')
      }
      if (lower.includes('feel') || lower.includes('sense')) {
        styles.add('intuitive assessment')
      }
      if (lower.includes('consider') || lower.includes('weigh')) {
        styles.add('deliberative evaluation')
      }
      if (lower.includes('balance') || lower.includes('both')) {
        styles.add('integrative thinking')
      }
    })
    
    return Array.from(styles).slice(0, 3)
  }

  private extractDecisionFactors(texts: string[]): string[] {
    const factors = new Set<string>()
    
    texts.forEach(text => {
      const lower = text.toLowerCase()
      
      if (lower.includes('people') || lower.includes('person')) {
        factors.add('human impact')
      }
      if (lower.includes('consequence') || lower.includes('result')) {
        factors.add('outcome consideration')
      }
      if (lower.includes('fair') || lower.includes('just')) {
        factors.add('fairness principle')
      }
      if (lower.includes('right') || lower.includes('wrong')) {
        factors.add('moral clarity')
      }
      if (lower.includes('long-term') || lower.includes('future')) {
        factors.add('future impact')
      }
    })
    
    return Array.from(factors).slice(0, 4)
  }

  private calculateMetaValues(responses: ResponsePattern[], patterns: ReasoningPattern[]) {
    return {
      consistencyImportance: 75,
      adaptabilityImportance: 60,
      stakeholderInclusivity: 80,
      consequenceOrientation: 70
    }
  }

  private generateAuthenticDescription(profile: ContextualEthicalProfile, primaryPattern?: ReasoningPattern): string {
    // Use authentic language if available
    if (profile.authenticLanguage.coreValuePhrases.length > 0) {
      const topPhrase = profile.authenticLanguage.coreValuePhrases[0]
      // Extract the core belief from their own words
      return `${topPhrase}. This guides how I approach decisions across different contexts.`
    }
    
    // Fallback to pattern-based description
    if (primaryPattern) {
      return primaryPattern.description
    }
    
    // Final fallback
    return "I approach decisions by carefully considering multiple perspectives and long-term implications."
  }

  private describeValueConflict(conflict: ValueConflict): string {
    return `When ${conflict.competingValues[0]} conflicts with ${conflict.competingValues[1]}, ${conflict.resolutionReasoning}`
  }

  private generateAIGuidance(profile: ContextualEthicalProfile, level: string): string {
    let guidance = "When assisting me, please:\n\n"
    
    // Use authentic reasoning style
    if (profile.authenticLanguage.reasoningStyle.length > 0) {
      guidance += `1. **Reasoning Style**: Match my ${profile.authenticLanguage.reasoningStyle[0]} approach\n`
    }
    
    // Use authentic decision factors  
    if (profile.authenticLanguage.decisionFactors.length > 0) {
      guidance += `2. **Key Factors**: Always consider ${profile.authenticLanguage.decisionFactors.join(', ')}\n`
    }
    
    // Add domain-specific guidance
    if (profile.domainContexts.length > 0) {
      guidance += `3. **Context Sensitivity**: Adapt approach based on whether we're dealing with ${profile.domainContexts.map(d => d.domain).join(', ')} decisions\n`
    }
    
    // Add pattern-based guidance
    if (profile.reasoningPatterns.length > 0) {
      const primaryPattern = profile.reasoningPatterns[0]
      guidance += `4. **Decision Process**: ${primaryPattern.description}\n`
    }
    
    return guidance + "\n*Base recommendations on my actual reasoning patterns, not generic ethical frameworks.*"
  }

  private generateDomainSection(domain: DomainContext): string {
    return `### ${domain.domain}
- Primary values: ${domain.valuePriorities.join(', ')}
- Key factors: ${domain.decisionFactors.join(', ')}`
  }

  private generateDetailedPatternAnalysis(pattern: ReasoningPattern): string {
    return `**${pattern.name}**: ${pattern.description} (${Math.round(pattern.consistency * 100)}% consistency)`
  }

  private interpretMetaValue(type: string, value: number): string {
    return value > 70 ? 'High priority' : value > 40 ? 'Moderate priority' : 'Lower priority'
  }

  private generateFrameworkCompatibilityAnalysis(profile: ContextualEthicalProfile): string {
    return 'Framework compatibility analysis would be implemented here.'
  }

  private generatePatternDescription(patternType: string, phrases: string[]): string {
    return `This reasoning pattern emphasizes ${patternType.toLowerCase()} considerations in decision-making.`
  }
}

export const contextAwareGenerator = new ContextAwareValuesGenerator()