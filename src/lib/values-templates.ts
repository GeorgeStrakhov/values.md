import { Motif, Framework } from './schema';

// Alternative template schemas for A/B testing values.md generation

export interface ValuesGenerationConfig {
  templateType: 'default' | 'computational' | 'narrative' | 'minimal';
  includeStatistics: boolean;
  includeAIInstructions: boolean;
  motifDisplayMethod: 'percentage' | 'ranking' | 'strength' | 'descriptive';
  frameworkAlignment: 'primary' | 'weighted' | 'none';
}

export interface StatisticalAnalysis {
  motifFrequency: Record<string, number>;
  frameworkAlignment: Record<string, number>;
  decisionPatterns: {
    consistencyScore: number;
    averageDifficulty: number;
    responseTime: number;
    reasoningLength: number;
  };
  culturalContext: string[];
  recommendations: string[];
}

export interface ResponsePattern {
  dilemmaTitle: string;
  chosenOption: string;
  chosenMotif: string;
  reasoning?: string;
  difficulty: number;
}

/**
 * Default template - current implementation
 */
export function generateDefaultValuesTemplate(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  motifDetails: Motif[],
  primaryFramework: Framework | undefined,
  responsePatterns: ResponsePattern[],
  statisticalAnalysis: StatisticalAnalysis
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
${pattern.reasoning ? `- **Reasoning:** ${pattern.reasoning}` : ''}`
).join('\n')}

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

## Recommendations from Analysis

${statisticalAnalysis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

*Generated from ${totalResponses} ethical dilemma responses*
*Statistical confidence: ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%*
*Last updated: ${new Date().toISOString().split('T')[0]}*
*Framework: ${primaryFramework?.name || 'Mixed'} | Primary Motif: ${primaryMotif?.name || 'Adaptive'}*`;
}

/**
 * Computational template - emphasizes algorithms and formal logic
 */
export function generateComputationalValuesTemplate(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  motifDetails: Motif[],
  primaryFramework: Framework | undefined,
  responsePatterns: ResponsePattern[],
  statisticalAnalysis: StatisticalAnalysis
): string {
  const primaryMotif = motifDetails.find(m => m.motifId === topMotifs[0]) || motifDetails[0];
  const totalResponses = Object.values(motifCounts).reduce((sum, count) => sum + count, 0);
  
  return `# Computational Ethics Profile

## Core Decision Algorithm

**Primary Moral Function:** ${primaryMotif?.name || 'Adaptive_Mixed'}
**Computational Signature:** \`${primaryFramework?.computationalSignature || 'context_adaptive(moral_weights, stakeholder_impact)'}\`

### Motif Activation Weights
\`\`\`
${topMotifs.slice(0, 5).map(motifId => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  const weight = (motifCounts[motifId] / totalResponses).toFixed(3);
  return `${motifId}: ${weight} // ${motif?.name || motifId}`;
}).join('\n')}
\`\`\`

## Logical Patterns

${topMotifs.slice(0, 3).map(motifId => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  return `### ${motif?.name || motifId}
**Logic:** \`${motif?.logicalPatterns || 'context_sensitive_optimization()'}\`
**Lexical Triggers:** ${motif?.lexicalIndicators || 'context, balance, consider'}
**Conflict Resolution:** ${motif?.conflictsWith || 'standard_resolution_protocol'}`;
}).join('\n\n')}

