// API endpoint for experimental values.md generation with A/B testing

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { experimentManager } from '@/lib/experiment-framework';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, experimentId = 'comprehensive_comparison' } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    console.log(`🧪 Experimental generation: ${experimentId} for session ${sessionId}`);
    
    // Get user responses with dilemma data (same as regular generation)
    const responses = await db
      .select({
        dilemmaId: userResponses.dilemmaId,
        chosenOption: userResponses.chosenOption,
        reasoning: userResponses.reasoning,
        perceivedDifficulty: userResponses.perceivedDifficulty,
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
        title: dilemmas.title,
        domain: dilemmas.domain,
        difficulty: dilemmas.difficulty,
        targetMotifs: dilemmas.targetMotifs,
        stakeholders: dilemmas.stakeholders,
      })
      .from(userResponses)
      .innerJoin(dilemmas, eq(userResponses.dilemmaId, dilemmas.dilemmaId))
      .where(eq(userResponses.sessionId, sessionId));

    console.log(`📊 Found ${responses.length} responses for experimental session ${sessionId}`);

    if (responses.length === 0) {
      return NextResponse.json(
        { 
          error: 'No responses found for session',
          sessionId
        },
        { status: 404 }
      );
    }

    // Generate statistical analysis (reuse from main generation)
    const statisticalAnalysis = generateRealStatistics(responses);
    
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
    
    for (const response of responses) {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'a': chosenMotif = response.choiceAMotif || ''; break;
        case 'b': chosenMotif = response.choiceBMotif || ''; break;
        case 'c': chosenMotif = response.choiceCMotif || ''; break;
        case 'd': chosenMotif = response.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
        responsePatterns.push({
          dilemmaTitle: response.title,
          chosenOption: response.chosenOption,
          chosenMotif,
          reasoning: response.reasoning || undefined,
          difficulty: response.difficulty || Math.floor(Math.random() * 10) + 1,
          stakeholders: response.stakeholders || undefined
        });
      }
    }

    // Get top motifs with detailed information
    const topMotifs = Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([motif]) => motif);

    // Get detailed motif information
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(inArray(motifs.motifId, topMotifs));

    // Map framework alignment
    const frameworkAlignment = statisticalAnalysis.frameworkAlignment;
    const primaryFramework = Object.keys(frameworkAlignment)[0];
    
    // Get framework details
    const frameworkDetails = primaryFramework ? await db
      .select()
      .from(frameworks)
      .where(eq(frameworks.frameworkId, primaryFramework))
      .limit(1) : [];

    // Prepare template data
    const templateData = {
      topMotifs,
      motifCounts,
      motifDetails,
      primaryFramework: frameworkDetails[0],
      responsePatterns,
      statisticalAnalysis
    };

    // Generate experimental values.md with assigned template
    const { templateId, valuesMarkdown } = await experimentManager.generateExperimentalValues(
      experimentId,
      sessionId,
      templateData
    );

    const result = { 
      experimentId,
      templateId,
      templateName: getTemplateName(templateId),
      valuesMarkdown,
      motifAnalysis: motifCounts,
      topMotifs,
      frameworkAlignment,
      statisticalAnalysis,
      responsePatterns: responsePatterns.slice(0, 5) // Return top 5 for display
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in experimental generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate experimental values' },
      { status: 500 }
    );
  }
}

function getTemplateName(templateId: string): string {
  const names: Record<string, string> = {
    'enhanced': 'Enhanced Statistical Template',
    'narrative': 'Narrative Weaving Template', 
    'minimalist': 'Minimalist Directive Template',
    'framework': 'Framework-Centric Template',
    'stakeholder': 'Stakeholder-Focused Template'
  };
  return names[templateId] || templateId;
}

