// Experiment framework for comparing values.md template efficacy
// A/B testing infrastructure for template evaluation

import { TemplateBlueprint, TemplateData, generateValuesByTemplate } from './values-templates';

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  templates: string[]; // template IDs to compare
  sampleSize: number;
  durationDays: number;
  evaluationMetrics: EvaluationMetric[];
}

export interface EvaluationMetric {
  id: string;
  name: string;
  description: string;
  type: 'quantitative' | 'qualitative' | 'behavioral';
  measurementMethod: string;
  targetValue?: number;
  higherIsBetter: boolean;
}

export interface ExperimentResult {
  experimentId: string;
  templateId: string;
  sessionId: string;
  timestamp: Date;
  metrics: Record<string, number | string>;
  feedbackScore?: number;
  notes?: string;
}

export interface TemplateEfficacyReport {
  templateId: string;
  templateName: string;
  sampleSize: number;
  metrics: {
    [metricId: string]: {
      value: number;
      confidence: number;
      comparison: 'better' | 'worse' | 'neutral';
    };
  };
  qualitativeInsights: string[];
  recommendations: string[];
}

// Core evaluation metrics for values.md template efficacy
export const evaluationMetrics: EvaluationMetric[] = [
  // Quantitative Metrics
  {
    id: 'clarity_score',
    name: 'Clarity Score',
    description: 'How clearly the values.md communicates ethical principles (1-10)',
    type: 'quantitative',
    measurementMethod: 'User rating + LLM evaluation',
    targetValue: 8.5,
    higherIsBetter: true
  },
  {
    id: 'actionability_score',
    name: 'Actionability Score', 
    description: 'How well the values.md translates to actionable AI instructions (1-10)',
    type: 'quantitative',
    measurementMethod: 'AI system performance + user rating',
    targetValue: 8.0,
    higherIsBetter: true
  },
  {
    id: 'completeness_score',
    name: 'Completeness Score',
    description: 'How comprehensively the template captures ethical nuance (1-10)',
    type: 'quantitative', 
    measurementMethod: 'Coverage analysis + expert review',
    targetValue: 7.5,
    higherIsBetter: true
  },
  {
    id: 'consistency_score',
    name: 'Consistency Score',
    description: 'Internal logical consistency of ethical profile (1-10)',
    type: 'quantitative',
    measurementMethod: 'Logical consistency analysis + contradiction detection',
    targetValue: 9.0,
    higherIsBetter: true
  },
  {
    id: 'readability_score',
    name: 'Readability Score',
    description: 'Ease of reading and understanding (Flesch-Kincaid grade level)',
    type: 'quantitative',
    measurementMethod: 'Automated readability analysis',
    targetValue: 12.0, // College reading level
    higherIsBetter: false // Lower grade level is better
  },
  {
    id: 'length_score',
    name: 'Length Efficiency',
    description: 'Information density vs document length ratio',
    type: 'quantitative',
    measurementMethod: 'Information content / character count',
    higherIsBetter: true
  },

  // Behavioral Metrics
  {
    id: 'ai_alignment_accuracy',
    name: 'AI Alignment Accuracy',
    description: 'How well AI systems follow the values.md in test scenarios (%)',
    type: 'behavioral',
    measurementMethod: 'AI decision matching vs human decisions',
    targetValue: 85.0,
    higherIsBetter: true
  },
  {
    id: 'user_satisfaction',
    name: 'User Satisfaction',
    description: 'User satisfaction with their generated values.md (1-10)',
    type: 'behavioral',
    measurementMethod: 'Post-generation survey',
    targetValue: 8.0,
    higherIsBetter: true
  },
  {
    id: 'time_to_understand',
    name: 'Time to Understanding',
    description: 'Average time for users to understand their values profile (minutes)',
    type: 'behavioral',
    measurementMethod: 'User reading time tracking',
    targetValue: 5.0,
    higherIsBetter: false
  },

  // Qualitative Metrics
  {
    id: 'narrative_coherence',
    name: 'Narrative Coherence',
    description: 'Quality of ethical story and character development',
    type: 'qualitative',
    measurementMethod: 'Expert review + user feedback',
    higherIsBetter: true
  },
  {
    id: 'personalization_depth',
    name: 'Personalization Depth',
    description: 'How well template captures individual ethical nuances',
    type: 'qualitative',
    measurementMethod: 'Personalization analysis + user validation',
    higherIsBetter: true
  },
  {
    id: 'philosophical_grounding',
    name: 'Philosophical Grounding',
    description: 'Quality of ethical framework representation',
    type: 'qualitative',
    measurementMethod: 'Philosophy expert review',
    higherIsBetter: true
  }
];

