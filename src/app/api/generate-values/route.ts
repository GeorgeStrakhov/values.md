import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, motifs } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, responses: userResponses } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    if (!userResponses || userResponses.length === 0) {
      return NextResponse.json(
        { error: 'No responses provided' },
        { status: 400 }
      );
    }

    // Get dilemma data for the responses
    const dilemmaIds = userResponses.map((r: any) => r.dilemmaId);
    const dilemmaData = await db
      .select({
        dilemmaId: dilemmas.dilemmaId,
        title: dilemmas.title,
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
      })
      .from(dilemmas)
      .where(eq(dilemmas.dilemmaId, dilemmaIds[0])); // Get all dilemmas (this is simplified)

    // Get all dilemma data in parallel
    const dilemmaDataMap = new Map();
    for (const id of dilemmaIds) {
      const dilemmaInfo = await db
        .select({
          dilemmaId: dilemmas.dilemmaId,
          title: dilemmas.title,
          choiceAMotif: dilemmas.choiceAMotif,
          choiceBMotif: dilemmas.choiceBMotif,
          choiceCMotif: dilemmas.choiceCMotif,
          choiceDMotif: dilemmas.choiceDMotif,
        })
        .from(dilemmas)
        .where(eq(dilemmas.dilemmaId, id))
        .limit(1);
      
      if (dilemmaInfo.length > 0) {
        dilemmaDataMap.set(id, dilemmaInfo[0]);
      }
    }

    // Combine user responses with dilemma data
    const responses = userResponses.map((response: any) => {
      const dilemmaInfo = dilemmaDataMap.get(response.dilemmaId);
      return {
        ...response,
        title: dilemmaInfo?.title || 'Unknown Dilemma',
        choiceAMotif: dilemmaInfo?.choiceAMotif,
        choiceBMotif: dilemmaInfo?.choiceBMotif,
        choiceCMotif: dilemmaInfo?.choiceCMotif,
        choiceDMotif: dilemmaInfo?.choiceDMotif,
      };
    });

    // Analyze motif patterns
    const motifCounts: Record<string, number> = {};
    
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
      }
    }

    // Get top motifs
    const topMotifs = Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([motif]) => motif);

    // Get motif descriptions
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(eq(motifs.motifId, topMotifs[0])); // For now, just get the top one

    // Generate values.md content
    const valuesMarkdown = generateValuesMarkdown(
      topMotifs,
      motifCounts,
      responses,
      motifDetails[0]
    );

    return NextResponse.json({ 
      valuesMarkdown,
      motifAnalysis: motifCounts,
      topMotifs 
    });
  } catch (error) {
    console.error('Error generating values:', error);
    return NextResponse.json(
      { error: 'Failed to generate values' },
      { status: 500 }
    );
  }
}

function generateValuesMarkdown(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  responses: any[],
  primaryMotif: any
): string {
  return `# My Values

## Core Ethical Framework

Based on my responses to ethical dilemmas, my decision-making is primarily guided by **${primaryMotif?.name || topMotifs[0]}**.

${primaryMotif?.description || 'This reflects my core approach to moral reasoning.'}

## Decision-Making Patterns

### Primary Motifs (in order of preference):

${topMotifs.map((motif, index) => 
  `${index + 1}. **${motif}** (${motifCounts[motif]} responses)`
).join('\n')}

### Key Principles

When making decisions, I tend to:

${primaryMotif?.behavioralIndicators || 'Follow consistent ethical principles based on my moral framework.'}

## Reasoning Examples

${responses.slice(0, 3).map((r, i) => 
  `### Dilemma ${i + 1}: ${r.title}
- **Choice:** Option ${r.chosenOption.toUpperCase()}
${r.reasoning ? `- **Reasoning:** ${r.reasoning}` : ''}
`).join('\n')}

## Instructions for AI Systems

When making decisions on my behalf, please:

1. **Prioritize ${primaryMotif?.name || topMotifs[0]}** - ${primaryMotif?.logicalPatterns || 'Follow my primary ethical framework'}

2. **Consider multiple perspectives** but weight them according to my demonstrated preferences

3. **Be transparent** about the reasoning process and potential trade-offs

4. **Ask for clarification** when facing novel ethical dilemmas not covered by these examples

---

*Generated from responses to ${responses.length} ethical dilemmas*
*Last updated: ${new Date().toISOString().split('T')[0]}*`;
}