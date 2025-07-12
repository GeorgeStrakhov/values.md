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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
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
    const responses = await db
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

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for this session' },
        { status: 404 }
      );
    }

    // Convert to tactic discovery format
    const tacticResponses = responses.map(response => ({
      reasoning: response.reasoning || '',
      choice: response.chosenOption || 'A',
      domain: response.domain || 'general',
      difficulty: response.difficulty || 5
    }));

    // Determine generation method based on data quality and quantity
    const useStreamlined = true; // Default to streamlined for reliability
    const useEnhanced = responses.length >= 5 && process.env.ENABLE_ENHANCED === 'true';
    
    if (useStreamlined && !useEnhanced) {
      // Use streamlined generator for fast, reliable results
      const streamlinedProfile = await streamlinedValuesGenerator.generateProfile(
        tacticResponses.map(r => ({
          reasoning: r.reasoning,
          choice: r.choice,
          domain: r.domain,
          difficulty: r.difficulty
        }))
      );

      const result = {
        success: true,
        valuesMarkdown: streamlinedProfile.valuesMarkdown,
        responseCount: responses.length,
        generationMethod: 'streamlined',
        timestamp: new Date().toISOString(),
        summary: {
          primaryApproach: streamlinedProfile.summary.primaryApproach,
          keyInsights: [
            `Primary approach: ${streamlinedProfile.summary.primaryApproach}`,
            `Confidence: ${streamlinedProfile.summary.confidence}%`,
            `Quality: ${streamlinedProfile.metadata.quality}`,
            `Processing time: ${streamlinedProfile.metadata.processingTime}ms`
          ],
          aiGuidance: [`Based on ${streamlinedProfile.tactics[0]?.name || 'balanced'} approach`]
        },
        discoveredTactics: streamlinedProfile.tactics.length,
        integrationStyle: streamlinedProfile.tactics.length > 2 ? 'multi-framework' : 'focused',
        validationMetrics: {
          reliability: streamlinedProfile.metadata.quality,
          confidence: streamlinedProfile.summary.confidence,
          warnings: streamlinedProfile.summary.warnings,
          method: 'streamlined-analysis'
        },
        streamlinedFeatures: {
          fastProcessing: true,
          robustErrorHandling: true,
          simplifiedAnalysis: true,
          reliableOutput: true
        }
      };

      // Cache the streamlined result
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
          enableBayesianModeling: responses.length >= 5,
          includePersonalExamples: true,
          confidenceThreshold: 0.6
        }
      );

      const result = {
        success: true,
        valuesMarkdown: enhancedProfile.valuesMarkdown,
        responseCount: responses.length,
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
          bayesianModeling: responses.length >= 5,
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
        responseCount: responses.length,
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