/**
 * Session Management Hook Tests
 * 
 * Tests the useSessionManagement hook functionality including
 * route validation, redirects, and session restoration.
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/'
};

const mockUseRouter = vi.fn(() => mockRouter);
const mockUsePathname = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
  usePathname: mockUsePathname
}));

// Mock the enhanced store
const mockStore = {
  appState: 'idle',
  hasValidSession: false,
  hasCompleteResponses: false,
  canGenerateValues: false,
  initializeStateMachine: vi.fn(),
  restoreSession: vi.fn(),
  canAccessRoute: vi.fn(),
  getRedirectPath: vi.fn(),
  validateSession: vi.fn()
};

vi.mock('../src/store/enhanced-dilemma-store', () => ({
  useEnhancedDilemmaStore: () => mockStore
}));

// Import after mocks
import { useSessionManagement } from '../src/hooks/use-session-management';

describe('useSessionManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.push.mockClear();
    mockRouter.replace.mockClear();
    
    // Reset mock store
    Object.assign(mockStore, {
      appState: 'idle',
      hasValidSession: false,
      hasCompleteResponses: false,
      canGenerateValues: false
    });
    
    mockStore.initializeStateMachine.mockClear();
    mockStore.restoreSession.mockResolvedValue(false);
    mockStore.canAccessRoute.mockReturnValue(true);
    mockStore.getRedirectPath.mockReturnValue(null);
    mockStore.validateSession.mockReturnValue(false);
  });

  describe('Initialization', () => {
    test('initializes state machine on mount', () => {
      renderHook(() => useSessionManagement());
      
      expect(mockStore.initializeStateMachine).toHaveBeenCalledOnce();
    });

    test('only initializes once', () => {
      const { rerender } = renderHook(() => useSessionManagement());
      rerender();
      rerender();
      
      expect(mockStore.initializeStateMachine).toHaveBeenCalledOnce();
    });

    test('restores session when enabled', async () => {
      mockStore.restoreSession.mockResolvedValue(true);
      
      const { result } = renderHook(() => useSessionManagement({ restoreOnMount: true }));
      
      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(mockStore.restoreSession).toHaveBeenCalledOnce();
      expect(result.current.isRestoring).toBe(false);
    });

    test('skips session restoration when disabled', () => {
      renderHook(() => useSessionManagement({ restoreOnMount: false }));
      
      expect(mockStore.restoreSession).not.toHaveBeenCalled();
    });
  });

  describe('Route Protection', () => {
    test('allows access to valid routes', () => {
      mockUsePathname.mockReturnValue('/about');
      mockStore.canAccessRoute.mockReturnValue(true);
      
      renderHook(() => useSessionManagement({ enableAutoRedirect: true }));
      
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    test('redirects from invalid routes', () => {
      mockUsePathname.mockReturnValue('/results');
      mockStore.canAccessRoute.mockReturnValue(false);
      mockStore.getRedirectPath.mockReturnValue('/');
      
      renderHook(() => useSessionManagement({ enableAutoRedirect: true }));
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });

    test('skips redirect when auto-redirect is disabled', () => {
      mockUsePathname.mockReturnValue('/results');
      mockStore.canAccessRoute.mockReturnValue(false);
      
      renderHook(() => useSessionManagement({ enableAutoRedirect: false }));
      
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    test('skips redirect during initialization', () => {
      mockUsePathname.mockReturnValue('/results');
      mockStore.canAccessRoute.mockReturnValue(false);
      
      // Mock still initializing
      const { rerender } = renderHook(() => useSessionManagement({ enableAutoRedirect: true }));
      
      // Should not redirect immediately
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Session Status', () => {
    test('returns correct status for different states', () => {
      const { result, rerender } = renderHook(() => useSessionManagement());
      
      // Initial state
      expect(result.current.sessionStatus).toBe('initializing');
      
      // Restoring
      act(() => {
        Object.assign(mockStore, { appState: 'idle' });
      });
      rerender();
      
      // Error state
      act(() => {
        Object.assign(mockStore, { appState: 'error' });
      });
      rerender();
      expect(result.current.sessionStatus).toBe('error');
      
      // Active session
      act(() => {
        Object.assign(mockStore, { 
          appState: 'answering',
          hasValidSession: true 
        });
      });
      rerender();
      expect(result.current.sessionStatus).toBe('active');
      
      // Complete session
      act(() => {
        Object.assign(mockStore, { 
          hasValidSession: true,
          hasCompleteResponses: true 
        });
      });
      rerender();
      expect(result.current.sessionStatus).toBe('complete');
    });

    test('returns appropriate status messages', () => {
      const { result, rerender } = renderHook(() => useSessionManagement());
      
      expect(result.current.statusMessage).toBe('Setting up your session...');
      
      act(() => {
        Object.assign(mockStore, { appState: 'loading' });
      });
      rerender();
      expect(result.current.statusMessage).toBe('Loading dilemmas...');
      
      act(() => {
        Object.assign(mockStore, { appState: 'error' });
      });
      rerender();
      expect(result.current.statusMessage).toBe('Something went wrong. Please try again.');
    });
  });

  describe('Navigation Helpers', () => {
    test('validateForRoute checks session validity', () => {
      mockStore.validateSession.mockReturnValue(true);
      mockStore.canAccessRoute.mockReturnValue(true);
      
      const { result } = renderHook(() => useSessionManagement());
      
      const isValid = result.current.validateForRoute('/explore/test');
      expect(isValid).toBe(true);
      expect(mockStore.validateSession).toHaveBeenCalled();
      expect(mockStore.canAccessRoute).toHaveBeenCalledWith('/explore/test');
    });

    test('validateForRoute rejects invalid sessions for protected routes', () => {
      mockStore.validateSession.mockReturnValue(false);
      
      const { result } = renderHook(() => useSessionManagement());
      
      const isValid = result.current.validateForRoute('/explore/test');
      expect(isValid).toBe(false);
    });

    test('navigateToRoute performs safe navigation', () => {
      mockStore.validateSession.mockReturnValue(true);
      mockStore.canAccessRoute.mockReturnValue(true);
      
      const { result } = renderHook(() => useSessionManagement());
      
      const success = result.current.navigateToRoute('/explore/test');
      expect(success).toBe(true);
      expect(mockRouter.push).toHaveBeenCalledWith('/explore/test');
    });

    test('navigateToRoute redirects invalid navigation', () => {
      mockStore.validateSession.mockReturnValue(false);
      mockStore.canAccessRoute.mockReturnValue(false);
      mockStore.getRedirectPath.mockReturnValue('/');
      
      const { result } = renderHook(() => useSessionManagement());
      
      const success = result.current.navigateToRoute('/results');
      expect(success).toBe(false);
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    test('navigateToRoute with replace option', () => {
      mockStore.validateSession.mockReturnValue(true);
      mockStore.canAccessRoute.mockReturnValue(true);
      
      const { result } = renderHook(() => useSessionManagement());
      
      result.current.navigateToRoute('/explore/test', { replace: true });
      expect(mockRouter.replace).toHaveBeenCalledWith('/explore/test');
    });

    test('isOnProtectedRoute detects protected routes', () => {
      mockUsePathname.mockReturnValue('/explore/test');
      const { result } = renderHook(() => useSessionManagement());
      
      expect(result.current.isOnProtectedRoute()).toBe(true);
      
      mockUsePathname.mockReturnValue('/about');
      const { result: result2 } = renderHook(() => useSessionManagement());
      
      expect(result2.current.isOnProtectedRoute()).toBe(false);
    });
  });

  describe('Debug Mode', () => {
    test('provides debug information when enabled', () => {
      mockUsePathname.mockReturnValue('/explore/test');
      mockStore.canAccessRoute.mockReturnValue(true);
      
      const { result } = renderHook(() => useSessionManagement({ debug: true }));
      
      expect(result.current.debug).toBeDefined();
      expect(result.current.debug?.pathname).toBe('/explore/test');
      expect(result.current.debug?.appState).toBe('idle');
      expect(result.current.debug?.canAccessCurrentRoute).toBe(true);
    });

    test('debug is undefined when disabled', () => {
      const { result } = renderHook(() => useSessionManagement({ debug: false }));
      
      expect(result.current.debug).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('handles session restoration errors gracefully', async () => {
      mockStore.restoreSession.mockRejectedValue(new Error('Restore failed'));
      
      const { result } = renderHook(() => useSessionManagement({ restoreOnMount: true }));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.isRestoring).toBe(false);
      // Should not crash
    });

    test('handles state machine errors gracefully', () => {
      mockStore.initializeStateMachine.mockImplementation(() => {
        throw new Error('Init failed');
      });
      
      // Should not crash
      expect(() => {
        renderHook(() => useSessionManagement());
      }).not.toThrow();
    });
  });

  describe('State Updates', () => {
    test('updates when store state changes', () => {
      const { result, rerender } = renderHook(() => useSessionManagement());
      
      expect(result.current.hasValidSession).toBe(false);
      
      act(() => {
        Object.assign(mockStore, { hasValidSession: true });
      });
      rerender();
      
      expect(result.current.hasValidSession).toBe(true);
    });

    test('updates when pathname changes', () => {
      mockUsePathname.mockReturnValue('/about');
      mockStore.canAccessRoute.mockReturnValue(true);
      
      const { rerender } = renderHook(() => useSessionManagement({ enableAutoRedirect: true }));
      
      // Change pathname
      mockUsePathname.mockReturnValue('/results');
      mockStore.canAccessRoute.mockReturnValue(false);
      mockStore.getRedirectPath.mockReturnValue('/');
      
      rerender();
      
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });
});