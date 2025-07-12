/**
 * Value Conflict Resolution Analyzer
 * 
 * Detects and analyzes how users resolve conflicts between competing ethical tactics
 */

import { CoherentTacticSet, TacticEvidence } from './ethical-tactic-discovery';

export interface ValueConflict {
  conflictType: 'utilitarian_vs_rights' | 'duty_vs_consequences' | 'individual_vs_collective' | 'present_vs_future' | 'care_vs_justice';
  tactics: string[]; // Which tactics are in conflict
  intensity: number; // How strong the conflict is (0-1)
  context: string; // Where the conflict appears
  evidence: TacticEvidence[];
}

export interface ResolutionStrategy {
  strategyType: 'prioritization' | 'synthesis' | 'contextual_switching' | 'compromise' | 'reframing';
  description: string;
  indicators: string[]; // Linguistic patterns that indicate this strategy
  effectiveness: number; // How consistently this strategy is used
  contexts: string[]; // When this strategy is employed
}

export interface ConflictResolutionProfile {
  detectedConflicts: ValueConflict[];
  resolutionStrategies: ResolutionStrategy[];
  consistencyScore: number; // How consistent the person is in their resolution approach
  metaStrategy: string; // Overall approach to handling conflicts
  growthAreas: string[]; // Suggestions for development
}

export class ValueConflictAnalyzer {
  
  private conflictPatterns = {
    'utilitarian_vs_rights': {
      indicators: [
        'but individual rights',
        'however, we must respect',
        'greatest good, but',
        'overall benefit vs',
        'collective welfare, yet',
        'even if it helps more people'
      ],
      tactics: ['utilitarian_maximization', 'rights_protection']
    },
    'duty_vs_consequences': {
      indicators: [
        'regardless of outcome',
        'even if it leads to',
        'duty requires, although',
        'principle matters more than',
        'right thing even if',
        'consequences aside'
      ],
      tactics: ['duty_based_reasoning', 'utilitarian_maximization', 'harm_minimization']
    },
    'individual_vs_collective': {
      indicators: [
        'personal vs societal',
        'individual needs vs',
        'society benefits but',
        'personal cost for',
        'collective good vs personal',
        'individual sacrifice'
      ],
      tactics: ['utilitarian_maximization', 'rights_protection', 'relational_focus']
    },
    'present_vs_future': {
      indicators: [
        'immediate vs long-term',
        'now vs later',
        'short-term cost',
        'future generations',
        'present suffering vs',
        'today vs tomorrow'
      ],
      tactics: ['utilitarian_maximization', 'harm_minimization']
    },
    'care_vs_justice': {
      indicators: [
        'care for specific vs',
        'particular relationship vs',
        'fairness vs caring',
        'justice demands vs',
        'impartial vs personal',
        'universal vs particular'
      ],
      tactics: ['relational_focus', 'duty_based_reasoning', 'rights_protection']
    }
  };

  private resolutionPatterns = {
    'prioritization': {
      indicators: [
        'more important than',
        'takes precedence',
        'first priority',
        'must come before',
        'overrides',
        'primary consideration'
      ],
      description: 'Clear hierarchy - one value consistently trumps others'
    },
    'synthesis': {
      indicators: [
        'both.*and',
        'combines',
        'integrates',
        'balance between',
        'way to honor both',
        'middle path',
        'synthesis of'
      ],
      description: 'Creates new solutions that honor multiple values'
    },
    'contextual_switching': {
      indicators: [
        'depends on',
        'in this case',
        'given the situation',
        'context matters',
        'different circumstances',
        'situation calls for'
      ],
      description: 'Different values apply in different contexts'
    },
    'compromise': {
      indicators: [
        'trade-off',
        'give up some',
        'partially satisfy',
        'meet halfway',
        'split the difference',
        'acceptable loss'
      ],
      description: 'Accepts partial satisfaction of competing values'
    },
    'reframing': {
      indicators: [
        'actually',
        'really about',
        'fundamental issue',
        'deeper question',
        'reframe',
        'different way to see'
      ],
      description: 'Reconstructs the problem to dissolve apparent conflicts'
    }
  };

