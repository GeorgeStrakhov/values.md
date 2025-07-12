/**
 * Streamlined Values Generator - Simplified Core Implementation
 * 
 * Preserves main flows while reducing complexity:
 * 1. Input validation → 2. Semantic analysis → 3. Tactic discovery → 4. VALUES.md generation
 */

export interface StreamlinedProfile {
  valuesMarkdown: string;
  summary: {
    primaryApproach: string;
    confidence: number;
    warnings: string[];
  };
  tactics: Array<{
    name: string;
    strength: number;
    examples: string[];
  }>;
  metadata: {
    processingTime: number;
    method: 'enhanced' | 'standard' | 'fallback';
    quality: 'high' | 'medium' | 'low';
  };
}

interface ValidatedInput {
  reasoning: string;
  choice: string;
  domain: string;
  isValid: boolean;
  warnings: string[];
}

/**
 * Streamlined Values Generator
 * Focus on core functionality with proper error handling
 */
export class StreamlinedValuesGenerator {
  
  /**
   * Main generation flow - simplified but robust
   */
  async generateProfile(responses: Array<{
    reasoning: string;
    choice: string;
    domain?: string;
    difficulty?: number;
  }>): Promise<StreamlinedProfile> {
    
    const startTime = Date.now();
    const warnings: string[] = [];
    
    try {
      // Step 1: Validate and clean inputs
      const validatedInputs = this.validateInputs(responses);
      const validInputs = validatedInputs.filter(input => input.isValid);
      
      if (validInputs.length === 0) {
        return this.createFallbackProfile('No valid inputs provided', warnings, startTime);
      }
      
      // Collect warnings
      validatedInputs.forEach(input => warnings.push(...input.warnings));
      
      // Step 2: Analyze semantic content
      const semanticResults = this.analyzeSemantics(validInputs);
      
      // Step 3: Discover ethical tactics
      const tactics = this.discoverTactics(semanticResults, validInputs);
      
      if (tactics.length === 0) {
        warnings.push('No clear ethical patterns identified');
      }
      
      // Step 4: Generate VALUES.md
      const valuesMarkdown = this.generateMarkdown(tactics, validInputs, warnings);
      
      // Step 5: Create summary
      const summary = this.generateSummary(tactics, warnings);
      
      return {
        valuesMarkdown,
        summary,
        tactics,
        metadata: {
          processingTime: Date.now() - startTime,
          method: validInputs.length >= 3 ? 'enhanced' : 'standard',
          quality: this.assessQuality(tactics, warnings)
        }
      };
      
    } catch (error) {
      console.error('Profile generation failed:', error);
      return this.createFallbackProfile(
        `Analysis failed: ${error}`,
        warnings,
        startTime
      );
    }
  }
  
