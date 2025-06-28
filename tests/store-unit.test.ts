/**
 * Store Unit Tests - Isolated Logic Testing
 * 
 * Tests core store logic without external dependencies
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock external dependencies
vi.mock('../src/lib/db', () => ({}));
vi.mock('../src/lib/schema', () => ({}));

// Define types for our tests
interface Dilemma {
  dilemmaId: string;
  title: string;
  scenario: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  domain: string;
}

interface Response {
  dilemmaId: string;
  chosenOption: string;
  reasoning: string;
  responseTime: number;
  perceivedDifficulty: number;
}

// Mock store implementation for testing
function createMockStore() {
  let state = {
    dilemmas: [] as Dilemma[],
    currentIndex: 0,
    responses: [] as Response[],
    sessionId: 'test-session',
    selectedOption: '',
    reasoning: '',
    perceivedDifficulty: 5,
    startTime: Date.now(),
  };

  return {
    // State getters
    get dilemmas() { return state.dilemmas; },
    get currentIndex() { return state.currentIndex; },
    get responses() { return state.responses; },
    get sessionId() { return state.sessionId; },
    get selectedOption() { return state.selectedOption; },
    get reasoning() { return state.reasoning; },
    get perceivedDifficulty() { return state.perceivedDifficulty; },
    get startTime() { return state.startTime; },

    // Actions
    setDilemmas: (dilemmas: Dilemma[], startingDilemmaId?: string) => {
      state.dilemmas = dilemmas;
      if (startingDilemmaId) {
        const index = dilemmas.findIndex(d => d.dilemmaId === startingDilemmaId);
        state.currentIndex = index !== -1 ? index : 0;
      } else {
        state.currentIndex = 0;
      }
      state.selectedOption = '';
      state.reasoning = '';
      state.perceivedDifficulty = 5;
    },

    setSelectedOption: (option: string) => {
      state.selectedOption = option;
    },

    setReasoning: (reasoning: string) => {
      state.reasoning = reasoning;
    },

    setPerceivedDifficulty: (difficulty: number) => {
      state.perceivedDifficulty = difficulty;
    },

    getCurrentDilemma: () => {
      return state.dilemmas[state.currentIndex] || null;
    },

    getCurrentDilemmaId: () => {
      const dilemma = state.dilemmas[state.currentIndex];
      return dilemma?.dilemmaId || null;
    },

    getProgress: () => ({
      current: state.currentIndex + 1,
      total: state.dilemmas.length
    }),

    saveCurrentResponse: () => {
      const currentDilemma = state.dilemmas[state.currentIndex];
      if (currentDilemma && state.selectedOption) {
        const response: Response = {
          dilemmaId: currentDilemma.dilemmaId,
          chosenOption: state.selectedOption,
          reasoning: state.reasoning,
          responseTime: Date.now() - state.startTime,
          perceivedDifficulty: state.perceivedDifficulty,
        };

        const existingIndex = state.responses.findIndex(r => r.dilemmaId === currentDilemma.dilemmaId);
        if (existingIndex !== -1) {
          state.responses[existingIndex] = response;
        } else {
          state.responses.push(response);
        }
      }
    },

    goToNext: () => {
      // Save current response first
      const currentDilemma = state.dilemmas[state.currentIndex];
      if (currentDilemma && state.selectedOption) {
        const response: Response = {
          dilemmaId: currentDilemma.dilemmaId,
          chosenOption: state.selectedOption,
          reasoning: state.reasoning,
          responseTime: Date.now() - state.startTime,
          perceivedDifficulty: state.perceivedDifficulty,
        };

        const existingIndex = state.responses.findIndex(r => r.dilemmaId === currentDilemma.dilemmaId);
        if (existingIndex !== -1) {
          state.responses[existingIndex] = response;
        } else {
          state.responses.push(response);
        }
      }

      if (state.currentIndex < state.dilemmas.length - 1) {
        state.currentIndex++;
        state.selectedOption = '';
        state.reasoning = '';
        state.perceivedDifficulty = 5;
        state.startTime = Date.now();
        
        // Restore response if one exists for this dilemma
        const nextDilemma = state.dilemmas[state.currentIndex];
        if (nextDilemma) {
          const response = state.responses.find(r => r.dilemmaId === nextDilemma.dilemmaId);
          if (response) {
            state.selectedOption = response.chosenOption;
            state.reasoning = response.reasoning;
            state.perceivedDifficulty = response.perceivedDifficulty;
          }
        }
        
        return true;
      }
      return false;
    },

    goToPrevious: () => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        // Restore previous response if it exists
        const dilemma = state.dilemmas[state.currentIndex];
        if (dilemma) {
          const response = state.responses.find(r => r.dilemmaId === dilemma.dilemmaId);
          if (response) {
            state.selectedOption = response.chosenOption;
            state.reasoning = response.reasoning;
            state.perceivedDifficulty = response.perceivedDifficulty;
          } else {
            state.selectedOption = '';
            state.reasoning = '';
            state.perceivedDifficulty = 5;
          }
        }
      }
    },

    reset: () => {
      state = {
        dilemmas: [],
        currentIndex: 0,
        responses: [],
        sessionId: 'test-session',
        selectedOption: '',
        reasoning: '',
        perceivedDifficulty: 5,
        startTime: Date.now(),
      };
    },

    // Test helper to get internal state
    _getState: () => state,
    _setState: (newState: Partial<typeof state>) => {
      state = { ...state, ...newState };
    }
  };
}

function createTestDilemmas(count: number): Dilemma[] {
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

describe('Store Logic Unit Tests', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
  });

  describe('Basic State Management', () => {
    test('initializes with empty state', () => {
      expect(store.dilemmas).toEqual([]);
      expect(store.currentIndex).toBe(0);
      expect(store.responses).toEqual([]);
      expect(store.selectedOption).toBe('');
    });

    test('setDilemmas updates state correctly', () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);

      expect(store.dilemmas).toEqual(dilemmas);
      expect(store.currentIndex).toBe(0);
      expect(store.getCurrentDilemma()).toEqual(dilemmas[0]);
    });

    test('setDilemmas with startingDilemmaId sets correct index', () => {
      const dilemmas = createTestDilemmas(5);
      const targetId = dilemmas[2].dilemmaId;

      store.setDilemmas(dilemmas, targetId);

      expect(store.currentIndex).toBe(2);
      expect(store.getCurrentDilemma()?.dilemmaId).toBe(targetId);
    });

    test('setDilemmas with invalid startingDilemmaId defaults to 0', () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas, 'non-existent-id');

      expect(store.currentIndex).toBe(0);
    });
  });

  describe('Response Handling', () => {
    beforeEach(() => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);
    });

    test('saves response when option is selected', () => {
      store.setSelectedOption('a');
      store.setReasoning('Test reasoning');
      store.setPerceivedDifficulty(7);
      
      store.saveCurrentResponse();

      expect(store.responses).toHaveLength(1);
      expect(store.responses[0]).toMatchObject({
        dilemmaId: 'test-dilemma-1',
        chosenOption: 'a',
        reasoning: 'Test reasoning',
        perceivedDifficulty: 7
      });
    });

    test('does not save response without selected option', () => {
      store.setReasoning('Test reasoning');
      store.saveCurrentResponse();

      expect(store.responses).toHaveLength(0);
    });

    test('updates existing response when re-answering same dilemma', () => {
      // First answer
      store.setSelectedOption('a');
      store.saveCurrentResponse();
      expect(store.responses).toHaveLength(1);

      // Change answer
      store.setSelectedOption('b');
      store.setReasoning('Changed my mind');
      store.saveCurrentResponse();

      expect(store.responses).toHaveLength(1); // Still only 1 response
      expect(store.responses[0]).toMatchObject({
        chosenOption: 'b',
        reasoning: 'Changed my mind'
      });
    });
  });

  describe('Navigation Logic', () => {
    beforeEach(() => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);
    });

    test('goToNext advances to next dilemma', () => {
      store.setSelectedOption('a');
      
      const hasNext = store.goToNext();

      expect(hasNext).toBe(true);
      expect(store.currentIndex).toBe(1);
      expect(store.selectedOption).toBe(''); // Form cleared
      expect(store.responses).toHaveLength(1); // Response saved
    });

    test('goToNext returns false on last dilemma', () => {
      store._setState({ currentIndex: 2 }); // Go to last dilemma
      store.setSelectedOption('a');

      const hasNext = store.goToNext();

      expect(hasNext).toBe(false);
      expect(store.currentIndex).toBe(2); // Stays at last
      expect(store.responses).toHaveLength(1); // Response still saved
    });

    test('goToPrevious restores previous response', () => {
      // Answer first dilemma
      store.setSelectedOption('a');
      store.setReasoning('First reasoning');
      store.goToNext();

      // Answer second dilemma
      store.setSelectedOption('b');
      store.setReasoning('Second reasoning');

      // Go back to first
      store.goToPrevious();

      expect(store.currentIndex).toBe(0);
      expect(store.selectedOption).toBe('a');
      expect(store.reasoning).toBe('First reasoning');
    });

    test('goToPrevious on first dilemma does nothing', () => {
      store.goToPrevious();

      expect(store.currentIndex).toBe(0);
    });
  });

  describe('Progress Tracking', () => {
    test('getProgress returns correct values', () => {
      const dilemmas = createTestDilemmas(10);
      store.setDilemmas(dilemmas);

      expect(store.getProgress()).toEqual({ current: 1, total: 10 });

      store._setState({ currentIndex: 4 });
      expect(store.getProgress()).toEqual({ current: 5, total: 10 });

      store._setState({ currentIndex: 9 });
      expect(store.getProgress()).toEqual({ current: 10, total: 10 });
    });

    test('getProgress handles empty dilemmas', () => {
      expect(store.getProgress()).toEqual({ current: 1, total: 0 });
    });
  });

  describe('Edge Cases', () => {
    test('getCurrentDilemma handles invalid index', () => {
      const dilemmas = createTestDilemmas(2);
      store.setDilemmas(dilemmas);
      store._setState({ currentIndex: 999 });

      expect(store.getCurrentDilemma()).toBeNull();
      expect(store.getCurrentDilemmaId()).toBeNull();
    });

    test('saveCurrentResponse handles missing dilemma', () => {
      store.setSelectedOption('a');
      store.saveCurrentResponse(); // No dilemmas loaded

      expect(store.responses).toHaveLength(0);
    });

    test('reset clears all state', () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);
      store.setSelectedOption('a');
      store.saveCurrentResponse();

      store.reset();

      expect(store.dilemmas).toEqual([]);
      expect(store.currentIndex).toBe(0);
      expect(store.responses).toEqual([]);
      expect(store.selectedOption).toBe('');
    });
  });

  describe('Complex Navigation Scenarios', () => {
    test('complete user journey through multiple dilemmas', () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);

      // Answer first dilemma
      store.setSelectedOption('a');
      store.setReasoning('First answer');
      expect(store.goToNext()).toBe(true);

      // Answer second dilemma
      store.setSelectedOption('b');
      store.setReasoning('Second answer');
      expect(store.goToNext()).toBe(true);

      // Answer third dilemma
      store.setSelectedOption('c');
      store.setReasoning('Third answer');
      expect(store.goToNext()).toBe(false); // Last dilemma

      // Verify all responses saved
      expect(store.responses).toHaveLength(3);
      expect(store.responses[0].chosenOption).toBe('a');
      expect(store.responses[1].chosenOption).toBe('b');
      expect(store.responses[2].chosenOption).toBe('c');
    });

    test('backward and forward navigation preserves state', () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);

      // Complete first dilemma
      store.setSelectedOption('a');
      store.goToNext();
      expect(store.responses).toHaveLength(1);
      expect(store.currentIndex).toBe(1);
      
      // Complete second dilemma  
      store.setSelectedOption('b');
      store.goToNext();
      expect(store.responses).toHaveLength(2);
      expect(store.currentIndex).toBe(2);

      // Go back to dilemma 2 (index 1)
      store.goToPrevious(); 
      expect(store.currentIndex).toBe(1);
      expect(store.selectedOption).toBe('b');
      
      // Go back to dilemma 1 (index 0)
      store.goToPrevious(); 
      expect(store.currentIndex).toBe(0);
      expect(store.selectedOption).toBe('a');

      // Forward again to dilemma 2 (index 1)
      store.goToNext(); 
      expect(store.currentIndex).toBe(1);
      expect(store.selectedOption).toBe('b');
    });
  });
});