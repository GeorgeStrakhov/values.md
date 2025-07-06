import { NextRequest, NextResponse } from 'next/server';
import { ProductionSafetyNet } from '@/lib/production-safety-nets';

/**
 * EMERGENCY DILEMMA ENDPOINT
 * Provides dilemmas even when main database is down
 * Prevents "No Dilemmas Available" error in production
 */

export async function GET(request: NextRequest) {
  console.log('🚨 Emergency dilemma endpoint activated');
  
  try {
    // Always try real database first
    const dilemmas = await ProductionSafetyNet.getDilemmasWithFallback();
    
    // If we have any dilemmas, return them
    if (dilemmas.length > 0) {
      // Select a random one for the main use case
      const randomDilemma = dilemmas[Math.floor(Math.random() * dilemmas.length)];
      
      return NextResponse.json({
        status: 'emergency-success',
        dilemma: randomDilemma,
        allDilemmas: dilemmas,
        source: dilemmas.length === 3 ? 'emergency-dataset' : 'database-fallback',
        message: 'Emergency dilemma service operational',
        instructions: {
          usage: 'This endpoint provides basic dilemma functionality when main system is unavailable',
          redirect: 'For full experience, redirect to /explore/' + randomDilemma.dilemmaId
        }
      });
    } else {
      // This should never happen due to emergency dataset, but just in case
      throw new Error('No dilemmas available from any source');
    }
  } catch (error) {
    console.error('💥 Emergency dilemma endpoint failed:', error);
    
    return NextResponse.json({
      status: 'emergency-failure',
      error: 'Emergency dilemma service failed',
      message: 'Both primary and emergency systems are unavailable',
      diagnostics: {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        recommendations: [
          'Check deployment platform environment variables',
          'Verify database connectivity',
          'Contact system administrator'
        ]
      }
    }, { status: 503 });
  }
}