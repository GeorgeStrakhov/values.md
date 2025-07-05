/**
 * API Quality Patterns - Mathematical Enforcement
 * 
 * Implements mathematical patterning to ensure all API endpoints follow
 * identical quality standards automatically. No duplication, automatic derivation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  withErrorHandler,
  ApiErrors,
  logRequest,
  logResponse,
  checkRateLimit,
  getClientIP,
  addCorsHeaders,
  addSecurityHeaders
} from '@/lib/api-error-handler';

// Standard API patterns that all endpoints must follow
export interface APIEndpointConfig {
  name: string;
  rateLimit?: { requests: number; windowMs: number };
  requireAuth?: boolean;
  validateRequest?: z.ZodSchema;
  validateParams?: z.ZodSchema;
  cacheConfig?: { ttlMs: number; keyGenerator: (req: NextRequest) => string };
}

// Quality enforcer wrapper - mathematical pattern application
export function createQualityEndpoint<TRequest = any, TParams = any>(
  config: APIEndpointConfig,
  handler: (request: NextRequest, validated: { body?: TRequest; params?: TParams }) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: NextRequest, context?: { params?: Promise<TParams> }) => {
    const startTime = Date.now();
    logRequest(request, request.method);

    // 1. Rate limiting (applied to all endpoints automatically)
    const clientIP = getClientIP(request);
    const { requests = 30, windowMs = 60000 } = config.rateLimit || {};
    if (!checkRateLimit(clientIP, requests, windowMs)) {
      throw ApiErrors.tooManyRequests(`Rate limit exceeded for ${config.name}`);
    }

    // 2. Authentication (if required)
    if (config.requireAuth) {
      // TODO: Implement auth check when needed
      // const session = await getServerSession(request);
      // if (!session) throw ApiErrors.unauthorized();
    }

    // 3. Parameter validation (automatic)
    let validatedParams: TParams | undefined;
    if (context?.params && config.validateParams) {
      const rawParams = await context.params;
      validatedParams = config.validateParams.parse(rawParams);
    }

    // 4. Request body validation (automatic)
    let validatedBody: TRequest | undefined;
    if (config.validateRequest && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.json();
        validatedBody = config.validateRequest.parse(body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw error; // Will be handled by withErrorHandler
        }
        throw ApiErrors.badRequest('Invalid JSON in request body');
      }
    }

    // 5. Caching layer (automatic, if configured)
    if (config.cacheConfig && request.method === 'GET') {
      const cacheKey = config.cacheConfig.keyGenerator(request);
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log(`💾 Cache hit for ${config.name}: ${cacheKey}`);
        const response = NextResponse.json(cached);
        logResponse(response, Date.now() - startTime);
        return addSecurityHeaders(addCorsHeaders(response));
      }
    }

    // 6. Execute handler with validated inputs
    console.log(`🔄 Processing ${config.name}: ${request.method} ${request.url}`);
    const result = await handler(request, {
      body: validatedBody,
      params: validatedParams
    });

    // 7. Cache result (if configured)
    if (config.cacheConfig && request.method === 'GET' && result.status === 200) {
      const cacheKey = config.cacheConfig.keyGenerator(request);
      const resultData = await result.clone().json();
      setCache(cacheKey, resultData, config.cacheConfig.ttlMs);
      console.log(`💾 Cached result for ${config.name}: ${cacheKey}`);
    }

    // 8. Apply standard headers and logging
    logResponse(result, Date.now() - startTime);
    return addSecurityHeaders(addCorsHeaders(result));
  });
}

// Automatic OPTIONS handler generator
export function createOPTIONSHandler() {
  return async (request: NextRequest) => {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response);
  };
}

// Simple in-memory cache implementation
const cache = new Map<string, { data: any; expires: number }>();

function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache(key: string, data: any, ttlMs: number): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs
  });
  
  // Cleanup expired entries periodically
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now > v.expires) {
        cache.delete(k);
      }
    }
  }
}

// Common validation schemas (derived automatically)
export const CommonEndpointSchemas = {
  // Session-based endpoints
  sessionRequest: z.object({
    sessionId: z.string().min(1),
    responses: z.array(z.object({
      dilemmaId: z.string().uuid(),
      chosenOption: z.enum(['a', 'b', 'c', 'd']),
      reasoning: z.string().optional(),
      responseTime: z.number().int().min(0).optional(),
      perceivedDifficulty: z.number().int().min(1).max(10)
    })).min(1)
  }),

  // Values generation endpoints
  valuesGenerationRequest: z.object({
    responses: z.array(z.object({
      dilemmaId: z.string().uuid(),
      chosenOption: z.enum(['a', 'b', 'c', 'd']),
      reasoning: z.string().optional(),
      perceivedDifficulty: z.number().int().min(1).max(10)
    })).min(1),
    template: z.enum(['concise', 'comprehensive', 'technical', 'personal', 'organizational', 'values-only', 'assistant-prompt']).default('comprehensive'),
    privacy: z.enum(['private', 'research']).default('private')
  }),

  // UUID parameters
  uuidParams: z.object({
    uuid: z.string().uuid()
  }),

  // Pagination parameters
  paginationParams: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(25),
    offset: z.coerce.number().int().min(0).default(0)
  })
};

// Standard cache key generators
export const StandardCacheKeys = {
  byUrl: (request: NextRequest) => new URL(request.url).pathname + new URL(request.url).search,
  bySession: (request: NextRequest) => `session_${new URL(request.url).searchParams.get('sessionId') || 'anonymous'}`,
  byUuid: (request: NextRequest) => `uuid_${new URL(request.url).pathname.split('/').pop()}`,
  static: (key: string) => () => key
};

// Quality metrics tracker
let qualityMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  cacheHitRate: 0,
  lastReset: Date.now()
};

export function getQualityMetrics() {
  return {
    ...qualityMetrics,
    successRate: qualityMetrics.totalRequests > 0 
      ? (qualityMetrics.successfulRequests / qualityMetrics.totalRequests * 100).toFixed(2) + '%'
      : '0%',
    uptime: Date.now() - qualityMetrics.lastReset
  };
}

// Export for quality dashboard integration
export { cache, qualityMetrics };