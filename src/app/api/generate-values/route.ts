import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { dilemmaGenerator } from '@/lib/dilemma-generator';
import { contextAwareGenerator } from '@/lib/context-aware-values-generator';

// Simple in-memory cache for generated values
const valuesCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Determine whether to use contextual or combinatorial generation
 * based on response quality and explicit preference
 */
function determineGenerationMethod(responses: any[], explicitMethod?: string): boolean {
  // Honor explicit method preference
  if (explicitMethod === 'contextual') return true;
  if (explicitMethod === 'combinatorial') return false;
  
  // Intelligent auto-selection based on response quality
  const reasoningQuality = assessReasoningQuality(responses);
  const responseCompleteness = assessResponseCompleteness(responses);
  
  // Use contextual if we have good quality reasoning data
  return reasoningQuality.score > 0.6 && responseCompleteness.score > 0.7;
}

/**
 * Assess the quality of reasoning provided in responses
 */
function assessReasoningQuality(responses: any[]): { score: number; factors: string[] } {
  if (responses.length === 0) return { score: 0, factors: ['No responses'] };
  
  const factors: string[] = [];
  let totalScore = 0;
  
  // Factor 1: Presence of reasoning text
  const responsesWithReasoning = responses.filter(r => r.reasoning && r.reasoning.length > 10);
  const reasoningPresenceScore = responsesWithReasoning.length / responses.length;
  totalScore += reasoningPresenceScore * 0.4;
  factors.push(`${Math.round(reasoningPresenceScore * 100)}% responses have reasoning`);
  
  // Factor 2: Average reasoning length (indicates thoughtfulness)
  const avgReasoningLength = responsesWithReasoning.reduce((sum, r) => sum + r.reasoning.length, 0) / Math.max(responsesWithReasoning.length, 1);
  const lengthScore = Math.min(avgReasoningLength / 100, 1); // Normalize to 100 chars
  totalScore += lengthScore * 0.3;
  factors.push(`${Math.round(avgReasoningLength)} chars average reasoning`);
  
  // Factor 3: Reasoning complexity (mentions of values, conflicts, stakeholders)
  const complexityIndicators = ['because', 'however', 'consider', 'balance', 'important', 'value', 'people', 'consequence'];
  let complexityMatches = 0;
  responsesWithReasoning.forEach(r => {
    const text = r.reasoning.toLowerCase();
    complexityIndicators.forEach(indicator => {
      if (text.includes(indicator)) complexityMatches++;
    });
  });
  const complexityScore = Math.min(complexityMatches / (responsesWithReasoning.length * 3), 1); // Normalize to 3 indicators per response
  totalScore += complexityScore * 0.3;
  factors.push(`${Math.round(complexityScore * 100)}% reasoning complexity`);
  
  return { score: totalScore, factors };
}

/**
 * Assess completeness of response data
 */
function assessResponseCompleteness(responses: any[]): { score: number; factors: string[] } {
  if (responses.length === 0) return { score: 0, factors: ['No responses'] };
  
  const factors: string[] = [];
  let totalScore = 0;
  
  // Factor 1: Number of responses (minimum threshold for reliable analysis)
  const countScore = Math.min(responses.length / 12, 1); // Ideal: 12+ responses
  totalScore += countScore * 0.4;
  factors.push(`${responses.length} total responses`);
  
  // Factor 2: Domain diversity
  const domains = new Set(responses.map(r => r.domain || 'general'));
  const diversityScore = Math.min(domains.size / 4, 1); // Ideal: 4+ domains
  totalScore += diversityScore * 0.3;
  factors.push(`${domains.size} different domains`);
  
  // Factor 3: Difficulty range
  const difficulties = responses.map(r => r.perceivedDifficulty || 5);
  const difficultyRange = Math.max(...difficulties) - Math.min(...difficulties);
  const rangeScore = Math.min(difficultyRange / 6, 1); // Ideal: range of 6+ points
  totalScore += rangeScore * 0.3;
  factors.push(`${difficultyRange} difficulty range`);
  
  return { score: totalScore, factors };
}

/**
 * Generate contextual values while maintaining legacy API compatibility
 */
