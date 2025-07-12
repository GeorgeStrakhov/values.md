/**
 * Hierarchical Individual Modeling - Layer 2: Individual Differences
 * 
 * Implements Bayesian hierarchical models for individual ethical reasoning patterns
 * Separates individual differences from measurement error and cultural variation
 */

export interface IndividualParameters {
  userId: string;
  moralReasoningProfile: number[];
  culturalBackground: string;
  confidenceLevel: number;
  responsesCount: number;
  stability: number;
}

export interface PopulationParameters {
  meanProfile: number[];
  covarianceMatrix: number[][];
  culturalEffects: Record<string, number[]>;
  contextualEffects: Record<string, number[]>;
}

export interface BayesianInferenceResult {
  individualParameters: IndividualParameters;
  populationParameters: PopulationParameters;
  uncertainty: {
    individual: number;
    population: number;
    cultural: number;
    measurement: number;
  };
  credibleIntervals: Record<string, [number, number]>;
  convergenceMetrics: {
    rHat: number;
    effectiveSampleSize: number;
    mcmcChains: number;
  };
}

/**
 * Hierarchical Bayesian Model for Individual Moral Reasoning
 * 
 * Models individual responses as emerging from:
 * - Population-level moral patterns
 * - Individual-specific variations
 * - Cultural context effects
 * - Situational adjustments
 * - Measurement uncertainty
 */
export class HierarchicalIndividualModel {
  private populationPriors: PopulationParameters;
  private individualCache: Map<string, IndividualParameters> = new Map();
  private convergenceThreshold = 1.1; // R-hat threshold for convergence
  
  constructor() {
    this.initializePopulationPriors();
  }

