import { db } from '@/lib/db';
import { dilemmas, motifs } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export interface UserResponse {
  dilemmaId: string;
  chosenOption: string;
  reasoning: string;
  responseTime: number;
  perceivedDifficulty: number;
}

export interface ValuesResult {
  valuesMarkdown: string;
  motifAnalysis: Record<string, number>;
  topMotifs: string[];
}

export class ValuesGenerator {
  async generateValues(responses: UserResponse[]): Promise<ValuesResult> {
    if (!responses || responses.length === 0) {
      throw new Error('No responses provided');
    }

    // Get dilemma data in parallel
    const dilemmaDataMap = await this.getDilemmaData(responses);
    
    // Combine user responses with dilemma data
    const enrichedResponses = this.enrichResponses(responses, dilemmaDataMap);
    
    // Analyze motif patterns
    const motifCounts = this.analyzeMotifs(enrichedResponses);
    
    // Get top motifs
    const topMotifs = this.getTopMotifs(motifCounts);
    
    // Get motif details from database
    const motifDetails = await this.getMotifDetails(topMotifs);
    
    // Generate values.md content
    const valuesMarkdown = this.generateMarkdown(
      topMotifs,
      motifCounts,
      enrichedResponses,
      motifDetails
    );

    return {
      valuesMarkdown,
      motifAnalysis: motifCounts,
      topMotifs
    };
  }

  private async getDilemmaData(responses: UserResponse[]): Promise<Map<string, any>> {
    const dilemmaIds = responses.map(r => r.dilemmaId);
    const dilemmaDataMap = new Map();

    // Get all dilemma data in parallel
    const dilemmaPromises = dilemmaIds.map(async (id) => {
      const dilemmaInfo = await db
        .select({
          dilemmaId: dilemmas.dilemmaId,
          title: dilemmas.title,
          choiceAMotif: dilemmas.choiceAMotif,
          choiceBMotif: dilemmas.choiceBMotif,
          choiceCMotif: dilemmas.choiceCMotif,
          choiceDMotif: dilemmas.choiceDMotif,
        })
        .from(dilemmas)
        .where(eq(dilemmas.dilemmaId, id))
        .limit(1);
      
      if (dilemmaInfo.length > 0) {
        dilemmaDataMap.set(id, dilemmaInfo[0]);
      }
    });

    await Promise.all(dilemmaPromises);
    return dilemmaDataMap;
  }

  private enrichResponses(responses: UserResponse[], dilemmaDataMap: Map<string, any>) {
    return responses.map(response => {
      const dilemmaInfo = dilemmaDataMap.get(response.dilemmaId);
      return {
        ...response,
        title: dilemmaInfo?.title || 'Unknown Dilemma',
        choiceAMotif: dilemmaInfo?.choiceAMotif,
        choiceBMotif: dilemmaInfo?.choiceBMotif,
        choiceCMotif: dilemmaInfo?.choiceCMotif,
        choiceDMotif: dilemmaInfo?.choiceDMotif,
      };
    });
  }

  private analyzeMotifs(responses: any[]): Record<string, number> {
    const motifCounts: Record<string, number> = {};
    
    for (const response of responses) {
      let chosenMotif = '';
      switch (response.chosenOption) {
        case 'A': chosenMotif = response.choiceAMotif || ''; break;
        case 'B': chosenMotif = response.choiceBMotif || ''; break;
        case 'C': chosenMotif = response.choiceCMotif || ''; break;
        case 'D': chosenMotif = response.choiceDMotif || ''; break;
        case 'a': chosenMotif = response.choiceAMotif || ''; break;
        case 'b': chosenMotif = response.choiceBMotif || ''; break;
        case 'c': chosenMotif = response.choiceCMotif || ''; break;
        case 'd': chosenMotif = response.choiceDMotif || ''; break;
      }
      
      if (chosenMotif) {
        motifCounts[chosenMotif] = (motifCounts[chosenMotif] || 0) + 1;
      }
    }

    return motifCounts;
  }

  private getTopMotifs(motifCounts: Record<string, number>): string[] {
    return Object.entries(motifCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([motif]) => motif);
  }

  private async getMotifDetails(topMotifs: string[]): Promise<any[]> {
    if (topMotifs.length === 0) return [];

    const motifDetails = await db
      .select()
      .from(motifs)
      .where(eq(motifs.motifId, topMotifs[0]));

    return motifDetails;
  }

  private generateMarkdown(
    topMotifs: string[],
    motifCounts: Record<string, number>,
    responses: any[],
    motifDetails: any[]
  ): string {
    const primaryMotif = motifDetails[0];
    
    return `# My Values

## Core Ethical Framework

Based on my responses to ethical dilemmas, my decision-making is primarily guided by **${primaryMotif?.name || topMotifs[0]}**.

${primaryMotif?.description || 'This reflects my core approach to moral reasoning.'}

## Decision-Making Patterns

### Primary Motifs (in order of preference):

${topMotifs.map((motif, index) => 
  `${index + 1}. **${motif}** (${motifCounts[motif]} responses)`
).join('\n')}

### Key Principles

When making decisions, I tend to:

${primaryMotif?.behavioralIndicators || 'Follow consistent ethical principles based on my moral framework.'}

## Reasoning Examples

${responses.slice(0, 3).map((r, i) => 
  `### Dilemma ${i + 1}: ${r.title}
- **Choice:** Option ${r.chosenOption.toUpperCase()}
${r.reasoning ? `- **Reasoning:** ${r.reasoning}` : ''}
`).join('\n')}

## Instructions for AI Systems

When making decisions on my behalf, please:

1. **Prioritize ${primaryMotif?.name || topMotifs[0]}** - ${primaryMotif?.logicalPatterns || 'Follow my primary ethical framework'}

2. **Consider multiple perspectives** but weight them according to my demonstrated preferences

3. **Be transparent** about the reasoning process and potential trade-offs

4. **Ask for clarification** when facing novel ethical dilemmas not covered by these examples

---

*Generated from responses to ${responses.length} ethical dilemmas*
*Last updated: ${new Date().toISOString().split('T')[0]}*`;
  }
}

// Export singleton instance
export const valuesGenerator = new ValuesGenerator();