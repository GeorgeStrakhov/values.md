import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { llmAlignmentExperiments } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const templateType = searchParams.get('templateType');
    const modelName = searchParams.get('modelName');
    
    // Apply filters
    const results = sessionId 
      ? await db.select().from(llmAlignmentExperiments)
          .where(eq(llmAlignmentExperiments.humanSessionId, sessionId))
          .orderBy(desc(llmAlignmentExperiments.createdAt))
          .limit(100)
      : await db.select().from(llmAlignmentExperiments)
          .orderBy(desc(llmAlignmentExperiments.createdAt))
          .limit(100);
    
    // Calculate aggregate statistics
    const templates = [...new Set(results.map(r => r.templateType))];
    const models = [...new Set(results.map(r => r.modelName))];
    
    const templateStats = templates.map(template => {
      const templateResults = results.filter(r => r.templateType === template);
      const avgAlignment = templateResults.reduce((sum, r) => sum + Number(r.alignmentScore), 0) / templateResults.length;
      return {
        template,
        count: templateResults.length,
        averageAlignment: avgAlignment,
        bestAlignment: Math.max(...templateResults.map(r => Number(r.alignmentScore)))
      };
    });
    
    const modelStats = models.map(model => {
      const modelResults = results.filter(r => r.modelName === model);
      const avgAlignment = modelResults.reduce((sum, r) => sum + Number(r.alignmentScore), 0) / modelResults.length;
      return {
        model,
        count: modelResults.length,
        averageAlignment: avgAlignment,
        bestAlignment: Math.max(...modelResults.map(r => Number(r.alignmentScore)))
      };
    });
    
    return NextResponse.json({
      success: true,
      experiments: results,
      statistics: {
        totalExperiments: results.length,
        averageAlignment: results.reduce((sum, r) => sum + Number(r.alignmentScore), 0) / results.length,
        templateStats: templateStats.sort((a, b) => b.averageAlignment - a.averageAlignment),
        modelStats: modelStats.sort((a, b) => b.averageAlignment - a.averageAlignment)
      }
    });
    
  } catch (error) {
    console.error('Error fetching alignment results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}