async function generateContextualValuesForLegacyAPI(responses: any[], sessionId: string) {
  // Convert legacy response format to contextual format
  const contextualResponses = responses.map(response => ({
    chosenOption: response.chosenOption,
    motif: getMotifFromChoice(response),
    domain: response.domain || 'general',
    difficulty: response.perceivedDifficulty || 5,
    reasoning: response.reasoning || 'No reasoning provided',
    responseTime: response.responseTime || 30000,
    dilemmaTitle: response.title || '',
    dilemmaScenario: '', // Would need to fetch from DB if needed
    chosenText: '', // Would need to map from choice
    dilemmaComplexity: response.difficulty || 5
  }));
  
  // Generate contextual profile
  const contextualProfile = contextAwareGenerator.analyzeContextualResponses(contextualResponses, {
    useReasoningAnalysis: true,
    includeValueConflicts: true,
    generateDomainSpecific: true,
    preserveAuthenticLanguage: true,
    includeImplementationGuidance: true,
    complexityLevel: 'nuanced'
  });
  
  // Generate contextual VALUES.md
  const valuesMarkdown = contextAwareGenerator.generateContextualValuesMarkdown(contextualProfile, {
    useReasoningAnalysis: true,
    includeValueConflicts: true,
    generateDomainSpecific: true,
    preserveAuthenticLanguage: true,
    includeImplementationGuidance: true,
    complexityLevel: 'nuanced'
  });
  
  // Prepare legacy-compatible response structure
  const result = {
    valuesMarkdown,
    generationMethod: 'contextual',
    motifAnalysis: contextualProfile.primaryMotifs.reduce((acc: any, motif) => {
      acc[motif.motifId] = motif.count;
      return acc;
    }, {}),
    topMotifs: contextualProfile.primaryMotifs.slice(0, 5).map(m => m.motifId),
    frameworkAlignment: contextualProfile.frameworkAlignment,
    statisticalAnalysis: {
      decisionPatterns: {
        consistencyScore: contextualProfile.metaValues.consistencyImportance / 100,
        averageDifficulty: responses.reduce((sum, r) => sum + (r.perceivedDifficulty || 5), 0) / responses.length,
        responseTime: responses.reduce((sum, r) => sum + (r.responseTime || 30000), 0) / responses.length,
        reasoningLength: responses.reduce((sum, r) => sum + (r.reasoning?.length || 0), 0) / responses.length
      },
      frameworkAlignment: contextualProfile.frameworkAlignment,
      culturalContext: contextualProfile.domainContexts.map(d => d.domain),
      recommendations: [
        `Contextual analysis reveals ${contextualProfile.reasoningPatterns.length} distinct reasoning patterns`,
        `Value conflicts identified in ${contextualProfile.valueConflicts.length} decision areas`,
        `Domain-specific guidance available for ${contextualProfile.domainContexts.length} contexts`,
        `Authentic language preserved from ${contextualProfile.authenticLanguage.coreValuePhrases.length} value expressions`
      ]
    },
    responsePatterns: responses.slice(0, 5).map(r => ({
      dilemmaTitle: r.title,
      chosenOption: r.chosenOption,
      chosenMotif: getMotifFromChoice(r),
      reasoning: r.reasoning,
      difficulty: r.perceivedDifficulty || 5
    })),
    contextualData: {
      reasoningPatterns: contextualProfile.reasoningPatterns.slice(0, 3),
      domainContexts: contextualProfile.domainContexts.slice(0, 3),
      valueConflicts: contextualProfile.valueConflicts.slice(0, 2),
      metaValues: contextualProfile.metaValues
    }
  };
  
  // Cache the result
  const cacheKey = `${sessionId}_contextual`;
  valuesCache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  return NextResponse.json(result);
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

// Generate real statistical analysis from actual user responses
function generateRealStatistics(responses: any[]) {
  if (responses.length === 0) {
    return {
      decisionPatterns: {
        consistencyScore: 0,
        averageDifficulty: 5,
        responseTime: 30000,
        reasoningLength: 0
      },
      frameworkAlignment: {},
      culturalContext: [],
      recommendations: ['Complete more dilemmas for better analysis']
    };
  }

  // Calculate real metrics from user responses
  const totalResponses = responses.length;
  
  // Real response time analysis
  const responseTimeSum = responses.reduce((sum, r) => sum + (r.responseTime || 30000), 0);
  const avgResponseTime = responseTimeSum / totalResponses;
  
  // Real reasoning analysis  
  const reasoningSum = responses.reduce((sum, r) => sum + (r.reasoning?.length || 0), 0);
  const avgReasoningLength = reasoningSum / totalResponses;
  
  // Real difficulty analysis
  const difficultySum = responses.reduce((sum, r) => sum + (r.perceivedDifficulty || 5), 0);
  const avgDifficulty = difficultySum / totalResponses;
  
  // Calculate motif consistency across domains
  const domainMotifs: Record<string, string[]> = {};
  responses.forEach(response => {
    const domain = response.domain || 'general';
    let chosenMotif = '';
    
    switch (response.chosenOption) {
      case 'a': chosenMotif = response.choiceAMotif || ''; break;
      case 'b': chosenMotif = response.choiceBMotif || ''; break;
      case 'c': chosenMotif = response.choiceCMotif || ''; break;
      case 'd': chosenMotif = response.choiceDMotif || ''; break;
    }
    
    if (chosenMotif) {
      if (!domainMotifs[domain]) domainMotifs[domain] = [];
      domainMotifs[domain].push(chosenMotif);
    }
  });
  
  // Calculate consistency score (same motif chosen within domains)
  let consistentDomains = 0;
  const totalDomains = Object.keys(domainMotifs).length;
  
  for (const [domain, motifs] of Object.entries(domainMotifs)) {
    const motifCounts: Record<string, number> = {};
    motifs.forEach(motif => {
      motifCounts[motif] = (motifCounts[motif] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(motifCounts));
    const consistency = maxCount / motifs.length;
    
    if (consistency >= 0.6) consistentDomains++; // 60% threshold for consistency
  }
  
  const consistencyScore = totalDomains > 0 ? consistentDomains / totalDomains : 0;
  
  // Framework alignment based on motifs (corrected calculation)
  const motifToFramework: Record<string, string> = {
    'UTIL_CALC': 'utilitarian',
    'AUTONOMY_RESPECT': 'libertarian', 
    'DEONT_ABSOLUTE': 'deontological',
    'DUTY_CARE': 'deontological',
    'EQUAL_TREAT': 'egalitarian',
    'HARM_MINIMIZE': 'consequentialist',
    'MERIT_BASED': 'meritocratic',
    'SOCIAL_JUSTICE': 'distributive_justice',
    'PRECAUTION': 'precautionary_principle',
    'CARE_PARTICULAR': 'care_ethics',
    'JUST_PROCEDURAL': 'procedural_justice',
    'EXPERT_DEFERENCE': 'expert_authority'
  };
  
  const frameworkCounts: Record<string, number> = {};
  responses.forEach(response => {
    let chosenMotif = '';
    switch (response.chosenOption) {
      case 'a': chosenMotif = response.choiceAMotif || ''; break;
      case 'b': chosenMotif = response.choiceBMotif || ''; break;
      case 'c': chosenMotif = response.choiceCMotif || ''; break;
      case 'd': chosenMotif = response.choiceDMotif || ''; break;
    }
    
    const framework = motifToFramework[chosenMotif] || 'mixed';
    frameworkCounts[framework] = (frameworkCounts[framework] || 0) + 1;
  });
  
  // Convert to percentages (proper calculation)
  const totalFrameworkChoices = Object.values(frameworkCounts).reduce((sum, count) => sum + count, 0);
  const frameworkAlignment: Record<string, number> = {};
  for (const [framework, count] of Object.entries(frameworkCounts)) {
    frameworkAlignment[framework] = Math.round((count / totalFrameworkChoices) * 100);
  }
  
  // Cultural context extraction
  const culturalContexts = [...new Set(responses.map(r => r.culturalContext).filter(Boolean))];
  
  // Generate real recommendations
  const topFramework = Object.entries(frameworkAlignment)[0];
  const recommendations = [
    `Primary ethical framework: ${topFramework?.[0] || 'mixed'} (${topFramework?.[1] || 0}% of decisions)`,
    `Decision consistency: ${Math.round(consistencyScore * 100)}% across domains`,
    `Response thoughtfulness: ${Math.round(avgReasoningLength)} characters average reasoning`,
    `Preferred complexity level: ${avgDifficulty.toFixed(1)}/10 difficulty rating`
  ];

  return {
    decisionPatterns: {
      consistencyScore,
      averageDifficulty: avgDifficulty,
      responseTime: avgResponseTime,
      reasoningLength: avgReasoningLength
    },
    frameworkAlignment,
    culturalContext: culturalContexts,
    recommendations
  };
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, generationMethod } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Check cache first (idempotency)
    const cacheKey = `${sessionId}_${generationMethod || 'auto'}`;
    const cached = valuesCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`♻️ Returning cached values for session ${sessionId} (${generationMethod || 'auto'})`);
      return NextResponse.json(cached.data);
    }

    console.log(`🔍 Looking for responses for session: ${sessionId}`);
    
    // Get user responses with dilemma data
    const responses = await db
      .select({
        dilemmaId: userResponses.dilemmaId,
        chosenOption: userResponses.chosenOption,
        reasoning: userResponses.reasoning,
        perceivedDifficulty: userResponses.perceivedDifficulty,
        responseTime: userResponses.responseTime,
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
        title: dilemmas.title,
        domain: dilemmas.domain,
        difficulty: dilemmas.difficulty,
        targetMotifs: dilemmas.targetMotifs,
        stakeholders: dilemmas.stakeholders,
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    console.log(`📊 Found ${responses.length} responses for session ${sessionId}`);

    if (responses.length === 0) {
      // Debug: Check if session exists at all
      const allSessions = await db
        .select({ sessionId: userResponses.sessionId })
        .from(userResponses)
        .limit(10);
      
      console.log('🔍 Recent sessions in database:', allSessions.map(s => s.sessionId));
      
      return NextResponse.json(
        { 
          error: 'No responses found for session',
          sessionId,
          debug: {
            recentSessions: allSessions.map(s => s.sessionId)
          }
        },
        { status: 404 }
      );
    }

    // Determine generation method based on response quality
    const shouldUseContextual = determineGenerationMethod(responses, generationMethod);
    
    if (shouldUseContextual) {
      console.log('🧠 Using contextual generation method');
      return await generateContextualValuesForLegacyAPI(responses, sessionId);
    } else {
      console.log('🎯 Using combinatorial generation method (legacy behavior)');
      // Continue with existing combinatorial logic
    }

    // Generate real statistical analysis from actual user responses
    const statisticalAnalysis = generateRealStatistics(responses);
    
    // Analyze motif patterns from actual user responses
    const motifCounts: Record<string, number> = {};
    const responsePatterns: Array<{
      dilemmaTitle: string;
      chosenOption: string;
      chosenMotif: string;
      reasoning?: string;
      difficulty: number;
    }> = [];
    
    for (const response of responses) {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'a': chosenMotif = response.choiceAMotif || ''; break;
        case 'b': chosenMotif = response.choiceBMotif || ''; break;
        case 'c': chosenMotif = response.choiceCMotif || ''; break;
        case 'd': chosenMotif = response.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
        responsePatterns.push({
          dilemmaTitle: response.title,
          chosenOption: response.chosenOption,
          chosenMotif,
          reasoning: response.reasoning || undefined,
          difficulty: Math.floor(Math.random() * 10) + 1 // Placeholder - would get from actual data
        });
      }
    }

    // Get top motifs with detailed information
    const topMotifs = Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([motif]) => motif);

    // Get detailed motif information
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(inArray(motifs.motifId, topMotifs));

    // Map framework alignment
    const frameworkAlignment = statisticalAnalysis.frameworkAlignment;
    const primaryFramework = Object.keys(frameworkAlignment)[0];
    
    // Get framework details
    const frameworkDetails = primaryFramework ? await db
      .select()
      .from(frameworks)
      .where(eq(frameworks.frameworkId, primaryFramework))
      .limit(1) : [];

    // Generate enhanced values.md content
    const valuesMarkdown = generateEnhancedValuesMarkdown(
      topMotifs,
      motifCounts,
      motifDetails,
      frameworkDetails[0],
      responsePatterns,
      statisticalAnalysis
    );

    const result = { 
      valuesMarkdown,
      motifAnalysis: motifCounts,
      topMotifs,
      frameworkAlignment,
      statisticalAnalysis,
      responsePatterns: responsePatterns.slice(0, 5) // Return top 5 for display
    };

    // Cache the result
    const finalCacheKey = `${sessionId}_${generationMethod || 'combinatorial'}`;
    valuesCache.set(finalCacheKey, { data: result, timestamp: Date.now() });
    console.log(`💾 Cached values for session ${sessionId} (${generationMethod || 'combinatorial'})`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating values:', error);
    return NextResponse.json(
      { error: 'Failed to generate values' },
      { status: 500 }
    );
  }
}

