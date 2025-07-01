'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface CommitData {
  hash: string
  date: string
  message: string
  author: string
  filesChanged: FileChange[]
  semanticImpact: {
    frontend: number
    backend: number
    data: number
    config: number
    test: number
    docs: number
  }
}

interface FileChange {
  path: string
  action: 'added' | 'modified' | 'deleted'
  lines: number
  semantic: 'frontend' | 'backend' | 'data' | 'config' | 'test' | 'docs'
  complexity: number
}

// Real commit timeline data
const commitTimeline: CommitData[] = [
  {
    hash: 'initial',
    date: '2024-12-01',
    message: '🎉 Initial Next.js setup',
    author: 'Claude',
    filesChanged: [
      { path: 'package.json', action: 'added', lines: 45, semantic: 'config', complexity: 3 },
      { path: 'next.config.ts', action: 'added', lines: 15, semantic: 'config', complexity: 2 },
      { path: 'tailwind.config.ts', action: 'added', lines: 20, semantic: 'config', complexity: 2 },
      { path: 'src/app/layout.tsx', action: 'added', lines: 35, semantic: 'frontend', complexity: 2 },
      { path: 'src/app/page.tsx', action: 'added', lines: 25, semantic: 'frontend', complexity: 2 }
    ],
    semanticImpact: { frontend: 30, backend: 0, data: 0, config: 70, test: 0, docs: 0 }
  },
  {
    hash: '27b894a',
    date: '2024-12-05',
    message: '🏗️ Database schema and UI foundation',
    author: 'Claude',
    filesChanged: [
      { path: 'src/lib/schema.ts', action: 'added', lines: 180, semantic: 'backend', complexity: 8 },
      { path: 'src/lib/db.ts', action: 'added', lines: 25, semantic: 'backend', complexity: 5 },
      { path: 'drizzle/0000_bent_microbe.sql', action: 'added', lines: 95, semantic: 'backend', complexity: 6 },
      { path: 'src/components/ui/button.tsx', action: 'added', lines: 45, semantic: 'frontend', complexity: 2 },
      { path: 'src/components/ui/card.tsx', action: 'added', lines: 35, semantic: 'frontend', complexity: 2 },
      { path: 'src/components/header.tsx', action: 'added', lines: 65, semantic: 'frontend', complexity: 3 }
    ],
    semanticImpact: { frontend: 35, backend: 60, data: 0, config: 0, test: 0, docs: 5 }
  },
  {
    hash: '9e76def',
    date: '2024-12-10',
    message: '🚀 API endpoints and dilemma generation',
    author: 'Claude',
    filesChanged: [
      { path: 'src/app/api/dilemmas/random/route.ts', action: 'added', lines: 85, semantic: 'backend', complexity: 6 },
      { path: 'src/app/api/dilemmas/[uuid]/route.ts', action: 'added', lines: 65, semantic: 'backend', complexity: 5 },
      { path: 'src/app/api/responses/route.ts', action: 'added', lines: 95, semantic: 'backend', complexity: 6 },
      { path: 'src/lib/openrouter.ts', action: 'added', lines: 145, semantic: 'backend', complexity: 7 },
      { path: 'src/store/dilemma-store.ts', action: 'added', lines: 125, semantic: 'data', complexity: 6 }
    ],
    semanticImpact: { frontend: 0, backend: 70, data: 25, config: 0, test: 0, docs: 5 }
  },
  {
    hash: '607f632',
    date: '2024-12-15',
    message: '🎨 Frontend pages and user flow',
    author: 'Claude',
    filesChanged: [
      { path: 'src/app/explore/[uuid]/page.tsx', action: 'added', lines: 185, semantic: 'frontend', complexity: 8 },
      { path: 'src/app/results/page.tsx', action: 'added', lines: 145, semantic: 'frontend', complexity: 7 },
      { path: 'src/app/admin/page.tsx', action: 'added', lines: 95, semantic: 'frontend', complexity: 5 },
      { path: 'src/components/progress-bar.tsx', action: 'added', lines: 45, semantic: 'frontend', complexity: 4 },
      { path: 'src/app/api/generate-values/route.ts', action: 'added', lines: 125, semantic: 'backend', complexity: 7 }
    ],
    semanticImpact: { frontend: 75, backend: 20, data: 0, config: 0, test: 0, docs: 5 }
  },
  {
    hash: 'f397f97',
    date: '2024-12-20',
    message: '🔧 Bug fixes and polish',
    author: 'Claude',
    filesChanged: [
      { path: 'src/app/page.tsx', action: 'modified', lines: 45, semantic: 'frontend', complexity: 3 },
      { path: 'src/components/progress-bar.tsx', action: 'modified', lines: 25, semantic: 'frontend', complexity: 4 },
      { path: 'src/lib/auth.ts', action: 'added', lines: 85, semantic: 'backend', complexity: 6 },
      { path: 'src/app/admin/health/page.tsx', action: 'added', lines: 55, semantic: 'frontend', complexity: 4 }
    ],
    semanticImpact: { frontend: 60, backend: 35, data: 0, config: 0, test: 0, docs: 5 }
  },
  {
    hash: '7b69593',
    date: '2024-12-25',
    message: '🔄 SURGICAL FIXES: State machine refactor',
    author: 'Claude',
    filesChanged: [
      { path: 'src/store/app-state-machine.ts', action: 'added', lines: 325, semantic: 'data', complexity: 10 },
      { path: 'src/store/enhanced-dilemma-store.ts', action: 'added', lines: 285, semantic: 'data', complexity: 9 },
      { path: 'src/hooks/use-session-management.tsx', action: 'added', lines: 195, semantic: 'data', complexity: 8 },
      { path: 'tests/state-machine.test.ts', action: 'added', lines: 245, semantic: 'test', complexity: 9 },
      { path: 'tests/enhanced-store-integration.test.ts', action: 'added', lines: 215, semantic: 'test', complexity: 8 },
      { path: 'tests/session-management.test.ts', action: 'added', lines: 185, semantic: 'test', complexity: 7 },
      { path: 'src/app/explore/[uuid]/page.tsx', action: 'modified', lines: 125, semantic: 'frontend', complexity: 8 },
      { path: 'src/app/results/page.tsx', action: 'modified', lines: 95, semantic: 'frontend', complexity: 7 },
      { path: 'src/lib/openrouter.ts', action: 'modified', lines: 45, semantic: 'backend', complexity: 7 },
      { path: 'CLAUDE.md', action: 'added', lines: 195, semantic: 'docs', complexity: 4 },
      { path: 'vitest.config.ts', action: 'added', lines: 25, semantic: 'test', complexity: 3 },
      { path: 'tests/e2e-critical.spec.ts', action: 'added', lines: 165, semantic: 'test', complexity: 6 }
    ],
    semanticImpact: { frontend: 20, backend: 10, data: 35, config: 5, test: 25, docs: 5 }
  }
]

