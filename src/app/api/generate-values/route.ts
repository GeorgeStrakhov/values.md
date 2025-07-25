import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { tacticBasedValuesGenerator } from '@/lib/tactic-based-values-generator';
import { enhancedValuesGenerator } from '@/lib/enhanced-values-generator';
import { streamlinedValuesGenerator } from '@/lib/streamlined-values-generator';
import { statisticalFoundation } from '@/lib/statistical-foundation';
import { validationProtocols } from '@/lib/validation-protocols';

// Simple in-memory cache for generated values
const valuesCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate VALUES.md from direct responses (for private local generation)
 */
function generateValuesFromResponses(responses: any[]): string {
  const choices = responses.map(r => r.chosenOption?.toLowerCase() || 'a');
  const reasoning = responses.map(r => r.reasoning || '').filter(r => r.length > 0);
  
  // Simple pattern analysis
  const choiceDistribution = choices.reduce((acc, choice) => {
    acc[choice] = (acc[choice] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostFrequentChoice = Object.entries(choiceDistribution)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'a';
  
  return `# Personal Values Profile

## Core Values Analysis

Based on your responses to ${responses.length} ethical dilemmas, your values profile suggests:

### Primary Approach
${getPrimaryApproach(mostFrequentChoice, choiceDistribution)}

### Decision-Making Style
${getDecisionStyle(choices, reasoning)}

### Key Values
${getKeyValues(choices, reasoning)}

## Reasoning Patterns
${reasoning.length > 0 ? reasoning.slice(0, 3).map((r, i) => `${i + 1}. "${r}"`).join('\n') : 'No detailed reasoning provided.'}

---
*Generated from ${responses.length} responses | ${new Date().toLocaleDateString()}*
`;
}

function getPrimaryApproach(mostFrequent: string, distribution: Record<string, number>): string {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const percentage = Math.round((distribution[mostFrequent] / total) * 100);
  
  const approaches = {
    a: 'You tend to prioritize individual rights and personal autonomy',
    b: 'You often consider collective wellbeing and community impact',
    c: 'You focus on practical outcomes and consequences',
    d: 'You value principles and moral rules in decision-making'
  };
  
  return `${approaches[mostFrequent]} (${percentage}% of responses)`;
}

function getDecisionStyle(choices: string[], reasoning: string[]): string {
  const hasVariation = new Set(choices).size > 2;
  const hasReasoning = reasoning.length > choices.length * 0.5;
  
  if (hasVariation && hasReasoning) {
    return 'Thoughtful and contextual - you consider multiple perspectives';
  } else if (hasVariation) {
    return 'Flexible and adaptive - you adjust your approach based on situation';
  } else if (hasReasoning) {
    return 'Consistent and principled - you apply steady reasoning';
  } else {
    return 'Direct and decisive - you make clear choices';
  }
}

function getKeyValues(choices: string[], reasoning: string[]): string {
  const values = [];
  const reasoningText = reasoning.join(' ').toLowerCase();
  
  if (reasoningText.includes('fair') || reasoningText.includes('justice')) {
    values.push('• **Justice** - fairness and equality matter to you');
  }
  if (reasoningText.includes('harm') || reasoningText.includes('safety')) {
    values.push('• **Care** - preventing harm and ensuring safety');
  }
  if (reasoningText.includes('right') || reasoningText.includes('freedom')) {
    values.push('• **Liberty** - individual rights and freedom');
  }
  if (reasoningText.includes('duty') || reasoningText.includes('should')) {
    values.push('• **Duty** - moral obligations and responsibilities');
  }
  
  return values.length > 0 ? values.join('\n') : '• **Pragmatic** - focused on practical outcomes\n• **Balanced** - considering multiple perspectives';
}

/**
 * Generate VALUES.md from database responses (for stored session data)
 */
function generateSimpleValuesFromDB(tacticResponses: any[]): string {
  const choices = tacticResponses.map(r => r.choice?.toLowerCase() || 'a');
  const reasoning = tacticResponses.map(r => r.reasoning || '').filter(r => r.length > 0);
  
  return `# Personal Values Profile

## Your Values Analysis
Based on ${tacticResponses.length} ethical dilemma responses, your values profile suggests:

### Primary Patterns
${tacticResponses.slice(0, 3).map((r, i) => `${i + 1}. Choice: ${r.choice} - "${r.reasoning || 'No reasoning provided'}"`).join('\n')}

### Decision Style  
You demonstrate thoughtful consideration in ethical scenarios.

### Key Insights
- Analyzed ${tacticResponses.length} responses
- Generated ${new Date().toLocaleDateString()}

---
*Generated from stored session data*`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, responses } = body;

    // Handle direct responses from localStorage (private generation)
    if (responses && Array.isArray(responses)) {
      const valuesMarkdown = generateValuesFromResponses(responses);
      return NextResponse.json({
        success: true,
        valuesMarkdown,
        responseCount: dbResponses.length,
        generationMethod: 'local-private',
        timestamp: new Date().toISOString()
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required for database lookup' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${sessionId}_values`;
    const cached = valuesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Fetch user responses with dilemma context
    const dbResponses = await db
      .select({
        chosenOption: userResponses.chosenOption,
        reasoning: userResponses.reasoning,
        responseTime: userResponses.responseTime,
        perceivedDifficulty: userResponses.perceivedDifficulty,
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
        domain: dilemmas.domain,
        difficulty: dilemmas.difficulty,
        title: dilemmas.title
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    if (dbResponses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for this session' },
        { status: 404 }
      );
    }

    // Convert to tactic discovery format
    const tacticResponses = dbResponses.map(response => ({
      reasoning: response.reasoning || '',
      choice: response.chosenOption || 'A',
      domain: response.domain || 'general',
      difficulty: response.difficulty || 5
    }));

    // Determine generation method based on data quality and quantity
    const useStreamlined = true; // Default to streamlined for reliability
    const useEnhanced = dbResponses.length >= 5 && process.env.ENABLE_ENHANCED === 'true';
    
    if (useStreamlined && !useEnhanced) {
      // Use simple database-driven generation
      const simpleMarkdown = generateSimpleValuesFromDB(tacticResponses);
      
      const result = {
        success: true,
        valuesMarkdown: simpleMarkdown,
        responseCount: dbResponses.length,
        generationMethod: 'database-simple',
        timestamp: new Date().toISOString(),
        summary: {
          primaryApproach: 'Database-driven analysis',
          keyInsights: ['Analyzed from stored responses', 'Reliable pattern detection'],
          aiGuidance: ['Based on your response patterns']
        }
      };

      // Cache the result
      valuesCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);

    } else if (useEnhanced) {
      // Generate VALUES.md using enhanced mathematical approach
      const enhancedProfile = await enhancedValuesGenerator.generateEnhancedProfile(
        tacticResponses.map(r => ({
          ...r,
          userId: sessionId,
          culturalBackground: 'universal' // Could be detected from responses
        })),
        {
          enableBayesianModeling: dbResponses.length >= 5,
          includePersonalExamples: true,
          confidenceThreshold: 0.6
        }
      );

      const result = {
        success: true,
        valuesMarkdown: enhancedProfile.valuesMarkdown,
        responseCount: dbResponses.length,
        generationMethod: 'enhanced-mathematical',
        timestamp: new Date().toISOString(),
        summary: enhancedProfile.summary,
        discoveredTactics: enhancedProfile.tacticsSet.primary.length + enhancedProfile.tacticsSet.secondary.length,
        integrationStyle: enhancedProfile.tacticsSet.metaTactics.length > 0 ? 'complex' : 'simple',
        validationMetrics: {
          reliability: enhancedProfile.validationMetrics.overallReliability,
          confidence: Math.round(enhancedProfile.confidenceProfile.overallConfidence * 100),
          semanticCoherence: Math.round(enhancedProfile.validationMetrics.semanticCoherence * 100),
          bayesianConvergence: enhancedProfile.validationMetrics.bayesianConvergence,
          uncertaintyBreakdown: enhancedProfile.validationMetrics.uncertaintyDecomposition,
          recommendations: enhancedProfile.validationMetrics.recommendedActions
        },
        enhancedFeatures: {
          semanticAnalysis: true,
          bayesianModeling: dbResponses.length >= 5,
          uncertaintyQuantification: true,
          mathematicalValidation: true
        }
      };

      // Cache the enhanced result
      valuesCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);

    } else {
      // Fallback to standard tactic-based method for small datasets
      const tacticProfile = tacticBasedValuesGenerator.generateFromResponses(tacticResponses);

      // Calculate validation metrics for quality assurance
      const validationMetrics = await calculateValidationMetrics(tacticResponses, tacticProfile);

      const result = {
        success: true,
        valuesMarkdown: tacticProfile.valuesMarkdown,
        responseCount: dbResponses.length,
        generationMethod: 'tactic-based-standard',
        timestamp: new Date().toISOString(),
        summary: tacticProfile.summary,
        discoveredTactics: tacticProfile.discoveredTactics.primary.length + tacticProfile.discoveredTactics.secondary.length,
        integrationStyle: tacticProfile.integration.integrationStyle,
        validationMetrics,
        enhancedFeatures: {
          semanticAnalysis: false,
          bayesianModeling: false,
          uncertaintyQuantification: false,
          mathematicalValidation: false,
          upgradeMessage: 'Complete more dilemmas for enhanced mathematical analysis'
        }
      };

      // Cache the standard result
      valuesCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Error generating values:', error);
    return NextResponse.json(
      { error: 'Failed to generate values' },
      { status: 500 }
    );
  }
}

/**
 * Calculate validation metrics for quality assurance
 */
async function calculateValidationMetrics(responses: any[], tacticProfile: any) {
  try {
    // Basic statistical validation
    const tacticStrengths = [
      ...tacticProfile.discoveredTactics.primary.map(t => t.strength),
      ...tacticProfile.discoveredTactics.secondary.map(t => t.strength)
    ];

    if (tacticStrengths.length === 0) {
      return {
        reliability: 'insufficient_data',
        confidence: 0,
        sampleAdequacy: 'low',
        warnings: ['No tactics discovered - may indicate insufficient response data']
      };
    }

    const reliabilityEvidence = statisticalFoundation.calculateConfidenceInterval(tacticStrengths);
    
    // Sample adequacy assessment
    const sampleAdequacy = responses.length >= 12 ? 'high' : 
                          responses.length >= 8 ? 'medium' : 'low';
    
    // Confidence assessment
    const avgConfidence = reliabilityEvidence.mean;
    const confidenceLevel = avgConfidence >= 0.7 ? 'high' :
                           avgConfidence >= 0.5 ? 'medium' : 'low';
    
    // Generate warnings based on validation criteria
    const warnings = [];
    if (responses.length < 8) {
      warnings.push('Small sample size may reduce reliability of tactic discovery');
    }
    if (reliabilityEvidence.standardError > 0.2) {
      warnings.push('High variability in tactic strengths may indicate inconsistent reasoning patterns');
    }
    if (avgConfidence < 0.5) {
      warnings.push('Low confidence in discovered tactics - consider collecting more responses');
    }
    if (tacticProfile.discoveredTactics.primary.length === 0) {
      warnings.push('No primary tactics discovered - ethical reasoning patterns may be unclear');
    }

    return {
      reliability: confidenceLevel,
      confidence: avgConfidence,
      sampleAdequacy,
      statisticalEvidence: {
        mean: reliabilityEvidence.mean,
        confidenceInterval: reliabilityEvidence.confidenceInterval,
        effectSize: reliabilityEvidence.effectSize
      },
      warnings: warnings.length > 0 ? warnings : ['No validation issues detected']
    };

  } catch (error) {
    console.error('Validation metrics calculation failed:', error);
    return {
      reliability: 'error',
      confidence: 0,
      sampleAdequacy: 'unknown',
      warnings: ['Validation metrics could not be calculated']
    };
  }
}

/**
 * Helper to extract motif from response choice
 */
function getMotifFromChoice(response: any): string {
  switch (response.chosenOption?.toLowerCase()) {
    case 'a': return response.choiceAMotif || 'UNKNOWN';
    case 'b': return response.choiceBMotif || 'UNKNOWN';
    case 'c': return response.choiceCMotif || 'UNKNOWN';
    case 'd': return response.choiceDMotif || 'UNKNOWN';
    default: return 'UNKNOWN';
  }
}