/**
 * Domain-Specific Value Extractor
 * 
 * Understands that values operate differently across contexts:
 * - Professional vs Personal decisions
 * - Crisis vs Routine situations  
 * - Individual vs Collective impacts
 * 
 * Creates practical, domain-specific guidance that acknowledges
 * the complexity of real-world ethical decision-making.
 */

import { ResponsePattern, DomainContext } from './context-aware-values-generator'
import { ReasoningPattern, AuthenticPhrase } from './reasoning-pattern-analyzer'

export interface DomainProfile {
  domain: string
  displayName: string
  valuePriorities: ValuePriority[]
  decisionFactors: DecisionFactor[]
  stakeholderMap: StakeholderContext[]
  constraintSensitivity: ConstraintSensitivity[]
  reasoningAdaptation: ReasoningAdaptation
  authenticExpressions: AuthenticExpression[]
}

export interface ValuePriority {
  value: string
  rank: number
  weight: number
  contextualModifiers: string[]
  tradeoffWillingness: number
}

export interface DecisionFactor {
  factor: string
  importance: number
  description: string
  triggers: string[]
  examples: string[]
}

export interface StakeholderContext {
  stakeholder: string
  considerationLevel: 'primary' | 'secondary' | 'contextual'
  specificConcerns: string[]
  balancingApproach: string
}

export interface ConstraintSensitivity {
  constraint: string
  sensitivityLevel: 'high' | 'medium' | 'low'
  adaptationStrategy: string
  breakingPoint?: string
}

export interface ReasoningAdaptation {
  primaryStyle: string
  adaptationTriggers: string[]
  stylisticShifts: string[]
  consistencyFactors: string[]
}

export interface AuthenticExpression {
  phrase: string
  context: string
  frequency: number
  emotionalWeight: 'high' | 'medium' | 'low'
  applicationGuidance: string
}

/**
 * Extracts domain-specific value applications with practical guidance
 */
export class DomainSpecificExtractor {

  /**
   * Analyze how values operate across different domains
   */
  extractDomainProfiles(
    responses: ResponsePattern[], 
    reasoningPatterns: ReasoningPattern[]
  ): DomainProfile[] {
    const domainGroups = this.groupResponsesByDomain(responses)
    const profiles: DomainProfile[] = []
    
    for (const [domain, domainResponses] of domainGroups.entries()) {
      if (domainResponses.length < 2) continue // Need multiple responses to establish patterns
      
      const profile = this.createDomainProfile(domain, domainResponses, reasoningPatterns)
      profiles.push(profile)
    }
    
    return profiles.sort((a, b) => b.valuePriorities.length - a.valuePriorities.length)
  }

  /**
   * Group responses by domain with intelligent categorization
   */
  private groupResponsesByDomain(responses: ResponsePattern[]): Map<string, ResponsePattern[]> {
    const groups = new Map<string, ResponsePattern[]>()
    
    responses.forEach(response => {
      const domain = this.inferDomain(response)
      
      if (!groups.has(domain)) {
        groups.set(domain, [])
      }
      groups.get(domain)!.push(response)
    })
    
    return groups
  }

