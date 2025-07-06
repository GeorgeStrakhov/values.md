/**
 * Core API Test Suite
 * 
 * Tests for critical API endpoints and business logic functions
 * identified by categorical analysis.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, insertTestResponses, callAPI } from './test-utils';
import { createTestSession, createTestDilemmas } from './test-data';

describe('Core API Business Logic', () => {
  let testSessionId: string;

  beforeEach(async () => {
    await setupTestDatabase();
    const session = createTestSession();
    testSessionId = session.sessionId;
  });

  afterEach(async () => {
    await cleanupTestDatabase([testSessionId]);
  });

  describe('Values Generation API', () => {
    test('should generate VALUES.md from response patterns', async () => {
      // Insert test responses
      const responses = [
        { dilemmaId: 'test-dilemma-001', chosenOption: 'a', reasoning: 'Utilitarian approach', perceivedDifficulty: 7 },
        { dilemmaId: 'test-dilemma-002', chosenOption: 'b', reasoning: 'Rule-based ethics', perceivedDifficulty: 6 },
        { dilemmaId: 'test-dilemma-003', chosenOption: 'a', reasoning: 'Maximize benefit', perceivedDifficulty: 8 }
      ];

      await insertTestResponses(testSessionId, responses);

      // Call the values generation API
      const result = await callAPI('/api/generate-values', {
        method: 'POST',
        body: { sessionId: testSessionId }
      });

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('valuesMarkdown');
      expect(result.data.valuesMarkdown).toContain('# My Values');
      expect(result.data.valuesMarkdown).toContain('Core Ethical Framework');
    });

    test('should handle empty responses gracefully', async () => {
      // Call API with session that has no responses
      const result = await callAPI('/api/generate-values', {
        method: 'POST',
        body: { sessionId: 'empty-session' }
      });

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
      expect(result.data.valuesMarkdown).toContain('# My Values');
      expect(result.data.valuesMarkdown).toContain('Balanced Ethical Reasoning');
    });

    test('should correctly map motifs to ethical frameworks', async () => {
      const responses = [
        { dilemmaId: 'test-dilemma-001', chosenOption: 'a', reasoning: 'Numbers first approach', perceivedDifficulty: 7 },
        { dilemmaId: 'test-dilemma-002', chosenOption: 'a', reasoning: 'Calculate best outcome', perceivedDifficulty: 6 }
      ];

      await insertTestResponses(testSessionId, responses);

      const result = await callAPI('/api/generate-values', {
        method: 'POST',
        body: { sessionId: testSessionId }
      });

      expect(result.status).toBe(200);
      expect(result.data.valuesMarkdown).toContain('data-driven decisions');
      expect(result.data.metadata).toHaveProperty('primaryMotifs');
    });
  });

  describe('Response Submission API', () => {
    test('should save responses to database correctly', async () => {
      const responseData = {
        sessionId: testSessionId,
        responses: [
          {
            dilemmaId: 'test-dilemma-001',
            chosenOption: 'b',
            reasoning: 'This follows ethical principles',
            responseTime: 15000,
            perceivedDifficulty: 6
          }
        ]
      };

      const result = await callAPI('/api/responses', {
        method: 'POST',
        body: responseData
      });

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('responsesProcessed', 1);
    });

    test('should handle malformed request data gracefully', async () => {
      const malformedData = {
        sessionId: testSessionId,
        responses: [
          {
            // Missing required fields
            dilemmaId: 'test-dilemma-001'
            // chosenOption missing
          }
        ]
      };

      const result = await callAPI('/api/responses', {
        method: 'POST',
        body: malformedData
      });

      // Should handle gracefully, not crash
      expect([200, 400]).toContain(result.status);
    });

    test('should validate session data before processing', async () => {
      const result = await callAPI('/api/responses', {
        method: 'POST',
        body: {
          // Missing sessionId
          responses: []
        }
      });

      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('error');
    });
  });

  describe('Dilemma Retrieval API', () => {
    test('should fetch random dilemmas successfully', async () => {
      const result = await callAPI('/api/dilemmas/random');

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('dilemmas');
      expect(Array.isArray(result.data.dilemmas)).toBe(true);
      expect(result.data.dilemmas.length).toBeGreaterThan(0);

      // Check dilemma structure
      const dilemma = result.data.dilemmas[0];
      expect(dilemma).toHaveProperty('dilemmaId');
      expect(dilemma).toHaveProperty('title');
      expect(dilemma).toHaveProperty('scenario');
      expect(dilemma).toHaveProperty('choiceA');
      expect(dilemma).toHaveProperty('choiceB');
      expect(dilemma).toHaveProperty('choiceC');
      expect(dilemma).toHaveProperty('choiceD');
    });

    test('should fetch specific dilemma by UUID', async () => {
      // First get a dilemma to test with
      const randomResult = await callAPI('/api/dilemmas/random');
      const dilemmaId = randomResult.data.dilemmas[0].dilemmaId;

      const result = await callAPI(`/api/dilemmas/${dilemmaId}`);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('dilemma');
      expect(result.data.dilemma.dilemmaId).toBe(dilemmaId);
    });

    test('should handle invalid UUID gracefully', async () => {
      const result = await callAPI('/api/dilemmas/invalid-uuid');

      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('error');
    });
  });

  describe('API Quality and Performance', () => {
    test('should have consistent error format across all endpoints', async () => {
      const endpoints = [
        { path: '/api/dilemmas/invalid-uuid', method: 'GET' },
        { path: '/api/responses', method: 'POST', body: {} },
        { path: '/api/generate-values', method: 'POST', body: {} }
      ];

      for (const endpoint of endpoints) {
        const result = await callAPI(endpoint.path, {
          method: endpoint.method,
          body: endpoint.body
        });

        if (result.status >= 400) {
          expect(result.data).toHaveProperty('error');
          expect(typeof result.data.error).toBe('string');
        }
      }
    });

    test('should have proper CORS headers for client integration', async () => {
      const result = await callAPI('/api/dilemmas/random');

      expect(result.headers.get('access-control-allow-origin')).toBeTruthy();
    });

    test('should handle rate limiting gracefully', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array(10).fill(null).map(() => 
        callAPI('/api/dilemmas/random')
      );

      const results = await Promise.all(promises);
      
      // All should succeed or gracefully handle rate limiting
      results.forEach(result => {
        expect([200, 429]).toContain(result.status);
      });
    });
  });

  describe('Data Pipeline Integration', () => {
    test('should complete full data pipeline: responses → database → motif lookup → values generation', async () => {
      // Step 1: Save responses
      const responses = [
        { dilemmaId: 'test-dilemma-001', chosenOption: 'a', reasoning: 'Utilitarian approach', perceivedDifficulty: 8 },
        { dilemmaId: 'test-dilemma-002', chosenOption: 'c', reasoning: 'Care ethics approach', perceivedDifficulty: 6 },
        { dilemmaId: 'test-dilemma-003', chosenOption: 'b', reasoning: 'Deontological approach', perceivedDifficulty: 7 }
      ];

      const saveResult = await callAPI('/api/responses', {
        method: 'POST',
        body: { sessionId: testSessionId, responses }
      });

      expect(saveResult.status).toBe(200);

      // Step 2: Generate values from saved responses
      const valuesResult = await callAPI('/api/generate-values', {
        method: 'POST',
        body: { sessionId: testSessionId }
      });

      expect(valuesResult.status).toBe(200);
      expect(valuesResult.data.valuesMarkdown).toContain('# My Values');

      // Step 3: Verify motif mapping worked
      expect(valuesResult.data).toHaveProperty('metadata');
      expect(valuesResult.data.metadata).toHaveProperty('responseCount', 3);
    });

    test('should handle database connection issues gracefully', async () => {
      // This test would normally require mocking database failures
      // For now, test that the API doesn't crash on edge cases
      
      const result = await callAPI('/api/generate-values', {
        method: 'POST',
        body: { sessionId: 'non-existent-session' }
      });

      // Should handle gracefully, not crash
      expect([200, 404]).toContain(result.status);
    });
  });
});