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
      
      // Navigation
      goToNext: async () => {
        const state = get();
        
        // Always save the current response first
        state.saveCurrentResponse();
        
        if (state.currentIndex < state.dilemmas.length - 1) {
          const nextIndex = state.currentIndex + 1;
          set({
            currentIndex: nextIndex,
            selectedOption: '',
            reasoning: '',
            perceivedDifficulty: 5,
            startTime: Date.now()
          });
          
          // Scroll to top on navigation
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return true; // Not last
        }
        
        // This was the final dilemma - submit all responses to database
        const success = await state.submitResponsesToDatabase();
        
        return false; // Was last
      },
      
      goToPrevious: () => {
        const state = get();
        if (state.currentIndex > 0) {
          const prevIndex = state.currentIndex - 1;
          set({ currentIndex: prevIndex });
          
          // Restore previous response
          state.restoreResponseForIndex(prevIndex);
          
          // Scroll to top on navigation
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
          
          // Update or add response
          const responses = [...state.responses];
          const existingIndex = responses.findIndex(r => r.dilemmaId === currentDilemma.dilemmaId);
          
          if (existingIndex !== -1) {
            responses[existingIndex] = newResponse;
          } else {
            responses.push(newResponse);
          }
          
          set({ responses });
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
      
      // Reset
      reset: () => set({
        dilemmas: [],
        currentIndex: 0,
        responses: [],
        sessionId: generateSessionId(),
        selectedOption: '',
        reasoning: '',
        perceivedDifficulty: 5,
        startTime: Date.now()
      })
    }),
    {
      name: 'dilemma-session',
      // Only persist responses and session data
      partialize: (state) => ({
        responses: state.responses,
        sessionId: state.sessionId
      })
    }
  )
);