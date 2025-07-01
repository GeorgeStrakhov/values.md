/**
 * Enhanced Dilemma Store with State Machine Integration
 * 
 * Combines Zustand persistence with finite state machine for robust
 * session management and predictable state transitions.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppStateMachine, AppState, AppEvent, AppContext, routeValidation } from './app-state-machine';

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

interface EnhancedDilemmaState {
  // State Machine
  appState: AppState;
  stateMachine: AppStateMachine | null;
  
  // Core Data (synced with state machine context)
  dilemmas: Dilemma[];
  currentIndex: number;
  responses: Response[];
  sessionId: string;
  valuesMarkdown: string | null;
  error: string | null;
  
  // UI State
  selectedOption: string;
  reasoning: string;
  perceivedDifficulty: number;
  startTime: number;
  
  // Async State
  isLoading: boolean;
  isSubmitting: boolean;
  isGenerating: boolean;
  
  // Validation Flags
  hasValidSession: boolean;
  hasCompleteResponses: boolean;
  canGenerateValues: boolean;
  
  // Actions
  initializeStateMachine: () => void;
  sendEvent: (event: AppEvent) => void;
  
  // Data Actions
  setDilemmas: (dilemmas: Dilemma[], startingDilemmaId?: string) => void;
  setCurrentIndex: (index: number) => void;
  setSelectedOption: (option: string) => void;
  setReasoning: (reasoning: string) => void;
  setPerceivedDifficulty: (difficulty: number) => void;
  
  // Session Actions
  startNewSession: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  validateSession: () => boolean;
  clearSession: () => void;
  
  // Navigation Actions
  goToNext: () => Promise<boolean>;
  goToPrevious: () => void;
  navigateToDilemma: (index: number) => void;
  
  // Response Actions
  saveCurrentResponse: () => void;
  restoreResponseForIndex: (index: number) => void;
  submitResponsesToDatabase: () => Promise<boolean>;
  
  // Values Generation
  generateValues: () => Promise<boolean>;
  
  // Route Validation
  canAccessRoute: (path: string) => boolean;
  getRedirectPath: (requestedPath: string) => string | null;
  
  // Getters
  getCurrentDilemma: () => Dilemma | null;
  getCurrentDilemmaId: () => string | null;
  getProgress: () => { current: number; total: number };
  
  // Reset
  reset: () => void;
}

const generateSessionId = () => 
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useEnhancedDilemmaStore = create<EnhancedDilemmaState>()(
  persist(
    (set, get) => ({
      // Initial state
      appState: 'idle',
      stateMachine: null,
      
      dilemmas: [],
      currentIndex: 0,
      responses: [],
      sessionId: generateSessionId(),
      valuesMarkdown: null,
      error: null,
      
      selectedOption: '',
      reasoning: '',
      perceivedDifficulty: 5,
      startTime: Date.now(),
      
      isLoading: false,
      isSubmitting: false,
      isGenerating: false,
      
      hasValidSession: false,
      hasCompleteResponses: false,
      canGenerateValues: false,
      
      // Initialize state machine
      initializeStateMachine: () => {
        const state = get();
        const machine = new AppStateMachine({
          sessionId: state.sessionId,
          dilemmas: state.dilemmas,
          currentIndex: state.currentIndex,
          responses: state.responses,
          valuesMarkdown: state.valuesMarkdown,
          error: state.error,
          hasValidSession: state.hasValidSession,
          hasCompleteResponses: state.hasCompleteResponses,
          canGenerateValues: state.canGenerateValues
        });
        
        // Subscribe to state machine changes
        machine.subscribe((appState, context) => {
          set({
            appState,
            dilemmas: context.dilemmas,
            currentIndex: context.currentIndex,
            responses: context.responses,
            sessionId: context.sessionId || undefined,
            valuesMarkdown: context.valuesMarkdown,
            error: context.error,
            hasValidSession: context.hasValidSession,
            hasCompleteResponses: context.hasCompleteResponses,
            canGenerateValues: context.canGenerateValues,
            isLoading: appState === 'loading',
            isSubmitting: appState === 'submitting',
            isGenerating: appState === 'generating'
          });
        });
        
        set({ stateMachine: machine });
        
        // Try to restore session on initialization
        const restoreAction = get().restoreSession;
        restoreAction();
      },
      
      // Send event to state machine
      sendEvent: (event: AppEvent) => {
        const { stateMachine } = get();
        if (stateMachine) {
          stateMachine.send(event);
        }
      },
      
      // Set dilemmas and update state machine
      setDilemmas: (dilemmas, startingDilemmaId) => {
        let startIndex = 0;
        
        if (startingDilemmaId) {
          const index = dilemmas.findIndex(d => d.dilemmaId === startingDilemmaId);
          if (index !== -1) {
            startIndex = index;
          }
        }
        
        const { sendEvent } = get();
        sendEvent({
          type: 'DILEMMAS_LOADED',
          dilemmas,
          startingIndex: startIndex
        });
        
        // Clear UI state for new dilemma
        set({
          selectedOption: '',
          reasoning: '',
          perceivedDifficulty: 5,
          startTime: Date.now()
        });
      },
      
      setCurrentIndex: (index) => {
        const { sendEvent } = get();
        sendEvent({ type: 'NAVIGATE_TO_DILEMMA', index });
      },
      
      setSelectedOption: (option) => set({ selectedOption: option }),
      setReasoning: (reasoning) => set({ reasoning }),
      setPerceivedDifficulty: (difficulty) => set({ perceivedDifficulty: difficulty }),
      
      // Start new session
      startNewSession: async () => {
        const { sendEvent } = get();
        sendEvent({ type: 'START_SESSION' });
        
        try {
          // Fetch random dilemmas
          const response = await fetch('/api/dilemmas/random');
          if (!response.ok) {
            throw new Error(`Failed to fetch dilemmas: ${response.status}`);
          }
          
          const data = await response.json();
          
          const { setDilemmas } = get();
          setDilemmas(data.dilemmas);
          
        } catch (error) {
          sendEvent({
            type: 'DILEMMAS_LOAD_FAILED',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      },
      
      // Restore session from localStorage
      restoreSession: async () => {
        const state = get();
        
        // Check if we have valid persisted data
        if (state.responses.length > 0 && state.sessionId) {
          const { sendEvent } = get();
          sendEvent({
            type: 'SESSION_RESTORED',
            responses: state.responses,
            sessionId: state.sessionId
          });
          
          // If no dilemmas loaded, try to load them
          if (state.dilemmas.length === 0) {
            await state.startNewSession();
          }
          
          return true;
        }
        
        return false;
      },
      
      // Validate current session
      validateSession: () => {
        const state = get();
        return state.hasValidSession && state.dilemmas.length > 0;
      },
      
      // Clear session data
      clearSession: () => {
        const { sendEvent } = get();
        sendEvent({ type: 'RESET_SESSION' });
        
        set({
          sessionId: generateSessionId(),
          selectedOption: '',
          reasoning: '',
          perceivedDifficulty: 5,
          startTime: Date.now()
        });
      },
      
      // Navigation
      goToNext: async () => {
        const state = get();
        
        // Save current response first
        state.saveCurrentResponse();
        
        if (state.currentIndex < state.dilemmas.length - 1) {
          const nextIndex = state.currentIndex + 1;
          state.setCurrentIndex(nextIndex);
          
          // Clear form for next dilemma
          set({
            selectedOption: '',
            reasoning: '',
            perceivedDifficulty: 5,
            startTime: Date.now()
          });
          
          // Restore response if one exists
          state.restoreResponseForIndex(nextIndex);
          
          return true;
        }
        
        // Last dilemma - submit responses
        const success = await state.submitResponsesToDatabase();
        if (success) {
          await state.generateValues();
        }
        
        return false;
      },
      
      goToPrevious: () => {
        const state = get();
        if (state.currentIndex > 0) {
          const prevIndex = state.currentIndex - 1;
          state.setCurrentIndex(prevIndex);
          state.restoreResponseForIndex(prevIndex);
        }
      },
      
      navigateToDilemma: (index) => {
        const state = get();
        if (index >= 0 && index < state.dilemmas.length) {
          state.setCurrentIndex(index);
          state.restoreResponseForIndex(index);
        }
      },
      
      // Response handling
      saveCurrentResponse: () => {
        const state = get();
        const currentDilemma = state.getCurrentDilemma();
        
        if (currentDilemma && state.selectedOption) {
          const responseTime = Date.now() - state.startTime;
          const newResponse: Response = {
            dilemmaId: currentDilemma.dilemmaId,
            chosenOption: state.selectedOption,
            reasoning: state.reasoning,
            responseTime,
            perceivedDifficulty: state.perceivedDifficulty,
          };
          
          const { sendEvent } = get();
          sendEvent({ type: 'ANSWER_SUBMITTED', answer: newResponse });
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
            set({
              selectedOption: '',
              reasoning: '',
              perceivedDifficulty: 5
            });
          }
        }
      },
      
      // Submit responses to database
      submitResponsesToDatabase: async () => {
        const state = get();
        if (state.responses.length === 0) return false;

        const { sendEvent } = get();
        sendEvent({ type: 'SUBMIT_RESPONSES' });

        try {
          const response = await fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: state.sessionId,
              responses: state.responses
            }),
          });

          if (response.ok) {
            sendEvent({ type: 'RESPONSES_SUBMITTED' });
            return true;
          } else {
            throw new Error(`Submission failed: ${response.status}`);
          }
        } catch (error) {
          sendEvent({
            type: 'SUBMISSION_FAILED',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return false;
        }
      },
      
      // Generate values
      generateValues: async () => {
        const state = get();
        const { sendEvent } = get();
        
        sendEvent({ type: 'GENERATE_VALUES' });
        
        try {
          const response = await fetch('/api/generate-values', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: state.sessionId }),
          });
          
          if (response.ok) {
            const data = await response.json();
            sendEvent({
              type: 'VALUES_GENERATED',
              valuesMarkdown: data.valuesMarkdown
            });
            return true;
          } else {
            throw new Error(`Values generation failed: ${response.status}`);
          }
        } catch (error) {
          sendEvent({
            type: 'GENERATION_FAILED',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return false;
        }
      },
      
      // Route validation
      canAccessRoute: (path) => {
        const state = get();
        const context = {
          sessionId: state.sessionId,
          dilemmas: state.dilemmas,
          currentIndex: state.currentIndex,
          responses: state.responses,
          valuesMarkdown: state.valuesMarkdown,
          error: state.error,
          hasValidSession: state.hasValidSession,
          hasCompleteResponses: state.hasCompleteResponses,
          canGenerateValues: state.canGenerateValues
        };
        
        if (path.startsWith('/results')) {
          return routeValidation.canAccessResults(context);
        }
        
        if (path.startsWith('/explore')) {
          return routeValidation.canAccessExplore(context);
        }
        
        return true; // Allow access to other routes
      },
      
      getRedirectPath: (requestedPath) => {
        const state = get();
        const context = {
          sessionId: state.sessionId,
          dilemmas: state.dilemmas,
          currentIndex: state.currentIndex,
          responses: state.responses,
          valuesMarkdown: state.valuesMarkdown,
          error: state.error,
          hasValidSession: state.hasValidSession,
          hasCompleteResponses: state.hasCompleteResponses,
          canGenerateValues: state.canGenerateValues
        };
        
        return routeValidation.getRedirectPath(context, requestedPath);
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
      
      // Reset everything
      reset: () => {
        const { sendEvent } = get();
        sendEvent({ type: 'RESET_SESSION' });
        
        set({
          sessionId: generateSessionId(),
          selectedOption: '',
          reasoning: '',
          perceivedDifficulty: 5,
          startTime: Date.now(),
          isLoading: false,
          isSubmitting: false,
          isGenerating: false
        });
      }
    }),
    {
      name: 'enhanced-dilemma-session',
      // Only persist responses and session data
      partialize: (state) => ({
        responses: state.responses,
        sessionId: state.sessionId,
        dilemmas: state.dilemmas,
        currentIndex: state.currentIndex,
        valuesMarkdown: state.valuesMarkdown
      })
    }
  )
);