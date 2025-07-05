/**
 * Centralized API Error Handling
 * 
 * Provides consistent error responses across all API endpoints
 * for Tier 1 infrastructure standardization.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  path?: string
  validationErrors?: string[]
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Standardized error response formatter
 */
export function createErrorResponse(
  error: AppError | Error | unknown,
  path?: string,
  statusCode?: number
): NextResponse<ApiError> {
  const timestamp = new Date().toISOString()

  // Handle AppError instances
  if (error instanceof AppError) {
    const errorResponse: ApiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp,
      path
    }
    return NextResponse.json(errorResponse, { status: error.statusCode })
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    const validationErrors = error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    )
    const errorResponse: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      validationErrors,
      timestamp,
      path
    }
    return NextResponse.json(errorResponse, { status: 400 })
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    const errorResponse: ApiError = {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal error occurred' 
        : error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp,
      path
    }
    return NextResponse.json(errorResponse, { status: statusCode || 500 })
  }

  // Handle unknown errors
  const errorResponse: ApiError = {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    timestamp,
    path
  }
  return NextResponse.json(errorResponse, { status: 500 })
}

/**
 * Common error factories
 */
export const ApiErrors = {
  validation: (message: string, details?: any) => 
    new AppError('VALIDATION_ERROR', message, 400, details),
    
  notFound: (resource: string) => 
    new AppError('NOT_FOUND', `${resource} not found`, 404),
    
  unauthorized: (message: string = 'Unauthorized') => 
    new AppError('UNAUTHORIZED', message, 401),
    
  forbidden: (message: string = 'Forbidden') => 
    new AppError('FORBIDDEN', message, 403),
    
  tooManyRequests: (message: string = 'Too many requests') => 
    new AppError('TOO_MANY_REQUESTS', message, 429),
    
  internal: (message: string, details?: any) => 
    new AppError('INTERNAL_ERROR', message, 500, details),
    
  badRequest: (message: string, details?: any) => 
    new AppError('BAD_REQUEST', message, 400, details),
    
  conflict: (message: string) => 
    new AppError('CONFLICT', message, 409),
    
  serviceUnavailable: (service: string) => 
    new AppError('SERVICE_UNAVAILABLE', `${service} is temporarily unavailable`, 503)
}

/**
 * Request validation schemas
 */
export const CommonSchemas = {
  sessionId: z.string().min(1, 'Session ID is required'),
  
  dilemmaId: z.string().uuid('Invalid dilemma ID format'),
  
  choice: z.enum(['a', 'b', 'c', 'd'], {
    errorMap: () => ({ message: 'Choice must be a, b, c, or d' })
  }),
  
  difficulty: z.number()
    .int('Difficulty must be an integer')
    .min(1, 'Difficulty must be at least 1')
    .max(10, 'Difficulty must be at most 10'),
    
  reasoning: z.string().optional(),
  
  responseTime: z.number().int().min(0).optional(),
  
  userResponses: z.array(z.object({
    dilemmaId: z.string().uuid(),
    chosenOption: z.enum(['a', 'b', 'c', 'd']),
    reasoning: z.string().optional(),
    responseTime: z.number().int().min(0).optional(),
    perceivedDifficulty: z.number().int().min(1).max(10)
  })).min(1, 'At least one response is required')
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiError>> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      
      // Extract path from request if available
      const request = args[0] as Request
      const path = request?.url ? new URL(request.url).pathname : undefined
      
      return createErrorResponse(error, path)
    }
  }
}

/**
 * Request logging middleware
 */
export function logRequest(request: Request, method: string = 'UNKNOWN') {
  const timestamp = new Date().toISOString()
  const url = new URL(request.url)
  
  console.log(`[${timestamp}] ${method} ${url.pathname}${url.search}`)
  
  // In production, this would integrate with proper logging service
  if (process.env.NODE_ENV === 'development') {
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
  }
}

/**
 * Response logging middleware
 */
export function logResponse(response: NextResponse, duration?: number) {
  const timestamp = new Date().toISOString()
  const durationStr = duration ? ` (${duration}ms)` : ''
  
  console.log(`[${timestamp}] Response ${response.status}${durationStr}`)
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const key = identifier
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

/**
 * Get client IP for rate limiting
 */
export function getClientIP(request: Request): string {
  // Check common headers for client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('x-client-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || clientIP || 'unknown'
}

/**
 * CORS headers helper
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

/**
 * Add security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}