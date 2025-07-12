/**
 * Statistical Foundation for Ethical Tactic Discovery
 * 
 * Implements rigorous statistical methods for tactic identification and validation
 * Based on expert panel recommendations
 */

export interface StatisticalEvidence {
  observations: number;
  mean: number;
  variance: number;
  standardError: number;
  confidenceInterval: [number, number];
  pValue: number;
  effectSize: number;
  significanceLevel: number;
}

export interface BayesianTacticAnalysis {
  posterior: number;
  prior: number;
  likelihood: number;
  credibleInterval: [number, number];
  bayesFactor: number;
}

export interface ValidationMetrics {
  convergentValidity: number;
  discriminantValidity: number;
  testRetestReliability: number;
  interRaterReliability: number;
  predictiveAccuracy: number;
  crossValidationScore: number;
}

export class StatisticalFoundation {
  private readonly ALPHA = 0.05; // Significance level
  private readonly CONFIDENCE_LEVEL = 0.95;
  private readonly MIN_SAMPLE_SIZE = 10;
  
  /**
   * BAYESIAN TACTIC IDENTIFICATION
   * 
   * P(tactic|evidence) = P(evidence|tactic) × P(tactic) / P(evidence)
   */
  calculateBayesianTacticProbability(
    evidence: number[],
    priorProbability: number,
    populationBaseline: number[]
  ): BayesianTacticAnalysis {
    
    // Calculate likelihood P(evidence|tactic)
    const likelihood = this.calculateLikelihood(evidence, populationBaseline);
    
    // Calculate marginal probability P(evidence)
    const marginalProbability = this.calculateMarginalProbability(evidence, priorProbability, populationBaseline);
    
    // Posterior probability using Bayes' theorem
    const posterior = (likelihood * priorProbability) / marginalProbability;
    
    // Credible interval using Beta distribution (conjugate prior)
    const credibleInterval = this.calculateCredibleInterval(evidence, priorProbability);
    
    // Bayes factor for model comparison
    const bayesFactor = likelihood / this.calculateNullLikelihood(evidence);
    
    return {
      posterior,
      prior: priorProbability,
      likelihood,
      credibleInterval,
      bayesFactor
    };
  }

  /**
   * CONFIDENCE INTERVALS WITH PROPER UNCERTAINTY QUANTIFICATION
   */
  calculateConfidenceInterval(
    data: number[],
    confidenceLevel: number = this.CONFIDENCE_LEVEL
  ): StatisticalEvidence {
    
    if (data.length < this.MIN_SAMPLE_SIZE) {
      throw new Error(`Insufficient sample size: ${data.length} < ${this.MIN_SAMPLE_SIZE}`);
    }
    
    const n = data.length;
    const mean = data.reduce((sum, x) => sum + x, 0) / n;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
    const standardError = Math.sqrt(variance / n);
    
    // t-distribution for small samples
    const degreesOfFreedom = n - 1;
    const tCritical = this.tDistributionCriticalValue(confidenceLevel, degreesOfFreedom);
    
    const marginOfError = tCritical * standardError;
    const confidenceInterval: [number, number] = [
      mean - marginOfError,
      mean + marginOfError
    ];
    
    // One-sample t-test against null hypothesis (mean = 0)
    const tStatistic = mean / standardError;
    const pValue = this.tTestPValue(tStatistic, degreesOfFreedom);
    
    // Cohen's d effect size
    const effectSize = mean / Math.sqrt(variance);
    
    return {
      observations: n,
      mean,
      variance,
      standardError,
      confidenceInterval,
      pValue,
      effectSize,
      significanceLevel: 1 - confidenceLevel
    };
  }

  /**
   * MULTIPLE TESTING CORRECTION
   * 
   * Adjusts p-values for multiple hypothesis testing
   */
  bonferroniCorrection(pValues: number[]): number[] {
    const m = pValues.length;
    return pValues.map(p => Math.min(1.0, p * m));
  }

  benjaminiHochbergCorrection(pValues: number[]): number[] {
    const m = pValues.length;
    const sortedIndices = pValues
      .map((p, i) => ({ p, index: i }))
      .sort((a, b) => a.p - b.p);
    
    const adjustedPValues = new Array(m);
    let cumulative = 1.0;
    
    for (let i = m - 1; i >= 0; i--) {
      const { p, index } = sortedIndices[i];
      const adjustment = (p * m) / (i + 1);
      cumulative = Math.min(cumulative, adjustment);
      adjustedPValues[index] = cumulative;
    }
    
    return adjustedPValues;
  }

