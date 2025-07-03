// Multiple values.md composition blueprints for A/B testing
// Each template represents a different approach to weaving moral motifs

export interface TemplateData {
  topMotifs: string[];
  motifCounts: Record<string, number>;
  motifDetails: any[];
  primaryFramework: any;
  responsePatterns: any[];
  statisticalAnalysis: any;
}

export interface TemplateBlueprint {
  id: string;
  name: string;
  description: string;
  focusAreas: string[];
  generator: (data: TemplateData) => string;
}

// Template 1: Current Enhanced Template (Baseline)
export const enhancedTemplate: TemplateBlueprint = {
  id: 'enhanced',
  name: 'Enhanced Statistical Template',
  description: 'Current template with detailed statistics and AI instructions',
  focusAreas: ['statistics', 'ai-instructions', 'comprehensive'],
  generator: (data: TemplateData) => {
    const primaryMotif = data.motifDetails.find(m => m.motifId === data.topMotifs[0]) || data.motifDetails[0];
    const totalResponses = Object.values(data.motifCounts).reduce((sum, count) => sum + count, 0);
    
    return `# My Values

## Core Ethical Framework

Based on my responses to ${totalResponses} ethical dilemmas, my decision-making is primarily guided by **${primaryMotif?.name || 'Mixed Approaches'}**.

${primaryMotif?.description || 'My ethical reasoning draws from multiple moral frameworks, adapting to context and circumstances.'}

${data.primaryFramework ? `\n**Primary Framework:** ${data.primaryFramework.name} (${data.primaryFramework.tradition})\n${data.primaryFramework.keyPrinciple}` : ''}

## Decision-Making Patterns

### Moral Motif Distribution

${data.topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((data.motifCounts[motifId] / totalResponses) * 100);
  return `${index + 1}. **${motif?.name || motifId}** (${percentage}% - ${data.motifCounts[motifId]} responses)
   ${motif?.description || 'Core ethical principle in decision-making.'}`;
}).join('\n\n')}

### Consistency Metrics

- **Decision Consistency:** ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%
- **Average Difficulty Preference:** ${data.statisticalAnalysis.decisionPatterns.averageDifficulty.toFixed(1)}/10
- **Response Thoughtfulness:** ${Math.round(data.statisticalAnalysis.decisionPatterns.reasoningLength / 10)} (reasoning depth)

## Key Behavioral Indicators

When making decisions, I tend to:

${primaryMotif?.behavioralIndicators || 'Apply consistent ethical principles while adapting to specific contexts and stakeholder needs.'}

### Logical Patterns

${primaryMotif?.logicalPatterns || 'My reasoning follows structured approaches that balance competing interests and long-term consequences.'}

## Reasoning Examples

${data.responsePatterns.slice(0, 3).map((pattern, i) => 
  `### Example ${i + 1}: ${pattern.dilemmaTitle}
- **Choice:** ${pattern.chosenOption.toUpperCase()} (${pattern.chosenMotif})
- **Difficulty:** ${pattern.difficulty}/10
${pattern.reasoning ? `- **Reasoning:** ${pattern.reasoning}` : ''}
`).join('\n')}

## Statistical Analysis

### Framework Alignment
${Object.entries(data.statisticalAnalysis.frameworkAlignment)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 3)
  .map(([framework, weight]) => `- **${framework}:** ${weight}%`)
  .join('\n')}

### Cultural Context
Primary contexts: ${data.statisticalAnalysis.culturalContext.join(', ')}

## Instructions for AI Systems

When making decisions on my behalf, please:

1. **Prioritize ${primaryMotif?.name || data.topMotifs[0]}** - ${primaryMotif?.logicalPatterns || 'Follow my demonstrated ethical framework'}

2. **Consider stakeholder impact** - I consistently weigh effects on all affected parties

3. **Maintain consistency** - My decision patterns show ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency across contexts

4. **Balance competing values** when my top motifs conflict:
${data.topMotifs.slice(0, 3).map(motifId => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  return `   - ${motif?.name || motifId}: ${Math.round((data.motifCounts[motifId] / totalResponses) * 100)}% weight`;
}).join('\n')}

5. **Ask for clarification** when facing novel ethical dilemmas not covered by these ${totalResponses} examples

6. **Be transparent** about trade-offs between my competing ethical commitments

## Recommendations from Analysis

${data.statisticalAnalysis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

---

*Generated from ${totalResponses} ethical dilemma responses*
*Statistical confidence: ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%*
*Last updated: ${new Date().toISOString().split('T')[0]}*
*Framework: ${data.primaryFramework?.name || 'Mixed'} | Primary Motif: ${primaryMotif?.name || 'Adaptive'}*`;
  }
};

