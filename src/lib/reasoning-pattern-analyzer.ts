/**
 * Reasoning Pattern Analyzer
 * 
 * Extracts authentic reasoning patterns from user responses to understand
 * HOW they think through ethical decisions, not just WHAT they choose.
 * 
 * Focus: Preserve authentic language while maintaining systematic discernment
 */

import { ResponsePattern, ReasoningPattern } from './context-aware-values-generator'

export interface AuthenticPhrase {
  phrase: string
  frequency: number
  contexts: string[]
  emotionalWeight: 'high' | 'medium' | 'low'
  valueIndicators: string[]
}

export interface ReasoningStructure {
  type: 'linear' | 'comparative' | 'conditional' | 'iterative' | 'holistic'
  markers: string[]
  complexity: number
  consistency: number
}

export interface DecisionApproach {
  primaryStyle: 'analytical' | 'intuitive' | 'collaborative' | 'principled' | 'contextual'
  secondaryStyles: string[]
  adaptability: number
  stakeholderOrientation: number
  timeHorizon: 'immediate' | 'short-term' | 'long-term' | 'generational'
}

/**
 * Analyzes reasoning patterns with focus on authentic expression
 * and practical application
 */
export class ReasoningPatternAnalyzer {

  /**
   * Extract reasoning patterns while preserving authentic language
   */
  analyzeReasoningPatterns(responses: ResponsePattern[]): ReasoningPattern[] {
    const patterns: ReasoningPattern[] = []
    
    // Group responses by similar reasoning structures
    const structureGroups = this.groupByReasoningStructure(responses)
    
    for (const [structure, groupedResponses] of structureGroups.entries()) {
      const pattern = this.extractPattern(structure, groupedResponses)
      if (pattern && pattern.consistency > 0.25) {
        patterns.push(pattern)
      }
    }
    
    return patterns.sort((a, b) => b.consistency - a.consistency)
  }

  /**
   * Group responses by actual reasoning structure rather than topic
   */
  private groupByReasoningStructure(responses: ResponsePattern[]): Map<string, ResponsePattern[]> {
    const groups = new Map<string, ResponsePattern[]>()
    
    responses.forEach(response => {
      if (!response.reasoning || response.reasoning.length < 20) return
      
      const structure = this.identifyReasoningStructure(response.reasoning)
      const key = this.getStructureKey(structure)
      
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(response)
    })
    
    return groups
  }

  /**
   * Identify how someone structures their reasoning
   */
  private identifyReasoningStructure(reasoning: string): ReasoningStructure {
    const text = reasoning.toLowerCase()
    
    // Linear reasoning: because, therefore, leads to, results in
    const linearMarkers = ['because', 'therefore', 'leads to', 'results in', 'causes', 'so']
    const linearScore = this.countMarkers(text, linearMarkers)
    
    // Comparative reasoning: versus, compared to, while, whereas, on the other hand
    const comparativeMarkers = ['versus', 'compared to', 'while', 'whereas', 'on the other hand', 'alternatively', 'in contrast']
    const comparativeScore = this.countMarkers(text, comparativeMarkers)
    
    // Conditional reasoning: if, then, when, unless, provided that
    const conditionalMarkers = ['if', 'then', 'when', 'unless', 'provided that', 'assuming', 'given that']
    const conditionalScore = this.countMarkers(text, conditionalMarkers)
    
    // Iterative reasoning: first, second, next, also, additionally, furthermore
    const iterativeMarkers = ['first', 'second', 'next', 'also', 'additionally', 'furthermore', 'moreover']
    const iterativeScore = this.countMarkers(text, iterativeMarkers)
    
    // Holistic reasoning: consider, balance, weigh, overall, context, nuanced
    const holisticMarkers = ['consider', 'balance', 'weigh', 'overall', 'context', 'nuanced', 'complex', 'multifaceted']
    const holisticScore = this.countMarkers(text, holisticMarkers)
    
    const scores = {
      linear: linearScore,
      comparative: comparativeScore,
      conditional: conditionalScore,
      iterative: iterativeScore,
      holistic: holisticScore
    }
    
    const dominantType = Object.entries(scores).reduce((max, current) => 
      current[1] > max[1] ? current : max
    )[0] as ReasoningStructure['type']
    
    const totalMarkers = Object.values(scores).reduce((sum, score) => sum + score, 0)
    const complexity = Math.min(5, totalMarkers) / 5
    
    return {
      type: dominantType,
      markers: this.extractRelevantMarkers(text, dominantType),
      complexity,
      consistency: this.calculateStructureConsistency(text, dominantType)
    }
  }

