import { NextRequest, NextResponse } from 'next/server';
import { valuesGenerator } from '@/lib/values-generator';

export async function POST(request: NextRequest) {
  try {
    const { responses } = await request.json();

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

