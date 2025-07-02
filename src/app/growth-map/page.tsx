'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface FlowStep {
  id: string
  name: string
  description: string
  files: string[]
  complexity: 'simple' | 'medium' | 'complex'
  status: 'working' | 'fixed' | 'simplified'
  position: { x: number, y: number }
  color: string
}

interface CommitData {
  hash: string
  date: string
  message: string
  author: string
  flowImpact: {
    step: string
    change: 'added' | 'fixed' | 'simplified' | 'removed'
    description: string
  }[]
  linesChanged: {
    added: number
    removed: number
    simplified: number
  }
}

// Core user flow steps (the actual moving pieces)
const userFlowSteps: FlowStep[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'User clicks "Generate Your VALUES.md"',
    files: ['src/app/page.tsx'],
    complexity: 'simple',
    status: 'working',
    position: { x: 100, y: 150 },
    color: '#3b82f6'
  },
  {
    id: 'api-redirect',
    name: 'API Redirect',
    description: '/api/dilemmas/random → 307 redirect',
    files: ['src/app/api/dilemmas/random/route.ts'],
    complexity: 'simple',
    status: 'working',
    position: { x: 300, y: 150 },
    color: '#8b5cf6'
  },
  {
    id: 'explore-page',
    name: 'Explore Page',
    description: 'Load dilemmas, show choices, save responses',
    files: ['src/app/explore/[uuid]/page.tsx'],
    complexity: 'simple',
    status: 'simplified',
    position: { x: 500, y: 150 },
    color: '#f59e0b'
  },
  {
    id: 'local-storage',
    name: 'Session Storage',
    description: 'localStorage persistence for responses',
    files: ['localStorage API'],
    complexity: 'simple',
    status: 'simplified',
    position: { x: 500, y: 300 },
    color: '#10b981'
  },
  {
    id: 'results-page',
    name: 'Results Page',
    description: 'Generate values.md from responses',
    files: ['src/app/results/page.tsx'],
    complexity: 'simple',
    status: 'simplified',
    position: { x: 700, y: 150 },
    color: '#3b82f6'
  },
  {
    id: 'api-responses',
    name: 'Save Responses',
    description: 'POST /api/responses for research',
    files: ['src/app/api/responses/route.ts'],
    complexity: 'simple',
    status: 'working',
    position: { x: 600, y: 300 },
    color: '#8b5cf6'
  },
  {
    id: 'api-values',
    name: 'Generate Values',
    description: 'AI analysis → VALUES.md file',
    files: ['src/app/api/generate-values/route.ts'],
    complexity: 'medium',
    status: 'working',
    position: { x: 800, y: 300 },
    color: '#ec4899'
  }
]

