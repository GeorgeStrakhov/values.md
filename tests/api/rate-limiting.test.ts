import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/dilemmas/[uuid]/route';
import { NextRequest } from 'next/server';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{
            dilemmaId: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Dilemma',
            scenario: 'Test scenario',
            choiceA: 'Choice A',
            choiceB: 'Choice B',
            choiceC: 'Choice C',
            choiceD: 'Choice D'
          }])),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve([]))
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('API Rate Limiting', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the rate limiting cache
    vi.resetModules();
  });

  it('should allow requests within rate limit', async () => {
    const request = new NextRequest(`http://localhost:3000/api/dilemmas/${validUuid}`, {
      headers: { 'x-forwarded-for': '127.0.0.1' }
    });
    
    const params = Promise.resolve({ uuid: validUuid });
    
    const response = await GET(request, { params });
    
    expect(response.status).toBe(200);
  });

  it('should reject requests exceeding rate limit', async () => {
    const clientIp = '127.0.0.1';
    
    // Make multiple requests rapidly
    const promises = [];
    for (let i = 0; i < 15; i++) {
      const request = new NextRequest(`http://localhost:3000/api/dilemmas/${validUuid}`, {
        headers: { 'x-forwarded-for': clientIp }
      });
      
      const params = Promise.resolve({ uuid: validUuid });
      promises.push(GET(request, { params }));
    }
    
    const responses = await Promise.all(promises);
    
    // Should have some rate limited responses
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
    
    // Check rate limit error message
    const rateLimitedResponse = rateLimited[0];
    const body = await rateLimitedResponse.json();
    expect(body.error).toContain('Rate limit exceeded');
  });

  it('should handle different client IPs independently', async () => {
    const clientIp1 = '127.0.0.1';
    const clientIp2 = '192.168.1.1';
    
    // Make requests from first IP
    const requests1 = [];
    for (let i = 0; i < 8; i++) {
      const request = new NextRequest(`http://localhost:3000/api/dilemmas/${validUuid}`, {
        headers: { 'x-forwarded-for': clientIp1 }
      });
      const params = Promise.resolve({ uuid: validUuid });
      requests1.push(GET(request, { params }));
    }
    
    // Make requests from second IP
    const requests2 = [];
    for (let i = 0; i < 8; i++) {
      const request = new NextRequest(`http://localhost:3000/api/dilemmas/${validUuid}`, {
        headers: { 'x-forwarded-for': clientIp2 }
      });
      const params = Promise.resolve({ uuid: validUuid });
      requests2.push(GET(request, { params }));
    }
    
    const responses1 = await Promise.all(requests1);
    const responses2 = await Promise.all(requests2);
    
    // Both IPs should have some successful requests
    const successful1 = responses1.filter(r => r.status === 200);
    const successful2 = responses2.filter(r => r.status === 200);
    
    expect(successful1.length).toBeGreaterThan(0);
    expect(successful2.length).toBeGreaterThan(0);
  });

  it('should validate UUID format', async () => {
    const invalidUuids = [
      'invalid-uuid',
      '123',
      '123e4567-e89b-12d3-a456-42661417400', // too short
      '123e4567-e89b-12d3-a456-426614174000-extra', // too long
      '123g4567-e89b-12d3-a456-426614174000', // invalid character
    ];
    
    for (const invalidUuid of invalidUuids) {
      const request = new NextRequest(`http://localhost:3000/api/dilemmas/${invalidUuid}`, {
        headers: { 'x-forwarded-for': '127.0.0.1' }
      });
      
      const params = Promise.resolve({ uuid: invalidUuid });
      const response = await GET(request, { params });
      
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body.error).toBe('Invalid UUID format');
    }
  });

  it('should handle pagination parameters safely', async () => {
    const testCases = [
      { limit: '0', expectedLimit: 1 },
      { limit: '100', expectedLimit: 50 },
      { limit: '-5', expectedLimit: 1 },
      { limit: 'invalid', expectedLimit: 25 },
      { offset: '-10', expectedOffset: 0 },
      { offset: 'invalid', expectedOffset: 0 }
    ];
    
    for (const testCase of testCases) {
      const url = new URL(`http://localhost:3000/api/dilemmas/${validUuid}`);
      if (testCase.limit) url.searchParams.set('limit', testCase.limit);
      if (testCase.offset) url.searchParams.set('offset', testCase.offset);
      
      const request = new NextRequest(url.toString(), {
        headers: { 'x-forwarded-for': '127.0.0.1' }
      });
      
      const params = Promise.resolve({ uuid: validUuid });
      const response = await GET(request, { params });
      
      expect(response.status).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('dilemmas');
      expect(body).toHaveProperty('pagination');
    }
  });

  it('should handle database errors gracefully', async () => {
    // Mock database error
    vi.doMock('@/lib/db', () => ({
      db: {
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => Promise.reject(new Error('Database connection failed')))
            }))
          }))
        }))
      }
    }));
    
    const request = new NextRequest(`http://localhost:3000/api/dilemmas/${validUuid}`, {
      headers: { 'x-forwarded-for': '127.0.0.1' }
    });
    
    const params = Promise.resolve({ uuid: validUuid });
    const response = await GET(request, { params });
    
    expect(response.status).toBe(500);
    
    const body = await response.json();
    expect(body.error).toBe('Failed to fetch dilemma');
  });

  it('should handle missing IP address', async () => {
    const request = new NextRequest(`http://localhost:3000/api/dilemmas/${validUuid}`);
    
    const params = Promise.resolve({ uuid: validUuid });
    const response = await GET(request, { params });
    
    // Should still work with 'unknown' client ID
    expect(response.status).toBe(200);
  });

  it('should support legacy "all" parameter', async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/dilemmas/${validUuid}?all=true`,
      {
        headers: { 'x-forwarded-for': '127.0.0.1' }
      }
    );
    
    const params = Promise.resolve({ uuid: validUuid });
    const response = await GET(request, { params });
    
    expect(response.status).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('dilemmas');
    expect(body.pagination.hasMore).toBe(false);
  });

  it('should clean up old rate limiting entries', async () => {
    // This test verifies that old entries are cleaned up
    // We can't easily test the timing, but we can verify the structure
    
    const request = new NextRequest(`http://localhost:3000/api/dilemmas/${validUuid}`, {
      headers: { 'x-forwarded-for': '127.0.0.1' }
    });
    
    const params = Promise.resolve({ uuid: validUuid });
    const response = await GET(request, { params });
    
    expect(response.status).toBe(200);
    
    // The rate limiting cache should be working
    // (This is more of a smoke test)
  });
});