  analyzeConflictResolution(
    discoveredTactics: CoherentTacticSet,
    responses: Array<{
      reasoning: string;
      choice: string;
      domain: string;
      difficulty: number;
    }>
  ): ConflictResolutionProfile {
    
    // Step 1: Detect conflicts in reasoning
    const detectedConflicts = this.detectConflicts(responses, discoveredTactics);
    
    // Step 2: Analyze resolution strategies
    const resolutionStrategies = this.analyzeResolutionStrategies(responses, detectedConflicts);
    
    // Step 3: Calculate consistency
    const consistencyScore = this.calculateConsistency(resolutionStrategies);
    
    // Step 4: Determine meta-strategy
    const metaStrategy = this.determineMetaStrategy(resolutionStrategies);
    
    // Step 5: Generate growth suggestions
    const growthAreas = this.generateGrowthSuggestions(detectedConflicts, resolutionStrategies);

    return {
      detectedConflicts,
      resolutionStrategies,
      consistencyScore,
      metaStrategy,
      growthAreas
    };
  }

  private detectConflicts(
    responses: Array<{ reasoning: string; choice: string; domain: string; difficulty: number }>,
    discoveredTactics: CoherentTacticSet
  ): ValueConflict[] {
    const conflicts: ValueConflict[] = [];
    const allTactics = [...discoveredTactics.primary, ...discoveredTactics.secondary];

    responses.forEach((response, responseIndex) => {
      Object.entries(this.conflictPatterns).forEach(([conflictType, pattern]) => {
        const conflictIndicators = pattern.indicators.filter(indicator => 
          new RegExp(indicator, 'i').test(response.reasoning)
        );

        if (conflictIndicators.length > 0) {
          // Check if the relevant tactics are actually present
          const relevantTactics = allTactics.filter(tactic => 
            pattern.tactics.includes(tactic.name)
          );

          if (relevantTactics.length >= 2) {
            conflicts.push({
              conflictType: conflictType as any,
              tactics: relevantTactics.map(t => t.name),
              intensity: conflictIndicators.length / pattern.indicators.length,
              context: response.domain,
              evidence: relevantTactics.flatMap(t => t.evidence).filter(e => 
                e.response.reasoning === response.reasoning
              )
            });
          }
        }
      });
    });

    return conflicts;
  }

  private analyzeResolutionStrategies(
    responses: Array<{ reasoning: string; choice: string; domain: string; difficulty: number }>,
    conflicts: ValueConflict[]
  ): ResolutionStrategy[] {
    const strategies: Map<string, {
      indicators: string[];
      contexts: string[];
      usage: number;
    }> = new Map();

    responses.forEach(response => {
      Object.entries(this.resolutionPatterns).forEach(([strategyType, pattern]) => {
        const matchedIndicators = pattern.indicators.filter(indicator =>
          new RegExp(indicator, 'i').test(response.reasoning)
        );

        if (matchedIndicators.length > 0) {
          const existing = strategies.get(strategyType) || {
            indicators: [],
            contexts: [],
            usage: 0
          };

          existing.indicators.push(...matchedIndicators);
          existing.contexts.push(response.domain);
          existing.usage += 1;
          strategies.set(strategyType, existing);
        }
      });
    });

    return Array.from(strategies.entries()).map(([strategyType, data]) => ({
      strategyType: strategyType as any,
      description: this.resolutionPatterns[strategyType].description,
      indicators: [...new Set(data.indicators)],
      effectiveness: data.usage / responses.length,
      contexts: [...new Set(data.contexts)]
    }));
  }

  private calculateConsistency(strategies: ResolutionStrategy[]): number {
    if (strategies.length === 0) return 0;
    
    // More consistent = fewer different strategies, higher effectiveness for dominant strategy
    const dominantStrategy = strategies.reduce((max, current) => 
      current.effectiveness > max.effectiveness ? current : max
    );
    
    const strategySpread = strategies.length;
    const dominantEffectiveness = dominantStrategy.effectiveness;
    
    // Consistency is high if one strategy dominates and few strategies are used
    return dominantEffectiveness * (1 - (strategySpread - 1) * 0.2);
  }

  private determineMetaStrategy(strategies: ResolutionStrategy[]): string {
    if (strategies.length === 0) return 'unclear_approach';
    
    const dominantStrategy = strategies.reduce((max, current) => 
      current.effectiveness > max.effectiveness ? current : max
    );
    
    if (dominantStrategy.effectiveness > 0.6) {
      return `${dominantStrategy.strategyType}_dominant`;
    } else if (strategies.length > 3) {
      return 'pluralistic_flexible';
    } else if (strategies.find(s => s.strategyType === 'contextual_switching')) {
      return 'contextual_adaptive';
    } else {
      return 'mixed_approach';
    }
  }

