import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get 12 random dilemmas
    const randomDilemmas = await db
      .select()
      .from(dilemmas)
      .orderBy(sql`RANDOM()`)
      .limit(12);

    if (randomDilemmas.length === 0) {
      return NextResponse.json(
        { error: 'No dilemmas found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      dilemmas: randomDilemmas
    });
  } catch (error) {
    console.error('Error fetching dilemmas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dilemmas' },
      { status: 500 }
    );
  }
}