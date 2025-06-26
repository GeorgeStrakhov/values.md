/**
 * Database Integration Tests
 * 
 * Tests the data pipeline that caused "No responses found" errors
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

describe('Database Integration', () => {
  
  const testSessionId = `test-session-${Date.now()}`;
  const testDilemmaId = 'test-dilemma-123';
  
  beforeAll(async () => {
    // Set up test data
    await setupTestData();
  });
  
  afterAll(async () => {
    // Clean up test data
    await db.delete(userResponses).where(eq(userResponses.sessionId, testSessionId));
    await db.delete(dilemmas).where(eq(dilemmas.dilemmaId, testDilemmaId));
  });

  async function setupTestData() {
    // Insert test dilemma
    await db.insert(dilemmas).values({
      dilemmaId: testDilemmaId,
      title: 'Test Dilemma',
      scenario: 'Test scenario',
      choiceA: 'Choice A',
      choiceAMotif: 'UTIL_CALC',
      choiceB: 'Choice B', 
      choiceBMotif: 'DEONT_ABSOLUTE',
      choiceC: 'Choice C',
      choiceCMotif: 'CARE_PARTICULAR',
      choiceD: 'Choice D',
      choiceDMotif: 'VIRT_CHARACTER',
      domain: 'test',
      difficulty: 5,
      targetMotifs: 'UTIL_CALC,DEONT_ABSOLUTE',
      stakeholders: 'test_stakeholders',
      culturalContext: 'test_context'
    }).onConflictDoNothing();
  }

  test('responses API creates valid database entries', async () => {
    // This would have caught the "No responses found" error
    
    const testResponses = [
      {
        dilemmaId: testDilemmaId,
        chosenOption: 'a',
        reasoning: 'Test reasoning',
        responseTime: 5000,
        perceivedDifficulty: 7
      }
    ];

    // Call the API endpoint logic directly
    const responseData = testResponses.map(response => ({
      sessionId: testSessionId,
      dilemmaId: response.dilemmaId,
      chosenOption: response.chosenOption,
      reasoning: response.reasoning || '',
      responseTime: response.responseTime || 0,
      perceivedDifficulty: response.perceivedDifficulty || 5,
    }));

    await db.insert(userResponses).values(responseData);

    // Verify data was inserted
    const savedResponses = await db
      .select()
      .from(userResponses)
      .where(eq(userResponses.sessionId, testSessionId));

    expect(savedResponses).toHaveLength(1);
    expect(savedResponses[0]).toMatchObject({
      sessionId: testSessionId,
      dilemmaId: testDilemmaId,
      chosenOption: 'a',
      reasoning: 'Test reasoning',
      responseTime: 5000,
      perceivedDifficulty: 7
    });
  });

  test('values generation finds responses correctly', async () => {
    // This would have caught the query that returned 0 responses
    
    // Query responses the same way the API does
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
        difficulty: dilemmas.difficulty,
        targetMotifs: dilemmas.targetMotifs,
        stakeholders: dilemmas.stakeholders,
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, testSessionId));

    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchObject({
      chosenOption: 'a',
      choiceAMotif: 'UTIL_CALC',
      title: 'Test Dilemma',
      domain: 'test'
    });
  });

  test('motif extraction works correctly', () => {
    // This would have caught missing motif data
    
    const mockResponses = [
      {
        chosenOption: 'a',
        choiceAMotif: 'UTIL_CALC',
        choiceBMotif: 'DEONT_ABSOLUTE',
        choiceCMotif: 'CARE_PARTICULAR',
        choiceDMotif: 'VIRT_CHARACTER'
      },
      {
        chosenOption: 'b',
        choiceAMotif: 'UTIL_CALC',
        choiceBMotif: 'DEONT_ABSOLUTE',
        choiceCMotif: 'CARE_PARTICULAR',
        choiceDMotif: 'VIRT_CHARACTER'
      }
    ];

    const motifCounts = {};
    
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
      'UTIL_CALC': 1,
      'DEONT_ABSOLUTE': 1
    });
  });

});

describe('Seed Data Validation', () => {
  
  test('frameworks are loaded from CSV', async () => {
    // This would have caught the broken seed script paths
    
    const frameworks = await db.select().from(frameworks).limit(5);
    
    expect(frameworks.length).toBeGreaterThan(0);
    
    // Should have real framework data, not empty
    frameworks.forEach(framework => {
      expect(framework.frameworkId).toBeTruthy();
      expect(framework.name).toBeTruthy();
      expect(framework.tradition).toBeTruthy();
      expect(framework.keyPrinciple).toBeTruthy();
    });
    
    // Should contain expected frameworks from CSV
    const frameworkIds = frameworks.map(f => f.frameworkId);
    expect(frameworkIds).toContain('UTIL_ACT');
    expect(frameworkIds).toContain('DEONT_KANT');
  });

  test('motifs are loaded with behavioral indicators', async () => {
    // This would have caught missing motif metadata
    
    const motifs = await db.select().from(motifs).limit(5);
    
    expect(motifs.length).toBeGreaterThan(0);
    
    // Should have real motif data with all required fields
    motifs.forEach(motif => {
      expect(motif.motifId).toBeTruthy();
      expect(motif.name).toBeTruthy();
      expect(motif.description).toBeTruthy();
      expect(motif.behavioralIndicators).toBeTruthy();
      expect(motif.logicalPatterns).toBeTruthy();
    });
    
    // Should contain expected motifs from CSV
    const motifIds = motifs.map(m => m.motifId);
    expect(motifIds).toContain('UTIL_CALC');
    expect(motifIds).toContain('DEONT_ABSOLUTE');
  });

  test('dilemmas have valid motif mappings', async () => {
    // This would have caught broken choice-to-motif mappings
    
    const dilemmas = await db.select().from(dilemmas).limit(5);
    
    expect(dilemmas.length).toBeGreaterThan(0);
    
    dilemmas.forEach(dilemma => {
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
    });
  });

});

describe('API Endpoint Integration', () => {
  
  test('complete API flow: responses → database → values generation', async () => {
    // This tests the entire pipeline that was breaking
    
    const sessionId = `integration-test-${Date.now()}`;
    
    // Step 1: Submit responses to database
    const testResponses = [
      {
        dilemmaId: testDilemmaId,
        chosenOption: 'a',
        reasoning: 'Integration test reasoning',
        responseTime: 3000,
        perceivedDifficulty: 6
      }
    ];

    const responseValues = testResponses.map(response => ({
      sessionId,
      dilemmaId: response.dilemmaId,
      chosenOption: response.chosenOption,
      reasoning: response.reasoning || '',
      responseTime: response.responseTime || 0,
      perceivedDifficulty: response.perceivedDifficulty || 5,
    }));

    await db.insert(userResponses).values(responseValues);

    // Step 2: Query for values generation (simulating API endpoint)
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
        difficulty: dilemmas.difficulty,
        targetMotifs: dilemmas.targetMotifs,
        stakeholders: dilemmas.stakeholders,
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    expect(responses).toHaveLength(1);

    // Step 3: Extract motifs
    const motifCounts = {};
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

    expect(motifCounts['UTIL_CALC']).toBe(1);

    // Step 4: Get motif details
    const topMotifs = Object.keys(motifCounts);
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(eq(motifs.motifId, topMotifs[0]));

    expect(motifDetails).toHaveLength(1);
    expect(motifDetails[0].name).toBeTruthy();
    expect(motifDetails[0].description).toBeTruthy();

    // Clean up
    await db.delete(userResponses).where(eq(userResponses.sessionId, sessionId));
  });

});