/**
 * Test Utilities
 * 
 * Helper functions for setting up and tearing down test scenarios
 */

import { db } from '../src/lib/db';
import { userResponses, dilemmas, motifs, frameworks } from '../src/lib/schema';
import { eq } from 'drizzle-orm';
import { testSeedData } from './test-data';

// Database test helpers
export async function setupTestDatabase() {
  // Insert test motifs
  for (const motif of testSeedData.motifs) {
    await db.insert(motifs).values(motif).onConflictDoNothing();
  }
  
  // Insert test frameworks
  for (const framework of testSeedData.frameworks) {
    await db.insert(frameworks).values(framework).onConflictDoNothing();
  }
  
  // Insert test dilemmas
  for (const dilemma of testSeedData.dilemmas) {
    await db.insert(dilemmas).values(dilemma).onConflictDoNothing();
  }
}

export async function cleanupTestDatabase(sessionIds: string[] = []) {
  // Clean up test responses
  for (const sessionId of sessionIds) {
    await db.delete(userResponses).where(eq(userResponses.sessionId, sessionId));
  }
  
  // Clean up test dilemmas (this will cascade to responses)
  await db.delete(dilemmas).where(eq(dilemmas.domain, 'test'));
}

export async function insertTestResponses(sessionId: string, responses: any[]) {
  const responseValues = responses.map(response => ({
    sessionId,
    dilemmaId: response.dilemmaId,
    chosenOption: response.chosenOption,
    reasoning: response.reasoning || '',
    responseTime: response.responseTime || 0,
    perceivedDifficulty: response.perceivedDifficulty || 5,
  }));

  await db.insert(userResponses).values(responseValues);
  return responseValues;
}

// Browser test helpers
export async function setupBrowserTest(page: any) {
  // Clear browser storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Set up any required environment variables or mocks
  await page.addInitScript(() => {
    // Mock console methods to reduce noise in tests
    window.console.debug = () => {};
  });
}

export async function fillDilemmaForm(page: any, choice: string, reasoning?: string, difficulty?: number) {
  // Select choice
  await page.click(`[data-testid="choice-${choice}"]`);
  
  // Add reasoning if provided
  if (reasoning) {
    await page.fill('textarea[placeholder*="reasoning"]', reasoning);
  }
  
  // Set difficulty if provided
  if (difficulty) {
    // This is a simplified approach - in reality we'd need to interact with the slider properly
    await page.evaluate((diff: number) => {
      const slider = document.querySelector('[data-testid="difficulty-slider"]') as HTMLInputElement;
      if (slider) {
        // Trigger slider change event with the difficulty value
        const event = new Event('change', { bubbles: true });
        slider.value = diff.toString();
        slider.dispatchEvent(event);
      }
    }, difficulty);
  }
}

export async function waitForDilemmaToLoad(page: any) {
  // Wait for dilemma title to be visible
  await page.waitForSelector('[data-testid="dilemma-title"]', { state: 'visible' });
  
  // Wait for all choices to be visible
  await page.waitForSelector('[data-testid="choice-a"]', { state: 'visible' });
  await page.waitForSelector('[data-testid="choice-b"]', { state: 'visible' });
  await page.waitForSelector('[data-testid="choice-c"]', { state: 'visible' });
  await page.waitForSelector('[data-testid="choice-d"]', { state: 'visible' });
}

export async function getLocalStorageData(page: any, key: string) {
  return await page.evaluate((storageKey: string) => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  }, key);
}

export async function setLocalStorageData(page: any, key: string, data: any) {
  await page.evaluate(({ storageKey, storageData }: { storageKey: string; storageData: any }) => {
    localStorage.setItem(storageKey, JSON.stringify(storageData));
  }, { storageKey: key, storageData: data });
}

// API test helpers
export async function callAPI(path: string, options: any = {}) {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${baseURL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : await response.text();
    
  return {
    status: response.status,
    data,
    headers: response.headers
  };
}

// Zustand store test helpers
export function createMockStore(initialState = {}) {
  const state = {
    dilemmas: [] as any[],
    currentIndex: 0,
    responses: [] as any[],
    sessionId: 'test-session',
    selectedOption: '',
    reasoning: '',
    perceivedDifficulty: 5,
    startTime: Date.now(),
    ...initialState
  };
  
  const actions = {
    setDilemmas: (dilemmas: any[], startingDilemmaId?: string) => {
      state.dilemmas = dilemmas;
      if (startingDilemmaId) {
        const index = dilemmas.findIndex(d => d.dilemmaId === startingDilemmaId);
        state.currentIndex = index !== -1 ? index : 0;
      } else {
        state.currentIndex = 0;
      }
    },
    setCurrentIndex: (index: number) => {
      state.currentIndex = index;
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
    getCurrentDilemma: () => state.dilemmas[state.currentIndex] || null,
    getCurrentDilemmaId: () => state.dilemmas[state.currentIndex]?.dilemmaId || null,
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
    goToNext: () => {
      actions.saveCurrentResponse();
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
    restoreResponseForIndex: (index: number) => {
      const dilemma = state.dilemmas[index];
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
    },
    reset: () => {
      Object.assign(state, {
        dilemmas: [],
        currentIndex: 0,
        responses: [],
        sessionId: 'test-session',
        selectedOption: '',
        reasoning: '',
        perceivedDifficulty: 5,
        startTime: Date.now(),
        autoAdvanceState: { active: false, remaining: 0 },
      });
    }
  };
  
  // Create a proxy object that exposes both state and actions
  const mockStore = { ...state, ...actions };
  
  // Make state properties writable
  Object.defineProperty(mockStore, 'currentIndex', {
    get: () => state.currentIndex,
    set: (value) => { state.currentIndex = value; },
    enumerable: true
  });
  
  Object.defineProperty(mockStore, 'responses', {
    get: () => state.responses,
    set: (value) => { state.responses = value; },
    enumerable: true
  });
  
  // Make all other state properties reactive too
  ['selectedOption', 'reasoning', 'perceivedDifficulty', 'dilemmas'].forEach(prop => {
    Object.defineProperty(mockStore, prop, {
      get: () => state[prop as keyof typeof state],
      set: (value) => { (state as any)[prop] = value; },
      enumerable: true
    });
  });
  
  return mockStore;
}

// Timer test helpers
export function createMockTimers() {
  const timers = new Map();
  let timerId = 1;
  
  const mockSetInterval = (callback: Function, delay: number) => {
    const id = timerId++;
    timers.set(id, { callback, delay, type: 'interval' });
    return id;
  };
  
  const mockClearInterval = (id: number) => {
    timers.delete(id);
  };
  
  const advanceTimers = (milliseconds: number) => {
    for (const [id, timer] of timers) {
      if (timer.type === 'interval') {
        // Simplified - in real implementation would track elapsed time
        timer.callback();
      }
    }
  };
  
  return {
    setInterval: mockSetInterval,
    clearInterval: mockClearInterval,
    advanceTimers,
    clearAllTimers: () => timers.clear()
  };
}