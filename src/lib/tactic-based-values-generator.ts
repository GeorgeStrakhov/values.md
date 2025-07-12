/**
 * Tactic-Based VALUES.md Generator
 * 
 * Coherent system that discovers ethical tactics and generates VALUES.md
 */

import { ethicalTacticDiscovery, CoherentTacticSet, TacticIntegration, CoherentTactic, TacticEvidence } from './ethical-tactic-discovery';
import { moralManifoldSpace, SemanticAnalysisResult } from './semantic-moral-space';
import { hierarchicalIndividualModel, BayesianInferenceResult } from './hierarchical-individual-modeling';
import { informationTheoreticUncertainty, ConfidenceProfile } from './information-theoretic-uncertainty';

export interface TacticBasedProfile {
  discoveredTactics: CoherentTacticSet;
  integration: TacticIntegration;
  valuesMarkdown: string;
  summary: {
    primaryApproach: string;
    keyInsights: string[];
    aiGuidance: string[];
  };
  // Enhanced with mathematical foundations
  semanticAnalysis: SemanticAnalysisResult[];
  individualModel: BayesianInferenceResult;
  confidenceProfile: ConfidenceProfile;
  mathematicalValidation: {
    semanticCoherence: number;
    bayesianConvergence: boolean;
    uncertaintyDecomposition: any;
    recommendedActions: string[];
  };
}

export class TacticBasedValuesGenerator {
  
  /**
   * Main generation flow: Response → Tactics → VALUES.md
   */
  generateFromResponses(responses: Array<{
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
  }>): TacticBasedProfile {
    
    // Phase 1-3: Discover coherent tactics
    const discoveredTactics = ethicalTacticDiscovery.findCoherentTactics(responses);
    
    // Phase 4: Analyze integration
    const integration = ethicalTacticDiscovery.analyzeTacticIntegration(discoveredTactics);
    
    // Generate VALUES.md
    const valuesMarkdown = this.generateValuesMarkdown(discoveredTactics, integration);
    
    // Create summary
    const summary = this.generateSummary(discoveredTactics, integration);
    
    return {
      discoveredTactics,
      integration,
      valuesMarkdown,
      summary
    };
  }