  /**
   * CROSS-VALIDATION FRAMEWORK
   */
  kFoldCrossValidation<T>(
    data: T[],
    k: number,
    trainFunction: (trainData: T[]) => any,
    testFunction: (model: any, testData: T[]) => number
  ): { mean: number; std: number; folds: number[] } {
    
    if (k > data.length) {
      throw new Error(`k (${k}) cannot be larger than dataset size (${data.length})`);
    }
    
    const shuffled = this.shuffleArray([...data]);
    const foldSize = Math.floor(data.length / k);
    const scores: number[] = [];
    
    for (let i = 0; i < k; i++) {
      const testStart = i * foldSize;
      const testEnd = i === k - 1 ? data.length : (i + 1) * foldSize;
      
      const testData = shuffled.slice(testStart, testEnd);
      const trainData = [
        ...shuffled.slice(0, testStart),
        ...shuffled.slice(testEnd)
      ];
      
      const model = trainFunction(trainData);
      const score = testFunction(model, testData);
      scores.push(score);
    }
    
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const std = Math.sqrt(variance);
    
    return { mean, std, folds: scores };
  }

  /**
   * BOOTSTRAP CONFIDENCE INTERVALS
   */
  bootstrapConfidenceInterval(
    data: number[],
    statistic: (data: number[]) => number,
    iterations: number = 1000,
    confidenceLevel: number = this.CONFIDENCE_LEVEL
  ): [number, number] {
    
    const bootstrapStatistics: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const resample = this.bootstrapSample(data);
      const stat = statistic(resample);
      bootstrapStatistics.push(stat);
    }
    
    bootstrapStatistics.sort((a, b) => a - b);
    
    const alpha = 1 - confidenceLevel;
    const lowerIndex = Math.floor(alpha / 2 * iterations);
    const upperIndex = Math.floor((1 - alpha / 2) * iterations);
    
