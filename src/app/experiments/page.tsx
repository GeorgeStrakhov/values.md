'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import DataSelectionWidget from '@/components/data-selection-widget';

interface Experiment {
  id: string;
  title: string;
  description: string;
  status: 'conceptual' | 'proposed' | 'pilot' | 'active' | 'running';
  domain: string;
  participants?: number;
  hypothesis: string;
  expectedOutcome: string;
  applications: string[];
  runnable?: boolean;
  apiEndpoint?: string;
}

interface ExperimentRun {
  id: string;
  experimentId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  results?: any;
  progress?: number;
}

const gedankenExperiments: Experiment[] = [
  {
    id: 'cultural-adaptation',
    title: 'Cross-Cultural Values Mapping',
    description: 'How do ethical preferences vary across cultural contexts? Can we generate culturally-adapted values.md files?',
    status: 'proposed',
    domain: 'anthropology',
    hypothesis: 'Different cultural backgrounds will show systematic variations in motif preferences, particularly around individual vs. collective values',
    expectedOutcome: 'Cultural value signatures that enable context-aware AI alignment',
    applications: ['Global AI deployment', 'Cultural sensitivity training', 'International policy AI']
  },
  {
    id: 'temporal-consistency',
    title: 'Values Stability Over Time',
    description: 'Do personal values remain consistent? How do life events affect ethical preferences?',
    status: 'conceptual',
    domain: 'psychology',
    hypothesis: 'Core values remain stable (~80% consistency) but priority rankings shift with major life events',
    expectedOutcome: 'Dynamic values.md files that adapt to life changes while maintaining ethical core',
    applications: ['Personal AI assistants', 'Long-term decision support', 'Life coaching AI']
  },
  {
    id: 'ai-human-divergence',
    title: 'AI-Human Ethical Alignment Gaps',
    description: 'Where do LLMs systematically differ from human moral reasoning? Can we close these gaps?',
    status: 'active',
    domain: 'ai-safety',
    participants: 150,
    hypothesis: 'LLMs show systematic bias toward utilitarian calculations and struggle with contextual care ethics',
    expectedOutcome: 'Targeted training data for improving AI moral reasoning alignment',
    applications: ['LLM fine-tuning', 'AI safety research', 'Ethical AI development'],
    runnable: true,
    apiEndpoint: '/api/experiments/alignment'
  },
  {
    id: 'professional-adaptation',
    title: 'Domain-Specific Professional Ethics',
    description: 'How do professional contexts shape ethical reasoning? Can we generate role-specific values.md files?',
    status: 'active',
    domain: 'professional-ethics',
    participants: 300,
    hypothesis: 'Professional training creates systematic ethical pattern shifts while preserving personal core values',
    expectedOutcome: 'Professional values.md templates for context-aware workplace AI',
    applications: ['Corporate AI assistants', 'Professional decision support', 'Ethics training'],
    runnable: true,
    apiEndpoint: '/api/experiments/run'
  },
  {
    id: 'collective-intelligence',
    title: 'Group Values Emergence',
    description: 'How do teams develop shared ethical frameworks? Can we generate collective values.md files?',
    status: 'conceptual',
    domain: 'social-psychology',
    hypothesis: 'Group values emerge through negotiation of individual frameworks, showing hybrid patterns',
    expectedOutcome: 'Methods for generating team-level values.md files for collaborative AI',
    applications: ['Team decision support', 'Organizational AI', 'Democratic AI governance']
  },
  {
    id: 'developmental-ethics',
    title: 'Ethical Development Across Lifespan',
    description: 'How do moral reasoning patterns change from childhood through aging? What are the implications for AI?',
    status: 'proposed',
    domain: 'developmental-psychology',
    hypothesis: 'Ethical complexity increases with age, showing shifts from rule-based to contextual reasoning',
    expectedOutcome: 'Age-appropriate values.md generation and AI interaction patterns',
    applications: ['Educational AI', 'Elder care AI', 'Child-safe AI systems']
  }
];

const researchStatistics = {
  totalDilemmas: 100,
  totalFrameworks: 20,
  totalMotifs: 18,
  averageDifficulty: 6.9,
  domainCoverage: 9,
  validationScore: 67,
  userJourneySuccess: 80,
  generationCapacity: 'Unlimited',
  averageSessionTime: '15-20 minutes',
  valuesConsistency: '85%'
};