  /**
   * Infer domain from response content and context
   */
  private inferDomain(response: ResponsePattern): string {
    // Use explicit domain if available
    if (response.domain && response.domain !== 'general') {
      return response.domain
    }
    
    // Infer from reasoning content
    if (response.reasoning) {
      const reasoning = response.reasoning.toLowerCase()
      
      // Professional/Business contexts
      if (this.containsKeywords(reasoning, ['employee', 'company', 'business', 'workplace', 'professional', 'client', 'customer', 'profit', 'organization'])) {
        return 'professional'
      }
      
      // Personal/Family contexts
      if (this.containsKeywords(reasoning, ['family', 'personal', 'friend', 'relationship', 'private', 'spouse', 'children', 'parent'])) {
        return 'personal'
      }
      
      // Medical/Healthcare contexts
      if (this.containsKeywords(reasoning, ['patient', 'medical', 'health', 'doctor', 'treatment', 'care', 'hospital', 'therapy'])) {
        return 'healthcare'
      }
      
      // Financial contexts
      if (this.containsKeywords(reasoning, ['money', 'financial', 'investment', 'budget', 'cost', 'economic', 'payment', 'debt'])) {
        return 'financial'
      }
      
      // Legal/Regulatory contexts
      if (this.containsKeywords(reasoning, ['legal', 'law', 'regulation', 'compliance', 'court', 'justice', 'rights', 'policy'])) {
        return 'legal'
      }
      
      // Technology/Innovation contexts
      if (this.containsKeywords(reasoning, ['technology', 'data', 'privacy', 'innovation', 'digital', 'ai', 'algorithm', 'software'])) {
        return 'technology'
      }
      
      // Environmental/Social contexts
      if (this.containsKeywords(reasoning, ['environment', 'climate', 'social', 'community', 'public', 'society', 'sustainable'])) {
        return 'social'
      }
    }
    
    return 'general'
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword))
  }

  /**
   * Create comprehensive domain profile
   */
  private createDomainProfile(
    domain: string, 
    responses: ResponsePattern[], 
    reasoningPatterns: ReasoningPattern[]
  ): DomainProfile {
    
    return {
      domain,
      displayName: this.getDomainDisplayName(domain),
      valuePriorities: this.extractValuePriorities(responses),
      decisionFactors: this.extractDecisionFactors(responses),
      stakeholderMap: this.mapStakeholders(responses),
      constraintSensitivity: this.analyzeConstraintSensitivity(responses),
      reasoningAdaptation: this.analyzeReasoningAdaptation(responses, reasoningPatterns),
      authenticExpressions: this.extractAuthenticExpressions(responses)
    }
  }

  private getDomainDisplayName(domain: string): string {
    const displayNames: Record<string, string> = {
      'professional': 'Professional & Business',
      'personal': 'Personal & Family',
      'healthcare': 'Healthcare & Medical',
      'financial': 'Financial & Economic',
      'legal': 'Legal & Regulatory',
      'technology': 'Technology & Innovation',
      'social': 'Social & Environmental',
      'general': 'General Decision-Making'
    }
    
    return displayNames[domain] || domain.charAt(0).toUpperCase() + domain.slice(1)
  }

  /**
   * Extract value priorities specific to this domain
   */
  private extractValuePriorities(responses: ResponsePattern[]): ValuePriority[] {
    const valueMap = new Map<string, { count: number, contexts: string[], tradeoffs: string[] }>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const values = this.identifyValues(response.reasoning)
      const tradeoffs = this.identifyTradeoffs(response.reasoning)
      
      values.forEach(value => {
        if (!valueMap.has(value)) {
          valueMap.set(value, { count: 0, contexts: [], tradeoffs: [] })
        }
        const data = valueMap.get(value)!
        data.count++
        data.contexts.push(response.reasoning || '')
        data.tradeoffs.push(...tradeoffs)
      })
    })
    
    return Array.from(valueMap.entries())
      .map(([value, data], index) => ({
        value,
        rank: index + 1,
        weight: data.count / responses.length,
        contextualModifiers: this.extractContextualModifiers(data.contexts),
        tradeoffWillingness: this.calculateTradeoffWillingness(data.tradeoffs)
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 7) // Top 7 values per domain
  }

  private identifyValues(reasoning: string): string[] {
    const valuePatterns = {
      'honesty': /\b(honest|truth|transparent|open|candid|genuine)\b/gi,
      'fairness': /\b(fair|equal|just|equitable|impartial|balanced)\b/gi,
      'respect': /\b(respect|dignity|worth|considerate|courtesy)\b/gi,
      'responsibility': /\b(responsible|accountable|duty|obligation|commitment)\b/gi,
      'compassion': /\b(care|compassion|empathy|kindness|support|help)\b/gi,
      'efficiency': /\b(efficient|effective|productive|optimal|streamlined)\b/gi,
      'safety': /\b(safe|secure|protect|risk|danger|harm|precaution)\b/gi,
      'autonomy': /\b(choice|freedom|independence|self-determination|control)\b/gi,
      'loyalty': /\b(loyal|faithful|committed|dedicated|devoted)\b/gi,
      'innovation': /\b(innovative|creative|improvement|progress|advancement)\b/gi,
      'sustainability': /\b(sustainable|environment|long-term|future|preservation)\b/gi,
      'collaboration': /\b(teamwork|cooperation|partnership|collective|together)\b/gi
    }
    
    const foundValues: string[] = []
    
    for (const [value, pattern] of Object.entries(valuePatterns)) {
      if (pattern.test(reasoning)) {
        foundValues.push(value)
      }
    }
    
    return foundValues
  }

  private identifyTradeoffs(reasoning: string): string[] {
    const tradeoffIndicators = [
      'trade-off', 'balance', 'competing', 'conflict', 'tension', 'weigh',
      'prioritize', 'choose between', 'sacrifice', 'compromise', 'difficult choice'
    ]
    
    const tradeoffs: string[] = []
    const lowerReasoning = reasoning.toLowerCase()
    
    tradeoffIndicators.forEach(indicator => {
      if (lowerReasoning.includes(indicator)) {
        tradeoffs.push(indicator)
      }
    })
    
    return tradeoffs
  }

  private extractContextualModifiers(contexts: string[]): string[] {
    const modifiers = new Set<string>()
    
    contexts.forEach(context => {
      const lower = context.toLowerCase()
      
      // Situational modifiers
      if (lower.includes('emergency') || lower.includes('crisis')) modifiers.add('crisis-responsive')
      if (lower.includes('routine') || lower.includes('normal')) modifiers.add('routine-consistent')
      if (lower.includes('public') || lower.includes('visible')) modifiers.add('public-conscious')
      if (lower.includes('private') || lower.includes('personal')) modifiers.add('privacy-protective')
      if (lower.includes('long-term') || lower.includes('future')) modifiers.add('future-oriented')
      if (lower.includes('immediate') || lower.includes('urgent')) modifiers.add('immediate-focused')
    })
    
    return Array.from(modifiers)
  }

  private calculateTradeoffWillingness(tradeoffs: string[]): number {
    // Higher score means more willing to make tradeoffs (pragmatic)
    // Lower score means more principle-driven (consistent)
    
    const pragmaticIndicators = ['balance', 'weigh', 'compromise', 'practical']
    const principledIndicators = ['never', 'always', 'must', 'cannot', 'essential']
    
    let pragmaticScore = 0
    let principledScore = 0
    
    tradeoffs.forEach(tradeoff => {
      if (pragmaticIndicators.some(indicator => tradeoff.includes(indicator))) {
        pragmaticScore++
      }
      if (principledIndicators.some(indicator => tradeoff.includes(indicator))) {
        principledScore++
      }
    })
    
    if (pragmaticScore + principledScore === 0) return 0.5
    
    return pragmaticScore / (pragmaticScore + principledScore)
  }

  /**
   * Extract decision factors specific to this domain
   */
  private extractDecisionFactors(responses: ResponsePattern[]): DecisionFactor[] {
    const factorMap = new Map<string, { count: number, descriptions: string[], triggers: string[], examples: string[] }>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const factors = this.identifyDecisionFactors(response.reasoning)
      
      factors.forEach(factor => {
        if (!factorMap.has(factor.name)) {
          factorMap.set(factor.name, { count: 0, descriptions: [], triggers: [], examples: [] })
        }
        const data = factorMap.get(factor.name)!
        data.count++
        data.descriptions.push(factor.description)
        data.triggers.push(...factor.triggers)
        data.examples.push(factor.example)
      })
    })
    
    return Array.from(factorMap.entries())
      .map(([factor, data]) => ({
        factor,
        importance: data.count / responses.length,
        description: this.synthesizeDescriptions(data.descriptions),
        triggers: [...new Set(data.triggers)],
        examples: data.examples.filter(e => e.length > 0)
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5) // Top 5 factors per domain
  }

  private identifyDecisionFactors(reasoning: string): Array<{name: string, description: string, triggers: string[], example: string}> {
    const factors = []
    const lower = reasoning.toLowerCase()
    
    // Impact assessment
    if (lower.includes('impact') || lower.includes('effect') || lower.includes('consequence')) {
      factors.push({
        name: 'Impact Assessment',
        description: 'Consideration of outcomes and consequences',
        triggers: ['impact', 'effect', 'consequence'],
        example: this.extractExample(reasoning, ['impact', 'effect', 'consequence'])
      })
    }
    
    // Stakeholder considerations
    if (lower.includes('people') || lower.includes('person') || lower.includes('affected')) {
      factors.push({
        name: 'Stakeholder Impact',
        description: 'Focus on how decisions affect people',
        triggers: ['people', 'person', 'affected'],
        example: this.extractExample(reasoning, ['people', 'person', 'affected'])
      })
    }
    
    // Risk analysis
    if (lower.includes('risk') || lower.includes('danger') || lower.includes('safety')) {
      factors.push({
        name: 'Risk Management',
        description: 'Assessment and mitigation of potential risks',
        triggers: ['risk', 'danger', 'safety'],
        example: this.extractExample(reasoning, ['risk', 'danger', 'safety'])
      })
    }
    
    // Resource considerations
    if (lower.includes('cost') || lower.includes('resource') || lower.includes('budget')) {
      factors.push({
        name: 'Resource Efficiency',
        description: 'Consideration of costs and resource allocation',
        triggers: ['cost', 'resource', 'budget'],
        example: this.extractExample(reasoning, ['cost', 'resource', 'budget'])
      })
    }
    
    // Time factors
    if (lower.includes('time') || lower.includes('urgent') || lower.includes('deadline')) {
      factors.push({
        name: 'Time Sensitivity',
        description: 'Urgency and timing considerations',
        triggers: ['time', 'urgent', 'deadline'],
        example: this.extractExample(reasoning, ['time', 'urgent', 'deadline'])
      })
    }
    
    return factors
  }

  private extractExample(text: string, keywords: string[]): string {
    const sentences = text.split(/[.!?]+/)
    
    for (const sentence of sentences) {
      if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence.trim()
      }
    }
    
    return ''
  }

  private synthesizeDescriptions(descriptions: string[]): string {
    // Simple synthesis - in practice would use more sophisticated text analysis
    const commonThemes = new Map<string, number>()
    
    descriptions.forEach(desc => {
      const words = desc.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.length > 3) {
          commonThemes.set(word, (commonThemes.get(word) || 0) + 1)
        }
      })
    })
    
    const dominantThemes = Array.from(commonThemes.entries())
      .filter(([word, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word)
    
    return `Emphasizes ${dominantThemes.join(', ')} in decision-making processes`
  }

  /**
   * Map stakeholder considerations for this domain
   */
  private mapStakeholders(responses: ResponsePattern[]): StakeholderContext[] {
    const stakeholderMentions = new Map<string, { count: number, concerns: string[], approaches: string[] }>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const stakeholders = this.identifyStakeholders(response.reasoning)
      stakeholders.forEach(stakeholder => {
        if (!stakeholderMentions.has(stakeholder.name)) {
          stakeholderMentions.set(stakeholder.name, { count: 0, concerns: [], approaches: [] })
        }
        const data = stakeholderMentions.get(stakeholder.name)!
        data.count++
        data.concerns.push(...stakeholder.concerns)
        data.approaches.push(stakeholder.approach)
      })
    })
    
    return Array.from(stakeholderMentions.entries())
      .map(([stakeholder, data]) => ({
        stakeholder,
        considerationLevel: this.getConsiderationLevel(data.count, responses.length),
        specificConcerns: [...new Set(data.concerns)],
        balancingApproach: this.synthesizeApproaches(data.approaches)
      }))
      .sort((a, b) => this.getLevelWeight(b.considerationLevel) - this.getLevelWeight(a.considerationLevel))
  }

  private identifyStakeholders(reasoning: string): Array<{name: string, concerns: string[], approach: string}> {
    const stakeholders = []
    const lower = reasoning.toLowerCase()
    
    const stakeholderPatterns = {
      'employees': ['employee', 'worker', 'staff', 'team'],
      'customers': ['customer', 'client', 'consumer'],
      'family': ['family', 'spouse', 'children', 'parent'],
      'community': ['community', 'public', 'society', 'neighbors'],
      'shareholders': ['shareholder', 'investor', 'owner'],
      'patients': ['patient', 'care', 'treatment']
    }
    
    for (const [stakeholder, keywords] of Object.entries(stakeholderPatterns)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        stakeholders.push({
          name: stakeholder,
          concerns: this.extractConcerns(reasoning, keywords),
          approach: this.extractApproach(reasoning, keywords)
        })
      }
    }
    
    return stakeholders
  }

  private extractConcerns(reasoning: string, keywords: string[]): string[] {
    const concerns = []
    const lower = reasoning.toLowerCase()
    
    // Look for concern indicators near stakeholder mentions
    const concernIndicators = ['concern', 'worry', 'issue', 'problem', 'need', 'want', 'affect', 'impact']
    
    concernIndicators.forEach(indicator => {
      if (lower.includes(indicator)) {
        concerns.push(indicator)
      }
    })
    
    return concerns
  }

  private extractApproach(reasoning: string, keywords: string[]): string {
    const lower = reasoning.toLowerCase()
    
    if (lower.includes('balance') || lower.includes('consider')) return 'balanced consideration'
    if (lower.includes('prioritize') || lower.includes('focus')) return 'prioritized attention'
    if (lower.includes('protect') || lower.includes('ensure')) return 'protective approach'
    if (lower.includes('involve') || lower.includes('consult')) return 'collaborative engagement'
    
    return 'general consideration'
  }

  private getConsiderationLevel(count: number, totalResponses: number): 'primary' | 'secondary' | 'contextual' {
    const percentage = count / totalResponses
    
    if (percentage > 0.6) return 'primary'
    if (percentage > 0.3) return 'secondary'
    return 'contextual'
  }

  private getLevelWeight(level: 'primary' | 'secondary' | 'contextual'): number {
    const weights = { primary: 3, secondary: 2, contextual: 1 }
    return weights[level]
  }

  private synthesizeApproaches(approaches: string[]): string {
    const approachCounts = new Map<string, number>()
    
    approaches.forEach(approach => {
      approachCounts.set(approach, (approachCounts.get(approach) || 0) + 1)
    })
    
    const dominantApproach = Array.from(approachCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    return dominantApproach ? dominantApproach[0] : 'varied approach'
  }

  /**
   * Analyze constraint sensitivity for this domain
   */
  private analyzeConstraintSensitivity(responses: ResponsePattern[]): ConstraintSensitivity[] {
    const constraints = new Map<string, { mentions: number, adaptations: string[], breaks: string[] }>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const identifiedConstraints = this.identifyConstraints(response.reasoning)
      identifiedConstraints.forEach(constraint => {
        if (!constraints.has(constraint.type)) {
          constraints.set(constraint.type, { mentions: 0, adaptations: [], breaks: [] })
        }
        const data = constraints.get(constraint.type)!
        data.mentions++
        data.adaptations.push(constraint.adaptation)
        if (constraint.breakingPoint) data.breaks.push(constraint.breakingPoint)
      })
    })
    
    return Array.from(constraints.entries())
      .map(([constraint, data]) => ({
        constraint,
        sensitivityLevel: this.getSensitivityLevel(data.mentions, responses.length),
        adaptationStrategy: this.synthesizeAdaptations(data.adaptations),
        breakingPoint: data.breaks.length > 0 ? data.breaks[0] : undefined
      }))
  }

  private identifyConstraints(reasoning: string): Array<{type: string, adaptation: string, breakingPoint?: string}> {
    const constraints = []
    const lower = reasoning.toLowerCase()
    
    const constraintPatterns = {
      'time': ['time', 'urgent', 'deadline', 'quickly'],
      'budget': ['budget', 'cost', 'money', 'expensive'],
      'legal': ['legal', 'law', 'regulation', 'compliance'],
      'safety': ['safety', 'risk', 'danger', 'secure'],
      'privacy': ['private', 'confidential', 'secret', 'personal']
    }
    
    for (const [constraint, keywords] of Object.entries(constraintPatterns)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        constraints.push({
          type: constraint,
          adaptation: this.extractAdaptation(reasoning, keywords),
          breakingPoint: this.extractBreakingPoint(reasoning, keywords)
        })
      }
    }
    
    return constraints
  }

  private extractAdaptation(reasoning: string, keywords: string[]): string {
    // Look for how the person adapts to constraints
    const lower = reasoning.toLowerCase()
    
    if (lower.includes('adjust') || lower.includes('modify')) return 'flexible adjustment'
    if (lower.includes('work around') || lower.includes('alternative')) return 'creative workaround'
    if (lower.includes('accept') || lower.includes('accommodate')) return 'acceptance and accommodation'
    if (lower.includes('challenge') || lower.includes('question')) return 'constructive challenge'
    
    return 'context-dependent adaptation'
  }

  private extractBreakingPoint(reasoning: string, keywords: string[]): string | undefined {
    const lower = reasoning.toLowerCase()
    
    if (lower.includes('never') || lower.includes('absolutely not')) return 'absolute boundary'
    if (lower.includes('only if') || lower.includes('unless')) return 'conditional boundary'
    if (lower.includes('extreme') || lower.includes('emergency')) return 'emergency exception'
    
    return undefined
  }

  private getSensitivityLevel(mentions: number, totalResponses: number): 'high' | 'medium' | 'low' {
    const percentage = mentions / totalResponses
    
    if (percentage > 0.5) return 'high'
    if (percentage > 0.25) return 'medium'
    return 'low'
  }

  private synthesizeAdaptations(adaptations: string[]): string {
    const adaptationCounts = new Map<string, number>()
    
    adaptations.forEach(adaptation => {
      adaptationCounts.set(adaptation, (adaptationCounts.get(adaptation) || 0) + 1)
    })
    
    const dominantAdaptation = Array.from(adaptationCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    return dominantAdaptation ? dominantAdaptation[0] : 'varied adaptation strategies'
  }

  /**
   * Analyze how reasoning adapts to this domain
   */
  private analyzeReasoningAdaptation(responses: ResponsePattern[], patterns: ReasoningPattern[]): ReasoningAdaptation {
    // Analyze how reasoning style changes in this domain
    const styles = responses.map(r => this.inferReasoningStyle(r.reasoning || ''))
    const dominantStyle = this.getDominantStyle(styles)
    
    return {
      primaryStyle: dominantStyle,
      adaptationTriggers: this.extractAdaptationTriggers(responses),
      stylisticShifts: this.identifyStyleShifts(responses),
      consistencyFactors: this.identifyConsistencyFactors(responses)
    }
  }

  private inferReasoningStyle(reasoning: string): string {
    const lower = reasoning.toLowerCase()
    
    if (lower.includes('analyze') || lower.includes('data') || lower.includes('evidence')) return 'analytical'
    if (lower.includes('feel') || lower.includes('intuition') || lower.includes('sense')) return 'intuitive'
    if (lower.includes('discuss') || lower.includes('consult') || lower.includes('team')) return 'collaborative'
    if (lower.includes('principle') || lower.includes('rule') || lower.includes('should')) return 'principled'
    if (lower.includes('context') || lower.includes('situation') || lower.includes('depends')) return 'contextual'
    
    return 'balanced'
  }

  private getDominantStyle(styles: string[]): string {
    const styleCounts = new Map<string, number>()
    
    styles.forEach(style => {
      styleCounts.set(style, (styleCounts.get(style) || 0) + 1)
    })
    
    const dominant = Array.from(styleCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    return dominant ? dominant[0] : 'balanced'
  }

  private extractAdaptationTriggers(responses: ResponsePattern[]): string[] {
    const triggers = new Set<string>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const lower = response.reasoning.toLowerCase()
      
      if (lower.includes('emergency') || lower.includes('crisis')) triggers.add('crisis situations')
      if (lower.includes('complex') || lower.includes('complicated')) triggers.add('complex scenarios')
      if (lower.includes('stakeholder') || lower.includes('multiple people')) triggers.add('multi-stakeholder contexts')
      if (lower.includes('uncertain') || lower.includes('unclear')) triggers.add('uncertainty')
      if (lower.includes('time pressure') || lower.includes('urgent')) triggers.add('time constraints')
    })
    
    return Array.from(triggers)
  }

  private identifyStyleShifts(responses: ResponsePattern[]): string[] {
    const shifts = []
    
    // Look for patterns in reasoning style changes
    // This is a simplified implementation
    const styles = responses.map(r => this.inferReasoningStyle(r.reasoning || ''))
    const uniqueStyles = new Set(styles)
    
    if (uniqueStyles.size > 2) {
      shifts.push('multi-modal reasoning')
    }
    
    if (styles.includes('analytical') && styles.includes('intuitive')) {
      shifts.push('analytical-intuitive integration')
    }
    
    return shifts
  }

  private identifyConsistencyFactors(responses: ResponsePattern[]): string[] {
    const factors = []
    
    // Look for what keeps reasoning consistent across this domain
    const reasoningTexts = responses.map(r => r.reasoning || '').filter(r => r.length > 0)
    
    if (reasoningTexts.length < 2) return ['insufficient data']
    
    // Simple consistency analysis
    const commonPhrases = this.findCommonPhrases(reasoningTexts)
    
    if (commonPhrases.length > 2) {
      factors.push('consistent value language')
    }
    
    factors.push('domain-specific priorities')
    
    return factors
  }

  private findCommonPhrases(texts: string[]): string[] {
    const phrases = new Map<string, number>()
    
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/)
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`
        if (phrase.length > 6) {
          phrases.set(phrase, (phrases.get(phrase) || 0) + 1)
        }
      }
    })
    
    return Array.from(phrases.entries())
      .filter(([phrase, count]) => count > 1)
      .map(([phrase]) => phrase)
  }

  /**
   * Extract authentic expressions specific to this domain
   */
  private extractAuthenticExpressions(responses: ResponsePattern[]): AuthenticExpression[] {
    const expressions = new Map<string, { count: number, contexts: string[], weights: string[] }>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const phrases = this.extractMeaningfulPhrases(response.reasoning)
      phrases.forEach(phrase => {
        if (!expressions.has(phrase)) {
          expressions.set(phrase, { count: 0, contexts: [], weights: [] })
        }
        const data = expressions.get(phrase)!
        data.count++
        data.contexts.push(response.reasoning || '')
        data.weights.push(this.assessPhraseWeight(phrase, response))
      })
    })
    
    return Array.from(expressions.entries())
      .filter(([phrase, data]) => data.count > 1)
      .map(([phrase, data]) => ({
        phrase,
        context: this.synthesizeContext(data.contexts),
        frequency: data.count,
        emotionalWeight: this.synthesizeEmotionalWeight(data.weights),
        applicationGuidance: this.generateApplicationGuidance(phrase, data.contexts)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5) // Top 5 expressions per domain
  }

  private extractMeaningfulPhrases(text: string): string[] {
    // Extract phrases that indicate values or decision-making approaches
    const valueIndicators = [
      'important to', 'matters because', 'believe in', 'focus on', 'prioritize',
      'consider carefully', 'make sure', 'ensure that', 'always try', 'never want'
    ]
    
    const phrases = []
    const lower = text.toLowerCase()
    
    valueIndicators.forEach(indicator => {
      const index = lower.indexOf(indicator)
      if (index !== -1) {
        // Extract the phrase and some context
        const start = Math.max(0, index - 10)
        const end = Math.min(text.length, index + indicator.length + 20)
        const phrase = text.substring(start, end).trim()
        phrases.push(phrase)
      }
    })
    
    return phrases
  }

  private assessPhraseWeight(phrase: string, response: ResponsePattern): string {
    const difficulty = response.difficulty || 5
    const hasEmotionalWords = /\b(deeply|strongly|absolutely|crucial|essential)\b/i.test(phrase)
    
    if (hasEmotionalWords || difficulty > 7) return 'high'
    if (difficulty > 5) return 'medium'
    return 'low'
  }

  private synthesizeContext(contexts: string[]): string {
    // Simple context synthesis
    if (contexts.length === 1) return 'specific scenario'
    if (contexts.length < 3) return 'limited contexts'
    return 'multiple contexts'
  }

  private synthesizeEmotionalWeight(weights: string[]): 'high' | 'medium' | 'low' {
    const weightScores = { high: 3, medium: 2, low: 1 }
    const totalScore = weights.reduce((sum, weight) => sum + weightScores[weight as keyof typeof weightScores], 0)
    const avgScore = totalScore / weights.length
    
    if (avgScore > 2.5) return 'high'
    if (avgScore > 1.5) return 'medium'
    return 'low'
  }

  private generateApplicationGuidance(phrase: string, contexts: string[]): string {
    // Generate practical guidance for using this authentic expression
    const lower = phrase.toLowerCase()
    
    if (lower.includes('important') || lower.includes('matter')) {
      return 'Use when highlighting core priorities and non-negotiable values'
    }
    if (lower.includes('consider') || lower.includes('think')) {
      return 'Use when emphasizing thoughtful deliberation and careful analysis'
    }
    if (lower.includes('ensure') || lower.includes('make sure')) {
      return 'Use when expressing commitment to specific outcomes or standards'
    }
    if (lower.includes('balance') || lower.includes('weigh')) {
      return 'Use when navigating competing priorities or complex tradeoffs'
    }
    
    return 'Use when expressing domain-specific values and decision-making approaches'
  }
}

export const domainExtractor = new DomainSpecificExtractor()