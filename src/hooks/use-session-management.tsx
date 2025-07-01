/**
 * Session Management Hook
 * 
 * Handles session persistence, route validation, and automatic redirects
 * for the finite state machine-driven app flow.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEnhancedDilemmaStore } from '@/store/enhanced-dilemma-store';

export interface SessionManagementOptions {
  // Auto-redirect when accessing invalid routes
  enableAutoRedirect?: boolean;
  // Restore session on mount
  restoreOnMount?: boolean;
  // Debug logging
  debug?: boolean;
}

export function useSessionManagement(options: SessionManagementOptions = {}) {
  const {
    enableAutoRedirect = true,
    restoreOnMount = true,
    debug = false
  } = options;
  
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    appState,
    hasValidSession,
    hasCompleteResponses,
    canGenerateValues,
    initializeStateMachine,
    restoreSession,
    canAccessRoute,
    getRedirectPath,
    validateSession
  } = useEnhancedDilemmaStore();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Initialize state machine on mount
  useEffect(() => {
    if (!isInitialized) {
      if (debug) console.log('🔧 Initializing state machine...');
      initializeStateMachine();
      setIsInitialized(true);
    }
  }, [isInitialized, initializeStateMachine, debug]);

  // Restore session on mount
  useEffect(() => {
    if (isInitialized && restoreOnMount && !isRestoring && appState === 'idle') {
      setIsRestoring(true);
      
      if (debug) console.log('🔄 Attempting session restoration...');
      
      restoreSession().then((restored) => {
        if (debug) console.log(`📦 Session restoration: ${restored ? 'success' : 'no session'}`);
        setIsRestoring(false);
      }).catch((error) => {
        console.error('❌ Session restoration failed:', error);
        setIsRestoring(false);
      });
    }
  }, [isInitialized, restoreOnMount, isRestoring, appState, restoreSession, debug]);

  // Route validation and redirection
  useEffect(() => {
    if (!isInitialized || isRestoring || !enableAutoRedirect) return;

    const canAccess = canAccessRoute(pathname);
    
    if (debug) {
      console.log('🛡️ Route validation:', {
        pathname,
        canAccess,
        appState,
        hasValidSession,
        hasCompleteResponses
      });
    }

    if (!canAccess) {
      const redirectPath = getRedirectPath(pathname);
      
      if (redirectPath && redirectPath !== pathname) {
        if (debug) console.log(`🔀 Redirecting: ${pathname} -> ${redirectPath}`);
        router.replace(redirectPath);
      }
    }
  }, [
    pathname, 
    isInitialized, 
    isRestoring, 
    enableAutoRedirect, 
    canAccessRoute, 
    getRedirectPath, 
    router, 
    appState,
    hasValidSession,
    hasCompleteResponses,
    debug
  ]);

  // Session validation for critical routes
  const validateForRoute = (targetRoute: string): boolean => {
    if (!isInitialized) return false;
    
    const valid = validateSession();
    
    if (!valid && (targetRoute.startsWith('/explore') || targetRoute.startsWith('/results'))) {
      if (debug) console.log(`❌ Session invalid for route: ${targetRoute}`);
      return false;
    }
    
    return canAccessRoute(targetRoute);
  };

  // Safe navigation that respects session state
  const navigateToRoute = (path: string, options?: { replace?: boolean }) => {
    if (!validateForRoute(path)) {
      const redirectPath = getRedirectPath(path);
      if (redirectPath) {
        if (debug) console.log(`🔀 Safe navigation redirect: ${path} -> ${redirectPath}`);
        router[options?.replace ? 'replace' : 'push'](redirectPath);
        return false;
      }
      return false;
    }
    
    router[options?.replace ? 'replace' : 'push'](path);
    return true;
  };

  // Check if currently on a protected route
  const isOnProtectedRoute = (): boolean => {
    return pathname.startsWith('/explore') || pathname.startsWith('/results');
  };

  // Get session status for UI
  const getSessionStatus = () => {
    if (!isInitialized) return 'initializing';
    if (isRestoring) return 'restoring';
    if (appState === 'loading') return 'loading';
    if (appState === 'error') return 'error';
    if (appState === 'expired') return 'expired';
    if (!hasValidSession) return 'invalid';
    if (hasCompleteResponses) return 'complete';
    if (hasValidSession) return 'active';
    return 'idle';
  };

  // Get user-friendly status message
  const getStatusMessage = (): string => {
    const status = getSessionStatus();
    
    switch (status) {
      case 'initializing': return 'Setting up your session...';
      case 'restoring': return 'Restoring your progress...';
      case 'loading': return 'Loading dilemmas...';
      case 'error': return 'Something went wrong. Please try again.';
      case 'expired': return 'Your session has expired. Please start over.';
      case 'invalid': return 'No active session found.';
      case 'complete': return 'All dilemmas completed!';
      case 'active': return 'Session active';
      case 'idle': return 'Ready to start';
      default: return '';
    }
  };

  return {
    // State
    isInitialized,
    isRestoring,
    appState,
    sessionStatus: getSessionStatus(),
    statusMessage: getStatusMessage(),
    
    // Session info
    hasValidSession,
    hasCompleteResponses,
    canGenerateValues,
    
    // Actions
    validateForRoute,
    navigateToRoute,
    isOnProtectedRoute,
    
    // Debug info
    debug: debug ? {
      pathname,
      appState,
      hasValidSession,
      hasCompleteResponses,
      canAccessCurrentRoute: canAccessRoute(pathname)
    } : undefined
  };
}

/**
 * Higher-order component for page-level session protection
 */
export function withSessionProtection<T extends object>(
  Component: React.ComponentType<T>,
  options: SessionManagementOptions & {
    redirectTo?: string;
    requireComplete?: boolean;
  } = {}
) {
  return function ProtectedComponent(props: T) {
    const session = useSessionManagement(options);
    
    // Show loading state while initializing
    if (!session.isInitialized || session.isRestoring) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{session.statusMessage}</p>
          </div>
        </div>
      );
    }
    
    // Check session requirements
    if (options.requireComplete && !session.hasCompleteResponses) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Session Incomplete</h2>
            <p className="text-muted-foreground mb-6">
              You need to complete all dilemmas before accessing this page.
            </p>
            <button
              onClick={() => session.navigateToRoute('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}