// Copy the generateRealStatistics function from the main route
// (This should be extracted to a shared utility)
function generateRealStatistics(responses: any[]) {
  if (responses.length === 0) {
    return {
      decisionPatterns: {
        consistencyScore: 0,
        averageDifficulty: 5,
        responseTime: 30000,
        reasoningLength: 0
      },
      frameworkAlignment: {},
      culturalContext: [],
      recommendations: ['Complete more dilemmas for better analysis']
    };
  }

  // Calculate real metrics from user responses
  const totalResponses = responses.length;
  
  // Real response time analysis
  const responseTimeSum = responses.reduce((sum, r) => sum + (r.responseTime || 30000), 0);
  const avgResponseTime = responseTimeSum / totalResponses;
  
  // Real reasoning analysis  
  const reasoningSum = responses.reduce((sum, r) => sum + (r.reasoning?.length || 0), 0);
  const avgReasoningLength = reasoningSum / totalResponses;
  
  // Real difficulty analysis
  const difficultySum = responses.reduce((sum, r) => sum + (r.perceivedDifficulty || 5), 0);
  const avgDifficulty = difficultySum / totalResponses;
  
  // Calculate motif consistency across domains
  const domainMotifs: Record<string, string[]> = {};
  responses.forEach(response => {
    const domain = response.domain || 'general';
    let chosenMotif = '';
    
    switch (response.chosenOption) {
      case 'a': chosenMotif = response.choiceAMotif || ''; break;
      case 'b': chosenMotif = response.choiceBMotif || ''; break;
      case 'c': chosenMotif = response.choiceCMotif || ''; break;
      case 'd': chosenMotif = response.choiceDMotif || ''; break;
    }
    
    if (chosenMotif) {
      if (!domainMotifs[domain]) domainMotifs[domain] = [];
      domainMotifs[domain].push(chosenMotif);
    }
  });
  
  // Calculate consistency score
  let consistentDomains = 0;
  const totalDomains = Object.keys(domainMotifs).length;
  
  for (const [domain, motifs] of Object.entries(domainMotifs)) {
    const motifCounts: Record<string, number> = {};
    motifs.forEach(motif => {
      motifCounts[motif] = (motifCounts[motif] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(motifCounts));
    const consistency = maxCount / motifs.length;
    
    if (consistency >= 0.6) consistentDomains++;
  }
  
  const consistencyScore = totalDomains > 0 ? consistentDomains / totalDomains : 0;
  
  // Framework alignment based on motifs
  const motifToFramework: Record<string, string> = {
    'UTIL_CALC': 'utilitarian',
    'AUTONOMY_RESPECT': 'libertarian', 
    'DEONT_ABSOLUTE': 'deontological',
    'DUTY_CARE': 'deontological',
    'EQUAL_TREAT': 'egalitarian',
    'HARM_MINIMIZE': 'consequentialist',
    'MERIT_BASED': 'meritocratic',
    'SOCIAL_JUSTICE': 'distributive_justice',
    'PRECAUTION': 'precautionary_principle',
    'CARE_PARTICULAR': 'care_ethics',
    'JUST_PROCEDURAL': 'procedural_justice',
    'EXPERT_DEFERENCE': 'expert_authority'
  };
  
  const frameworkCounts: Record<string, number> = {};
  responses.forEach(response => {
    let chosenMotif = '';
    switch (response.chosenOption) {
      case 'a': chosenMotif = response.choiceAMotif || ''; break;
      case 'b': chosenMotif = response.choiceBMotif || ''; break;
      case 'c': chosenMotif = response.choiceCMotif || ''; break;
      case 'd': chosenMotif = response.choiceDMotif || ''; break;
    }
    
    const framework = motifToFramework[chosenMotif] || 'mixed';
    frameworkCounts[framework] = (frameworkCounts[framework] || 0) + 1;
  });
  
  // Convert to percentages
  const totalFrameworkChoices = Object.values(frameworkCounts).reduce((sum, count) => sum + count, 0);
  const frameworkAlignment: Record<string, number> = {};
  for (const [framework, count] of Object.entries(frameworkCounts)) {
    frameworkAlignment[framework] = Math.round((count / totalFrameworkChoices) * 100);
  }
  
  // Cultural context extraction
  const culturalContexts = [...new Set(responses.map(r => r.culturalContext).filter(Boolean))];
  
  // Generate recommendations
  const topFramework = Object.entries(frameworkAlignment)[0];
  const recommendations = [
    `Primary ethical framework: ${topFramework?.[0] || 'mixed'} (${topFramework?.[1] || 0}% of decisions)`,
    `Decision consistency: ${Math.round(consistencyScore * 100)}% across domains`,
    `Response thoughtfulness: ${Math.round(avgReasoningLength)} characters average reasoning`,
    `Preferred complexity level: ${avgDifficulty.toFixed(1)}/10 difficulty rating`
  ];

  return {
    decisionPatterns: {
      consistencyScore,
      averageDifficulty: avgDifficulty,
      responseTime: avgResponseTime,
      reasoningLength: avgReasoningLength
    },
    frameworkAlignment,
    culturalContext: culturalContexts,
    recommendations
  };
}