// Template 2: Narrative-Focused Template
export const narrativeTemplate: TemplateBlueprint = {
  id: 'narrative',
  name: 'Narrative Weaving Template',
  description: 'Story-driven approach emphasizing moral journey and character development',
  focusAreas: ['storytelling', 'character-development', 'moral-journey'],
  generator: (data: TemplateData) => {
    const primaryMotif = data.motifDetails.find(m => m.motifId === data.topMotifs[0]) || data.motifDetails[0];
    const totalResponses = Object.values(data.motifCounts).reduce((sum, count) => sum + count, 0);
    
    return `# My Ethical Journey

## Who I Am

Through ${totalResponses} moral choices, I've discovered that my ethical compass points toward **${primaryMotif?.name || 'Adaptive Wisdom'}**. This isn't just a preference—it's the core of who I am when facing difficult decisions.

${primaryMotif?.description || 'I navigate ethical complexity by drawing from multiple moral traditions, adapting my approach to honor both universal principles and particular circumstances.'}

## My Moral Story

### The Pattern That Emerged

As I worked through ethical dilemmas, a clear pattern emerged. In ${Math.round((data.motifCounts[data.topMotifs[0]] / totalResponses) * 100)}% of my decisions, I found myself drawn to **${primaryMotif?.name}**. This wasn't random—it reflects something deep about my character.

When I encounter ${primaryMotif?.name?.toLowerCase()} situations, I ${primaryMotif?.behavioralIndicators || 'act with consistent ethical principles while remaining sensitive to context'}.

### The Tensions I Navigate

My ethical life isn't simple. I hold multiple values that sometimes conflict:

${data.topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((data.motifCounts[motifId] / totalResponses) * 100);
  return `**${motif?.name || motifId}** (${percentage}% of decisions): ${motif?.description || 'A core ethical principle that guides my choices.'}`;
}).join('\n\n')}

When these values conflict, I don't abandon one for another. Instead, I seek creative solutions that honor multiple commitments, even when that means accepting difficult trade-offs.

### How I Think

My ethical reasoning follows a pattern: ${primaryMotif?.logicalPatterns || 'I analyze situations systematically while remaining open to contextual factors that might change my assessment'}.

This approach has served me well, leading to ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency across different types of ethical challenges.

## Examples from My Journey

${data.responsePatterns.slice(0, 3).map((pattern, i) => 
  `### The ${pattern.dilemmaTitle} Decision

When faced with this dilemma, I chose **${pattern.chosenOption.toUpperCase()}**, guided by **${pattern.chosenMotif}**. ${pattern.reasoning ? `My reasoning: "${pattern.reasoning}"` : 'This choice reflected my commitment to contextual ethical reasoning.'}

This decision exemplifies how I apply my values in practice—not as rigid rules, but as living principles that adapt to circumstances while maintaining their essential character.`).join('\n\n')}

## Guidance for AI Partners

When you're making decisions on my behalf, please understand that my ethics aren't just rules to follow—they're part of my character. Here's how to honor that:

### Primary Guidance
**Lead with ${primaryMotif?.name}**: ${primaryMotif?.logicalPatterns || 'Apply my demonstrated ethical framework with attention to context and stakeholder impact.'}

### When Values Conflict
Remember that I hold multiple values simultaneously. When my top commitments conflict, seek solutions that honor:
${data.topMotifs.slice(0, 3).map(motifId => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  return `- **${motif?.name || motifId}** (${Math.round((data.motifCounts[motifId] / totalResponses) * 100)}% weight in my decisions)`;
}).join('\n')}

### The Art of Ethical Reasoning
Don't just calculate—deliberate. My ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency comes not from mechanical rule-following, but from thoughtful application of principles to particular situations.

When you're uncertain, ask. I'd rather engage in moral reasoning together than have you guess at my values.

---

*This ethical profile emerged from ${totalResponses} moral choices, representing ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency in my decision-making patterns.*`;
  }
};

