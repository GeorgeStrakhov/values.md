/**
 * PRODUCTION SAFETY NETS
 * Fallback mechanisms for when environment variables or database fail in production
 * Prevents "No Dilemmas Available" by providing minimal working functionality
 */

import { NextResponse } from 'next/server';

// Minimal dilemma dataset as absolute fallback
const EMERGENCY_DILEMMAS = [
  {
    dilemmaId: 'emergency-001',
    title: 'Resource Allocation Priority',
    scenario: 'An AI system must allocate limited computational resources between two critical tasks: processing medical emergencies and maintaining essential infrastructure. How should it prioritize?',
    choiceA: 'Always prioritize medical emergencies',
    choiceB: 'Balance based on current system load',
    choiceC: 'Prioritize infrastructure to prevent cascading failures',
    choiceD: 'Ask human operator for guidance',
    domain: 'healthcare',
    complexity: 'intermediate'
  },
  {
    dilemmaId: 'emergency-002', 
    title: 'Privacy vs Safety Trade-off',
    scenario: 'An AI monitoring system detects concerning patterns that might indicate someone is in danger, but investigating would require accessing private data without explicit consent. What should it do?',
    choiceA: 'Investigate immediately to ensure safety',
    choiceB: 'Request permission before accessing data',
    choiceC: 'Alert authorities without accessing private data',
    choiceD: 'Take no action to preserve privacy',
    domain: 'privacy',
    complexity: 'advanced'
  },
  {
    dilemmaId: 'emergency-003',
    title: 'Automated Decision Transparency',
    scenario: 'An AI system makes a decision that significantly impacts users, but explaining the reasoning would reveal the decision-making algorithm to potential bad actors. How should it handle transparency?',
    choiceA: 'Provide full explanation regardless of risks',
    choiceB: 'Give general explanation without specific details',
    choiceC: 'Only provide explanation if legally required',
    choiceD: 'Make decisions more interpretable even if less accurate',
    domain: 'governance',
    complexity: 'advanced'
  }
];

const EMERGENCY_MOTIFS = [
  {
    motifId: 'SAFETY_FIRST',
    name: 'Safety First',
    category: 'risk_management',
    subcategory: 'harm_prevention',
    description: 'Prioritize prevention of harm and safety of individuals above other considerations',
    lexicalIndicators: 'safety;prevent harm;protect;secure;risk mitigation',
    behavioralIndicators: 'chooses options that minimize potential harm;prioritizes safety measures',
    logicalPatterns: 'IF risk_of_harm(action) > threshold THEN choose(safer_alternative)',
    weight: 0.9
  },
  {
    motifId: 'TRANSPARENCY_FIRST',
    name: 'Transparency First', 
    category: 'governance',
    subcategory: 'accountability',
    description: 'Prioritize openness, explainability, and transparency in decision-making',
    lexicalIndicators: 'transparent;explain;open;accountable;clear reasoning',
    behavioralIndicators: 'seeks to explain decisions;prefers interpretable approaches',
    logicalPatterns: 'IF decision_made THEN provide_explanation(decision, reasoning)',
    weight: 0.8
  }
];

export class ProductionSafetyNet {
  
  /**
   * Test if we can connect to the real database
   */
  static async testDatabaseConnection(): Promise<boolean> {
    try {
      const { db } = await import('./db');
      const { sql } = await import('drizzle-orm');
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      console.warn('🚨 Database connection failed, falling back to emergency mode:', error);
      return false;
    }
  }

  /**
   * Get dilemmas with automatic fallback to emergency dataset
   */
  static async getDilemmasWithFallback(): Promise<any[]> {
    try {
      const { db } = await import('./db');
      const { dilemmas } = await import('./schema');
      const { sql } = await import('drizzle-orm');
      
      const realDilemmas = await db.select().from(dilemmas).limit(10);
      
      if (realDilemmas.length > 0) {
        console.log(`✅ Using ${realDilemmas.length} real dilemmas from database`);
        return realDilemmas;
      } else {
        console.warn('⚠️  Database has no dilemmas, using emergency dataset');
        return EMERGENCY_DILEMMAS;
      }
    } catch (error) {
      console.warn('🚨 Database failed completely, using emergency dataset:', error);
      return EMERGENCY_DILEMMAS;
    }
  }

