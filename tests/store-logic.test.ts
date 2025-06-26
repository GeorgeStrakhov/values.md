/**
 * Store Logic Unit Tests
 * 
 * Tests the specific Zustand store behavior that caused navigation bugs
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockStore, createMockTimers } from './test-utils';
import { createTestDilemmas } from './test-data';

describe('DilemmaStore Logic', () => {
  let mockStore: any;
  let mockTimers: any;
  let originalSetInterval: any;
  let originalClearInterval: any;
  let originalDispatchEvent: any;

  beforeEach(() => {
    mockStore = createMockStore();
    mockTimers = createMockTimers();
    
    // Mock browser APIs
    originalSetInterval = global.setInterval;
    originalClearInterval = global.clearInterval;
    originalDispatchEvent = global.dispatchEvent;
    
    global.setInterval = mockTimers.setInterval;
    global.clearInterval = mockTimers.clearInterval;
    global.dispatchEvent = vi.fn();
    
    // Mock window object
    Object.defineProperty(global, 'window', {
      value: { dispatchEvent: global.dispatchEvent },
      writable: true
    });
  });

  afterEach(() => {
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    global.dispatchEvent = originalDispatchEvent;
    mockTimers.clearAllTimers();
  });

  test('setSelectedOption saves response immediately', () => {
    // This would catch the "No responses found" bug
    
    const dilemmas = createTestDilemmas(3);
    mockStore.setDilemmas(dilemmas);
    
    expect(mockStore.responses).toHaveLength(0);
    
    // Select option
    mockStore.setSelectedOption('a');
    
    // Should trigger immediate save
    mockStore.saveCurrentResponse();
    
    expect(mockStore.responses).toHaveLength(1);
    expect(mockStore.responses[0]).toMatchObject({
      dilemmaId: dilemmas[0].dilemmaId,
      chosenOption: 'a',
      reasoning: '',
      perceivedDifficulty: 5
    });
  });

  test('goToNext advances properly and clears form', () => {
    // This would catch navigation state bugs
    
    const dilemmas = createTestDilemmas(3);
    mockStore.setDilemmas(dilemmas);
    mockStore.setSelectedOption('b');
    mockStore.setReasoning('Test reasoning');
    mockStore.setPerceivedDifficulty(8);
    
    expect(mockStore.currentIndex).toBe(0);
    
    // Go to next
    const hasNext = mockStore.goToNext();
    
    expect(hasNext).toBe(true);
    expect(mockStore.currentIndex).toBe(1);
    expect(mockStore.selectedOption).toBe(''); // Form cleared
    expect(mockStore.reasoning).toBe('');
    expect(mockStore.perceivedDifficulty).toBe(5);
    expect(mockStore.responses).toHaveLength(1); // Response saved
  });

  test('restoreResponseForIndex loads previous data correctly', () => {
    // This would catch form restoration bugs
    
    const dilemmas = createTestDilemmas(3);
    mockStore.setDilemmas(dilemmas);
    
    // Create a saved response
    mockStore.responses = [{
      dilemmaId: dilemmas[1].dilemmaId,
      chosenOption: 'c',
      reasoning: 'Previous reasoning',
      responseTime: 5000,
      perceivedDifficulty: 7
    }];
    
    // Set current index to 1 and restore
    mockStore.currentIndex = 1;
    mockStore.restoreResponseForIndex(1);
    
    expect(mockStore.selectedOption).toBe('c');
    expect(mockStore.reasoning).toBe('Previous reasoning');
    expect(mockStore.perceivedDifficulty).toBe(7);
  });

  test('handles empty dilemmas array gracefully', () => {
    // Edge case testing
    
    mockStore.setDilemmas([]);
    
    expect(mockStore.getCurrentDilemma()).toBeNull();
    expect(mockStore.getCurrentDilemmaId()).toBeNull();
    expect(mockStore.getProgress()).toEqual({ current: 1, total: 0 });
    
    // Should not crash when trying to save response
    mockStore.setSelectedOption('a');
    mockStore.saveCurrentResponse();
    expect(mockStore.responses).toHaveLength(0);
  });

  test('handles invalid selectedOption gracefully', () => {
    const dilemmas = createTestDilemmas(1);
    mockStore.setDilemmas(dilemmas);
    
    // Don't set selected option
    mockStore.saveCurrentResponse();
    expect(mockStore.responses).toHaveLength(0);
    
    // Set empty selected option
    mockStore.setSelectedOption('');
    mockStore.saveCurrentResponse();
    expect(mockStore.responses).toHaveLength(0);
  });

  test('goToNext on last dilemma returns false', () => {
    const dilemmas = createTestDilemmas(1);
    mockStore.setDilemmas(dilemmas);
    mockStore.setSelectedOption('a');
    
    expect(mockStore.currentIndex).toBe(0);
    
    const hasNext = mockStore.goToNext();
    
    expect(hasNext).toBe(false); // Was last dilemma
    expect(mockStore.currentIndex).toBe(0); // Stays at last
    expect(mockStore.responses).toHaveLength(1); // Response still saved
  });

  test('duplicate responses update existing entry', () => {
    // Test that re-answering same dilemma updates, doesn't duplicate
    
    const dilemmas = createTestDilemmas(2);
    mockStore.setDilemmas(dilemmas);
    
    // Answer first dilemma
    mockStore.setSelectedOption('a');
    mockStore.saveCurrentResponse();
    expect(mockStore.responses).toHaveLength(1);
    
    // Change answer to same dilemma
    mockStore.setSelectedOption('b');
    mockStore.setReasoning('Changed my mind');
    mockStore.saveCurrentResponse();
    
    expect(mockStore.responses).toHaveLength(1); // Still only 1 response
    expect(mockStore.responses[0].chosenOption).toBe('b');
    expect(mockStore.responses[0].reasoning).toBe('Changed my mind');
  });

  test('setDilemmas with startingDilemmaId sets correct index', () => {
    const dilemmas = createTestDilemmas(5);
    const targetDilemmaId = dilemmas[2].dilemmaId;
    
    mockStore.setDilemmas(dilemmas, targetDilemmaId);
    
    expect(mockStore.currentIndex).toBe(2);
    expect(mockStore.getCurrentDilemma()?.dilemmaId).toBe(targetDilemmaId);
  });

  test('setDilemmas with invalid startingDilemmaId defaults to 0', () => {
    const dilemmas = createTestDilemmas(3);
    
    mockStore.setDilemmas(dilemmas, 'non-existent-id');
    
    expect(mockStore.currentIndex).toBe(0);
    expect(mockStore.getCurrentDilemma()?.dilemmaId).toBe(dilemmas[0].dilemmaId);
  });

  test('progress calculation is correct', () => {
    const dilemmas = createTestDilemmas(10);
    mockStore.setDilemmas(dilemmas);
    
    expect(mockStore.getProgress()).toEqual({ current: 1, total: 10 });
    
    mockStore.currentIndex = 4;
    expect(mockStore.getProgress()).toEqual({ current: 5, total: 10 });
    
    mockStore.currentIndex = 9;
    expect(mockStore.getProgress()).toEqual({ current: 10, total: 10 });
  });

  test('reset clears all state properly', () => {
    const dilemmas = createTestDilemmas(3);
    mockStore.setDilemmas(dilemmas);
    mockStore.setSelectedOption('a');
    mockStore.setReasoning('Test');
    mockStore.setPerceivedDifficulty(8);
    mockStore.currentIndex = 2;
    mockStore.responses = [{ dilemmaId: 'test', chosenOption: 'a', reasoning: '', responseTime: 0, perceivedDifficulty: 5 }];
    
    mockStore.reset();
    
    expect(mockStore.dilemmas).toEqual([]);
    expect(mockStore.currentIndex).toBe(0);
    expect(mockStore.responses).toEqual([]);
    expect(mockStore.selectedOption).toBe('');
    expect(mockStore.reasoning).toBe('');
    expect(mockStore.perceivedDifficulty).toBe(5);
    expect(mockStore.sessionId).toBe('test-session'); // Mock always returns this
  });

});