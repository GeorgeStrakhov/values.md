import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, motifs } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    // Get all responses for this session with dilemma details
    const responses = await db
      .select({
        response: userResponses,
        dilemma: dilemmas
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Analyze motif patterns
    const motifCounts: Record<string, number> = {};
    responses.forEach(({ response, dilemma }) => {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'a': chosenMotif = dilemma.choiceAMotif || ''; break;
        case 'b': chosenMotif = dilemma.choiceBMotif || ''; break;
        case 'c': chosenMotif = dilemma.choiceCMotif || ''; break;
        case 'd': chosenMotif = dilemma.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
      }
    });

    // Get top motifs
    const topMotifs = Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([motif]) => motif);

    // Calculate basic statistics
    const totalResponses = responses.length;
    const avgDifficulty = responses.reduce((sum, r) => sum + (r.response.perceivedDifficulty || 5), 0) / totalResponses;
    const avgResponseTime = responses.reduce((sum, r) => sum + (r.response.responseTime || 30000), 0) / totalResponses;
    
    // Framework mapping (simplified)
    const frameworkMapping: Record<string, string> = {
      'autonomy': 'deontological',
      'beneficence': 'utilitarian',
      'care_ethics': 'care',
      'justice': 'justice',
      'virtue': 'virtue'
    };
    
    const frameworkCounts: Record<string, number> = {};
    topMotifs.forEach(motif => {
      const framework = frameworkMapping[motif] || 'mixed';
      frameworkCounts[framework] = (frameworkCounts[framework] || 0) + 1;
    });
    
    const primaryFramework = Object.entries(frameworkCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'mixed';

    return NextResponse.json({
      sessionId,
      responseCount: totalResponses,
      topMotifs,
      motifCounts,
      primaryFramework,
      frameworkCounts,
      statistics: {
        avgDifficulty: Math.round(avgDifficulty * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime),
        responsesWithReasoning: responses.filter(r => r.response.reasoning).length
      },
      rawResponses: responses.map(r => ({
        dilemmaTitle: r.dilemma.title,
        chosenOption: r.response.chosenOption,
        reasoning: r.response.reasoning,
        difficulty: r.response.perceivedDifficulty,
        responseTime: r.response.responseTime
      }))
    });

  } catch (error) {
    console.error('Error loading session:', error);
    return NextResponse.json(
      { error: 'Failed to load session data' },
      { status: 500 }
    );
  }
}