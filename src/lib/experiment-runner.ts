// Core Experiment Runner Logic

import { db } from './db';
import { 
  alignmentExperimentBatches, 
  experimentTestScenarios, 
  experimentLlmResponses,
  experimentConsistencyAnalysis,
  userResponses,
  dilemmas 
} from './schema';
import { eq, inArray } from 'drizzle-orm';
import LLMExperimentRunner, { LLM_PROVIDERS } from './llm-providers';
import { 
  BASELINE_PROMPT_CONFIG, 
  ALIGNED_PROMPT_CONFIG,
  SCENARIO_VARIATIONS,
  CONSISTENCY_TEST_VARIATIONS 
} from './experiment-prompts';

export interface ExperimentConfig {
  type: 'baseline_vs_aligned' | 'consistency_test' | 'cross_validation';
  llmProviders: string[];
  humanSessionIds: string[]; // sessions that have generated VALUES.md
  scenarioCount: number;
  scenarioSelection: 'random' | 'domain_specific' | 'high_difficulty';
  includeVariations: boolean;
  description?: string;
}

export interface ExperimentProgress {
  batchId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  estimatedCost: number;
  actualCost: number;
  estimatedTimeRemaining: number;
  resultsPreview?: any;
}

export class AlignmentExperimentRunner {
  private llmRunner: LLMExperimentRunner;
  private batchId: string;

  constructor(apiKeys: Record<string, string>) {
    this.llmRunner = new LLMExperimentRunner(apiKeys);
    this.batchId = '';
  }

  async validateSetup(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Test API keys
    const keyValidation = await this.llmRunner.validateApiKeys();
    for (const [provider, isValid] of Object.entries(keyValidation)) {
      if (!isValid) {
        errors.push(`Invalid API key for ${provider}`);
      }
    }
    
    // Check database connectivity
    try {
      await db.select().from(dilemmas).limit(1);
    } catch (error) {
      errors.push('Database connection failed');
    }
    
    return { valid: errors.length === 0, errors };
  }

  async startExperiment(config: ExperimentConfig): Promise<string> {
    // Create experiment batch
    const [batch] = await db.insert(alignmentExperimentBatches).values({
      experimentType: config.type,
      description: config.description || `${config.type} experiment`,
      llmProviders: config.llmProviders,
      testScenariosCount: config.scenarioCount,
      humanSessionsCount: config.humanSessionIds.length,
      status: 'queued',
      estimatedCostUsd: await this.estimateExperimentCost(config)
    }).returning();

    this.batchId = batch.batchId;

    // Start experiment asynchronously
    this.runExperimentAsync(config);
    
    return this.batchId;
  }

  private async runExperimentAsync(config: ExperimentConfig): Promise<void> {
    try {
      await this.updateBatchStatus('running', 0, 'Generating test scenarios');
      
      // Step 1: Generate test scenarios
      const scenarios = await this.generateTestScenarios(config);
      await this.updateBatchStatus('running', 20, 'Loading human VALUES.md files');
      
      // Step 2: Load human values
      const humanValues = await this.loadHumanValues(config.humanSessionIds);
      await this.updateBatchStatus('running', 30, 'Running baseline LLM tests');
      
      // Step 3: Run baseline tests (no VALUES.md)
      const baselineResults = await this.runBaselineTests(scenarios, config.llmProviders);
      await this.updateBatchStatus('running', 60, 'Running aligned LLM tests');
      
      // Step 4: Run aligned tests (with VALUES.md)
      const alignedResults = await this.runAlignedTests(scenarios, humanValues, config.llmProviders);
      await this.updateBatchStatus('running', 90, 'Analyzing results');
      
      // Step 5: Analyze consistency and alignment
      const analysis = await this.analyzeResults(baselineResults, alignedResults, humanValues);
      
      await this.updateBatchStatus('completed', 100, 'Experiment complete');
      
    } catch (error) {
      console.error('Experiment failed:', error);
      await this.updateBatchStatus('failed', 0, `Error: ${error}`);
    }
  }

