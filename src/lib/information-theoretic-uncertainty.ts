/**
 * Information-Theoretic Uncertainty Quantification - Layer 5: Honest Uncertainty
 * 
 * Implements multi-dimensional uncertainty quantification using information theory
 * Provides honest assessment of confidence in moral reasoning analysis
 */

export interface UncertaintyDecomposition {
  semantic: {
    value: number;
    sources: string[];
    description: string;
  };
  individual: {
    value: number;
    sources: string[];
    description: string;
  };
  cultural: {
    value: number;
    sources: string[];
    description: string;
  };
  model: {
    value: number;
    sources: string[];
    description: string;
  };
  total: {
    value: number;
    confidenceLevel: 'high' | 'medium' | 'low' | 'very_low';
    reliability: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface InformationMetrics {
  mutualInformation: number;
  entropy: number;
  conditionalEntropy: number;
  informationGain: number;
  redundancy: number;
}

export interface ConfidenceProfile {
  overallConfidence: number;
  uncertaintyDecomposition: UncertaintyDecomposition;
  informationMetrics: InformationMetrics;
  recommendedActions: string[];
  dataQualityAssessment: {
    sampleSize: 'insufficient' | 'minimal' | 'adequate' | 'good' | 'excellent';
    responseQuality: 'poor' | 'fair' | 'good' | 'excellent';
    culturalRepresentation: 'limited' | 'fair' | 'diverse' | 'comprehensive';
  };
}

/**
 * Information-Theoretic Uncertainty Quantifier
 * 
 * Uses information theory to decompose and quantify uncertainty
 * in moral reasoning analysis across multiple dimensions
 */
export class InformationTheoreticUncertainty {
  
  /**
   * Calculate comprehensive uncertainty profile
   */
  calculateUncertaintyProfile(
    semanticAnalysis: any,
    individualModel: any,
    culturalContext: string,
    responses: any[],
    modelEnsemble?: any[]
  ): ConfidenceProfile {
    
    // Calculate each uncertainty component
    const semanticUncertainty = this.calculateSemanticUncertainty(semanticAnalysis, responses);
    const individualUncertainty = this.calculateIndividualUncertainty(individualModel, responses);
    const culturalUncertainty = this.calculateCulturalUncertainty(culturalContext, responses);
    const modelUncertainty = this.calculateModelUncertainty(modelEnsemble);
    
    // Calculate information metrics
    const informationMetrics = this.calculateInformationMetrics(semanticAnalysis, responses);
    
    // Decompose total uncertainty
    const uncertaintyDecomposition = this.decomposeUncertainty(
      semanticUncertainty,
      individualUncertainty,
      culturalUncertainty,
      modelUncertainty
    );
    
    // Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(uncertaintyDecomposition);
    
    // Assess data quality
    const dataQualityAssessment = this.assessDataQuality(responses, culturalContext);
    
    // Generate recommendations
    const recommendedActions = this.generateRecommendations(
      uncertaintyDecomposition,
      dataQualityAssessment
    );
    
    return {
      overallConfidence,
      uncertaintyDecomposition,
      informationMetrics,
      recommendedActions,
      dataQualityAssessment
    };
  }

  /**
   * Calculate semantic uncertainty using information theory
   */
  private calculateSemanticUncertainty(semanticAnalysis: any, responses: any[]): {
    value: number;
    sources: string[];
    description: string;
  } {
    
    let semanticEntropy = 0;
    let ambiguityScore = 0;
    const sources: string[] = [];
    
    // Calculate entropy of semantic concept activations
    if (semanticAnalysis.activatedConcepts) {
      const activations = semanticAnalysis.activatedConcepts.map((c: any) => c.activation);
      semanticEntropy = this.calculateEntropy(activations);
      
      // High entropy indicates semantic ambiguity
      if (semanticEntropy > 0.8) {
        sources.push('High semantic ambiguity - multiple competing interpretations');
      }
    }
    
    // Analyze response text quality
    responses.forEach((response, index) => {
      const textLength = response.reasoning?.length || 0;
      const wordCount = response.reasoning?.split(' ').length || 0;
      
      if (textLength < 50) {
        sources.push(`Response ${index + 1}: Very short reasoning text`);
        ambiguityScore += 0.3;
      }
      
      if (wordCount < 10) {
        sources.push(`Response ${index + 1}: Insufficient detail for reliable analysis`);
        ambiguityScore += 0.2;
      }
      
      // Check for vague language
      const vaguePhrases = ['maybe', 'perhaps', 'not sure', 'unclear', 'depends'];
      const vaguenessCount = vaguePhrases.filter(phrase => 
        response.reasoning?.toLowerCase().includes(phrase)
      ).length;
      
      if (vaguenessCount > 2) {
        sources.push(`Response ${index + 1}: High linguistic uncertainty`);
        ambiguityScore += 0.1 * vaguenessCount;
      }
    });
    
    const totalSemanticUncertainty = Math.min(1.0, (semanticEntropy + ambiguityScore) / 2);
    
    return {
      value: totalSemanticUncertainty,
      sources,
      description: `Uncertainty from semantic ambiguity and text quality (${Math.round(totalSemanticUncertainty * 100)}%)`
    };
  }

  /**
   * Calculate individual-level uncertainty from Bayesian model
   */
  private calculateIndividualUncertainty(individualModel: any, responses: any[]): {
    value: number;
    sources: string[];
    description: string;
  } {
    
    const sources: string[] = [];
    let individualUncertainty = 0;
    
    if (individualModel.uncertainty) {
      individualUncertainty = individualModel.uncertainty.individual || 0;
      
      if (individualUncertainty > 0.7) {
        sources.push('High individual variation - reasoning patterns not yet stable');
      }
      
      if (responses.length < 5) {
        sources.push('Limited response data - individual patterns uncertain');
        individualUncertainty += 0.2;
      }
      
      if (individualModel.convergenceMetrics?.rHat > 1.1) {
        sources.push('Bayesian inference did not converge - results unreliable');
        individualUncertainty += 0.3;
      }
    } else {
      // No individual model available
      individualUncertainty = 0.8;
      sources.push('No individual modeling performed - using population defaults');
    }
    
    return {
      value: Math.min(1.0, individualUncertainty),
      sources,
      description: `Uncertainty in individual moral reasoning patterns (${Math.round(individualUncertainty * 100)}%)`
    };
  }

  /**
   * Calculate cultural context uncertainty
   */
  private calculateCulturalUncertainty(culturalContext: string, responses: any[]): {
    value: number;
    sources: string[];
    description: string;
  } {
    
    const sources: string[] = [];
    let culturalUncertainty = 0;
    
    // Base uncertainty for cultural context
    switch (culturalContext) {
      case 'universal':
        culturalUncertainty = 0.1;
        break;
      case 'western_individualistic':
      case 'eastern_collectivistic':
        culturalUncertainty = 0.2;
        break;
      default:
        culturalUncertainty = 0.4;
        sources.push('Uncommon cultural context - limited validation data');
    }
    
    // Check for cultural consistency in responses
    const culturalMarkers = this.detectCulturalMarkers(responses);
    if (culturalMarkers.inconsistency > 0.5) {
      sources.push('Inconsistent cultural markers across responses');
      culturalUncertainty += 0.2;
    }
    
    if (culturalMarkers.mixedCultures) {
      sources.push('Multiple cultural influences detected');
      culturalUncertainty += 0.15;
    }
    
    return {
      value: Math.min(1.0, culturalUncertainty),
      sources,
      description: `Uncertainty from cultural context and cross-cultural variation (${Math.round(culturalUncertainty * 100)}%)`
    };
  }

  /**
   * Calculate model uncertainty from ensemble disagreement
   */
  private calculateModelUncertainty(modelEnsemble?: any[]): {
    value: number;
    sources: string[];
    description: string;
  } {
    
    const sources: string[] = [];
    let modelUncertainty = 0;
    
    if (!modelEnsemble || modelEnsemble.length < 2) {
      modelUncertainty = 0.3;
      sources.push('No model ensemble - cannot assess model uncertainty');
      return {
        value: modelUncertainty,
        sources,
        description: `Model uncertainty from lack of ensemble validation (${Math.round(modelUncertainty * 100)}%)`
      };
    }
    
    // Calculate disagreement between models
    const predictions = modelEnsemble.map(model => model.prediction);
    const ensembleVariance = this.calculateVariance(predictions);
    
    modelUncertainty = Math.min(1.0, ensembleVariance * 2);
    
    if (ensembleVariance > 0.3) {
      sources.push('High disagreement between different models');
    }
    
    if (ensembleVariance > 0.5) {
      sources.push('Very high model uncertainty - results may be unreliable');
    }
    
    return {
      value: modelUncertainty,
      sources,
      description: `Uncertainty from model disagreement and limitations (${Math.round(modelUncertainty * 100)}%)`
    };
  }

  /**
   * Calculate entropy of probability distribution
   */
  private calculateEntropy(probabilities: number[]): number {
    // Normalize probabilities
    const sum = probabilities.reduce((s, p) => s + Math.abs(p), 0);
    if (sum === 0) return 1; // Maximum uncertainty
    
    const normalized = probabilities.map(p => Math.abs(p) / sum);
    
    // Calculate Shannon entropy
    let entropy = 0;
    normalized.forEach(p => {
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    });
    
    // Normalize by maximum possible entropy
    const maxEntropy = Math.log2(normalized.length);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  /**
   * Calculate mutual information between reasoning and values
   */
  private calculateInformationMetrics(semanticAnalysis: any, responses: any[]): InformationMetrics {
    
    // Simplified mutual information calculation
    const reasoningEntropy = this.calculateReasoningEntropy(responses);
    const valuesEntropy = this.calculateValuesEntropy(semanticAnalysis);
    
    // Estimate mutual information (simplified)
    const mutualInformation = Math.max(0, reasoningEntropy + valuesEntropy - 1.5);
    
    const conditionalEntropy = reasoningEntropy - mutualInformation;
    const informationGain = mutualInformation / reasoningEntropy;
    const redundancy = 1 - (mutualInformation / Math.min(reasoningEntropy, valuesEntropy));
    
    return {
      mutualInformation,
      entropy: reasoningEntropy,
      conditionalEntropy,
      informationGain,
      redundancy
    };
  }

  /**
   * Calculate entropy in reasoning texts
   */
  private calculateReasoningEntropy(responses: any[]): number {
    const wordCounts = responses.map(r => r.reasoning?.split(' ').length || 0);
    const avgWordCount = wordCounts.reduce((s, c) => s + c, 0) / wordCounts.length;
    
    // Normalize word count variation as proxy for reasoning entropy
    const variance = this.calculateVariance(wordCounts);
    return Math.min(1, variance / (avgWordCount + 1));
  }

  /**
   * Calculate entropy in moral values
   */
  private calculateValuesEntropy(semanticAnalysis: any): number {
    if (!semanticAnalysis.activatedConcepts) return 1;
    
    const activations = semanticAnalysis.activatedConcepts.map((c: any) => c.activation);
    return this.calculateEntropy(activations);
  }

  /**
   * Calculate variance of array
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Detect cultural markers in responses
   */
  private detectCulturalMarkers(responses: any[]): {
    inconsistency: number;
    mixedCultures: boolean;
  } {
    
    const culturalIndicators = {
      individualistic: ['individual', 'personal', 'self', 'autonomous', 'independent'],
      collectivistic: ['community', 'family', 'group', 'collective', 'together'],
      hierarchical: ['authority', 'respect', 'order', 'tradition', 'elder'],
      egalitarian: ['equal', 'fair', 'democratic', 'rights', 'justice']
    };
    
    const scores = {
      individualistic: 0,
      collectivistic: 0,
      hierarchical: 0,
      egalitarian: 0
    };
    
    responses.forEach(response => {
      const text = response.reasoning?.toLowerCase() || '';
      
      Object.entries(culturalIndicators).forEach(([culture, indicators]) => {
        indicators.forEach(indicator => {
          if (text.includes(indicator)) {
            scores[culture as keyof typeof scores]++;
          }
        });
      });
    });
    
    const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
    if (totalScore === 0) return { inconsistency: 0.5, mixedCultures: false };
    
    const normalizedScores = Object.values(scores).map(s => s / totalScore);
    const entropy = this.calculateEntropy(normalizedScores);
    
    return {
      inconsistency: entropy,
      mixedCultures: entropy > 0.7
    };
  }

  /**
   * Decompose total uncertainty
   */
  private decomposeUncertainty(
    semantic: any,
    individual: any,
    cultural: any,
    model: any
  ): UncertaintyDecomposition {
    
    // Calculate total uncertainty (not simple sum due to correlations)
    const weights = { semantic: 0.3, individual: 0.3, cultural: 0.2, model: 0.2 };
    const totalValue = semantic.value * weights.semantic +
                      individual.value * weights.individual +
                      cultural.value * weights.cultural +
                      model.value * weights.model;
    
    const confidenceLevel = totalValue < 0.2 ? 'high' :
                          totalValue < 0.4 ? 'medium' :
                          totalValue < 0.7 ? 'low' : 'very_low';
    
    const reliability = totalValue < 0.15 ? 'excellent' :
                       totalValue < 0.3 ? 'good' :
                       totalValue < 0.6 ? 'fair' : 'poor';
    
    return {
      semantic,
      individual,
      cultural,
      model,
      total: {
        value: totalValue,
        confidenceLevel,
        reliability
      }
    };
  }

  /**
   * Calculate overall confidence score
   */
  private calculateOverallConfidence(uncertaintyDecomposition: UncertaintyDecomposition): number {
    return Math.max(0, 1 - uncertaintyDecomposition.total.value);
  }

  /**
   * Assess data quality
   */
  private assessDataQuality(responses: any[], culturalContext: string): {
    sampleSize: 'insufficient' | 'minimal' | 'adequate' | 'good' | 'excellent';
    responseQuality: 'poor' | 'fair' | 'good' | 'excellent';
    culturalRepresentation: 'limited' | 'fair' | 'diverse' | 'comprehensive';
  } {
    
    // Sample size assessment
    const sampleSize = responses.length < 3 ? 'insufficient' :
                      responses.length < 5 ? 'minimal' :
                      responses.length < 8 ? 'adequate' :
                      responses.length < 12 ? 'good' : 'excellent';
    
    // Response quality assessment
    const avgReasoningLength = responses.reduce((sum, r) => 
      sum + (r.reasoning?.length || 0), 0) / responses.length;
    
    const responseQuality = avgReasoningLength < 20 ? 'poor' :
                           avgReasoningLength < 50 ? 'fair' :
                           avgReasoningLength < 100 ? 'good' : 'excellent';
    
    // Cultural representation assessment
    const culturalRepresentation = culturalContext === 'universal' ? 'limited' :
                                  culturalContext.includes('mixed') ? 'diverse' :
                                  'fair';
    
    return {
      sampleSize,
      responseQuality,
      culturalRepresentation
    };
  }

  /**
   * Generate recommendations based on uncertainty analysis
   */
  private generateRecommendations(
    uncertaintyDecomposition: UncertaintyDecomposition,
    dataQuality: any
  ): string[] {
    
    const recommendations: string[] = [];
    
    // Sample size recommendations
    if (dataQuality.sampleSize === 'insufficient') {
      recommendations.push('Complete at least 3 more dilemmas for minimal reliability');
    } else if (dataQuality.sampleSize === 'minimal') {
      recommendations.push('Complete 3-5 more dilemmas for improved accuracy');
    }
    
    // Response quality recommendations
    if (dataQuality.responseQuality === 'poor') {
      recommendations.push('Provide more detailed reasoning in future responses');
    }
    
    // Uncertainty-specific recommendations
    if (uncertaintyDecomposition.semantic.value > 0.5) {
      recommendations.push('Consider clarifying your reasoning with more specific examples');
    }
    
    if (uncertaintyDecomposition.individual.value > 0.6) {
      recommendations.push('Complete additional responses to establish consistent patterns');
    }
    
    if (uncertaintyDecomposition.cultural.value > 0.5) {
      recommendations.push('Cultural context may need manual verification');
    }
    
    if (uncertaintyDecomposition.total.value < 0.2) {
      recommendations.push('Profile shows high confidence - results are likely reliable');
    }
    
    return recommendations;
  }
}

export const informationTheoreticUncertainty = new InformationTheoreticUncertainty();