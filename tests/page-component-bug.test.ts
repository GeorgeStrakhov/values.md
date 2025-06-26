/**
 * Page Component Bug Test
 * 
 * Tests the actual bug in the page component where navigation resets state
 */

import { describe, test, expect } from 'vitest';

// Simulate the page component logic
function simulatePageNavigation() {
  // Mock store state
  let storeState = {
    dilemmas: [
      { dilemmaId: 'uuid-1', title: 'Dilemma 1' },
      { dilemmaId: 'uuid-2', title: 'Dilemma 2' },
      { dilemmaId: 'uuid-3', title: 'Dilemma 3' }
    ],
    currentIndex: 0,
    selectedOption: ''
  };

  // Mock store actions
  const setDilemmas = (dilemmas: any[], startingDilemmaId?: string) => {
    let startIndex = 0;
    
    if (startingDilemmaId) {
      const index = dilemmas.findIndex(d => d.dilemmaId === startingDilemmaId);
      if (index !== -1) {
        startIndex = index;
      }
    }
    
    storeState = {
      ...storeState,
      dilemmas,
      currentIndex: startIndex,
      selectedOption: '' // 🐛 This resets selection!
    };
  };

  const goToNext = async () => {
    if (storeState.currentIndex < storeState.dilemmas.length - 1) {
      storeState.currentIndex++;
      storeState.selectedOption = '';
      return true;
    }
    return false;
  };

  const setSelectedOption = (option: string) => {
    storeState.selectedOption = option;
  };

  // Simulate page component useEffect logic
  const simulateUseEffect = (resolvedUUID: string) => {
    const { dilemmas, currentIndex } = storeState;
    
    // This is the exact logic from the page component
    if (dilemmas.length === 0 || !dilemmas.some(d => d.dilemmaId === resolvedUUID)) {
      // Would fetch dilemmas - skip for test
    } else {
      // We have dilemmas, just update the current index to match the URL
      const targetIndex = dilemmas.findIndex(d => d.dilemmaId === resolvedUUID);
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        console.log(`🐛 RESET! targetIndex: ${targetIndex}, currentIndex: ${currentIndex}`);
        setDilemmas(dilemmas, resolvedUUID);
      }
    }
  };

  return {
    storeState: () => storeState,
    setSelectedOption,
    goToNext,
    simulateUseEffect
  };
}

describe('Page Component Navigation Bug', () => {
  test('reproduces the Next button bug', async () => {
    const sim = simulatePageNavigation();
    
    // User starts on first dilemma
    expect(sim.storeState().currentIndex).toBe(0);
    expect(sim.storeState().dilemmas[0].dilemmaId).toBe('uuid-1');
    
    // User selects an option
    sim.setSelectedOption('a');
    expect(sim.storeState().selectedOption).toBe('a');
    
    // User clicks Next - this should work
    const hasNext = await sim.goToNext();
    expect(hasNext).toBe(true);
    expect(sim.storeState().currentIndex).toBe(1); // ✅ Index advanced
    expect(sim.storeState().selectedOption).toBe(''); // ✅ Selection cleared
    
    // Router navigates to new URL - simulate the useEffect
    // Current state: currentIndex = 1, we're navigating to uuid-2
    const newUUID = 'uuid-2'; // This should match index 1
    
    // 🐛 BUG: The useEffect might reset state incorrectly
    sim.simulateUseEffect(newUUID);
    
    // After useEffect, what's the state?
    const finalState = sim.storeState();
    console.log('Final state:', finalState);
    
    // This should pass if navigation works correctly
    expect(finalState.currentIndex).toBe(1);
    expect(finalState.dilemmas[finalState.currentIndex].dilemmaId).toBe('uuid-2');
  });
  
  test('identifies the exact race condition', async () => {
    const sim = simulatePageNavigation();
    
    // Track state changes
    const stateChanges: any[] = [];
    
    // Initial state
    stateChanges.push({ step: 'initial', ...sim.storeState() });
    
    // Select option
    sim.setSelectedOption('b');
    stateChanges.push({ step: 'selected', ...sim.storeState() });
    
    // Navigation
    await sim.goToNext();
    stateChanges.push({ step: 'after_goToNext', ...sim.storeState() });
    
    // URL change triggers useEffect
    sim.simulateUseEffect('uuid-2');
    stateChanges.push({ step: 'after_useEffect', ...sim.storeState() });
    
    console.log('State progression:', stateChanges);
    
    // Check if currentIndex stays consistent
    expect(stateChanges[2].currentIndex).toBe(1); // After goToNext
    expect(stateChanges[3].currentIndex).toBe(1); // After useEffect - should be same
  });
  
  test('race condition: useEffect runs before goToNext completes', async () => {
    // This test simulates what might happen in React's concurrent mode
    const sim = simulatePageNavigation();
    
    // User selects option
    sim.setSelectedOption('c');
    
    // Simulate: useEffect runs with OLD currentIndex before goToNext updates it
    const oldCurrentIndex = sim.storeState().currentIndex; // 0
    
    // goToNext updates currentIndex
    await sim.goToNext(); // currentIndex becomes 1
    
    // But useEffect might run with stale closure over old currentIndex
    // Simulating: useEffect sees currentIndex=0 but URL is for dilemma at index 1
    const targetIndex = 1; // URL is for uuid-2
    const staleCurrentIndex = oldCurrentIndex; // 0 (stale closure)
    
    if (targetIndex !== staleCurrentIndex) {
      console.log('🐛 Race condition detected!');
      console.log(`targetIndex: ${targetIndex}, stale currentIndex: ${staleCurrentIndex}`);
      
      // This would trigger the reset
      expect(targetIndex).not.toBe(staleCurrentIndex);
    }
  });
});