import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    // Redirect to the explore page with this dilemma's UUID
    // Use the request origin to ensure we stay on the same domain/port
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    return NextResponse.redirect(
      new URL(`/explore/${randomDilemma[0].dilemmaId}`, baseUrl)
    );
  } catch (error) {
    console.error('Error fetching random dilemma:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random dilemma' },
      { status: 500 }
    );
  }
}
