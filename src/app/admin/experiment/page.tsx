'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Zap, 
  Play, 
  Pause, 
  RefreshCw, 
  Download, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { AdminProtection } from '@/components/admin-protection';
import { AdminErrorBoundary } from '@/components/error-boundary';

interface LLMResponse {
  provider: string;
  modelName: string;
  choice: string;
  reasoning: string;
  confidence: number;
  valuesApplied?: string[];
  responseTime: number;
  cost: number;
  tokenCount: number;
  rawResponse: string;
  timestamp: string;
}

interface ExperimentResult {
  dilemmaId: string;
  dilemmaTitle: string;
  dilemmaScenario: string;
  responses: LLMResponse[];
  analysis: {
    consensusChoice?: string;
    reasoningPatterns: string[];
    ethicalFrameworks: Record<string, number>;
    confidenceStats: {
      mean: number;
      std: number;
      min: number;
      max: number;
    };
    costAnalysis: {
      total: number;
      perProvider: Record<string, number>;
    };
    responseTimeStats: {
      mean: number;
      fastest: string;
      slowest: string;
    };
  };
}

interface ExperimentConfig {
  providers: string[];
  dilemmaCount: number;
  temperature: number;
  maxTokens: number;
  includeValuesContext: boolean;
  customInstructions: string;
}

const DEFAULT_CONFIG: ExperimentConfig = {
  providers: ['openai-gpt4', 'anthropic-claude', 'google-gemini'],
  dilemmaCount: 3,
  temperature: 0.7,
  maxTokens: 500,
  includeValuesContext: false,
  customInstructions: ''
};

const PROVIDER_STATUS = {
  'openai-gpt4': { name: 'OpenAI GPT-4', color: 'bg-green-500', status: 'active' },
  'openai-gpt35': { name: 'OpenAI GPT-3.5', color: 'bg-blue-500', status: 'active' },
  'anthropic-claude': { name: 'Anthropic Claude', color: 'bg-purple-500', status: 'active' },
  'google-gemini': { name: 'Google Gemini', color: 'bg-yellow-500', status: 'active' }
};

