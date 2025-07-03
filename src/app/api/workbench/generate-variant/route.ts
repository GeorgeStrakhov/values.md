import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { generateValuesByTemplate } from '@/lib/values-templates';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, constructionPath } = await request.json();
    
    if (!sessionId || !constructionPath) {
      return NextResponse.json(
        { error: 'Session ID and construction path required' },
        { status: 400 }
      );
    }

    console.log(`🔨 Generating values variant: ${constructionPath} for session ${sessionId}`);

    // Get session responses with dilemma details
    const responses = await db
      .select({
        response: userResponses,
        dilemma: dilemmas
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for session' },
        { status: 404 }
      );
    }

    // Analyze motif patterns
    const motifCounts: Record<string, number> = {};
    const responsePatterns: Array<{
      dilemmaTitle: string;
      chosenOption: string;
      chosenMotif: string;
      reasoning?: string;
      difficulty: number;
      stakeholders?: string;
    }> = [];
    
    for (const { response, dilemma } of responses) {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'a': chosenMotif = dilemma.choiceAMotif || ''; break;
        case 'b': chosenMotif = dilemma.choiceBMotif || ''; break;
        case 'c': chosenMotif = dilemma.choiceCMotif || ''; break;
        case 'd': chosenMotif = dilemma.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
        responsePatterns.push({
          dilemmaTitle: dilemma.title,
          chosenOption: response.chosenOption,
          chosenMotif,
          reasoning: response.reasoning || undefined,
          difficulty: response.perceivedDifficulty || 5,
          stakeholders: dilemma.stakeholders
        });
      }
    }

    // Get top motifs
    const topMotifs = Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([motif]) => motif);

    // Get detailed motif information
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(inArray(motifs.motifId, topMotifs));

    // Calculate statistics
    const totalResponses = responses.length;
    const avgDifficulty = responses.reduce((sum, r) => sum + (r.response.perceivedDifficulty || 5), 0) / totalResponses;
    const avgResponseTime = responses.reduce((sum, r) => sum + (r.response.responseTime || 30000), 0) / totalResponses;
    const avgReasoningLength = responses.reduce((sum, r) => sum + (r.response.reasoning?.length || 0), 0) / totalResponses;
    
    // Framework alignment (simplified mapping)
    const motifToFramework: Record<string, string> = {
      'autonomy': 'deontological',
      'beneficence': 'utilitarian', 
      'care_ethics': 'care',
      'justice': 'justice',
      'virtue': 'virtue',
      'non_maleficence': 'utilitarian',
      'dignity': 'deontological',
      'fairness': 'justice'
    };
    
    const frameworkCounts: Record<string, number> = {};
    topMotifs.forEach(motif => {
      const framework = motifToFramework[motif] || 'mixed';
      frameworkCounts[framework] = (frameworkCounts[framework] || 0) + 1;
    });
    
    const totalFrameworks = Object.values(frameworkCounts).reduce((sum, count) => sum + count, 0);
    const frameworkAlignment: Record<string, number> = {};
    for (const [framework, count] of Object.entries(frameworkCounts)) {
      frameworkAlignment[framework] = Math.round((count / totalFrameworks) * 100);
    }

    // Get primary framework details
    const primaryFrameworkId = Object.entries(frameworkAlignment)[0]?.[0];
    const primaryFramework = primaryFrameworkId ? await db
      .select()
      .from(frameworks)
      .where(eq(frameworks.frameworkId, primaryFrameworkId))
      .limit(1) : [];

    // Calculate consistency score (simplified)
    const domainConsistency = calculateDomainConsistency(responses);
    
    const statisticalAnalysis = {
      decisionPatterns: {
        consistencyScore: domainConsistency,
        averageDifficulty: avgDifficulty,
        responseTime: avgResponseTime,
        reasoningLength: avgReasoningLength
      },
      frameworkAlignment,
      culturalContext: [...new Set(responses.map(r => r.dilemma.culturalContext).filter(Boolean))],
      recommendations: [
        `Primary ethical framework: ${primaryFrameworkId || 'mixed'} (${frameworkAlignment[primaryFrameworkId || 'mixed'] || 0}% of decisions)`,
        `Decision consistency: ${Math.round(domainConsistency * 100)}% across domains`,
        `Response thoughtfulness: ${Math.round(avgReasoningLength)} characters average reasoning`,
        `Preferred complexity level: ${avgDifficulty.toFixed(1)}/10 difficulty rating`
      ]
    };

    // Prepare template data
    const templateData = {
      topMotifs,
      motifCounts,
      motifDetails,
      primaryFramework: primaryFramework[0],
      responsePatterns,
      statisticalAnalysis
    };

    // Generate values.md using the specified construction path
    const valuesMarkdown = generateValuesByTemplate(constructionPath, templateData);

    console.log(`✅ Generated ${constructionPath} variant: ${valuesMarkdown.split(/\s+/).length} words`);

    return NextResponse.json({
      success: true,
      constructionPath,
      sessionId,
      valuesMarkdown,
      metadata: {
        wordCount: valuesMarkdown.split(/\s+/).length,
        topMotifs,
        primaryFramework: primaryFrameworkId,
        responseCount: totalResponses,
        avgDifficulty: Math.round(avgDifficulty * 10) / 10
      }
    });

  } catch (error) {
    console.error('Variant generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate values variant', details: String(error) },
      { status: 500 }
    );
  }
}

function calculateDomainConsistency(responses: any[]) {
  // Group responses by domain and check for motif consistency
  const domainMotifs: Record<string, string[]> = {};
  
  responses.forEach(({ response, dilemma }) => {
    const domain = dilemma.domain || 'general';
    let chosenMotif = '';
    
    switch (response.chosenOption) {
      case 'a': chosenMotif = dilemma.choiceAMotif || ''; break;
      case 'b': chosenMotif = dilemma.choiceBMotif || ''; break;
      case 'c': chosenMotif = dilemma.choiceCMotif || ''; break;
      case 'd': chosenMotif = dilemma.choiceDMotif || ''; break;
    }
    
    if (chosenMotif) {
      if (!domainMotifs[domain]) domainMotifs[domain] = [];
      domainMotifs[domain].push(chosenMotif);
    }
  });
  
  // Calculate consistency within each domain
  let totalConsistency = 0;
  let domainCount = 0;
  
  for (const [domain, motifs] of Object.entries(domainMotifs)) {
    if (motifs.length > 1) {
      const motifCounts: Record<string, number> = {};
      motifs.forEach(motif => {
        motifCounts[motif] = (motifCounts[motif] || 0) + 1;
      });
      
      const maxCount = Math.max(...Object.values(motifCounts));
      const consistency = maxCount / motifs.length;
      totalConsistency += consistency;
      domainCount++;
    }
  }
  
  return domainCount > 0 ? totalConsistency / domainCount : 0.5;
}