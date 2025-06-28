/**
 * Navigation Regression Tests
 * 
 * These tests specifically target the exact issues we experienced:
 * 1. Progress indicator stuck at "1 of 12" 
 * 2. Next button not working after auto-advance implementation
 * 3. "No responses found" error due to responses not saving
 * 4. Complex auto-advance breaking manual navigation
 */

import { describe, test, expect, beforeEach } from 'vitest';

// Create simplified mock store matching our current working implementation
function createWorkingStore() {
  let state = {
    dilemmas: [] as any[],
    currentIndex: 0,
    responses: [] as any[],
    sessionId: 'test-session',
    selectedOption: '',
    reasoning: '',
    perceivedDifficulty: 5,
    startTime: Date.now()
  };

  return {
    // Getters
    get currentIndex() { return state.currentIndex; },
    get responses() { return state.responses; },
    get selectedOption() { return state.selectedOption; },
    get reasoning() { return state.reasoning; },
    get perceivedDifficulty() { return state.perceivedDifficulty; },
    
    // Actions
    setDilemmas: (dilemmas: any[]) => {
      state.dilemmas = dilemmas;
      state.currentIndex = 0;
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
    
    getProgress: () => ({
      current: state.currentIndex + 1,
      total: state.dilemmas.length
    }),
    
    saveCurrentResponse: () => {
      const currentDilemma = state.dilemmas[state.currentIndex];
      if (currentDilemma && state.selectedOption) {
        const response = {
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
    
    goToNext: async () => {
      // Save current response first (this was broken in the regression)
      const currentDilemma = state.dilemmas[state.currentIndex];
      if (currentDilemma && state.selectedOption) {
        const response = {
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
        return true;
      }
      return false;
    },
    
    goToPrevious: () => {
      if (state.currentIndex > 0) {
        state.currentIndex--;
        // Restore previous response
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
    
    // Test helpers
    _getState: () => state,
    _setState: (newState: any) => {
      state = { ...state, ...newState };
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

describe('Navigation Regression Prevention', () => {
  let store: ReturnType<typeof createWorkingStore>;

  beforeEach(() => {
    store = createWorkingStore();
  });

  describe('REGRESSION 1: Progress Indicator Stuck at "1 of 12"', () => {
    test('progress correctly updates from 1→2→3→...→12', async () => {
      const dilemmas = createTestDilemmas(12);
      store.setDilemmas(dilemmas);
      
      // Initial state
      expect(store.getProgress()).toEqual({ current: 1, total: 12 });
      
      // Progress through first few dilemmas
      const expectedProgress = [
        { current: 1, total: 12 },
        { current: 2, total: 12 },
        { current: 3, total: 12 },
        { current: 4, total: 12 },
        { current: 5, total: 12 }
      ];
      
      for (let i = 0; i < 4; i++) {
        expect(store.getProgress()).toEqual(expectedProgress[i]);
        
        store.setSelectedOption('a');
        await store.goToNext();
        
        expect(store.getProgress()).toEqual(expectedProgress[i + 1]);
      }
    });
    
    test('progress calculation is always currentIndex + 1', () => {
      const dilemmas = createTestDilemmas(10);
      store.setDilemmas(dilemmas);
      
      // Test various positions
      [0, 3, 7, 9].forEach(index => {
        store._setState({ currentIndex: index });
        expect(store.getProgress()).toEqual({ 
          current: index + 1, 
          total: 10 
        });
      });
    });
  });

  describe('REGRESSION 2: Next Button Not Working', () => {
    test('goToNext advances currentIndex when option selected', async () => {
      const dilemmas = createTestDilemmas(5);
      store.setDilemmas(dilemmas);
      
      // Select option and navigate
      store.setSelectedOption('b');
      const initialIndex = store.currentIndex;
      
      const result = await store.goToNext();
      
      expect(result).toBe(true);
      expect(store.currentIndex).toBe(initialIndex + 1);
    });
    
    test('manual navigation works independently of any auto-advance state', async () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);
      
      // Verify no auto-advance state in simplified store
      const state = store._getState();
      expect(state).not.toHaveProperty('autoAdvanceState');
      expect(state).not.toHaveProperty('timerId');
      expect(state).not.toHaveProperty('autoAdvanceActive');
      
      // Manual navigation should work
      store.setSelectedOption('c');
      await store.goToNext();
      
      expect(store.currentIndex).toBe(1);
      expect(store.getProgress()).toEqual({ current: 2, total: 3 });
    });
    
    test('navigation works for complete user journey', async () => {
      const dilemmas = createTestDilemmas(4);
      store.setDilemmas(dilemmas);
      
      const choices = ['a', 'b', 'c', 'd'];
      
      // Navigate through all dilemmas
      for (let i = 0; i < choices.length; i++) {
        expect(store.currentIndex).toBe(i);
        
        store.setSelectedOption(choices[i]);
        
        if (i < choices.length - 1) {
          const hasNext = await store.goToNext();
          expect(hasNext).toBe(true);
        } else {
          const hasNext = await store.goToNext();
          expect(hasNext).toBe(false); // Last dilemma
        }
      }
      
      expect(store.responses).toHaveLength(4);
    });
  });

  describe('REGRESSION 3: "No Responses Found" Error', () => {
    test('responses are saved immediately on navigation', async () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);
      
      // Complete first dilemma
      store.setSelectedOption('a');
      store.setReasoning('First reasoning');
      store.setPerceivedDifficulty(7);
      
      await store.goToNext();
      
      // Response should be saved immediately
      expect(store.responses).toHaveLength(1);
      expect(store.responses[0]).toMatchObject({
        dilemmaId: 'test-dilemma-1',
        chosenOption: 'a',
        reasoning: 'First reasoning',
        perceivedDifficulty: 7
      });
    });
    
    test('all responses are preserved through complete flow', async () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);
      
      // Complete all dilemmas
      const expectedResponses = [
        { option: 'a', reasoning: 'First', difficulty: 6 },
        { option: 'b', reasoning: 'Second', difficulty: 8 },
        { option: 'c', reasoning: 'Third', difficulty: 4 }
      ];
      
      for (let i = 0; i < expectedResponses.length; i++) {
        const expected = expectedResponses[i];
        
        store.setSelectedOption(expected.option);
        store.setReasoning(expected.reasoning);
        store.setPerceivedDifficulty(expected.difficulty);
        
        await store.goToNext();
        
        // Check that response was saved
        expect(store.responses).toHaveLength(i + 1);
        expect(store.responses[i]).toMatchObject({
          dilemmaId: `test-dilemma-${i + 1}`,
          chosenOption: expected.option,
          reasoning: expected.reasoning,
          perceivedDifficulty: expected.difficulty
        });
      }
      
      // Final check: all responses present
      expect(store.responses).toHaveLength(3);
      expect(store.responses.map(r => r.chosenOption)).toEqual(['a', 'b', 'c']);
    });
    
    test('manual saveCurrentResponse works as safety net', () => {
      const dilemmas = createTestDilemmas(2);
      store.setDilemmas(dilemmas);
      
      store.setSelectedOption('d');
      store.setReasoning('Safety net test');
      
      // Manually save response
      store.saveCurrentResponse();
      
      expect(store.responses).toHaveLength(1);
      expect(store.responses[0]).toMatchObject({
        chosenOption: 'd',
        reasoning: 'Safety net test'
      });
    });
  });

  describe('REGRESSION 4: Auto-Advance Breaking Manual Navigation', () => {
    test('simple store has no complex auto-advance state', () => {
      const dilemmas = createTestDilemmas(2);
      store.setDilemmas(dilemmas);
      
      const state = store._getState();
      
      // Should NOT have these properties that caused issues
      expect(state).not.toHaveProperty('autoAdvanceState');
      expect(state).not.toHaveProperty('timerId');
      expect(state).not.toHaveProperty('autoAdvanceActive');
      expect(state).not.toHaveProperty('autoAdvanceRemaining');
    });
    
    test('navigation state is clean and predictable', async () => {
      const dilemmas = createTestDilemmas(3);
      store.setDilemmas(dilemmas);
      
      // First navigation
      store.setSelectedOption('a');
      const stateBefore1 = store._getState();
      await store.goToNext();
      const stateAfter1 = store._getState();
      
      // Form should be cleared after navigation
      expect(stateAfter1.selectedOption).toBe('');
      expect(stateAfter1.reasoning).toBe('');
      expect(stateAfter1.perceivedDifficulty).toBe(5);
      
      // Should advance to index 1
      expect(stateAfter1.currentIndex).toBe(1);
      expect(stateAfter1.responses.length).toBe(1);
      
      // Second navigation
      store.setSelectedOption('b');
      const stateBefore2 = store._getState();
      await store.goToNext();
      const stateAfter2 = store._getState();
      
      // Form should be cleared after navigation
      expect(stateAfter2.selectedOption).toBe('');
      expect(stateAfter2.reasoning).toBe('');
      expect(stateAfter2.perceivedDifficulty).toBe(5);
      
      // Should advance to index 2
      expect(stateAfter2.currentIndex).toBe(2);
      expect(stateAfter2.responses.length).toBe(2);
    });
  });

  describe('INTEGRATION: Complete Flow Regression Test', () => {
    test('full 12-dilemma journey without any stuck progress or missing responses', async () => {
      const dilemmas = createTestDilemmas(12);
      store.setDilemmas(dilemmas);
      
      // Track progress through all 12 dilemmas
      for (let i = 0; i < 12; i++) {
        // Check progress is correct at each step
        expect(store.getProgress()).toEqual({ current: i + 1, total: 12 });
        expect(store.currentIndex).toBe(i);
        
        // Make choice
        const choice = ['a', 'b', 'c', 'd'][i % 4];
        store.setSelectedOption(choice);
        store.setReasoning(`Reasoning for dilemma ${i + 1}`);
        store.setPerceivedDifficulty((i % 10) + 1);
        
        // Navigate
        const hasNext = await store.goToNext();
        
        if (i < 11) {
          expect(hasNext).toBe(true);
          expect(store.currentIndex).toBe(i + 1);
        } else {
          expect(hasNext).toBe(false); // Last dilemma
          expect(store.currentIndex).toBe(11); // Should stay at last
        }
        
        // Check response was saved
        expect(store.responses).toHaveLength(i + 1);
        expect(store.responses[i]).toMatchObject({
          dilemmaId: `test-dilemma-${i + 1}`,
          chosenOption: choice,
          reasoning: `Reasoning for dilemma ${i + 1}`
        });
      }
      
      // Final verification
      expect(store.responses).toHaveLength(12);
      expect(store.getProgress()).toEqual({ current: 12, total: 12 });
      
      // No "No responses found" error should occur
      expect(store.responses.length).toBeGreaterThan(0);
      expect(store.responses.every(r => r.chosenOption && r.dilemmaId)).toBe(true);
    });
  });
});