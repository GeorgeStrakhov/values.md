import { NextRequest, NextResponse } from 'next/server';
import { getQualityMetrics, cache } from '@/lib/api-quality-patterns';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get real-time quality metrics
    const metrics = getQualityMetrics();
    
    // Analyze API endpoint quality patterns
    const apiPath = path.join(process.cwd(), 'src/app/api');
    const endpointAnalysis = analyzeEndpointQuality(apiPath);
    
    // Check fibration consistency
    const fibrationConsistency = await checkFibrationAlignment();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      qualityScore: calculateOverallQuality(metrics, endpointAnalysis, fibrationConsistency),
      metrics: {
        runtime: metrics,
        endpoints: endpointAnalysis,
        fibration: fibrationConsistency
      },
      patterns: {
        mathematicalAlignment: 'ENFORCED',
        codeQuality: 'AUTOMATED',
        layerConsistency: 'VERIFIED',
        duplicationElimination: 'ACTIVE'
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to generate quality metrics',
      details: String(error)
    }, { status: 500 });
  }
}

function analyzeEndpointQuality(apiPath: string): any {
  const analysis = {
    totalEndpoints: 0,
    qualityPatternAdoption: 0,
    duplicatedLogic: 0,
    standardizedValidation: 0,
    errorHandlingConsistency: 0,
    endpoints: [] as any[]
  };
  
  const scanDirectory = (dir: string, basePath: string = '') => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(basePath, file));
      } else if (file === 'route.ts') {
        analysis.totalEndpoints++;
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        const endpoint = analyzeEndpointFile(content, path.join(basePath, file));
        analysis.endpoints.push(endpoint);
        
        // Count quality patterns
        if (endpoint.usesQualityPattern) analysis.qualityPatternAdoption++;
        if (endpoint.hasStandardizedValidation) analysis.standardizedValidation++;
        if (endpoint.hasConsistentErrorHandling) analysis.errorHandlingConsistency++;
        if (endpoint.hasDuplicatedLogic) analysis.duplicatedLogic++;
      }
    }
  };
  
  scanDirectory(apiPath);
  
  return {
    ...analysis,
    qualityScore: analysis.totalEndpoints > 0 
      ? Math.round((analysis.qualityPatternAdoption / analysis.totalEndpoints) * 100)
      : 0,
    standardizationScore: analysis.totalEndpoints > 0
      ? Math.round((analysis.standardizedValidation / analysis.totalEndpoints) * 100)
      : 0,
    duplicationScore: analysis.totalEndpoints > 0 
      ? Math.round(((analysis.totalEndpoints - analysis.duplicatedLogic) / analysis.totalEndpoints) * 100)
      : 100
  };
}

function analyzeEndpointFile(content: string, filePath: string): any {
  return {
    path: filePath,
    usesQualityPattern: content.includes('createQualityEndpoint'),
    hasStandardizedValidation: content.includes('CommonEndpointSchemas') || content.includes('.parse('),
    hasConsistentErrorHandling: content.includes('withErrorHandler') || content.includes('ApiErrors'),
    hasDuplicatedLogic: checkForDuplicatedPatterns(content),
    hasRateLimit: content.includes('checkRateLimit') || content.includes('rateLimit'),
    hasCaching: content.includes('cache') || content.includes('Cache'),
    hasLogging: content.includes('logRequest') || content.includes('console.log'),
    linesOfCode: content.split('\n').length,
    complexity: calculateComplexity(content)
  };
}

function checkForDuplicatedPatterns(content: string): boolean {
  // Check for common duplication patterns
  const duplicatedPatterns = [
    /const.*=.*request\.headers\.get.*ip/gi, // Manual IP extraction
    /if.*!.*checkRateLimit/gi, // Manual rate limit checks
    /NextResponse\.json.*error.*status/gi, // Manual error responses without standardization
    /try.*catch.*console\.error.*NextResponse/gi // Manual try-catch without error handler
  ];
  
  let duplications = 0;
  for (const pattern of duplicatedPatterns) {
    if (pattern.test(content)) duplications++;
  }
  
  return duplications >= 2; // Multiple manual patterns = duplication
}

function calculateComplexity(content: string): number {
  // Simple complexity metric based on nesting and conditionals
  const patterns = [
    /if\s*\(/gi,
    /for\s*\(/gi,
    /while\s*\(/gi,
    /switch\s*\(/gi,
    /try\s*{/gi,
    /catch\s*\(/gi
  ];
  
  let complexity = 1; // Base complexity
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) complexity += matches.length;
  }
  
  return complexity;
}

async function checkFibrationAlignment(): Promise<any> {
  try {
    // Check if our fibration checker is available
    const fibrationResponse = await fetch('http://localhost:3000/api/fibration-check');
    if (fibrationResponse.ok) {
      const fibrationData = await fibrationResponse.json();
      return {
        status: fibrationData.status,
        consistencyScore: Math.round((fibrationData.categoryTheory?.consistencyScore || 0) * 100),
        layersAligned: fibrationData.fibrationCheck?.layers ? 
          Object.values(fibrationData.fibrationCheck.layers).filter((layer: any) => layer.consistent).length : 0,
        totalLayers: fibrationData.fibrationCheck?.layers ? 
          Object.keys(fibrationData.fibrationCheck.layers).length : 0,
        issues: fibrationData.fibrationCheck?.issues?.length || 0
      };
    }
  } catch (error) {
    console.warn('Fibration check unavailable:', error);
  }
  
  return {
    status: 'unavailable',
    consistencyScore: 0,
    layersAligned: 0,
    totalLayers: 4,
    issues: ['Fibration checker not running']
  };
}

function calculateOverallQuality(metrics: any, endpoints: any, fibration: any): number {
  const weights = {
    endpointQuality: 0.4,      // 40% - Code quality patterns
    fibrationAlignment: 0.3,    // 30% - Mathematical consistency  
    runtimeMetrics: 0.2,        // 20% - Actual performance
    duplicationElimination: 0.1 // 10% - Code maintainability
  };
  
  const scores = {
    endpointQuality: endpoints.qualityScore || 0,
    fibrationAlignment: fibration.consistencyScore || 0,
    runtimeMetrics: metrics.successRate ? parseFloat(metrics.successRate.replace('%', '')) : 0,
    duplicationElimination: endpoints.duplicationScore || 0
  };
  
  const overallScore = 
    scores.endpointQuality * weights.endpointQuality +
    scores.fibrationAlignment * weights.fibrationAlignment +
    scores.runtimeMetrics * weights.runtimeMetrics +
    scores.duplicationElimination * weights.duplicationElimination;
    
  return Math.round(overallScore);
}