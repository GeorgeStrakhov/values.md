/**
 * Ethical Tactic Discovery Engine
 * 
 * Algorithmic flow that picks apart responses and finds coherent ethical tactics
 */

export interface EthicalTactic {
  name: string;
  description: string;
  patterns: string[];
  indicators: string[];
  confidence: number;
  evidenceRequired: number;
  framework: 'consequentialist' | 'deontological' | 'virtue' | 'care' | 'pragmatic' | 'integrative';
}

export interface TacticEvidence {
  response: {
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
  };
  confidence: number;
  context: string;
  matchedPatterns: string[];
}

export interface CoherentTacticSet {
  primary: CoherentTactic[];
  secondary: CoherentTactic[];
  contextual: Record<string, CoherentTactic[]>;
  metaTactics: MetaTactic[];
}

export interface CoherentTactic {
  name: string;
  description: string;
  strength: number;
  consistency: number;
  contexts: string[];
  evidence: TacticEvidence[];
  aiGuidance: string;
}

export interface MetaTactic {
  name: string;
  description: string;
  integrationStyle: string;
  tacticInteractions: string[];
  aiGuidance: string;
}

export interface TacticIntegration {
  combinationPatterns: string[];
  switchingLogic: string[];
  metaStrategies: string[];
  integrationStyle: 'hierarchical' | 'dialectical' | 'contextual' | 'pluralistic';
}

export class EthicalTacticDiscovery {
  private tacticDefinitions: EthicalTactic[] = [
    // CONSEQUENTIALIST TACTICS
    {
      name: 'utilitarian_maximization',
      description: 'Focuses on maximizing overall welfare and aggregate outcomes',
      patterns: [
        'maximiz(e|ing)',
        'greatest (good|benefit|number)',
        'overall (welfare|utility|well-being)',
        'aggregate',
        'total (benefit|harm)',
        'most people',
        'sum total'
      ],
      indicators: ['outcome-focused', 'aggregate-welfare', 'cost-benefit'],
      confidence: 0,
      evidenceRequired: 2,
      framework: 'consequentialist'
    },
    {
      name: 'harm_minimization',
      description: 'Prioritizes reducing suffering and preventing negative outcomes',
      patterns: [
        'minimize harm',
        'prevent (suffering|damage)',
        'reduce (pain|negative)',
        'least harm',
        'avoid (hurt|injury)',
        'damage control'
      ],
      indicators: ['harm-focused', 'prevention-oriented', 'risk-averse'],
      confidence: 0,
      evidenceRequired: 2,
      framework: 'consequentialist'
    },
    
    // DEONTOLOGICAL TACTICS
    {
      name: 'duty_based_reasoning',
      description: 'Applies universal principles and moral duties regardless of consequences',
      patterns: [
        'duty',
        'obligation',
        'categorical',
        'regardless of',
        'must (always|never)',
        'moral (law|rule)',
        'universal principle'
      ],
      indicators: ['rule-based', 'universal-principles', 'duty-focused'],
      confidence: 0,
      evidenceRequired: 2,
      framework: 'deontological'
    },
    {
      name: 'rights_protection',
      description: 'Emphasizes individual rights and dignity as inviolable',
      patterns: [
        'individual rights',
        'human dignity',
        'respect for persons',
        'inviolable',
        'inherent worth',
        'treat as ends',
        'fundamental rights'
      ],
      indicators: ['rights-focused', 'dignity-centered', 'individual-protection'],
      confidence: 0,
      evidenceRequired: 2,
      framework: 'deontological'
    },
    
    // VIRTUE ETHICS TACTICS
    {
      name: 'character_focus',
      description: 'Evaluates actions based on virtues and character traits',
      patterns: [
        'virtue(s|ous)',
        'character',
        'integrity',
        'courage',
        'compassion',
        'wisdom',
        'what would a (good|virtuous) person do'
      ],
      indicators: ['character-based', 'virtue-centered', 'excellence-focused'],
      confidence: 0,
      evidenceRequired: 2,
      framework: 'virtue'
    },
    
    // CARE ETHICS TACTICS
    {
      name: 'relational_focus',
      description: 'Emphasizes relationships, context, and particular care',
      patterns: [
        'relationship(s)',
        'care for',
        'particular (case|person)',
        'context matters',
        'specific situation',
        'connection',
        'responsibility to'
      ],
      indicators: ['relationship-focused', 'context-sensitive', 'care-oriented'],
      confidence: 0,
      evidenceRequired: 2,
      framework: 'care'
    },
    
    // INTEGRATIVE TACTICS
    {
      name: 'multi_framework_integration',
      description: 'Explicitly considers multiple ethical frameworks together',
      patterns: [
        'on one hand.*on the other hand',
        'both.*and',
        'competing (demands|values)',
        'balance between',
        'multiple perspectives',
        'various considerations',
        'different frameworks'
      ],
      indicators: ['multi-framework', 'integrative', 'complex-thinking'],
      confidence: 0,
      evidenceRequired: 1,
      framework: 'integrative'
    },
    {
      name: 'value_conflict_recognition',
      description: 'Acknowledges and works with conflicting moral values',
      patterns: [
        'conflict between',
        'tension between',
        'competing values',
        'trade-off',
        'difficult choice',
        'moral dilemma',
        'no easy answer'
      ],
      indicators: ['conflict-aware', 'complexity-comfort', 'nuanced-thinking'],
      confidence: 0,
      evidenceRequired: 1,
      framework: 'integrative'
    },
    
    // PRAGMATIC TACTICS
    {
      name: 'contextual_adaptation',
      description: 'Adapts ethical reasoning based on specific circumstances',
      patterns: [
        'in this (case|situation)',
        'given the circumstances',
        'context specific',
        'depends on',
        'situation calls for',
        'practical considerations'
      ],
      indicators: ['context-dependent', 'situational', 'adaptive'],
      confidence: 0,
      evidenceRequired: 2,
      framework: 'pragmatic'
    }
  ];

