import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, llmAlignmentExperiments } from '@/lib/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getOpenRouterResponse } from '@/lib/openrouter';
import { templates } from '@/lib/values-templates';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, experimentType = 'comprehensive_alignment' } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log(`🧪 Starting LLM alignment experiment for session: ${sessionId}`);

    // Get user responses
    const responses = await db
      .select({
        response: userResponses,
        dilemma: dilemmas
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    if (responses.length === 0) {
      return NextResponse.json({ error: 'No responses found for session' }, { status: 404 });
    }

    console.log(`📊 Found ${responses.length} responses for alignment testing`);

    // For now, return a simplified test result - we can build up from here
    return NextResponse.json({
      success: true,
      sessionId,
      experimentType,
      message: `Found ${responses.length} responses ready for alignment testing`,
      responseCount: responses.length,
      templates: templates.map(t => ({ id: t.id, name: t.name })),
      status: 'infrastructure_ready',
      results: [],
      summary: {
        totalTests: 0,
        averageAlignment: 0,
        bestTemplate: 'enhanced',
        bestModel: 'claude'
      }
    });

  } catch (error) {
    console.error('Alignment experiment error:', error);
    return NextResponse.json({ 
      error: 'Experiment failed', 
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}