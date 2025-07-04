'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ValuesComponent {
  id: string
  name: string
  source: 'responses' | 'motifs' | 'statistics' | 'tf-idf' | 'llm'
  weight: number
  content: string
  tags: string[]
  confidence: number
  position: { x: number, y: number }
  color: string
}

interface ComputationStep {
  id: string
  name: string
  description: string
  inputs: string[]
  outputs: string[]
  status: 'pending' | 'processing' | 'complete'
  duration: number
  details: any
}

const ValuesWaterfallPage = () => {
  const [selectedSession, setSelectedSession] = useState<string>('demo-session-123')
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [computationSteps, setComputationSteps] = useState<ComputationStep[]>([])
  const [valuesComponents, setValuesComponents] = useState<ValuesComponent[]>([])
  const [finalDocument, setFinalDocument] = useState('')

  // Sample computation steps for values.md generation
  const initializeSteps = () => {
    const steps: ComputationStep[] = [
      {
        id: 'response-analysis',
        name: 'Response Analysis',
        description: 'Parse user responses and extract ethical patterns',
        inputs: ['userResponses'],
        outputs: ['responsePatterns', 'motifCounts'],
        status: 'pending',
        duration: 250,
        details: {
          totalResponses: 12,
          uniqueMotifs: 8,
          patterns: ['CARE_PARTICULAR: 4x', 'AUTONOMY_RESPECT: 3x', 'HARM_MINIMIZE: 2x']
        }
      },
      {
        id: 'motif-weighting',
        name: 'Motif Weighting',
        description: 'Calculate frequency-based weights for each ethical motif',
        inputs: ['motifCounts'],
        outputs: ['motifWeights'],
        status: 'pending',
        duration: 150,
        details: {
          topMotifs: [
            { motif: 'CARE_PARTICULAR', weight: 0.33, frequency: 4 },
            { motif: 'AUTONOMY_RESPECT', weight: 0.25, frequency: 3 },
            { motif: 'HARM_MINIMIZE', weight: 0.17, frequency: 2 }
          ]
        }
      },
      {
        id: 'statistical-analysis',
        name: 'Statistical Analysis',
        description: 'Generate decision patterns and confidence metrics',
        inputs: ['responsePatterns', 'motifWeights'],
        outputs: ['statistics'],
        status: 'pending',
        duration: 200,
        details: {
          avgResponseTime: 28.5,
          difficultyCorrelation: 0.72,
          consistencyScore: 0.89,
          domainPreferences: { medical: 0.3, education: 0.25, business: 0.2 }
        }
      },
      {
        id: 'tf-idf-processing',
        name: 'TF-IDF Analysis',
        description: 'Extract key terms and concepts from reasoning text',
        inputs: ['userReasonings'],
        outputs: ['keyTerms', 'conceptWeights'],
        status: 'pending',
        duration: 300,
        details: {
          topTerms: [
            { term: 'compassion', tfidf: 0.85, frequency: 7 },
            { term: 'fairness', tfidf: 0.72, frequency: 5 },
            { term: 'responsibility', tfidf: 0.68, frequency: 4 }
          ],
          conceptClusters: ['care-based reasoning', 'justice orientation', 'pragmatic solutions']
        }
      },
      {
        id: 'tag-generation',
        name: 'Tag Generation',
        description: 'Create semantic tags from patterns and terms',
        inputs: ['motifWeights', 'keyTerms', 'statistics'],
        outputs: ['semanticTags'],
        status: 'pending',
        duration: 180,
        details: {
          generatedTags: [
            { tag: 'healthcare-focused', confidence: 0.91 },
            { tag: 'empathetic-decision-maker', confidence: 0.87 },
            { tag: 'evidence-based', confidence: 0.74 },
            { tag: 'stakeholder-aware', confidence: 0.69 }
          ]
        }
      },
      {
        id: 'template-selection',
        name: 'Template Selection',
        description: 'Choose optimal values.md template based on user profile',
        inputs: ['motifWeights', 'statistics', 'semanticTags'],
        outputs: ['selectedTemplate'],
        status: 'pending',
        duration: 100,
        details: {
          candidates: [
            { template: 'narrative', score: 0.92 },
            { template: 'enhanced', score: 0.87 },
            { template: 'framework-based', score: 0.73 }
          ],
          selected: 'narrative',
          reasoning: 'High empathy scores and detailed reasoning patterns suggest narrative approach'
        }
      },
      {
        id: 'document-weaving',
        name: 'Document Weaving',
        description: 'Combine all components into cohesive values.md document',
        inputs: ['selectedTemplate', 'motifWeights', 'statistics', 'semanticTags', 'keyTerms'],
        outputs: ['valuesDocument'],
        status: 'pending',
        duration: 400,
        details: {
          sections: [
            'Core Values Statement (motif-driven)',
            'Decision Making Patterns (statistics)',
            'Key Principles (TF-IDF terms)',
            'AI Interaction Guidelines (template-based)'
          ],
          wordCount: 347,
          readabilityScore: 0.78
        }
      }
    ]
    setComputationSteps(steps)
  }

  // Initialize visualization components
  const initializeComponents = () => {
    const components: ValuesComponent[] = [
      {
        id: 'responses',
        name: 'User Responses',
        source: 'responses',
        weight: 1.0,
        content: '12 ethical dilemma responses',
        tags: ['raw-data', 'user-input'],
        confidence: 1.0,
        position: { x: 50, y: 100 },
        color: '#3b82f6'
      },
      {
        id: 'motifs',
        name: 'Ethical Motifs',
        source: 'motifs',
        weight: 0.8,
        content: 'CARE_PARTICULAR, AUTONOMY_RESPECT, HARM_MINIMIZE',
        tags: ['ethics', 'patterns'],
        confidence: 0.92,
        position: { x: 250, y: 150 },
        color: '#10b981'
      },
      {
        id: 'statistics',
        name: 'Decision Statistics',
        source: 'statistics',
        weight: 0.6,
        content: 'Response patterns, timing, consistency',
        tags: ['analytics', 'behavior'],
        confidence: 0.89,
        position: { x: 450, y: 100 },
        color: '#f59e0b'
      },
      {
        id: 'terms',
        name: 'Key Terms',
        source: 'tf-idf',
        weight: 0.4,
        content: 'compassion, fairness, responsibility',
        tags: ['language', 'concepts'],
        confidence: 0.76,
        position: { x: 350, y: 250 },
        color: '#ec4899'
      },
      {
        id: 'tags',
        name: 'Semantic Tags',
        source: 'tf-idf',
        weight: 0.5,
        content: 'healthcare-focused, empathetic-decision-maker',
        tags: ['classification', 'personality'],
        confidence: 0.83,
        position: { x: 550, y: 200 },
        color: '#8b5cf6'
      }
    ]
    setValuesComponents(components)
  }

  useEffect(() => {
    initializeSteps()
    initializeComponents()
  }, [])

  const playWaterfall = async () => {
    setIsPlaying(true)
    setCurrentStep(0)
    
    for (let i = 0; i < computationSteps.length; i++) {
      // Mark current step as processing
      setComputationSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx === i ? 'processing' : idx < i ? 'complete' : 'pending'
      })))
      setCurrentStep(i)
      
      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, computationSteps[i].duration))
      
      // Mark as complete
      setComputationSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx <= i ? 'complete' : 'pending'
      })))
    }
    
    // Generate final document
    setFinalDocument(`# Personal Values Configuration

## Core Ethical Framework
Based on your responses to 12 ethical dilemmas, your decision-making pattern strongly emphasizes:

**Care Ethics (33%)** - You prioritize compassion and relationship preservation in difficult situations
**Autonomy Respect (25%)** - You value individual choice and personal agency
**Harm Minimization (17%)** - You seek solutions that reduce overall negative impact

## Decision Patterns
- **Response Consistency**: 89% (highly consistent ethical reasoning)
- **Domain Preferences**: Healthcare (30%), Education (25%), Business (20%)
- **Average Deliberation**: 28.5 seconds (thoughtful consideration)
- **Difficulty Correlation**: 0.72 (more time on complex scenarios)

## Key Principles
Your reasoning emphasizes these concepts:
- **Compassion**: Primary consideration in interpersonal conflicts
- **Fairness**: Balancing competing interests and stakeholder needs  
- **Responsibility**: Acknowledging consequences and duty of care
- **Evidence-based**: Preferring solutions grounded in data and experience

## AI Interaction Guidelines
When working with AI systems, you should:
- Request consideration of emotional and relational impacts
- Ask for multiple stakeholder perspectives on decisions
- Prefer graduated, nuanced solutions over binary choices
- Seek recommendations that account for vulnerable populations
- Request evidence and reasoning behind AI suggestions

## Personal Tags
\`healthcare-focused\` \`empathetic-decision-maker\` \`evidence-based\` \`stakeholder-aware\`

---
*Generated from ethical dilemma responses using motif analysis, statistical patterns, and TF-IDF concept extraction*`)
    
    setIsPlaying(false)
  }

  const resetWaterfall = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setFinalDocument('')
    setComputationSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500'
      case 'processing': return 'bg-blue-500 animate-pulse'
      case 'pending': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Values.md Computation Waterfall
          </h1>
          <p className="text-gray-300 mb-4">
            Privacy-first analysis: responses → motifs → statistics → TF-IDF → template selection → VALUES.md weaving
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Waterfall Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={playWaterfall} 
                disabled={isPlaying}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPlaying ? '⏳ Processing...' : '▶️ Run Computation'}
              </Button>
              <Button onClick={resetWaterfall} variant="outline">
                🔄 Reset
              </Button>
              <div className="text-sm text-gray-400">
                Session: {selectedSession}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Data Flow Visualization - Main Focus */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardHeader>
                <CardTitle className="text-white">Data Weaving Through Ethical Striations</CardTitle>
                <p className="text-sm text-gray-400">Watch responses flow through ethical framework striations, analyzed with Claude 3.5 Sonnet, and woven into personalized VALUES.md</p>
              </CardHeader>
              <CardContent>
                {/* Striations Visualization */}
                <div className="relative overflow-hidden" style={{ height: '600px' }}>
                  {/* Background Striations - Ethical Framework Layers */}
                  <div className="absolute inset-0">
                    {['Kantian Layer', 'Utilitarian Layer', 'Care Ethics Layer', 'Virtue Ethics Layer', 'Rights-Based Layer'].map((layer, index) => (
                      <div
                        key={layer}
                        className="absolute w-full opacity-20 border-t border-dashed"
                        style={{
                          top: `${15 + index * 15}%`,
                          height: '12%',
                          background: `linear-gradient(90deg, 
                            hsla(${index * 60}, 70%, 50%, 0.1) 0%,
                            hsla(${index * 60}, 70%, 60%, 0.2) 50%,
                            hsla(${index * 60}, 70%, 50%, 0.1) 100%)`
                        }}
                      >
                        <span className="text-xs text-gray-500 ml-2 mt-1 absolute">{layer}</span>
                      </div>
                    ))}
                  </div>

                  {/* Flowing Data Particles */}
                  {currentStep > 0 && (
                    <>
                      {/* User Responses flowing in */}
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={`response-${i}`}
                          className="absolute w-3 h-3 bg-blue-400 rounded-full animate-pulse"
                          style={{
                            left: `${5 + (i * 7)}%`,
                            top: `${10 + Math.sin(i) * 5}%`,
                            animationDelay: `${i * 100}ms`,
                            animation: currentStep >= 1 ? `flowRight 3s ease-in-out ${i * 0.1}s forwards` : 'none'
                          }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-300 whitespace-nowrap">
                            R{i+1}
                          </div>
                        </div>
                      ))}

                      {/* Responses breaking apart into motifs */}
                      {currentStep >= 2 && (
                        <>
                          {['CARE', 'AUTONOMY', 'HARM_MIN', 'JUSTICE', 'DUTY'].map((motif, i) => (
                            <div
                              key={motif}
                              className="absolute transition-all duration-1000"
                              style={{
                                left: `${20 + i * 15}%`,
                                top: `${25 + (i % 2) * 10}%`,
                                transform: currentStep >= 2 ? 'scale(1)' : 'scale(0)'
                              }}
                            >
                              <div className="w-16 h-8 bg-green-500/30 border border-green-400 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-green-300 font-mono">{motif}</span>
                              </div>
                              {/* Threads connecting to responses */}
                              <svg className="absolute -top-4 -left-4 w-24 h-16 pointer-events-none">
                                <path
                                  d={`M 0 8 Q 12 0 24 8`}
                                  stroke="rgba(34, 197, 94, 0.3)"
                                  strokeWidth="1"
                                  fill="none"
                                  strokeDasharray="2,2"
                                />
                              </svg>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Statistical patterns emerging */}
                      {currentStep >= 3 && (
                        <div className="absolute right-10 top-1/3 transition-all duration-1000">
                          <div className="bg-orange-500/20 border border-orange-400 rounded-lg p-3 min-w-32">
                            <div className="text-xs text-orange-300 font-semibold mb-1">Statistics</div>
                            <div className="text-xs text-orange-200 space-y-1">
                              <div>Consistency: 89%</div>
                              <div>Avg Time: 28.5s</div>
                              <div>Patterns: 8</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TF-IDF terms floating up */}
                      {currentStep >= 4 && (
                        <>
                          {['compassion', 'fairness', 'responsibility', 'evidence'].map((term, i) => (
                            <div
                              key={term}
                              className="absolute transition-all duration-1000"
                              style={{
                                left: `${30 + i * 8}%`,
                                top: `${45 + Math.sin(i) * 3}%`,
                                transform: currentStep >= 4 ? 'translateY(0)' : 'translateY(20px)',
                                opacity: currentStep >= 4 ? 1 : 0
                              }}
                            >
                              <div className="bg-pink-500/20 border border-pink-400 rounded px-2 py-1">
                                <span className="text-xs text-pink-300">{term}</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Semantic tags forming */}
                      {currentStep >= 5 && (
                        <div className="absolute left-1/2 top-2/3 transform -translate-x-1/2 transition-all duration-1000">
                          <div className="bg-purple-500/20 border border-purple-400 rounded-lg p-2">
                            <div className="text-xs text-purple-300 font-semibold mb-1">Semantic Profile</div>
                            <div className="flex flex-wrap gap-1">
                              {['healthcare-focused', 'empathetic', 'evidence-based'].map(tag => (
                                <span key={tag} className="text-xs bg-purple-600/30 text-purple-200 px-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Final document weaving together */}
                      {currentStep >= 6 && (
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-all duration-1000">
                          <div className="bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 border border-gray-400 rounded-lg p-4 min-w-80">
                            <div className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <span>📄</span> VALUES.md Document
                            </div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>✓ Core Values (from motifs)</div>
                              <div>✓ Decision Patterns (from statistics)</div>
                              <div>✓ Key Principles (from TF-IDF)</div>
                              <div>✓ AI Guidelines (from template)</div>
                            </div>
                            {/* Weaving threads from components */}
                            <svg className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-64 h-20 pointer-events-none">
                              {[0, 1, 2, 3].map(i => (
                                <path
                                  key={i}
                                  d={`M ${i * 20 + 32} 0 Q ${i * 20 + 32} 10 32 20`}
                                  stroke={`hsla(${i * 90}, 70%, 60%, 0.4)`}
                                  strokeWidth="2"
                                  fill="none"
                                  strokeDasharray="3,3"
                                  className="animate-pulse"
                                />
                              ))}
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Weaving animation lines */}
                      {currentStep >= 6 && (
                        <>
                          {/* Connecting lines showing data flow */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                              </linearGradient>
                            </defs>
                            {/* Flow lines */}
                            <path
                              d="M 50 60 Q 150 100 250 140 Q 350 180 450 220 Q 550 260 650 300"
                              stroke="url(#flowGradient)"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="8,4"
                              className="animate-pulse"
                            />
                          </svg>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Step Indicators */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {computationSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                        step.status === 'processing' ? 'bg-blue-500 text-white animate-pulse' :
                        step.status === 'complete' ? 'bg-green-500 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {index + 1}. {step.name}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {computationSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        step.status === 'processing' ? 'border-blue-500 bg-blue-900/20' :
                        step.status === 'complete' ? 'border-green-500 bg-green-900/20' :
                        'border-gray-600 bg-gray-900/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStepStatusColor(step.status)}`} />
                          <h3 className="font-semibold">{step.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {step.duration}ms
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400">
                          Step {index + 1}/{computationSteps.length}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-3">{step.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-blue-400">Inputs:</span>
                          <div className="mt-1">
                            {step.inputs.map(input => (
                              <Badge key={input} variant="secondary" className="mr-1 mb-1 text-xs">
                                {input}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-green-400">Outputs:</span>
                          <div className="mt-1">
                            {step.outputs.map(output => (
                              <Badge key={output} variant="secondary" className="mr-1 mb-1 text-xs">
                                {output}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {step.status === 'complete' && (
                        <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
                          <div className="text-green-400 font-semibold mb-1">Results:</div>
                          <pre className="text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(step.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Component Flow Visualization */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Data Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative" style={{ height: '300px' }}>
                  {valuesComponents.map((component) => (
                    <div
                      key={component.id}
                      className="absolute p-2 rounded-lg border text-xs transition-all duration-300"
                      style={{
                        left: component.position.x,
                        top: component.position.y,
                        backgroundColor: component.color + '20',
                        borderColor: component.color,
                        opacity: currentStep >= valuesComponents.indexOf(component) ? 1 : 0.3
                      }}
                    >
                      <div className="font-semibold mb-1">{component.name}</div>
                      <div className="text-gray-300 mb-1">{component.content}</div>
                      <div className="flex gap-1">
                        {component.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {Math.round(component.confidence * 100)}% confidence
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completed Steps:</span>
                    <span className="text-green-400">
                      {computationSteps.filter(s => s.status === 'complete').length}/{computationSteps.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Time:</span>
                    <span className="text-blue-400">
                      {computationSteps
                        .filter(s => s.status === 'complete')
                        .reduce((sum, s) => sum + s.duration, 0)}ms
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(computationSteps.filter(s => s.status === 'complete').length / computationSteps.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final Document Preview */}
            {finalDocument && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Generated Values.md</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto text-xs">
                    <pre className="whitespace-pre-wrap text-gray-300">
                      {finalDocument}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValuesWaterfallPage