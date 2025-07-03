'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AnalysisStage {
  id: string;
  name: string;
  description: string;
  inputType: string;
  outputType: string;
  position: { x: number; y: number };
  size: number;
  color: string;
  connections: string[];
  metrics?: {
    processed: number;
    accuracy: number;
    throughput: number;
  };
}

interface EthicalTemplate {
  id: string;
  name: string;
  primaryFramework: string;
  targetMotifs: string[];
  complexity: number;
  culturalContext: string[];
  usage: number;
}

// TF-IDF Style Ethical Analysis Pipeline
const analysisStages: AnalysisStage[] = [
  {
    id: 'user_responses',
    name: 'User Responses',
    description: 'Raw user choices (A/B/C/D) with timing and reasoning',
    inputType: 'user_interaction',
    outputType: 'structured_data',
    position: { x: 100, y: 150 },
    size: 80,
    color: '#3b82f6',
    connections: ['choice_mapping'],
    metrics: { processed: 1247, accuracy: 0.98, throughput: 15.3 }
  },
  {
    id: 'choice_mapping',
    name: 'Choice→Motif Mapping',
    description: 'Map user choices to ethical motifs via database join',
    inputType: 'structured_data',
    outputType: 'motif_signals',
    position: { x: 300, y: 150 },
    size: 90,
    color: '#8b5cf6',
    connections: ['tfidf_analysis'],
    metrics: { processed: 1247, accuracy: 0.95, throughput: 12.8 }
  },
  {
    id: 'tfidf_analysis',
    name: 'TF-IDF Motif Weighting',
    description: 'Weight motifs by frequency × domain significance',
    inputType: 'motif_signals',
    outputType: 'weighted_motifs',
    position: { x: 500, y: 150 },
    size: 110,
    color: '#f59e0b',
    connections: ['framework_classification', 'consistency_analysis'],
    metrics: { processed: 856, accuracy: 0.91, throughput: 8.7 }
  },
  {
    id: 'framework_classification',
    name: 'Framework Classification',
    description: 'Group motifs into ethical theories (utilitarian, deontological, etc.)',
    inputType: 'weighted_motifs',
    outputType: 'framework_alignment',
    position: { x: 400, y: 300 },
    size: 95,
    color: '#10b981',
    connections: ['template_selection'],
    metrics: { processed: 856, accuracy: 0.89, throughput: 7.2 }
  },
  {
    id: 'consistency_analysis',
    name: 'Consistency Analysis',
    description: 'Calculate domain-specific pattern consistency',
    inputType: 'weighted_motifs',
    outputType: 'behavioral_patterns',
    position: { x: 600, y: 300 },
    size: 85,
    color: '#ec4899',
    connections: ['template_selection'],
    metrics: { processed: 856, accuracy: 0.87, throughput: 9.1 }
  },
  {
    id: 'template_selection',
    name: 'Template Selection',
    description: 'Choose VALUES.md template based on complexity & framework',
    inputType: 'framework_alignment',
    outputType: 'template_choice',
    position: { x: 500, y: 450 },
    size: 100,
    color: '#6366f1',
    connections: ['values_generation'],
    metrics: { processed: 742, accuracy: 0.93, throughput: 11.5 }
  },
  {
    id: 'values_generation',
    name: 'VALUES.md Generation',
    description: 'Populate template with personalized ethical framework',
    inputType: 'template_choice',
    outputType: 'values_markdown',
    position: { x: 300, y: 600 },
    size: 120,
    color: '#ef4444',
    connections: [],
    metrics: { processed: 742, accuracy: 0.96, throughput: 6.8 }
  }
];

