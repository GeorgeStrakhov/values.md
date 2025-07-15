import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';

export async function GET() {
  try {
    const result = await db.select().from(dilemmas);
    
    return NextResponse.json({
      connected: true,
      dilemmaCount: result.length,
      sampleDilemma: result[0]?.title || null
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    
    return NextResponse.json({
      connected: false,
      dilemmaCount: 0,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }, { status: 500 });
  }
}