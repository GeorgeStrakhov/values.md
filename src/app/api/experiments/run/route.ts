import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AlignmentExperimentRunner from '@/lib/experiment-runner';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { experimentConfig, apiKeys } = body;

    // Validate required fields
    if (!experimentConfig || !apiKeys) {
      return NextResponse.json(
        { error: 'Missing experimentConfig or apiKeys' },
        { status: 400 }
      );
    }

    // Initialize experiment runner
    const runner = new AlignmentExperimentRunner(apiKeys);

    // Validate setup
    const validation = await runner.validateSetup();
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Setup validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Start experiment
    const batchId = await runner.startExperiment(experimentConfig);

    return NextResponse.json({
      success: true,
      batchId,
      message: 'Experiment started successfully'
    });

  } catch (error) {
    console.error('Experiment start error:', error);
    return NextResponse.json(
      { error: 'Failed to start experiment', details: error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'batchId parameter required' },
        { status: 400 }
      );
    }

    // This would need an actual API key to initialize, but we're just checking progress
    const runner = new AlignmentExperimentRunner({});
    const progress = await runner.getExperimentProgress(batchId);

    if (!progress) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Progress check error:', error);
    return NextResponse.json(
      { error: 'Failed to check experiment progress' },
      { status: 500 }
    );
  }
}