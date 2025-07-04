'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

interface DataStratum {
  id: string
  name: string
  type: 'framework' | 'motif' | 'response' | 'analysis' | 'synthesis'
  color: string
  data: any[]
}

interface DataFlow {
  id: string
  source: string
  target: string
  data: any
  active: boolean
}

const ValuesWaterfallPage = () => {
  const [currentStage, setCurrentStage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2000)
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([])
  const [activeDatum, setActiveDatum] = useState<any>(null)

  // Sample data representing actual database content
  const sampleUserResponses = [
    { id: 'resp-1', dilemmaTitle: 'Autonomous Vehicle Dilemma', choice: 'B', motif: 'HARM_MINIMIZE', reasoning: 'Protecting vulnerable pedestrians must be the priority', difficulty: 7 },
    { id: 'resp-2', dilemmaTitle: 'Medical Resource Allocation', choice: 'A', motif: 'UTIL_CALC', reasoning: 'Save the most lives with available resources', difficulty: 8 },
    { id: 'resp-3', dilemmaTitle: 'Privacy vs Security', choice: 'C', motif: 'AUTONOMY_RESPECT', reasoning: 'Individual privacy rights cannot be violated', difficulty: 6 }
  ]

  const sampleMotifs = [
    { id: 'HARM_MINIMIZE', name: 'Harm Minimization', category: 'harm_principle', weight: 0.35, frequency: 5 },
    { id: 'UTIL_CALC', name: 'Utilitarian Calculation', category: 'consequentialism', weight: 0.28, frequency: 4 },
    { id: 'AUTONOMY_RESPECT', name: 'Autonomy Respect', category: 'autonomy', weight: 0.22, frequency: 3 }
  ]

  const sampleFrameworks = [
    { id: 'consequentialist', name: 'Consequentialist Ethics', tradition: 'consequentialism', percentage: 35 },
    { id: 'deontological', name: 'Deontological Ethics', tradition: 'deontological', percentage: 28 },
    { id: 'care_ethics', name: 'Care Ethics', tradition: 'care_ethics', percentage: 22 }
  ]

  // Data strata layers
  const dataStrata: DataStratum[] = [
    { id: 'responses', name: 'User Responses', type: 'response', color: 'bg-blue-100', data: sampleUserResponses },
    { id: 'motifs', name: 'Ethical Motifs', type: 'motif', color: 'bg-purple-100', data: sampleMotifs },
    { id: 'frameworks', name: 'Ethical Frameworks', type: 'framework', color: 'bg-green-100', data: sampleFrameworks },
    { id: 'analysis', name: 'Statistical Analysis', type: 'analysis', color: 'bg-orange-100', data: [] },
    { id: 'synthesis', name: 'VALUES.md Synthesis', type: 'synthesis', color: 'bg-pink-100', data: [] }
  ]

  // Analysis stages showing actual data transformation
  const analysisStages = [
    {
      id: 'data_ingestion',
      name: 'Data Ingestion',
      description: 'Collect raw user responses from localStorage and database',
      activeStratum: 'responses',
      dataTransform: 'Raw responses → Structured data'
    },
    {
      id: 'motif_mapping',
      name: 'Motif Mapping',
      description: 'Map chosen options to underlying ethical motifs',
      activeStratum: 'motifs',
      dataTransform: 'Choices → Motif frequencies'
    },
    {
      id: 'framework_weaving',
      name: 'Framework Weaving',
      description: 'Weave motifs into coherent ethical frameworks',
      activeStratum: 'frameworks',
      dataTransform: 'Motif patterns → Framework alignments'
    },
    {
      id: 'statistical_computation',
      name: 'Statistical Computation',
      description: 'Generate real metrics from response patterns',
      activeStratum: 'analysis',
      dataTransform: 'Framework data → Statistical profiles'
    },
    {
      id: 'template_selection',
      name: 'Template Selection',
      description: 'Choose optimal VALUES.md template based on analysis',
      activeStratum: 'synthesis',
      dataTransform: 'Analysis → Template choice'
    },
    {
      id: 'markdown_generation',
      name: 'Markdown Generation',
      description: 'Synthesize final VALUES.md document',
      activeStratum: 'synthesis',
      dataTransform: 'All data → VALUES.md document'
    }
  ]

  // Playback logic with data flow animation
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStage < analysisStages.length - 1) {
          setCurrentStage(currentStage + 1)
          // Animate data flowing through strata
          const currentStageData = analysisStages[currentStage]
          const stratum = dataStrata.find(s => s.id === currentStageData.activeStratum)
          if (stratum && stratum.data.length > 0) {
            setActiveDatum(stratum.data[Math.floor(Math.random() * stratum.data.length)])
          }
        } else {
          setIsPlaying(false)
        }
      }, speed)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStage, speed, analysisStages, dataStrata])

  const currentAnalysis = analysisStages[currentStage]

  const getStageStatus = (index: number) => {
    if (index < currentStage) return 'completed'
    if (index === currentStage) return 'active'
    return 'pending'
  }

  const getStratumOpacity = (stratumId: string) => {
    if (!currentAnalysis) return 0.3
    return currentAnalysis.activeStratum === stratumId ? 1 : 0.3
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Values.md Analysis Waterfall
          </h1>
          <p className="text-muted-foreground text-lg">
            Watch how responses flow through ethical framework analysis to create personalized VALUES.md
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analysis Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Button 
                onClick={() => setIsPlaying(!isPlaying)}
                variant={isPlaying ? "destructive" : "default"}
              >
                {isPlaying ? 'Pause' : 'Start Analysis'}
              </Button>
              <Button 
                onClick={() => {setCurrentStage(0); setIsPlaying(false)}} 
                variant="outline"
              >
                Reset
              </Button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Speed:</span>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  max={2000}
                  min={500}
                  step={250}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">{(speed/1000).toFixed(1)}s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Data Strata Visualization */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Data Waterfall: Weaving Responses into VALUES.md</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentAnalysis.name} - {currentAnalysis.dataTransform}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Data Strata */}
                  <div className="relative">
                    {dataStrata.map((stratum, index) => (
                      <div key={stratum.id} className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${stratum.color.replace('bg-', 'bg-').replace('-100', '-500')}`}></div>
                          <h3 className="font-semibold text-sm">{stratum.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {stratum.type}
                          </Badge>
                        </div>
                        
                        {/* Stratum Container */}
                        <div className={`
                          ${stratum.color} border rounded-lg p-4 transition-all duration-500
                          ${getStratumOpacity(stratum.id) === 1 ? 'ring-2 ring-primary/20' : ''}
                        `}
                        style={{ opacity: getStratumOpacity(stratum.id) }}>
                          {/* Data Visualization */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stratum.data.map((datum, dataIndex) => (
                              <div key={dataIndex} className={`
                                bg-white/70 rounded border p-3 text-xs transition-all duration-300
                                ${activeDatum?.id === datum.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                              `}>
                                {stratum.type === 'response' && (
                                  <div>
                                    <div className="font-medium text-blue-700 mb-1">{datum.dilemmaTitle}</div>
                                    <div className="text-gray-600">Choice: {datum.choice} → {datum.motif}</div>
                                    <div className="text-gray-500 mt-1 text-[10px]">{datum.reasoning?.substring(0, 40)}...</div>
                                  </div>
                                )}
                                {stratum.type === 'motif' && (
                                  <div>
                                    <div className="font-medium text-purple-700 mb-1">{datum.name}</div>
                                    <div className="text-gray-600">Weight: {datum.weight}</div>
                                    <div className="text-gray-500">Used: {datum.frequency}x</div>
                                  </div>
                                )}
                                {stratum.type === 'framework' && (
                                  <div>
                                    <div className="font-medium text-green-700 mb-1">{datum.name}</div>
                                    <div className="text-gray-600">{datum.percentage}% alignment</div>
                                    <div className="text-gray-500">{datum.tradition}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Data Flow Animation */}
                          {currentAnalysis.activeStratum === stratum.id && isPlaying && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Processing {stratum.data.length} data points...</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Flow Arrow */}
                        {index < dataStrata.length - 1 && (
                          <div className="flex justify-center my-2">
                            <div className={`
                              w-0.5 h-6 transition-all duration-300
                              ${currentStage > index ? 'bg-primary' : 'bg-border'}
                            `}></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* VALUES.md Construction */}
                  {currentStage >= 4 && (
                    <div className="mt-8 p-6 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        📄 VALUES.md Being Constructed
                      </h3>
                      <div className="space-y-3 text-sm font-mono">
                        <div className="bg-white/70 p-3 rounded border">
                          <div className="text-green-600"># My Values</div>
                          <div className="text-gray-600 mt-1">## Core Ethical Framework</div>
                          <div className="text-gray-500 mt-1">Based on {sampleUserResponses.length} responses...</div>
                        </div>
                        <div className="bg-white/70 p-3 rounded border">
                          <div className="text-purple-600">## Decision-Making Patterns</div>
                          <div className="text-gray-600 mt-1">Primary motifs: {sampleMotifs.slice(0, 2).map(m => m.name).join(', ')}</div>
                        </div>
                        <div className="bg-white/70 p-3 rounded border">
                          <div className="text-blue-600">## Framework Alignment</div>
                          <div className="text-gray-600 mt-1">{sampleFrameworks[0].name}: {sampleFrameworks[0].percentage}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Pipeline */}
          <div className="space-y-4">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Analysis Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Stage</span>
                    <span className="font-medium">{currentStage + 1}/{analysisStages.length}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStage + 1) / analysisStages.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Data */}
            {activeDatum && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Data Point</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {activeDatum.dilemmaTitle && (
                      <div>
                        <div className="font-medium text-blue-700">{activeDatum.dilemmaTitle}</div>
                        <div className="text-gray-600">Choice: {activeDatum.choice} → {activeDatum.motif}</div>
                        <div className="text-gray-500 text-xs mt-1">{activeDatum.reasoning}</div>
                      </div>
                    )}
                    {activeDatum.name && (
                      <div>
                        <div className="font-medium text-purple-700">{activeDatum.name}</div>
                        <div className="text-gray-600">Weight: {activeDatum.weight}</div>
                        <div className="text-gray-500">Category: {activeDatum.category}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Process Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisStages.map((stage, index) => (
                    <div key={stage.id} className={`
                      flex items-center gap-2 p-2 rounded text-sm transition-all
                      ${index === currentStage ? 'bg-primary/10 border border-primary/20' : ''}
                      ${index < currentStage ? 'text-muted-foreground' : ''}
                    `}>
                      <div className={`
                        w-2 h-2 rounded-full
                        ${index < currentStage ? 'bg-green-500' : index === currentStage ? 'bg-primary animate-pulse' : 'bg-gray-300'}
                      `}></div>
                      <span className="font-medium">{stage.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValuesWaterfallPage