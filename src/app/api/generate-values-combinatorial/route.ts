import { NextRequest, NextResponse } from 'next/server';
import { combinatorialGenerator, ResponsePattern, CombinatorialGenerationConfig } from '@/lib/combinatorial-values-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responses, config, sessionId } = body;

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Responses array is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 COMBINATORIAL: Generating VALUES.md for ${responses.length} responses`);

    // Convert responses to the format expected by combinatorial generator
    const responsePatterns: ResponsePattern[] = responses.map((response: any) => {
      // Map chosen option to motif
      let motif = '';
      switch (response.choice?.toLowerCase()) {
        case 'a':
          motif = response.choiceAMotif || 'UNKNOWN';
          break;
        case 'b':
          motif = response.choiceBMotif || 'UNKNOWN';
          break;
        case 'c':
          motif = response.choiceCMotif || 'UNKNOWN';
          break;
        case 'd':
          motif = response.choiceDMotif || 'UNKNOWN';
          break;
        default:
          motif = 'UNKNOWN';
      }

      return {
        chosenOption: response.choice || 'unknown',
        motif,
        domain: response.domain || 'general',
        difficulty: response.difficulty || 5,
        reasoning: response.reasoning,
        responseTime: response.responseTime
      };
    });

    // Use provided config or defaults
    const generationConfig: CombinatorialGenerationConfig = {
      useDetailedMotifAnalysis: config?.useDetailedMotifAnalysis ?? true,
      includeFrameworkAlignment: config?.includeFrameworkAlignment ?? true,
      includeDecisionPatterns: config?.includeDecisionPatterns ?? true,
      templateFormat: config?.templateFormat || 'standard',
      targetAudience: config?.targetAudience || 'personal'
    };

    // Generate ethical profile through combinatorial analysis
    const ethicalProfile = combinatorialGenerator.analyzeResponses(responsePatterns);
    
    // Generate VALUES.md using deterministic rules
    const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(ethicalProfile, generationConfig);

    // Store generation metadata for research (if sessionId provided)
    if (sessionId) {
      console.log(`📊 Storing combinatorial generation metadata for session ${sessionId}`);
      // TODO: Store generation method, profile data, and template choice
    }

    return NextResponse.json({
      success: true,
      method: 'combinatorial',
      valuesMarkdown,
      metadata: {
        generationMethod: 'combinatorial',
        templateFormat: generationConfig.templateFormat,
        primaryMotifs: ethicalProfile.primaryMotifs.slice(0, 3),
        totalResponses: responses.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Combinatorial VALUES.md generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate VALUES.md using combinatorial method',
        method: 'combinatorial'
      },
      { status: 500 }
    );
  }
}