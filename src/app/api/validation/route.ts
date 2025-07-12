import { NextRequest, NextResponse } from 'next/server';
import { validationProtocols } from '@/lib/validation-protocols';
import { ethicalTacticDiscovery } from '@/lib/ethical-tactic-discovery';
import { statisticalFoundation } from '@/lib/statistical-foundation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { validationType, data } = body;

    if (!validationType || !data) {
      return NextResponse.json(
        { error: 'Validation type and data are required' },
        { status: 400 }
      );
    }

    let result;

    switch (validationType) {
      case 'content_validity':
        result = await validateContentValidity(data);
        break;
      
      case 'criterion_validity':
        result = await validateCriterionValidity(data);
        break;
      
      case 'inter_rater_reliability':
        result = await validateInterRaterReliability(data);
        break;
      
      case 'predictive_validity':
        result = await validatePredictiveValidity(data);
        break;
      
      case 'construct_validity':
        result = await validateConstructValidity(data);
        break;
      
      case 'comprehensive':
        result = await runComprehensiveValidation(data);
        break;
      
      default:
        return NextResponse.json(
          { error: `Unknown validation type: ${validationType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      validationType,
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Content Validity - Expert Panel Validation
 */
async function validateContentValidity(data: {
  expertRatings: Array<{
    expertId: string;
    tacticName: string;
    relevance: number;
    clarity: number;
    completeness: number;
  }>;
}) {
  const tactics = ethicalTacticDiscovery['tacticDefinitions'] || [];
  return await validationProtocols.validateTacticDefinitions(tactics, data.expertRatings);
}

/**
 * Criterion Validity - Cross-validation against human coding
 */
async function validateCriterionValidity(data: {
  responses: Array<{
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
  }>;
  humanCoding: Array<{
    responseId: string;
    identifiedTactics: string[];
    confidence: number;
    coderId: string;
  }>;
}) {
  return await validationProtocols.validateAgainstHumanCoding(
    data.responses,
    data.humanCoding,
    (responses) => ethicalTacticDiscovery.findCoherentTactics(responses)
  );
}

/**
 * Inter-Rater Reliability
 */
async function validateInterRaterReliability(data: {
  ratings: Array<{
    raterId: string;
    responseId: string;
    tacticScores: Record<string, number>;
  }>;
}) {
  return validationProtocols.calculateInterRaterReliability(data.ratings);
}

/**
 * Predictive Validity - Longitudinal validation
 */
async function validatePredictiveValidity(data: {
  initialResponses: Array<{
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
    timestamp: string;
  }>;
  followUpResponses: Array<{
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
    timestamp: string;
  }>;
  timeWindowMonths?: number;
}) {
  // Convert timestamp strings to Date objects
  const initialWithDates = data.initialResponses.map(r => ({
    ...r,
    timestamp: new Date(r.timestamp)
  }));
  
  const followUpWithDates = data.followUpResponses.map(r => ({
    ...r,
    timestamp: new Date(r.timestamp)
  }));

  return await validationProtocols.validatePredictiveAccuracy(
    initialWithDates,
    followUpWithDates,
    (responses) => ethicalTacticDiscovery.findCoherentTactics(responses),
    data.timeWindowMonths
  );
}

/**
 * Construct Validity - Factor analysis
 */
async function validateConstructValidity(data: {
  tacticScores: Array<{
    responseId: string;
    tacticStrengths: Record<string, number>;
  }>;
}) {
  return validationProtocols.calculateConstructValidity(data.tacticScores);
}

/**
 * Comprehensive Validation Suite
 */
async function runComprehensiveValidation(data: {
  responses: Array<{
    reasoning: string;
    choice: string;
    domain: string;
    difficulty: number;
  }>;
  expertRatings?: Array<{
    expertId: string;
    tacticName: string;
    relevance: number;
    clarity: number;
    completeness: number;
  }>;
  humanCoding?: Array<{
    responseId: string;
    identifiedTactics: string[];
    confidence: number;
    coderId: string;
  }>;
  raterReliability?: Array<{
    raterId: string;
    responseId: string;
    tacticScores: Record<string, number>;
  }>;
}) {
  const results: any = {
    overview: {
      responseCount: data.responses.length,
      validationComponents: []
    }
  };

  // Run tactic discovery on responses
  const discoveredTactics = ethicalTacticDiscovery.findCoherentTactics(data.responses);
  
  // Statistical foundation analysis
  const tacticStrengths = [
    ...discoveredTactics.primary.map(t => t.strength),
    ...discoveredTactics.secondary.map(t => t.strength)
  ];

  if (tacticStrengths.length > 0) {
    results.statisticalAnalysis = {
      evidence: statisticalFoundation.calculateConfidenceInterval(tacticStrengths),
      sampleSizeRecommendation: statisticalFoundation.calculateRequiredSampleSize(0.5, 0.8),
      powerAnalysis: statisticalFoundation.calculateStatisticalPower(0.5, data.responses.length)
    };
    results.overview.validationComponents.push('statistical_analysis');
  }

  // Content validity (if expert ratings provided)
  if (data.expertRatings && data.expertRatings.length > 0) {
    const tactics = ethicalTacticDiscovery['tacticDefinitions'] || [];
    results.contentValidity = await validationProtocols.validateTacticDefinitions(tactics, data.expertRatings);
    results.overview.validationComponents.push('content_validity');
  }

  // Criterion validity (if human coding provided)
  if (data.humanCoding && data.humanCoding.length > 0) {
    results.criterionValidity = await validationProtocols.validateAgainstHumanCoding(
      data.responses,
      data.humanCoding,
      (responses) => ethicalTacticDiscovery.findCoherentTactics(responses)
    );
    results.overview.validationComponents.push('criterion_validity');
  }

  // Inter-rater reliability (if multiple raters provided)
  if (data.raterReliability && data.raterReliability.length > 0) {
    results.interRaterReliability = validationProtocols.calculateInterRaterReliability(data.raterReliability);
    results.overview.validationComponents.push('inter_rater_reliability');
  }

  // Construct validity analysis
  const tacticScores = data.responses.map((response, index) => {
    const evidence = ethicalTacticDiscovery.identifyTactics(response);
    const tacticStrengths: Record<string, number> = {};
    
    evidence.forEach(ev => {
      // Extract tactic name from evidence (simplified)
      const tacticName = getTacticNameFromEvidence(ev);
      tacticStrengths[tacticName] = ev.confidence;
    });
    
    return {
      responseId: index.toString(),
      tacticStrengths
    };
  });

  if (tacticScores.length > 0) {
    results.constructValidity = validationProtocols.calculateConstructValidity(tacticScores);
    results.overview.validationComponents.push('construct_validity');
  }

  // Generate overall validation summary
  results.summary = generateValidationSummary(results);

  return results;
}

/**
 * Generate validation summary with recommendations
 */
function generateValidationSummary(results: any) {
  const summary = {
    overallValidity: 'unknown',
    confidence: 0,
    strengths: [],
    weaknesses: [],
    recommendations: []
  };

  let validityScores = [];

  // Assess content validity
  if (results.contentValidity) {
    const contentScore = results.contentValidity.confidence;
    validityScores.push(contentScore);
    
    if (results.contentValidity.validity === 'valid') {
      summary.strengths.push('Strong content validity from expert panel');
    } else {
      summary.weaknesses.push('Content validity concerns identified by experts');
      summary.recommendations.push(...results.contentValidity.recommendations);
    }
  }

  // Assess criterion validity
  if (results.criterionValidity) {
    const criterionScore = results.criterionValidity.overallAccuracy;
    validityScores.push(criterionScore);
    
    if (criterionScore >= 0.7) {
      summary.strengths.push('High agreement with human coding');
    } else {
      summary.weaknesses.push('Low agreement with human coding standards');
      summary.recommendations.push('Improve tactic detection algorithms to better match human judgment');
    }
  }

  // Assess inter-rater reliability
  if (results.interRaterReliability) {
    const reliabilityScore = results.interRaterReliability.cohensKappa;
    validityScores.push(reliabilityScore);
    
    if (results.interRaterReliability.agreement === 'good' || results.interRaterReliability.agreement === 'excellent') {
      summary.strengths.push('High inter-rater reliability');
    } else {
      summary.weaknesses.push('Poor inter-rater reliability');
      summary.recommendations.push('Improve rater training and tactic definition clarity');
    }
  }

  // Assess construct validity
  if (results.constructValidity) {
    const constructScore = (results.constructValidity.convergentValidity + results.constructValidity.discriminantValidity) / 2;
    validityScores.push(constructScore);
    
    if (constructScore >= 0.6) {
      summary.strengths.push('Good construct validity');
    } else {
      summary.weaknesses.push('Construct validity concerns');
      summary.recommendations.push('Review tactic definitions for better discriminant validity');
    }
  }

  // Calculate overall validity
  if (validityScores.length > 0) {
    summary.confidence = validityScores.reduce((sum, score) => sum + score, 0) / validityScores.length;
    summary.overallValidity = summary.confidence >= 0.7 ? 'strong' :
                             summary.confidence >= 0.5 ? 'moderate' : 'weak';
  }

  // Statistical analysis recommendations
  if (results.statisticalAnalysis) {
    const power = results.statisticalAnalysis.powerAnalysis;
    if (power < 0.8) {
      summary.recommendations.push(`Increase sample size to ${results.statisticalAnalysis.sampleSizeRecommendation} for adequate statistical power`);
    }
  }

  return summary;
}

/**
 * Helper to extract tactic name from evidence
 */
function getTacticNameFromEvidence(evidence: any): string {
  // This would normally be implemented properly in the tactic discovery system
  // For now, return a simplified approach
  return 'unknown_tactic';
}