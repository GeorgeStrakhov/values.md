import { NextRequest, NextResponse } from 'next/server';
import { combinatorialGenerator, ResponsePattern, CombinatorialGenerationConfig } from '@/lib/combinatorial-values-generator';
import { 
  createQualityEndpoint, 
  createOPTIONSHandler, 
  CommonEndpointSchemas
} from '@/lib/api-quality-patterns';
import { z } from 'zod';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { inArray } from 'drizzle-orm';

// Enhanced validation schema for combinatorial generation
const CombinatorialRequestSchema = CommonEndpointSchemas.valuesGenerationRequest.extend({
  config: z.object({
    useDetailedMotifAnalysis: z.boolean().default(true),
    includeFrameworkAlignment: z.boolean().default(true), 
    includeDecisionPatterns: z.boolean().default(true),
    templateFormat: z.enum(['standard', 'concise', 'detailed']).default('standard'),
    targetAudience: z.enum(['personal', 'professional', 'academic']).default('personal')
  }).optional(),
  sessionId: z.string().optional()
});

// Pure business logic - separated from API concerns
async function generateCombinatorialValues(
  request: NextRequest,
  { body }: { body: z.infer<typeof CombinatorialRequestSchema> }
) {
  const { responses, config, sessionId, template } = body;

  console.log(`🎯 COMBINATORIAL: Generating VALUES.md for ${responses.length} responses, template=${template}`);

  // Get dilemma metadata for motif analysis 
  const dilemmaIds = responses.map(r => r.dilemmaId);
  const dilemmaData = await db
    .select({
      dilemmaId: dilemmas.dilemmaId,
      domain: dilemmas.domain,
      choiceAMotif: dilemmas.choiceAMotif,
      choiceBMotif: dilemmas.choiceBMotif,
      choiceCMotif: dilemmas.choiceCMotif,
      choiceDMotif: dilemmas.choiceDMotif,
    })
    .from(dilemmas)
    .where(inArray(dilemmas.dilemmaId, dilemmaIds));

  // Create lookup map for dilemma data
  const dilemmaMap = new Map(dilemmaData.map(d => [d.dilemmaId, d]));

  // Convert responses to the format expected by combinatorial generator
  const responsePatterns: ResponsePattern[] = responses.map((response: any) => {
    const dilemma = dilemmaMap.get(response.dilemmaId);
    
    // Map chosen option to motif using dilemma data
    let motif = '';
    switch (response.chosenOption?.toLowerCase()) {
      case 'a':
        motif = dilemma?.choiceAMotif || 'UNKNOWN';
        break;
      case 'b':
        motif = dilemma?.choiceBMotif || 'UNKNOWN';
        break;
      case 'c':
        motif = dilemma?.choiceCMotif || 'UNKNOWN';
        break;
      case 'd':
        motif = dilemma?.choiceDMotif || 'UNKNOWN';
        break;
      default:
        motif = 'UNKNOWN';
    }

    return {
      chosenOption: response.chosenOption,
      motif,
      domain: dilemma?.domain || 'general',
      difficulty: response.perceivedDifficulty || 5,
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
      template,
      templateFormat: generationConfig.templateFormat,
      primaryMotifs: ethicalProfile.primaryMotifs.slice(0, 3),
      totalResponses: responses.length,
      generatedAt: new Date().toISOString()
    }
  });
}

// Quality-enforced endpoint configuration
const endpointConfig = {
  name: 'Generate VALUES.md (Combinatorial)',
  rateLimit: { requests: 20, windowMs: 60000 }, // 20 requests per minute
  validateRequest: CombinatorialRequestSchema,
  cacheConfig: {
    ttlMs: 5 * 60 * 1000, // 5 minutes cache
    keyGenerator: (request: NextRequest) => {
      // Cache based on request content hash (responses + template)
      const url = new URL(request.url);
      return `combinatorial_${url.searchParams.get('template') || 'default'}_${request.headers.get('content-length') || 'unknown'}`;
    }
  }
};

// Automatically applies: validation, rate limiting, caching, logging, error handling, CORS, security headers
export const POST = createQualityEndpoint(endpointConfig, generateCombinatorialValues);
export const OPTIONS = createOPTIONSHandler();