import { NextRequest, NextResponse } from 'next/server';
import { CategoricalCodeAnalyzer } from '@/lib/categorical-analysis';
import { createQualityEndpoint } from '@/lib/api-quality-patterns';

// Create endpoint using quality patterns
export const GET = createQualityEndpoint(
  {
    name: 'categorical-analysis',
    rateLimit: { requests: 10, windowMs: 60000 },
    cacheConfig: {
      ttlMs: 300000, // 5 minutes
      keyGenerator: () => 'categorical-analysis'
    }
  },
  async (request: NextRequest) => {
    const analyzer = new CategoricalCodeAnalyzer();
    
    try {
      console.log('🧮 Running categorical analysis...');
      const analysis = await analyzer.performCategoricalAnalysis();
      
      console.log(`✅ Analysis complete: ${analysis.categories.code} code functions, ${analysis.categories.test} tests, ${analysis.categories.arch} components`);
      
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        status: 'success',
        categoryTheory: {
          ...analysis,
          consistencyScore: analysis.functoriality.testProjection.valid && analysis.functoriality.archProjection.valid ? 1.0 : 0.5
        },
        summary: {
          totalObjects: analysis.categories.code + analysis.categories.test + analysis.categories.arch,
          fibrationValid: analysis.fibrationCoherence.valid,
          functorsValid: analysis.functoriality.testProjection.valid && analysis.functoriality.archProjection.valid,
          issues: [
            ...analysis.functoriality.testProjection.violations,
            ...analysis.functoriality.archProjection.violations,
            ...analysis.fibrationCoherence.issues
          ]
        }
      });
    } catch (error) {
      console.error('❌ Categorical analysis failed:', error);
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        status: 'error',
        error: String(error),
        categoryTheory: {
          consistencyScore: 0,
          categories: { code: 0, test: 0, arch: 0 },
          functoriality: {
            testProjection: { valid: false, violations: [`Analysis failed: ${String(error)}`] },
            archProjection: { valid: false, violations: [`Analysis failed: ${String(error)}`] }
          },
          fibrationCoherence: { valid: false, issues: [`Analysis failed: ${String(error)}`] }
        }
      });
    }
  }
);

export const OPTIONS = async (request: NextRequest) => {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};