## Framework Alignment Matrix
\`\`\`
${Object.entries(statisticalAnalysis.frameworkAlignment)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([framework, weight]) => `${framework.padEnd(20)} │ ${((weight as number) / totalResponses).toFixed(3)}`)
  .join('\n')}
\`\`\`

## Decision Function for AI Systems

\`\`\`typescript
function makeEthicalDecision(
  situation: EthicalDilemma,
  stakeholders: Stakeholder[],
  consequences: Consequence[]
): Decision {
  
  // Primary motif activation
  const primaryScore = ${primaryMotif?.logicalPatterns?.replace(/\s+/g, '_') || 'evaluate_primary_ethical_concern'}(situation);
  
  // Secondary motif weights
  ${topMotifs.slice(1, 3).map(motifId => {
    const motif = motifDetails.find(m => m.motifId === motifId);
    const weight = (motifCounts[motifId] / totalResponses).toFixed(3);
    return `const ${motifId.toLowerCase()}_score = ${motif?.logicalPatterns?.replace(/\s+/g, '_') || 'evaluate_concern'}(situation) * ${weight};`;
  }).join('\n  ')}
  
  // Consistency check
  if (Math.abs(primaryScore - historicalConsistency) > ${(1 - statisticalAnalysis.decisionPatterns.consistencyScore).toFixed(2)}) {
    requestHumanGuidance("Decision pattern inconsistency detected");
  }
  
  return weightedDecision([primaryScore${topMotifs.slice(1, 3).map(motif => `, ${motif.toLowerCase()}_score`).join('')}]);
}
\`\`\`

## Response Confidence Metrics
- **Algorithmic Consistency:** ${(statisticalAnalysis.decisionPatterns.consistencyScore * 100).toFixed(1)}%
- **Pattern Recognition Confidence:** ${Math.min(95, totalResponses * 7.5).toFixed(1)}%
- **Complexity Tolerance:** ${statisticalAnalysis.decisionPatterns.averageDifficulty.toFixed(1)}/10.0

## Implementation Notes
- Activate human oversight for novel scenarios (confidence < 70%)
- Log all decisions for pattern validation
- Update weights based on user feedback
- Maintain audit trail for ethical accountability

---
*Computational Ethics Profile v2.1*
*Training Data: ${totalResponses} ethical decisions*
*Model Confidence: ${(statisticalAnalysis.decisionPatterns.consistencyScore * 100).toFixed(1)}%*
*Last Calibration: ${new Date().toISOString()}*`;
}

/**
 * Narrative template - storytelling approach
 */
export function generateNarrativeValuesTemplate(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  motifDetails: Motif[],
  primaryFramework: Framework | undefined,
  responsePatterns: ResponsePattern[],
  statisticalAnalysis: StatisticalAnalysis
): string {
  const primaryMotif = motifDetails.find(m => m.motifId === topMotifs[0]) || motifDetails[0];
  const totalResponses = Object.values(motifCounts).reduce((sum, count) => sum + count, 0);
  
  return `# My Moral Story

## Who I Am Ethically

Through ${totalResponses} difficult choices, a pattern emerges: I am someone who ${primaryMotif?.behavioralIndicators?.toLowerCase() || 'seeks balance between competing moral demands'}. When faced with ethical dilemmas, my instinct is to ${primaryMotif?.description?.toLowerCase() || 'carefully weigh multiple perspectives'}.

My moral compass was forged through decisions like these:

${responsePatterns.slice(0, 2).map((pattern, i) => 
  `**${pattern.dilemmaTitle}:** When confronted with this dilemma, I chose option ${pattern.chosenOption.toUpperCase()} because ${pattern.reasoning || 'it aligned with my core values'}. This reflects my tendency toward ${pattern.chosenMotif}.`
).join('\n\n')}

## The Values That Guide Me

Like many people, I hold multiple moral commitments that sometimes pull me in different directions:

${topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((motifCounts[motifId] / totalResponses) * 100);
  const strength = percentage > 40 ? 'deeply' : percentage > 25 ? 'often' : 'sometimes';
  return `**${motif?.name || motifId}** (${percentage}% of my decisions): I ${strength} ${motif?.behavioralIndicators?.toLowerCase() || 'apply this principle in my reasoning'}.`;
}).join('\n\n')}

## How I Think Through Hard Choices

My decision-making follows recognizable patterns. ${primaryFramework ? `I draw heavily from ${primaryFramework.tradition}, particularly the idea that ${primaryFramework.keyPrinciple?.toLowerCase()}. ` : ''}When words like "${primaryMotif?.lexicalIndicators?.split(';').slice(0, 3).join('", "') || 'balance, consider, weigh'}" appear in my reasoning, it signals I'm engaging my core moral framework.

${primaryMotif?.conflictsWith ? `I struggle most when my ${primaryMotif.name} instincts conflict with concerns about ${primaryMotif.conflictsWith.toLowerCase()}.` : ''} ${primaryMotif?.synergiesWith ? `I feel most confident when I can align ${primaryMotif.name} with values like ${primaryMotif.synergiesWith.toLowerCase()}.` : ''}

## What This Means for AI Working With Me

If an AI system needs to make decisions on my behalf, it should know:

- **My moral voice sounds like this:** "${primaryMotif?.lexicalIndicators?.split(';').slice(0, 2).join('", "') || 'thoughtful, balanced'}"
- **I typically prioritize:** ${primaryMotif?.name || 'balanced consideration'} (${Math.round((motifCounts[topMotifs[0]] / totalResponses) * 100)}% of decisions)
- **I'm consistent about:** ${(statisticalAnalysis.decisionPatterns.consistencyScore * 100).toFixed(0)}% of the time
- **When I'm uncertain:** I prefer to ${statisticalAnalysis.decisionPatterns.averageDifficulty > 7 ? 'wrestle with complexity' : 'seek simpler approaches'}

## My Ethical Evolution

These values aren't fixed - they represent who I am based on ${totalResponses} decisions made recently. As I encounter new situations and my thinking evolves, this moral profile should evolve too. The AI systems I work with should help me stay true to these patterns while remaining open to growth and change.

${statisticalAnalysis.recommendations.length > 0 ? `

## Insights About My Moral Character

Based on my response patterns:
${statisticalAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}` : ''}

---

*This moral story was generated from my actual decisions in ethical dilemmas*
*Consistency score: ${(statisticalAnalysis.decisionPatterns.consistencyScore * 100).toFixed(0)}% | Average complexity preference: ${statisticalAnalysis.decisionPatterns.averageDifficulty.toFixed(1)}/10*
*Story last updated: ${new Date().toLocaleDateString()}*`;
}

