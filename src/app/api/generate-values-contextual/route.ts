import { NextRequest, NextResponse } from 'next/server';
import { 
  contextAwareGenerator, 
  ContextualEthicalProfile,
  ContextAwareConfig,
  ResponsePattern as ContextResponsePattern
} from '@/lib/context-aware-values-generator';
import { reasoningAnalyzer } from '@/lib/reasoning-pattern-analyzer';
import { domainExtractor } from '@/lib/domain-specific-extractor';
import { 
  createQualityEndpoint, 
  createOPTIONSHandler, 
  CommonEndpointSchemas
} from '@/lib/api-quality-patterns';
import { z } from 'zod';
import { db } from '@/lib/db';
import { dilemmas } from '@/lib/schema';
import { inArray } from 'drizzle-orm';

// Enhanced validation schema for context-aware generation
const ContextualRequestSchema = CommonEndpointSchemas.valuesGenerationRequest.extend({
  config: z.object({
    useReasoningAnalysis: z.boolean().default(true),
    includeValueConflicts: z.boolean().default(true),
    generateDomainSpecific: z.boolean().default(true),
    preserveAuthenticLanguage: z.boolean().default(true),
    includeImplementationGuidance: z.boolean().default(true),
    complexityLevel: z.enum(['essential', 'nuanced', 'comprehensive']).default('nuanced')
  }).optional(),
  sessionId: z.string().optional(),
  template: z.enum(['default', 'computational', 'narrative', 'minimal']).optional()
});