// Template 3: Minimalist Directive Template
export const minimalistTemplate: TemplateBlueprint = {
  id: 'minimalist',
  name: 'Minimalist Directive Template',
  description: 'Concise, action-oriented template focused on clear AI instructions',
  focusAreas: ['brevity', 'clarity', 'actionability'],
  generator: (data: TemplateData) => {
    const primaryMotif = data.motifDetails.find(m => m.motifId === data.topMotifs[0]) || data.motifDetails[0];
    const totalResponses = Object.values(data.motifCounts).reduce((sum, count) => sum + count, 0);
    
    return `# My Values

## Core Principle
**${primaryMotif?.name || 'Adaptive Ethics'}** - ${primaryMotif?.description || 'Context-sensitive ethical reasoning'}

## Decision Framework
${data.topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((data.motifCounts[motifId] / totalResponses) * 100);
  return `${index + 1}. ${motif?.name || motifId} (${percentage}%)`;
}).join('\n')}

## AI Instructions

**Primary Directive**: ${primaryMotif?.logicalPatterns || 'Apply consistent ethical principles with contextual sensitivity'}

**When Values Conflict**:
${data.topMotifs.slice(0, 3).map(motifId => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  return `- ${motif?.name || motifId}: ${Math.round((data.motifCounts[motifId] / totalResponses) * 100)}% weight`;
}).join('\n')}

**Consistency Target**: ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%

**Escalation**: Ask for clarification on novel ethical dilemmas not covered in ${totalResponses} training examples.

---
*${totalResponses} decisions | ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency*`;
  }
};

// Template 4: Framework-Centric Template
export const frameworkTemplate: TemplateBlueprint = {
  id: 'framework',
  name: 'Framework-Centric Template',
  description: 'Emphasizes ethical frameworks and philosophical foundations',
  focusAreas: ['philosophy', 'frameworks', 'theoretical-grounding'],
  generator: (data: TemplateData) => {
    const primaryMotif = data.motifDetails.find(m => m.motifId === data.topMotifs[0]) || data.motifDetails[0];
    const totalResponses = Object.values(data.motifCounts).reduce((sum, count) => sum + count, 0);
    
    return `# My Ethical Framework

## Philosophical Foundation

My moral reasoning is grounded in **${data.primaryFramework?.name || 'Pluralistic Ethics'}** ${data.primaryFramework?.tradition ? `(${data.primaryFramework.tradition})` : ''}.

${data.primaryFramework?.keyPrinciple || 'I draw from multiple ethical traditions, adapting my approach based on context and circumstances.'}

### Core Methodology
${data.primaryFramework?.decisionMethod || primaryMotif?.logicalPatterns || 'I analyze ethical dilemmas through systematic reasoning while remaining sensitive to contextual factors.'}

## Framework Alignment

Based on ${totalResponses} ethical decisions, my reasoning aligns with:

${Object.entries(data.statisticalAnalysis.frameworkAlignment)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([framework, weight]) => `- **${framework}**: ${weight}%`)
  .join('\n')}

## Moral Motif Analysis

### Primary Motifs
${data.topMotifs.slice(0, 3).map((motifId, index) => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((data.motifCounts[motifId] / totalResponses) * 100);
  return `**${index + 1}. ${motif?.name || motifId}** (${percentage}%)
- *Description*: ${motif?.description || 'Core ethical principle'}
- *Behavioral Pattern*: ${motif?.behavioralIndicators || 'Consistent ethical application'}
- *Logical Structure*: ${motif?.logicalPatterns || 'Systematic reasoning approach'}`;
}).join('\n\n')}

### Motif Interactions

**Synergies**: ${data.motifDetails.find(m => m.motifId === data.topMotifs[0])?.synergiesWith || 'My primary motifs work together to create coherent ethical reasoning.'}

**Tensions**: ${data.motifDetails.find(m => m.motifId === data.topMotifs[0])?.conflictsWith || 'When conflicts arise, I seek creative solutions that honor multiple commitments.'}

## Decision-Making Metrics

- **Consistency Score**: ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}%
- **Complexity Preference**: ${data.statisticalAnalysis.decisionPatterns.averageDifficulty.toFixed(1)}/10
- **Reasoning Depth**: ${Math.round(data.statisticalAnalysis.decisionPatterns.reasoningLength)} character average

## Philosophical Recommendations

### For AI Systems
1. **Apply ${data.primaryFramework?.name || 'Pluralistic'} methodology**: ${data.primaryFramework?.decisionMethod || 'Use systematic reasoning with contextual sensitivity'}

2. **Honor motif hierarchy**: Weight decisions according to established motif distribution

3. **Maintain philosophical consistency**: ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency target across contexts

4. **Engage in meta-ethical reasoning**: When facing novel dilemmas, consider both immediate outcomes and broader ethical implications

### Cultural Considerations
${data.statisticalAnalysis.culturalContext.length > 0 ? `Primary contexts: ${data.statisticalAnalysis.culturalContext.join(', ')}` : 'Apply universal ethical principles while remaining sensitive to cultural context'}

---

*Philosophical Profile | ${totalResponses} decisions | ${data.primaryFramework?.name || 'Pluralistic'} framework | ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency*`;
  }
};