// Semantic positioning (where each type appears on the map)
const semanticPositions = {
  config: { x: 150, y: 100, color: '#6b7280' },    // top-left (foundation)
  backend: { x: 400, y: 150, color: '#8b5cf6' },   // center-left (core logic)
  data: { x: 250, y: 300, color: '#f59e0b' },      // center (state management)
  frontend: { x: 550, y: 250, color: '#3b82f6' },  // right (user interface)
  test: { x: 350, y: 450, color: '#10b981' },      // bottom (quality)
  docs: { x: 100, y: 400, color: '#ec4899' }       // bottom-left (documentation)
}

const AnimatedFileNode = ({ 
  file, 
  position, 
  isActive, 
  delay = 0 
}: { 
  file: FileChange
  position: { x: number, y: number }
  isActive: boolean
  delay?: number
}) => {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [isActive, delay])

  if (!visible) return null

  const size = Math.max(8, Math.min(24, file.lines / 10))
  const semantic = semanticPositions[file.semantic]
  
  // Add some randomness to position so files don't overlap
  const jitter = { 
    x: (Math.random() - 0.5) * 60, 
    y: (Math.random() - 0.5) * 60 
  }

  return (
    <div
      className="absolute transition-all duration-1000 ease-out"
      style={{
        left: semantic.x + jitter.x,
        top: semantic.y + jitter.y,
        transform: visible ? 'scale(1)' : 'scale(0)',
        opacity: visible ? 1 : 0
      }}
    >
      <div
        className="rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse"
        style={{
          width: size,
          height: size,
          backgroundColor: file.action === 'added' ? semantic.color : 
                          file.action === 'modified' ? '#f59e0b' : '#ef4444'
        }}
        title={`${file.path} (${file.action}, ${file.lines} lines)`}
      >
        <span className="text-white text-xs">
          {file.action === 'added' ? '+' : file.action === 'modified' ? '~' : '-'}
        </span>
      </div>
      
      {/* File path label */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-1 py-0.5 bg-black bg-opacity-75 text-white text-xs rounded whitespace-nowrap max-w-32 truncate">
        {file.path.split('/').pop()}
      </div>
    </div>
  )
}

