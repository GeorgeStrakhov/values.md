'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Settings, 
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ExperimentState {
  experimentId: string;
  status: 'running' | 'completed' | 'error';
  progress: number;
  totalTasks: number;
  currentTask: string;
  results: any[];
  errors: string[];
  startTime: string;
  duration: number;
}

interface ExperimentConfig {
  sessionId: string;
  openrouterKey?: string;
  models: string[];
  scenarioTypes: string[];
  participantLimit?: number;
}

const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta' }
];

const SCENARIO_TYPES = [
  { id: 'direct', name: 'Direct Replication', description: 'Same scenarios participant completed' },
  { id: 'domain_transfer', name: 'Domain Transfer', description: 'New scenarios in same domains' },
  { id: 'cross_domain', name: 'Cross Domain', description: 'Scenarios from different domains' },
  { id: 'edge_case', name: 'Edge Cases', description: 'Value conflict scenarios' }
];

export default function ExperimentPage() {
  const { data: session } = useSession();
  const [config, setConfig] = useState<ExperimentConfig>({
    sessionId: '',
    openrouterKey: '',
    models: ['anthropic/claude-3.5-sonnet'],
    scenarioTypes: ['direct', 'domain_transfer']
  });
  
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentState | null>(null);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Check for environment API key
  const [hasEnvKey, setHasEnvKey] = useState<boolean | null>(null);
  
  useEffect(() => {
    checkEnvironmentKey();
    loadAvailableSessions();
  }, []);
  
  // Poll experiment status when running
  useEffect(() => {
    if (currentExperiment?.status === 'running') {
      const interval = setInterval(pollExperimentStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [currentExperiment?.experimentId, currentExperiment?.status]);
  
  const checkEnvironmentKey = async () => {
    try {
      const response = await fetch('/api/admin/check-env');
      const data = await response.json();
      setHasEnvKey(data.hasOpenRouterKey);
    } catch (error) {
      setHasEnvKey(false);
    }
  };
  
  const loadAvailableSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      if (response.ok) {
        const data = await response.json();
        setAvailableSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };
  
  const startExperiment = async () => {
    if (!config.sessionId) {
      alert('Please select a participant session');
      return;
    }
    
    if (!hasEnvKey && !config.openrouterKey) {
      alert('Please provide an OpenRouter API key');
      return;
    }
    
    setIsStarting(true);
    
    try {
      const response = await fetch('/api/admin/run-experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCurrentExperiment({
          experimentId: data.experimentId,
          status: 'running',
          progress: 0,
          totalTasks: 0,
          currentTask: 'Starting...',
          results: [],
          errors: [],
          startTime: new Date().toISOString(),
          duration: 0
        });
      } else {
        alert(`Failed to start experiment: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to start experiment');
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };
  
  const pollExperimentStatus = async () => {
    if (!currentExperiment?.experimentId) return;
    
    try {
      const response = await fetch(`/api/admin/run-experiment?experimentId=${currentExperiment.experimentId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentExperiment(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error('Failed to poll experiment status:', error);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Alignment Experiment Runner</h1>
          <p className="text-muted-foreground">
            Run controlled A/B experiments comparing AI model decisions with and without personalized VALUES.md profiles across multiple scenarios and domains.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Experiment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Status */}
              <div className="space-y-2">
                <Label>OpenRouter API Key Status</Label>
                <div className="flex items-center gap-2">
                  {hasEnvKey === null ? (
                    <Badge variant="secondary">Checking...</Badge>
                  ) : hasEnvKey ? (
                    <Badge className="bg-green-100 text-green-800">✅ Available in Environment</Badge>
                  ) : (
                    <Badge variant="destructive">❌ Not Found in Environment</Badge>
                  )}
                </div>
                
                {!hasEnvKey && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Enter OpenRouter API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-or-v1-..."
                      value={config.openrouterKey || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, openrouterKey: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your key will not be stored and is only used for this experiment session
                    </p>
                  </div>
                )}
              </div>

              {/* Session Selection */}
              <div className="space-y-2">
                <Label htmlFor="sessionId">Participant Session</Label>
                <select
                  id="sessionId"
                  className="w-full p-2 border rounded-md"
                  value={config.sessionId}
                  onChange={(e) => setConfig(prev => ({ ...prev, sessionId: e.target.value }))}
                >
                  <option value="">Select a session...</option>
                  {availableSessions.map(session => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Sessions with completed dilemma responses
                </p>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label>AI Models to Test</Label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map(model => (
                    <label key={model.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.models.includes(model.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({ 
                              ...prev, 
                              models: [...prev.models, model.id] 
                            }));
                          } else {
                            setConfig(prev => ({ 
                              ...prev, 
                              models: prev.models.filter(m => m !== model.id) 
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{model.name}</span>
                      <Badge variant="outline" className="text-xs">{model.provider}</Badge>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scenario Types */}
              <div className="space-y-2">
                <Label>Scenario Types</Label>
                <div className="space-y-2">
                  {SCENARIO_TYPES.map(type => (
                    <label key={type.id} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={config.scenarioTypes.includes(type.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig(prev => ({ 
                              ...prev, 
                              scenarioTypes: [...prev.scenarioTypes, type.id] 
                            }));
                          } else {
                            setConfig(prev => ({ 
                              ...prev, 
                              scenarioTypes: prev.scenarioTypes.filter(s => s !== type.id) 
                            }));
                          }
                        }}
                      />
                      <div>
                        <span className="text-sm font-medium">{type.name}</span>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={startExperiment}
                disabled={isStarting || currentExperiment?.status === 'running'}
                className="w-full"
              >
                {isStarting ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Starting Experiment...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start AI Alignment Experiment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Experiment Status Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Experiment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentExperiment ? (
                <>
                  {/* Status Overview */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(currentExperiment.status)}
                      <span className="font-medium capitalize">{currentExperiment.status}</span>
                    </div>
                    <Badge variant="outline">
                      {currentExperiment.experimentId}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentExperiment.progress}/{currentExperiment.totalTasks}</span>
                    </div>
                    <Progress 
                      value={currentExperiment.totalTasks > 0 ? (currentExperiment.progress / currentExperiment.totalTasks) * 100 : 0} 
                      className="w-full" 
                    />
                  </div>

                  {/* Current Task */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Current Task</Label>
                    <p className="text-sm text-muted-foreground">{currentExperiment.currentTask}</p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm">{formatDuration(currentExperiment.duration)}</p>
                  </div>

                  {/* Results Summary */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Results</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Tests Completed: {currentExperiment.results.length}</div>
                      <div>Errors: {currentExperiment.errors.length}</div>
                    </div>
                  </div>

                  {/* View Results Button */}
                  {currentExperiment.results.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowResults(!showResults)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showResults ? 'Hide' : 'View'} Live Results
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Configure and start an experiment to see real-time progress
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Results Panel */}
        {showResults && currentExperiment && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Live Experiment Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentExperiment.results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{result.model}</Badge>
                        <Badge variant="secondary">{result.scenarioType}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <h4 className="font-medium mb-3">{result.scenario}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Control Result */}
                      <div className="border rounded p-3">
                        <div className="font-medium text-sm mb-2 flex items-center gap-2">
                          Control (No Values.md)
                          <Badge variant="outline" className="text-xs">
                            Choice: {result.control.choice}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.control.reasoning.substring(0, 150)}...
                        </p>
                      </div>
                      
                      {/* Treatment Result */}
                      <div className="border rounded p-3">
                        <div className="font-medium text-sm mb-2 flex items-center gap-2">
                          Treatment (With Values.md)
                          <Badge variant="outline" className="text-xs">
                            Choice: {result.treatment.choice}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.treatment.reasoning.substring(0, 150)}...
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {currentExperiment.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Errors</h4>
                    {currentExperiment.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}