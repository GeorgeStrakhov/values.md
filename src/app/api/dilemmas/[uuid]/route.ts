import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { eq, ne, sql } from 'drizzle-orm';

// Simple rate limiting cache
const requestCache = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  for (const [key, timestamp] of requestCache.entries()) {
    if (timestamp < windowStart) {
      requestCache.delete(key);
    }
  }
  
  // Count requests from this client in the window
  const clientRequests = Array.from(requestCache.entries())
    .filter(([key]) => key.startsWith(clientId))
    .length;
    
  if (clientRequests >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  requestCache.set(`${clientId}-${now}`, now);
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    
    // Rate limiting based on IP
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before requesting more dilemmas.' },
        { status: 429 }
      );
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return NextResponse.json(
        { error: 'Invalid UUID format' },
        { status: 400 }
      );
    }

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

    // Get pagination parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '25'); // Default to 25 dilemmas
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const loadAll = url.searchParams.get('all') === 'true';
    
    // Validate pagination parameters
    const safeLimit = Math.min(Math.max(limit, 1), loadAll ? 1000 : 50); // Max 50 unless explicitly requesting all
    const safeOffset = Math.max(offset, 0);

    if (loadAll) {
      // Legacy behavior: load all dilemmas (for backward compatibility)
      const otherDilemmas = await db
        .select()
        .from(dilemmas)
        .where(ne(dilemmas.dilemmaId, uuid))
        .orderBy(sql`dilemma_id`);
      
      const allDilemmas = [dilemma[0], ...otherDilemmas];
      
      return NextResponse.json({
        dilemmas: allDilemmas,
        startingDilemma: dilemma[0],
        pagination: {
          total: allDilemmas.length,
          loaded: allDilemmas.length,
          hasMore: false
        }
      });
    } else {
      // Progressive loading: get limited set
      const otherDilemmas = await db
        .select()
        .from(dilemmas)
        .where(ne(dilemmas.dilemmaId, uuid))
        .orderBy(sql`dilemma_id`)
        .limit(safeLimit - 1) // -1 because we include the starting dilemma
        .offset(safeOffset);

      // Get total count for pagination info
      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(dilemmas);

      const currentBatch = safeOffset === 0 
        ? [dilemma[0], ...otherDilemmas] 
        : otherDilemmas;
      
      const totalDilemmas = totalCount[0].count;
      const loaded = safeOffset + currentBatch.length;
      
      return NextResponse.json({
        dilemmas: currentBatch,
        startingDilemma: dilemma[0],
        pagination: {
          total: totalDilemmas,
          loaded: loaded,
          hasMore: loaded < totalDilemmas,
          nextOffset: loaded
        }
      });
    }
  } catch (error) {
    console.error('Error fetching dilemma:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dilemma' },
      { status: 500 }
    );
  }
}