  /**
   * Initialize population-level priors based on moral psychology research
   */
  private initializePopulationPriors(): void {
    // Based on Moral Foundations Theory and cross-cultural research
    this.populationPriors = {
      meanProfile: [
        0.4, // Care/Harm
        0.3, // Fairness/Cheating  
        0.2, // Loyalty/Betrayal
        0.15, // Authority/Subversion
        0.1, // Sanctity/Degradation
        0.25, // Autonomy
        0.35  // Justice
      ],
      covarianceMatrix: this.createCovarianceMatrix(7),
      culturalEffects: {
        'western_individualistic': [0.1, 0.2, -0.2, -0.1, -0.1, 0.3, 0.2],
        'eastern_collectivistic': [-0.1, 0.1, 0.3, 0.2, 0.1, -0.2, 0.0],
        'african_ubuntu': [0.2, 0.3, 0.2, 0.0, 0.0, 0.1, 0.3],
        'universal': [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      },
      contextualEffects: {
        'personal_relationships': [0.3, 0.1, 0.2, -0.1, 0.0, 0.1, 0.0],
        'public_policy': [-0.1, 0.3, 0.0, 0.1, 0.0, 0.2, 0.4],
        'professional_ethics': [0.0, 0.4, -0.1, 0.2, 0.0, 0.1, 0.3],
        'environmental': [0.2, 0.2, 0.0, 0.0, 0.2, 0.1, 0.2]
      }
    };
  }

  /**
   * Create realistic covariance matrix for moral reasoning dimensions
   */
  private createCovarianceMatrix(dimensions: number): number[][] {
    const matrix: number[][] = [];
    
    for (let i = 0; i < dimensions; i++) {
      matrix[i] = [];
      for (let j = 0; j < dimensions; j++) {
        if (i === j) {
          matrix[i][j] = 0.2; // Diagonal variance
        } else {
          // Realistic correlations between moral dimensions
          const correlation = this.getMoralDimensionCorrelation(i, j);
          matrix[i][j] = correlation * 0.1; // Convert to covariance
        }
      }
    }
    
    return matrix;
  }

  /**
   * Get realistic correlations between moral reasoning dimensions
   */
  private getMoralDimensionCorrelation(dim1: number, dim2: number): number {
    // Based on empirical moral psychology research
    const correlations = [
      [1.0, 0.3, 0.1, 0.0, 0.0, 0.2, 0.4], // Care
      [0.3, 1.0, 0.0, 0.2, 0.0, 0.3, 0.6], // Fairness
      [0.1, 0.0, 1.0, 0.4, 0.3, -0.2, 0.1], // Loyalty
      [0.0, 0.2, 0.4, 1.0, 0.3, -0.1, 0.2], // Authority
      [0.0, 0.0, 0.3, 0.3, 1.0, -0.1, 0.0], // Sanctity
      [0.2, 0.3, -0.2, -0.1, -0.1, 1.0, 0.2], // Autonomy
      [0.4, 0.6, 0.1, 0.2, 0.0, 0.2, 1.0]  // Justice
    ];
    
    return correlations[dim1]?.[dim2] || 0;
  }

  /**
   * Fit hierarchical model to individual responses
   */
  fitIndividualModel(
    userId: string,
    responses: Array<{
      semanticAnalysis: any;
      context: string;
      culturalBackground: string;
      responseTime: number;
    }>
  ): BayesianInferenceResult {
    
    if (responses.length < 3) {
      throw new Error('Minimum 3 responses required for hierarchical modeling');
    }

    // Extract features from semantic analysis
    const responseFeatures = responses.map(r => this.extractMoralFeatures(r.semanticAnalysis));
    
    // Determine cultural context
    const culturalBackground = responses[0].culturalBackground || 'universal';
    
    // Run Bayesian inference (simplified implementation)
    const inferenceResult = this.runBayesianInference(
      userId,
      responseFeatures,
      culturalBackground,
      responses.map(r => r.context)
    );
    
    // Cache individual parameters
    this.individualCache.set(userId, inferenceResult.individualParameters);
    
    return inferenceResult;
  }

  /**
   * Extract moral reasoning features from semantic analysis
   */
  private extractMoralFeatures(semanticAnalysis: any): number[] {
    const features = [0, 0, 0, 0, 0, 0, 0]; // 7 moral dimensions
    
    // Map semantic concepts to moral dimensions
    semanticAnalysis.activatedConcepts?.forEach((concept: any) => {
      const activation = concept.activation;
      
      switch (concept.concept) {
        case 'harm_prevention':
        case 'relational_care':
          features[0] += activation; // Care/Harm
          break;
        case 'rights_protection':
        case 'duty_obligation':
          features[1] += activation; // Fairness
          break;
        case 'utilitarian_welfare':
          features[6] += activation; // Justice
          break;
        case 'virtue_character':
          features[5] += activation; // Autonomy (personal excellence)
          break;
      }
    });
    
    // Normalize features
    const sum = features.reduce((s, f) => s + f, 0);
    if (sum > 0) {
      return features.map(f => f / sum);
    }
    
    return features;
  }

  /**
   * Run Bayesian inference using MCMC sampling (simplified)
   */
  private runBayesianInference(
    userId: string,
    responseFeatures: number[][],
    culturalBackground: string,
    contexts: string[]
  ): BayesianInferenceResult {
    
    // Simplified Bayesian inference - in production use proper MCMC
    const nSamples = 1000;
    const samples: number[][][] = [];
    
    // Initialize chains
    const nChains = 4;
    for (let chain = 0; chain < nChains; chain++) {
      samples[chain] = this.sampleChain(responseFeatures, culturalBackground, contexts, nSamples);
    }
    
    // Calculate posterior statistics
    const posteriorMean = this.calculatePosteriorMean(samples);
    const credibleIntervals = this.calculateCredibleIntervals(samples);
    const convergenceMetrics = this.assessConvergence(samples);
    
    // Calculate uncertainty decomposition
    const uncertainty = this.calculateUncertaintyDecomposition(samples, responseFeatures.length);
    
    const individualParameters: IndividualParameters = {
      userId,
      moralReasoningProfile: posteriorMean,
      culturalBackground,
      confidenceLevel: this.calculateOverallConfidence(uncertainty),
      responsesCount: responseFeatures.length,
      stability: this.calculateStability(samples)
    };

    return {
      individualParameters,
      populationParameters: this.populationPriors,
      uncertainty,
      credibleIntervals,
      convergenceMetrics
    };
  }

  /**
   * Sample from posterior using simplified MCMC
   */
  private sampleChain(
    responseFeatures: number[][],
    culturalBackground: string,
    contexts: string[],
    nSamples: number
  ): number[][] {
    
    const samples: number[][] = [];
    let currentSample = [...this.populationPriors.meanProfile];
    
    for (let i = 0; i < nSamples; i++) {
      // Propose new sample (simplified Metropolis-Hastings)
      const proposal = currentSample.map(x => x + (Math.random() - 0.5) * 0.1);
      
      // Calculate acceptance probability
      const currentLogLikelihood = this.calculateLogLikelihood(currentSample, responseFeatures, culturalBackground);
      const proposalLogLikelihood = this.calculateLogLikelihood(proposal, responseFeatures, culturalBackground);
      
      const acceptanceProbability = Math.min(1, Math.exp(proposalLogLikelihood - currentLogLikelihood));
      
      if (Math.random() < acceptanceProbability) {
        currentSample = proposal;
      }
      
      samples.push([...currentSample]);
    }
    
    return samples;
  }

  /**
   * Calculate log-likelihood for Bayesian inference
   */
  private calculateLogLikelihood(
    parameters: number[],
    responseFeatures: number[][],
    culturalBackground: string
  ): number {
    
    let logLikelihood = 0;
    const culturalEffect = this.populationPriors.culturalEffects[culturalBackground] || 
                          this.populationPriors.culturalEffects['universal'];
    
    responseFeatures.forEach(features => {
      features.forEach((feature, i) => {
        const expectedValue = parameters[i] + culturalEffect[i];
        const variance = 0.1; // Simplified variance
        
        // Gaussian log-likelihood
        logLikelihood += -0.5 * Math.log(2 * Math.PI * variance) - 
                        0.5 * Math.pow(feature - expectedValue, 2) / variance;
      });
    });
    
    return logLikelihood;
  }

  /**
   * Calculate posterior mean across chains
   */
  private calculatePosteriorMean(samples: number[][][]): number[] {
    const nDimensions = samples[0][0].length;
    const mean = new Array(nDimensions).fill(0);
    let totalSamples = 0;
    
    samples.forEach(chain => {
      chain.forEach(sample => {
        sample.forEach((value, i) => {
          mean[i] += value;
        });
        totalSamples++;
      });
    });
    
    return mean.map(m => m / totalSamples);
  }

  /**
   * Calculate credible intervals for parameters
   */
  private calculateCredibleIntervals(samples: number[][][]): Record<string, [number, number]> {
    const allSamples: number[][] = [];
    samples.forEach(chain => allSamples.push(...chain));
    
    const nDimensions = allSamples[0].length;
    const intervals: Record<string, [number, number]> = {};
    
    const dimensionNames = ['care', 'fairness', 'loyalty', 'authority', 'sanctity', 'autonomy', 'justice'];
    
    for (let i = 0; i < nDimensions; i++) {
      const dimensionSamples = allSamples.map(s => s[i]).sort((a, b) => a - b);
      const lowerIndex = Math.floor(dimensionSamples.length * 0.025);
      const upperIndex = Math.floor(dimensionSamples.length * 0.975);
      
      intervals[dimensionNames[i]] = [dimensionSamples[lowerIndex], dimensionSamples[upperIndex]];
    }
    
    return intervals;
  }

  /**
   * Assess MCMC convergence using R-hat statistic
   */
  private assessConvergence(samples: number[][][]): {
    rHat: number;
    effectiveSampleSize: number;
    mcmcChains: number;
  } {
    
    // Simplified R-hat calculation
    const nChains = samples.length;
    const nSamples = samples[0].length;
    const nDimensions = samples[0][0].length;
    
    let maxRHat = 1.0;
    
    for (let dim = 0; dim < nDimensions; dim++) {
      const chainMeans = samples.map(chain => {
        return chain.reduce((sum, sample) => sum + sample[dim], 0) / nSamples;
      });
      
      const overallMean = chainMeans.reduce((sum, mean) => sum + mean, 0) / nChains;
      
      const betweenChainVariance = nSamples * chainMeans.reduce((sum, mean) => 
        sum + Math.pow(mean - overallMean, 2), 0) / (nChains - 1);
      
      const withinChainVariance = samples.reduce((sum, chain) => {
        const chainMean = chainMeans[samples.indexOf(chain)];
        return sum + chain.reduce((chainSum, sample) => 
          chainSum + Math.pow(sample[dim] - chainMean, 2), 0);
      }, 0) / (nChains * (nSamples - 1));
      
      const pooledVariance = ((nSamples - 1) * withinChainVariance + betweenChainVariance) / nSamples;
      const rHat = Math.sqrt(pooledVariance / withinChainVariance);
      
      maxRHat = Math.max(maxRHat, rHat);
    }
    
    return {
      rHat: maxRHat,
      effectiveSampleSize: nChains * nSamples / 2, // Simplified
      mcmcChains: nChains
    };
  }

  /**
   * Calculate uncertainty decomposition
   */
  private calculateUncertaintyDecomposition(samples: number[][][], nResponses: number): {
    individual: number;
    population: number;
    cultural: number;
    measurement: number;
  } {
    
    // Calculate sample variance as proxy for uncertainty
    const allSamples: number[][] = [];
    samples.forEach(chain => allSamples.push(...chain));
    
    const variance = this.calculateSampleVariance(allSamples);
    const totalUncertainty = variance.reduce((sum, v) => sum + v, 0) / variance.length;
    
    // Decompose uncertainty (simplified)
    const measurementUncertainty = 1 / Math.sqrt(nResponses); // Decreases with more data
    const individualUncertainty = totalUncertainty * 0.6;
    const populationUncertainty = totalUncertainty * 0.2;
    const culturalUncertainty = totalUncertainty * 0.2;
    
    return {
      individual: Math.min(individualUncertainty, 1.0),
      population: Math.min(populationUncertainty, 1.0),
      cultural: Math.min(culturalUncertainty, 1.0),
      measurement: Math.min(measurementUncertainty, 1.0)
    };
  }

  /**
   * Calculate sample variance for each dimension
   */
  private calculateSampleVariance(samples: number[][]): number[] {
    const nDimensions = samples[0].length;
    const means = this.calculatePosteriorMean([samples]);
    const variances = new Array(nDimensions).fill(0);
    
    samples.forEach(sample => {
      sample.forEach((value, i) => {
        variances[i] += Math.pow(value - means[i], 2);
      });
    });
    
    return variances.map(v => v / (samples.length - 1));
  }

  /**
   * Calculate overall confidence level
   */
  private calculateOverallConfidence(uncertainty: any): number {
    const totalUncertainty = Object.values(uncertainty).reduce((sum: number, u: any) => sum + u, 0) / 4;
    return Math.max(0, 1 - totalUncertainty);
  }

  /**
   * Calculate stability of moral reasoning profile
   */
  private calculateStability(samples: number[][][]): number {
    // Simplified stability calculation based on variance
    const allSamples: number[][] = [];
    samples.forEach(chain => allSamples.push(...chain));
    
    const variance = this.calculateSampleVariance(allSamples);
    const avgVariance = variance.reduce((sum, v) => sum + v, 0) / variance.length;
    
    return Math.max(0, 1 - avgVariance);
  }

  /**
   * Get cached individual parameters
   */
  getIndividualParameters(userId: string): IndividualParameters | undefined {
    return this.individualCache.get(userId);
  }

  /**
   * Update population priors based on new data
   */
  updatePopulationPriors(newData: Array<{ culturalBackground: string; features: number[] }>): void {
    // Implement online Bayesian updating of population parameters
    // This would be called periodically as new data comes in
    
    const culturalGroups = new Map<string, number[][]>();
    
    newData.forEach(data => {
      if (!culturalGroups.has(data.culturalBackground)) {
        culturalGroups.set(data.culturalBackground, []);
      }
      culturalGroups.get(data.culturalBackground)!.push(data.features);
    });
    
    // Update cultural effects based on new data
    culturalGroups.forEach((features, culture) => {
      if (features.length > 10) { // Minimum sample size
        const culturalMean = this.calculateMean(features);
        const populationMean = this.populationPriors.meanProfile;
        
        // Update cultural effect as difference from population mean
        this.populationPriors.culturalEffects[culture] = culturalMean.map((mean, i) => 
          mean - populationMean[i]
        );
      }
    });
  }

  /**
   * Calculate mean of feature arrays
   */
  private calculateMean(features: number[][]): number[] {
    const nDimensions = features[0].length;
    const mean = new Array(nDimensions).fill(0);
    
    features.forEach(feature => {
      feature.forEach((value, i) => {
        mean[i] += value;
      });
    });
    
    return mean.map(m => m / features.length);
  }
}

export const hierarchicalIndividualModel = new HierarchicalIndividualModel();