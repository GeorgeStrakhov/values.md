import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface DilemmaState {
  // Core data
  dilemmas: Dilemma[];
  currentIndex: number;
  responses: Response[];
  sessionId: string;
  
  // UI state
  selectedOption: string;
  reasoning: string;
  perceivedDifficulty: number;
  startTime: number;
  
  // State management
  isProcessing: boolean;
  lastStateUpdate: number;
  optimisticUpdates: Map<string, any>;
  stateVersion: number;
  
  // Actions
  setDilemmas: (dilemmas: Dilemma[], startingDilemmaId?: string) => void;
  setCurrentIndex: (index: number) => void;
  setSelectedOption: (option: string) => void;
  setReasoning: (reasoning: string) => void;
  setPerceivedDifficulty: (difficulty: number) => void;
  setStartTime: (time: number) => void;
  
  // Navigation
  goToNext: () => Promise<boolean>; // returns true if not last, false if completed
  goToPrevious: () => void;
  
  // Response handling
  saveCurrentResponse: () => void;
  restoreResponseForIndex: (index: number) => void;
  submitResponsesToDatabase: () => Promise<boolean>;
  
  // Getters
  getCurrentDilemma: () => Dilemma | null;
  getCurrentDilemmaId: () => string | null;
  getProgress: () => { current: number; total: number };
  
  // Response handling
  saveCurrentResponseAtomic: () => Promise<void>;
  
  // State management
  resolveStateConflict: (remoteState: any) => void;
  recoverState: () => any;
  validateState: () => boolean;
  
  // Reset
  reset: () => void;
}

