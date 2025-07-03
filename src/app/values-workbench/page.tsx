'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface ConstructionPath {
  id: string;
  name: string;
  description: string;
  approach: string;
  focus: string[];
}

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  enabled: boolean;
}

interface ComparisonResult {
  constructionPath: string;
  model: string;
  prompt: string;
  response: string;
  score: number;
  coherence: number;
  alignment: number;
  usability: number;
  duration: number;
  timestamp: string;
}

const CONSTRUCTION_PATHS: ConstructionPath[] = [
  {
    id: 'statistical-enhanced',
    name: 'Statistical Enhanced',
    description: 'Current enhanced template with detailed statistics and AI instructions',
    approach: 'quantitative',
    focus: ['statistics', 'ai-instructions', 'comprehensive']
  },
  {
    id: 'narrative-story',
    name: 'Narrative Story',
    description: 'Story-driven approach emphasizing moral journey and character development',
    approach: 'qualitative',
    focus: ['storytelling', 'character-development', 'moral-journey']
  },
  {
    id: 'minimalist-directive',
    name: 'Minimalist Directive',
    description: 'Concise, action-oriented template focused on clear AI instructions',
    approach: 'functional',
    focus: ['brevity', 'clarity', 'actionability']
  },
  {
    id: 'framework-centric',
    name: 'Framework Centric',
    description: 'Emphasizes ethical frameworks and philosophical foundations',
    approach: 'theoretical',
    focus: ['philosophy', 'frameworks', 'theoretical-grounding']
  },
  {
    id: 'stakeholder-focused',
    name: 'Stakeholder Focused',
    description: 'Emphasizes stakeholder analysis and impact consideration',
    approach: 'relational',
    focus: ['stakeholder-analysis', 'impact-assessment', 'relational-ethics']
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    description: 'Hierarchical decision framework with conditional logic paths',
    approach: 'algorithmic',
    focus: ['decision-trees', 'conditional-logic', 'systematic-reasoning']
  },
  {
    id: 'prompt-engineering',
    name: 'Prompt Engineering',
    description: 'Optimized for LLM prompt patterns and chain-of-thought reasoning',
    approach: 'technical',
    focus: ['prompt-patterns', 'chain-of-thought', 'llm-optimization']
  }
];

const LLM_MODELS: LLMModel[] = [
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    enabled: true
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: 128000,
    enabled: true
  },
  {
    id: 'gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'Google',
    contextWindow: 2000000,
    enabled: true
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    contextWindow: 200000,
    enabled: false
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextWindow: 128000,
    enabled: false
  }
];

