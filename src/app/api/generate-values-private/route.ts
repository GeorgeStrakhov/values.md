import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dilemmas, motifs, frameworks } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

// Generate values.md from localStorage data WITHOUT storing it in database
export async function POST(request: NextRequest) {
  try {
    const { responses } = await request.json();

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Responses array required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Generating private VALUES.md for ${responses.length} responses`);
    
    // Get dilemma metadata for motif analysis (but don't store user responses)
    const dilemmaIds = responses.map(r => r.dilemmaId);
    const dilemmaData = await db
      .select({
        dilemmaId: dilemmas.dilemmaId,
        title: dilemmas.title,
        domain: dilemmas.domain,
        difficulty: dilemmas.difficulty,
        choiceAMotif: dilemmas.choiceAMotif,
        choiceBMotif: dilemmas.choiceBMotif,
        choiceCMotif: dilemmas.choiceCMotif,
        choiceDMotif: dilemmas.choiceDMotif,
        targetMotifs: dilemmas.targetMotifs,
        stakeholders: dilemmas.stakeholders,
      })
      .from(dilemmas)
      .where(inArray(dilemmas.dilemmaId, dilemmaIds));

    // Create lookup map for dilemma data
    const dilemmaMap = new Map(dilemmaData.map(d => [d.dilemmaId, d]));

    // Enhance responses with dilemma metadata (without storing)
    const enhancedResponses = responses.map(response => {
      const dilemma = dilemmaMap.get(response.dilemmaId);
      return {
        ...response,
        title: dilemma?.title,
        domain: dilemma?.domain,
        difficulty: dilemma?.difficulty,
        choiceAMotif: dilemma?.choiceAMotif,
        choiceBMotif: dilemma?.choiceBMotif,
        choiceCMotif: dilemma?.choiceCMotif,
        choiceDMotif: dilemma?.choiceDMotif,
        targetMotifs: dilemma?.targetMotifs,
        stakeholders: dilemma?.stakeholders,
      };
    });

    // Generate statistical analysis from localStorage data
    const statisticalAnalysis = generateRealStatistics(enhancedResponses);
    
    // Analyze motif patterns from responses
    const motifCounts: Record<string, number> = {};
    const responsePatterns: Array<{
      dilemmaTitle: string;
      chosenOption: string;
      chosenMotif: string;
      reasoning?: string;
      difficulty: number;
    }> = [];
    
    for (const response of enhancedResponses) {
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
          dilemmaTitle: response.title || 'Ethical Dilemma',
          chosenOption: response.chosenOption,
          chosenMotif,
          reasoning: response.reasoning || undefined,
          difficulty: response.perceivedDifficulty || 5
        });
      }
    }

    // Get top motifs with detailed information
    const topMotifs = Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([motif]) => motif);

    // Get detailed motif information from database (metadata only)
    const motifDetails = await db
      .select()
      .from(motifs)
      .where(inArray(motifs.motifId, topMotifs));

    // Map framework alignment
    const frameworkAlignment = statisticalAnalysis.frameworkAlignment;
    const primaryFramework = Object.keys(frameworkAlignment)[0];
    
    // Get framework details (metadata only)
    const frameworkDetails = primaryFramework ? await db
      .select()
      .from(frameworks)
      .where(eq(frameworks.frameworkId, primaryFramework))
      .limit(1) : [];

    // Generate enhanced values.md content
    const valuesMarkdown = generateEnhancedValuesMarkdown(
      topMotifs,
      motifCounts,
      motifDetails,
      frameworkDetails[0],
      responsePatterns,
      statisticalAnalysis
    );

    const result = { 
      valuesMarkdown,
      motifAnalysis: motifCounts,
      topMotifs,
      frameworkAlignment,
      statisticalAnalysis,
      responsePatterns: responsePatterns.slice(0, 5), // Return top 5 for display
      privacy: {
        dataStored: false,
        analysisMethod: 'client-data-only',
        timestamp: new Date().toISOString()
      }
    };

    console.log(`✅ Generated private VALUES.md without storing user data`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating private values:', error);
    return NextResponse.json(
      { error: 'Failed to generate values' },
      { status: 500 }
    );
  }
}

// Generate real statistical analysis from actual user responses
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
  
  // Calculate consistency score (same motif chosen within domains)
  let consistentDomains = 0;
  const totalDomains = Object.keys(domainMotifs).length;
  
  for (const [domain, motifs] of Object.entries(domainMotifs)) {
    const motifCounts: Record<string, number> = {};
    motifs.forEach(motif => {
      motifCounts[motif] = (motifCounts[motif] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(motifCounts));
    const consistency = maxCount / motifs.length;
    
    if (consistency >= 0.6) consistentDomains++; // 60% threshold for consistency
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
  
  // Generate real recommendations
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

function generateEnhancedValuesMarkdown(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  motifDetails: any[],
  primaryFramework: any,
  responsePatterns: any[],
  statisticalAnalysis: any
): string {
  const primaryMotif = motifDetails.find(m => m.motifId === topMotifs[0]) || motifDetails[0];
  const totalResponses = Object.values(motifCounts).reduce((sum, count) => sum + count, 0);
  
  return `# My Values

## Core Ethical Framework

Based on my responses to ${totalResponses} ethical dilemmas, my decision-making is primarily guided by **${primaryMotif?.name || 'Mixed Approaches'}**.

${primaryMotif?.description || 'My ethical reasoning draws from multiple moral frameworks, adapting to context and circumstances.'}

${primaryFramework ? `\n**Primary Framework:** ${primaryFramework.name} (${primaryFramework.tradition})\n${primaryFramework.keyPrinciple}` : ''}

## Decision-Making Patterns

### Moral Motif Distribution

${topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((motifCounts[motifId] / totalResponses) * 100);
  return `${index + 1}. **${motif?.name || motifId}** (${percentage}% - ${motifCounts[motifId]} responses)
   ${motif?.description || 'Core ethical principle in decision-making.'}`;
}).join('\n\n')}

