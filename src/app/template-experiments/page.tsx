'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Template {
  id: string;
  name: string;
  description: string;
  focusAreas: string[];
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  templates: string[];
  sampleSize: number;
  durationDays: number;
  metricCount: number;
}

interface Metric {
  id: string;
  name: string;
  description: string;
  type: 'quantitative' | 'qualitative' | 'behavioral';
  targetValue?: number;
  higherIsBetter: boolean;
}

export default function TemplateExperimentsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>('');
  const [experimentResults, setExperimentResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperimentData();
  }, []);

  const fetchExperimentData = async () => {
    try {
      const response = await fetch('/api/experiments/templates');
      const data = await response.json();
      setTemplates(data.templates);
      setExperiments(data.experiments);
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error fetching experiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runExperiment = async (experimentId: string) => {
    try {
      setLoading(true);
      
      // Use existing session for demo
      const sessionId = 'sim-user-1-1750010354931';
      
      // Generate experimental values
      const generateResponse = await fetch('/api/experiments/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, experimentId })
      });
      
      if (!generateResponse.ok) {
        throw new Error('Failed to generate experimental values');
      }
      
      const generateData = await generateResponse.json();
      
      // Simulate some metrics for demo
      const demoMetrics = {
        clarity_score: Math.random() * 3 + 7, // 7-10
        actionability_score: Math.random() * 3 + 7,
        readability_score: Math.random() * 4 + 10, // 10-14 (grade level)
        user_satisfaction: Math.random() * 3 + 7,
        ai_alignment_accuracy: Math.random() * 20 + 75 // 75-95%
      };
      
      // Record feedback for demo
      await fetch('/api/experiments/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          templateId: generateData.templateId,
          sessionId,
          metrics: demoMetrics,
          feedbackScore: Math.random() * 3 + 7, // 7-10
          notes: 'Demo experiment run'
        })
      });
      
      // Get updated results
      const resultsResponse = await fetch(`/api/experiments/feedback?experimentId=${experimentId}`);
      const resultsData = await resultsResponse.json();
      
      setExperimentResults({
        ...generateData,
        demoMetrics,
        resultsData
      });
      setSelectedExperiment(experimentId);
      
    } catch (error) {
      console.error('Error running experiment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !experimentResults) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Values.md Template Experiments</h1>
        <div className="text-center">Loading experiment framework...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Values.md Template Experiments</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Templates Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Available Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded p-4">
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.focusAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experiments */}
        <Card>
          <CardHeader>
            <CardTitle>Experiment Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {experiments.map((experiment) => (
                <div key={experiment.id} className="border rounded p-4">
                  <h3 className="font-semibold">{experiment.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{experiment.description}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    Templates: {experiment.templates.join(', ')} | 
                    Sample: {experiment.sampleSize} | 
                    Duration: {experiment.durationDays} days | 
                    Metrics: {experiment.metricCount}
                  </div>
                  <Button 
                    onClick={() => runExperiment(experiment.id)}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? 'Running...' : 'Run Experiment'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Metrics */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Evaluation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{metric.name}</h4>
                  <Badge 
                    variant={metric.type === 'quantitative' ? 'default' : 
                            metric.type === 'behavioral' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {metric.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{metric.description}</p>
                {metric.targetValue && (
                  <div className="text-xs text-blue-600">
                    Target: {metric.targetValue} ({metric.higherIsBetter ? 'higher' : 'lower'} is better)
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experiment Results */}
      {experimentResults && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Experiment Results: {selectedExperiment}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generated Template */}
              <div>
                <h3 className="font-semibold mb-2">
                  Generated Template: {experimentResults.templateName}
                </h3>
                <div className="bg-gray-50 p-4 rounded text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{experimentResults.valuesMarkdown}</pre>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <h3 className="font-semibold mb-2">Demo Metrics</h3>
                <div className="space-y-2">
                  {Object.entries(experimentResults.demoMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">
                        {typeof value === 'number' ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                {experimentResults.resultsData.efficacyReport && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Efficacy Report</h4>
                    <div className="text-sm text-gray-600">
                      {experimentResults.resultsData.resultCount} total results collected
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Framework Documentation */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Experiment Framework Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <h3>The Waterfall of Possible Weavings</h3>
            <p>
              Our experiment framework tests different approaches to composing values.md files 
              from the same ethical dilemma responses. Each template represents a different 
              "weaving" of moral motifs into coherent ethical profiles.
            </p>
            
            <h4>Template Approaches:</h4>
            <ul>
              <li><strong>Enhanced Statistical:</strong> Comprehensive data-driven approach with detailed metrics</li>
              <li><strong>Narrative Weaving:</strong> Story-driven approach emphasizing moral journey</li>
              <li><strong>Minimalist Directive:</strong> Concise, action-oriented for AI systems</li>
              <li><strong>Framework-Centric:</strong> Philosophy-focused with theoretical grounding</li>
              <li><strong>Stakeholder-Focused:</strong> Emphasizing relational and impact considerations</li>
            </ul>

            <h4>Evaluation Dimensions:</h4>
            <ul>
              <li><strong>Quantitative:</strong> Measurable metrics like clarity, consistency, readability</li>
              <li><strong>Behavioral:</strong> Real-world performance in AI alignment scenarios</li>
              <li><strong>Qualitative:</strong> Narrative coherence, personalization depth, philosophical grounding</li>
            </ul>

            <p>
              This systematic comparison allows us to optimize values.md composition for different 
              use cases and user preferences, ensuring the "waterfall" produces the most effective 
              ethical profiles for AI alignment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}