  private async generateTestScenarios(config: ExperimentConfig): Promise<any[]> {
    // Get existing dilemmas based on selection criteria
    let baseScenarios;
    
    switch (config.scenarioSelection) {
      case 'high_difficulty':
        baseScenarios = await db.select()
          .from(dilemmas)
          .where(eq(dilemmas.difficulty, 8))
          .limit(config.scenarioCount);
        break;
      case 'domain_specific':
        baseScenarios = await db.select()
          .from(dilemmas)
          .where(inArray(dilemmas.domain, ['healthcare', 'technology', 'finance']))
          .limit(config.scenarioCount);
        break;
      default:
        baseScenarios = await db.select()
          .from(dilemmas)
          .limit(config.scenarioCount);
    }

    const scenarios = [];
    
    for (const baseDilemma of baseScenarios) {
      // Add original scenario
      const [scenario] = await db.insert(experimentTestScenarios).values({
        batchId: this.batchId,
        sourceDilemmaId: baseDilemma.dilemmaId,
        variationType: 'identical',
        scenarioText: baseDilemma.scenario,
        choiceA: baseDilemma.choiceA,
        choiceB: baseDilemma.choiceB,
        choiceC: baseDilemma.choiceC,
        choiceD: baseDilemma.choiceD,
        expectedMotifs: {
          a: baseDilemma.choiceAMotif,
          b: baseDilemma.choiceBMotif,
          c: baseDilemma.choiceCMotif,
          d: baseDilemma.choiceDMotif
        },
        difficultyRating: baseDilemma.difficulty,
        domain: baseDilemma.domain
      }).returning();
      
      scenarios.push(scenario);
      
      // Add variations if requested
      if (config.includeVariations) {
        for (const variation of CONSISTENCY_TEST_VARIATIONS.slice(0, 2)) {
          const variedScenario = this.createScenarioVariation(baseDilemma, variation);
          
          const [variationScenario] = await db.insert(experimentTestScenarios).values({
            batchId: this.batchId,
            sourceDilemmaId: baseDilemma.dilemmaId,
            variationType: variation.variation,
            scenarioText: variedScenario.scenario,
            choiceA: variedScenario.choiceA,
            choiceB: variedScenario.choiceB,
            choiceC: variedScenario.choiceC,
            choiceD: variedScenario.choiceD,
            expectedMotifs: {
              a: baseDilemma.choiceAMotif,
              b: baseDilemma.choiceBMotif,
              c: baseDilemma.choiceCMotif,
              d: baseDilemma.choiceDMotif
            },
            difficultyRating: baseDilemma.difficulty,
            domain: baseDilemma.domain
          }).returning();
          
          scenarios.push(variationScenario);
        }
      }
    }
    
    return scenarios;
  }

  private createScenarioVariation(baseDilemma: any, variation: any): any {
    let modifiedScenario = baseDilemma.scenario;
    
    switch (variation.variation) {
      case 'context_shift':
        const newContext = SCENARIO_VARIATIONS.contextShifts[
          Math.floor(Math.random() * SCENARIO_VARIATIONS.contextShifts.length)
        ];
        modifiedScenario += ` This situation occurs in ${newContext}.`;
        break;
        
      case 'stakes_change':
        const stakesLevel = SCENARIO_VARIATIONS.stakesLevels[
          Math.floor(Math.random() * SCENARIO_VARIATIONS.stakesLevels.length)
        ];
        modifiedScenario += ` The stakes involved are ${stakesLevel}.`;
        break;
        
      case 'stakeholder_shift':
        const newStakeholders = SCENARIO_VARIATIONS.stakeholderTypes[
          Math.floor(Math.random() * SCENARIO_VARIATIONS.stakeholderTypes.length)
        ];
        modifiedScenario += ` The primary people affected are ${newStakeholders}.`;
        break;
        
      case 'time_pressure':
        const timeConstraint = SCENARIO_VARIATIONS.timeConstraints[
          Math.floor(Math.random() * SCENARIO_VARIATIONS.timeConstraints.length)
        ];
        modifiedScenario += ` This decision must be made ${timeConstraint}.`;
        break;
    }
    
    return {
      scenario: modifiedScenario,
      choiceA: baseDilemma.choiceA,
      choiceB: baseDilemma.choiceB,
      choiceC: baseDilemma.choiceC,
      choiceD: baseDilemma.choiceD
    };
  }

  private async loadHumanValues(sessionIds: string[]): Promise<Record<string, string>> {
    const humanValues: Record<string, string> = {};
    
    for (const sessionId of sessionIds) {
      try {
        // Generate VALUES.md for this session
        const response = await fetch('/api/generate-values', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        
        if (response.ok) {
          const data = await response.json();
          humanValues[sessionId] = data.valuesMarkdown;
        }
      } catch (error) {
        console.warn(`Failed to load values for session ${sessionId}:`, error);
      }
    }
    
    return humanValues;
  }

  private async runBaselineTests(scenarios: any[], providers: string[]): Promise<any[]> {
    const results = [];
    let completedTests = 0;
    const totalTests = scenarios.length * providers.length;
    
    for (const scenario of scenarios) {
      for (const provider of providers) {
        try {
          const response = await this.llmRunner.callLLM(
            provider,
            BASELINE_PROMPT_CONFIG.systemPrompt,
            this.fillPromptTemplate(BASELINE_PROMPT_CONFIG.userPrompt, scenario),
            BASELINE_PROMPT_CONFIG.temperature,
            BASELINE_PROMPT_CONFIG.maxTokens
          );
          
          const [result] = await db.insert(experimentLlmResponses).values({
            batchId: this.batchId,
            scenarioId: scenario.scenarioId,
            humanSessionId: 'baseline', // No specific human session for baseline
            llmProvider: provider,
            alignmentCondition: 'baseline',
            valuesDocument: null,
            chosenOption: response.choice,
            reasoning: response.reasoning,
            confidenceScore: response.confidence,
            responseTimeMs: response.responseTime,
            tokenCount: response.tokenCount,
            costUsd: response.cost
          }).returning();
          
          results.push(result);
          
        } catch (error) {
          console.error(`Baseline test failed for ${provider} on scenario ${scenario.scenarioId}:`, error);
        }
        
        completedTests++;
        const progress = 30 + (completedTests / totalTests) * 30; // 30-60% progress range
        await this.updateBatchStatus('running', progress, `Baseline tests: ${completedTests}/${totalTests}`);
      }
    }
    
    return results;
  }

  private async runAlignedTests(scenarios: any[], humanValues: Record<string, string>, providers: string[]): Promise<any[]> {
    const results = [];
    let completedTests = 0;
    const totalTests = scenarios.length * providers.length * Object.keys(humanValues).length;
    
    for (const scenario of scenarios) {
      for (const provider of providers) {
        for (const [sessionId, valuesDocument] of Object.entries(humanValues)) {
          try {
            const systemPrompt = ALIGNED_PROMPT_CONFIG.systemPrompt.replace('{{valuesDocument}}', valuesDocument);
            
            const response = await this.llmRunner.callLLM(
              provider,
              systemPrompt,
              this.fillPromptTemplate(ALIGNED_PROMPT_CONFIG.userPrompt, scenario),
              ALIGNED_PROMPT_CONFIG.temperature,
              ALIGNED_PROMPT_CONFIG.maxTokens
            );
            
            const [result] = await db.insert(experimentLlmResponses).values({
              batchId: this.batchId,
              scenarioId: scenario.scenarioId,
              humanSessionId: sessionId,
              llmProvider: provider,
              alignmentCondition: 'aligned',
              valuesDocument: valuesDocument,
              chosenOption: response.choice,
              reasoning: response.reasoning,
              confidenceScore: response.confidence,
              responseTimeMs: response.responseTime,
              tokenCount: response.tokenCount,
              costUsd: response.cost,
              identifiedMotifs: response.valuesApplied || []
            }).returning();
            
            results.push(result);
            
          } catch (error) {
            console.error(`Aligned test failed for ${provider} on scenario ${scenario.scenarioId} with session ${sessionId}:`, error);
          }
          
          completedTests++;
          const progress = 60 + (completedTests / totalTests) * 30; // 60-90% progress range
          await this.updateBatchStatus('running', progress, `Aligned tests: ${completedTests}/${totalTests}`);
        }
      }
    }
    
    return results;
  }

  private fillPromptTemplate(template: string, scenario: any): string {
    return template
      .replace('{{scenario}}', scenario.scenarioText)
      .replace('{{choiceA}}', scenario.choiceA)
      .replace('{{choiceB}}', scenario.choiceB)
      .replace('{{choiceC}}', scenario.choiceC)
      .replace('{{choiceD}}', scenario.choiceD);
  }

  private async analyzeResults(baselineResults: any[], alignedResults: any[], humanValues: Record<string, string>): Promise<any> {
    // Group results by session and provider for analysis
    const analysisResults = [];
    
    for (const sessionId of Object.keys(humanValues)) {
      for (const provider of [...new Set(baselineResults.map(r => r.llmProvider))]) {
        const sessionBaseline = baselineResults.filter(r => r.llmProvider === provider);
        const sessionAligned = alignedResults.filter(r => 
          r.llmProvider === provider && r.humanSessionId === sessionId
        );
        
        // Calculate consistency metrics
        const consistency = this.calculateConsistencyMetrics(sessionBaseline, sessionAligned);
        
        const [analysis] = await db.insert(experimentConsistencyAnalysis).values({
          batchId: this.batchId,
          humanSessionId: sessionId,
          llmProvider: provider,
          scenarioCount: sessionBaseline.length,
          consistentChoices: consistency.consistentChoices,
          consistencyPercentage: consistency.consistencyPercentage,
          baselineAccuracy: consistency.baselineAccuracy,
          alignedAccuracy: consistency.alignedAccuracy,
          improvementDelta: consistency.improvementDelta,
          motifConsistency: consistency.motifConsistency,
          dominantMotifs: consistency.dominantMotifs,
          conflictingChoices: consistency.conflictingChoices,
          sampleSize: sessionBaseline.length
        }).returning();
        
        analysisResults.push(analysis);
      }
    }
    
    return analysisResults;
  }

  private calculateConsistencyMetrics(baseline: any[], aligned: any[]): any {
    // This is a simplified version - would need more sophisticated analysis
    const consistentChoices = aligned.filter(a => {
      const correspondingBaseline = baseline.find(b => b.scenarioId === a.scenarioId);
      return correspondingBaseline && correspondingBaseline.chosenOption === a.chosenOption;
    }).length;
    
    const consistencyPercentage = (consistentChoices / aligned.length) * 100;
    
    // Extract dominant motifs from aligned responses
    const motifs = aligned.flatMap(r => r.identifiedMotifs || []);
    const motifCounts = motifs.reduce((acc, motif) => {
      acc[motif] = (acc[motif] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantMotifs = Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([motif]) => motif);
    
    return {
      consistentChoices,
      consistencyPercentage,
      baselineAccuracy: 0.25, // Placeholder - would compare with human choices
      alignedAccuracy: 0.35, // Placeholder - would compare with human choices  
      improvementDelta: 0.10, // Placeholder
      motifConsistency: motifCounts,
      dominantMotifs,
      conflictingChoices: aligned.length - consistentChoices
    };
  }

  private async updateBatchStatus(status: string, progress: number, currentStep: string): Promise<void> {
    await db.update(alignmentExperimentBatches)
      .set({ 
        status, 
        progressPercent: progress,
        ...(status === 'completed' && { completedAt: new Date() }),
        ...(status === 'running' && progress === 0 && { startedAt: new Date() })
      })
      .where(eq(alignmentExperimentBatches.batchId, this.batchId));
  }

  async getExperimentProgress(batchId: string): Promise<ExperimentProgress | null> {
    const [batch] = await db.select()
      .from(alignmentExperimentBatches)
      .where(eq(alignmentExperimentBatches.batchId, batchId));
      
    if (!batch) return null;
    
    return {
      batchId: batch.batchId,
      status: batch.status as any,
      progress: batch.progressPercent || 0,
      currentStep: `${batch.status} - ${batch.description}`,
      estimatedCost: parseFloat(batch.estimatedCostUsd?.toString() || '0'),
      actualCost: parseFloat(batch.actualCostUsd?.toString() || '0'),
      estimatedTimeRemaining: 0 // Would calculate based on progress
    };
  }

  private async estimateExperimentCost(config: ExperimentConfig): Promise<number> {
    const avgTokensPerRequest = 1000; // Estimate
    const totalRequests = config.scenarioCount * config.llmProviders.length * (1 + config.humanSessionIds.length);
    
    let totalCost = 0;
    for (const provider of config.llmProviders) {
      const providerConfig = LLM_PROVIDERS[provider];
      const costPerRequest = (avgTokensPerRequest * providerConfig.costPerInputToken) + 
                            (avgTokensPerRequest * 0.5 * providerConfig.costPerOutputToken);
      totalCost += costPerRequest * (totalRequests / config.llmProviders.length);
    }
    
    return totalCost;
  }
}

export default AlignmentExperimentRunner;