    return [
      bootstrapStatistics[lowerIndex],
      bootstrapStatistics[upperIndex]
    ];
  }

  /**
   * EFFECT SIZE CALCULATIONS
   */
  calculateCohenD(group1: number[], group2: number[]): number {
    const mean1 = group1.reduce((sum, x) => sum + x, 0) / group1.length;
    const mean2 = group2.reduce((sum, x) => sum + x, 0) / group2.length;
    
    const var1 = group1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (group1.length - 1);
    const var2 = group2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (group2.length - 1);
    
    const pooledSD = Math.sqrt(((group1.length - 1) * var1 + (group2.length - 1) * var2) / 
                              (group1.length + group2.length - 2));
    
    return (mean1 - mean2) / pooledSD;
  }

  /**
   * POWER ANALYSIS
   */
  calculateStatisticalPower(
    effectSize: number,
    sampleSize: number,
    alpha: number = this.ALPHA
  ): number {
    // Simplified power calculation for one-sample t-test
    const ncp = effectSize * Math.sqrt(sampleSize); // Non-centrality parameter
    const criticalT = this.tDistributionCriticalValue(1 - alpha, sampleSize - 1);
    
    // Approximate power using normal distribution
    const power = 1 - this.normalCDF(criticalT - ncp);
    return Math.max(0, Math.min(1, power));
  }

  /**
   * SAMPLE SIZE CALCULATION
   */
  calculateRequiredSampleSize(
    expectedEffectSize: number,
    desiredPower: number = 0.8,
    alpha: number = this.ALPHA
  ): number {
    // Iterative approach to find required sample size
    for (let n = 3; n <= 10000; n++) {
      const power = this.calculateStatisticalPower(expectedEffectSize, n, alpha);
      if (power >= desiredPower) {
        return n;
      }
    }
    return 10000; // Maximum reasonable sample size
  }

  // Helper methods

  private calculateLikelihood(evidence: number[], baseline: number[]): number {
    // Simplified likelihood using normal distribution
    const evidenceMean = evidence.reduce((sum, x) => sum + x, 0) / evidence.length;
    const baselineMean = baseline.reduce((sum, x) => sum + x, 0) / baseline.length;
    const baselineVar = baseline.reduce((sum, x) => sum + Math.pow(x - baselineMean, 2), 0) / baseline.length;
    
    return this.normalPDF(evidenceMean, baselineMean, Math.sqrt(baselineVar));
  }

  private calculateMarginalProbability(
    evidence: number[],
    priorProbability: number,
    baseline: number[]
  ): number {
    const likelihood = this.calculateLikelihood(evidence, baseline);
    const nullLikelihood = this.calculateNullLikelihood(evidence);
    
    return likelihood * priorProbability + nullLikelihood * (1 - priorProbability);
  }

  private calculateNullLikelihood(evidence: number[]): number {
    // Likelihood under null hypothesis (random/baseline)
    return 0.5; // Simplified for binary classification
  }

  private calculateCredibleInterval(
    evidence: number[],
    priorProbability: number
  ): [number, number] {
    // Beta distribution conjugate prior for binomial likelihood
    const successes = evidence.filter(x => x > 0.5).length;
    const trials = evidence.length;
    
    const alpha = successes + priorProbability * 10; // Prior strength = 10
    const beta = trials - successes + (1 - priorProbability) * 10;
    
    // 95% credible interval using beta quantiles
    return [
      this.betaQuantile(0.025, alpha, beta),
      this.betaQuantile(0.975, alpha, beta)
    ];
  }

  private tDistributionCriticalValue(confidenceLevel: number, df: number): number {
    // Simplified approximation for t-distribution critical values
    const alpha = 1 - confidenceLevel;
    
    if (df >= 30) {
      return this.normalQuantile(1 - alpha / 2);
    }
    
    // Approximation for smaller degrees of freedom
    const z = this.normalQuantile(1 - alpha / 2);
    const correction = z * z * z / (4 * df);
    return z + correction;
  }

  private tTestPValue(tStatistic: number, degreesOfFreedom: number): number {
    // Two-tailed p-value approximation
    if (degreesOfFreedom >= 30) {
      const pValue = 2 * (1 - this.normalCDF(Math.abs(tStatistic)));
      return Math.max(1e-10, pValue); // Prevent underflow to 0
    }
    
    // Simplified approximation for t-distribution
    const normalP = 2 * (1 - this.normalCDF(Math.abs(tStatistic)));
    const correction = 1 + (tStatistic * tStatistic) / (4 * degreesOfFreedom);
    const pValue = normalP * correction;
    return Math.max(1e-10, pValue); // Prevent underflow to 0
  }

  private normalPDF(x: number, mean: number = 0, std: number = 1): number {
    const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mean) / std, 2);
    return coefficient * Math.exp(exponent);
  }

  private normalCDF(x: number): number {
    // Approximation using error function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private normalQuantile(p: number): number {
    // Beasley-Springer-Moro algorithm approximation
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1');
    }
    
    const a0 = 2.50662823884;
    const a1 = -18.61500062529;
    const a2 = 41.39119773534;
    const a3 = -25.44106049637;
    
    const b1 = -8.47351093090;
    const b2 = 23.08336743743;
    const b3 = -21.06224101826;
    const b4 = 3.13082909833;
    
    const y = p - 0.5;
    
    if (Math.abs(y) < 0.42) {
      const r = y * y;
      return y * (((a3 * r + a2) * r + a1) * r + a0) / 
             ((((b4 * r + b3) * r + b2) * r + b1) * r + 1);
    }
    
    const r = p < 0.5 ? p : 1 - p;
    const s = Math.sqrt(-Math.log(r));
    const t = s - ((2.515517 + 0.802853 * s + 0.010328 * s * s) / 
                   (1 + 1.432788 * s + 0.189269 * s * s + 0.001308 * s * s * s));
    
    return p < 0.5 ? -t : t;
  }

  private betaQuantile(p: number, alpha: number, beta: number): number {
    // Simplified beta quantile approximation
    // For production, use proper incomplete beta function
    if (alpha === 1 && beta === 1) return p;
    if (alpha === 1) return 1 - Math.pow(1 - p, 1 / beta);
    if (beta === 1) return Math.pow(p, 1 / alpha);
    
    // Rough approximation for general case
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
    
    // Normal approximation when alpha and beta are large
    if (alpha > 5 && beta > 5) {
      const z = this.normalQuantile(p);
      return mean + z * Math.sqrt(variance);
    }
    
    return mean; // Fallback to mean
  }

  private erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private bootstrapSample(data: number[]): number[] {
    const sample: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sample.push(data[randomIndex]);
    }
    return sample;
  }
}

export const statisticalFoundation = new StatisticalFoundation();