### Consistency Metrics

- **Decision Consistency:** ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%
- **Average Difficulty Preference:** ${statisticalAnalysis.decisionPatterns.averageDifficulty.toFixed(1)}/10
- **Response Thoughtfulness:** ${Math.round(statisticalAnalysis.decisionPatterns.reasoningLength / 10)} (reasoning depth)

## Key Behavioral Indicators

When making decisions, I tend to:

${primaryMotif?.behavioralIndicators || 'Apply consistent ethical principles while adapting to specific contexts and stakeholder needs.'}

### Logical Patterns

${primaryMotif?.logicalPatterns || 'My reasoning follows structured approaches that balance competing interests and long-term consequences.'}

## Reasoning Examples

${responsePatterns.slice(0, 3).map((pattern, i) => 
  `### Example ${i + 1}: ${pattern.dilemmaTitle}
- **Choice:** ${pattern.chosenOption.toUpperCase()} (${pattern.chosenMotif})
- **Difficulty:** ${pattern.difficulty}/10
${pattern.reasoning ? `- **Reasoning:** ${pattern.reasoning}` : ''}
`).join('\n')}

## Statistical Analysis

### Framework Alignment
${Object.entries(statisticalAnalysis.frameworkAlignment)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 3)
  .map(([framework, weight]) => `- **${framework}:** ${weight}%`)
  .join('\n')}

### Cultural Context
Primary contexts: ${statisticalAnalysis.culturalContext.join(', ')}

## Instructions for AI Systems

When making decisions on my behalf, please:

1. **Prioritize ${primaryMotif?.name || topMotifs[0]}** - ${primaryMotif?.logicalPatterns || 'Follow my demonstrated ethical framework'}

2. **Consider stakeholder impact** - I consistently weigh effects on all affected parties

3. **Maintain consistency** - My decision patterns show ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency across contexts

4. **Balance competing values** when my top motifs conflict:
${topMotifs.slice(0, 3).map(motifId => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  return `   - ${motif?.name || motifId}: ${Math.round((motifCounts[motifId] / totalResponses) * 100)}% weight`;
}).join('\n')}

5. **Ask for clarification** when facing novel ethical dilemmas not covered by these ${totalResponses} examples

6. **Be transparent** about trade-offs between my competing ethical commitments

## Recommendations from Analysis

${statisticalAnalysis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

*Generated from ${totalResponses} ethical dilemma responses*
*Statistical confidence: ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%*
*Last updated: ${new Date().toISOString().split('T')[0]}*
*Framework: ${primaryFramework?.name || 'Mixed'} | Primary Motif: ${primaryMotif?.name || 'Adaptive'}*
*🔒 Privacy: Generated without storing personal data*`;
}