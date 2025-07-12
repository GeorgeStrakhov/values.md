'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Simple cache to prevent multiple API calls
let systemStateCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 30000 // 30 seconds

// System state detection hook
export const useSystemState = () => {
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false)
  const [hasUserResponses, setHasUserResponses] = useState(false)
  const [hasGeneratedValues, setHasGeneratedValues] = useState(false)
  const [databaseHasData, setDatabaseHasData] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSystemState = async () => {
      try {
        // Check localStorage for responses (fast, synchronous)
        const responses = localStorage.getItem('responses')
        const parsedResponses = responses ? JSON.parse(responses) : []
        const hasResponses = Array.isArray(parsedResponses) && parsedResponses.length > 0
        setHasUserResponses(hasResponses)

        // Check for generated VALUES.md (fast, synchronous)
        const values = localStorage.getItem('generated-values')
        const hasValues = !!values
        setHasGeneratedValues(hasValues)

        // Use cache if available and fresh
        const now = Date.now()
        if (systemStateCache && (now - cacheTimestamp) < CACHE_DURATION) {
          setHasOpenRouterKey(systemStateCache.hasOpenRouterKey)
          setDatabaseHasData(systemStateCache.databaseHasData)
          setLoading(false)
          return
        }

        // Set optimistic defaults while checking APIs
        setHasOpenRouterKey(true)
        setDatabaseHasData(true)
        setLoading(false)

        // Check APIs and update cache (non-blocking)
        Promise.all([
          fetch('/api/admin/check-env').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/health').then(r => r.ok ? r.json() : null).catch(() => null)
        ]).then(([envData, healthData]) => {
          const apiKeyAvailable = envData ? !!envData.OPENROUTER_API_KEY : true
          const dbHasData = healthData ? (healthData.database?.dilemmas > 0) : true

          // Update cache
          systemStateCache = {
            hasOpenRouterKey: apiKeyAvailable,
            databaseHasData: dbHasData
          }
          cacheTimestamp = now

          // Update state
          setHasOpenRouterKey(apiKeyAvailable)
          setDatabaseHasData(dbHasData)
        }).catch(() => {
          // Keep optimistic defaults on error
        })
      } catch (error) {
        console.error('Error checking system state:', error)
        setHasOpenRouterKey(true)
        setDatabaseHasData(true)
        setLoading(false)
      }
    }

    checkSystemState()
  }, [])

  return {
    hasOpenRouterKey,
    hasUserResponses,
    hasGeneratedValues,
    databaseHasData,
    loading
  }
}

// GlowLight component for system state indication
interface GlowLightProps {
  active: boolean
  color: 'gold' | 'maroon' | 'cyan' | 'navy' | 'grey'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  onClick?: () => void
}

