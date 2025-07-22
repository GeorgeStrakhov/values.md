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
    
    // Support multiple formats for maximum compatibility
    const responses = body.responses || body.userResponses || [];
    const sessionId = body.sessionId; // Optional for compatibility

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.log('No valid responses found');
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

