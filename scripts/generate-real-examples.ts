#!/usr/bin/env npx tsx

import { db } from '../src/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '../src/lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';

// Generate real statistical analysis from user responses (same as API)
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
  
  // Calculate domain consistency
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
    culturalContext: ['western_liberal'],
    recommendations
  };
}

// Generate enhanced VALUES.md content (same as API)
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
*Framework: ${primaryFramework?.name || 'Mixed'} | Primary Motif: ${primaryMotif?.name || 'Adaptive'}*`;
}

// Different ethical profiles to simulate
const profiles = [
  {
    name: 'autonomy-focused',
    preferences: [
      { motif: 'AUTONOMY_RESPECT', weight: 0.5 },
      { motif: 'DEONT_ABSOLUTE', weight: 0.2 },
      { motif: 'EXPERT_DEFERENCE', weight: 0.3 }
    ],
    reasoningStyle: 'I believe individual choice and self-determination are paramount. People should be free to make their own decisions.',
    responseTimeRange: [15000, 35000],
    difficultyRange: [6, 9]
  },
  {
    name: 'utilitarian-optimizer',
    preferences: [
      { motif: 'UTIL_CALC', weight: 0.6 },
      { motif: 'HARM_MINIMIZE', weight: 0.3 },
      { motif: 'EQUAL_TREAT', weight: 0.1 }
    ],
    reasoningStyle: 'I focus on outcomes that produce the greatest good for the greatest number. Mathematical optimization guides my choices.',
    responseTimeRange: [25000, 45000],
    difficultyRange: [7, 10]
  },
  {
    name: 'community-oriented',
    preferences: [
      { motif: 'CARE_PARTICULAR', weight: 0.4 },
      { motif: 'SOCIAL_JUSTICE', weight: 0.3 },
      { motif: 'DUTY_CARE', weight: 0.3 }
    ],
    reasoningStyle: 'I prioritize relationships, community bonds, and caring for those who are vulnerable or marginalized.',
    responseTimeRange: [20000, 40000],
    difficultyRange: [5, 8]
  }
];

async function generateRealExample(profile: typeof profiles[0]) {
  console.log(`Generating real example for ${profile.name}...`);
  
  // Get all dilemmas
  const allDilemmas = await db.select().from(dilemmas).limit(12);
  
  if (allDilemmas.length === 0) {
    console.error('No dilemmas found in database');
    return;
  }
  
  const sessionId = `example-${profile.name}-${randomUUID()}`;
  const responses: any[] = [];
  
  // Generate simulated responses based on profile
  for (let i = 0; i < Math.min(12, allDilemmas.length); i++) {
    const dilemma = allDilemmas[i];
    const motifs = [
      dilemma.choiceAMotif,
      dilemma.choiceBMotif, 
      dilemma.choiceCMotif,
      dilemma.choiceDMotif
    ].filter(Boolean);
    
    // Choose option based on profile preferences
    let bestChoice = 'a';
    let bestScore = 0;
    
    ['a', 'b', 'c', 'd'].forEach((choice, idx) => {
      const motif = motifs[idx];
      if (motif) {
        const preference = profile.preferences.find(p => p.motif === motif);
        const score = preference ? preference.weight + Math.random() * 0.2 : Math.random() * 0.1;
        if (score > bestScore) {
          bestScore = score;
          bestChoice = choice;
        }
      }
    });
    
    const responseTime = Math.floor(
      Math.random() * (profile.responseTimeRange[1] - profile.responseTimeRange[0]) + 
      profile.responseTimeRange[0]
    );
    
    const difficulty = Math.floor(
      Math.random() * (profile.difficultyRange[1] - profile.difficultyRange[0]) + 
      profile.difficultyRange[0]
    );
    
    const response = {
      dilemmaId: dilemma.dilemmaId,
      chosenOption: bestChoice,
      reasoning: `${profile.reasoningStyle} In this case, I believe this approach best reflects my values.`,
      responseTime,
      perceivedDifficulty: difficulty,
      choiceAMotif: dilemma.choiceAMotif,
      choiceBMotif: dilemma.choiceBMotif,
      choiceCMotif: dilemma.choiceCMotif,
      choiceDMotif: dilemma.choiceDMotif,
      title: dilemma.title,
      domain: dilemma.domain,
      difficulty: dilemma.difficulty
    };
    
    responses.push(response);
    
    // Insert into database for realistic simulation
    await db.insert(userResponses).values({
      sessionId,
      dilemmaId: dilemma.dilemmaId,
      chosenOption: bestChoice,
      reasoning: response.reasoning,
      responseTime,
      perceivedDifficulty: difficulty
    });
  }
  
  console.log(`Generated ${responses.length} responses for ${profile.name}`);
  
  // Analyze motif patterns
  const motifCounts: Record<string, number> = {};
  const responsePatterns: Array<{
    dilemmaTitle: string;
    chosenOption: string;
    chosenMotif: string;
    reasoning?: string;
    difficulty: number;
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
        reasoning: response.reasoning,
        difficulty: response.difficulty
      });
    }
  }
  
  // Get top motifs
  const topMotifs = Object.entries(motifCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([motif]) => motif);
  
  // Get motif details
  const motifDetails = await db
    .select()
    .from(motifs)
    .where(inArray(motifs.motifId, topMotifs));
  
  // Generate statistical analysis
  const statisticalAnalysis = generateRealStatistics(responses);
  
  // Get framework details (assume first framework)
  const primaryFramework = null; // Would get from frameworks table if populated
  
  // Generate VALUES.md
  const valuesMarkdown = generateEnhancedValuesMarkdown(
    topMotifs,
    motifCounts,
    motifDetails,
    primaryFramework,
    responsePatterns,
    statisticalAnalysis
  );
  
  // Save to examples directory
  const examplePath = path.join(process.cwd(), 'examples', `${profile.name}.md`);
  await fs.writeFile(examplePath, valuesMarkdown);
  
  console.log(`✅ Generated real example: ${examplePath}`);
  
  // Clean up test data
  await db.delete(userResponses).where(eq(userResponses.sessionId, sessionId));
}

async function main() {
  console.log('🚀 Generating real VALUES.md examples from our actual system...');
  
  for (const profile of profiles) {
    await generateRealExample(profile);
  }
  
  console.log('\n✨ All real examples generated! Homepage will now show actual VALUES.md output from our system.');
  process.exit(0);
}

main().catch(console.error);