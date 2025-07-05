import { NextRequest, NextResponse } from 'next/server';
import { verifyFibrationConsistency } from '@/lib/fibration-checker';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Run fibration consistency check
    const consistencyResult = await verifyFibrationConsistency();
    
    const duration = Date.now() - startTime;
    
    // Determine overall status
    const allLayersConsistent = 
      consistencyResult.performance &&
      consistencyResult.tests &&
      consistencyResult.architecture &&
      consistencyResult.concepts;
    
    const status = allLayersConsistent ? 'consistent' : 'inconsistent';
    
    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      duration,
      fibrationCheck: {
        layers: {
          performance: {
            consistent: consistencyResult.performance,
            description: 'Performance data maps to executing code'
          },
          tests: {
            consistent: consistencyResult.tests,
            description: 'Test coverage maps to critical code paths'
          },
          architecture: {
            consistent: consistencyResult.architecture,
            description: 'Architectural model reflects actual code structure'
          },
          concepts: {
            consistent: consistencyResult.concepts,
            description: 'Conceptual model maps to architectural implementation'
          }
        },
        issues: consistencyResult.issues,
        fibrationProperties: {
          baseSpace: 'Executing code reality',
          fiberSpaces: [
            'Performance/Flamechart layer',
            'Test coverage layer', 
            'Architectural decomposition layer',
            'Conceptual/Project map layer'
          ],
          structureMaps: [
            'π₁: Performance → ExecutingCode',
            'π₂: Tests → ExecutingCode',
            'π₃: Architecture → ExecutingCode', 
            'π₄: Concepts → ExecutingCode'
          ],
          coherenceCondition: allLayersConsistent ? 'SATISFIED' : 'VIOLATED'
        }
      },
      categoryTheory: {
        fibrationValid: allLayersConsistent,
        layerCount: 4,
        consistencyScore: [
          consistencyResult.performance,
          consistencyResult.tests,
          consistencyResult.architecture,
          consistencyResult.concepts
        ].filter(Boolean).length / 4,
        topologicalCoherence: consistencyResult.issues.length === 0
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: String(error),
      fibrationCheck: null
    }, { status: 500 });
  }
}