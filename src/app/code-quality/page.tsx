'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QualityMetrics {
  qualityScore: number;
  metrics: {
    runtime: any;
    endpoints: any;
    fibration: any;
  };
  patterns: {
    mathematicalAlignment: string;
    codeQuality: string;
    layerConsistency: string;
    duplicationElimination: string;
  };
}

export default function CodeQualityDashboard() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQualityMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/quality-metrics');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quality metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityMetrics();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Code Quality Dashboard</h1>
            <div className="animate-pulse">Loading quality metrics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Quality Metrics Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={fetchQualityMetrics} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">No metrics available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Code Quality Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Mathematical patterning enforces quality automatically across all abstraction layers
          </p>
          
          {/* Overall Quality Score */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`text-3xl font-bold ${getScoreColor(metrics.qualityScore)}`}>
              {metrics.qualityScore}%
            </div>
            <Badge className={`text-lg px-4 py-2 ${getScoreBadge(metrics.qualityScore)}`}>
              Overall Quality Score
            </Badge>
          </div>
          
          <Button onClick={fetchQualityMetrics} variant="outline">
            Refresh Metrics
          </Button>
        </div>

        {/* Mathematical Patterns Status */}
        <Card>
          <CardHeader>
            <CardTitle>🔬 Mathematical Patterning Status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Automatic quality enforcement through category-theoretic structure
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(metrics.patterns).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="font-medium text-sm text-muted-foreground mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoint Quality */}
        <Card>
          <CardHeader>
            <CardTitle>🔌 API Endpoint Quality Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Automated pattern application across {metrics.metrics.endpoints.totalEndpoints} endpoints
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.metrics.endpoints.qualityScore)}`}>
                  {metrics.metrics.endpoints.qualityScore}%
                </div>
                <div className="text-sm text-muted-foreground">Quality Pattern Adoption</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.metrics.endpoints.qualityPatternAdoption}/{metrics.metrics.endpoints.totalEndpoints} endpoints
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.metrics.endpoints.standardizationScore)}`}>
                  {metrics.metrics.endpoints.standardizationScore}%
                </div>
                <div className="text-sm text-muted-foreground">Standardized Validation</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.metrics.endpoints.standardizedValidation}/{metrics.metrics.endpoints.totalEndpoints} endpoints
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.metrics.endpoints.duplicationScore)}`}>
                  {metrics.metrics.endpoints.duplicationScore}%
                </div>
                <div className="text-sm text-muted-foreground">Duplication Elimination</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.metrics.endpoints.totalEndpoints - metrics.metrics.endpoints.duplicatedLogic}/{metrics.metrics.endpoints.totalEndpoints} clean
                </div>
              </div>
            </div>

            {/* Endpoint Details */}
            <div className="space-y-2">
              <h4 className="font-semibold">Endpoint Analysis Summary</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Quality Patterns Applied:</div>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Automatic validation with Zod schemas</li>
                    <li>Centralized error handling and logging</li>
                    <li>Rate limiting and security headers</li>
                    <li>Consistent caching and CORS policies</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Mathematical Benefits:</div>
                  <ul className="list-disc list-inside text-muted-foreground ml-2">
                    <li>Zero duplication through pattern derivation</li>
                    <li>Automatic consistency across all endpoints</li>
                    <li>Quality enforced by mathematical structure</li>
                    <li>Transparent maintainability guarantees</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fibration Layer Consistency */}
        <Card>
          <CardHeader>
            <CardTitle>📐 Fibration Layer Consistency</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mathematical verification that abstraction layers derive from executing code
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(metrics.metrics.fibration.consistencyScore)}`}>
                  {metrics.metrics.fibration.consistencyScore}%
                </div>
                <div className="text-sm text-muted-foreground">Layer Consistency Score</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.metrics.fibration.layersAligned}/{metrics.metrics.fibration.totalLayers} layers aligned
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${metrics.metrics.fibration.issues === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {metrics.metrics.fibration.issues}
                </div>
                <div className="text-sm text-muted-foreground">Structural Issues</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.metrics.fibration.status === 'consistent' ? 'All layers coherent' : 'Alignment needed'}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-2">Fibration Structure Verification:</div>
                <div className="grid md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>• Base Category: Executing code reality</div>
                  <div>• Fiber Categories: Performance, Tests, Architecture, Concepts</div>
                  <div>• Structure Maps: Each layer → Executing code</div>
                  <div>• Coherence: Mathematical consistency enforced</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Runtime Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Runtime Quality Metrics</CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time performance indicators from actual code execution
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {metrics.metrics.runtime.successRate}
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">
                  {metrics.metrics.runtime.totalRequests}
                </div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">
                  {Math.round(metrics.metrics.runtime.uptime / 1000 / 60)}m
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">
                  {metrics.metrics.runtime.averageResponseTime}ms
                </div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Philosophy */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Quality Philosophy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>
                <strong>Quality is king</strong> - this dashboard demonstrates how mathematical patterning 
                ensures that quality standards are automatically enforced across all layers of the system.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="font-semibold text-blue-800">Mathematical Approach</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Quality patterns derived categorically</li>
                    <li>• Zero duplication through mathematical structure</li>
                    <li>• Automatic consistency enforcement</li>
                    <li>• Transparent maintainability guarantees</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-green-800">Practical Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clean, obviously correct code</li>
                    <li>• Automatic validation and error handling</li>
                    <li>• Consistent performance and security</li>
                    <li>• Self-documenting architectural alignment</li>
                  </ul>
                </div>
              </div>
              
              <p className="mt-4">
                <strong>The fibration structure ensures</strong> that higher abstraction layers 
                (tests, documentation, architecture diagrams) automatically derive from and remain 
                consistent with the actual executing code. Quality flows upward mathematically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}