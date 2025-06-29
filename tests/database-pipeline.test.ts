/**
 * Database Pipeline Integration Tests
 * 
 * Tests the data flow that caused "No responses found" and missing motif data
 */

import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, insertTestResponses, callAPI } from './test-utils';
import { createTestSession, createTestDilemmas, testSeedData } from './test-data';
import { db } from '../src/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '../src/lib/schema';
import { eq, inArray } from 'drizzle-orm';

describe.skip('Database Pipeline Integration', () => {
  const testSessionIds: string[] = [];

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase(testSessionIds);
    testSessionIds.length = 0; // Clear array
  });

  test('CRITICAL: responses API saves to database correctly', async () => {
    // This would have caught the "No responses found" bug
    
    const session = createTestSession();
    testSessionIds.push(session.sessionId);
    
    // Call responses API
    const response = await callAPI('/api/responses', {
      method: 'POST',
      body: {
        sessionId: session.sessionId,
        responses: session.responses
      }
    });
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.inserted).toBe(session.responses.length);
    
    // Verify data actually saved to database
    const savedResponses = await db
      .select()
      .from(userResponses)
      .where(eq(userResponses.sessionId, session.sessionId));
    
    expect(savedResponses).toHaveLength(session.responses.length);
    expect(savedResponses[0]).toMatchObject({
      sessionId: session.sessionId,
      chosenOption: session.responses[0].chosenOption,
      reasoning: session.responses[0].reasoning,
      perceivedDifficulty: session.responses[0].perceivedDifficulty
    });
  });

  test('CRITICAL: values generation finds saved responses', async () => {
    // This would have caught the query that returned 0 responses
    
    const session = createTestSession();
    testSessionIds.push(session.sessionId);
    
    // Insert responses directly to database
    await insertTestResponses(session.sessionId, session.responses);
    
    // Call values generation API
    const response = await callAPI('/api/generate-values', {
      method: 'POST',
      body: { sessionId: session.sessionId }
    });
    
    expect(response.status).toBe(200);
    expect(response.data.valuesMarkdown).toBeTruthy();
    expect(response.data.motifAnalysis).toBeTruthy();
    
    // Should contain actual analysis, not errors
    expect(response.data.valuesMarkdown).toContain('My Values');
    expect(response.data.valuesMarkdown).toContain('Based on my responses');
    expect(Object.keys(response.data.motifAnalysis).length).toBeGreaterThan(0);
  });

  test('CRITICAL: motif data exists and is accessible', async () => {
    // This would have caught broken seed script paths
    
    const motifData = await db.select().from(motifs).limit(5);
    
    expect(motifData.length).toBeGreaterThan(0);
    
    // Should have real motif data from CSV
    motifData.forEach((motif: any) => {
      expect(motif.motifId).toBeTruthy();
      expect(motif.name).toBeTruthy();
      expect(motif.description).toBeTruthy();
      expect(motif.behavioralIndicators).toBeTruthy();
      expect(motif.logicalPatterns).toBeTruthy();
    });
    
    // Should contain expected motifs from our test data
    const motifIds = motifData.map((m: any) => m.motifId);
    expect(motifIds).toContain('UTIL_CALC');
    expect(motifIds).toContain('DEONT_ABSOLUTE');
  });

  test('CRITICAL: framework data exists with computational signatures', async () => {
    // This would have caught missing framework metadata
    
    const frameworkData = await db.select().from(frameworks).limit(5);
    
    expect(frameworkData.length).toBeGreaterThan(0);
    
    frameworkData.forEach((framework: any) => {
      expect(framework.frameworkId).toBeTruthy();
      expect(framework.name).toBeTruthy();
      expect(framework.tradition).toBeTruthy();
      expect(framework.keyPrinciple).toBeTruthy();
      expect(framework.computationalSignature).toBeTruthy();
    });
    
    // Should contain expected frameworks
    const frameworkIds = frameworkData.map((f: any) => f.frameworkId);
    expect(frameworkIds).toContain('UTIL_ACT');
    expect(frameworkIds).toContain('DEONT_KANT');
  });

  test('motif extraction logic works correctly', () => {
    // This tests the core logic that maps choices to motifs
    
    const mockResponses = [
      {
        chosenOption: 'a',
        choiceAMotif: 'UTIL_CALC',
        choiceBMotif: 'DEONT_ABSOLUTE',
        choiceCMotif: 'CARE_PARTICULAR',
        choiceDMotif: 'VIRT_CHARACTER'
      },
      {
        chosenOption: 'c',
        choiceAMotif: 'UTIL_CALC',
        choiceBMotif: 'DEONT_ABSOLUTE', 
        choiceCMotif: 'CARE_PARTICULAR',
        choiceDMotif: 'VIRT_CHARACTER'
      },
      {
        chosenOption: 'a',
        choiceAMotif: 'UTIL_CALC',
        choiceBMotif: 'DEONT_ABSOLUTE',
        choiceCMotif: 'CARE_PARTICULAR', 
        choiceDMotif: 'VIRT_CHARACTER'
      }
    ];

    const motifCounts: Record<string, number> = {};
    
    for (const response of mockResponses) {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'a': chosenMotif = response.choiceAMotif || ''; break;
        case 'b': chosenMotif = response.choiceBMotif || ''; break;
        case 'c': chosenMotif = response.choiceCMotif || ''; break;
        case 'd': chosenMotif = response.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
      }
    }

    expect(motifCounts).toEqual({
      'UTIL_CALC': 2,      // Chosen in responses 0 and 2
      'CARE_PARTICULAR': 1  // Chosen in response 1
    });
  });

  test('dilemmas have valid motif mappings', async () => {
    // This would catch broken choice-to-motif relationships
    
    const dilemmaData = await db.select().from(dilemmas).limit(3);
    
    expect(dilemmaData.length).toBeGreaterThan(0);
    
    for (const dilemma of dilemmaData) {
      expect(dilemma.dilemmaId).toBeTruthy();
      expect(dilemma.title).toBeTruthy();
      expect(dilemma.scenario).toBeTruthy();
      
      // Each choice should have a motif
      expect(dilemma.choiceA).toBeTruthy();
      expect(dilemma.choiceAMotif).toBeTruthy();
      expect(dilemma.choiceB).toBeTruthy();
      expect(dilemma.choiceBMotif).toBeTruthy();
      expect(dilemma.choiceC).toBeTruthy();
      expect(dilemma.choiceCMotif).toBeTruthy();
      expect(dilemma.choiceD).toBeTruthy();
      expect(dilemma.choiceDMotif).toBeTruthy();
      
      // Motifs should exist in motifs table
      const motifIds = [
        dilemma.choiceAMotif,
        dilemma.choiceBMotif,
        dilemma.choiceCMotif,
        dilemma.choiceDMotif
      ].filter(Boolean) as string[];
      
      const existingMotifs = await db
        .select({ motifId: motifs.motifId })
        .from(motifs)
        .where(inArray(motifs.motifId, motifIds));
        
      expect(existingMotifs.length).toBe(motifIds.length);
    }
  });

  test('complete data pipeline: responses → database → motif lookup → values generation', async () => {
    // This tests the entire pipeline end-to-end
    
    const session = createTestSession();
    testSessionIds.push(session.sessionId);
    
    // Step 1: Insert responses to database
    await insertTestResponses(session.sessionId, session.responses);
    
    // Step 2: Query responses with dilemma join (like API does)
    const responses = await db
      .select({
        dilemmaId: userResponses.dilemmaId,
        chosenOption: userResponses.chosenOption,
        reasoning: userResponses.reasoning,
        perceivedDifficulty: userResponses.perceivedDifficulty,
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
        title: dilemmas.title,
        domain: dilemmas.domain,
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, session.sessionId));

    expect(responses.length).toBeGreaterThan(0);

    // Step 3: Extract motifs (like API does)
    const motifCounts: Record<string, number> = {};
    for (const response of responses) {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'a': chosenMotif = response.choiceAMotif || ''; break;
        case 'b': chosenMotif = response.choiceBMotif || ''; break;
        case 'c': chosenMotif = response.choiceCMotif || ''; break;
        case 'd': chosenMotif = response.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
      }
    }

    expect(Object.keys(motifCounts).length).toBeGreaterThan(0);

    // Step 4: Get motif details (like API does)
    const topMotifs = Object.keys(motifCounts);
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(inArray(motifs.motifId, topMotifs));

    expect(motifDetails.length).toBeGreaterThan(0);
    
    // Should have rich metadata
    motifDetails.forEach(motif => {
      expect(motif.name).toBeTruthy();
      expect(motif.description).toBeTruthy();
      expect(motif.behavioralIndicators).toBeTruthy();
      expect(motif.logicalPatterns).toBeTruthy();
    });
  });

  test('handles invalid session gracefully', async () => {
    // Test error handling for non-existent sessions
    
    const response = await callAPI('/api/generate-values', {
      method: 'POST',
      body: { sessionId: 'non-existent-session-id' }
    });
    
    expect(response.status).toBe(404);
    expect(response.data.error).toContain('No responses found');
  });

  test('handles malformed request data gracefully', async () => {
    // Test error handling for invalid requests
    
    const response = await callAPI('/api/responses', {
      method: 'POST',
      body: {
        sessionId: '',
        responses: []
      }
    });
    
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('Invalid request body');
  });

  test('handles empty responses array gracefully', async () => {
    const response = await callAPI('/api/responses', {
      method: 'POST',
      body: {
        sessionId: 'empty-test-session',
        responses: []
      }
    });
    
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('Invalid request body');
  });

});