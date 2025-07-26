import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas } from '@/lib/schema';
import { eq } from 'drizzle-orm';
// Simplified generation - removed unused complex libraries

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
        responseCount: responses.length,
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

    // Use simple database-driven generation (cleaned up - removed complex unused paths)
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

  } catch (error) {
    console.error('Error generating values:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate values',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Removed unused validation function - using simple generation only

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