  /**
   * PHASE 1: RESPONSE DECOMPOSITION
   */
  private decomposeResponse(response: {
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
  }): {
    semanticUnits: string[];
    argumentStructure: string[];
    keyPhrases: string[];
    ethicalTerms: string[];
  } {
    const reasoning = response.reasoning;
    
    // Split into semantic units (sentences)
    const semanticUnits = reasoning.split(/[.!?]+/)
      .map(unit => unit.trim())
      .filter(unit => unit.length > 0);
    
    // Extract argument structure (simplified)
    const argumentStructure = this.extractArgumentStructure(reasoning);
    
    // Extract key phrases
    const keyPhrases = this.extractKeyPhrases(reasoning);
    
    // Extract ethical terminology
    const ethicalTerms = this.extractEthicalTerms(reasoning);
    
    return {
      semanticUnits,
      argumentStructure,
      keyPhrases,
      ethicalTerms
    };
  }

  /**
   * PHASE 2: TACTIC IDENTIFICATION
   */
  identifyTactics(response: {
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
  }): TacticEvidence[] {
    const decomposed = this.decomposeResponse(response);
    const evidence: TacticEvidence[] = [];
    
    this.tacticDefinitions.forEach(tactic => {
      const matchedPatterns = this.matchPatterns(response.reasoning, tactic.patterns);
      
      if (matchedPatterns.length >= tactic.evidenceRequired) {
        const confidence = this.calculateTacticConfidence(
          response.reasoning,
          tactic,
          matchedPatterns
        );
        
        evidence.push({
          response,
          confidence,
          context: response.domain,
          matchedPatterns
        });
      }
    });
    
    return evidence;
  }

  /**
   * PHASE 3: COHERENCE ANALYSIS
   */
  findCoherentTactics(responses: Array<{
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
  }>): CoherentTacticSet {
    const tacticOccurrences = new Map<string, TacticEvidence[]>();
    
    // Collect all tactic evidence across responses
    responses.forEach(response => {
      const evidence = this.identifyTactics(response);
      evidence.forEach(tacticEvidence => {
        const tacticName = this.getTacticNameFromEvidence(tacticEvidence);
        if (!tacticOccurrences.has(tacticName)) {
          tacticOccurrences.set(tacticName, []);
        }
        tacticOccurrences.get(tacticName)!.push(tacticEvidence);
      });
    });
    
    // Filter for coherent tactics
    const coherentTactics = Array.from(tacticOccurrences.entries())
      .map(([name, evidence]) => {
        const tactic = this.tacticDefinitions.find(t => t.name === name);
        if (!tactic) return null;
        
        const strength = evidence.length / responses.length;
        const avgConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;
        const consistency = this.calculateConsistency(evidence);
        
        return {
          name,
          description: tactic.description,
          strength,
          consistency,
          contexts: evidence.map(e => e.context),
          evidence,
          aiGuidance: this.generateAIGuidance(tactic, evidence)
        };
      })
      .filter(t => t !== null && t.strength >= 0.2 && t.consistency >= 0.5) as CoherentTactic[];
    
    // Classify by strength
    const primary = coherentTactics.filter(t => t.strength >= 0.6);
    const secondary = coherentTactics.filter(t => t.strength >= 0.3 && t.strength < 0.6);
    const contextual = this.groupByContext(coherentTactics);
    const metaTactics = this.identifyMetaTactics(coherentTactics);
    
    return {
      primary,
      secondary,
      contextual,
      metaTactics
    };
  }

