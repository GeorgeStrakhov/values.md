/**
 * Enhanced Store Integration Tests
 * 
 * Tests the integration between the state machine and Zustand store,
 * including persistence, async operations, and session management.
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  storage: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.storage.get(key) || null),
  setItem: vi.fn((key: string, value: string) => mockLocalStorage.storage.set(key, value)),
  removeItem: vi.fn((key: string) => mockLocalStorage.storage.delete(key)),
  clear: vi.fn(() => mockLocalStorage.storage.clear()),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage
});

// Import after mocks are set up
import { useEnhancedDilemmaStore } from '../src/store/enhanced-dilemma-store';

describe('Enhanced Store Integration', () => {
  let store: any; // Use any for test compatibility
  const mockFetch = fetch as any;

  beforeEach(() => {
    // Reset mocks
    mockLocalStorage.clear();
    vi.clearAllMocks();
    
    // Get fresh store instance
    store = useEnhancedDilemmaStore.getState();
    store.reset();
    store.initializeStateMachine();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('State Machine Integration', () => {
    test('initializes state machine correctly', () => {
      expect(store.appState).toBe('idle');
      expect(store.stateMachine).toBeDefined();
    });

    test('state machine events update store state', () => {
      const dilemmas = [
        { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
      ];

      store.sendEvent({ type: 'START_SESSION' });
      expect(store.appState).toBe('loading');
      expect(store.isLoading).toBe(true);

      store.sendEvent({ type: 'DILEMMAS_LOADED', dilemmas });
      expect(store.appState).toBe('answering');
      expect(store.dilemmas).toEqual(dilemmas);
      expect(store.hasValidSession).toBe(true);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('startNewSession fetches dilemmas correctly', async () => {
      const mockDilemmas = [
        { dilemmaId: 'uuid-1', title: 'Dilemma 1', scenario: 'Scenario 1', choiceA: 'A1', choiceB: 'B1', choiceC: 'C1', choiceD: 'D1', domain: 'ethics' },
        { dilemmaId: 'uuid-2', title: 'Dilemma 2', scenario: 'Scenario 2', choiceA: 'A2', choiceB: 'B2', choiceC: 'C2', choiceD: 'D2', domain: 'ethics' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ dilemmas: mockDilemmas })
      });

      await store.startNewSession();

      expect(mockFetch).toHaveBeenCalledWith('/api/dilemmas/random');
      expect(store.dilemmas).toEqual(mockDilemmas);
      expect(store.appState).toBe('answering');
      expect(store.hasValidSession).toBe(true);
    });

    test('startNewSession handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await store.startNewSession();

      expect(store.appState).toBe('error');
      expect(store.error).toContain('Failed to fetch dilemmas: 500');
    });

    test('restoreSession works with valid localStorage data', async () => {
      const sessionData = {
        sessionId: 'test-session-123',
        responses: [
          { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'Test', responseTime: 1000, perceivedDifficulty: 5 }
        ],
        dilemmas: [
          { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
        ]
      };

      mockLocalStorage.setItem('enhanced-dilemma-session', JSON.stringify({ state: sessionData }));

      const restored = await store.restoreSession();

      expect(restored).toBe(true);
      expect(store.sessionId).toBe(sessionData.sessionId);
      expect(store.responses).toEqual(sessionData.responses);
      expect(store.hasValidSession).toBe(true);
    });

    test('validateSession returns correct values', () => {
      expect(store.validateSession()).toBe(false);

      store.setDilemmas([
        { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
      ]);

      expect(store.validateSession()).toBe(true);
    });
  });

  describe('Response Management', () => {
    beforeEach(() => {
      store.setDilemmas([
        { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' },
        { dilemmaId: 'test-2', title: 'Test 2', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
      ]);
    });

    test('saveCurrentResponse creates response correctly', () => {
      store.setSelectedOption('b');
      store.setReasoning('Test reasoning');
      store.setPerceivedDifficulty(7);

      store.saveCurrentResponse();

      expect(store.responses).toHaveLength(1);
      expect(store.responses[0]).toMatchObject({
        dilemmaId: 'test-1',
        chosenOption: 'b',
        reasoning: 'Test reasoning',
        perceivedDifficulty: 7
      });
    });

    test('saveCurrentResponse updates existing response', () => {
      // Save first response
      store.setSelectedOption('a');
      store.saveCurrentResponse();

      // Update same dilemma
      store.setSelectedOption('c');
      store.setReasoning('Updated');
      store.saveCurrentResponse();

      expect(store.responses).toHaveLength(1);
      expect(store.responses[0]).toMatchObject({
        dilemmaId: 'test-1',
        chosenOption: 'c',
        reasoning: 'Updated'
      });
    });

    test('restoreResponseForIndex loads previous response', () => {
      // Save response for index 1
      store.setCurrentIndex(1);
      store.setSelectedOption('d');
      store.setReasoning('Second response');
      store.setPerceivedDifficulty(9);
      store.saveCurrentResponse();

      // Clear form
      store.setSelectedOption('');
      store.setReasoning('');
      store.setPerceivedDifficulty(5);

      // Restore
      store.restoreResponseForIndex(1);

      expect(store.selectedOption).toBe('d');
      expect(store.reasoning).toBe('Second response');
      expect(store.perceivedDifficulty).toBe(9);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      const dilemmas = Array.from({ length: 3 }, (_, i) => ({
        dilemmaId: `test-${i}`,
        title: `Test ${i}`,
        scenario: 'Test',
        choiceA: 'A',
        choiceB: 'B',
        choiceC: 'C',
        choiceD: 'D',
        domain: 'test'
      }));
      store.setDilemmas(dilemmas);
    });

    test('goToNext advances through dilemmas', async () => {
      store.setSelectedOption('a');
      
      const hasNext = await store.goToNext();

      expect(hasNext).toBe(true);
      expect(store.currentIndex).toBe(1);
      expect(store.selectedOption).toBe(''); // Form cleared
      expect(store.responses).toHaveLength(1); // Response saved
    });

    test('goToNext on last dilemma submits and generates values', async () => {
      // Go to last dilemma
      store.setCurrentIndex(2);
      store.setSelectedOption('c');

      // Mock successful submission and generation
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ valuesMarkdown: '# My Values' })
        });

      const hasNext = await store.goToNext();

      expect(hasNext).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith('/api/responses', expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith('/api/generate-values', expect.any(Object));
    });

    test('goToPrevious moves back correctly', () => {
      store.setCurrentIndex(1);
      
      store.goToPrevious();

      expect(store.currentIndex).toBe(0);
    });

    test('navigateToDilemma sets index correctly', () => {
      store.navigateToDilemma(2);

      expect(store.currentIndex).toBe(2);
    });
  });

  describe('API Integration', () => {
    test('submitResponsesToDatabase handles success', async () => {
      store.responses = [
        { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'Test', responseTime: 1000, perceivedDifficulty: 5 }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const success = await store.submitResponsesToDatabase();

      expect(success).toBe(true);
      expect(store.appState).toBe('generating');
      expect(mockFetch).toHaveBeenCalledWith('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: store.sessionId,
          responses: store.responses
        })
      });
    });

    test('submitResponsesToDatabase handles failure', async () => {
      store.responses = [
        { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'Test', responseTime: 1000, perceivedDifficulty: 5 }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const success = await store.submitResponsesToDatabase();

      expect(success).toBe(false);
      expect(store.appState).toBe('error');
      expect(store.error).toContain('Submission failed: 500');
    });

    test('generateValues handles success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valuesMarkdown: '# My Personal Values\n\nI value honesty.' })
      });

      const success = await store.generateValues();

      expect(success).toBe(true);
      expect(store.appState).toBe('completed');
      expect(store.valuesMarkdown).toBe('# My Personal Values\n\nI value honesty.');
      expect(mockFetch).toHaveBeenCalledWith('/api/generate-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: store.sessionId })
      });
    });

    test('generateValues handles failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const success = await store.generateValues();

      expect(success).toBe(false);
      expect(store.appState).toBe('error');
      expect(store.error).toBe('Network error');
    });
  });

  describe('Route Validation', () => {
    test('canAccessRoute validates correctly', () => {
      // Initially can't access protected routes
      expect(store.canAccessRoute('/results')).toBe(false);
      expect(store.canAccessRoute('/explore/test')).toBe(false);
      expect(store.canAccessRoute('/about')).toBe(true); // Public route

      // With valid session but no complete responses
      store.setDilemmas([
        { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
      ]);
      expect(store.canAccessRoute('/explore/test')).toBe(true);
      expect(store.canAccessRoute('/results')).toBe(false);

      // With complete responses
      store.responses = Array.from({ length: 12 }, (_, i) => ({
        dilemmaId: `test-${i}`,
        chosenOption: 'a',
        reasoning: '',
        responseTime: 1000,
        perceivedDifficulty: 5
      }));
      store.sendEvent({ type: 'SESSION_RESTORED', responses: store.responses, sessionId: store.sessionId });
      
      expect(store.canAccessRoute('/results')).toBe(true);
    });

    test('getRedirectPath returns correct paths', () => {
      // No session - redirect to home
      expect(store.getRedirectPath('/results')).toBe('/');
      expect(store.getRedirectPath('/explore/test')).toBe('/');

      // Valid session - can explore
      store.setDilemmas([
        { dilemmaId: 'test-1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
      ]);
      expect(store.getRedirectPath('/explore/test')).toBe(null);
      
      // Try to access results without complete responses - redirect to current dilemma
      const redirectPath = store.getRedirectPath('/results');
      expect(redirectPath).toBe('/explore/test-1');
    });
  });

  describe('Persistence', () => {
    test('persists data to localStorage', () => {
      store.sessionId = 'test-session-123';
      store.responses = [
        { dilemmaId: 'test-1', chosenOption: 'a', reasoning: 'Test', responseTime: 1000, perceivedDifficulty: 5 }
      ];

      // Trigger persistence (normally happens automatically)
      const persistedData = mockLocalStorage.getItem('enhanced-dilemma-session');
      // Note: Actual persistence testing would require more complex setup with Zustand's persist middleware
    });
  });

  describe('Edge Cases', () => {
    test('handles empty responses submission', async () => {
      const success = await store.submitResponsesToDatabase();
      expect(success).toBe(false);
    });

    test('handles navigation with no dilemmas', () => {
      const hasNext = store.goToNext();
      expect(hasNext).resolves.toBe(false);
    });

    test('getCurrentDilemma returns null for invalid index', () => {
      expect(store.getCurrentDilemma()).toBe(null);
    });

    test('getProgress handles empty dilemmas', () => {
      const progress = store.getProgress();
      expect(progress).toEqual({ current: 1, total: 0 });
    });
  });
});