function ExperimentPageContent() {
  const [config, setConfig] = useState<ExperimentConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [currentDilemma, setCurrentDilemma] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, boolean>>({});
  const [totalCost, setTotalCost] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const validateApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/experiment/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const status = await response.json();
        setApiKeyStatus(status);
      }
    } catch (error) {
      console.error('Failed to validate API keys:', error);
    }
  };

  const runExperiment = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setIsPaused(false);
    setError('');
    setResults([]);
    setProgress(0);
    setTotalCost(0);
    setTotalTime(0);

    try {
      const response = await fetch('/api/admin/experiment/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`Experiment failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setProgress(data.progress);
                setCurrentDilemma(data.currentDilemma);
              } else if (data.type === 'result') {
                setResults(prev => [...prev, data.result]);
                setTotalCost(prev => prev + data.result.analysis.costAnalysis.total);
                setTotalTime(prev => prev + data.result.analysis.responseTimeStats.mean);
              } else if (data.type === 'error') {
                setError(data.error);
                setIsRunning(false);
                return;
              } else if (data.type === 'complete') {
                setIsRunning(false);
                setProgress(100);
                setCurrentDilemma('');
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsRunning(false);
    }
  };

  const pauseExperiment = () => {
    setIsPaused(!isPaused);
  };

  const resetExperiment = () => {
    setIsRunning(false);
    setIsPaused(false);
    setProgress(0);
    setResults([]);
    setCurrentDilemma('');
    setError('');
    setTotalCost(0);
    setTotalTime(0);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `llm_experiment_results_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getProviderStatus = (provider: string) => {
    const isValid = apiKeyStatus[provider];
    const providerInfo = PROVIDER_STATUS[provider];
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">{providerInfo?.name || provider}</span>
        {isValid ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
    );
  };

  const getChoiceDistribution = () => {
    if (results.length === 0) return {};
    
    const distribution: Record<string, number> = {};
    
    results.forEach(result => {
      result.responses.forEach(response => {
        distribution[response.choice] = (distribution[response.choice] || 0) + 1;
      });
    });
    
    return distribution;
  };

  const getFrameworkAnalysis = () => {
    if (results.length === 0) return {};
    
    const frameworks: Record<string, number> = {};
    
    results.forEach(result => {
      Object.entries(result.analysis.ethicalFrameworks).forEach(([framework, score]) => {
        frameworks[framework] = (frameworks[framework] || 0) + score;
      });
    });
    
    return frameworks;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              LLM Ethical Reasoning Experiments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={validateApiKeys}
                variant="outline"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Check API Keys
              </Button>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Total Cost: ${totalCost.toFixed(4)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Total Time: {(totalTime / 1000).toFixed(1)}s</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(PROVIDER_STATUS).map(provider => (
                <div key={provider} className="p-3 border rounded-lg">
                  {getProviderStatus(provider)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Experiment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dilemmaCount">Number of Dilemmas</Label>
                <Input
                  id="dilemmaCount"
                  type="number"
                  value={config.dilemmaCount}
                  onChange={(e) => setConfig(prev => ({ ...prev, dilemmaCount: parseInt(e.target.value) }))}
                  min="1"
                  max="10"
                  disabled={isRunning}
                />
              </div>
              
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  value={config.temperature}
                  onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  min="0"
                  max="1"
                  step="0.1"
                  disabled={isRunning}
                />
              </div>
              
              <div>
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  min="100"
                  max="2000"
                  disabled={isRunning}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="customInstructions">Custom Instructions</Label>
              <Textarea
                id="customInstructions"
                value={config.customInstructions}
                onChange={(e) => setConfig(prev => ({ ...prev, customInstructions: e.target.value }))}
                placeholder="Additional instructions for the LLMs..."
                disabled={isRunning}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeValuesContext"
                checked={config.includeValuesContext}
                onChange={(e) => setConfig(prev => ({ ...prev, includeValuesContext: e.target.checked }))}
                disabled={isRunning}
              />
              <Label htmlFor="includeValuesContext">Include VALUES.md context in prompts</Label>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={runExperiment}
                disabled={isRunning || config.providers.length === 0}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run Experiment
              </Button>
              
              <Button 
                onClick={pauseExperiment}
                disabled={!isRunning}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              
              <Button 
                onClick={resetExperiment}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
              
              <Button 
                onClick={exportResults}
                disabled={results.length === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {isRunning && (
          <Card>
            <CardHeader>
              <CardTitle>Experiment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-muted-foreground">
                  {currentDilemma && (
                    <p>Current dilemma: {currentDilemma}</p>
                  )}
                  <p>{Math.round(progress)}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Overview */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Choice Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(getChoiceDistribution()).map(([choice, count]) => (
                    <div key={choice} className="flex items-center justify-between">
                      <span className="font-medium">Choice {choice}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Framework Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(getFrameworkAnalysis()).map(([framework, score]) => (
                    <div key={framework} className="flex items-center justify-between">
                      <span className="text-sm">{framework}</span>
                      <Badge variant="outline">{score.toFixed(1)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Summary Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Dilemmas Processed:</span>
                    <span className="font-medium">{results.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Responses:</span>
                    <span className="font-medium">{results.reduce((sum, r) => sum + r.responses.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-medium">{(totalTime / results.length / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">{result.dilemmaTitle}</h3>
                      <p className="text-sm text-muted-foreground">{result.dilemmaScenario}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {result.responses.map((response, responseIndex) => (
                        <div key={responseIndex} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{response.provider}</Badge>
                            <Badge variant="secondary">Choice {response.choice}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {response.responseTime}ms | ${response.cost.toFixed(4)}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{response.reasoning}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Confidence: {response.confidence}/10
                            </span>
                            {response.valuesApplied && response.valuesApplied.length > 0 && (
                              <div className="flex gap-1">
                                {response.valuesApplied.map((value, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ExperimentPage() {
  return (
    <AdminProtection>
      <AdminErrorBoundary>
        <ExperimentPageContent />
      </AdminErrorBoundary>
    </AdminProtection>
  );
}