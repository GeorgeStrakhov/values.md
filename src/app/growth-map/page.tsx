'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SystemStatePanel, GlowLight, useSystemState } from '@/components/system-state'

interface BoundaryLayer {
  id: string
  name: string
  type: 'error' | 'auth' | 'data' | 'system' | 'ui'
  status: 'protected' | 'vulnerable' | 'missing' | 'working'
  coverage: number // 0-100%
  description: string
  components: string[]
  color: string
  position: { x: number, y: number }
}

interface UserFlowStep {
  id: string
  name: string
  description: string
  status: 'working' | 'protected' | 'vulnerable'
  boundaries: string[]
  position: { x: number, y: number }
  size: { width: number, height: number }
}

const GrowthMapPage = () => {
  const { hasOpenRouterKey, hasUserResponses, hasGeneratedValues, databaseHasData } = useSystemState()
  const [activeLayer, setActiveLayer] = useState<string | null>(null)
  const [showBoundaries, setShowBoundaries] = useState(true)

  // Boundary protection layers
  const boundaryLayers: BoundaryLayer[] = [
    {
      id: 'error-boundaries',
      name: 'Error Boundaries',
      type: 'error',
      status: 'protected',
      coverage: 85,
      description: 'React Error Boundaries catch component crashes and show fallback UI',
      components: ['ErrorBoundary', 'DilemmaErrorBoundary', 'AdminErrorBoundary', 'ValuesGenerationErrorBoundary'],
      color: 'rgba(239, 68, 68, 0.2)',
      position: { x: 50, y: 50 }
    },
    {
      id: 'admin-auth',
      name: 'Admin Authentication',
      type: 'auth',
      status: 'protected',
      coverage: 95,
      description: 'NextAuth role-based access control for admin operations',
      components: ['AdminProtection', 'useAdminAuth', 'DestructiveActionProtection'],
      color: 'rgba(245, 158, 11, 0.2)',
      position: { x: 200, y: 100 }
    },
    {
      id: 'data-validation',
      name: 'Data Validation',
      type: 'data',
      status: 'protected',
      coverage: 90,
      description: 'Input sanitization and response validation',
      components: ['validateResponse', 'checkDataIntegrity', 'saveResponses'],
      color: 'rgba(34, 197, 94, 0.2)',
      position: { x: 400, y: 150 }
    },
    {
      id: 'system-state',
      name: 'System State Monitoring',
      type: 'system',
      status: 'working',
      coverage: 100,
      description: 'Real-time system status with visual indicators',
      components: ['useSystemState', 'GlowLight', 'StateAwareButton', 'SystemStatePanel'],
      color: 'rgba(59, 130, 246, 0.2)',
      position: { x: 600, y: 200 }
    },
    {
      id: 'ui-feedback',
      name: 'UI State Feedback',
      type: 'ui',
      status: 'working',
      coverage: 80,
      description: 'COLORIZE.md system with hover explanations and click-to-fix',
      components: ['StateAwareButton', 'GlowLight', 'ResultsStateIndicators', 'AdminStateIndicators'],
      color: 'rgba(168, 85, 247, 0.2)',
      position: { x: 300, y: 300 }
    }
  ]

  // User flow steps with boundary protection
  const userFlowSteps: UserFlowStep[] = [
    {
      id: 'landing',
      name: 'Landing',
      description: 'User arrives and clicks "Generate VALUES.md"',
      status: 'working',
      boundaries: ['error-boundaries', 'ui-feedback'],
      position: { x: 100, y: 400 },
      size: { width: 120, height: 80 }
    },
    {
      id: 'dilemmas',
      name: 'Dilemmas',
      description: 'Answer ethical dilemmas with auto-initialization',
      status: 'protected',
      boundaries: ['error-boundaries', 'data-validation', 'ui-feedback'],
      position: { x: 300, y: 400 },
      size: { width: 120, height: 80 }
    },
    {
      id: 'results',
      name: 'Results',
      description: 'Combinatorial (primary) + LLM (experimental) generation',
      status: 'protected',
      boundaries: ['error-boundaries', 'data-validation', 'system-state', 'ui-feedback'],
      position: { x: 500, y: 400 },
      size: { width: 120, height: 80 }
    },
    {
      id: 'combinatorial',
      name: 'Combinatorial',
      description: 'Primary: Rule-based generation using ethical ontology',
      status: 'working',
      boundaries: ['error-boundaries', 'data-validation', 'ui-feedback'],
      position: { x: 400, y: 300 },
      size: { width: 140, height: 70 }
    },
    {
      id: 'llm-experimental',
      name: 'LLM Polish',
      description: 'Experimental: AI-enhanced for alignment testing',
      status: 'working',
      boundaries: ['error-boundaries', 'system-state', 'ui-feedback'],
      position: { x: 600, y: 300 },
      size: { width: 140, height: 70 }
    },
    {
      id: 'template-testing',
      name: 'Template A/B',
      description: 'Experimental: Test different VALUES.md formats',
      status: 'working',
      boundaries: ['error-boundaries', 'data-validation'],
      position: { x: 750, y: 300 },
      size: { width: 120, height: 70 }
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'System management and configuration',
      status: 'protected',
      boundaries: ['error-boundaries', 'admin-auth', 'system-state', 'ui-feedback'],
      position: { x: 700, y: 400 },
      size: { width: 120, height: 80 }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'protected': return 'text-green-600 bg-green-100'
      case 'working': return 'text-blue-600 bg-blue-100'
      case 'vulnerable': return 'text-orange-600 bg-orange-100'
      case 'missing': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return '🛡️'
      case 'auth': return '🔐'
      case 'data': return '✅'
      case 'system': return '📊'
      case 'ui': return '🎨'
      default: return '⚙️'
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Growth Map & Experimental Loops</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Interactive visualization of user flows, experimental generation methods, and protective boundaries
          </p>
          
          {/* System Status */}
          <div className="mb-6">
            <SystemStatePanel />
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Visualization Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant={showBoundaries ? "default" : "outline"}
                onClick={() => setShowBoundaries(!showBoundaries)}
              >
                {showBoundaries ? '👁️ Hide' : '👁️ Show'} Boundaries
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Active Layer:</span>
                <select 
                  className="px-3 py-1 border rounded"
                  value={activeLayer || ''}
                  onChange={(e) => setActiveLayer(e.target.value || null)}
                >
                  <option value="">All Layers</option>
                  {boundaryLayers.map(layer => (
                    <option key={layer.id} value={layer.id}>
                      {getTypeIcon(layer.type)} {layer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Visualization */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>User Flow & Experimental Architecture</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {activeLayer 
                    ? `Focused on: ${boundaryLayers.find(l => l.id === activeLayer)?.name}` 
                    : 'Complete system view: Primary combinatorial generation + experimental LLM loops'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-gray-50 rounded-lg overflow-hidden"
                  style={{ height: '500px' }}
                >
                  {/* Grid background */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,.3) 1px, transparent 0)`,
                      backgroundSize: '20px 20px'
                    }}
                  />

                  {/* Boundary Layers */}
                  {showBoundaries && boundaryLayers.map((layer) => {
                    if (activeLayer && activeLayer !== layer.id) return null
                    
                    return (
                      <div
                        key={layer.id}
                        className="absolute rounded-lg border-2 border-dashed transition-all duration-300 hover:scale-105"
                        style={{
                          left: layer.position.x,
                          top: layer.position.y,
                          width: 200,
                          height: 120,
                          backgroundColor: layer.color,
                          borderColor: layer.color.replace('0.2', '0.8')
                        }}
                        onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                      >
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getTypeIcon(layer.type)}</span>
                            <span className="font-semibold text-sm">{layer.name}</span>
                          </div>
                          <Badge className={getStatusColor(layer.status)} variant="secondary">
                            {layer.status} ({layer.coverage}%)
                          </Badge>
                          <p className="text-xs mt-2 opacity-75">
                            {layer.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {/* User Flow Steps */}
                  {userFlowSteps.map((step, index) => (
                    <div key={step.id}>
                      {/* Flow connection lines - main flow */}
                      {(step.id === 'landing' || step.id === 'dilemmas' || step.id === 'results') && index < 3 && (
                        <svg className="absolute inset-0 pointer-events-none">
                          <line
                            x1={step.position.x + step.size.width}
                            y1={step.position.y + step.size.height / 2}
                            x2={userFlowSteps[index + 1].position.x}
                            y2={userFlowSteps[index + 1].position.y + userFlowSteps[index + 1].size.height / 2}
                            stroke="#3b82f6"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                          />
                        </svg>
                      )}
                      
                      {/* Branching flow lines from Results */}
                      {step.id === 'results' && (
                        <svg className="absolute inset-0 pointer-events-none">
                          {/* To Combinatorial */}
                          <line
                            x1={step.position.x + step.size.width / 2}
                            y1={step.position.y}
                            x2={400 + 70}
                            y2={300 + 70}
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            markerEnd="url(#arrowhead-green)"
                          />
                          {/* To LLM Experimental */}
                          <line
                            x1={step.position.x + step.size.width / 2}
                            y1={step.position.y}
                            x2={600 + 70}
                            y2={300 + 70}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            markerEnd="url(#arrowhead-orange)"
                          />
                        </svg>
                      )}
                      
                      {/* Experimental loop connections */}
                      {step.id === 'llm-experimental' && (
                        <svg className="absolute inset-0 pointer-events-none">
                          <line
                            x1={step.position.x + step.size.width}
                            y1={step.position.y + step.size.height / 2}
                            x2={750}
                            y2={300 + 35}
                            stroke="#8b5cf6"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                            markerEnd="url(#arrowhead-purple)"
                          />
                        </svg>
                      )}

                      {/* Flow step */}
                      <div
                        className="absolute bg-white border-2 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300"
                        style={{
                          left: step.position.x,
                          top: step.position.y,
                          width: step.size.width,
                          height: step.size.height,
                          borderColor: step.id === 'combinatorial' ? '#10b981' : 
                                     step.id === 'llm-experimental' ? '#f59e0b' : 
                                     step.id === 'template-testing' ? '#8b5cf6' : 
                                     step.status === 'protected' ? '#10b981' : 
                                     step.status === 'working' ? '#3b82f6' : '#f59e0b'
                        }}
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-sm mb-1">
                            {step.id === 'combinatorial' ? '🎯 ' : 
                             step.id === 'llm-experimental' ? '🧪 ' : 
                             step.id === 'template-testing' ? '📊 ' : ''}
                            {step.name}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">
                            {step.description}
                          </p>
                          <div className="flex justify-center">
                            <GlowLight
                              active={step.status === 'protected' || step.status === 'working'}
                              color={step.id === 'combinatorial' ? 'cyan' : 
                                     step.id === 'llm-experimental' ? 'gold' : 
                                     step.id === 'template-testing' ? 'navy' : 
                                     step.status === 'protected' ? 'gold' : 'cyan'}
                              size="sm"
                              tooltip={step.id === 'combinatorial' ? 'Primary generation method' : 
                                       step.id === 'llm-experimental' ? 'Experimental AI polish' : 
                                       step.id === 'template-testing' ? 'Template variant testing' : 
                                       `${step.boundaries.length} boundaries active`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Arrow markers for SVG */}
                  <svg width="0" height="0">
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
                          fill="#3b82f6"
                        />
                      </marker>
                      <marker
                        id="arrowhead-green"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#10b981"
                        />
                      </marker>
                      <marker
                        id="arrowhead-orange"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#f59e0b"
                        />
                      </marker>
                      <marker
                        id="arrowhead-purple"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#8b5cf6"
                        />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Boundary Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Boundary Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {boundaryLayers.map((layer) => (
                    <div 
                      key={layer.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        activeLayer === layer.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm flex items-center gap-2">
                          {getTypeIcon(layer.type)} {layer.name}
                        </span>
                        <Badge className={getStatusColor(layer.status)} variant="secondary">
                          {layer.coverage}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {layer.components.length} components
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Access</span>
                    <GlowLight 
                      active={hasOpenRouterKey} 
                      color="gold" 
                      tooltip={hasOpenRouterKey ? "API Ready" : "Configure in admin"} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Data</span>
                    <GlowLight 
                      active={hasUserResponses || databaseHasData} 
                      color="cyan" 
                      tooltip={hasUserResponses ? "Responses available" : "Complete dilemmas"} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">VALUES.md</span>
                    <GlowLight 
                      active={hasGeneratedValues} 
                      color="navy" 
                      tooltip={hasGeneratedValues ? "File ready" : "Generate from results"} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Layer Details */}
            {activeLayer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Layer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const layer = boundaryLayers.find(l => l.id === activeLayer)
                    if (!layer) return null
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(layer.type)}</span>
                          <span className="font-medium">{layer.name}</span>
                        </div>
                        <Badge className={getStatusColor(layer.status)} variant="secondary">
                          {layer.status} - {layer.coverage}% coverage
                        </Badge>
                        <p className="text-sm text-gray-600">
                          {layer.description}
                        </p>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Components:</h4>
                          <div className="space-y-1">
                            {layer.components.map(comp => (
                              <div key={comp} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {comp}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Flow Types</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-1 bg-blue-500"></div>
                        <span>Main User Flow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-1 bg-green-500 border-dashed border-2"></div>
                        <span>Primary Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-1 bg-orange-500 border-dashed border-2"></div>
                        <span>Experimental LLM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-1 bg-purple-500 border-dotted border-2"></div>
                        <span>Template Testing</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Status</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span>Protected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span>Working</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500"></div>
                        <span>Vulnerable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span>Missing</span>
                      </div>
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

export default GrowthMapPage