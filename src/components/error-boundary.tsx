'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // errorTrackingService.captureException(error, { extra: errorInfo })
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error!} retry={this.retry} />
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              ⚠️ Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-red-700">
                We encountered an unexpected error. This has been logged for debugging.
              </p>
              
              {process.env.NODE_ENV === 'development' && error && (
                <details className="bg-red-100 p-3 rounded border text-sm">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="font-mono text-red-700 whitespace-pre-wrap">
                    {error.name}: {error.message}
                    {error.stack && (
                      <pre className="mt-2 text-xs overflow-x-auto">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.retry} variant="outline" size="sm">
                  🔄 Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                >
                  🔄 Refresh Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline" 
                  size="sm"
                >
                  🏠 Go Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different contexts
export const DilemmaErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const DilemmaFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">❌ Dilemma Loading Error</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-red-700">
            Unable to load the current dilemma. This might be due to a connection issue or data problem.
          </p>
          <div className="flex gap-2">
            <Button onClick={retry} size="sm">
              🔄 Retry
            </Button>
            <Button 
              onClick={() => window.location.href = '/api/dilemmas/random'} 
              variant="outline" 
              size="sm"
            >
              🎲 Get Different Dilemma
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ErrorBoundary fallback={DilemmaFallback}>
      {children}
    </ErrorBoundary>
  )
}

export const AdminErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const AdminFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
    <Card className="border-red-800 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">🔒 Admin Panel Error</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-red-700">
            Admin panel encountered an error. Admin operations have been suspended for safety.
          </p>
          <div className="flex gap-2">
            <Button onClick={retry} size="sm">
              🔄 Retry
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin'} 
              variant="outline" 
              size="sm"
            >
              🏠 Return to Admin Home
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ErrorBoundary fallback={AdminFallback}>
      {children}
    </ErrorBoundary>
  )
}

export const ValuesGenerationErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const GenerationFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">⚡ Values Generation Error</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-red-700">
            There was an error generating your VALUES.md file. Your responses are safe.
          </p>
          <div className="flex gap-2">
            <Button onClick={retry} size="sm">
              🔄 Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/results'} 
              variant="outline" 
              size="sm"
            >
              🔙 Back to Results
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ErrorBoundary fallback={GenerationFallback}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary