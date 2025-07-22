import { NextRequest, NextResponse } from 'next/server';
import { valuesGenerator } from '@/lib/values-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Debug logging for production
    console.log('Generate values called with:', { 
      bodyKeys: Object.keys(body),
      hasResponses: !!body.responses,
      hasUserResponses: !!body.userResponses, 
      hasSessionId: !!body.sessionId,
      responsesLength: body.responses?.length || body.userResponses?.length || 0
    });
    
    // Get sessionId and responses with multiple compatibility modes
    const sessionId = body.sessionId;
    let responses = body.responses || body.userResponses || [];

    // BACKWARD COMPATIBILITY: If only sessionId provided, look up responses from database
    if (sessionId && (!responses || responses.length === 0)) {
      console.log('Only sessionId provided, looking up responses from database');
      try {
        const { db } = await import('@/lib/db');
        const { userResponses: userResponsesTable } = await import('@/lib/schema');
        const { eq } = await import('drizzle-orm');
        
        const dbResponses = await db
          .select()
          .from(userResponsesTable)
          .where(eq(userResponsesTable.sessionId, sessionId));
          
        if (dbResponses.length > 0) {
          responses = dbResponses.map(r => ({
            dilemmaId: r.dilemmaId,
            chosenOption: r.chosenOption,
            reasoning: r.reasoning || '',
            responseTime: r.responseTime || 0,
            perceivedDifficulty: r.perceivedDifficulty || 5
          }));
          console.log(`Found ${responses.length} responses in database for session ${sessionId}`);
        }
      } catch (dbError) {
        console.error('Database lookup failed:', dbError);
      }
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('No valid responses found after all lookup attempts');
      return NextResponse.json(
        { error: 'No responses provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${responses.length} responses`);

    // Generate values using the modular generator
    const result = await valuesGenerator.generateValues(responses);

    console.log('Values generation completed successfully');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating values:', error);
    return NextResponse.json(
      { error: 'Failed to generate values' },
      { status: 500 }
    );
  }
}

