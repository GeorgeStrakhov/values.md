/**
 * Store Logic Unit Tests
 * 
 * Tests the Zustand store behavior that caused our navigation bugs
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useDilemmaStore } from '../src/store/dilemma-store';

// Mock timers for auto-advance testing
vi.useFakeTimers();

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true
});

describe('Dilemma Store', () => {
  
  beforeEach(() => {
    // Reset store state
    useDilemmaStore.getState().reset();
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  test('setSelectedOption triggers auto-advance', () => {
    const store = useDilemmaStore.getState();
    
    // Set up some dilemmas
    const mockDilemmas = [
      { dilemmaId: '1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' },
      { dilemmaId: '2', title: 'Test 2', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
    ];
    store.setDilemmas(mockDilemmas);
    
    // Select an option
    store.setSelectedOption('a');
    
    // Should activate auto-advance
    expect(store.autoAdvanceState.active).toBe(true);
    expect(store.autoAdvanceState.remaining).toBe(3);
    
    // Fast-forward timer
    vi.advanceTimersByTime(3000);
    
    // Should dispatch auto-advance event (not call goToNext directly)
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auto-advance-next' })
    );
  });

  test('saveCurrentResponse creates valid response objects', () => {
    const store = useDilemmaStore.getState();
    
    const mockDilemmas = [
      { dilemmaId: 'test-id', title: 'Test', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
    ];
    store.setDilemmas(mockDilemmas);
    store.setSelectedOption('a');
    store.setReasoning('Test reasoning');
    store.setPerceivedDifficulty(7);
    
    // Save response
    store.saveCurrentResponse();
    
    // Should create response with all required fields
    const responses = store.responses;
    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchObject({
      dilemmaId: 'test-id',
      chosenOption: 'a',
      reasoning: 'Test reasoning',
      perceivedDifficulty: 7,
      responseTime: expect.any(Number)
    });
  });

  test('goToNext advances index and clears form', async () => {
    const store = useDilemmaStore.getState();
    
    const mockDilemmas = [
      { dilemmaId: '1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' },
      { dilemmaId: '2', title: 'Test 2', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
    ];
    store.setDilemmas(mockDilemmas);
    store.setSelectedOption('a');
    store.setReasoning('Test reasoning');
    
    expect(store.currentIndex).toBe(0);
    
    // Go to next
    const hasNext = await store.goToNext();
    
    expect(hasNext).toBe(true);
    expect(store.currentIndex).toBe(1);
    expect(store.selectedOption).toBe(''); // Form should be cleared
    expect(store.reasoning).toBe('');
    expect(store.responses).toHaveLength(1); // Response should be saved
  });

  test('restoreResponseForIndex loads previous responses', () => {
    const store = useDilemmaStore.getState();
    
    const mockDilemmas = [
      { dilemmaId: '1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' },
      { dilemmaId: '2', title: 'Test 2', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
    ];
    store.setDilemmas(mockDilemmas);
    
    // Create a response manually
    store.responses.push({
      dilemmaId: '1',
      chosenOption: 'b',
      reasoning: 'Previous reasoning',
      responseTime: 1000,
      perceivedDifficulty: 8
    });
    
    // Go to index 1 then back to 0
    store.setCurrentIndex(1);
    store.restoreResponseForIndex(0);
    
    // Should restore the previous response
    expect(store.selectedOption).toBe('b');
    expect(store.reasoning).toBe('Previous reasoning');
    expect(store.perceivedDifficulty).toBe(8);
  });

  test('auto-advance stops when option is deselected', () => {
    const store = useDilemmaStore.getState();
    
    const mockDilemmas = [
      { dilemmaId: '1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
    ];
    store.setDilemmas(mockDilemmas);
    
    // Start auto-advance
    store.setSelectedOption('a');
    expect(store.autoAdvanceState.active).toBe(true);
    
    // Deselect option
    store.setSelectedOption('');
    expect(store.autoAdvanceState.active).toBe(false);
  });

  test('stopAutoAdvance clears timer', () => {
    const store = useDilemmaStore.getState();
    
    // Start auto-advance
    store.startAutoAdvance();
    expect(store.autoAdvanceState.active).toBe(true);
    expect(store.autoAdvanceState.timerId).toBeDefined();
    
    // Stop auto-advance
    store.stopAutoAdvance();
    expect(store.autoAdvanceState.active).toBe(false);
    expect(store.autoAdvanceState.remaining).toBe(0);
  });

  test('persistence excludes auto-advance state', () => {
    const store = useDilemmaStore.getState();
    
    // Start auto-advance
    store.startAutoAdvance();
    
    // Check what gets persisted (this simulates the persist middleware)
    const partialize = useDilemmaStore.persist.getOptions().partialize;
    const persistedState = partialize(store);
    
    expect(persistedState.autoAdvanceState.active).toBe(false);
    expect(persistedState.autoAdvanceState.timerId).toBeUndefined();
  });

});

describe('Store Edge Cases', () => {
  
  test('handles empty dilemmas array', () => {
    const store = useDilemmaStore.getState();
    
    store.setDilemmas([]);
    
    expect(store.getCurrentDilemma()).toBeNull();
    expect(store.getCurrentDilemmaId()).toBeNull();
    expect(store.getProgress()).toEqual({ current: 1, total: 0 });
  });

  test('handles invalid dilemma index', () => {
    const store = useDilemmaStore.getState();
    
    const mockDilemmas = [
      { dilemmaId: '1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
    ];
    store.setDilemmas(mockDilemmas);
    
    // Try to go to invalid index
    store.setCurrentIndex(999);
    
    expect(store.getCurrentDilemma()).toBeNull();
  });

  test('handles missing selectedOption in saveCurrentResponse', () => {
    const store = useDilemmaStore.getState();
    
    const mockDilemmas = [
      { dilemmaId: '1', title: 'Test 1', scenario: 'Test', choiceA: 'A', choiceB: 'B', choiceC: 'C', choiceD: 'D', domain: 'test' }
    ];
    store.setDilemmas(mockDilemmas);
    
    // Don't set selectedOption
    store.saveCurrentResponse();
    
    // Should not create a response
    expect(store.responses).toHaveLength(0);
  });

});