// Core business logic for context-aware generation
async function generateContextualValues(
  request: NextRequest,
  { body }: { body: z.infer<typeof ContextualRequestSchema> }
) {
  const { responses, config, sessionId, template } = body;

  console.log(`🧠 CONTEXTUAL: Generating VALUES.md for ${responses.length} responses, complexity=${config?.complexityLevel || 'nuanced'}`);

  // Get dilemma metadata for enriched analysis 
  const dilemmaIds = responses.map(r => r.dilemmaId);
  const dilemmaData = await db
    .select({
      dilemmaId: dilemmas.dilemmaId,
      title: dilemmas.title,
      scenario: dilemmas.scenario,
      domain: dilemmas.domain,
      complexity: dilemmas.complexity,
      choiceAMotif: dilemmas.choiceAMotif,
      choiceBMotif: dilemmas.choiceBMotif,
      choiceCMotif: dilemmas.choiceCMotif,
      choiceDMotif: dilemmas.choiceDMotif,
      choiceA: dilemmas.choiceA,
      choiceB: dilemmas.choiceB,
      choiceC: dilemmas.choiceC,
      choiceD: dilemmas.choiceD
    })
    .from(dilemmas)
    .where(inArray(dilemmas.dilemmaId, dilemmaIds));

  // Create lookup map for dilemma data
  const dilemmaMap = new Map(dilemmaData.map(d => [d.dilemmaId, d]));

  // Convert responses to enriched format for context-aware analysis
  const contextResponsePatterns: ContextResponsePattern[] = responses.map((response: any) => {
    const dilemma = dilemmaMap.get(response.dilemmaId);
    
    // Map chosen option to motif using dilemma data
    let motif = '';
    let chosenText = '';
    
    switch (response.chosenOption?.toLowerCase()) {
      case 'a':
        motif = dilemma?.choiceAMotif || 'UNKNOWN';
        chosenText = dilemma?.choiceA || '';
        break;
      case 'b':
        motif = dilemma?.choiceBMotif || 'UNKNOWN';
        chosenText = dilemma?.choiceB || '';
        break;
      case 'c':
        motif = dilemma?.choiceCMotif || 'UNKNOWN';
        chosenText = dilemma?.choiceC || '';
        break;
      case 'd':
        motif = dilemma?.choiceDMotif || 'UNKNOWN';
        chosenText = dilemma?.choiceD || '';
        break;
      default:
        motif = 'UNKNOWN';
        chosenText = '';
    }

    return {
      chosenOption: response.chosenOption,
      motif,
      domain: dilemma?.domain || 'general',
      difficulty: response.perceivedDifficulty || 5,
      reasoning: response.reasoning || `I chose "${chosenText}" because it aligns with my values.`,
      responseTime: response.responseTime,
      // Additional context for enhanced analysis
      dilemmaTitle: dilemma?.title || '',
      dilemmaScenario: dilemma?.scenario || '',
      chosenText,
      dilemmaComplexity: dilemma?.complexity || 5
    };
  });

  // Use provided config or intelligent defaults
  const generationConfig: ContextAwareConfig = {
    useReasoningAnalysis: config?.useReasoningAnalysis ?? true,
    includeValueConflicts: config?.includeValueConflicts ?? true,
    generateDomainSpecific: config?.generateDomainSpecific ?? true,
    preserveAuthenticLanguage: config?.preserveAuthenticLanguage ?? true,
    includeImplementationGuidance: config?.includeImplementationGuidance ?? true,
    complexityLevel: config?.complexityLevel || 'nuanced'
  };

  // Perform layered context-aware analysis
  console.log('🔍 Analyzing contextual ethical profile...');
  const contextualProfile = contextAwareGenerator.analyzeContextualResponses(
    contextResponsePatterns, 
    generationConfig
  );

  // Generate sophisticated VALUES.md that preserves complexity and authenticity
  console.log('📝 Generating contextual VALUES.md...');
  const valuesMarkdown = contextAwareGenerator.generateContextualValuesMarkdown(
    contextualProfile,
    generationConfig
  );

  // Store enhanced generation metadata for research
  if (sessionId) {
    console.log(`📊 Storing contextual generation metadata for session ${sessionId}`);
    // TODO: Store reasoning patterns, domain profiles, and authentic language patterns
  }

  // Compile rich metadata for analysis and improvement
  const metadata = {
    generationMethod: 'contextual',
    complexityLevel: generationConfig.complexityLevel,
    template: template || 'default',
    analysis: {
      totalResponses: responses.length,
      reasoningPatterns: contextualProfile.reasoningPatterns.length,
      domainContexts: contextualProfile.domainContexts.length,
      valueConflicts: contextualProfile.valueConflicts.length,
      authenticPhrases: contextualProfile.authenticLanguage.coreValuePhrases.length,
      primaryMotifs: contextualProfile.primaryMotifs.slice(0, 3).map(m => ({
        name: m.name,
        percentage: m.percentage,
        domains: m.domains
      })),
      metaValues: contextualProfile.metaValues
    },
    generatedAt: new Date().toISOString(),
    processingLayers: [
      'Combinatorial Foundation',
      'Reasoning Pattern Analysis', 
      'Domain-Specific Extraction',
      'Value Conflict Resolution',
      'Authentic Language Preservation'
    ]
  };

  return NextResponse.json({
    success: true,
    method: 'contextual',
    valuesMarkdown,
    metadata
  });
}

// Quality-enforced endpoint configuration
const endpointConfig = {
  name: 'Generate VALUES.md (Contextual)',
  rateLimit: { requests: 10, windowMs: 60000 }, // Lower rate limit due to higher complexity
  validateRequest: ContextualRequestSchema,
  cacheConfig: {
    ttlMs: 10 * 60 * 1000, // 10 minutes cache for complex analysis
    keyGenerator: (request: NextRequest) => {
      // Cache based on request content and complexity level
      const url = new URL(request.url);
      return `contextual_${url.searchParams.get('complexity') || 'nuanced'}_${request.headers.get('content-length') || 'unknown'}`;
    }
  }
};

// Automatically applies: validation, rate limiting, caching, logging, error handling, CORS, security headers
export const POST = createQualityEndpoint(endpointConfig, generateContextualValues);
export const OPTIONS = createOPTIONSHandler();