// Real commit timeline with focus on user flow impact
const flowCommitTimeline: CommitData[] = [
  {
    hash: 'initial',
    date: '2024-12-01',
    message: '🎉 Initial Next.js setup',
    author: 'Claude',
    flowImpact: [
      { step: 'landing', change: 'added', description: 'Basic home page structure' }
    ],
    linesChanged: { added: 140, removed: 0, simplified: 0 }
  },
  {
    hash: '27b894a',
    date: '2024-12-05',
    message: '🏗️ Database schema and API foundation',
    author: 'Claude',
    flowImpact: [
      { step: 'api-redirect', change: 'added', description: 'Random dilemma API endpoint' },
      { step: 'api-responses', change: 'added', description: 'Response storage API' }
    ],
    linesChanged: { added: 445, removed: 0, simplified: 0 }
  },
  {
    hash: '9e76def',
    date: '2024-12-10',
    message: '🚀 Core user flow implementation',
    author: 'Claude',
    flowImpact: [
      { step: 'explore-page', change: 'added', description: 'Complex state machine integration (378 lines)' },
      { step: 'results-page', change: 'added', description: 'Complex session management (324 lines)' },
      { step: 'api-values', change: 'added', description: 'LLM values generation' }
    ],
    linesChanged: { added: 1247, removed: 0, simplified: 0 }
  },
  {
    hash: '607f632',
    date: '2024-12-15',
    message: '🔧 Bug fixes and state management expansion',
    author: 'Claude',
    flowImpact: [
      { step: 'local-storage', change: 'added', description: 'Complex Zustand store with persistence' },
      { step: 'explore-page', change: 'added', description: 'useSessionManagement hook integration' }
    ],
    linesChanged: { added: 856, removed: 0, simplified: 0 }
  },
  {
    hash: '7b69593',
    date: '2024-12-25',
    message: '🔄 SURGICAL FIXES: Complex state machine refactor',
    author: 'Claude',
    flowImpact: [
      { step: 'explore-page', change: 'fixed', description: 'Added 2000+ lines of state machine complexity' },
      { step: 'local-storage', change: 'fixed', description: 'Enhanced store with finite state transitions' }
    ],
    linesChanged: { added: 1265, removed: 0, simplified: 0 }
  },
  {
    hash: 'bc2f4fc',
    date: '2025-01-02',
    message: '🎯 SIMPLIFY CORE: Replace complex state with minimal React patterns',
    author: 'Claude',
    flowImpact: [
      { step: 'explore-page', change: 'simplified', description: 'Reduced from 378 lines to 175 lines (-54%)' },
      { step: 'results-page', change: 'simplified', description: 'Reduced from 324 lines to 160 lines (-51%)' },
      { step: 'local-storage', change: 'simplified', description: 'Simple localStorage instead of Zustand store' }
    ],
    linesChanged: { added: 335, removed: 596, simplified: 703 }
  },
  {
    hash: '17dbfae',
    date: '2025-01-02',
    message: '🧹 CRUFT REMOVAL: Delete 1,780 lines of dead complexity',
    author: 'Claude',
    flowImpact: [
      { step: 'explore-page', change: 'simplified', description: 'Removed useSessionManagement dependencies' },
      { step: 'results-page', change: 'simplified', description: 'Removed complex session protection' },
      { step: 'local-storage', change: 'simplified', description: 'Deleted 1,957 lines of dead state management' }
    ],
    linesChanged: { added: 0, removed: 4424, simplified: 0 }
  }
]

const FlowStepNode = ({ 
  step, 
  isActive, 
  isCompleted,
  delay = 0 
}: { 
  step: FlowStep
  isActive: boolean
  isCompleted: boolean
  delay?: number
}) => {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    if (isActive || isCompleted) {
      const timer = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [isActive, isCompleted, delay])

  if (!visible) return null

  const getStatusColor = () => {
    if (step.status === 'simplified') return '#10b981' // green
    if (step.status === 'fixed') return '#f59e0b' // amber
    return step.color
  }

  const getStatusSymbol = () => {
    if (step.status === 'simplified') return '✨'
    if (step.status === 'fixed') return '🔧'
    return '✅'
  }

  return (
    <div
      className="absolute transition-all duration-1000 ease-out"
      style={{
        left: step.position.x,
        top: step.position.y,
        transform: visible ? 'scale(1)' : 'scale(0)',
        opacity: visible ? 1 : 0
      }}
    >
      <div
        className="rounded-lg border-2 border-white shadow-lg p-4 min-w-32 text-center relative"
        style={{
          backgroundColor: getStatusColor(),
          animation: isActive ? 'pulse 2s infinite' : 'none'
        }}
      >
        <div className="absolute -top-2 -right-2 text-lg">
          {getStatusSymbol()}
        </div>
        
        <div className="text-white font-bold text-sm mb-1">
          {step.name}
        </div>
        
        <div className="text-white text-xs opacity-90 mb-2">
          {step.description}
        </div>
        
        <div className="text-white text-xs">
          {step.complexity === 'simple' ? '🟢' : step.complexity === 'medium' ? '🟡' : '🔴'} {step.complexity}
        </div>
      </div>
    </div>
  )
}