  /**
   * Generate VALUES.md from discovered tactics
   */
  private generateValuesMarkdown(tactics: CoherentTacticSet, integration: TacticIntegration): string {
    const sections = [];
    
    // Header
    sections.push('# My Ethical Values');
    sections.push('');
    sections.push('*Discovered through algorithmic analysis of ethical reasoning patterns*');
    sections.push('');
    
    // Primary approach with personal examples
    if (tactics.primary.length > 0) {
      sections.push('## My Primary Ethical Approach');
      sections.push('');
      
      const primaryTactic = tactics.primary[0];
      sections.push(`**${this.formatTacticName(primaryTactic.name)}**`);
      sections.push(`${primaryTactic.description}`);
      sections.push('');
      
      // Add personal example
      const example = this.findBestExample(primaryTactic);
      if (example) {
        sections.push('For example, when I reasoned:');
        sections.push('');
        sections.push(`> "${this.cleanQuote(example.response.reasoning)}"`);
        sections.push('');
        sections.push(`This shows how I ${this.explainTacticPattern(primaryTactic.name)}.`);
        sections.push('');
      }
      
      sections.push(`*Strength: ${Math.round(primaryTactic.strength * 100)}% consistency across decisions*`);
      sections.push('');
    }
    
    // Integration style
    sections.push('## How I Integrate Different Ethical Perspectives');
    sections.push('');
    sections.push(`**Integration Style: ${this.formatIntegrationStyle(integration.integrationStyle)}**`);
    sections.push('');
    
    if (integration.combinationPatterns.length > 0) {
      sections.push('My approach combines:');
      integration.combinationPatterns.forEach(pattern => {
        sections.push(`- ${pattern}`);
      });
      sections.push('');
    }
    
    // Personal Examples Section
    const personalExamples = this.generatePersonalExamplesSection(tactics);
    if (personalExamples) {
      sections.push(personalExamples);
    }
    
    // Secondary tactics
    if (tactics.secondary.length > 0) {
      sections.push('## Secondary Approaches I Use');
      sections.push('');
      tactics.secondary.forEach(tactic => {
        sections.push(`**${this.formatTacticName(tactic.name)}**`);
        sections.push(`${tactic.description}`);
        
        // Add example for secondary tactics too
        const example = this.findBestExample(tactic);
        if (example) {
          sections.push(`*Example: "${this.cleanQuote(example.response.reasoning, 80)}"*`);
        }
        
        sections.push(`*Used in ${Math.round(tactic.strength * 100)}% of decisions*`);
        sections.push('');
      });
    }
    
    // Meta-tactics
    if (tactics.metaTactics.length > 0) {
      sections.push('## My Meta-Ethical Patterns');
      sections.push('');
      tactics.metaTactics.forEach(meta => {
        sections.push(`**${this.formatTacticName(meta.name)}**`);
        sections.push(`${meta.description}`);
        sections.push('');
      });
    }
    
    // Context-specific patterns
    if (Object.keys(tactics.contextual).length > 0) {
      sections.push('## Context-Specific Approaches');
      sections.push('');
      Object.entries(tactics.contextual).forEach(([context, contextTactics]) => {
        sections.push(`**In ${context} situations:**`);
        contextTactics.forEach(tactic => {
          sections.push(`- ${this.formatTacticName(tactic.name)}: ${tactic.description}`);
        });
        sections.push('');
      });
    }
    
    // AI Guidance
    sections.push('## AI Interaction Guidelines');
    sections.push('');
    sections.push('Based on my ethical reasoning patterns, here\'s how AI should interact with me:');
    sections.push('');
    
    // Primary guidance
    if (tactics.primary.length > 0) {
      sections.push(`**Primary Guidance:**`);
      sections.push(`- ${tactics.primary[0].aiGuidance}`);
      sections.push('');
    }
    
    // Secondary guidance
    if (tactics.secondary.length > 0) {
      sections.push(`**Secondary Considerations:**`);
      tactics.secondary.forEach(tactic => {
        sections.push(`- ${tactic.aiGuidance}`);
      });
      sections.push('');
    }
    
    // Meta-guidance
    if (tactics.metaTactics.length > 0) {
      sections.push(`**Meta-Level Guidance:**`);
      tactics.metaTactics.forEach(meta => {
        sections.push(`- ${meta.aiGuidance}`);
      });
      sections.push('');
    }
    
    // Integration guidance
    sections.push(`**Integration Approach:**`);
    sections.push(`- My ${integration.integrationStyle} integration style means: ${this.getIntegrationGuidance(integration.integrationStyle)}`);
    sections.push('');
    
    // Footer
    sections.push('---');
    sections.push('');
    sections.push('*This VALUES.md was generated through algorithmic analysis of ethical reasoning patterns.*');
    sections.push(`*Generated on ${new Date().toISOString().split('T')[0]}*`);
    
    return sections.join('\n');
  }

  /**
   * Generate executive summary
   */
  private generateSummary(tactics: CoherentTacticSet, integration: TacticIntegration): {
    primaryApproach: string;
    keyInsights: string[];
    aiGuidance: string[];
  } {
    const primaryApproach = tactics.primary.length > 0 
      ? `${this.formatTacticName(tactics.primary[0].name)}: ${tactics.primary[0].description}`
      : 'Balanced ethical reasoning across multiple approaches';
    
    const keyInsights = [];
    
    // Primary insights
    if (tactics.primary.length > 0) {
      keyInsights.push(`Primary ethical approach: ${this.formatTacticName(tactics.primary[0].name)} (${Math.round(tactics.primary[0].strength * 100)}% consistency)`);
    }
    
    // Integration insights
    keyInsights.push(`Integration style: ${integration.integrationStyle}`);
    
    // Complexity insights
    if (tactics.metaTactics.length > 0) {
      keyInsights.push(`Meta-patterns: ${tactics.metaTactics.map(m => this.formatTacticName(m.name)).join(', ')}`);
    }
    
    // Context insights
    const contextCount = Object.keys(tactics.contextual).length;
    if (contextCount > 0) {
      keyInsights.push(`Context-adaptive across ${contextCount} different domains`);
    }
    
    // AI Guidance summary
    const aiGuidance = [];
    
    if (tactics.primary.length > 0) {
      aiGuidance.push(tactics.primary[0].aiGuidance);
    }
    
    if (tactics.metaTactics.length > 0) {
      aiGuidance.push(...tactics.metaTactics.map(m => m.aiGuidance));
    }
    
    aiGuidance.push(this.getIntegrationGuidance(integration.integrationStyle));
    
    return {
      primaryApproach,
      keyInsights,
      aiGuidance
    };
  }