// Predefined experiment configurations
export const experimentConfigs: ExperimentConfig[] = [
  {
    id: 'comprehensive_comparison',
    name: 'Comprehensive Template Comparison',
    description: 'Compare all 5 templates across all metrics',
    templates: ['enhanced', 'narrative', 'minimalist', 'framework', 'stakeholder'],
    sampleSize: 100, // 20 per template
    durationDays: 30,
    evaluationMetrics: evaluationMetrics
  },
  {
    id: 'clarity_focus',
    name: 'Clarity-Focused Experiment',
    description: 'Compare templates optimized for clarity and readability',
    templates: ['minimalist', 'narrative', 'enhanced'],
    sampleSize: 60,
    durationDays: 14,
    evaluationMetrics: evaluationMetrics.filter(m => 
      ['clarity_score', 'readability_score', 'time_to_understand'].includes(m.id)
    )
  },
  {
    id: 'ai_alignment_focus',
    name: 'AI Alignment Optimization',
    description: 'Test which templates produce best AI alignment results',
    templates: ['enhanced', 'minimalist', 'framework'],
    sampleSize: 90,
    durationDays: 21,
    evaluationMetrics: evaluationMetrics.filter(m => 
      ['ai_alignment_accuracy', 'actionability_score', 'consistency_score'].includes(m.id)
    )
  },
  {
    id: 'user_experience_focus',
    name: 'User Experience Optimization',
    description: 'Optimize for user satisfaction and engagement',
    templates: ['narrative', 'stakeholder', 'enhanced'],
    sampleSize: 75,
    durationDays: 21,
    evaluationMetrics: evaluationMetrics.filter(m => 
      ['user_satisfaction', 'narrative_coherence', 'personalization_depth'].includes(m.id)
    )
  }
];

// Template assignment for A/B testing
export class ExperimentManager {
  private experiments: Map<string, ExperimentConfig> = new Map();
  private results: ExperimentResult[] = [];

  constructor() {
    // Initialize with predefined experiments
    experimentConfigs.forEach(config => {
      this.experiments.set(config.id, config);
    });
  }

  // Assign user to template variant
  assignTemplate(experimentId: string, sessionId: string): string {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    // Simple hash-based assignment for consistent assignment
    const hash = this.hashString(sessionId);
    const templateIndex = hash % experiment.templates.length;
    return experiment.templates[templateIndex];
  }

  // Generate values.md with assigned template
  async generateExperimentalValues(
    experimentId: string, 
    sessionId: string, 
    data: TemplateData
  ): Promise<{ templateId: string; valuesMarkdown: string }> {
    const templateId = this.assignTemplate(experimentId, sessionId);
    const valuesMarkdown = generateValuesByTemplate(templateId, data);
    
    // Log assignment for tracking
    console.log(`🧪 Experiment ${experimentId}: Session ${sessionId} assigned template ${templateId}`);
    
    return { templateId, valuesMarkdown };
  }

  // Record experiment result
  recordResult(result: ExperimentResult): void {
    this.results.push(result);
    console.log(`📊 Recorded result for experiment ${result.experimentId}, template ${result.templateId}`);
  }