const FlowConnection = ({ 
  from, 
  to, 
  isActive 
}: { 
  from: FlowStep
  to: FlowStep
  isActive: boolean
}) => {
  const startX = from.position.x + 64
  const startY = from.position.y + 40
  const endX = to.position.x
  const endY = to.position.y + 40
  
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
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        strokeDasharray={isActive ? "0" : "5,5"}
        className="transition-all duration-500"
      />
    </svg>
  )
}

export default function GrowthMapPage() {
  const [currentCommitIndex, setCurrentCommitIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1500)
  const [showFlowTrace, setShowFlowTrace] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentCommit = flowCommitTimeline[currentCommitIndex]
  const activeSteps = new Set(currentCommit?.flowImpact.map(impact => impact.step) || [])
  
  // Get all steps that should be visible up to current commit
  const completedSteps = new Set(
    flowCommitTimeline
      .slice(0, currentCommitIndex + 1)
      .flatMap(commit => commit.flowImpact.map(impact => impact.step))
  )

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentCommitIndex(prev => {
          if (prev >= flowCommitTimeline.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentCommitIndex(0)
  }

  const totalLinesEvolution = flowCommitTimeline.slice(0, currentCommitIndex + 1).reduce(
    (acc, commit) => ({
      added: acc.added + commit.linesChanged.added,
      removed: acc.removed + commit.linesChanged.removed,
      simplified: acc.simplified + commit.linesChanged.simplified
    }),
    { added: 0, removed: 0, simplified: 0 }
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Core User Flow Evolution
          </h1>
          <p className="text-gray-300 mb-4">
            Trace the actual moving pieces: from complex state machines to simple React patterns
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Flow Timeline Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={handlePlayPause} variant={isPlaying ? "destructive" : "default"}>
                {isPlaying ? '⏸️ Pause' : '▶️ Play Evolution'}
              </Button>
              <Button onClick={handleReset} variant="outline">
                🔄 Reset to Start
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Speed:</span>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  max={3000}
                  min={500}
                  step={250}
                  className="w-32"
                />
                <span className="text-xs text-gray-400">{(speed/1000).toFixed(1)}s</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Commit:</span>
                <Slider
                  value={[currentCommitIndex]}
                  onValueChange={([value]) => setCurrentCommitIndex(value)}
                  max={flowCommitTimeline.length - 1}
                  min={0}
                  step={1}
                  className="w-48"
                />
                <span className="text-xs text-gray-400">
                  {currentCommitIndex + 1}/{flowCommitTimeline.length}
                </span>
              </div>

              <Button 
                onClick={() => setShowFlowTrace(!showFlowTrace)} 
                variant="outline"
                size="sm"
              >
                {showFlowTrace ? '👁️ Hide' : '👁️ Show'} Flow Trace
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Flow Map */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Flow Moving Pieces</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-gray-900 rounded-lg overflow-hidden"
                  style={{ height: '500px' }}
                >
                  {/* Grid background */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,.3) 1px, transparent 0)`,
                      backgroundSize: '30px 30px'
                    }}
                  />

                  {/* Flow connections */}
                  {showFlowTrace && userFlowSteps.slice(0, -1).map((step, index) => (
                    <FlowConnection
                      key={`${step.id}-connection`}
                      from={step}
                      to={userFlowSteps[index + 1]}
                      isActive={completedSteps.has(step.id) && completedSteps.has(userFlowSteps[index + 1].id)}
                    />
                  ))}

                  {/* Additional connections for storage and APIs */}
                  {showFlowTrace && (
                    <>
                      <FlowConnection
                        from={userFlowSteps[2]} // explore-page
                        to={userFlowSteps[3]}   // local-storage
                        isActive={completedSteps.has('explore-page') && completedSteps.has('local-storage')}
                      />
                      <FlowConnection
                        from={userFlowSteps[4]} // results-page
                        to={userFlowSteps[5]}   // api-responses
                        isActive={completedSteps.has('results-page') && completedSteps.has('api-responses')}
                      />
                      <FlowConnection
                        from={userFlowSteps[5]} // api-responses
                        to={userFlowSteps[6]}   // api-values
                        isActive={completedSteps.has('api-responses') && completedSteps.has('api-values')}
                      />
                    </>
                  )}

                  {/* Flow step nodes */}
                  {userFlowSteps.map((step, index) => (
                    <FlowStepNode
                      key={step.id}
                      step={step}
                      isActive={activeSteps.has(step.id)}
                      isCompleted={completedSteps.has(step.id)}
                      delay={activeSteps.has(step.id) ? index * 200 : 0}
                    />
                  ))}

                  {/* Current step highlight */}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-75 p-3 rounded-lg">
                    <h4 className="text-sm font-bold mb-2">Current Changes</h4>
                    <div className="space-y-1 text-xs max-w-64">
                      {currentCommit.flowImpact.map((impact, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400 font-bold">
                            {impact.change === 'added' ? '➕' : 
                             impact.change === 'fixed' ? '🔧' : 
                             impact.change === 'simplified' ? '✨' : '❌'}
                          </span>
                          <span>{impact.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 p-3 rounded-lg">
                    <h4 className="text-sm font-bold mb-2">Status Legend</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-green-500 mr-2"></div>
                        <span>✨ Simplified</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-amber-500 mr-2"></div>
                        <span>🔧 Fixed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-blue-500 mr-2"></div>
                        <span>✅ Working</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Current Commit Info */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Current Commit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-mono text-xs bg-gray-700 px-2 py-1 rounded">
                      {currentCommit.hash}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    {currentCommit.date}
                  </div>
                  <div className="font-medium text-blue-300">
                    {currentCommit.message}
                  </div>
                  <div className="text-xs text-gray-400">
                    {currentCommit.flowImpact.length} flow changes
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Evolution Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Code Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Lines Added:</span>
                    <span className="font-mono text-green-400">
                      +{totalLinesEvolution.added.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lines Removed:</span>
                    <span className="font-mono text-red-400">
                      -{totalLinesEvolution.removed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lines Simplified:</span>
                    <span className="font-mono text-blue-400">
                      ✨{totalLinesEvolution.simplified.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Net Change:</span>
                      <span className="font-mono">
                        {(totalLinesEvolution.added - totalLinesEvolution.removed) > 0 ? '+' : ''}
                        {(totalLinesEvolution.added - totalLinesEvolution.removed).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flow Complexity */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Flow Complexity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userFlowSteps.filter(step => completedSteps.has(step.id)).map((step) => (
                    <div key={step.id} className="flex items-center justify-between text-xs">
                      <span className="capitalize">{step.name}:</span>
                      <span className={
                        step.complexity === 'simple' ? 'text-green-400' :
                        step.complexity === 'medium' ? 'text-yellow-400' : 'text-red-400'
                      }>
                        {step.complexity === 'simple' ? '🟢' : step.complexity === 'medium' ? '🟡' : '🔴'} {step.complexity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Flow Status Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Flow Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Simplified Steps:</span>
                    <span className="text-green-400">
                      {userFlowSteps.filter(s => s.status === 'simplified' && completedSteps.has(s.id)).length}/
                      {userFlowSteps.filter(s => completedSteps.has(s.id)).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simple Components:</span>
                    <span className="text-green-400">
                      {userFlowSteps.filter(s => s.complexity === 'simple' && completedSteps.has(s.id)).length}/
                      {userFlowSteps.filter(s => completedSteps.has(s.id)).length}
                    </span>
                  </div>
                  <div className="text-center pt-2 border-t border-gray-600">
                    <span className="text-blue-300 font-bold">
                      {Math.round((userFlowSteps.filter(s => s.status === 'simplified' && completedSteps.has(s.id)).length / 
                                   Math.max(1, userFlowSteps.filter(s => completedSteps.has(s.id)).length)) * 100)}% 
                      Simplified
                    </span>
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