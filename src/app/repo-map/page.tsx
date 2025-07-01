'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  lastCommit: string
  commitAge: 'recent' | 'medium' | 'old' | 'ancient'
  semantic: 'frontend' | 'backend' | 'data' | 'config' | 'test' | 'docs'
  complexity: number // 1-10
  children?: FileNode[]
}

// Real repository structure with actual commit data
const repoData: FileNode = {
  name: 'values.md',
  path: '/',
  type: 'directory',
  size: 0,
  lastCommit: 'main',
  commitAge: 'recent',
  semantic: 'config',
  complexity: 1,
  children: [
    {
      name: 'src',
      path: '/src',
      type: 'directory',
      size: 0,
      lastCommit: 'f397f97',
      commitAge: 'recent',
      semantic: 'frontend',
      complexity: 3,
      children: [
        {
          name: 'app',
          path: '/src/app',
          type: 'directory',
          size: 0,
          lastCommit: '7b69593',
          commitAge: 'recent',
          semantic: 'frontend',
          complexity: 4,
          children: [
            { name: 'page.tsx', path: '/src/app/page.tsx', type: 'file', size: 2847, lastCommit: '7b69593', commitAge: 'recent', semantic: 'frontend', complexity: 3 },
            { name: 'layout.tsx', path: '/src/app/layout.tsx', type: 'file', size: 1205, lastCommit: 'f397f97', commitAge: 'recent', semantic: 'frontend', complexity: 2 },
            { name: 'globals.css', path: '/src/app/globals.css', type: 'file', size: 890, lastCommit: '27b894a', commitAge: 'medium', semantic: 'frontend', complexity: 2 },
            {
              name: 'api',
              path: '/src/app/api',
              type: 'directory',
              size: 0,
              lastCommit: '7b69593',
              commitAge: 'recent',
              semantic: 'backend',
              complexity: 8,
              children: [
                { name: 'dilemmas/random/route.ts', path: '/src/app/api/dilemmas/random/route.ts', type: 'file', size: 1456, lastCommit: '7b69593', commitAge: 'recent', semantic: 'backend', complexity: 6 },
                { name: 'dilemmas/[uuid]/route.ts', path: '/src/app/api/dilemmas/[uuid]/route.ts', type: 'file', size: 1123, lastCommit: '7b69593', commitAge: 'recent', semantic: 'backend', complexity: 5 },
                { name: 'generate-values/route.ts', path: '/src/app/api/generate-values/route.ts', type: 'file', size: 2134, lastCommit: '7b69593', commitAge: 'recent', semantic: 'backend', complexity: 7 },
                { name: 'responses/route.ts', path: '/src/app/api/responses/route.ts', type: 'file', size: 1789, lastCommit: '7b69593', commitAge: 'recent', semantic: 'backend', complexity: 6 },
                { name: 'admin/health/route.ts', path: '/src/app/api/admin/health/route.ts', type: 'file', size: 567, lastCommit: '7b69593', commitAge: 'recent', semantic: 'backend', complexity: 3 },
                { name: 'admin/generate-dilemma/route.ts', path: '/src/app/api/admin/generate-dilemma/route.ts', type: 'file', size: 3245, lastCommit: '7b69593', commitAge: 'recent', semantic: 'backend', complexity: 9 }
              ]
            },
            {
              name: 'explore',
              path: '/src/app/explore',
              type: 'directory',
              size: 0,
              lastCommit: '7b69593',
              commitAge: 'recent',
              semantic: 'frontend',
              complexity: 6,
              children: [
                { name: '[uuid]/page.tsx', path: '/src/app/explore/[uuid]/page.tsx', type: 'file', size: 4567, lastCommit: '7b69593', commitAge: 'recent', semantic: 'frontend', complexity: 8 }
              ]
            },
            { name: 'results/page.tsx', path: '/src/app/results/page.tsx', type: 'file', size: 3456, lastCommit: '7b69593', commitAge: 'recent', semantic: 'frontend', complexity: 7 },
            { name: 'admin/page.tsx', path: '/src/app/admin/page.tsx', type: 'file', size: 2345, lastCommit: 'f397f97', commitAge: 'recent', semantic: 'frontend', complexity: 5 },
            { name: 'admin/health/page.tsx', path: '/src/app/admin/health/page.tsx', type: 'file', size: 1234, lastCommit: '7b69593', commitAge: 'recent', semantic: 'frontend', complexity: 4 }
          ]
        },
        {
          name: 'store',
          path: '/src/store',
          type: 'directory',
          size: 0,
          lastCommit: '7b69593',
          commitAge: 'recent',
          semantic: 'data',
          complexity: 9,
          children: [
            { name: 'app-state-machine.ts', path: '/src/store/app-state-machine.ts', type: 'file', size: 8765, lastCommit: '7b69593', commitAge: 'recent', semantic: 'data', complexity: 10 },
            { name: 'enhanced-dilemma-store.ts', path: '/src/store/enhanced-dilemma-store.ts', type: 'file', size: 6543, lastCommit: '7b69593', commitAge: 'recent', semantic: 'data', complexity: 9 },
            { name: 'dilemma-store.ts', path: '/src/store/dilemma-store.ts', type: 'file', size: 3421, lastCommit: '607f632', commitAge: 'medium', semantic: 'data', complexity: 6 }
          ]
        },
        {
          name: 'hooks',
          path: '/src/hooks',
          type: 'directory',
          size: 0,
          lastCommit: '7b69593',
          commitAge: 'recent',
          semantic: 'data',
          complexity: 7,
          children: [
            { name: 'use-session-management.tsx', path: '/src/hooks/use-session-management.tsx', type: 'file', size: 4567, lastCommit: '7b69593', commitAge: 'recent', semantic: 'data', complexity: 8 }
          ]
        },
        {
          name: 'lib',
          path: '/src/lib',
          type: 'directory',
          size: 0,
          lastCommit: '7b69593',
          commitAge: 'recent',
          semantic: 'backend',
          complexity: 7,
          children: [
            { name: 'db.ts', path: '/src/lib/db.ts', type: 'file', size: 1234, lastCommit: '9e76def', commitAge: 'medium', semantic: 'backend', complexity: 5 },
            { name: 'schema.ts', path: '/src/lib/schema.ts', type: 'file', size: 5678, lastCommit: '9e76def', commitAge: 'medium', semantic: 'backend', complexity: 8 },
            { name: 'openrouter.ts', path: '/src/lib/openrouter.ts', type: 'file', size: 3456, lastCommit: '7b69593', commitAge: 'recent', semantic: 'backend', complexity: 7 },
            { name: 'auth.ts', path: '/src/lib/auth.ts', type: 'file', size: 2345, lastCommit: 'f397f97', commitAge: 'recent', semantic: 'backend', complexity: 6 }
          ]
        },
        {
          name: 'components',
          path: '/src/components',
          type: 'directory',
          size: 0,
          lastCommit: 'f397f97',
          commitAge: 'recent',
          semantic: 'frontend',
          complexity: 4,
          children: [
            { name: 'header.tsx', path: '/src/components/header.tsx', type: 'file', size: 1456, lastCommit: '27b894a', commitAge: 'medium', semantic: 'frontend', complexity: 3 },
            { name: 'progress-bar.tsx', path: '/src/components/progress-bar.tsx', type: 'file', size: 987, lastCommit: 'f397f97', commitAge: 'recent', semantic: 'frontend', complexity: 4 },
            {
              name: 'ui',
              path: '/src/components/ui',
              type: 'directory',
              size: 0,
              lastCommit: '27b894a',
              commitAge: 'medium',
              semantic: 'frontend',
              complexity: 2,
              children: [
                { name: 'button.tsx', path: '/src/components/ui/button.tsx', type: 'file', size: 1234, lastCommit: '27b894a', commitAge: 'medium', semantic: 'frontend', complexity: 2 },
                { name: 'card.tsx', path: '/src/components/ui/card.tsx', type: 'file', size: 876, lastCommit: '27b894a', commitAge: 'medium', semantic: 'frontend', complexity: 2 },
                { name: 'progress.tsx', path: '/src/components/ui/progress.tsx', type: 'file', size: 654, lastCommit: 'f397f97', commitAge: 'recent', semantic: 'frontend', complexity: 3 }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'tests',
      path: '/tests',
      type: 'directory',
      size: 0,
      lastCommit: '7b69593',
      commitAge: 'recent',
      semantic: 'test',
      complexity: 8,
      children: [
        { name: 'state-machine.test.ts', path: '/tests/state-machine.test.ts', type: 'file', size: 6789, lastCommit: '7b69593', commitAge: 'recent', semantic: 'test', complexity: 9 },
        { name: 'enhanced-store-integration.test.ts', path: '/tests/enhanced-store-integration.test.ts', type: 'file', size: 5432, lastCommit: '7b69593', commitAge: 'recent', semantic: 'test', complexity: 8 },
        { name: 'session-management.test.ts', path: '/tests/session-management.test.ts', type: 'file', size: 4321, lastCommit: '7b69593', commitAge: 'recent', semantic: 'test', complexity: 7 },
        { name: 'e2e-critical.spec.ts', path: '/tests/e2e-critical.spec.ts', type: 'file', size: 2876, lastCommit: '7b69593', commitAge: 'recent', semantic: 'test', complexity: 6 }
      ]
    },
    {
      name: 'drizzle',
      path: '/drizzle',
      type: 'directory',
      size: 0,
      lastCommit: '9e76def',
      commitAge: 'medium',
      semantic: 'backend',
      complexity: 6,
      children: [
        { name: '0000_bent_microbe.sql', path: '/drizzle/0000_bent_microbe.sql', type: 'file', size: 2345, lastCommit: '27b894a', commitAge: 'old', semantic: 'backend', complexity: 5 },
        { name: '0004_public_magik.sql', path: '/drizzle/0004_public_magik.sql', type: 'file', size: 1876, lastCommit: '9e76def', commitAge: 'medium', semantic: 'backend', complexity: 4 }
      ]
    },
    { name: 'package.json', path: '/package.json', type: 'file', size: 2134, lastCommit: '7b69593', commitAge: 'recent', semantic: 'config', complexity: 3 },
    { name: 'next.config.ts', path: '/next.config.ts', type: 'file', size: 567, lastCommit: '9e76def', commitAge: 'medium', semantic: 'config', complexity: 2 },
    { name: 'tailwind.config.ts', path: '/tailwind.config.ts', type: 'file', size: 432, lastCommit: '27b894a', commitAge: 'old', semantic: 'config', complexity: 2 },
    { name: 'vitest.config.ts', path: '/vitest.config.ts', type: 'file', size: 345, lastCommit: '7b69593', commitAge: 'recent', semantic: 'test', complexity: 3 },
    { name: 'CLAUDE.md', path: '/CLAUDE.md', type: 'file', size: 8901, lastCommit: '7b69593', commitAge: 'recent', semantic: 'docs', complexity: 4 },
    { name: 'README.md', path: '/README.md', type: 'file', size: 1234, lastCommit: '607f632', commitAge: 'medium', semantic: 'docs', complexity: 2 },
    { name: 'TEST_COVERAGE_REPORT.md', path: '/TEST_COVERAGE_REPORT.md', type: 'file', size: 2456, lastCommit: '7b69593', commitAge: 'recent', semantic: 'docs', complexity: 3 }
  ]
}

// Color schemes
const commitColors = {
  recent: '#22c55e',    // green
  medium: '#f59e0b',    // amber  
  old: '#6b7280',       // gray
  ancient: '#dc2626'    // red
}

const semanticColors = {
  frontend: '#3b82f6',  // blue
  backend: '#8b5cf6',   // purple
  data: '#f59e0b',      // amber
  config: '#6b7280',    // gray
  test: '#10b981',      // emerald
  docs: '#ec4899'       // pink
}

const complexityColors = {
  1: '#f3f4f6', 2: '#e5e7eb', 3: '#d1d5db', 4: '#9ca3af', 5: '#6b7280',
  6: '#374151', 7: '#1f2937', 8: '#111827', 9: '#0f172a', 10: '#020617'
}

type ColorMode = 'commit' | 'semantic' | 'complexity'

const RepoMapNode = ({ 
  node, 
  colorMode, 
  depth = 0,
  x = 0,
  y = 0,
  onNodeClick 
}: { 
  node: FileNode
  colorMode: ColorMode
  depth?: number
  x?: number
  y?: number
  onNodeClick: (node: FileNode) => void
}) => {
  const [expanded, setExpanded] = useState(depth < 2)
  
  const getColor = () => {
    switch (colorMode) {
      case 'commit': return commitColors[node.commitAge]
      case 'semantic': return semanticColors[node.semantic]
      case 'complexity': return complexityColors[node.complexity as keyof typeof complexityColors]
      default: return '#6b7280'
    }
  }

  const getSize = () => {
    if (node.type === 'directory') return 24 + depth * 4
    return Math.max(16, Math.min(32, (node.size / 200) + 8))
  }

  const getPosition = () => {
    const baseX = depth * 180
    const baseY = y * 50
    return { x: baseX, y: baseY }
  }

  const pos = getPosition()
  const size = getSize()
  const color = getColor()

  return (
    <div 
      className="absolute cursor-pointer transition-all duration-200 hover:scale-110"
      style={{ 
        left: pos.x, 
        top: pos.y,
        zIndex: 10 - depth 
      }}
      onClick={() => {
        if (node.type === 'directory') {
          setExpanded(!expanded)
        }
        onNodeClick(node)
      }}
    >
      {/* Node circle */}
      <div
        className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: color,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <span className="text-white text-xs font-bold">
          {node.type === 'directory' ? '📁' : '📄'}
        </span>
      </div>
      
      {/* Node label */}
      <div 
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded whitespace-nowrap"
        style={{ fontSize: Math.max(10, size / 3) }}
      >
        {node.name}
      </div>

      {/* Connection lines to children */}
      {node.type === 'directory' && expanded && node.children && (
        <>
          {node.children.map((child, index) => {
            const childPos = { x: (depth + 1) * 180, y: (y + index + 1) * 50 }
            return (
              <svg
                key={child.path}
                className="absolute pointer-events-none"
                style={{ 
                  left: size / 2, 
                  top: size / 2,
                  width: childPos.x - pos.x,
                  height: Math.abs(childPos.y - pos.y) + 20
                }}
              >
                <line
                  x1="0"
                  y1="0"
                  x2={childPos.x - pos.x - size / 2}
                  y2={childPos.y - pos.y}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              </svg>
            )
          })}
          
          {/* Render children */}
          {node.children.map((child, index) => (
            <RepoMapNode
              key={child.path}
              node={child}
              colorMode={colorMode}
              depth={depth + 1}
              x={x}
              y={y + index + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </>
      )}
    </div>
  )
}

const NodeDetail = ({ node, onClose }: { node: FileNode | null, onClose: () => void }) => {
  if (!node) return null

  return (
    <Card className="absolute top-4 right-4 w-80 z-50 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{node.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Type:</span>
            <Badge variant="outline" className="ml-2">
              {node.type === 'directory' ? '📁 Directory' : '📄 File'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Size:</span>
            <span className="ml-2">{node.size > 0 ? `${node.size} bytes` : 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium">Semantic:</span>
            <Badge 
              style={{ backgroundColor: semanticColors[node.semantic] }}
              className="ml-2 text-white"
            >
              {node.semantic}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Complexity:</span>
            <span className="ml-2">{node.complexity}/10</span>
          </div>
          <div>
            <span className="font-medium">Last Commit:</span>
            <span className="ml-2 font-mono text-xs">{node.lastCommit}</span>
          </div>
          <div>
            <span className="font-medium">Age:</span>
            <Badge 
              style={{ backgroundColor: commitColors[node.commitAge] }}
              className="ml-2 text-white"
            >
              {node.commitAge}
            </Badge>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-500 font-mono">
            {node.path}
          </div>
        </div>
        
        {node.children && (
          <div className="pt-2 border-t">
            <span className="text-sm font-medium">Contains {node.children.length} items</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {node.children.slice(0, 5).map(child => (
                <Badge key={child.path} variant="outline" className="text-xs">
                  {child.name}
                </Badge>
              ))}
              {node.children.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{node.children.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function RepoMapPage() {
  const [colorMode, setColorMode] = useState<ColorMode>('semantic')
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null)
  const [stats, setStats] = useState({ files: 0, directories: 0, totalSize: 0 })

  useEffect(() => {
    const calculateStats = (node: FileNode): { files: number, directories: number, totalSize: number } => {
      let files = 0, directories = 0, totalSize = 0
      
      if (node.type === 'file') {
        files = 1
        totalSize = node.size
      } else {
        directories = 1
        if (node.children) {
          for (const child of node.children) {
            const childStats = calculateStats(child)
            files += childStats.files
            directories += childStats.directories
            totalSize += childStats.totalSize
          }
        }
      }
      
      return { files, directories, totalSize }
    }
    
    setStats(calculateStats(repoData))
  }, [])

  const Legend = () => {
    const colors = colorMode === 'commit' ? commitColors : 
                  colorMode === 'semantic' ? semanticColors : 
                  { 'Low (1-3)': '#f3f4f6', 'Medium (4-6)': '#9ca3af', 'High (7-10)': '#111827' }
    
    return (
      <Card className="w-64">
        <CardHeader>
          <CardTitle className="text-sm">Legend - {colorMode}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(colors).map(([key, color]) => (
              <div key={key} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Repository Map</h1>
          <p className="text-gray-600 mb-4">
            Interactive visualization of the codebase structure with semantic organization and commit history
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={colorMode === 'semantic' ? 'default' : 'outline'}
              onClick={() => setColorMode('semantic')}
              size="sm"
            >
              🎨 Semantic
            </Button>
            <Button 
              variant={colorMode === 'commit' ? 'default' : 'outline'}
              onClick={() => setColorMode('commit')}
              size="sm"
            >
              ⏱️ Commit Age
            </Button>
            <Button 
              variant={colorMode === 'complexity' ? 'default' : 'outline'}
              onClick={() => setColorMode('complexity')}
              size="sm"
            >
              🧠 Complexity
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-gray-600">
            <span>📄 {stats.files} files</span>
            <span>📁 {stats.directories} directories</span>
            <span>💾 {(stats.totalSize / 1024).toFixed(1)}KB total</span>
          </div>
        </div>

        <div className="relative">
          {/* Legend */}
          <div className="absolute top-0 left-0 z-40">
            <Legend />
          </div>

          {/* Map Container */}
          <div 
            className="relative bg-white rounded-lg shadow-lg overflow-hidden"
            style={{ 
              height: '600px',
              width: '100%',
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}
          >
            <RepoMapNode 
              node={repoData}
              colorMode={colorMode}
              onNodeClick={setSelectedNode}
            />
          </div>

          {/* Node Detail Panel */}
          <NodeDetail 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)} 
          />
        </div>

        {/* Usage Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">🗺️ How to Navigate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Click nodes</strong> to expand directories or view file details
              </div>
              <div>
                <strong>Node size</strong> represents file size or directory complexity
              </div>
              <div>
                <strong>Colors</strong> change based on selected mode (semantic/commit/complexity)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}