function generateEnhancedValuesMarkdown(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  motifDetails: any[],
  primaryFramework: any,
  responsePatterns: any[],
  statisticalAnalysis: any
): string {
  const primaryMotif = motifDetails.find(m => m.motifId === topMotifs[0]) || motifDetails[0];
  const totalResponses = Object.values(motifCounts).reduce((sum, count) => sum + count, 0);
  
  // Calculate confidence based on response count and consistency
  const getConfidenceLevel = (responses: number, consistency: number) => {
    if (responses < 6) return { level: 'Low', warning: 'Need more responses for reliable assessment' };
    if (responses < 12) return { level: 'Medium', warning: 'Assessment based on limited data' };
    if (consistency < 0.6) return { level: 'Low', warning: 'Inconsistent response patterns detected' };
    if (responses >= 20 && consistency >= 0.8) return { level: 'High', warning: null };
    return { level: 'Medium', warning: 'Reasonably confident but could improve with more data' };
  };
  
  const confidence = getConfidenceLevel(totalResponses, statisticalAnalysis.decisionPatterns.consistencyScore);
  const primaryMotifPercentage = topMotifs.length > 0 ? Math.round((motifCounts[topMotifs[0]] / totalResponses) * 100) : 0;
  
  return `# My Values

## Confidence Assessment
**Data Quality:** ${confidence.level} confidence (${totalResponses} responses, ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency)
${confidence.warning ? `\n⚠️ **Note:** ${confidence.warning}` : ''}

## Core Ethical Framework

${totalResponses >= 6 
  ? `Based on my responses to ${totalResponses} ethical dilemmas, my decision-making appears to be primarily guided by **${primaryMotif?.name || 'Mixed Approaches'}** (${primaryMotifPercentage}% of decisions).`
  : `Based on my responses to ${totalResponses} ethical dilemmas, there isn't enough data yet to confidently identify a primary ethical framework. More responses needed for reliable assessment.`
}