const generateSessionId = () => 
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDilemmaStore = create<DilemmaState>()(
  persist(
    (set, get) => ({
          // Initial state
      dilemmas: [],
      currentIndex: 0,
      responses: [],
      sessionId: generateSessionId(),
      
      selectedOption: '',
      reasoning: '',
      perceivedDifficulty: 5,
      startTime: Date.now(),
      
      // State management
      isProcessing: false,
      lastStateUpdate: Date.now(),
      optimisticUpdates: new Map(),
      stateVersion: 1,
      
      // Actions
      setDilemmas: (dilemmas, startingDilemmaId) => {
        let startIndex = 0;
        
        // If a specific dilemma is requested, find its index
        if (startingDilemmaId) {
          const index = dilemmas.findIndex(d => d.dilemmaId === startingDilemmaId);
          if (index !== -1) {
            startIndex = index;
          }
        }
        
        set({ 
          dilemmas, 
          currentIndex: startIndex,
          startTime: Date.now(),
          selectedOption: '',
          reasoning: '',
          perceivedDifficulty: 5
        });
      },
      
      setCurrentIndex: (index) => set({ currentIndex: index }),
      setSelectedOption: (option) => set({ selectedOption: option }),
      setReasoning: (reasoning) => set({ reasoning }),
      setPerceivedDifficulty: (difficulty) => set({ perceivedDifficulty: difficulty }),
      setStartTime: (time) => set({ startTime: time }),
      
      // Navigation with atomic updates
      goToNext: async () => {
        const startTime = Date.now();
        let state = get();
        
        // Prevent concurrent navigation
        if (state.isProcessing) {
          console.warn('Navigation already in progress, ignoring duplicate request');
          return state.currentIndex < state.dilemmas.length - 1;
        }
        
        // Set processing flag atomically
        set({ isProcessing: true, lastStateUpdate: startTime });
        
        try {
          state = get(); // Get fresh state
          
          // Always save the current response first (atomic operation)
          await state.saveCurrentResponseAtomic();
          
          if (state.currentIndex < state.dilemmas.length - 1) {
            const nextIndex = state.currentIndex + 1;
            
            // Atomic state update with version increment
            set({
              currentIndex: nextIndex,
              selectedOption: '',
              reasoning: '',
              perceivedDifficulty: 5,
              startTime: Date.now(),
              stateVersion: state.stateVersion + 1,
              lastStateUpdate: Date.now(),
              isProcessing: false
            });
            
            // Restore response if one exists for this dilemma
            const updatedState = get();
            updatedState.restoreResponseForIndex(nextIndex);
            
            // Scroll to top on navigation
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return true; // Not last
          }
          
          // This was the final dilemma - submit all responses to database
          const success = await state.submitResponsesToDatabase();
          
          set({ isProcessing: false });
          return false; // Was last
          
        } catch (error) {
          console.error('Navigation error:', error);
          set({ isProcessing: false });
          throw error;
        }
      },
      
      goToPrevious: () => {
        const state = get();
        
        // Prevent navigation if processing
        if (state.isProcessing) {
          console.warn('Cannot navigate backwards while processing');
          return;
        }
        
        if (state.currentIndex > 0) {
          const prevIndex = state.currentIndex - 1;
          
          // Atomic state update
          set({ 
            currentIndex: prevIndex,
            stateVersion: state.stateVersion + 1,
            lastStateUpdate: Date.now()
          });
          
          // Need to get fresh state after currentIndex update
          const updatedState = get();
          updatedState.restoreResponseForIndex(prevIndex);
          
          // Scroll to top on navigation
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      },
      
      // Response handling with atomic updates
      saveCurrentResponse: () => {
        const state = get();
        state.saveCurrentResponseAtomic();
      },
      
      saveCurrentResponseAtomic: async () => {
        const state = get();
        const currentDilemma = state.getCurrentDilemma();
        
        if (currentDilemma && state.selectedOption) {
          const responseTime = Date.now() - state.startTime;
          const responseId = `${currentDilemma.dilemmaId}_${state.sessionId}`;
          
          const newResponse: Response = {
            dilemmaId: currentDilemma.dilemmaId,
            chosenOption: state.selectedOption,
            reasoning: state.reasoning,
            responseTime,
            perceivedDifficulty: state.perceivedDifficulty,
          };
          
          // Optimistic update with rollback capability
          const previousResponses = state.responses;
          state.optimisticUpdates.set(responseId, previousResponses);
          
          try {
            // Atomic response update
            const responses = [...state.responses];
            const existingIndex = responses.findIndex(r => r.dilemmaId === currentDilemma.dilemmaId);
            
            if (existingIndex !== -1) {
              responses[existingIndex] = newResponse;
            } else {
              responses.push(newResponse);
            }
            
            // Atomic state update with version increment
            set({ 
              responses,
              stateVersion: state.stateVersion + 1,
              lastStateUpdate: Date.now()
            });
            
            // Clear optimistic update on success
            state.optimisticUpdates.delete(responseId);
            
          } catch (error) {
            console.error('Failed to save response, rolling back:', error);
            // Rollback on failure
            const rollbackData = state.optimisticUpdates.get(responseId);
            if (rollbackData) {
              set({ responses: rollbackData });
              state.optimisticUpdates.delete(responseId);
            }
            throw error;
          }
        }
      },
      
      restoreResponseForIndex: (index) => {
        const state = get();
        const dilemma = state.dilemmas[index];
        if (dilemma) {
          const response = state.responses.find(r => r.dilemmaId === dilemma.dilemmaId);
          if (response) {
            set({
              selectedOption: response.chosenOption,
              reasoning: response.reasoning,
              perceivedDifficulty: response.perceivedDifficulty
            });
          } else {
            // No response yet, clear form
            set({
              selectedOption: '',
              reasoning: '',
              perceivedDifficulty: 5
            });
          }
        }
      },

      submitResponsesToDatabase: async () => {
        const state = get();
        if (state.responses.length === 0) {
          return false;
        }

        try {
          const response = await fetch('/api/responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: state.sessionId,
              responses: state.responses
            }),
          });

          return response.ok;
        } catch (error) {
          console.error('Failed to submit responses to database:', error);
          return false;
        }
      },
      
      // Getters
      getCurrentDilemma: () => {
        const state = get();
        return state.dilemmas[state.currentIndex] || null;
      },
      
      getCurrentDilemmaId: () => {
        const dilemma = get().getCurrentDilemma();
        return dilemma?.dilemmaId || null;
      },
      
      getProgress: () => {
        const state = get();
        return {
          current: state.currentIndex + 1,
          total: state.dilemmas.length
        };
      },
      
      // State conflict resolution
      resolveStateConflict: (remoteState: any) => {
        const localState = get();
        
        // Use timestamp-based resolution - most recent wins
        const useRemote = remoteState.lastStateUpdate > localState.lastStateUpdate;
        
        if (useRemote) {
          console.log('Resolving state conflict: using remote state');
          set({
            ...remoteState,
            conflictResolution: {
              resolvedBy: 'timestamp',
              conflictTime: Date.now(),
              chosenState: 'remote'
            }
          });
        } else {
          console.log('Resolving state conflict: keeping local state');
          set({
            conflictResolution: {
              resolvedBy: 'timestamp',
              conflictTime: Date.now(),
              chosenState: 'local'
            }
          });
        }
      },
      
      // State recovery after crashes
      recoverState: () => {
        const state = get();
        const recoveredData = {
          ...state,
          isProcessing: false, // Clear any stuck processing flags
          lastStateUpdate: Date.now(),
          optimisticUpdates: new Map(), // Clear optimistic updates
          stateVersion: state.stateVersion + 1
        };
        
        set(recoveredData);
        console.log('State recovered after crash/reload');
        return recoveredData;
      },
      
      // Validate state consistency
      validateState: () => {
        const state = get();
        const isValid = 
          Array.isArray(state.responses) &&
          typeof state.currentIndex === 'number' &&
          state.currentIndex >= 0 &&
          state.currentIndex < state.dilemmas.length &&
          typeof state.sessionId === 'string' &&
          state.sessionId.length > 0;
          
        if (!isValid) {
          console.warn('Invalid state detected, resetting to safe defaults');
          state.reset();
          return false;
        }
        
        return true;
      },
      
      // Reset with proper cleanup
      reset: () => {
        const newSessionId = generateSessionId();
        set({
          dilemmas: [],
          currentIndex: 0,
          responses: [],
          sessionId: newSessionId,
          selectedOption: '',
          reasoning: '',
          perceivedDifficulty: 5,
          startTime: Date.now(),
          isProcessing: false,
          lastStateUpdate: Date.now(),
          optimisticUpdates: new Map(),
          stateVersion: 1
        });
        console.log('Store reset with new session:', newSessionId);
      }
    }),
    {
      name: 'dilemma-session',
      // Persist state with version tracking for conflict resolution
      partialize: (state) => ({
        responses: state.responses,
        sessionId: state.sessionId,
        currentIndex: state.currentIndex,
        selectedOption: state.selectedOption,
        reasoning: state.reasoning,
        perceivedDifficulty: state.perceivedDifficulty,
        lastStateUpdate: state.lastStateUpdate,
        stateVersion: state.stateVersion
      }),
      
      // State migration for version compatibility
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migrate from version 0 to 1 - add state management fields
          return {
            ...persistedState,
            isProcessing: false,
            lastStateUpdate: Date.now(),
            optimisticUpdates: new Map(),
            stateVersion: 1
          };
        }
        return persistedState;
      },
      
      version: 1
    }
  )
);
