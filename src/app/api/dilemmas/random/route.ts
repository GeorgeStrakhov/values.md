import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas, motifs } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { getBaseUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Get a random dilemma to start with
    const randomDilemma = await db
      .select()
      .from(dilemmas)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomDilemma.length === 0) {
      // Database is empty - initialize with essential sample data
      console.log('🔄 No dilemmas found, initializing database...');
      
      try {
        // Check if motifs exist first
        const existingMotifs = await db.select().from(motifs).limit(1);
        
        if (existingMotifs.length === 0) {
          // Insert essential motifs
          await db.insert(motifs).values([
            {
              motifId: 'NUMBERS_FIRST',
              name: 'Numbers First',
              category: 'quantitative',
              subcategory: 'calculation',
              description: 'Mathematical optimization, quantified outcomes',
              lexicalIndicators: 'calculate;maximize;optimize;numbers;percentage;probability',
              behavioralIndicators: 'chooses mathematically optimal outcomes;weighs probabilities',
              logicalPatterns: 'IF total_utility(A) > total_utility(B) THEN choose(A)',
              conflictsWith: 'RULES_FIRST,PERSON_FIRST',
              synergiesWith: 'PROCESS_FIRST',
              weight: 0.9,
              culturalVariance: 'low',
              cognitiveLoad: 'high',
            },
            {
              motifId: 'PERSON_FIRST',
              name: 'Person First',
              category: 'care_ethics',
              subcategory: 'particular',
              description: 'Individual focus, contextual care, specific relationships',
              lexicalIndicators: 'this person;particular case;individual needs;context;specific situation',
              behavioralIndicators: 'focuses on individual rather than universal;contextual responses',
              logicalPatterns: 'respond_to(particular_other) IN specific_context',
              conflictsWith: 'NUMBERS_FIRST,RULES_FIRST',
              synergiesWith: 'SAFETY_FIRST',
              weight: 0.8,
              culturalVariance: 'very_high',
              cognitiveLoad: 'low',
            }
          ]);
        }

        // Insert a minimal dilemma to get started
        const [insertedDilemma] = await db.insert(dilemmas).values({
          title: 'Quick Start Dilemma',
          scenario: 'You need to make a decision that balances different considerations. This is a simple scenario to get you started with the VALUES.md platform.',
          choiceA: 'Focus on the most logical, data-driven approach',
          choiceB: 'Consider the specific people and relationships involved',
          choiceC: 'Not applicable',
          choiceD: 'Not applicable'
        }).returning();
        
        console.log('✅ Essential data initialized');
        
        // Redirect to the starter dilemma
        const baseUrl = getBaseUrl();
        return NextResponse.redirect(
          new URL(`/explore/${insertedDilemma.dilemmaId}`, baseUrl)
        );
        
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        return NextResponse.json(
          { error: 'Unable to initialize the database. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Redirect to the explore page with this dilemma's UUID
    // Use environment-aware base URL
    const baseUrl = getBaseUrl();
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
