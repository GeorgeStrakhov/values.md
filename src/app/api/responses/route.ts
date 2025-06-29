import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, responses } = body;

    if (!sessionId || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    console.log(`📥 Received ${responses.length} responses for session ${sessionId}`);
    
    // Check if responses already exist for this session (idempotency)
    const existingResponses = await db.select()
      .from(userResponses)
      .where(eq(userResponses.sessionId, sessionId));
    
    if (existingResponses.length > 0) {
      console.log(`♻️ Responses already exist for session ${sessionId}, returning existing data`);
      return NextResponse.json({ 
        success: true, 
        inserted: 0,
        existing: existingResponses.length,
        sessionId,
        message: 'Responses already exist for this session'
      });
    }
    
    // Validate response structure
    for (const response of responses) {
      if (!response.dilemmaId || !response.chosenOption) {
        console.error('❌ Invalid response structure:', response);
        return NextResponse.json(
          { error: 'Invalid response structure' },
          { status: 400 }
        );
      }
    }
    
    // Insert all responses in a batch for better performance
    const responseValues = responses.map(response => ({
      sessionId,
      dilemmaId: response.dilemmaId,
      chosenOption: response.chosenOption,
      reasoning: response.reasoning || '',
      responseTime: response.responseTime || 0,
      perceivedDifficulty: response.perceivedDifficulty || 5,
    }));

    console.log('💾 Inserting responses into database...');
    const result = await db.insert(userResponses).values(responseValues);
    console.log(`✅ Successfully inserted ${responses.length} responses`);

    return NextResponse.json({ 
      success: true, 
      inserted: responses.length,
      sessionId 
    });
  } catch (error) {
    console.error('Error storing responses:', error);
    return NextResponse.json(
      { error: 'Failed to store responses' },
      { status: 500 }
    );
  }
}