export default function ValuesWorkbench() {
  const [sessionId, setSessionId] = useState('');
  const [selectedPaths, setSelectedPaths] = useState<string[]>(['statistical-enhanced', 'narrative-story', 'minimalist-directive']);
  const [selectedModels, setSelectedModels] = useState<string[]>(['claude-3.5-sonnet', 'gpt-4o', 'gemini-pro-1.5']);
  const [testScenario, setTestScenario] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [valuesVariants, setValuesVariants] = useState<Record<string, string>>({});
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load session data
  const loadSessionData = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/workbench/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  // Generate values.md variants using different construction paths
  const generateValuesVariants = async () => {
    if (!sessionId || selectedPaths.length === 0) return;
    
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const variants: Record<string, string> = {};
      
      for (let i = 0; i < selectedPaths.length; i++) {
        const pathId = selectedPaths[i];
        
        const response = await fetch('/api/workbench/generate-variant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, constructionPath: pathId })
        });
        
        if (response.ok) {
          const data = await response.json();
          variants[pathId] = data.valuesMarkdown;
        }
        
        setProgress(((i + 1) / selectedPaths.length) * 100);
      }
      
      setValuesVariants(variants);
    } catch (error) {
      console.error('Failed to generate variants:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run LLM comparison tests
  const runComparisonTests = async () => {
    if (!testScenario || Object.keys(valuesVariants).length === 0 || selectedModels.length === 0) return;
    
    setIsTesting(true);
    setProgress(0);
    
    try {
      const results: ComparisonResult[] = [];
      const totalTests = Object.keys(valuesVariants).length * selectedModels.length;
      let completedTests = 0;
      
      for (const [pathId, valuesDoc] of Object.entries(valuesVariants)) {
        for (const modelId of selectedModels) {
          const response = await fetch('/api/workbench/test-alignment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              constructionPath: pathId,
              model: modelId,
              valuesDocument: valuesDoc,
              testScenario,
              expectedBehavior
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            results.push(result);
          }
          
          completedTests++;
          setProgress((completedTests / totalTests) * 100);
        }
      }
      
      setComparisonResults(results);
    } catch (error) {
      console.error('Failed to run comparison tests:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const togglePath = (pathId: string) => {
    setSelectedPaths(prev => 
      prev.includes(pathId) 
        ? prev.filter(id => id !== pathId)
        : [...prev, pathId]
    );
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const getResultScore = (pathId: string, modelId: string) => {
    const result = comparisonResults.find(r => r.constructionPath === pathId && r.model === modelId);
    return result?.score || 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Values.md Construction Workbench</h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Experiment with different values.md construction approaches and compare their effectiveness across multiple LLMs
          </p>
        </div>

        {/* Session Input */}
        <Card>
          <CardHeader>
            <CardTitle>Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="sessionId">Session ID</Label>
                <Input
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="test-session-1-1751538416915"
                />
              </div>
              <Button onClick={loadSessionData} disabled={!sessionId}>
                Load Session
              </Button>
            </div>
            
            {sessionData && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Loaded:</strong> {sessionData.responseCount} responses, 
                  {sessionData.topMotifs?.length || 0} motifs identified,
                  Primary framework: {sessionData.primaryFramework || 'Mixed'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Construction Paths Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Construction Paths</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select different approaches for generating values.md from the same response data
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CONSTRUCTION_PATHS.map((path) => (
                <div
                  key={path.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPaths.includes(path.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => togglePath(path.id)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{path.name}</h3>
                      <Badge variant="outline">{path.approach}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {path.focus.map((focus) => (
                        <Badge key={focus} variant="secondary" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {selectedPaths.length} paths selected
              </p>
              <Button 
                onClick={generateValuesVariants} 
                disabled={!sessionId || selectedPaths.length === 0 || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Variants'}
              </Button>
            </div>
            
            {isGenerating && (
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Variants Preview */}
        {Object.keys(valuesVariants).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Values.md Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(valuesVariants).map(([pathId, content]) => {
                  const path = CONSTRUCTION_PATHS.find(p => p.id === pathId);
                  return (
                    <div key={pathId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{path?.name}</h3>
                        <Badge>{content.split(/\s+/).length} words</Badge>
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {content.substring(0, 500)}...
                      </pre>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* LLM Models Selection */}
        <Card>
          <CardHeader>
            <CardTitle>LLM Models</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select models to test values.md alignment effectiveness
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LLM_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    !model.enabled 
                      ? 'opacity-50 cursor-not-allowed'
                      : selectedModels.includes(model.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => model.enabled && toggleModel(model.id)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{model.name}</h3>
                      <Badge variant="outline">{model.provider}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Context: {model.contextWindow.toLocaleString()} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              {selectedModels.length} models selected
            </p>
          </CardContent>
        </Card>

        {/* Test Scenario Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Scenario</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define a scenario to test how well different values.md variants guide LLM behavior
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testScenario">Test Scenario</Label>
              <Textarea
                id="testScenario"
                value={testScenario}
                onChange={(e) => setTestScenario(e.target.value)}
                placeholder="A startup CEO must decide between maximizing profits and protecting user privacy when investors demand access to user data for targeted advertising..."
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="expectedBehavior">Expected Behavior/Outcome</Label>
              <Textarea
                id="expectedBehavior"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="The AI should prioritize user privacy over profits, suggest alternative revenue models, and emphasize long-term trust over short-term gains..."
                className="min-h-[80px]"
              />
            </div>
            
            <Button 
              onClick={runComparisonTests}
              disabled={!testScenario || Object.keys(valuesVariants).length === 0 || selectedModels.length === 0 || isTesting}
              className="w-full"
            >
              {isTesting ? 'Running Tests...' : 'Run Alignment Tests'}
            </Button>
            
            {isTesting && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Testing {Object.keys(valuesVariants).length} variants × {selectedModels.length} models
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Matrix */}
        {comparisonResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison Results Matrix</CardTitle>
              <p className="text-sm text-muted-foreground">
                Alignment scores (higher = better match with expected behavior)
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-3 border-b">Construction Path</th>
                      {selectedModels.map(modelId => {
                        const model = LLM_MODELS.find(m => m.id === modelId);
                        return (
                          <th key={modelId} className="text-center p-3 border-b min-w-32">
                            {model?.name}
                          </th>
                        );
                      })}
                      <th className="text-center p-3 border-b">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPaths.map(pathId => {
                      const path = CONSTRUCTION_PATHS.find(p => p.id === pathId);
                      const pathScores = selectedModels.map(modelId => getResultScore(pathId, modelId));
                      const avgScore = pathScores.reduce((sum, score) => sum + score, 0) / pathScores.length;
                      
                      return (
                        <tr key={pathId} className="border-b">
                          <td className="p-3 font-medium">{path?.name}</td>
                          {selectedModels.map(modelId => {
                            const score = getResultScore(pathId, modelId);
                            return (
                              <td key={modelId} className="p-3 text-center">
                                <div className={`w-8 h-8 rounded mx-auto flex items-center justify-center text-white text-sm ${getScoreColor(score)}`}>
                                  {score}
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 text-center font-semibold">
                            <div className={`w-8 h-8 rounded mx-auto flex items-center justify-center text-white text-sm ${getScoreColor(avgScore)}`}>
                              {Math.round(avgScore)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Methodology */}
        <Card>
          <CardHeader>
            <CardTitle>Workbench Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Construction Paths</h3>
                <ul className="text-sm space-y-1">
                  <li>• Same response data, different composition approaches</li>
                  <li>• Statistical vs narrative vs minimalist patterns</li>
                  <li>• Framework-centric vs stakeholder-focused organization</li>
                  <li>• LLM-optimized prompt engineering variants</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Testing Matrix</h3>
                <ul className="text-sm space-y-1">
                  <li>• Cross-model comparison (Claude, GPT, Gemini)</li>
                  <li>• Consistent test scenarios across variants</li>
                  <li>• Behavioral alignment scoring</li>
                  <li>• Response coherence and usability metrics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">System Analysis</h3>
                <ul className="text-sm space-y-1">
                  <li>• Moving parts: data → construction → prompting → behavior</li>
                  <li>• Construction efficacy measurement</li>
                  <li>• Model-specific response patterns</li>
                  <li>• Values.md as system prompt optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}