'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminProtectionProps {
  children: React.ReactNode
  requireRole?: string
  fallback?: React.ReactNode
}

// Admin role checking hook
export const useAdminAuth = () => {
  const { data: session, status } = useSession()
  const [isVerifying, setIsVerifying] = useState(true)
  const [hasAdminAccess, setHasAdminAccess] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      setHasAdminAccess(false)
      setIsVerifying(false)
      return
    }

    if (session?.user?.email) {
      // Check if user has admin role
      const isAdmin = session.user.email === process.env.ADMIN_EMAIL || 
                     (session.user as any).role === 'admin'
      setHasAdminAccess(isAdmin)
    }
    
    setIsVerifying(false)
  }, [session, status])

  return {
    isVerifying,
    hasAdminAccess,
    session,
    status
  }
}

// Admin boundary protection component
export const AdminProtection = ({ children, requireRole = 'admin', fallback }: AdminProtectionProps) => {
  const { isVerifying, hasAdminAccess, status } = useAdminAuth()
  const [showLoginForm, setShowLoginForm] = useState(false)

  if (isVerifying) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">🔐 Verifying Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-700">Checking admin privileges...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === 'unauthenticated') {
    return fallback || (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">🔒 Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-700">
              Admin access is required to view this page. Please sign in with admin credentials.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowLoginForm(true)}
                className="bg-red-800 hover:bg-red-900 text-white"
              >
                🔑 Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                🏠 Go Home
              </Button>
            </div>
            
            {showLoginForm && (
              <AdminLoginForm onSuccess={() => setShowLoginForm(false)} />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasAdminAccess) {
    return fallback || (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">🚫 Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-700">
              You do not have the required admin privileges to access this page.
            </p>
            <div className="text-sm text-red-600 bg-red-100 p-3 rounded">
              <strong>Required Role:</strong> {requireRole}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = '/api/auth/signout'}
                className="bg-red-800 hover:bg-red-900 text-white"
              >
                🔐 Sign Out
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                🏠 Go Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // User has admin access - render protected content
  return <>{children}</>
}

// Inline admin login form
const AdminLoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        onSuccess()
        window.location.reload()
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded border">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-red-800 hover:bg-red-900 text-white"
      >
        {isLoading ? 'Signing in...' : '🔑 Sign In'}
      </Button>
    </form>
  )
}

// Destructive action protection
interface DestructiveActionProps {
  children: React.ReactNode
  action: string
  onConfirm: () => void
  requireConfirmation?: boolean
  confirmationText?: string
}

export const DestructiveActionProtection = ({ 
  children, 
  action, 
  onConfirm, 
  requireConfirmation = true,
  confirmationText = 'DELETE_ALL_DATA'
}: DestructiveActionProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    if (requireConfirmation && confirmationInput !== confirmationText) {
      return
    }

    setIsExecuting(true)
    try {
      await onConfirm()
    } finally {
      setIsExecuting(false)
      setShowConfirmation(false)
      setConfirmationInput('')
    }
  }

  return (
    <>
      <div onClick={() => setShowConfirmation(true)}>
        {children}
      </div>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="border-red-800 bg-red-50 max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-red-800">⚠️ Destructive Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-red-700">
                  You are about to perform: <strong>{action}</strong>
                </p>
                <p className="text-red-600 text-sm">
                  This action cannot be undone. All data will be permanently deleted.
                </p>
                
                {requireConfirmation && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmation">
                      Type <code className="bg-red-100 px-1 rounded text-red-800">{confirmationText}</code> to confirm:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value)}
                      className="border-red-300"
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleExecute}
                    disabled={isExecuting || (requireConfirmation && confirmationInput !== confirmationText)}
                    className="bg-red-800 hover:bg-red-900 text-white"
                  >
                    {isExecuting ? 'Executing...' : '🗑️ Confirm Delete'}
                  </Button>
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default AdminProtection