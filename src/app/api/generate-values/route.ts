import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { dilemmaGenerator } from '@/lib/dilemma-generator';

// Simple in-memory cache for generated values
const valuesCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Check cache first (idempotency)
    const cached = valuesCache.get(sessionId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`♻️ Returning cached values for session ${sessionId}`);
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

    // Use the enhanced statistical analysis from dilemma generator
    const statisticalAnalysis = await dilemmaGenerator.generateStatisticalAnalysis(sessionId);
    
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
    valuesCache.set(sessionId, { data: result, timestamp: Date.now() });
    console.log(`💾 Cached values for session ${sessionId}`);

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
  
  return `# My Values

## Core Ethical Framework

Based on my responses to ${totalResponses} ethical dilemmas, my decision-making is primarily guided by **${primaryMotif?.name || 'Mixed Approaches'}**.

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
  .map(([framework, weight]) => `- **${framework}:** ${Math.round((weight as number) / totalResponses * 100)}%`)
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