  private countMarkers(text: string, markers: string[]): number {
    return markers.reduce((count, marker) => {
      const regex = new RegExp(`\\b${marker}\\b`, 'gi')
      const matches = text.match(regex)
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  private extractRelevantMarkers(text: string, type: ReasoningStructure['type']): string[] {
    const markerSets = {
      linear: ['because', 'therefore', 'leads to', 'results in'],
      comparative: ['versus', 'while', 'whereas', 'on the other hand'],
      conditional: ['if', 'then', 'when', 'unless'],
      iterative: ['first', 'second', 'also', 'additionally'],
      holistic: ['consider', 'balance', 'weigh', 'context']
    }
    
    const relevantMarkers = markerSets[type] || []
    return relevantMarkers.filter(marker => text.includes(marker))
  }

  private calculateStructureConsistency(text: string, type: ReasoningStructure['type']): number {
    // Measure how consistently the reasoning follows the identified structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length < 2) return 0.5
    
    const structureScore = sentences.reduce((score, sentence) => {
      return score + (this.sentenceMatchesStructure(sentence, type) ? 1 : 0)
    }, 0)
    
    return structureScore / sentences.length
  }

  private sentenceMatchesStructure(sentence: string, type: ReasoningStructure['type']): boolean {
    const lowerSentence = sentence.toLowerCase()
    
    switch (type) {
      case 'linear':
        return /\b(because|therefore|leads to|results in|causes|so)\b/.test(lowerSentence)
      case 'comparative':
        return /\b(versus|while|whereas|compared|contrast|alternative)\b/.test(lowerSentence)
      case 'conditional':
        return /\b(if|then|when|unless|provided|assuming)\b/.test(lowerSentence)
      case 'iterative':
        return /\b(first|second|next|also|additionally|furthermore)\b/.test(lowerSentence)
      case 'holistic':
        return /\b(consider|balance|weigh|context|overall|nuanced)\b/.test(lowerSentence)
      default:
        return false
    }
  }

  private getStructureKey(structure: ReasoningStructure): string {
    return `${structure.type}_${Math.round(structure.complexity * 5)}`
  }

  /**
   * Extract pattern from grouped responses with authentic language preservation
   */
  private extractPattern(structureKey: string, responses: ResponsePattern[]): ReasoningPattern | null {
    if (responses.length < 2) return null
    
    const [type, complexityStr] = structureKey.split('_')
    const avgComplexity = parseInt(complexityStr) / 5
    
    // Extract authentic phrases used consistently across responses
    const authenticPhrases = this.extractAuthenticPhrases(responses)
    
    // Identify decision triggers (what situations activate this pattern)
    const triggers = this.extractDecisionTriggers(responses)
    
    // Calculate pattern consistency across different contexts
    const consistency = this.calculatePatternConsistency(responses)
    
    // Extract domains where this pattern appears
    const domains = [...new Set(responses.map(r => r.domain || 'general'))]
    
    return {
      id: `${type}_reasoning_${Date.now()}`,
      name: this.generatePatternName(type as ReasoningStructure['type'], avgComplexity, authenticPhrases),
      description: this.generateAuthenticDescription(type as ReasoningStructure['type'], authenticPhrases, triggers),
      indicators: {
        linguistic: authenticPhrases.slice(0, 5).map(p => p.phrase),
        structural: [`${type} reasoning structure`, `complexity level: ${avgComplexity.toFixed(1)}`],
        contextual: triggers.situationalFactors
      },
      consistency,
      domains,
      triggers: {
        stakeholders: triggers.stakeholders,
        constraints: triggers.constraints,
        values: triggers.coreValues
      }
    }
  }

  /**
   * Extract phrases that appear consistently across responses
   */
  private extractAuthenticPhrases(responses: ResponsePattern[]): AuthenticPhrase[] {
    const phraseCounts = new Map<string, { count: number, contexts: Set<string>, responses: ResponsePattern[] }>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      // Extract 2-4 word phrases that might indicate value-driven language
      const phrases = this.extractValuePhrases(response.reasoning)
      
      phrases.forEach(phrase => {
        if (!phraseCounts.has(phrase)) {
          phraseCounts.set(phrase, { count: 0, contexts: new Set(), responses: [] })
        }
        const data = phraseCounts.get(phrase)!
        data.count++
        data.contexts.add(response.domain || 'general')
        data.responses.push(response)
      })
    })
    
    // Filter for phrases that appear in multiple responses
    return Array.from(phraseCounts.entries())
      .filter(([phrase, data]) => data.count > 1 && phrase.length > 5)
      .map(([phrase, data]) => ({
        phrase,
        frequency: data.count,
        contexts: Array.from(data.contexts),
        emotionalWeight: this.assessEmotionalWeight(phrase, data.responses),
        valueIndicators: this.extractValueIndicators(phrase)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
  }

  private extractValuePhrases(text: string): string[] {
    // Look for phrases that indicate values, not just descriptive text
    const valueWords = [
      'important', 'matter', 'care', 'believe', 'feel', 'value', 'priority', 'essential',
      'right', 'wrong', 'should', 'must', 'need', 'responsibility', 'duty', 'obligation',
      'respect', 'dignity', 'fairness', 'justice', 'honesty', 'integrity', 'trust',
      'safety', 'security', 'protection', 'harm', 'benefit', 'help', 'support'
    ]
    
    const phrases: string[] = []
    const words = text.toLowerCase().split(/\s+/)
    
    for (let i = 0; i < words.length - 2; i++) {
      const phrase2 = `${words[i]} ${words[i + 1]}`
      const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
      
      // Include phrases that contain value-indicating words
      if (valueWords.some(vw => phrase3.includes(vw))) {
        phrases.push(phrase3)
      } else if (valueWords.some(vw => phrase2.includes(vw))) {
        phrases.push(phrase2)
      }
    }
    
    return phrases.filter(p => p.length > 5 && p.length < 30)
  }

  private assessEmotionalWeight(phrase: string, responses: ResponsePattern[]): 'high' | 'medium' | 'low' {
    const emotionalWords = ['deeply', 'strongly', 'absolutely', 'crucial', 'essential', 'fundamental', 'critical']
    const hasEmotionalWords = emotionalWords.some(word => phrase.includes(word))
    
    // Also consider if this phrase appears in high-difficulty responses
    const avgDifficulty = responses.reduce((sum, r) => sum + (r.difficulty || 5), 0) / responses.length
    
    if (hasEmotionalWords || avgDifficulty > 7) return 'high'
    if (avgDifficulty > 5) return 'medium'
    return 'low'
  }

  private extractValueIndicators(phrase: string): string[] {
    const valueMap = {
      'fairness': ['fair', 'equal', 'justice', 'equitable'],
      'honesty': ['honest', 'truth', 'transparent', 'open'],
      'respect': ['respect', 'dignity', 'worth', 'value'],
      'safety': ['safe', 'secure', 'protect', 'harm'],
      'responsibility': ['responsible', 'accountable', 'duty', 'obligation'],
      'compassion': ['care', 'compassion', 'empathy', 'concern'],
      'autonomy': ['choice', 'freedom', 'independence', 'self-determination']
    }
    
    const indicators: string[] = []
    for (const [value, keywords] of Object.entries(valueMap)) {
      if (keywords.some(keyword => phrase.includes(keyword))) {
        indicators.push(value)
      }
    }
    
    return indicators
  }

  private extractDecisionTriggers(responses: ResponsePattern[]): {
    stakeholders: string[]
    constraints: string[]
    coreValues: string[]
    situationalFactors: string[]
  } {
    const stakeholders = new Set<string>()
    const constraints = new Set<string>()
    const coreValues = new Set<string>()
    const situationalFactors = new Set<string>()
    
    responses.forEach(response => {
      if (!response.reasoning) return
      
      const text = response.reasoning.toLowerCase()
      
      // Extract stakeholder mentions
      this.extractStakeholders(text).forEach(s => stakeholders.add(s))
      
      // Extract constraints
      this.extractConstraints(text).forEach(c => constraints.add(c))
      
      // Extract core values
      this.extractCoreValues(text).forEach(v => coreValues.add(v))
      
      // Extract situational factors
      this.extractSituationalFactors(text).forEach(f => situationalFactors.add(f))
    })
    
    return {
      stakeholders: Array.from(stakeholders),
      constraints: Array.from(constraints),
      coreValues: Array.from(coreValues),
      situationalFactors: Array.from(situationalFactors)
    }
  }

  private extractStakeholders(text: string): string[] {
    const stakeholderPatterns = [
      { pattern: /\b(family|families|relatives|children|parents|spouse)\b/, group: 'family' },
      { pattern: /\b(employee|employees|worker|workers|colleague|team|staff)\b/, group: 'workplace' },
      { pattern: /\b(customer|customers|client|clients|consumer)\b/, group: 'customers' },
      { pattern: /\b(public|society|community|people|citizens)\b/, group: 'public' },
      { pattern: /\b(friend|friends|peer|peers|relationship)\b/, group: 'personal_network' },
      { pattern: /\b(shareholder|investor|stakeholder|owner)\b/, group: 'business_stakeholders' }
    ]
    
    const found: string[] = []
    stakeholderPatterns.forEach(({ pattern, group }) => {
      if (pattern.test(text)) {
        found.push(group)
      }
    })
    
    return found
  }

  private extractConstraints(text: string): string[] {
    const constraintPatterns = [
      { pattern: /\b(time|urgent|deadline|quickly|immediate)\b/, constraint: 'time_pressure' },
      { pattern: /\b(budget|cost|money|expensive|resource|limited)\b/, constraint: 'resource_constraints' },
      { pattern: /\b(legal|law|regulation|compliance|rule)\b/, constraint: 'legal_requirements' },
      { pattern: /\b(risk|danger|safety|security|threat)\b/, constraint: 'safety_concerns' },
      { pattern: /\b(reputation|image|public|perception)\b/, constraint: 'reputational_risk' },
      { pattern: /\b(confidential|private|secret|sensitive)\b/, constraint: 'confidentiality' }
    ]
    
    const found: string[] = []
    constraintPatterns.forEach(({ pattern, constraint }) => {
      if (pattern.test(text)) {
        found.push(constraint)
      }
    })
    
    return found
  }

  private extractCoreValues(text: string): string[] {
    const valuePatterns = [
      { pattern: /\b(honest|truth|transparent|truthful)\b/, value: 'honesty' },
      { pattern: /\b(fair|equal|justice|equitable)\b/, value: 'fairness' },
      { pattern: /\b(respect|dignity|worth|value)\b/, value: 'respect' },
      { pattern: /\b(responsible|accountable|duty|obligation)\b/, value: 'responsibility' },
      { pattern: /\b(care|compassion|empathy|concern)\b/, value: 'compassion' },
      { pattern: /\b(loyal|loyalty|faithful|committed)\b/, value: 'loyalty' },
      { pattern: /\b(efficient|effective|productive|optimize)\b/, value: 'efficiency' },
      { pattern: /\b(innovative|creative|new|change|improve)\b/, value: 'innovation' }
    ]
    
    const found: string[] = []
    valuePatterns.forEach(({ pattern, value }) => {
      if (pattern.test(text)) {
        found.push(value)
      }
    })
    
    return found
  }

  private extractSituationalFactors(text: string): string[] {
    const factorPatterns = [
      { pattern: /\b(emergency|crisis|urgent|critical)\b/, factor: 'crisis_situations' },
      { pattern: /\b(routine|normal|everyday|regular)\b/, factor: 'routine_decisions' },
      { pattern: /\b(complex|complicated|difficult|challenging)\b/, factor: 'complex_scenarios' },
      { pattern: /\b(public|visible|open|transparent)\b/, factor: 'public_visibility' },
      { pattern: /\b(private|personal|internal|confidential)\b/, factor: 'private_context' },
      { pattern: /\b(long.term|future|permanent|lasting)\b/, factor: 'long_term_impact' },
      { pattern: /\b(short.term|immediate|temporary|quick)\b/, factor: 'immediate_impact' }
    ]
    
    const found: string[] = []
    factorPatterns.forEach(({ pattern, factor }) => {
      if (pattern.test(text)) {
        found.push(factor)
      }
    })
    
    return found
  }

  private calculatePatternConsistency(responses: ResponsePattern[]): number {
    if (responses.length < 2) return 0.5
    
    // Measure consistency across different difficulty levels and domains
    const difficulties = responses.map(r => r.difficulty || 5)
    const domains = [...new Set(responses.map(r => r.domain || 'general'))]
    
    // Higher consistency if pattern appears across various contexts
    const difficultySpread = Math.max(difficulties) - Math.min(difficulties)
    const domainDiversity = domains.length
    
    // Base consistency on how well the pattern holds across different scenarios
    const baseConsistency = responses.length / 10 // More responses = higher confidence
    const contextDiversity = (difficultySpread / 10 + domainDiversity / 5) * 0.3
    
    return Math.min(1.0, baseConsistency + contextDiversity + 0.3)
  }

  private generatePatternName(type: ReasoningStructure['type'], complexity: number, phrases: AuthenticPhrase[]): string {
    const typeNames = {
      linear: 'Causal Reasoning',
      comparative: 'Comparative Analysis',
      conditional: 'Scenario-Based Thinking',
      iterative: 'Systematic Evaluation',
      holistic: 'Contextual Integration'
    }
    
    const baseName = typeNames[type] || 'Decision Pattern'
    
    // Add authentic qualifier if we have strong phrase indicators
    if (phrases.length > 0 && phrases[0].frequency > 2) {
      const dominantTheme = this.extractThemeFromPhrases(phrases)
      if (dominantTheme) {
        return `${dominantTheme}-Focused ${baseName}`
      }
    }
    
    return baseName
  }

  private extractThemeFromPhrases(phrases: AuthenticPhrase[]): string | null {
    const themeWords = {
      'stakeholder': ['people', 'person', 'individual', 'family', 'team', 'community'],
      'outcome': ['result', 'consequence', 'impact', 'effect', 'outcome', 'benefit'],
      'principle': ['right', 'wrong', 'should', 'rule', 'principle', 'ethical'],
      'process': ['fair', 'process', 'systematic', 'consistent', 'transparent'],
      'pragmatic': ['practical', 'realistic', 'feasible', 'workable', 'effective']
    }
    
    for (const [theme, words] of Object.entries(themeWords)) {
      const score = phrases.reduce((count, phrase) => {
        return count + words.reduce((wordCount, word) => {
          return wordCount + (phrase.phrase.includes(word) ? 1 : 0)
        }, 0)
      }, 0)
      
      if (score > 2) {
        return theme.charAt(0).toUpperCase() + theme.slice(1)
      }
    }
    
    return null
  }

  private generateAuthenticDescription(
    type: ReasoningStructure['type'], 
    phrases: AuthenticPhrase[], 
    triggers: any
  ): string {
    const structureDescriptions = {
      linear: 'I think through decisions by identifying clear cause-and-effect relationships',
      comparative: 'I evaluate options by systematically comparing their merits and drawbacks',
      conditional: 'I consider various scenarios and their potential outcomes when deciding',
      iterative: 'I work through decisions step-by-step, building on each consideration',
      holistic: 'I integrate multiple perspectives and contextual factors in my decision-making'
    }
    
    let description = structureDescriptions[type] || 'I approach decisions systematically'
    
    // Add authentic language if we have consistent phrases
    if (phrases.length > 0) {
      const topPhrase = phrases[0]
      if (topPhrase.frequency > 2) {
        description += `, often considering "${topPhrase.phrase}"`
      }
    }
    
    // Add trigger context if clear
    if (triggers.coreValues.length > 0) {
      description += `. This pattern emerges especially when ${triggers.coreValues[0]} is at stake`
    }
    
    return description + '.'
  }
}

export const reasoningAnalyzer = new ReasoningPatternAnalyzer()