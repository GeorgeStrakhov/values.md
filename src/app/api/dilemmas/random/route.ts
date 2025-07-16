import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  try {
    // Get a random dilemma to start with
    const randomDilemma = await db
      .select()
      .from(dilemmas)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomDilemma.length === 0) {
      return NextResponse.json(
        { error: 'No dilemmas found' },
        { status: 404 }
      );
    }

    // Use the request URL origin for redirect instead of env var
    const { origin } = new URL(request.url);
    
    // Redirect to the explore page with this dilemma's UUID
    return NextResponse.redirect(
      new URL(`/explore/${randomDilemma[0].dilemmaId}`, origin)
    );
  } catch (error) {
    console.error('Error fetching random dilemma:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random dilemma' },
      { status: 500 }
    );
  }
}