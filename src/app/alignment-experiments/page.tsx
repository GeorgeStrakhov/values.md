'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExperimentResult {
  template: string;
  model: string;
  dilemma: string;
  humanChoice: string;
  llmChoice: string;
  alignmentScore: number;
  reasoning: string;
}

interface ExperimentSummary {
  totalTests: number;
  averageAlignment: number;
  bestTemplate: string;
  bestModel: string;
}

export default function AlignmentExperimentsPage() {
  const [sessionId, setSessionId] = useState('');
  const [experimentResults, setExperimentResults] = useState<ExperimentResult[]>([]);
  const [experimentSummary, setExperimentSummary] = useState<ExperimentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load existing results on page load
    fetchResults();
  }, []);

  const runExperiment = async () => {
    if (!sessionId) {
      alert('Please enter a session ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/experiments/alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setExperimentResults(data.results);
      setExperimentSummary(data.summary);
      
      // Refresh results after experiment
      await fetchResults();
      
    } catch (error) {
      console.error('Experiment failed:', error);
      alert('Experiment failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/experiments/alignment/results');
      if (response.ok) {
        const data = await response.json();
        setResultsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">LLM Alignment Experiments</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Test how well different values.md templates align LLMs with human ethical decisions
          </p>
        </div>

        {/* Experiment Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Run New Experiment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Test how well different values.md templates help LLMs align with a specific user&apos;s ethical decisions
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="sessionId">Session ID</Label>
                <Input
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="sim-user-1-1750010354931"
                />
              </div>
              <div>
                <Button onClick={runExperiment} disabled={loading} className="w-full">
                  {loading ? 'Running Experiment...' : 'Run Alignment Test'}
                </Button>
              </div>
              <div>
                <Button onClick={() => setShowResults(!showResults)} variant="outline" className="w-full">
                  {showResults ? 'Hide Results' : 'Show All Results'}
                </Button>
              </div>
            </div>
            
            {loading && (
              <div className="space-y-2">
                <Progress value={33} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Testing 5 templates × 3 models × 2 dilemmas = 30 alignment tests...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Experiment Results */}
        {experimentSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Experiment Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{experimentSummary.totalTests}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{experimentSummary.averageAlignment.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Avg Alignment</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{experimentSummary.bestTemplate}</div>
                  <div className="text-sm text-muted-foreground">Best Template</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{experimentSummary.bestModel.split('/').pop()}</div>
                  <div className="text-sm text-muted-foreground">Best Model</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {experimentResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{result.template}</Badge>
                      <Badge variant="secondary">{result.model.split('/').pop()}</Badge>
                      <span className="text-sm">{result.dilemma}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">H:{result.humanChoice.toUpperCase()} → L:{result.llmChoice.toUpperCase()}</span>
                      <Badge className={getAlignmentColor(result.alignmentScore)}>
                        {result.alignmentScore}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Results */}
        {showResults && resultsData && (
          <Card>
            <CardHeader>
              <CardTitle>All Experiment Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                {resultsData.statistics.totalExperiments} experiments across all sessions
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Template Performance */}
                <div>
                  <h3 className="font-semibold mb-3">Template Performance</h3>
                  <div className="space-y-2">
                    {resultsData.statistics.templateStats.map((stat: any) => (
                      <div key={stat.template} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="font-medium">{stat.template}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{stat.count} tests</span>
                          <Badge className={getAlignmentColor(stat.averageAlignment)}>
                            {stat.averageAlignment.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model Performance */}
                <div>
                  <h3 className="font-semibold mb-3">Model Performance</h3>
                  <div className="space-y-2">
                    {resultsData.statistics.modelStats.map((stat: any) => (
                      <div key={stat.model} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="font-medium">{stat.model.split('/').pop()}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{stat.count} tests</span>
                          <Badge className={getAlignmentColor(stat.averageAlignment)}>
                            {stat.averageAlignment.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Methodology */}
        <Card>
          <CardHeader>
            <CardTitle>Experiment Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Templates Tested</h3>
                <ul className="text-sm space-y-1">
                  <li>• Enhanced Statistical (baseline)</li>
                  <li>• Narrative Weaving</li>
                  <li>• Minimalist Directive</li>
                  <li>• Framework-Centric</li>
                  <li>• Stakeholder-Focused</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Models Tested</h3>
                <ul className="text-sm space-y-1">
                  <li>• Claude 3.5 Sonnet</li>
                  <li>• GPT-4o</li>
                  <li>• Gemini Pro 1.5</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Alignment Scoring</h3>
                <ul className="text-sm space-y-1">
                  <li>• 100% = Exact choice match</li>
                  <li>• 0% = Different choice</li>
                  <li>• Future: Reasoning similarity</li>
                  <li>• Future: Value consistency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}