const SemanticRegion = ({ 
  type, 
  position, 
  impact 
}: { 
  type: keyof typeof semanticPositions
  position: { x: number, y: number, color: string }
  impact: number
}) => {
  return (
    <div
      className="absolute rounded-full border-2 border-dashed transition-all duration-500"
      style={{
        left: position.x - 50,
        top: position.y - 50,
        width: 100 + impact * 2,
        height: 100 + impact * 2,
        borderColor: position.color,
        backgroundColor: `${position.color}20`,
        opacity: 0.3 + (impact / 100) * 0.7
      }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center text-sm font-bold"
        style={{ color: position.color }}
      >
        {type.toUpperCase()}
      </div>
    </div>
  )
}

export default function GrowthMapPage() {
  const [currentCommitIndex, setCurrentCommitIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentCommit = commitTimeline[currentCommitIndex]
  const visibleFiles = commitTimeline
    .slice(0, currentCommitIndex + 1)
    .flatMap((commit, commitIdx) => 
      commit.filesChanged.map(file => ({
        ...file,
        commitIndex: commitIdx,
        commitHash: commit.hash,
        isFromCurrentCommit: commitIdx === currentCommitIndex
      }))
    )

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentCommitIndex(prev => {
          if (prev >= commitTimeline.length - 1) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Repository Growth Map
          </h1>
          <p className="text-gray-300 mb-4">
            Watch your codebase evolve commit by commit, with semantic organization and real-time impact visualization
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Timeline Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={handlePlayPause} variant={isPlaying ? "destructive" : "default"}>
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </Button>
              <Button onClick={handleReset} variant="outline">
                🔄 Reset
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Speed:</span>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(2500 - value)}
                  max={2000}
                  min={200}
                  step={200}
                  className="w-32"
                />
                <span className="text-xs text-gray-400">{((2500 - speed) / 1000).toFixed(1)}x</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Commit:</span>
                <Slider
                  value={[currentCommitIndex]}
                  onValueChange={([value]) => setCurrentCommitIndex(value)}
                  max={commitTimeline.length - 1}
                  min={0}
                  step={1}
                  className="w-48"
                />
                <span className="text-xs text-gray-400">
                  {currentCommitIndex + 1}/{commitTimeline.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Semantic Repository Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-gray-900 rounded-lg overflow-hidden"
                  style={{ height: '600px' }}
                >
                  {/* Grid background */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,.3) 1px, transparent 0)`,
                      backgroundSize: '30px 30px'
                    }}
                  />

                  {/* Semantic regions */}
                  {Object.entries(semanticPositions).map(([type, position]) => (
                    <SemanticRegion
                      key={type}
                      type={type as keyof typeof semanticPositions}
                      position={position}
                      impact={currentCommit?.semanticImpact[type as keyof typeof currentCommit.semanticImpact] || 0}
                    />
                  ))}

                  {/* File nodes */}
                  {visibleFiles.map((file, index) => (
                    <AnimatedFileNode
                      key={`${file.commitHash}-${file.path}`}
                      file={file}
                      position={semanticPositions[file.semantic]}
                      isActive={true}
                      delay={file.isFromCurrentCommit ? index * 100 : 0}
                    />
                  ))}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 p-4 rounded-lg">
                    <h4 className="text-sm font-bold mb-2">File Actions</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>+ Added</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        <span>~ Modified</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span>- Deleted</span>
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
                    {currentCommit.filesChanged.length} files changed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Chart */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Semantic Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(currentCommit.semanticImpact).map(([type, impact]) => (
                    <div key={type} className="flex items-center">
                      <div className="w-16 text-xs capitalize">{type}:</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2 mx-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${impact}%`,
                            backgroundColor: semanticPositions[type as keyof typeof semanticPositions]?.color || '#gray'
                          }}
                        />
                      </div>
                      <div className="text-xs w-8">{impact}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Repository Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Files:</span>
                    <span className="font-mono">{visibleFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lines Added:</span>
                    <span className="font-mono text-green-400">
                      +{visibleFiles.filter(f => f.action === 'added').reduce((sum, f) => sum + f.lines, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lines Modified:</span>
                    <span className="font-mono text-amber-400">
                      ~{visibleFiles.filter(f => f.action === 'modified').reduce((sum, f) => sum + f.lines, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commits:</span>
                    <span className="font-mono">{currentCommitIndex + 1}/{commitTimeline.length}</span>
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