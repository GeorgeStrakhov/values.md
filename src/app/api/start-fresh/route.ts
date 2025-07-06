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
        
        // Create HTML response that clears localStorage and redirects
        const redirectUrl = `/explore/${insertedDilemma.dilemmaId}`;
        return createStartFreshResponse(redirectUrl);
        
      } catch (initError) {
        console.error('Failed to initialize database:', initError);
        return NextResponse.json(
          { error: 'Unable to initialize the database. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Create HTML response that clears localStorage and redirects
    const redirectUrl = `/explore/${randomDilemma[0].dilemmaId}`;
    return createStartFreshResponse(redirectUrl);
  } catch (error) {
    console.error('Error starting fresh session:', error);
    return NextResponse.json(
      { error: 'Failed to start fresh session' },
      { status: 500 }
    );
  }
}

function createStartFreshResponse(redirectUrl: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Starting Fresh...</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>Starting Your Values Journey...</h2>
        <p>Clearing previous responses and preparing fresh dilemmas</p>
    </div>
    
    <script>
        // Clear all values.md related localStorage data
        localStorage.removeItem('responses');
        localStorage.removeItem('demographics');
        localStorage.removeItem('session_id');
        localStorage.removeItem('dilemma_responses');
        localStorage.removeItem('user_session');
        localStorage.removeItem('dilemma-session');
        
        // Clear any other potential keys that might interfere
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('response') || key.includes('dilemma') || key.includes('values'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Redirect to the explore page after a brief delay
        setTimeout(() => {
            window.location.href = '${redirectUrl}';
        }, 1500);
    </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}