/**
 * Minimal template - clean, actionable
 */
export function generateMinimalValuesTemplate(
  topMotifs: string[],
  motifCounts: Record<string, number>,
  motifDetails: Motif[],
  primaryFramework: Framework | undefined,
  responsePatterns: ResponsePattern[],
  statisticalAnalysis: StatisticalAnalysis
): string {
  const primaryMotif = motifDetails.find(m => m.motifId === topMotifs[0]) || motifDetails[0];
  const totalResponses = Object.values(motifCounts).reduce((sum, count) => sum + count, 0);
  
  return `# My Values

## Primary Ethical Approach
**${primaryMotif?.name || 'Balanced Decision-Making'}**

${primaryMotif?.description || 'I make decisions by carefully weighing multiple factors and considerations.'}

## Decision Priorities
${topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((motifCounts[motifId] / totalResponses) * 100);
  return `${index + 1}. ${motif?.name || motifId} (${percentage}%)`;
}).join('\n')}

## For AI Systems

When making decisions for me:

1. **Prioritize:** ${primaryMotif?.name || 'Balanced consideration'}
2. **Consider:** ${primaryMotif?.behavioralIndicators || 'Multiple perspectives and stakeholder impact'}
3. **Avoid:** ${primaryMotif?.conflictsWith || 'Hasty decisions without proper consideration'}
4. **Ask me when:** Decision patterns fall outside ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% confidence range

## Consistency
I'm consistent ${Math.round(statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% of the time across ${totalResponses} decisions.

---
*Updated: ${new Date().toLocaleDateString()}*`;
}

/**
 * Generate values.md using specified template
 */
export function generateValuesWithTemplate(
  config: ValuesGenerationConfig,
  topMotifs: string[],
  motifCounts: Record<string, number>,
  motifDetails: Motif[],
  primaryFramework: Framework | undefined,
  responsePatterns: ResponsePattern[],
  statisticalAnalysis: StatisticalAnalysis
): string {
  switch (config.templateType) {
    case 'computational':
      return generateComputationalValuesTemplate(
        topMotifs, motifCounts, motifDetails, primaryFramework, responsePatterns, statisticalAnalysis
      );
    case 'narrative':
      return generateNarrativeValuesTemplate(
        topMotifs, motifCounts, motifDetails, primaryFramework, responsePatterns, statisticalAnalysis
      );
    case 'minimal':
      return generateMinimalValuesTemplate(
        topMotifs, motifCounts, motifDetails, primaryFramework, responsePatterns, statisticalAnalysis
      );
    case 'default':
    default:
      return generateDefaultValuesTemplate(
        topMotifs, motifCounts, motifDetails, primaryFramework, responsePatterns, statisticalAnalysis
      );
  }
}