// Available VALUES.md Templates
const ethicalTemplates: EthicalTemplate[] = [
  {
    id: 'libertarian_focused',
    name: 'Autonomy-Centered Template',
    primaryFramework: 'libertarian',
    targetMotifs: ['AUTONOMY_RESPECT', 'INDIVIDUAL_LIBERTY', 'CONSENT_BASED'],
    complexity: 6,
    culturalContext: ['western_liberal', 'individualistic'],
    usage: 34
  },
  {
    id: 'utilitarian_optimized',
    name: 'Consequentialist Template',
    primaryFramework: 'utilitarian',
    targetMotifs: ['UTIL_CALC', 'HARM_MINIMIZE', 'GREATEST_GOOD'],
    complexity: 8,
    culturalContext: ['analytical', 'evidence_based'],
    usage: 28
  },
  {
    id: 'deontological_structured',
    name: 'Duty-Based Template',
    primaryFramework: 'deontological',
    targetMotifs: ['DEONT_ABSOLUTE', 'DUTY_CARE', 'CATEGORICAL_IMPERATIVE'],
    complexity: 7,
    culturalContext: ['traditional', 'rule_based'],
    usage: 22
  },
  {
    id: 'care_ethics_adaptive',
    name: 'Relationship-Centered Template',
    primaryFramework: 'care_ethics',
    targetMotifs: ['CARE_PARTICULAR', 'RELATIONSHIP_PRIORITY', 'EMPATHY_BASED'],
    complexity: 5,
    culturalContext: ['communal', 'relational'],
    usage: 16
  }
];

const PipelineNode = ({ 
  stage, 
  isActive,
  onClick 
}: { 
  stage: AnalysisStage
  isActive: boolean
  onClick: () => void
}) => {
  return (
    <div
      className="absolute cursor-pointer transition-all duration-300 hover:scale-105"
      style={{
        left: stage.position.x,
        top: stage.position.y,
        transform: isActive ? 'scale(1.1)' : 'scale(1)'
      }}
      onClick={onClick}
    >
      {/* Main circle */}
      <div
        className="rounded-full border-4 border-white shadow-lg flex items-center justify-center relative"
        style={{
          width: stage.size,
          height: stage.size,
          backgroundColor: stage.color,
          boxShadow: isActive ? `0 0 20px ${stage.color}` : undefined
        }}
      >
        {/* Processing indicator */}
        <div 
          className="absolute inset-2 rounded-full border-2 border-white opacity-30"
          style={{
            animation: isActive ? 'spin 2s linear infinite' : 'none'
          }}
        />
        
        {/* Metrics overlay */}
        <div className="text-white text-center">
          <div className="text-xs font-bold">{stage.metrics?.processed || 0}</div>
          <div className="text-xs opacity-75">items</div>
        </div>
      </div>
      
      {/* Label */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
        <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-32">
          {stage.name}
        </div>
        {isActive && (
          <div className="mt-1 text-xs text-muted-foreground max-w-48">
            {stage.description}
          </div>
        )}
      </div>
    </div>
  )
}

const PipelineConnection = ({ 
  from, 
  to, 
  isActive 
}: { 
  from: AnalysisStage
  to: AnalysisStage
  isActive: boolean
}) => {
  const startX = from.position.x + from.size / 2
  const startY = from.position.y + from.size / 2
  const endX = to.position.x + to.size / 2
  const endY = to.position.y + to.size / 2
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isActive ? '#3b82f6' : '#6b7280'}
          />
        </marker>
      </defs>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={isActive ? '#3b82f6' : '#6b7280'}
        strokeWidth={isActive ? "3" : "2"}
        markerEnd="url(#arrowhead)"
        strokeDasharray={isActive ? "0" : "5,5"}
        className="transition-all duration-500"
      />
      
      {/* Data flow indicator */}
      {isActive && (
        <circle
          r="4"
          fill="#3b82f6"
          className="animate-pulse"
        >
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={`M${startX},${startY} L${endX},${endY}`}
          />
        </circle>
      )}
    </svg>
  )
}