// Template 5: Stakeholder-Focused Template
export const stakeholderTemplate: TemplateBlueprint = {
  id: 'stakeholder',
  name: 'Stakeholder-Focused Template',
  description: 'Emphasizes stakeholder analysis and impact consideration',
  focusAreas: ['stakeholder-analysis', 'impact-assessment', 'relational-ethics'],
  generator: (data: TemplateData) => {
    const primaryMotif = data.motifDetails.find(m => m.motifId === data.topMotifs[0]) || data.motifDetails[0];
    const totalResponses = Object.values(data.motifCounts).reduce((sum, count) => sum + count, 0);
    
    return `# My Values: A Stakeholder-Centered Approach

## How I See Ethical Decisions

Every ethical choice affects people. My approach, rooted in **${primaryMotif?.name || 'Stakeholder-Sensitive Ethics'}**, begins with understanding who is impacted and how.

${primaryMotif?.description || 'I make decisions by carefully considering the effects on all stakeholders, seeking outcomes that honor both individual needs and broader community interests.'}

## My Stakeholder Framework

### Primary Consideration: ${primaryMotif?.name}
${primaryMotif?.behavioralIndicators || 'I prioritize understanding the specific needs and circumstances of those affected by my decisions.'}

When I apply this principle, I ${primaryMotif?.logicalPatterns || 'systematically analyze stakeholder impacts while remaining sensitive to context and relationships'}.

### Secondary Considerations
${data.topMotifs.slice(1, 3).map((motifId, index) => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  const percentage = Math.round((data.motifCounts[motifId] / totalResponses) * 100);
  return `**${motif?.name || motifId}** (${percentage}% of decisions)
I also consider ${motif?.description?.toLowerCase() || 'how this principle affects stakeholder relationships and outcomes'}.`;
}).join('\n\n')}

## Decision Examples: Stakeholder Impact Analysis

${data.responsePatterns.slice(0, 3).map((pattern, i) => 
  `### Case ${i + 1}: ${pattern.dilemmaTitle}

**Stakeholders Considered**: ${pattern.stakeholders || 'Multiple affected parties requiring balanced consideration'}

**My Choice**: Option ${pattern.chosenOption.toUpperCase()} - ${pattern.chosenMotif}

**Stakeholder Impact**: ${pattern.reasoning || 'This choice balanced competing stakeholder interests while maintaining ethical consistency.'}

**Rationale**: My decision reflected my commitment to ${pattern.chosenMotif.toLowerCase()}, ensuring that stakeholder needs were carefully weighed against broader ethical principles.`).join('\n\n')}

## Guidance for AI Decision-Making

### Stakeholder Analysis Protocol
1. **Identify all affected parties**: Consider direct and indirect stakeholders
2. **Assess impact magnitude**: Evaluate both immediate and long-term effects
3. **Apply my ethical framework**: Use **${primaryMotif?.name}** as the primary lens
4. **Balance competing interests**: Honor my ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency pattern

### When Stakeholder Interests Conflict
My approach to stakeholder conflicts reflects my value distribution:
${data.topMotifs.slice(0, 3).map(motifId => {
  const motif = data.motifDetails.find(m => m.motifId === motifId);
  return `- **${motif?.name || motifId}**: ${Math.round((data.motifCounts[motifId] / totalResponses) * 100)}% weight in resolution`;
}).join('\n')}

### Escalation Criteria
Ask for my input when:
- Stakeholder impacts are unclear or unprecedented
- My established patterns don't clearly apply
- Novel ethical dilemmas arise beyond my ${totalResponses} training examples

## Relationship-Centered Metrics

- **Stakeholder Sensitivity**: ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency in stakeholder consideration
- **Impact Thoughtfulness**: ${Math.round(data.statisticalAnalysis.decisionPatterns.reasoningLength)} character average reasoning
- **Complexity Comfort**: ${data.statisticalAnalysis.decisionPatterns.averageDifficulty.toFixed(1)}/10 preferred decision complexity

---

*Stakeholder-Centered Ethics | ${totalResponses} decisions analyzed | ${Math.round(data.statisticalAnalysis.decisionPatterns.consistencyScore * 100)}% consistency in stakeholder consideration*`;
  }
};

// Export all templates
export const valueTemplates: TemplateBlueprint[] = [
  enhancedTemplate,
  narrativeTemplate,
  minimalistTemplate,
  frameworkTemplate,
  stakeholderTemplate
];

// Convenient alias for the alignment experiments
export const templates = valueTemplates;

export function generateValuesByTemplate(templateId: string, data: TemplateData): string {
  const template = valueTemplates.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  return template.generator(data);
}

// Utility function to get template metadata
export function getTemplateMetadata() {
  return valueTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    focusAreas: t.focusAreas
  }));
}