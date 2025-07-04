import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// Simple feedback table schema (we'll add to schema later)
// For now, just log to console and store in a simple way

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json();
    
    // Validate required fields
    if (!feedback.scenario || !feedback.baseline || !feedback.aligned || !feedback.rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, log feedback to console (in production, store in database)
    console.log('VALUES.md Feedback Received:', {
      id: randomUUID(),
      timestamp: feedback.timestamp,
      aiSystem: feedback.aiSystem,
      scenario: feedback.scenario?.substring(0, 200) + '...',
      rating: feedback.rating,
      helpful: feedback.helpful,
      hasSpecificExamples: !!feedback.specific,
      hasImprovements: !!feedback.improvements
    });

    // Store full feedback (in real implementation, would use proper database table)
    const feedbackRecord = {
      id: randomUUID(),
      timestamp: feedback.timestamp || new Date().toISOString(),
      aiSystem: feedback.aiSystem,
      scenario: feedback.scenario,
      baselineResponse: feedback.baseline,
      alignedResponse: feedback.aligned,
      differenceRating: feedback.rating,
      helpfulnessRating: feedback.helpful,
      specificChanges: feedback.specific,
      improvementSuggestions: feedback.improvements,
      userAgent: feedback.userAgent
    };

    // For now, just return success
    // TODO: Store in proper database table for analysis
    
    return NextResponse.json({ 
      success: true, 
      message: 'Feedback received successfully',
      id: feedbackRecord.id 
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Simple endpoint to check if feedback API is working
  return NextResponse.json({ 
    status: 'Feedback API is working',
    timestamp: new Date().toISOString()
  });
}