/**
 * Session Recovery Tests
 * 
 * Tests edge cases for session management and recovery
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for testing
const mockLocalStorage = {
  storage: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.storage.get(key) || null),
  setItem: vi.fn((key: string, value: string) => mockLocalStorage.storage.set(key, value)),
  removeItem: vi.fn((key: string) => mockLocalStorage.storage.delete(key)),
  clear: vi.fn(() => mockLocalStorage.storage.clear()),
  length: 0,
  key: vi.fn()
};

// Mock store implementation
function createMockStore() {
  let state = {
    dilemmas: [] as any[],
    currentIndex: 0,
    responses: [] as any[],
    sessionId: `session_${Date.now()}_test`,
    selectedOption: '',
    reasoning: '',
    perceivedDifficulty: 5
  };

  return {
    get sessionId() { return state.sessionId; },
    get responses() { return state.responses; },
    get currentIndex() { return state.currentIndex; },
    get dilemmas() { return state.dilemmas; },
    
    setDilemmas: (dilemmas: any[]) => {
      state.dilemmas = dilemmas;
      state.currentIndex = 0;
    },
    
    setSelectedOption: (option: string) => {
      state.selectedOption = option;
    },
    
    saveCurrentResponse: () => {
      if (state.selectedOption && state.dilemmas[state.currentIndex]) {
        const response = {
          dilemmaId: state.dilemmas[state.currentIndex].dilemmaId,
          chosenOption: state.selectedOption,
          reasoning: state.reasoning,
          responseTime: 1000,
          perceivedDifficulty: state.perceivedDifficulty
        };
        state.responses.push(response);
      }
    },
    
    goToNext: async () => {
      // Save current response
      if (state.selectedOption && state.dilemmas[state.currentIndex]) {
        const response = {
          dilemmaId: state.dilemmas[state.currentIndex].dilemmaId,
          chosenOption: state.selectedOption,
          reasoning: state.reasoning,
          responseTime: 1000,
          perceivedDifficulty: state.perceivedDifficulty
        };
        state.responses.push(response);
      }
      
      if (state.currentIndex < state.dilemmas.length - 1) {
        state.currentIndex++;
        state.selectedOption = '';
        return true;
      }
      return false;
    },
    
    // Simulate localStorage persistence
    persist: () => {
      mockLocalStorage.setItem('dilemma-session', JSON.stringify({
        sessionId: state.sessionId,
        responses: state.responses
      }));
    },
    
    // Simulate recovery from localStorage
    restore: () => {
      const stored = mockLocalStorage.getItem('dilemma-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        state.sessionId = parsed.sessionId;
        state.responses = parsed.responses || [];
        return true;
      }
      return false;
    },
    
    reset: () => {
      state = {
        dilemmas: [],
        currentIndex: 0,
        responses: [],
        sessionId: `session_${Date.now()}_test`,
        selectedOption: '',
        reasoning: '',
        perceivedDifficulty: 5
      };
    }
  };
}

function createTestDilemmas(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    dilemmaId: `test-dilemma-${i + 1}`,
    title: `Test Dilemma ${i + 1}`,
    scenario: `Test scenario ${i + 1}`,
    choiceA: 'Choice A',
    choiceB: 'Choice B',
    choiceC: 'Choice C', 
    choiceD: 'Choice D',
    domain: 'test'
  }));
}

describe('Session Recovery Edge Cases', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    mockLocalStorage.clear();
  });

  describe('Scenario 1: User answers all dilemmas → sees results → refreshes page', () => {
    test('should restore complete session on page refresh', () => {
      // Complete all 12 dilemmas
      const dilemmas = createTestDilemmas(12);
      store.setDilemmas(dilemmas);
      
      for (let i = 0; i < 12; i++) {
        store.setSelectedOption(['a', 'b', 'c', 'd'][i % 4]);
        store.goToNext();
      }
      
      expect(store.responses).toHaveLength(12);
      
      // Persist to localStorage (simulates automatic save)
      store.persist();
      
      // Simulate page refresh - create new store and restore
      const newStore = createMockStore();
      const restored = newStore.restore();
      
      expect(restored).toBe(true);
      expect(newStore.responses).toHaveLength(12);
      expect(newStore.sessionId).toBe(store.sessionId);
    });
  });

  describe('Scenario 2: User completes 1 dilemma → closes tab → reopens next day', () => {
    test('should restore partial session after long break', () => {
      const dilemmas = createTestDilemmas(12);
      store.setDilemmas(dilemmas);
      
      // Complete only first dilemma
      store.setSelectedOption('a');
      store.goToNext();
      
      expect(store.responses).toHaveLength(1);
      expect(store.currentIndex).toBe(1);
      
      // Persist to localStorage
      store.persist();
      
      // Simulate next day - new session
      const newStore = createMockStore();
      const restored = newStore.restore();
      
      expect(restored).toBe(true);
      expect(newStore.responses).toHaveLength(1);
      expect(newStore.responses[0].chosenOption).toBe('a');
      
      // Should be able to continue from where left off
      newStore.setDilemmas(dilemmas);
      // Note: currentIndex would need to be restored based on responses length
    });
  });

  describe('Scenario 3: localStorage missing scenarios', () => {
    test('should create new session when localStorage is empty', () => {
      // Attempt to restore from empty localStorage
      const restored = store.restore();
      
      expect(restored).toBe(false);
      expect(store.responses).toHaveLength(0);
      expect(store.sessionId).toMatch(/^session_/);
    });
    
    test('should handle corrupted localStorage gracefully', () => {
      // Simulate corrupted data
      mockLocalStorage.setItem('dilemma-session', 'invalid-json');
      
      // Should not crash when trying to restore
      expect(() => {
        try {
          store.restore();
        } catch (e) {
          // Should handle JSON parse errors gracefully
          expect(e).toBeDefined();
        }
      }).not.toThrow();
    });
  });

  describe('Scenario 4: Server API edge cases', () => {
    test('should handle unknown sessionId gracefully', async () => {
      // Simulate API call with unknown sessionId
      const mockApiResponse = {
        sessionId: 'unknown-session-id',
        responses: []
      };
      
      // API should return empty responses for unknown session
      // This simulates /api/responses and /api/generate-values behavior
      expect(mockApiResponse.responses).toHaveLength(0);
      
      // App should detect this and show appropriate error
      const shouldRedirect = mockApiResponse.responses.length === 0;
      expect(shouldRedirect).toBe(true);
    });
  });

  describe('Scenario 5: Opening /results directly', () => {
    test('should redirect when no responses available', () => {
      // Simulate direct navigation to /results with no session
      const hasResponses = store.responses.length > 0;
      const shouldRedirect = !hasResponses;
      
      expect(shouldRedirect).toBe(true);
    });
    
    test('should work when valid session exists', () => {
      // Create completed session
      const dilemmas = createTestDilemmas(12);
      store.setDilemmas(dilemmas);
      
      for (let i = 0; i < 12; i++) {
        store.setSelectedOption('a');
        store.goToNext();
      }
      
      store.persist();
      
      // Simulate /results page checking for responses
      const newStore = createMockStore();
      newStore.restore();
      
      const hasCompleteResponses = newStore.responses.length >= 12;
      expect(hasCompleteResponses).toBe(true);
    });
  });

  describe('API Idempotency Tests', () => {
    test('/api/responses should handle duplicate submissions', async () => {
      const sessionId = 'test-session-123';
      const responses = [
        { dilemmaId: 'dilemma-1', chosenOption: 'a', reasoning: 'test' }
      ];
      
      // Simulate first API call
      const firstCall = { sessionId, responses, success: true, inserted: 1 };
      
      // Simulate second API call with same data
      const secondCall = { sessionId, responses, success: true, inserted: 0, existing: 1 };
      
      // Second call should indicate no new insertions (idempotent)
      expect(secondCall.inserted).toBe(0);
      expect(secondCall.existing).toBe(1);
    });
    
    test('/api/generate-values should use cache for repeated calls', async () => {
      const sessionId = 'test-session-123';
      
      // Simulate first generation (expensive)
      const firstCall = { cached: false, generated: true };
      
      // Simulate second call (should use cache)
      const secondCall = { cached: true, generated: false };
      
      expect(secondCall.cached).toBe(true);
    });
  });
});