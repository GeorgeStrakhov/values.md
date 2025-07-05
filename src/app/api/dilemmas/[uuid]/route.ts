import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { eq, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  withErrorHandler,
  ApiErrors,
  CommonSchemas,
  logRequest,
  logResponse,
  checkRateLimit,
  getClientIP,
  addCorsHeaders,
  addSecurityHeaders
} from '@/lib/api-error-handler';

// Pagination schema for validation
const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(25),
  offset: z.coerce.number().int().min(0).default(0),
  all: z.enum(['true', 'false']).transform(val => val === 'true').default('false')
});

async function handleGET(request: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  const startTime = Date.now();
  logRequest(request, 'GET');
  
  // Rate limiting
  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP, 10, 60 * 1000)) {
    throw ApiErrors.tooManyRequests('Rate limit exceeded. Please wait before requesting more dilemmas.');
  }
  
  // Parse and validate parameters
  const { uuid } = await params;
  const url = new URL(request.url);
  
  // Validate UUID using common schema
  const validatedUuid = CommonSchemas.dilemmaId.parse(uuid);
  
  // Validate pagination parameters
  const paginationParams = PaginationSchema.parse({
    limit: url.searchParams.get('limit'),
    offset: url.searchParams.get('offset'),
    all: url.searchParams.get('all')
  });

  // Get the specific dilemma
  const dilemma = await db
    .select()
    .from(dilemmas)
    .where(eq(dilemmas.dilemmaId, validatedUuid))
    .limit(1);

  if (dilemma.length === 0) {
    throw ApiErrors.notFound('Dilemma');
  }

  const { limit, offset, all: loadAll } = paginationParams;
  
  console.log(`📥 Fetching dilemmas: UUID=${validatedUuid}, limit=${limit}, offset=${offset}, loadAll=${loadAll}`);

  if (loadAll) {
    // Legacy behavior: load all dilemmas (for backward compatibility)
    const otherDilemmas = await db
      .select()
      .from(dilemmas)
      .where(ne(dilemmas.dilemmaId, validatedUuid))
      .orderBy(sql`dilemma_id`);
    
    const allDilemmas = [dilemma[0], ...otherDilemmas];
    
    const response = NextResponse.json({
      dilemmas: allDilemmas,
      startingDilemma: dilemma[0],
      pagination: {
        total: allDilemmas.length,
        loaded: allDilemmas.length,
        hasMore: false
      }
    });
    
    logResponse(response, Date.now() - startTime);
    return addSecurityHeaders(addCorsHeaders(response));
  }

  // Progressive loading: get limited set
  const otherDilemmas = await db
    .select()
    .from(dilemmas)
    .where(ne(dilemmas.dilemmaId, validatedUuid))
    .orderBy(sql`dilemma_id`)
    .limit(limit - 1) // -1 because we include the starting dilemma
    .offset(offset);

  // Get total count for pagination info
  const [totalCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(dilemmas);

  const currentBatch = offset === 0 
    ? [dilemma[0], ...otherDilemmas] 
    : otherDilemmas;
  
  const totalDilemmas = totalCount?.count || 0;
  const loaded = offset + currentBatch.length;
  
  const response = NextResponse.json({
    dilemmas: currentBatch,
    startingDilemma: dilemma[0],
    pagination: {
      total: totalDilemmas,
      loaded: loaded,
      hasMore: loaded < totalDilemmas,
      nextOffset: loaded
    }
  });
  
  logResponse(response, Date.now() - startTime);
  return addSecurityHeaders(addCorsHeaders(response));
}

// Main GET handler with error handling
export const GET = withErrorHandler(handleGET);

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}