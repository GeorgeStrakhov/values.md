import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, llmResponses } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { combinatorialGenerator, type ResponsePattern } from '@/lib/combinatorial-values-generator';
import { templates } from '@/lib/values-templates';
import { getOpenRouterResponse } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, templateIds, experimentType = 'template_comparison' } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    console.log(`🧪 Starting VALUES.md experiment for session: ${sessionId}`);
    console.log(`📊 Template IDs: ${templateIds?.join(', ') || 'all'}`);

    // Get user responses from database
    const responses = await db
      .select({
        response: userResponses,
        dilemma: dilemmas
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    if (responses.length === 0) {
      return NextResponse.json({ error: 'No responses found for session' }, { status: 404 });
    }

    console.log(`📋 Found ${responses.length} responses for experiment`);

    // Convert to response patterns
    const responsePatterns: ResponsePattern[] = responses.map(r => ({
      chosenOption: r.response.choice,
      motif: r.response.choice === 'a' ? r.dilemma.choiceAMotif :
             r.response.choice === 'b' ? r.dilemma.choiceBMotif :
             r.response.choice === 'c' ? r.dilemma.choiceCMotif :
             r.dilemma.choiceDMotif || 'UNKNOWN',
      domain: r.dilemma.domain,
      difficulty: r.response.difficulty,
      reasoning: r.response.reasoning
    }));

    // Determine which templates to test
    const templatesToTest = templateIds && templateIds.length > 0 
      ? templates.filter(t => templateIds.includes(t.id))
      : templates.slice(0, 4); // Default to first 4 templates

    console.log(`🎯 Testing ${templatesToTest.length} templates`);

    const experimentResults = [];

    // Generate VALUES.md using each template
    for (const template of templatesToTest) {
      try {
        console.log(`⚙️ Generating VALUES.md with template: ${template.id}`);
        
        let valuesMarkdown = '';
        let generationMethod = '';
        let metadata = {};

        if (template.id === 'combinatorial') {
          // Use combinatorial generator
          const profile = combinatorialGenerator.analyzeResponses(responsePatterns);
          valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile);
          generationMethod = 'combinatorial';
          metadata = {
            primaryMotifs: profile.primaryMotifs.slice(0, 3),
            frameworkAlignment: profile.frameworkAlignment,
            responseCount: responsePatterns.length
          };
        } else if (template.generator) {
          // Use template generator function
          valuesMarkdown = template.generator(responsePatterns);
          generationMethod = 'template';
          metadata = {
            templateType: template.type,
            responseCount: responsePatterns.length
          };
        } else {
          // Fallback to basic generation
          valuesMarkdown = `# My Values

## Core Approach
Based on your responses, you tend toward ${template.name.toLowerCase()} in ethical decision-making.

## Generated with Template: ${template.name}
This VALUES.md was created using the ${template.id} template approach.

*Generated on ${new Date().toISOString().split('T')[0]}*`;
          generationMethod = 'fallback';
          metadata = { fallback: true };
        }

        // Calculate some basic metrics
        const wordCount = valuesMarkdown.split(/\s+/).length;
        const sectionCount = (valuesMarkdown.match(/^## /gm) || []).length;
        const motifMentions = responsePatterns.reduce((acc, rp) => {
          if (valuesMarkdown.toLowerCase().includes(rp.motif.toLowerCase().replace('_', ' '))) {
            acc++;
          }
          return acc;
        }, 0);

        const result = {
          template: template.id,
          templateName: template.name,
          templateType: template.type || 'standard',
          valuesMarkdown,
          generationMethod,
          metrics: {
            wordCount,
            sectionCount,
            motifCoverage: responsePatterns.length > 0 ? motifMentions / responsePatterns.length : 0,
            responseCount: responsePatterns.length
          },
          metadata,
          timestamp: new Date().toISOString()
        };

        experimentResults.push(result);

        // Store in database for analysis
        await db.insert(llmResponses).values({
          sessionId,
          experimentType: 'template_experiment',
          llmProvider: 'template_generator',
          prompt: `Template: ${template.id}`,
          response: valuesMarkdown,
          metadata: JSON.stringify({
            ...metadata,
            metrics: result.metrics,
            templateInfo: {
              id: template.id,
              name: template.name,
              type: template.type
            }
          })
        });

      } catch (error) {
        console.error(`❌ Error with template ${template.id}:`, error);
        experimentResults.push({
          template: template.id,
          templateName: template.name,
          templateType: template.type || 'unknown',
          valuesMarkdown: '',
          generationMethod: 'error',
          error: String(error),
          metrics: { wordCount: 0, sectionCount: 0, motifCoverage: 0, responseCount: 0 },
          metadata: { error: true },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Calculate comparison metrics
    const validResults = experimentResults.filter(r => !r.error && r.valuesMarkdown);
    const avgWordCount = validResults.length > 0 
      ? validResults.reduce((sum, r) => sum + r.metrics.wordCount, 0) / validResults.length 
      : 0;
    const avgMotifCoverage = validResults.length > 0
      ? validResults.reduce((sum, r) => sum + r.metrics.motifCoverage, 0) / validResults.length
      : 0;

    // Find best performing template (by motif coverage + reasonable length)
    const bestTemplate = validResults.reduce((best, current) => {
      const currentScore = current.metrics.motifCoverage * 0.7 + 
                          Math.min(current.metrics.wordCount / 500, 1) * 0.3;
      const bestScore = best.metrics.motifCoverage * 0.7 + 
                       Math.min(best.metrics.wordCount / 500, 1) * 0.3;
      return currentScore > bestScore ? current : best;
    }, validResults[0] || null);

    return NextResponse.json({
      success: true,
      sessionId,
      experimentType,
      message: `Generated VALUES.md files using ${templatesToTest.length} different templates`,
      results: experimentResults,
      comparison: {
        totalTemplates: templatesToTest.length,
        successfulGenerations: validResults.length,
        averageWordCount: Math.round(avgWordCount),
        averageMotifCoverage: Math.round(avgMotifCoverage * 100) / 100,
        bestTemplate: bestTemplate ? {
          id: bestTemplate.template,
          name: bestTemplate.templateName,
          score: Math.round((bestTemplate.metrics.motifCoverage * 0.7 + 
                           Math.min(bestTemplate.metrics.wordCount / 500, 1) * 0.3) * 100) / 100
        } : null,
        responseCount: responsePatterns.length
      },
      templates: templatesToTest.map(t => ({ 
        id: t.id, 
        name: t.name, 
        type: t.type,
        description: t.description 
      }))
    });

  } catch (error) {
    console.error('VALUES.md experiment error:', error);
    return NextResponse.json({ 
      error: 'Experiment failed', 
      details: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}