export const GlowLight = ({ active, color, size = 'md', tooltip, onClick }: GlowLightProps) => {
  const { hasOpenRouterKey, hasUserResponses, hasGeneratedValues, databaseHasData } = useSystemState()

  const colors = {
    gold: active ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-gray-400',
    maroon: active ? 'bg-red-800 shadow-red-800/50' : 'bg-gray-400',
    cyan: active ? 'bg-cyan-400 shadow-cyan-400/50' : 'bg-gray-400',
    navy: active ? 'bg-blue-900 shadow-blue-900/50' : 'bg-gray-400',
    grey: 'bg-gray-400'
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const getClickToFixAction = () => {
    if (active || onClick) return onClick

    // Auto-generate click-to-fix based on color/state
    switch (color) {
      case 'gold':
        return hasOpenRouterKey ? undefined : () => window.location.href = '/admin'
      case 'cyan':
        return (hasUserResponses || databaseHasData) ? undefined : () => window.location.href = '/start'
      case 'navy':
        return hasGeneratedValues ? undefined : () => window.location.href = '/results'
      default:
        return undefined
    }
  }

  const getEnhancedTooltip = () => {
    if (tooltip) return tooltip
    if (active) return 'Feature available'

    // Auto-generate tooltip with fix action
    switch (color) {
      case 'gold':
        return hasOpenRouterKey ? 'API Ready' : 'API not configured - Click to configure in admin'
      case 'cyan':
        return (hasUserResponses || databaseHasData) ? 'Data available' : 'No data - Click to start dilemmas'
      case 'navy':
        return hasGeneratedValues ? 'VALUES.md ready' : 'VALUES.md not generated - Click to generate'
      default:
        return active ? 'Available' : 'Unavailable'
    }
  }

  const clickAction = getClickToFixAction()
  const enhancedTooltip = getEnhancedTooltip()

  return (
    <div 
      className={`
        ${sizes[size]} rounded-full ${colors[color]} 
        ${active ? 'animate-pulse shadow-lg' : ''} 
        ${clickAction ? 'cursor-pointer hover:scale-110' : ''} 
        transition-all duration-300
      `}
      onClick={clickAction}
      title={enhancedTooltip}
    />
  )
}

// System State Indicator Panel
export const SystemStatePanel = () => {
  const { hasOpenRouterKey, hasUserResponses, hasGeneratedValues, databaseHasData, loading } = useSystemState()

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
            Checking system state...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-sm">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <GlowLight 
              active={hasOpenRouterKey} 
              color="gold" 
              tooltip={hasOpenRouterKey ? "OpenRouter API ready" : "Configure API key in admin"} 
            />
            <span className={hasOpenRouterKey ? 'text-yellow-700' : 'text-gray-600'}>
              LLM Generation {hasOpenRouterKey ? 'Ready' : 'Unavailable'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <GlowLight 
              active={hasUserResponses} 
              color="cyan" 
              tooltip={hasUserResponses ? "User responses available" : "Complete dilemmas to collect data"} 
            />
            <span className={hasUserResponses ? 'text-cyan-700' : 'text-gray-600'}>
              Response Data {hasUserResponses ? 'Available' : 'None'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <GlowLight 
              active={hasGeneratedValues} 
              color="navy" 
              tooltip={hasGeneratedValues ? "VALUES.md file ready" : "Generate VALUES.md from responses"} 
            />
            <span className={hasGeneratedValues ? 'text-blue-900' : 'text-gray-600'}>
              VALUES.md {hasGeneratedValues ? 'Ready' : 'Not Generated'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <GlowLight 
              active={databaseHasData} 
              color="cyan" 
              tooltip={databaseHasData ? "Database has dilemmas" : "Database needs initialization"} 
            />
            <span className={databaseHasData ? 'text-cyan-700' : 'text-gray-600'}>
              Database {databaseHasData ? 'Populated' : 'Empty'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Colored button variants based on system state with click-to-fix
interface StateAwareButtonProps {
  state: 'gold' | 'maroon' | 'cyan' | 'navy' | 'grey'
  active: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  unavailableReason?: string
  fixAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export const StateAwareButton = ({ 
  state, 
  active, 
  children, 
  onClick, 
  disabled = false,
  className = '',
  unavailableReason,
  fixAction
}: StateAwareButtonProps) => {
  const { hasOpenRouterKey, hasUserResponses, hasGeneratedValues, databaseHasData } = useSystemState()

  const getButtonStyle = () => {
    if (!active || disabled) {
      return 'bg-gray-400 text-gray-600 cursor-pointer border-gray-300 hover:bg-gray-500'
    }

    switch (state) {
      case 'gold':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-400/30 border-yellow-500'
      case 'maroon':
        return 'bg-red-800 hover:bg-red-900 text-white border-2 border-red-600'
      case 'cyan':
        return 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500'
      case 'navy':
        return 'bg-blue-900 hover:bg-blue-950 text-white border-blue-800'
      case 'grey':
      default:
        return 'bg-gray-400 text-gray-600 cursor-pointer border-gray-300 hover:bg-gray-500'
    }
  }

  const getUnavailableReason = () => {
    if (unavailableReason) return unavailableReason

    // Auto-detect reason based on state and system status
    switch (state) {
      case 'gold':
        return hasOpenRouterKey ? '' : 'OpenRouter API key not configured. Admin access required.'
      case 'cyan':
        return hasUserResponses || databaseHasData ? '' : 'No data available. Complete dilemmas first.'
      case 'navy':
        return hasGeneratedValues ? '' : 'VALUES.md not generated yet. Complete the flow first.'
      default:
        return active ? '' : 'Feature temporarily unavailable.'
    }
  }

  const getFixAction = () => {
    if (fixAction) return fixAction

    // Auto-detect fix action based on state
    switch (state) {
      case 'gold':
        return hasOpenRouterKey ? undefined : {
          label: 'Configure API Key',
          href: '/admin'
        }
      case 'cyan':
        return hasUserResponses || databaseHasData ? undefined : {
          label: 'Start Dilemmas',
          href: '/start'
        }
      case 'navy':
        return hasGeneratedValues ? undefined : {
          label: 'Generate VALUES.md',
          href: '/results'
        }
      default:
        return undefined
    }
  }

  const reason = getUnavailableReason()
  const fixActionData = getFixAction()

  const handleClick = () => {
    if (active && !disabled && onClick) {
      onClick()
    } else if (!active && fixActionData) {
      if (fixActionData.onClick) {
        fixActionData.onClick()
      } else if (fixActionData.href) {
        window.location.href = fixActionData.href
      }
    }
  }

  return (
    <Button 
      onClick={handleClick}
      disabled={disabled}
      className={`${getButtonStyle()} ${className}`}
      title={!active && reason ? `${reason} Click to ${fixActionData?.label || 'fix'}` : undefined}
    >
      {children}
      {!active && fixActionData && (
        <span className="ml-2 text-xs opacity-75">
          → {fixActionData.label}
        </span>
      )}
    </Button>
  )
}

// System state indicators for different contexts
export const AdminStateIndicators = () => {
  const { hasOpenRouterKey, databaseHasData } = useSystemState()

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <GlowLight 
          active={hasOpenRouterKey} 
          color="gold" 
          tooltip="LLM API Status"
        />
        <span className="text-sm">API Ready</span>
      </div>
      <div className="flex items-center gap-2">
        <GlowLight 
          active={databaseHasData} 
          color="cyan" 
          tooltip="Database Status"
        />
        <span className="text-sm">DB Populated</span>
      </div>
    </div>
  )
}

export const ResultsStateIndicators = () => {
  const { hasUserResponses, hasGeneratedValues, hasOpenRouterKey } = useSystemState()

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <GlowLight 
          active={hasUserResponses} 
          color="cyan" 
          tooltip="Response Data Available"
        />
        <span className="text-sm">Responses</span>
      </div>
      <div className="flex items-center gap-2">
        <GlowLight 
          active={hasOpenRouterKey} 
          color="gold" 
          tooltip="AI Generation Available"
        />
        <span className="text-sm">AI Ready</span>
      </div>
      <div className="flex items-center gap-2">
        <GlowLight 
          active={hasGeneratedValues} 
          color="navy" 
          tooltip="VALUES.md Generated"
        />
        <span className="text-sm">VALUES.md</span>
      </div>
    </div>
  )
}