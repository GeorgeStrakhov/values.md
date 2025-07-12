/**
 * Semantic Moral Space - Layer 1: Representation
 * 
 * Implements moral manifold geometry for semantic understanding
 * Replaces regex pattern matching with geometric moral reasoning
 */

export interface MoralConcept {
  name: string;
  embedding: number[];
  culturalVariants: Record<string, number[]>;
  philosophicalFramework: string;
  semanticNeighbors: string[];
}

export interface MoralSimilarity {
  concept1: string;
  concept2: string;
  similarity: number;
  confidenceInterval: [number, number];
  culturalVariation: number;
}

export interface SemanticAnalysisResult {
  activatedConcepts: Array<{
    concept: string;
    activation: number;
    confidence: number;
    culturalContext: string;
  }>;
  conceptDistances: Record<string, number>;
  uncertaintyDecomposition: {
    semantic: number;
    cultural: number;
    contextual: number;
  };
  // Enhanced metadata
  analysisMetadata: {
    textLength: number;
    processingTime: number;
    method: 'simulated' | 'transformer' | 'hybrid';
    warnings: string[];
    qualityScore: number;
  };
  // Input validation results
  inputValidation: {
    isValid: boolean;
    sanitizedText: string;
    violations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

/**
 * Moral Manifold Geometry
 * 
 * Core mathematical structure for representing ethical concepts
 * in a way that preserves semantic and philosophical relationships
 */
export class MoralManifoldSpace {
  private concepts: Map<string, MoralConcept> = new Map();
  private culturalContexts: Set<string> = new Set();
  private similarityCache: Map<string, MoralSimilarity> = new Map();
  
  constructor() {
    this.initializeCoreMoralConcepts();
  }

  /**
   * Initialize core moral concepts with their embeddings
   * In production, these would be learned from diverse philosophical texts
   */
  private initializeCoreMoralConcepts(): void {
    const coreConcepts = [
      // Consequentialist concepts
      {
        name: 'utilitarian_welfare',
        embedding: this.createEmbedding([0.8, 0.2, 0.1, 0.9, 0.3]),
        framework: 'consequentialist',
        neighbors: ['aggregate_benefit', 'collective_good', 'overall_welfare']
      },
      {
        name: 'harm_prevention', 
        embedding: this.createEmbedding([0.7, 0.1, 0.2, 0.8, 0.4]),
        framework: 'consequentialist',
        neighbors: ['suffering_reduction', 'damage_minimization', 'negative_prevention']
      },
      
      // Deontological concepts
      {
        name: 'duty_obligation',
        embedding: this.createEmbedding([0.2, 0.9, 0.1, 0.3, 0.8]),
        framework: 'deontological', 
        neighbors: ['moral_duty', 'categorical_imperative', 'obligation']
      },
      {
        name: 'rights_protection',
        embedding: this.createEmbedding([0.3, 0.8, 0.2, 0.4, 0.7]),
        framework: 'deontological',
        neighbors: ['individual_rights', 'human_dignity', 'autonomy_respect']
      },
      
      // Care ethics concepts
      {
        name: 'relational_care',
        embedding: this.createEmbedding([0.4, 0.3, 0.9, 0.6, 0.2]),
        framework: 'care',
        neighbors: ['relationship_focus', 'care_concern', 'contextual_care']
      },
      
      // Virtue ethics concepts
      {
        name: 'virtue_character',
        embedding: this.createEmbedding([0.3, 0.4, 0.5, 0.2, 0.9]),
        framework: 'virtue',
        neighbors: ['character_development', 'moral_excellence', 'virtue_cultivation']
      }
    ];

    coreConcepts.forEach(concept => {
      this.concepts.set(concept.name, {
        name: concept.name,
        embedding: concept.embedding,
        culturalVariants: {},
        philosophicalFramework: concept.framework,
        semanticNeighbors: concept.neighbors
      });
    });
  }

  /**
   * Create normalized embedding vector
   */
  private createEmbedding(values: number[]): number[] {
    const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
    return values.map(v => v / norm);
  }

  /**
   * Calculate semantic similarity between text and moral concepts
   * Enhanced with input validation, error handling, and quality assessment
   */
  analyzeSemanticContent(text: string, culturalContext: string = 'universal'): SemanticAnalysisResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    
    // Input validation and sanitization
    const inputValidation = this.validateAndSanitizeInput(text);
    if (!inputValidation.isValid) {
      return this.createErrorResult(inputValidation, startTime);
    }
    
    const sanitizedText = inputValidation.sanitizedText;
    // Enhanced semantic analysis with quality assessment
    let textEmbedding: number[];
    let analysisMethod: 'simulated' | 'transformer' | 'hybrid';
    
    try {
      // Try to use more sophisticated analysis if available
      textEmbedding = this.generateSemanticEmbedding(sanitizedText);
      analysisMethod = 'simulated'; // Will be 'transformer' when real models integrated
    } catch (error) {
      warnings.push(`Semantic analysis error: ${error}`);
      textEmbedding = this.fallbackEmbedding(sanitizedText);
      analysisMethod = 'simulated';
    }
    
    const activatedConcepts = [];
    const conceptDistances: Record<string, number> = {};
    
    for (const [conceptName, concept] of this.concepts) {
      const distance = this.calculateDistance(textEmbedding, concept.embedding);
      const activation = Math.max(0, 1 - distance); // Convert distance to activation
      
      conceptDistances[conceptName] = distance;
      
      if (activation > 0.3) { // Threshold for activation
        activatedConcepts.push({
          concept: conceptName,
          activation,
          confidence: this.calculateConfidence(activation, text.length),
          culturalContext
        });
      }
    }

    // Sort by activation strength
    activatedConcepts.sort((a, b) => b.activation - a.activation);

    const processingTime = Date.now() - startTime;
    const qualityScore = this.calculateAnalysisQuality(sanitizedText, activatedConcepts, processingTime);
    
    // Add quality warnings
    if (qualityScore < 0.5) {
      warnings.push('Low analysis quality - results may be unreliable');
    }
    if (sanitizedText.length < 20) {
      warnings.push('Very short text - semantic analysis limited');
    }
    
    return {
      activatedConcepts,
      conceptDistances,
      uncertaintyDecomposition: this.calculateUncertaintyDecomposition(sanitizedText, culturalContext),
      analysisMetadata: {
        textLength: sanitizedText.length,
        processingTime,
        method: analysisMethod,
        warnings,
        qualityScore
      },
      inputValidation
    };
  }

  /**
   * Calculate geometric distance in moral manifold space
   */
  private calculateDistance(embedding1: number[], embedding2: number[]): number {
    // Cosine distance: 1 - cosine_similarity
    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
    return 1 - dotProduct; // Embeddings are normalized, so ||a|| * ||b|| = 1
  }

  /**
   * Validate and sanitize input text
   */
  private validateAndSanitizeInput(text: string): {
    isValid: boolean;
    sanitizedText: string;
    violations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const violations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    // Basic validation
    if (!text || typeof text !== 'string') {
      return {
        isValid: false,
        sanitizedText: '',
        violations: ['Invalid input: text must be a non-empty string'],
        riskLevel: 'high'
      };
    }
    
    // Length validation
    if (text.length > 5000) {
      violations.push('Text too long - truncated to 5000 characters');
      text = text.substring(0, 5000);
      riskLevel = 'medium';
    }
    
    if (text.length < 5) {
      violations.push('Text too short - analysis may be unreliable');
      riskLevel = 'medium';
    }
    
    // Sanitization
    let sanitizedText = text
      .replace(/[<>"'&]/g, '') // Remove potential HTML/script injection
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\b(inject|script|eval|function)\b/i,
      /<[^>]*>/g, // HTML tags
      /javascript:/i,
      /data:.*base64/i
    ];
    
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(sanitizedText)) {
        violations.push('Suspicious content detected and removed');
        sanitizedText = sanitizedText.replace(pattern, '');
        riskLevel = 'high';
      }
    });
    
    return {
      isValid: sanitizedText.length > 0,
      sanitizedText,
      violations,
      riskLevel
    };
  }

  /**
   * Create error result for invalid input
   */
  private createErrorResult(
    inputValidation: any,
    startTime: number
  ): SemanticAnalysisResult {
    return {
      activatedConcepts: [],
      conceptDistances: {},
      uncertaintyDecomposition: {
        semantic: 1.0, // Maximum uncertainty
        cultural: 1.0,
        contextual: 1.0
      },
      analysisMetadata: {
        textLength: 0,
        processingTime: Date.now() - startTime,
        method: 'simulated',
        warnings: ['Analysis failed due to input validation errors'],
        qualityScore: 0
      },
      inputValidation
    };
  }

  /**
   * Generate semantic embedding with improved analysis
   * Prepared for real transformer integration
   */
  private generateSemanticEmbedding(text: string): number[] {
    // Enhanced pattern detection with more sophisticated scoring
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const embedding = [0, 0, 0, 0, 0];
    
    // Consequentialist concepts with weighted scoring
    const consequentialistTerms = {
      'outcome': 0.8, 'result': 0.7, 'consequence': 0.9,
      'benefit': 0.8, 'welfare': 0.9, 'utility': 0.8,
      'maximize': 0.8, 'optimize': 0.7, 'greatest': 0.6,
      'total': 0.5, 'overall': 0.6, 'aggregate': 0.7
    };
    
    // Deontological concepts
    const deontologicalTerms = {
      'duty': 0.9, 'obligation': 0.8, 'responsibility': 0.7,
      'rights': 0.9, 'principle': 0.8, 'rule': 0.6,
      'moral': 0.7, 'ethical': 0.6, 'must': 0.5,
      'should': 0.4, 'ought': 0.6, 'required': 0.7
    };
    
    // Care ethics concepts
    const careTerms = {
      'care': 0.9, 'relationship': 0.8, 'connection': 0.7,
      'family': 0.6, 'friend': 0.5, 'love': 0.6,
      'trust': 0.7, 'support': 0.6, 'help': 0.5,
      'compassion': 0.8, 'empathy': 0.8, 'understanding': 0.6
    };
    
    // Virtue ethics concepts
    const virtueTerms = {
      'character': 0.9, 'virtue': 0.9, 'integrity': 0.8,
      'honest': 0.7, 'courage': 0.7, 'wisdom': 0.7,
      'excellence': 0.6, 'flourish': 0.6, 'good person': 0.8,
      'moral exemplar': 0.9, 'role model': 0.6
    };
    
    // Justice/fairness concepts
    const justiceTerms = {
      'fair': 0.8, 'justice': 0.9, 'equal': 0.7,
      'impartial': 0.8, 'unbiased': 0.7, 'equitable': 0.8,
      'deserve': 0.6, 'merit': 0.6, 'earn': 0.5
    };
    
    // Calculate weighted activations
    words.forEach(word => {
      if (consequentialistTerms[word]) {
        embedding[0] += consequentialistTerms[word];
        embedding[3] += consequentialistTerms[word] * 0.5;
      }
      if (deontologicalTerms[word]) {
        embedding[1] += deontologicalTerms[word];
        embedding[4] += deontologicalTerms[word] * 0.6;
      }
      if (careTerms[word]) {
        embedding[2] += careTerms[word];
        embedding[0] += careTerms[word] * 0.3;
      }
      if (virtueTerms[word]) {
        embedding[4] += virtueTerms[word];
        embedding[2] += virtueTerms[word] * 0.4;
      }
      if (justiceTerms[word]) {
        embedding[1] += justiceTerms[word] * 0.7;
        embedding[3] += justiceTerms[word];
      }
    });
    
    // Add contextual boosting for multi-word phrases
    this.detectPhrases(lowerText, embedding);
    
    // Normalize by text length to prevent longer texts from dominating
    const lengthNormalization = Math.sqrt(words.length);
    embedding.forEach((_, i) => {
      embedding[i] = embedding[i] / lengthNormalization;
    });
    
    // Add controlled noise for realism
    embedding.forEach((_, i) => {
      embedding[i] += (Math.random() - 0.5) * 0.05;
    });
    
    return this.createEmbedding(embedding);
  }

  /**
   * Detect multi-word phrases for better semantic understanding
   */
  private detectPhrases(text: string, embedding: number[]): void {
    const phrases = {
      'greatest good': { dim: 0, weight: 1.2 },
      'greatest number': { dim: 0, weight: 1.1 },
      'human rights': { dim: 1, weight: 1.2 },
      'moral duty': { dim: 1, weight: 1.1 },
      'care about': { dim: 2, weight: 1.0 },
      'care for': { dim: 2, weight: 1.0 },
      'good person': { dim: 4, weight: 1.1 },
      'moral character': { dim: 4, weight: 1.2 },
      'social justice': { dim: 3, weight: 1.1 },
      'fair treatment': { dim: 3, weight: 1.0 }
    };
    
    Object.entries(phrases).forEach(([phrase, config]) => {
      if (text.includes(phrase)) {
        embedding[config.dim] += config.weight;
      }
    });
  }

  /**
   * Fallback embedding for error cases
   */
  private fallbackEmbedding(text: string): number[] {
    // Simple fallback based on text characteristics
    const length = text.length;
    const wordCount = text.split(/\s+/).length;
    
    return this.createEmbedding([
      length > 100 ? 0.3 : 0.1,  // Longer text might be consequentialist
      wordCount > 20 ? 0.3 : 0.1, // More words might indicate deontological
      0.2, // Baseline care
      0.2, // Baseline justice
      0.2  // Baseline virtue
    ]);
  }

  /**
   * Calculate analysis quality score
   */
  private calculateAnalysisQuality(
    text: string,
    activatedConcepts: any[],
    processingTime: number
  ): number {
    let qualityScore = 0.5; // Base score
    
    // Text length factor
    if (text.length >= 50 && text.length <= 500) {
      qualityScore += 0.2;
    } else if (text.length < 20) {
      qualityScore -= 0.3;
    }
    
    // Concept activation factor
    if (activatedConcepts.length >= 2) {
      qualityScore += 0.2;
    }
    
    // Processing time factor (reasonable time indicates good analysis)
    if (processingTime < 1000 && processingTime > 10) {
      qualityScore += 0.1;
    }
    
    // Word variety factor
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const varietyRatio = uniqueWords.size / words.length;
    if (varietyRatio > 0.7) {
      qualityScore += 0.1;
    }
    
    return Math.max(0, Math.min(1, qualityScore));
  }

  /**
   * Calculate confidence based on activation strength and text quality
   */
  private calculateConfidence(activation: number, textLength: number): number {
    const lengthFactor = Math.min(1, textLength / 100); // Longer text more reliable
    const activationFactor = activation;
    return Math.sqrt(lengthFactor * activationFactor);
  }

  /**
   * Decompose uncertainty into semantic, cultural, and contextual components
   */
  private calculateUncertaintyDecomposition(text: string, culturalContext: string): {
    semantic: number;
    cultural: number;
    contextual: number;
  } {
    // Semantic uncertainty based on text clarity
    const semanticUncertainty = Math.max(0, 1 - text.length / 200);
    
    // Cultural uncertainty - higher for non-universal contexts
    const culturalUncertainty = culturalContext === 'universal' ? 0.1 : 0.3;
    
    // Contextual uncertainty based on domain specificity
    const contextualUncertainty = 0.2; // Simplified for demo
    
    return {
      semantic: semanticUncertainty,
      cultural: culturalUncertainty,
      contextual: contextualUncertainty
    };
  }

  /**
   * Get moral concepts similar to given concept
   */
  getSemanticNeighbors(conceptName: string, threshold: number = 0.7): string[] {
    const concept = this.concepts.get(conceptName);
    if (!concept) return [];
    
    const neighbors: Array<{ name: string; similarity: number }> = [];
    
    for (const [otherName, otherConcept] of this.concepts) {
      if (otherName === conceptName) continue;
      
      const distance = this.calculateDistance(concept.embedding, otherConcept.embedding);
      const similarity = 1 - distance;
      
      if (similarity > threshold) {
        neighbors.push({ name: otherName, similarity });
      }
    }
    
    return neighbors
      .sort((a, b) => b.similarity - a.similarity)
      .map(n => n.name);
  }

  /**
   * Add cultural variant for a concept
   */
  addCulturalVariant(conceptName: string, culture: string, culturalEmbedding: number[]): void {
    const concept = this.concepts.get(conceptName);
    if (concept) {
      concept.culturalVariants[culture] = this.createEmbedding(culturalEmbedding);
      this.culturalContexts.add(culture);
    }
  }

  /**
   * Get all available cultural contexts
   */
  getCulturalContexts(): string[] {
    return Array.from(this.culturalContexts);
  }

  /**
   * Get concept information
   */
  getConcept(name: string): MoralConcept | undefined {
    return this.concepts.get(name);
  }

  /**
   * Get all concepts in a philosophical framework
   */
  getConceptsByFramework(framework: string): MoralConcept[] {
    return Array.from(this.concepts.values())
      .filter(concept => concept.philosophicalFramework === framework);
  }
}

export const moralManifoldSpace = new MoralManifoldSpace();