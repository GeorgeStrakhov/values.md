import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas, userResponses } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    status: 'pass',
    checks: {}
  };

  try {
    // 1. Database connectivity test
    console.log('🔍 Health check: Testing database connectivity...');
    try {
      const dbTest = await db.execute(sql`SELECT 1 as test`);
      results.checks.database = {
        status: 'pass',
        message: 'Database connection successful',
        details: { connected: true }
      };
    } catch (error) {
      results.checks.database = {
        status: 'fail',
        message: 'Database connection failed',
        error: String(error)
      };
      results.status = 'fail';
    }

    // 2. Dilemmas table test
    console.log('🔍 Health check: Testing dilemmas table...');
    try {
      const dilemmaCount = await db.select({ count: sql`count(*)` }).from(dilemmas);
      const count = Number(dilemmaCount[0]?.count || 0);
      
      results.checks.dilemmas = {
        status: count > 0 ? 'pass' : 'warning',
        message: `Found ${count} dilemmas`,
        details: { count }
      };
      
      if (count === 0) {
        results.status = 'warning';
      }
    } catch (error) {
      results.checks.dilemmas = {
        status: 'fail',
        message: 'Dilemmas table access failed',
        error: String(error)
      };
      results.status = 'fail';
    }

    // 3. Random dilemma API test
    console.log('🔍 Health check: Testing random dilemma API...');
    try {
      const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/dilemmas/random`, {
        method: 'GET',
        redirect: 'manual' // Don't follow redirects
      });
      
      results.checks.randomDilemmaAPI = {
        status: response.status === 302 ? 'pass' : 'fail',
        message: `API response: ${response.status}`,
        details: { 
          status: response.status,
          redirected: response.status === 302,
          location: response.headers.get('location')
        }
      };
      
      if (response.status !== 302) {
        results.status = 'fail';
      }
    } catch (error) {
      results.checks.randomDilemmaAPI = {
        status: 'fail',
        message: 'Random dilemma API failed',
        error: String(error)
      };
      results.status = 'fail';
    }

    // 4. Responses API test (critical for our bug)
    console.log('🔍 Health check: Testing responses API...');
    try {
      const testPayload = {
        sessionId: 'health-check-' + Date.now(),
        responses: [
          {
            dilemmaId: 'test-dilemma',
            chosenOption: 'a',
            reasoning: 'Test reasoning',
            responseTime: 1000,
            perceivedDifficulty: 5
          }
        ]
      };

      const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      const responseText = await response.text();
      
      results.checks.responsesAPI = {
        status: response.ok ? 'pass' : 'fail',
        message: `Responses API: ${response.status}`,
        details: { 
          status: response.status,
          response: responseText.substring(0, 200)
        }
      };
      
      if (!response.ok) {
        results.status = 'fail';
      }
    } catch (error) {
      results.checks.responsesAPI = {
        status: 'fail',
        message: 'Responses API failed',
        error: String(error)
      };
      results.status = 'fail';
    }

    // 5. User responses table test
    console.log('🔍 Health check: Testing user responses table...');
    try {
      const responseCount = await db.select({ count: sql`count(*)` }).from(userResponses);
      const count = Number(responseCount[0]?.count || 0);
      
      results.checks.userResponses = {
        status: 'pass',
        message: `Found ${count} user responses`,
        details: { count }
      };
    } catch (error) {
      results.checks.userResponses = {
        status: 'fail',
        message: 'User responses table access failed',
        error: String(error)
      };
      results.status = 'fail';
    }

    // 6. Generate values API test
    console.log('🔍 Health check: Testing generate values API...');
    try {
      // Only test if we have some responses to work with
      const responseCount = await db.select({ count: sql`count(*)` }).from(userResponses);
      const count = Number(responseCount[0]?.count || 0);
      
      if (count > 0) {
        // Get a real session ID to test with
        const latestResponse = await db
          .select({ sessionId: userResponses.sessionId })
          .from(userResponses)
          .limit(1);
        
        if (latestResponse.length > 0) {
          const testSessionId = latestResponse[0].sessionId;
          
          const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/generate-values`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: testSessionId }),
          });

          results.checks.generateValuesAPI = {
            status: response.ok ? 'pass' : 'warning',
            message: `Generate values API: ${response.status}`,
            details: { 
              status: response.status,
              testedWithSession: testSessionId
            }
          };
          
          if (!response.ok && results.status === 'pass') {
            results.status = 'warning';
          }
        } else {
          results.checks.generateValuesAPI = {
            status: 'warning',
            message: 'No session data available for testing',
            details: { reason: 'No user responses found' }
          };
        }
      } else {
        results.checks.generateValuesAPI = {
          status: 'warning',
          message: 'Cannot test - no user responses available',
          details: { reason: 'Database empty' }
        };
      }
    } catch (error) {
      results.checks.generateValuesAPI = {
        status: 'fail',
        message: 'Generate values API failed',
        error: String(error)
      };
      results.status = 'fail';
    }

    console.log('✅ Health check completed:', results.status);
    
    return NextResponse.json(results, { 
      status: results.status === 'fail' ? 500 : 200 
    });

  } catch (error) {
    console.error('💥 Health check failed:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'fail',
      error: String(error),
      checks: results.checks
    }, { status: 500 });
  }
}