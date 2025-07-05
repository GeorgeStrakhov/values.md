'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { useDilemmaStore } from '@/store/dilemma-store'
import { combinatorialGenerator, type ResponsePattern } from '@/lib/combinatorial-values-generator'

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

interface SubsequenceSelection {
  start: number
  end: number
  selected: boolean
}

interface GenerationResult {
  id: string
  name: string
  subsequence: { start: number; end: number }
  valuesMarkdown: string
  profile: any
  timestamp: Date
  status: 'generating' | 'complete' | 'error'
}

const ValuesWaterfallPage = () => {
  const [currentStage, setCurrentStage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2000)
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([])
  const [activeDatum, setActiveDatum] = useState<any>(null)
  
  // Subsequence selection state
  const [responses, setResponses] = useState<ResponsePattern[]>([])
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 })
  const [isSelecting, setIsSelecting] = useState(false)
  
  // Results comparison state
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([])
  const [activeResultIndex, setActiveResultIndex] = useState<number | null>(null)
  
  // Get actual user responses from store
  const dilemmaStore = useDilemmaStore()

  // Convert store responses to ResponsePattern format
  useEffect(() => {
    const storeResponses = dilemmaStore.responses
    const converted: ResponsePattern[] = storeResponses.map((response, index) => ({
      chosenOption: response.chosenOption,
      motif: inferMotifFromChoice(response.chosenOption, response.reasoning),
      domain: 'general', // Could be enhanced with dilemma domain mapping
      difficulty: response.perceivedDifficulty,
      reasoning: response.reasoning,
      responseTime: response.responseTime
    }))
    setResponses(converted)
    if (converted.length > 0) {
      setSelectedRange({ start: 0, end: Math.min(converted.length - 1, 11) }) // Default to first 12 responses
    }
  }, [dilemmaStore.responses])
  
  // Sample data for demonstration when no real responses
  const sampleUserResponses = responses.length > 0 ? responses : [
    { chosenOption: 'B', motif: 'HARM_MINIMIZE', domain: 'autonomous_vehicles', difficulty: 7, reasoning: 'Protecting vulnerable pedestrians must be the priority' },
    { chosenOption: 'A', motif: 'UTIL_CALC', domain: 'medical_ethics', difficulty: 8, reasoning: 'Save the most lives with available resources' },
    { chosenOption: 'C', motif: 'AUTONOMY_RESPECT', domain: 'privacy', difficulty: 6, reasoning: 'Individual privacy rights cannot be violated' },
    { chosenOption: 'A', motif: 'RULES_FIRST', domain: 'business_ethics', difficulty: 5, reasoning: 'Following established protocols ensures fairness' },
    { chosenOption: 'B', motif: 'PERSON_FIRST', domain: 'social_justice', difficulty: 9, reasoning: 'The human impact must be our primary consideration' },
    { chosenOption: 'D', motif: 'PROCESS_FIRST', domain: 'governance', difficulty: 4, reasoning: 'Transparent processes build trust' },
    { chosenOption: 'C', motif: 'SAFETY_FIRST', domain: 'environmental', difficulty: 8, reasoning: 'Preventing catastrophic outcomes takes priority' },
    { chosenOption: 'A', motif: 'NUMBERS_FIRST', domain: 'resource_allocation', difficulty: 6, reasoning: 'Data-driven decisions yield better outcomes' }
  ]
  
  // Helper function to infer motif from choice and reasoning
  function inferMotifFromChoice(choice: string, reasoning: string): string {
    const reasoningLower = reasoning.toLowerCase()
    if (reasoningLower.includes('harm') || reasoningLower.includes('protect')) return 'HARM_MINIMIZE'
    if (reasoningLower.includes('most') || reasoningLower.includes('greatest') || reasoningLower.includes('benefit')) return 'UTIL_CALC'
    if (reasoningLower.includes('rights') || reasoningLower.includes('autonomy') || reasoningLower.includes('choice')) return 'AUTONOMY_RESPECT'
    if (reasoningLower.includes('rule') || reasoningLower.includes('principle') || reasoningLower.includes('duty')) return 'RULES_FIRST'
    if (reasoningLower.includes('people') || reasoningLower.includes('human') || reasoningLower.includes('relationship')) return 'PERSON_FIRST'
    if (reasoningLower.includes('process') || reasoningLower.includes('procedure') || reasoningLower.includes('fair')) return 'PROCESS_FIRST'
    if (reasoningLower.includes('safe') || reasoningLower.includes('risk') || reasoningLower.includes('prevent')) return 'SAFETY_FIRST'
    if (reasoningLower.includes('data') || reasoningLower.includes('number') || reasoningLower.includes('measure')) return 'NUMBERS_FIRST'
    return 'BALANCED'
  }

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

  // Generate VALUES.md for selected subsequence
  const generateValuesForSubsequence = async (start: number, end: number, name?: string) => {
    const subsequenceResponses = sampleUserResponses.slice(start, end + 1)
    const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    
    // Add pending result
    const newResult: GenerationResult = {
      id: resultId,
      name: name || `Responses ${start + 1}-${end + 1}`,
      subsequence: { start, end },
      valuesMarkdown: '',
      profile: null,
      timestamp: new Date(),
      status: 'generating'
    }
    
    setGenerationResults(prev => [...prev, newResult])
    setActiveResultIndex(generationResults.length)
    
    try {
      // Generate using combinatorial analysis
      const profile = combinatorialGenerator.analyzeResponses(subsequenceResponses)
      const valuesMarkdown = combinatorialGenerator.generateValuesMarkdown(profile, {
        useDetailedMotifAnalysis: true,
        includeFrameworkAlignment: true,
        includeDecisionPatterns: true,
        templateFormat: 'standard',
        targetAudience: 'personal'
      })
      
      // Update result with generated content
      setGenerationResults(prev => prev.map(result => 
        result.id === resultId 
          ? { ...result, valuesMarkdown, profile, status: 'complete' as const }
          : result
      ))
    } catch (error) {
      setGenerationResults(prev => prev.map(result => 
        result.id === resultId 
          ? { ...result, status: 'error' as const }
          : result
      ))
    }
  }

  // Handle histogram bar selection
  const handleResponseSelection = (index: number, isShiftHeld: boolean) => {
    if (!isSelecting) {
      setSelectedRange({ start: index, end: index })
      setIsSelecting(true)
    } else if (isShiftHeld && selectedRange.start !== -1) {
      const start = Math.min(selectedRange.start, index)
      const end = Math.max(selectedRange.start, index)
      setSelectedRange({ start, end })
    } else {
      setSelectedRange({ start: index, end: index })
    }
  }

  // Clear selection
  const clearSelection = () => {
    setIsSelecting(false)
    setSelectedRange({ start: 0, end: 0 })
  }

  // Remove result
  const removeResult = (resultId: string) => {
    setGenerationResults(prev => prev.filter(result => result.id !== resultId))
    if (activeResultIndex !== null && activeResultIndex >= generationResults.length - 1) {
      setActiveResultIndex(Math.max(0, generationResults.length - 2))
    }
  }

  // Get semantic color for motif (minimal palette)
  const getMotifColor = (motif: string): string => {
    const colorMap: Record<string, string> = {
      'HARM_MINIMIZE': '#dc2626',     // Red - harm/danger
      'UTIL_CALC': '#2563eb',         // Blue - calculation/utility  
      'AUTONOMY_RESPECT': '#16a34a',  // Green - growth/freedom
      'RULES_FIRST': '#7c3aed',       // Purple - authority/rules
      'PERSON_FIRST': '#ea580c',      // Orange - warmth/people
      'PROCESS_FIRST': '#0891b2',     // Cyan - process/system
      'SAFETY_FIRST': '#dc2626',      // Red - safety/caution
      'NUMBERS_FIRST': '#4338ca',     // Indigo - data/analysis
      'BALANCED': '#6b7280'           // Gray - balanced/neutral
    }
    return colorMap[motif] || '#6b7280'
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

        {/* Response Subsequence Selector */}
        {sampleUserResponses.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Response Subsequence Selector</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {sampleUserResponses.length} responses
                  </Badge>
                  {isSelecting && (
                    <Badge className="text-xs">
                      {selectedRange.start + 1}-{selectedRange.end + 1} selected
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a subsequence of responses to generate VALUES.md. Click to start selection, shift+click to extend range.
              </p>
            </CardHeader>
            <CardContent>
              {/* Histogram Bar Selector */}
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  {sampleUserResponses.map((response, index) => {
                    const isSelected = isSelecting && 
                      index >= selectedRange.start && 
                      index <= selectedRange.end
                    const motifColor = getMotifColor(response.motif)
                    
                    return (
                      <div
                        key={index}
                        className={`
                          relative cursor-pointer transition-all duration-200 
                          ${isSelected ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'}
                        `}
                        style={{ 
                          width: `${Math.max(100 / sampleUserResponses.length, 8)}%`,
                          height: `${Math.max(response.difficulty * 6, 24)}px`,
                          backgroundColor: motifColor,
                          opacity: isSelected ? 1 : 0.7
                        }}
                        onClick={(e) => handleResponseSelection(index, e.shiftKey)}
                        title={`Response ${index + 1}: ${response.motif} (difficulty: ${response.difficulty})`}
                      >
                        {/* Response number */}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                          {index + 1}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Motif Legend */}
                <div className="flex flex-wrap gap-2 text-xs mt-8">
                  {Array.from(new Set(sampleUserResponses.map(r => r.motif))).map(motif => (
                    <div key={motif} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: getMotifColor(motif) }}
                      />
                      <span className="text-muted-foreground">{motif.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Selection Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => generateValuesForSubsequence(selectedRange.start, selectedRange.end)}
                  disabled={!isSelecting}
                  size="sm"
                >
                  Generate VALUES.md
                </Button>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                  disabled={!isSelecting}
                >
                  Clear Selection
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRange({ start: 0, end: sampleUserResponses.length - 1 })
                    setIsSelecting(true)
                  }}
                  variant="outline"
                  size="sm"
                >
                  Select All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Side-by-Side Results Comparison */}
        {generationResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated VALUES.md Comparison</span>
                <Badge variant="outline" className="text-xs">
                  {generationResults.length} results
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare VALUES.md files generated from different response subsequences.
              </p>
            </CardHeader>
            <CardContent>
              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {generationResults.map((result, index) => (
                  <div 
                    key={result.id}
                    className={`
                      relative border rounded-lg p-4 transition-all duration-200
                      ${activeResultIndex === index ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:bg-gray-50'}
                      cursor-pointer
                    `}
                    onClick={() => setActiveResultIndex(index)}
                  >
                    {/* Result Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-sm">{result.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'generating' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        {result.status === 'complete' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {result.status === 'error' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeResult(result.id)
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    {/* Subsequence Visualization */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        {sampleUserResponses.map((response, responseIndex) => {
                          const isInSubsequence = responseIndex >= result.subsequence.start && 
                                                responseIndex <= result.subsequence.end
                          return (
                            <div
                              key={responseIndex}
                              className="w-2 h-2 rounded-sm"
                              style={{
                                backgroundColor: isInSubsequence 
                                  ? getMotifColor(response.motif)
                                  : '#e5e7eb',
                                opacity: isInSubsequence ? 1 : 0.3
                              }}
                            />
                          )
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Responses {result.subsequence.start + 1}-{result.subsequence.end + 1} 
                        ({result.subsequence.end - result.subsequence.start + 1} total)
                      </p>
                    </div>

                    {/* VALUES.md Preview */}
                    {result.status === 'complete' && result.valuesMarkdown && (
                      <div className="bg-white/70 rounded border p-3 text-xs font-mono max-h-40 overflow-y-auto">
                        <div className="whitespace-pre-wrap">
                          {result.valuesMarkdown.split('\n').slice(0, 8).join('\n')}
                          {result.valuesMarkdown.split('\n').length > 8 && '\n...'}
                        </div>
                      </div>
                    )}

                    {result.status === 'generating' && (
                      <div className="bg-gray-100 rounded border p-3 text-xs text-center text-muted-foreground">
                        Generating VALUES.md...
                      </div>
                    )}

                    {result.status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-xs text-center text-red-600">
                        Generation failed
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Result Detail */}
              {activeResultIndex !== null && 
               generationResults[activeResultIndex]?.status === 'complete' && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">
                      {generationResults[activeResultIndex].name} - Full Details
                    </h4>
                    <Button
                      onClick={() => {
                        const result = generationResults[activeResultIndex]
                        const blob = new Blob([result.valuesMarkdown], { type: 'text/markdown' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `values-${result.subsequence.start + 1}-${result.subsequence.end + 1}.md`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Download
                    </Button>
                  </div>
                  <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {generationResults[activeResultIndex].valuesMarkdown}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ValuesWaterfallPage