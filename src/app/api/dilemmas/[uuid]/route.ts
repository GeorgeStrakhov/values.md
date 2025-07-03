import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { eq, ne, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    // Get the specific dilemma
    const dilemma = await db
      .select()
      .from(dilemmas)
      .where(eq(dilemmas.dilemmaId, uuid))
      .limit(1);

    if (dilemma.length === 0) {
      return NextResponse.json(
        { error: 'Dilemma not found' },
        { status: 404 }
      );
    }

    // Get 11 more dilemmas in a deterministic way based on the UUID
    // This ensures the same UUID always returns the same set of dilemmas
    const otherDilemmas = await db
      .select()
      .from(dilemmas)
      .where(ne(dilemmas.dilemmaId, uuid))
      .orderBy(sql`dilemma_id`) // Deterministic ordering instead of RANDOM()
      .limit(11);

    // Combine with the specific dilemma at the start
    const allDilemmas = [dilemma[0], ...otherDilemmas];

    return NextResponse.json({
      dilemmas: allDilemmas,
      startingDilemma: dilemma[0],
    });
  } catch (error) {
    console.error('Error fetching dilemma:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dilemma' },
      { status: 500 }
    );
  }
}