  // Get results for specific experiment and template
  getResults(experimentId: string, templateId?: string): ExperimentResult[] {
    let filtered = this.results.filter(r => r.experimentId === experimentId);
    if (templateId) {
      filtered = filtered.filter(r => r.templateId === templateId);
    }
    return filtered;
  }

  // Generate efficacy report
  generateEfficacyReport(experimentId: string): TemplateEfficacyReport[] {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    const reports: TemplateEfficacyReport[] = [];

    for (const templateId of experiment.templates) {
      const templateResults = this.getResults(experimentId, templateId);
      
      const report: TemplateEfficacyReport = {
        templateId,
        templateName: this.getTemplateName(templateId),
        sampleSize: templateResults.length,
        metrics: {},
        qualitativeInsights: [],
        recommendations: []
      };

      // Calculate metric averages
      for (const metric of experiment.evaluationMetrics) {
        if (metric.type === 'quantitative' || metric.type === 'behavioral') {
          const values = templateResults
            .map(r => r.metrics[metric.id])
            .filter(v => typeof v === 'number') as number[];
          
          if (values.length > 0) {
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const confidence = 1 - (stdDev / average); // Simple confidence measure
            
            // Compare to baseline (first template) or target
            let comparison: 'better' | 'worse' | 'neutral' = 'neutral';
            if (metric.targetValue) {
              if (metric.higherIsBetter) {
                comparison = average >= metric.targetValue ? 'better' : 'worse';
              } else {
                comparison = average <= metric.targetValue ? 'better' : 'worse';
              }
            }

            report.metrics[metric.id] = { value: average, confidence, comparison };
          }
        }
      }

      // Generate insights and recommendations
      report.qualitativeInsights = this.generateInsights(templateId, templateResults);
      report.recommendations = this.generateRecommendations(templateId, report.metrics);

      reports.push(report);
    }

    return reports;
  }

  // Utility methods
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getTemplateName(templateId: string): string {
    const names: Record<string, string> = {
      'enhanced': 'Enhanced Statistical',
      'narrative': 'Narrative Weaving',
      'minimalist': 'Minimalist Directive',
      'framework': 'Framework-Centric',
      'stakeholder': 'Stakeholder-Focused'
    };
    return names[templateId] || templateId;
  }

  private generateInsights(templateId: string, results: ExperimentResult[]): string[] {
    // Simple insight generation based on template characteristics
    const insights: string[] = [];
    
    if (results.length > 10) {
      insights.push(`Template shows ${results.length} responses with consistent user engagement`);
    }
    
    // Add template-specific insights
    switch (templateId) {
      case 'narrative':
        insights.push('Narrative approach resonates with users seeking personal ethical stories');
        break;
      case 'minimalist':
        insights.push('Minimalist format appeals to users preferring concise, actionable guidance');
        break;
      case 'framework':
        insights.push('Framework-centric approach attracts philosophically-minded users');
        break;
      case 'stakeholder':
        insights.push('Stakeholder focus appeals to relationally-oriented decision makers');
        break;
    }

    return insights;
  }

  private generateRecommendations(templateId: string, metrics: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    // Generate recommendations based on metric performance
    Object.entries(metrics).forEach(([metricId, data]) => {
      if (data.comparison === 'worse') {
        switch (metricId) {
          case 'clarity_score':
            recommendations.push('Improve clarity through simpler language and better structure');
            break;
          case 'actionability_score':
            recommendations.push('Add more specific AI instructions and decision frameworks');
            break;
          case 'readability_score':
            recommendations.push('Simplify vocabulary and sentence structure');
            break;
          case 'ai_alignment_accuracy':
            recommendations.push('Refine AI instruction format and add more explicit guidance');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Template performing well across measured metrics');
    }

    return recommendations;
  }
}

// Export singleton instance
export const experimentManager = new ExperimentManager();