  // Helper methods
  private formatTacticName(name: string): string {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private formatIntegrationStyle(style: string): string {
    const styles = {
      'hierarchical': 'Hierarchical - I have clear priorities and apply them consistently',
      'dialectical': 'Dialectical - I work through tensions between competing values',
      'contextual': 'Contextual - I adapt my approach based on specific situations',
      'pluralistic': 'Pluralistic - I use multiple approaches flexibly'
    };
    
    return styles[style] || style;
  }

  private getIntegrationGuidance(style: string): string {
    const guidance = {
      'hierarchical': 'Present options in order of my value priorities',
      'dialectical': 'Help me work through tensions between competing values',
      'contextual': 'Provide situation-specific guidance that adapts to circumstances',
      'pluralistic': 'Offer multiple ethical perspectives and let me choose integration'
    };
    
    return guidance[style] || 'Provide balanced ethical guidance';
  }

  /**
   * Generate Personal Examples Section
   */
  private generatePersonalExamplesSection(tactics: CoherentTacticSet): string {
    const sections = [];
    const exampleTactics = [...tactics.primary, ...tactics.secondary].slice(0, 3); // Top 3 tactics
    
    if (exampleTactics.length === 0) return '';
    
    sections.push('## My Values in Action');
    sections.push('');
    sections.push('Here are examples of how my ethical reasoning works in practice:');
    sections.push('');
    
    exampleTactics.forEach(tactic => {
      const example = this.findBestExample(tactic);
      if (example) {
        sections.push(`### ${this.formatTacticName(tactic.name)}`);
        sections.push('');
        sections.push(`> "${this.cleanQuote(example.response.reasoning)}"`);
        sections.push('');
        sections.push(`This demonstrates my tendency to ${this.explainTacticPattern(tactic.name)}.`);
        sections.push('');
      }
    });
    
    return sections.join('\n');
  }

  /**
   * Find the best example for a tactic
   */
  private findBestExample(tactic: CoherentTactic): TacticEvidence | null {
    if (!tactic.evidence || tactic.evidence.length === 0) return null;
    
    // Find evidence with good length, high confidence, and clear reasoning
    return tactic.evidence
      .filter(e => {
        const reasoning = e.response.reasoning;
        return reasoning.length > 50 && reasoning.length < 300 && !reasoning.includes('...');
      })
      .sort((a, b) => {
        // Sort by confidence, then by reasoning length (prefer medium length)
        const confidenceDiff = b.confidence - a.confidence;
        if (Math.abs(confidenceDiff) > 0.1) return confidenceDiff;
        
        const aLength = a.response.reasoning.length;
        const bLength = b.response.reasoning.length;
        const idealLength = 150;
        
        return Math.abs(aLength - idealLength) - Math.abs(bLength - idealLength);
      })[0] || null;
  }

  /**
   * Clean and format quotes for display
   */
  private cleanQuote(reasoning: string, maxLength: number = 200): string {
    let cleaned = reasoning
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^(I think|I believe|In my opinion,?\s*)/i, '') // Remove common prefixes
      .replace(/\.$/, '') // Remove trailing period
      .trim();
    
    // Truncate if too long
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength - 3) + '...';
    }
    
    // Ensure it starts with capital letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  }

  /**
   * Explain what a tactic pattern means in plain language
   */
  private explainTacticPattern(tacticName: string): string {
    const explanations = {
      'utilitarian_maximization': 'focus on outcomes that benefit the most people',
      'rights_protection': 'prioritize individual rights and dignity',
      'duty_based_reasoning': 'follow principles regardless of consequences',
      'harm_minimization': 'work to reduce suffering and damage',
      'relational_focus': 'consider relationships and care for specific people',
      'virtue_cultivation': 'think about what kind of person I want to be',
      'justice_orientation': 'emphasize fairness and equal treatment',
      'autonomy_respect': 'value freedom and self-determination',
      'collective_benefit': 'prioritize community and group welfare',
      'long_term_thinking': 'consider future consequences and sustainability'
    };
    
    return explanations[tacticName] || 'apply this ethical approach consistently';
  }
}

export const tacticBasedValuesGenerator = new TacticBasedValuesGenerator();