const TemplateCard = ({ 
  template, 
  isSelected 
}: { 
  template: EthicalTemplate
  isSelected: boolean
}) => {
  return (
    <div 
      className={`p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm">{template.name}</h4>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {template.usage}% usage
        </span>
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        <strong>Framework:</strong> {template.primaryFramework}
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        <strong>Motifs:</strong> {template.targetMotifs.slice(0, 2).join(', ')}
        {template.targetMotifs.length > 2 && '...'}
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Complexity: {template.complexity}/10
        </span>
        <div 
          className="w-16 bg-gray-200 rounded-full h-1"
        >
          <div
            className="bg-blue-500 h-1 rounded-full transition-all"
            style={{ width: `${template.complexity * 10}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPipelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeStage, setActiveStage] = useState<string>('user_responses');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('libertarian_focused');
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/admin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const currentStage = analysisStages.find(s => s.id === activeStage);
  const currentTemplate = ethicalTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ethical Analysis Pipeline
          </h1>
          <p className="text-gray-300 mb-4">
            TF-IDF style analysis: User responses → Motif weighting → Framework classification → VALUES.md templates
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Pipeline Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Animation Speed:</span>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={([value]) => setAnimationSpeed(value)}
                  max={3000}
                  min={500}
                  step={250}
                  className="w-32"
                />
                <span className="text-xs text-gray-400">{(animationSpeed/1000).toFixed(1)}s</span>
              </div>

              <Button 
                onClick={() => setActiveStage('user_responses')}
                variant="outline"
                size="sm"
              >
                🔄 Reset Pipeline
              </Button>

              <Button 
                onClick={() => {
                  const stages = analysisStages.map(s => s.id);
                  const currentIndex = stages.indexOf(activeStage);
                  const nextIndex = (currentIndex + 1) % stages.length;
                  setActiveStage(stages[nextIndex]);
                }}
                variant="default"
                size="sm"
              >
                ▶️ Next Stage
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Pipeline Visualization */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  TF-IDF Ethical Analysis Waterfall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-gray-900 rounded-lg overflow-hidden"
                  style={{ height: '700px' }}
                >
                  {/* Grid background */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,.3) 1px, transparent 0)`,
                      backgroundSize: '30px 30px'
                    }}
                  />

                  {/* Pipeline connections */}
                  {analysisStages.map(stage => 
                    stage.connections.map(connectionId => {
                      const targetStage = analysisStages.find(s => s.id === connectionId);
                      if (!targetStage) return null;
                      
                      return (
                        <PipelineConnection
                          key={`${stage.id}-${connectionId}`}
                          from={stage}
                          to={targetStage}
                          isActive={activeStage === stage.id}
                        />
                      );
                    })
                  )}

                  {/* Pipeline stages */}
                  {analysisStages.map((stage, index) => (
                    <PipelineNode
                      key={stage.id}
                      stage={stage}
                      isActive={activeStage === stage.id}
                      onClick={() => setActiveStage(stage.id)}
                    />
                  ))}

                  {/* Current stage details */}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-75 p-4 rounded-lg max-w-80">
                    <h4 className="text-sm font-bold mb-2 text-yellow-400">
                      Current Stage: {currentStage?.name}
                    </h4>
                    <p className="text-xs text-gray-300 mb-3">
                      {currentStage?.description}
                    </p>
                    
                    {currentStage?.metrics && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Processed:</span>
                          <span className="font-mono">{currentStage.metrics.processed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-mono">{(currentStage.metrics.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Throughput:</span>
                          <span className="font-mono">{currentStage.metrics.throughput.toFixed(1)}/s</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TF-IDF Explanation */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 p-3 rounded-lg max-w-64">
                    <h4 className="text-sm font-bold mb-2 text-blue-400">TF-IDF Weighting</h4>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div><strong>TF:</strong> Motif frequency in responses</div>
                      <div><strong>IDF:</strong> Domain significance weight</div>
                      <div><strong>Score:</strong> TF × IDF = relevance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stage Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Stage Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-400">Input:</div>
                    <div className="font-mono text-xs">{currentStage?.inputType}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Output:</div>
                    <div className="font-mono text-xs">{currentStage?.outputType}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Connections:</div>
                    <div className="text-xs">{currentStage?.connections.length || 0} downstream stages</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VALUES.md Templates */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">VALUES.md Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ethicalTemplates.map((template) => (
                    <div 
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <TemplateCard 
                        template={template}
                        isSelected={selectedTemplate === template.id}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Template Details */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Template Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-gray-400">Primary Framework:</div>
                    <div className="font-medium">{currentTemplate?.primaryFramework}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Target Motifs:</div>
                    <div className="space-y-1">
                      {currentTemplate?.targetMotifs.map(motif => (
                        <div key={motif} className="bg-blue-900 px-2 py-1 rounded text-xs">
                          {motif}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Cultural Context:</div>
                    <div>{currentTemplate?.culturalContext.join(', ')}</div>
                  </div>
                  <div className="pt-2 border-t border-gray-600">
                    <div className="text-center">
                      <span className="text-lg font-bold text-blue-400">
                        {currentTemplate?.usage}%
                      </span>
                      <div className="text-gray-400">Usage Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}