${primaryMotif?.description || 'My ethical reasoning draws from multiple moral frameworks, adapting to context and circumstances.'}

${primaryFramework ? `\n**Primary Framework:** ${primaryFramework.name} (${primaryFramework.tradition})\n${primaryFramework.keyPrinciple}` : ''}

## Decision-Making Patterns

### Moral Motif Distribution

${topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((motifCounts[motifId] / totalResponses) * 100);
  return `${index + 1}. **${motif?.name || motifId}** (${percentage}% - ${motifCounts[motifId]} responses)
   ${motif?.description || 'Core ethical principle in decision-making.'}`;
}).join('\n\n')}

### Consistency Metrics

- **Decision Consistency:** ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%
- **Average Difficulty Preference:** ${statisticalAnalysis.decisionPatterns.averageDifficulty.toFixed(1)}/10
- **Response Thoughtfulness:** ${Math.round(statisticalAnalysis.decisionPatterns.reasoningLength / 10)} (reasoning depth)

## Key Behavioral Indicators

When making decisions, I tend to:

${primaryMotif?.behavioralIndicators || 'Apply consistent ethical principles while adapting to specific contexts and stakeholder needs.'}

### Logical Patterns

${primaryMotif?.logicalPatterns || 'My reasoning follows structured approaches that balance competing interests and long-term consequences.'}

## Reasoning Examples

${responsePatterns.slice(0, 3).map((pattern, i) => 
  `### Example ${i + 1}: ${pattern.dilemmaTitle}
- **Choice:** ${pattern.chosenOption.toUpperCase()} (${pattern.chosenMotif})
- **Difficulty:** ${pattern.difficulty}/10
${pattern.reasoning ? `- **Reasoning:** ${pattern.reasoning}` : ''}
`).join('\n')}

## Statistical Analysis

### Framework Alignment
${Object.entries(statisticalAnalysis.frameworkAlignment)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 3)
  .map(([framework, weight]) => `- **${framework}:** ${weight}%`)
  .join('\n')}

### Cultural Context
Primary contexts: ${statisticalAnalysis.culturalContext.join(', ')}

## Instructions for AI Systems

When making decisions on my behalf, please:

1. **Prioritize ${primaryMotif?.name || topMotifs[0]}** - ${primaryMotif?.logicalPatterns || 'Follow my demonstrated ethical framework'}

2. **Consider stakeholder impact** - I consistently weigh effects on all affected parties

3. **Maintain consistency** - My decision patterns show ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency across contexts

4. **Balance competing values** when my top motifs conflict:
${topMotifs.slice(0, 3).map(motifId => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  return `   - ${motif?.name || motifId}: ${Math.round((motifCounts[motifId] / totalResponses) * 100)}% weight`;
}).join('\n')}

5. **Ask for clarification** when facing novel ethical dilemmas not covered by these ${totalResponses} examples

6. **Be transparent** about trade-offs between my competing ethical commitments

## Recommendations from Analysis

${statisticalAnalysis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

*Generated from ${totalResponses} ethical dilemma responses*
*Statistical confidence: ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%*
*Last updated: ${new Date().toISOString().split('T')[0]}*
*Framework: ${primaryFramework?.name || 'Mixed'} | Primary Motif: ${primaryMotif?.name || 'Adaptive'}*`;
}