const futureApplications = [
  {
    category: 'Personal AI',
    applications: [
      'Personalized decision support systems',
      'Values-aligned personal assistants',
      'Ethical reasoning tutors',
      'Life coaching and goal alignment'
    ]
  },
  {
    category: 'Organizational AI',
    applications: [
      'Corporate decision-making systems',
      'HR and hiring algorithm alignment',
      'Values-based team formation',
      'Ethical compliance monitoring'
    ]
  },
  {
    category: 'Societal AI',
    applications: [
      'Democratic participation platforms',
      'Policy analysis and recommendation',
      'Cultural preservation systems',
      'Global cooperation frameworks'
    ]
  },
  {
    category: 'AI Safety & Research',
    applications: [
      'LLM alignment benchmarking',
      'Ethical training data generation',
      'AI safety evaluation frameworks',
      'Human-AI collaboration protocols'
    ]
  }
];

export default function ExperimentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [runningExperiments, setRunningExperiments] = useState<Map<string, ExperimentRun>>(new Map());
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [selectedExperiments, setSelectedExperiments] = useState<Set<string>>(new Set());
  const [batchRunning, setBatchRunning] = useState<boolean>(false);
  const [availableData, setAvailableData] = useState<any[]>([]);
  const [dataSelectionConfig, setDataSelectionConfig] = useState<any>(null);
  
  const filteredExperiments = selectedCategory === 'all' 
    ? gedankenExperiments 
    : gedankenExperiments.filter(exp => exp.status === selectedCategory);

  // Check for active sessions and load available data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check active sessions
        const sessionsResponse = await fetch('/api/admin/sessions');
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setRealTimeData(sessionsData);
        }

        // Load available experiment data
        const dataResponse = await fetch('/api/admin/available-data');
        if (dataResponse.ok) {
          const dataResult = await dataResponse.json();
          setAvailableData(dataResult.data || []);
          console.log(`📊 Loaded ${dataResult.data?.length || 0} available sessions for experiments`);
        }
      } catch (error) {
        console.log('Data fetch failed:', error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const runExperiment = async (experiment: Experiment) => {
    if (!experiment.runnable || !experiment.apiEndpoint) return;
    
    const runId = `run_${Date.now()}`;
    const experimentRun: ExperimentRun = {
      id: runId,
      experimentId: experiment.id,
      status: 'running',
      startTime: new Date().toISOString(),
      progress: 0
    };
    
    setRunningExperiments(prev => new Map(prev.set(experiment.id, experimentRun)));
    
    try {
      // Use selected data configuration
      let requestBody: any = { 
        experimentType: 'comprehensive_alignment',
        dataSelection: dataSelectionConfig
      };
      
      if (dataSelectionConfig?.selectedSessions?.length > 0) {
        // Use configured data selection
        requestBody.selectedSessions = dataSelectionConfig.selectedSessions;
        requestBody.samplingConfig = {
          difficultyRange: dataSelectionConfig.difficultyRange,
          motifFilter: dataSelectionConfig.motifFilter,
          domainFilter: dataSelectionConfig.domainFilter,
          burstiness: dataSelectionConfig.burstiness
        };
      } else if (realTimeData?.sessions?.length > 0) {
        // Fallback to live sessions
        requestBody.sessionId = realTimeData.sessions[0].sessionId;
      } else {
        // Final fallback to research sessions
        requestBody.selectedSessions = ['research_001', 'research_002', 'research_003'];
      }
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setRunningExperiments(prev => {
          const current = prev.get(experiment.id);
          if (current && current.progress < 90) {
            const updated = { ...current, progress: Math.min(90, current.progress + Math.random() * 20 * simulationSpeed) };
            return new Map(prev.set(experiment.id, updated));
          }
          return prev;
        });
      }, 1000);
      
      const response = await fetch(experiment.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      clearInterval(progressInterval);
      
      const results = await response.json();
      
      const completedRun: ExperimentRun = {
        ...experimentRun,
        status: response.ok ? 'completed' : 'failed',
        endTime: new Date().toISOString(),
        results,
        progress: 100
      };
      
      setRunningExperiments(prev => new Map(prev.set(experiment.id, completedRun)));
      
    } catch (error) {
      const failedRun: ExperimentRun = {
        ...experimentRun,
        status: 'failed',
        endTime: new Date().toISOString(),
        results: { error: String(error) },
        progress: 100
      };
      
      setRunningExperiments(prev => new Map(prev.set(experiment.id, failedRun)));
    }
  };

  const toggleExperimentSelection = (experimentId: string) => {
    const newSelected = new Set(selectedExperiments);
    if (newSelected.has(experimentId)) {
      newSelected.delete(experimentId);
    } else {
      newSelected.add(experimentId);
    }
    setSelectedExperiments(newSelected);
  };

  const runSelectedExperiments = async () => {
    if (selectedExperiments.size === 0) return;
    
    setBatchRunning(true);
    const experiments = gedankenExperiments.filter(e => 
      selectedExperiments.has(e.id) && e.runnable
    );
    
    console.log(`🔬 Running batch of ${experiments.length} experiments`);
    
    // Run experiments sequentially to avoid overwhelming the system
    for (const experiment of experiments) {
      await runExperiment(experiment);
      // Small delay between experiments
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setBatchRunning(false);
    setSelectedExperiments(new Set()); // Clear selections after batch run
  };

  const selectAllRunnable = () => {
    const runnableIds = gedankenExperiments
      .filter(e => e.runnable)
      .map(e => e.id);
    setSelectedExperiments(new Set(runnableIds));
  };

  const clearSelections = () => {
    setSelectedExperiments(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conceptual': return 'bg-gray-100 text-gray-800';
      case 'proposed': return 'bg-blue-100 text-blue-800';
      case 'pilot': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRunStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Research Experiments</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live experiments for advancing the values.md project
          </p>
          
          {/* Real-time Status */}
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${realTimeData ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>Live Data {realTimeData ? 'Connected' : 'Simulated'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>{realTimeData?.sessions?.length || 0} Active Sessions</span>
            </div>
          </div>
        </div>

        {/* Data Selection Widget */}
        <DataSelectionWidget 
          availableData={availableData}
          onConfigChange={setDataSelectionConfig}
        />

        {/* Experiment Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Experiment Control Panel</CardTitle>
            <p className="text-sm text-muted-foreground">
              Run experiments with configured data selection and real LLM analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Simulation Speed</h3>
                <p className="text-sm text-muted-foreground">Control experiment execution speed</p>
              </div>
              <div className="w-48">
                <Slider
                  value={[simulationSpeed]}
                  onValueChange={(value) => setSimulationSpeed(value[0])}
                  min={0.5}
                  max={3}
                  step={0.5}
                  className="w-full"
                />
                <div className="text-xs text-center mt-1">{simulationSpeed}x speed</div>
              </div>
            </div>
            
            {/* Experiment Selection Controls */}
            <div className="flex items-center justify-between">
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllRunnable}
                  disabled={batchRunning}
                >
                  Select All Runnable
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSelections}
                  disabled={batchRunning || selectedExperiments.size === 0}
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedExperiments.size} selected
                </span>
                <Button
                  onClick={runSelectedExperiments}
                  disabled={selectedExperiments.size === 0 || batchRunning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {batchRunning ? 'Running Batch...' : `Run ${selectedExperiments.size} Experiments`}
                </Button>
              </div>
            </div>
            
            {runningExperiments.size > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Running Experiments</h3>
                {Array.from(runningExperiments.entries()).map(([expId, run]) => (
                  <div key={expId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{gedankenExperiments.find(e => e.id === expId)?.title}</span>
                      <div className={`text-sm ${getRunStatusColor(run.status)}`}>
                        {run.status === 'running' ? `${Math.round(run.progress || 0)}% complete` : run.status}
                      </div>
                    </div>
                    {run.status === 'running' && (
                      <Progress value={run.progress || 0} className="w-24 h-2" />
                    )}
                    {run.status === 'completed' && run.results && (
                      <div className="text-xs text-green-600">
                        {run.results.summary ? 
                          `Avg alignment: ${Math.round(run.results.summary.averageAlignment * 100)}%` :
                          'Completed successfully'
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.totalDilemmas}</div>
                <div className="text-sm text-muted-foreground">Ethical Dilemmas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.totalFrameworks}</div>
                <div className="text-sm text-muted-foreground">Ethical Frameworks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.totalMotifs}</div>
                <div className="text-sm text-muted-foreground">Moral Motifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.domainCoverage}</div>
                <div className="text-sm text-muted-foreground">Domains</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{researchStatistics.generationCapacity}</div>
                <div className="text-sm text-muted-foreground">AI Generation</div>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Platform Validation Score</span>
                  <span>{researchStatistics.validationScore}%</span>
                </div>
                <Progress value={researchStatistics.validationScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>User Journey Success Rate</span>
                  <span>{researchStatistics.userJourneySuccess}%</span>
                </div>
                <Progress value={researchStatistics.userJourneySuccess} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Values Consistency</span>
                  <span>{researchStatistics.valuesConsistency}</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experiment Filters */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All Experiments
          </Button>
          <Button 
            variant={selectedCategory === 'active' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('active')}
          >
            Active
          </Button>
          <Button 
            variant={selectedCategory === 'pilot' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('pilot')}
          >
            Pilot
          </Button>
          <Button 
            variant={selectedCategory === 'proposed' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('proposed')}
          >
            Proposed
          </Button>
          <Button 
            variant={selectedCategory === 'conceptual' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('conceptual')}
          >
            Conceptual
          </Button>
        </div>

        {/* Experiments Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredExperiments.map((experiment) => {
            const isSelected = selectedExperiments.has(experiment.id);
            const isRunning = runningExperiments.has(experiment.id) && runningExperiments.get(experiment.id)?.status === 'running';
            
            return (
            <Card 
              key={experiment.id} 
              className={`h-full transition-all cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 
                experiment.runnable ? 'hover:shadow-md hover:ring-1 hover:ring-gray-300' : ''
              } ${isRunning ? 'ring-2 ring-orange-500 bg-orange-50/30' : ''}`}
              onClick={() => experiment.runnable && toggleExperimentSelection(experiment.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {experiment.runnable && (
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // Handled by card click
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    )}
                    <CardTitle className="text-lg">{experiment.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(experiment.status)}>
                      {isRunning ? 'running' : experiment.status}
                    </Badge>
                    {experiment.runnable && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        runnable
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="outline">{experiment.domain}</Badge>
                {experiment.participants && (
                  <div className="text-sm text-muted-foreground">
                    {experiment.participants} participants
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{experiment.description}</p>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1">Hypothesis</h4>
                  <p className="text-sm text-muted-foreground">{experiment.hypothesis}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1">Expected Outcome</h4>
                  <p className="text-sm text-muted-foreground">{experiment.expectedOutcome}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-1">Applications</h4>
                  <div className="flex flex-wrap gap-1">
                    {experiment.applications.slice(0, 3).map((app, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                    {experiment.applications.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{experiment.applications.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Run Experiment Button */}
                {experiment.runnable && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {runningExperiments.has(experiment.id) ? 
                          `Status: ${runningExperiments.get(experiment.id)?.status}` :
                          'Ready to run'
                        }
                      </div>
                      <Button
                        size="sm"
                        onClick={() => runExperiment(experiment)}
                        disabled={runningExperiments.has(experiment.id) && runningExperiments.get(experiment.id)?.status === 'running'}
                        className="ml-2"
                      >
                        {runningExperiments.has(experiment.id) && runningExperiments.get(experiment.id)?.status === 'running' ? 
                          'Running...' : 
                          'Run Experiment'
                        }
                      </Button>
                    </div>
                    
                    {runningExperiments.has(experiment.id) && runningExperiments.get(experiment.id)?.results && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <div className="font-medium text-green-600 mb-1">
                          ✅ Experiment completed successfully
                        </div>
                        {runningExperiments.get(experiment.id)?.results?.summary && (
                          <div className="space-y-1">
                            <div>Average Alignment: {Math.round(runningExperiments.get(experiment.id)?.results?.summary?.averageAlignment * 100)}%</div>
                            <div>Best Model: {runningExperiments.get(experiment.id)?.results?.summary?.bestModel}</div>
                            <div>Primary Motif: {runningExperiments.get(experiment.id)?.results?.summary?.primaryMotif}</div>
                            <div>Responses Analyzed: {runningExperiments.get(experiment.id)?.results?.responseCount}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Future Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Future Applications & Growth</CardTitle>
            <p className="text-muted-foreground">
              Potential applications of the values.md framework across domains
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {futureApplications.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary">{category.category}</h3>
                  <ul className="space-y-2">
                    {category.applications.map((app, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Research Methodology */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Research Methodology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Data Collection</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Privacy-first anonymous sessions</li>
                  <li>• Structured ethical dilemma responses</li>
                  <li>• Difficulty perception metrics</li>
                  <li>• Optional demographic data</li>
                  <li>• Reasoning text analysis</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Analysis Framework</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Motif frequency analysis</li>
                  <li>• Framework alignment scoring</li>
                  <li>• Difficulty-weighted preferences</li>
                  <li>• Conflict and synergy detection</li>
                  <li>• Consistency measurement</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Validation Methods</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Test-retest reliability</li>
                  <li>• Cross-cultural validation</li>
                  <li>• Expert review panels</li>
                  <li>• AI-human comparison studies</li>
                  <li>• Longitudinal tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-primary/5">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Contribute to Research</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Run live experiments using pre-contributed research data or contribute your own responses
              to advance the values.md project.
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/explore/DM001">Start Dilemma Session</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/results">Generate Values.md</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://github.com/GeorgeStrakhov/values.md" target="_blank">
                  Contribute Code
                </a>
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex justify-center gap-8">
                <div>📊 Pre-seeded research sessions available</div>
                <div>🧪 {gedankenExperiments.filter(e => e.runnable).length} runnable experiments</div>
                <div>🤖 {realTimeData?.sessions?.length || 0} live sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}