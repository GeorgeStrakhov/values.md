import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
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
      return NextResponse.json(
        { error: 'No dilemmas found' },
        { status: 404 }
      );
    }

    // Create HTML response that clears localStorage and redirects
    const baseUrl = getBaseUrl();
    const redirectUrl = `/explore/${randomDilemma[0].dilemmaId}`;
    
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
  } catch (error) {
    console.error('Error starting fresh session:', error);
    return NextResponse.json(
      { error: 'Failed to start fresh session' },
      { status: 500 }
    );
  }
}