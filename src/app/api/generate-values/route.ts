import { NextRequest, NextResponse } from 'next/server';
import { valuesGenerator } from '@/lib/values-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both old format {sessionId, responses} and new format {responses}
    const responses = body.responses || body.userResponses;
    const sessionId = body.sessionId; // Optional for compatibility

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses provided' },
        { status: 400 }
      );
    }

    // Generate values using the modular generator
    const result = await valuesGenerator.generateValues(responses);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating values:', error);
    return NextResponse.json(
      { error: 'Failed to generate values' },
      { status: 500 }
    );
  }
}

