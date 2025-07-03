// API endpoint for collecting experiment feedback and evaluation metrics

import { NextRequest, NextResponse } from 'next/server';
import { experimentManager } from '@/lib/experiment-framework';

export async function POST(request: NextRequest) {
  try {
    const {
      experimentId,
      templateId,
      sessionId,
      metrics,
      feedbackScore,
      notes
    } = await request.json();

    if (!experimentId || !templateId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: experimentId, templateId, sessionId' },
        { status: 400 }
      );
    }

    // Record the experimental result
    experimentManager.recordResult({
      experimentId,
      templateId,
      sessionId,
      timestamp: new Date(),
      metrics: metrics || {},
      feedbackScore,
      notes
    });

    console.log(`📊 Recorded experiment feedback: ${experimentId}/${templateId} - Score: ${feedbackScore || 'N/A'}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback recorded successfully' 
    });
  } catch (error) {
    console.error('Error recording experiment feedback:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const experimentId = url.searchParams.get('experimentId');
    const templateId = url.searchParams.get('templateId');

    if (!experimentId) {
      return NextResponse.json(
        { error: 'experimentId parameter required' },
        { status: 400 }
      );
    }

    // Get results for the experiment
    const results = experimentManager.getResults(experimentId, templateId || undefined);
    
    // Generate efficacy report if enough data
    let efficacyReport = null;
    if (results.length >= 5) {
      efficacyReport = experimentManager.generateEfficacyReport(experimentId);
    }

    return NextResponse.json({
      experimentId,
      templateId,
      resultCount: results.length,
      results: results.slice(-20), // Return latest 20 results
      efficacyReport
    });
  } catch (error) {
    console.error('Error retrieving experiment results:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve results' },
      { status: 500 }
    );
  }
}