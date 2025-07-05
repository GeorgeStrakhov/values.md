import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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

// Request validation schema
const ResponsesRequestSchema = z.object({
  sessionId: CommonSchemas.sessionId,
  responses: CommonSchemas.userResponses
});

async function handlePOST(request: NextRequest) {
  const startTime = Date.now();
  logRequest(request, 'POST');
  
  // Rate limiting
  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP, 50, 15 * 60 * 1000)) {
    throw ApiErrors.tooManyRequests('Too many requests. Please try again later.');
  }
  
  // Parse and validate request
  const body = await request.json();
  const validatedData = ResponsesRequestSchema.parse(body);
  const { sessionId, responses } = validatedData;

  console.log(`📥 Received ${responses.length} responses for session ${sessionId}`);
  
  // Check if responses already exist for this session (idempotency)
  const existingResponses = await db.select()
    .from(userResponses)
    .where(eq(userResponses.sessionId, sessionId));
  
  if (existingResponses.length > 0) {
    console.log(`♻️ Responses already exist for session ${sessionId}, returning existing data`);
    
    const response = NextResponse.json({ 
      success: true, 
      inserted: 0,
      existing: existingResponses.length,
      sessionId,
      message: 'Responses already exist for this session'
    });
    
    logResponse(response, Date.now() - startTime);
    return addSecurityHeaders(addCorsHeaders(response));
  }
  
  // Insert all responses in a batch for better performance
  const responseValues = responses.map(response => ({
    sessionId,
    dilemmaId: response.dilemmaId,
    chosenOption: response.chosenOption,
    reasoning: response.reasoning || '',
    responseTime: response.responseTime || 0,
    perceivedDifficulty: response.perceivedDifficulty,
  }));

  console.log('💾 Inserting responses into database...');
  
  try {
    const result = await db.insert(userResponses).values(responseValues);
    console.log(`✅ Successfully inserted ${responses.length} responses`);
  } catch (dbError: any) {
    // Handle specific database errors
    if (dbError.code === '23505') { // Unique constraint violation
      throw ApiErrors.conflict('Responses already exist for this session and dilemma combination');
    }
    if (dbError.code === '23503') { // Foreign key constraint violation
      throw ApiErrors.badRequest('One or more dilemma IDs are invalid');
    }
    throw ApiErrors.internal('Database error occurred while storing responses', dbError.message);
  }

  const response = NextResponse.json({ 
    success: true, 
    inserted: responses.length,
    sessionId 
  });
  
  logResponse(response, Date.now() - startTime);
  return addSecurityHeaders(addCorsHeaders(response));
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// Main POST handler with error handling
export const POST = withErrorHandler(handlePOST);