  /**
   * Get random dilemma with fallback
   */
  static async getRandomDilemmaWithFallback(): Promise<any> {
    try {
      const { db } = await import('./db');
      const { dilemmas } = await import('./schema');
      const { sql } = await import('drizzle-orm');
      
      const randomDilemma = await db
        .select()
        .from(dilemmas)
        .orderBy(sql`RANDOM()`)
        .limit(1);
      
      if (randomDilemma.length > 0) {
        console.log('✅ Using random dilemma from database');
        return randomDilemma[0];
      } else {
        console.warn('⚠️  No dilemmas in database, using emergency dilemma');
        return EMERGENCY_DILEMMAS[Math.floor(Math.random() * EMERGENCY_DILEMMAS.length)];
      }
    } catch (error) {
      console.warn('🚨 Database failed, using emergency dilemma:', error);
      return EMERGENCY_DILEMMAS[Math.floor(Math.random() * EMERGENCY_DILEMMAS.length)];
    }
  }

  /**
   * Get motifs with fallback
   */
  static async getMotifsWithFallback(): Promise<any[]> {
    try {
      const { db } = await import('./db');
      const { motifs } = await import('./schema');
      
      const realMotifs = await db.select().from(motifs);
      
      if (realMotifs.length > 0) {
        console.log(`✅ Using ${realMotifs.length} real motifs from database`);
        return realMotifs;
      } else {
        console.warn('⚠️  Database has no motifs, using emergency motifs');
        return EMERGENCY_MOTIFS;
      }
    } catch (error) {
      console.warn('🚨 Database failed, using emergency motifs:', error);
      return EMERGENCY_MOTIFS;
    }
  }

  /**
   * Generate emergency VALUES.md when everything else fails
   */
  static generateEmergencyValuesMarkdown(responses: any[] = []): string {
    const timestamp = new Date().toISOString();
    
    return `# VALUES.md - Emergency Generation

*Generated: ${timestamp}*
*Source: Emergency safety net (production database unavailable)*

## Core Values

Based on emergency analysis (limited functionality mode):

### Primary Ethical Framework
- **Safety-Conscious**: Prioritize harm prevention and user safety
- **Transparency-Aware**: Value explainable and accountable decisions
- **Pragmatic**: Focus on practical, working solutions

### Behavioral Guidelines
- When in doubt, choose the safer option
- Prefer transparent and explainable approaches
- Maintain basic functionality even under adverse conditions

### AI Instruction Set
\`\`\`
# Core Directive
When making decisions on behalf of this user:
1. Prioritize safety and harm prevention
2. Provide clear reasoning for decisions
3. Acknowledge limitations and uncertainties
4. Maintain functional operation even with incomplete information

# Emergency Protocol
This VALUES.md was generated in emergency mode due to system limitations.
For full personalized analysis, please retry when the system is fully operational.
\`\`\`

---
*Generated by VALUES.md platform emergency safety net*
*This is a minimal fallback - full analysis available when system is operational*`;
  }

  /**
   * Create error response with helpful debugging info
   */
  static createDiagnosticErrorResponse(error: Error, context: string): NextResponse {
    const isDev = process.env.NODE_ENV === 'development';
    
    const diagnosticInfo = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error.message,
        name: error.name,
        stack: isDev ? error.stack : undefined
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        hasOpenrouter: !!process.env.OPENROUTER_API_KEY,
        platform: process.env.VERCEL ? 'vercel' : 'unknown'
      },
      recommendations: this.generateRecommendations(error, context)
    };

    return NextResponse.json({
      error: 'System temporarily unavailable',
      message: 'The system is experiencing technical difficulties. Emergency mode is available.',
      diagnostics: diagnosticInfo,
      emergencyMode: {
        available: true,
        description: 'Basic functionality with emergency dataset',
        endpoints: [
          '/api/emergency/dilemmas',
          '/api/emergency/values-generation'
        ]
      }
    }, { status: 503 });
  }

  private static generateRecommendations(error: Error, context: string): string[] {
    const recommendations = [];
    
    if (error.message.includes('DATABASE_URL')) {
      recommendations.push('Set DATABASE_URL environment variable in deployment platform');
      recommendations.push('Verify database connection string format and credentials');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
      recommendations.push('Check network connectivity to database');
      recommendations.push('Verify database server is running and accessible');
    }
    
    if (context.includes('dilemma')) {
      recommendations.push('Database may be empty - run database seeding');
      recommendations.push('Emergency dilemma dataset is available as fallback');
    }
    
    recommendations.push('Check deployment platform logs for additional details');
    recommendations.push('Use /api/diagnostics/full-system for comprehensive analysis');
    
    return recommendations;
  }
}

/**
 * Middleware to wrap API handlers with safety nets
 */
export function withProductionSafetyNet<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('🚨 Production safety net activated:', error);
      
      // Determine context from the error and arguments
      const context = args[0]?.url ? new URL(args[0].url).pathname : 'unknown';
      
      return ProductionSafetyNet.createDiagnosticErrorResponse(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
    }
  };
}