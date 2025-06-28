import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testResults: any[] = [];
    const origin = request.nextUrl.origin;

    // Test 1: Get random dilemmas
    try {
      const randomResponse = await fetch(`${origin}/api/dilemmas/random`);
      const randomData = await randomResponse.json();
      
      testResults.push({
        test: 'random_dilemmas',
        status: randomResponse.ok ? 'pass' : 'fail',
        details: `Got ${randomData.dilemmas?.length || 0} dilemmas`,
        data: randomData.dilemmas?.slice(0, 3) // First 3 for testing
      });

      if (randomResponse.ok && randomData.dilemmas?.length > 0) {
        // Test 2: Get specific dilemma by UUID
        const firstDilemma = randomData.dilemmas[0];
        const specificResponse = await fetch(`${origin}/api/dilemmas/${firstDilemma.dilemmaId}`);
        const specificData = await specificResponse.json();
        
        testResults.push({
          test: 'specific_dilemma',
          status: specificResponse.ok ? 'pass' : 'fail',
          details: `Retrieved dilemma ${firstDilemma.dilemmaId}`,
          data: {
            requested: firstDilemma.dilemmaId,
            received: specificData.dilemmas?.[0]?.dilemmaId
          }
        });

        // Test 3: Simulate complete user flow
        const sessionId = `test_${Date.now()}`;
        const testResponses = randomData.dilemmas.slice(0, 3).map((dilemma: any, index: number) => ({
          dilemmaId: dilemma.dilemmaId,
          chosenOption: ['a', 'b', 'c'][index],
          reasoning: `Test reasoning ${index + 1}`,
          responseTime: 1000 + (index * 500),
          perceivedDifficulty: 3 + index
        }));

        // Submit responses
        const responsesResponse = await fetch(`${origin}/api/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            responses: testResponses
          })
        });

        testResults.push({
          test: 'submit_responses',
          status: responsesResponse.ok ? 'pass' : 'fail',
          details: `Submitted ${testResponses.length} responses for session ${sessionId}`,
          data: { sessionId, responseCount: testResponses.length }
        });

        // Test 4: Generate values
        if (responsesResponse.ok) {
          const valuesResponse = await fetch(`${origin}/api/generate-values`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });

          const valuesData = valuesResponse.ok ? await valuesResponse.json() : null;
          
          testResults.push({
            test: 'generate_values',
            status: valuesResponse.ok ? 'pass' : 'fail',
            details: valuesResponse.ok ? 'Values.md generated successfully' : `Failed: ${valuesResponse.status}`,
            data: valuesData ? {
              hasMarkdown: !!valuesData.valuesMarkdown,
              motifCount: Object.keys(valuesData.motifAnalysis || {}).length,
              frameworkCount: valuesData.frameworkAlignment?.length || 0
            } : null
          });
        }
      }
    } catch (error) {
      testResults.push({
        test: 'dilemma_flow_error',
        status: 'fail',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
    }

    const passedTests = testResults.filter(t => t.status === 'pass').length;
    const totalTests = testResults.length;

    return NextResponse.json({
      success: passedTests === totalTests,
      summary: `${passedTests}/${totalTests} tests passed`,
      results: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dilemma flow test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}