  /**
   * PHASE 4: HIERARCHICAL ORGANIZATION
   */
  analyzeTacticIntegration(tacticSet: CoherentTacticSet): TacticIntegration {
    const combinations = this.findTacticCombinations(tacticSet);
    const switchingPatterns = this.findSwitchingPatterns(tacticSet);
    const metaStrategies = this.detectMetaStrategies(tacticSet);
    const integrationStyle = this.classifyIntegrationStyle(combinations, switchingPatterns);
    
    return {
      combinationPatterns: combinations,
      switchingLogic: switchingPatterns,
      metaStrategies,
      integrationStyle
    };
  }

  // Helper methods

  private matchPatterns(text: string, patterns: string[]): string[] {
    const matched: string[] = [];
    const lowerText = text.toLowerCase();
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        matched.push(pattern);
      }
    });
    
    return matched;
  }

  private calculateTacticConfidence(
    reasoning: string,
    tactic: EthicalTactic,
    matchedPatterns: string[]
  ): number {
    const patternStrength = matchedPatterns.length / tactic.patterns.length;
    const textLength = reasoning.length;
    const densityBonus = textLength > 100 ? 0.1 : 0;
    
    return Math.min(0.9, patternStrength * 0.8 + densityBonus);
  }

  private getTacticNameFromEvidence(evidence: TacticEvidence): string {
    // Find which tactic this evidence corresponds to
    for (const tactic of this.tacticDefinitions) {
      const matches = this.matchPatterns(evidence.response.reasoning, tactic.patterns);
      if (matches.length >= tactic.evidenceRequired) {
        return tactic.name;
      }
    }
    return 'unknown';
  }

  private calculateConsistency(evidence: TacticEvidence[]): number {
    if (evidence.length <= 1) return 1.0;
    
    const confidences = evidence.map(e => e.confidence);
    const mean = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    
    return Math.max(0, 1 - Math.sqrt(variance));
  }

  private groupByContext(tactics: CoherentTactic[]): Record<string, CoherentTactic[]> {
    const grouped: Record<string, CoherentTactic[]> = {};
    
    tactics.forEach(tactic => {
      tactic.contexts.forEach(context => {
        if (!grouped[context]) {
          grouped[context] = [];
        }
        if (!grouped[context].find(t => t.name === tactic.name)) {
          grouped[context].push(tactic);
        }
      });
    });
    
    return grouped;
  }

  private identifyMetaTactics(tactics: CoherentTactic[]): MetaTactic[] {
    const metaTactics: MetaTactic[] = [];
    
    // Check for integrative thinking
    const integrativeTactics = tactics.filter(t => 
      t.name === 'multi_framework_integration' || 
      t.name === 'value_conflict_recognition'
    );
    
    if (integrativeTactics.length > 0) {
      metaTactics.push({
        name: 'integrative_thinking',
        description: 'Comfortable with moral complexity and multiple perspectives',
        integrationStyle: 'dialectical',
        tacticInteractions: integrativeTactics.map(t => t.name),
        aiGuidance: 'Present multiple ethical perspectives and help work through tensions rather than providing simple answers'
      });
    }
    
    // Check for consistent framework preference
    const frameworkCounts = new Map<string, number>();
    tactics.forEach(tactic => {
      const tacticDef = this.tacticDefinitions.find(t => t.name === tactic.name);
      if (tacticDef) {
        frameworkCounts.set(tacticDef.framework, (frameworkCounts.get(tacticDef.framework) || 0) + 1);
      }
    });
    
    const dominantFramework = Array.from(frameworkCounts.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantFramework && dominantFramework[1] >= 2) {
      metaTactics.push({
        name: 'framework_preference',
        description: `Strong preference for ${dominantFramework[0]} ethical reasoning`,
        integrationStyle: 'hierarchical',
        tacticInteractions: tactics.filter(t => {
          const def = this.tacticDefinitions.find(td => td.name === t.name);
          return def && def.framework === dominantFramework[0];
        }).map(t => t.name),
        aiGuidance: `Emphasize ${dominantFramework[0]} considerations in ethical recommendations`
      });
    }
    
    return metaTactics;
  }

  private generateAIGuidance(tactic: EthicalTactic, evidence: TacticEvidence[]): string {
    const guidance = {
      'utilitarian_maximization': 'Provide quantitative analysis of outcomes and aggregate welfare calculations',
      'harm_minimization': 'Focus on identifying and preventing potential harms and negative consequences',
      'duty_based_reasoning': 'Reference universal principles and moral duties that apply regardless of consequences',
      'rights_protection': 'Emphasize individual rights and dignity as foundational constraints',
      'character_focus': 'Consider what virtues and character traits are relevant to the situation',
      'relational_focus': 'Account for relationships, context, and particular care responsibilities',
      'multi_framework_integration': 'Present multiple ethical perspectives and help integrate them thoughtfully',
      'value_conflict_recognition': 'Acknowledge moral tensions and help navigate competing values',
      'contextual_adaptation': 'Provide situation-specific guidance that adapts to particular circumstances'
    };
    
    return guidance[tactic.name] || 'Apply ethical reasoning appropriate to the specific context';
  }

  private extractArgumentStructure(reasoning: string): string[] {
    // Simplified argument structure extraction
    const sentences = reasoning.split(/[.!?]+/);
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }

  private extractKeyPhrases(reasoning: string): string[] {
    // Extract phrases that indicate ethical reasoning
    const keyPhrasePatterns = [
      /on one hand.*on the other hand/i,
      /it is important to/i,
      /we must consider/i,
      /the right thing to do/i,
      /from an ethical standpoint/i
    ];
    
    const phrases: string[] = [];
    keyPhrasePatterns.forEach(pattern => {
      const match = reasoning.match(pattern);
      if (match) {
        phrases.push(match[0]);
      }
    });
    
    return phrases;
  }

  private extractEthicalTerms(reasoning: string): string[] {
    const ethicalTerms = [
      'ethics', 'moral', 'right', 'wrong', 'duty', 'obligation',
      'virtue', 'character', 'consequence', 'outcome', 'harm',
      'benefit', 'justice', 'fairness', 'rights', 'dignity'
    ];
    
    const found: string[] = [];
    const lowerReasoning = reasoning.toLowerCase();
    
    ethicalTerms.forEach(term => {
      if (lowerReasoning.includes(term)) {
        found.push(term);
      }
    });
    
    return found;
  }

  private findTacticCombinations(tacticSet: CoherentTacticSet): string[] {
    const combinations: string[] = [];
    
    // Look for common combinations
    if (tacticSet.primary.find(t => t.name === 'utilitarian_maximization') &&
        tacticSet.primary.find(t => t.name === 'rights_protection')) {
      combinations.push('Utilitarian-Rights Integration: Balances aggregate welfare with individual rights');
    }
    
    if (tacticSet.primary.find(t => t.name === 'multi_framework_integration')) {
      combinations.push('Multi-Framework Integration: Actively combines different ethical approaches');
    }
    
    return combinations;
  }

  private findSwitchingPatterns(tacticSet: CoherentTacticSet): string[] {
    const patterns: string[] = [];
    
    // Analyze context-based switching
    const contextualTactics = tacticSet.contextual;
    Object.keys(contextualTactics).forEach(context => {
      const contextTactics = contextualTactics[context];
      if (contextTactics.length > 1) {
        patterns.push(`In ${context} contexts: Uses ${contextTactics.map(t => t.name).join(', ')}`);
      }
    });
    
    return patterns;
  }

  private detectMetaStrategies(tacticSet: CoherentTacticSet): string[] {
    const strategies: string[] = [];
    
    if (tacticSet.metaTactics.find(mt => mt.name === 'integrative_thinking')) {
      strategies.push('Dialectical Integration: Comfortable with moral complexity and competing values');
    }
    
    if (tacticSet.primary.length > 2) {
      strategies.push('Pluralistic Approach: Uses multiple ethical tactics flexibly');
    }
    
    return strategies;
  }

  private classifyIntegrationStyle(
    combinations: string[],
    switchingPatterns: string[]
  ): 'hierarchical' | 'dialectical' | 'contextual' | 'pluralistic' {
    if (combinations.some(c => c.includes('Integration'))) {
      return 'dialectical';
    }
    
    if (switchingPatterns.length > 2) {
      return 'contextual';
    }
    
    if (combinations.length > 1) {
      return 'pluralistic';
    }
    
    return 'hierarchical';
  }
}

export const ethicalTacticDiscovery = new EthicalTacticDiscovery();