  private generateGrowthSuggestions(
    conflicts: ValueConflict[],
    strategies: ResolutionStrategy[]
  ): string[] {
    const suggestions: string[] = [];
    
    // High conflicts but low resolution sophistication
    if (conflicts.length > 2 && strategies.length < 2) {
      suggestions.push('Develop more strategies for handling ethical conflicts');
    }
    
    // Only uses one strategy
    if (strategies.length === 1) {
      suggestions.push('Consider developing additional conflict resolution approaches');
    }
    
    // No synthesis strategy detected
    if (!strategies.find(s => s.strategyType === 'synthesis')) {
      suggestions.push('Explore creative solutions that honor multiple values simultaneously');
    }
    
    // High conflict intensity but low consistency
    const avgConflictIntensity = conflicts.reduce((sum, c) => sum + c.intensity, 0) / conflicts.length;
    const consistency = this.calculateConsistency(strategies);
    
    if (avgConflictIntensity > 0.6 && consistency < 0.4) {
      suggestions.push('Work on developing more consistent approaches to similar ethical dilemmas');
    }
    
    // Contextual conflicts but no contextual switching
    if (conflicts.some(c => c.context === 'personal_ethics') && 
        conflicts.some(c => c.context === 'public_policy') &&
        !strategies.find(s => s.strategyType === 'contextual_switching')) {
      suggestions.push('Consider how context should influence ethical reasoning');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Continue developing nuanced approaches to ethical complexity');
    }
    
    return suggestions;
  }

  // Public method to get conflict resolution insights for VALUES.md
  generateConflictResolutionSection(profile: ConflictResolutionProfile): string {
    const sections = [];
    
    sections.push('## How I Handle Ethical Conflicts');
    sections.push('');
    
    if (profile.detectedConflicts.length > 0) {
      sections.push('### Conflicts I Navigate');
      profile.detectedConflicts.forEach(conflict => {
        sections.push(`- **${this.formatConflictType(conflict.conflictType)}**: ${this.getConflictDescription(conflict.conflictType)}`);
      });
      sections.push('');
    }
    
    if (profile.resolutionStrategies.length > 0) {
      sections.push('### My Resolution Approaches');
      profile.resolutionStrategies.forEach(strategy => {
        sections.push(`- **${this.formatStrategyType(strategy.strategyType)}**: ${strategy.description}`);
        sections.push(`  *Used in ${Math.round(strategy.effectiveness * 100)}% of conflicts*`);
      });
      sections.push('');
    }
    
    sections.push(`**Overall Approach**: ${this.formatMetaStrategy(profile.metaStrategy)}`);
    sections.push(`**Consistency**: ${Math.round(profile.consistencyScore * 100)}%`);
    sections.push('');
    
    if (profile.growthAreas.length > 0) {
      sections.push('### Areas for Growth');
      profile.growthAreas.forEach(area => {
        sections.push(`- ${area}`);
      });
    }
    
    return sections.join('\n');
  }

  private formatConflictType(conflictType: string): string {
    return conflictType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' vs ');
  }

  private formatStrategyType(strategyType: string): string {
    return strategyType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private formatMetaStrategy(metaStrategy: string): string {
    const strategies = {
      'prioritization_dominant': 'I tend to prioritize one value over others consistently',
      'synthesis_dominant': 'I prefer finding creative solutions that honor multiple values',
      'contextual_adaptive': 'I adapt my approach based on the specific situation',
      'pluralistic_flexible': 'I use many different strategies flexibly',
      'mixed_approach': 'I combine different approaches as needed',
      'unclear_approach': 'My approach to conflicts is still developing'
    };
    
    return strategies[metaStrategy] || 'I have a unique approach to handling conflicts';
  }

  private getConflictDescription(conflictType: string): string {
    const descriptions = {
      'utilitarian_vs_rights': 'Balancing overall welfare against individual rights',
      'duty_vs_consequences': 'Following principles even when outcomes might be worse',
      'individual_vs_collective': 'Weighing personal needs against group benefits',
      'present_vs_future': 'Addressing immediate concerns vs. long-term consequences',
      'care_vs_justice': 'Balancing personal relationships with impartial fairness'
    };
    
    return descriptions[conflictType] || 'Complex ethical tensions requiring careful consideration';
  }
}

export const valueConflictAnalyzer = new ValueConflictAnalyzer();