  /**
   * Validate and sanitize inputs
   */
  private validateInputs(responses: any[]): ValidatedInput[] {
    if (!Array.isArray(responses)) {
      return [];
    }
    
    return responses.map((response, index) => {
      const warnings: string[] = [];
      let isValid = true;
      
      // Validate reasoning
      let reasoning = '';
      if (typeof response.reasoning === 'string' && response.reasoning.trim()) {
        reasoning = response.reasoning
          .trim()
          .replace(/[<>\"'&]/g, '') // Basic sanitization
          .substring(0, 1000); // Length limit
          
        if (reasoning.length < 20) {
          warnings.push(`Response ${index + 1}: Very short reasoning`);
        }
      } else {
        isValid = false;
        warnings.push(`Response ${index + 1}: Invalid reasoning text`);
      }
      
      // Validate choice
      const choice = typeof response.choice === 'string' ? response.choice.trim() : '';
      if (!choice) {
        isValid = false;
        warnings.push(`Response ${index + 1}: Missing choice`);
      }
      
      // Set domain with fallback
      const domain = typeof response.domain === 'string' ? response.domain : 'general';
      
      return {
        reasoning,
        choice,
        domain,
        isValid,
        warnings
      };
    });
  }
  
  /**
   * Analyze semantic content - simplified but effective
   */
  private analyzeSemantics(inputs: ValidatedInput[]): Array<{
    concepts: Record<string, number>;
    quality: number;
  }> {
    
    return inputs.map(input => {
      const text = input.reasoning.toLowerCase();
      const concepts: Record<string, number> = {};
      
      // Utilitarian concepts
      const utilitarian = this.countConcepts(text, [
        'benefit', 'welfare', 'outcome', 'consequence', 'result',
        'maximize', 'greatest', 'overall', 'total', 'aggregate'
      ]);
      if (utilitarian > 0) concepts['utilitarian'] = utilitarian;
      
      // Rights-based concepts
      const rights = this.countConcepts(text, [
        'rights', 'dignity', 'autonomy', 'freedom', 'individual',
        'respect', 'person', 'human', 'deserve', 'inherent'
      ]);
      if (rights > 0) concepts['rights'] = rights;
      
      // Duty-based concepts
      const duty = this.countConcepts(text, [
        'duty', 'obligation', 'responsibility', 'principle', 'rule',
        'must', 'should', 'ought', 'required', 'moral'
      ]);
      if (duty > 0) concepts['duty'] = duty;
      
      // Care-based concepts
      const care = this.countConcepts(text, [
        'care', 'relationship', 'family', 'friend', 'love',
        'trust', 'support', 'help', 'connection', 'compassion'
      ]);
      if (care > 0) concepts['care'] = care;
      
      // Virtue concepts
      const virtue = this.countConcepts(text, [
        'character', 'virtue', 'integrity', 'honest', 'courage',
        'wisdom', 'good person', 'moral', 'excellent', 'noble'
      ]);
      if (virtue > 0) concepts['virtue'] = virtue;
      
      // Justice concepts
      const justice = this.countConcepts(text, [
        'fair', 'justice', 'equal', 'impartial', 'unbiased',
        'equitable', 'deserve', 'merit', 'right', 'wrong'
      ]);
      if (justice > 0) concepts['justice'] = justice;
      
      // Calculate quality based on concept diversity and text length
      const conceptCount = Object.keys(concepts).length;
      const textQuality = Math.min(1, input.reasoning.length / 100);
      const quality = (conceptCount / 6 + textQuality) / 2;
      
      return { concepts, quality };
    });
  }
  
  /**
   * Count concept occurrences with simple scoring
   */
  private countConcepts(text: string, terms: string[]): number {
    let score = 0;
    terms.forEach(term => {
      if (text.includes(term)) {
        score += 1;
      }
    });
    return Math.min(1, score / terms.length); // Normalize to 0-1
  }
  
  /**
   * Discover ethical tactics from semantic analysis
   */
  private discoverTactics(
    semanticResults: Array<{ concepts: Record<string, number>; quality: number }>,
    inputs: ValidatedInput[]
  ): Array<{ name: string; strength: number; examples: string[] }> {
    
    const tacticScores: Record<string, number[]> = {};
    const tacticExamples: Record<string, string[]> = {};
    
    // Aggregate concept scores across responses
    semanticResults.forEach((result, index) => {
      Object.entries(result.concepts).forEach(([concept, score]) => {
        if (!tacticScores[concept]) {
          tacticScores[concept] = [];
          tacticExamples[concept] = [];
        }
        tacticScores[concept].push(score * result.quality); // Weight by quality
        
        // Add example if score is significant
        if (score > 0.3 && inputs[index].reasoning.length > 30) {
          tacticExamples[concept].push(inputs[index].reasoning);
        }
      });
    });
    
    // Convert to tactics with strength calculation
    const tactics = Object.entries(tacticScores)
      .map(([name, scores]) => {
        const strength = Math.min(1.0, scores.reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length));
        const examples = tacticExamples[name]?.slice(0, 2) || []; // Max 2 examples
        
        return { name, strength, examples };
      })
      .filter(tactic => tactic.strength > 0.15) // Slightly lower threshold for large inputs
      .sort((a, b) => b.strength - a.strength); // Sort by strength
    
    return tactics;
  }
  
  /**
   * Generate VALUES.md markdown
   */
  private generateMarkdown(
    tactics: Array<{ name: string; strength: number; examples: string[] }>,
    inputs: ValidatedInput[],
    warnings: string[]
  ): string {
    
    const sections = [];
    
    // Header
    sections.push('# My Ethical Values');
    sections.push('');
    sections.push('*Generated through analysis of ethical reasoning patterns*');
    sections.push('');
    
    // Quality assessment
    if (warnings.length > 0) {
      sections.push('## Analysis Notes');
      warnings.slice(0, 3).forEach(warning => {
        sections.push(`- ${warning}`);
      });
      sections.push('');
    }
    
    // Primary approach
    if (tactics.length > 0) {
      const primary = tactics[0];
      sections.push('## My Primary Ethical Approach');
      sections.push('');
      sections.push(`**${this.formatTacticName(primary.name)}**`);
      sections.push(`${this.getTacticDescription(primary.name)}`);
      sections.push('');
      sections.push(`*Strength: ${Math.round(primary.strength * 100)}% of responses*`);
      
      // Add example if available
      if (primary.examples.length > 0) {
        sections.push('');
        sections.push('**Example from my reasoning:**');
        sections.push(`> "${this.cleanQuote(primary.examples[0])}"`);
      }
      sections.push('');
    }
    
    // Secondary approaches
    if (tactics.length > 1) {
      sections.push('## Other Approaches I Use');
      sections.push('');
      
      tactics.slice(1, 4).forEach(tactic => { // Max 3 secondary
        sections.push(`**${this.formatTacticName(tactic.name)}** (${Math.round(tactic.strength * 100)}%)`);
        sections.push(`${this.getTacticDescription(tactic.name)}`);
        sections.push('');
      });
    }
    
    // AI guidance
    sections.push('## AI Interaction Guidance');
    sections.push('');
    if (tactics.length > 0) {
      sections.push(`Based on my ${this.formatTacticName(tactics[0].name).toLowerCase()} approach:`);
      sections.push(`- ${this.getAIGuidance(tactics[0].name)}`);
    } else {
      sections.push('- Provide balanced ethical perspectives');
      sections.push('- Help me think through moral considerations systematically');
    }
    sections.push('');
    
    // Footer
    sections.push('---');
    sections.push('');
    sections.push('*Generated through analysis of ethical reasoning patterns*');
    sections.push(`*Based on ${inputs.length} response${inputs.length > 1 ? 's' : ''}*`);
    
    return sections.join('\n');
  }
  
  /**
   * Generate summary
   */
  private generateSummary(
    tactics: Array<{ name: string; strength: number; examples: string[] }>,
    warnings: string[]
  ): { primaryApproach: string; confidence: number; warnings: string[] } {
    
    const primaryApproach = tactics.length > 0 
      ? `${this.formatTacticName(tactics[0].name)} (${Math.round(tactics[0].strength * 100)}%)`
      : 'Mixed approach - no dominant pattern';
    
    // Calculate confidence based on tactic strength and warnings
    let confidence = 0.5; // Base confidence
    if (tactics.length > 0) {
      confidence = Math.min(0.9, tactics[0].strength); // Max 90%
    }
    if (warnings.length > 2) {
      confidence *= 0.7; // Reduce for many warnings
    }
    
    return {
      primaryApproach,
      confidence: Math.round(confidence * 100),
      warnings: warnings.slice(0, 5) // Max 5 warnings
    };
  }
  
  /**
   * Assess overall quality
   */
  private assessQuality(
    tactics: Array<{ name: string; strength: number; examples: string[] }>,
    warnings: string[]
  ): 'high' | 'medium' | 'low' {
    
    if (tactics.length === 0 || warnings.length > 4) {
      return 'low';
    }
    
    if (tactics.length >= 2 && tactics[0].strength > 0.5 && warnings.length <= 2) {
      return 'high';
    }
    
    return 'medium';
  }
  
  /**
   * Create fallback profile for errors
   */
  private createFallbackProfile(
    error: string,
    warnings: string[],
    startTime: number
  ): StreamlinedProfile {
    
    return {
      valuesMarkdown: this.generateErrorMarkdown(error),
      summary: {
        primaryApproach: 'Analysis failed',
        confidence: 0,
        warnings: [error, ...warnings]
      },
      tactics: [],
      metadata: {
        processingTime: Date.now() - startTime,
        method: 'fallback',
        quality: 'low'
      }
    };
  }
  
  /**
   * Generate error markdown
   */
  private generateErrorMarkdown(error: string): string {
    return [
      '# Analysis Error',
      '',
      'Unfortunately, the ethical analysis could not be completed.',
      '',
      `**Issue**: ${error}`,
      '',
      '## What to try:',
      '- Ensure your reasoning text is clear and detailed',
      '- Try submitting your responses again',
      '- Contact support if the problem persists',
      '',
      '*We apologize for the inconvenience.*'
    ].join('\n');
  }
  
  /**
   * Format tactic name for display
   */
  private formatTacticName(name: string): string {
    const names: Record<string, string> = {
      'utilitarian': 'Utilitarian Reasoning',
      'rights': 'Rights-Based Ethics',
      'duty': 'Duty-Based Ethics',
      'care': 'Care Ethics',
      'virtue': 'Virtue Ethics',
      'justice': 'Justice-Oriented'
    };
    return names[name] || name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  /**
   * Get tactic description
   */
  private getTacticDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'utilitarian': 'I focus on outcomes and consequences, seeking solutions that create the greatest overall benefit.',
      'rights': 'I prioritize individual rights, human dignity, and personal autonomy in ethical decisions.',
      'duty': 'I follow moral principles and duties, believing some things are right or wrong regardless of consequences.',
      'care': 'I consider relationships, care responsibilities, and the specific context of moral situations.',
      'virtue': 'I think about character, moral excellence, and what kind of person I want to be.',
      'justice': 'I emphasize fairness, equality, and just treatment for all people involved.'
    };
    return descriptions[name] || 'A distinctive approach to ethical reasoning and decision-making.';
  }
  
  /**
   * Get AI guidance for tactic
   */
  private getAIGuidance(name: string): string {
    const guidance: Record<string, string> = {
      'utilitarian': 'Present clear cost-benefit analyses and focus on outcomes that maximize overall welfare',
      'rights': 'Emphasize individual autonomy, human dignity, and rights-based considerations',
      'duty': 'Focus on moral principles, duties, and rules that should guide behavior',
      'care': 'Consider relationships, contextual factors, and care responsibilities',
      'virtue': 'Frame choices in terms of character development and moral excellence',
      'justice': 'Emphasize fairness, equality, and just treatment for all involved'
    };
    return guidance[name] || 'Provide balanced ethical guidance that respects your reasoning style';
  }
  
  /**
   * Clean quote for display
   */
  private cleanQuote(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .substring(0, 120)
      .trim() + (text.length > 120 ? '...' : '');
  }
}

export const streamlinedValuesGenerator = new StreamlinedValuesGenerator();