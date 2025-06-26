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

interface AutoAdvanceState {
  active: boolean;
  remaining: number;
  timerId?: NodeJS.Timeout;
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
  
  // Auto-advance state
  autoAdvanceState: AutoAdvanceState;
  
  // Actions
  setDilemmas: (dilemmas: Dilemma[], startingDilemmaId?: string) => void;
  setCurrentIndex: (index: number) => void;
  setSelectedOption: (option: string) => void;
  setReasoning: (reasoning: string) => void;
  setPerceivedDifficulty: (difficulty: number) => void;
  setStartTime: (time: number) => void;
  
  // Auto-advance actions
  startAutoAdvance: () => void;
  stopAutoAdvance: () => void;
  
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
      autoAdvanceState: { active: false, remaining: 0 },
      
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
      setSelectedOption: (option) => {
        const state = get();
        set({ selectedOption: option });
        
        if (option) {
          // SAFETY NET: Save response immediately when option is selected
          setTimeout(() => state.saveCurrentResponse(), 0);
          // Start auto-advance timer
          state.startAutoAdvance();
        } else {
          state.stopAutoAdvance();
        }
      },
      setReasoning: (reasoning) => set({ reasoning }),
      setPerceivedDifficulty: (difficulty) => set({ perceivedDifficulty: difficulty }),
      setStartTime: (time) => set({ startTime: time }),
      
      // Auto-advance actions
      startAutoAdvance: () => {
        const state = get();
        
        // Clear any existing timer
        if (state.autoAdvanceState.timerId) {
          clearInterval(state.autoAdvanceState.timerId);
        }
        
        set({ autoAdvanceState: { active: true, remaining: 3 } });
        
        const timerId = setInterval(() => {
          const currentState = get();
          if (!currentState.autoAdvanceState.active) {
            clearInterval(timerId);
            return;
          }

          const newRemaining = currentState.autoAdvanceState.remaining - 1;
          
          if (newRemaining <= 0) {
            clearInterval(timerId);
            set({ autoAdvanceState: { active: false, remaining: 0 } });
            
            // Auto-advance if still selected
            if (currentState.selectedOption) {
              // Trigger auto-advance by dispatching a custom event
              // The page component will handle the actual navigation
              window.dispatchEvent(new CustomEvent('auto-advance-next'));
            }
          } else {
            set({ autoAdvanceState: { active: true, remaining: newRemaining, timerId } });
          }
        }, 1000);
        
        set({ autoAdvanceState: { active: true, remaining: 3, timerId } });
      },

      stopAutoAdvance: () => {
        const state = get();
        if (state.autoAdvanceState.timerId) {
          clearInterval(state.autoAdvanceState.timerId);
        }
        set({ autoAdvanceState: { active: false, remaining: 0 } });
      },
      
      // Navigation
      goToNext: async () => {
        const state = get();
        console.log('🏪 goToNext called in store', { 
          currentIndex: state.currentIndex, 
          totalDilemmas: state.dilemmas.length,
          selectedOption: state.selectedOption 
        });
        
        // Stop any auto-advance first
        state.stopAutoAdvance();
        
        // Always save the current response first
        console.log('💾 Saving current response...');
        state.saveCurrentResponse();
        
        if (state.currentIndex < state.dilemmas.length - 1) {
          const nextIndex = state.currentIndex + 1;
          console.log(`📈 Advancing from index ${state.currentIndex} to ${nextIndex}`);
          
          set({
            currentIndex: nextIndex,
            selectedOption: '',
            reasoning: '',
            perceivedDifficulty: 5,
            startTime: Date.now()
          });
          
          // Scroll to top on navigation
          window.scrollTo({ top: 0, behavior: 'smooth' });
          console.log('✅ Navigation successful, returning true');
          return true; // Not last
        }
        
        // This was the final dilemma - submit all responses to database
        console.log('🔄 Final dilemma completed, submitting to database...');
        const success = await state.submitResponsesToDatabase();
        console.log('📤 Database submission result:', success);
        
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
        
        console.log('💾 saveCurrentResponse called', {
          dilemma: currentDilemma?.title,
          selectedOption: state.selectedOption,
          currentResponses: state.responses.length,
          sessionId: state.sessionId
        });
        
        if (currentDilemma && state.selectedOption) {
          const responseTime = Date.now() - state.startTime;
          const newResponse: Response = {
            dilemmaId: currentDilemma.dilemmaId,
            chosenOption: state.selectedOption,
            reasoning: state.reasoning,
            responseTime,
            perceivedDifficulty: state.perceivedDifficulty,
          };
          
          console.log('Creating new response:', newResponse);
          
          // Update or add response
          const responses = [...state.responses];
          const existingIndex = responses.findIndex(r => r.dilemmaId === currentDilemma.dilemmaId);
          
          if (existingIndex !== -1) {
            responses[existingIndex] = newResponse;
            console.log('Updated existing response at index', existingIndex);
          } else {
            responses.push(newResponse);
            console.log('Added new response, total responses:', responses.length);
          }
          
          set({ responses });
          console.log('✅ Responses saved to store:', responses.length);
          
          // Debug: Check what gets persisted
          console.log('🗄️ About to persist to localStorage:', {
            sessionId: state.sessionId,
            responsesCount: responses.length,
            lastResponse: responses[responses.length - 1]
          });
        } else {
          console.log('Not saving response - missing dilemma or selectedOption');
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
        console.log('📤 submitResponsesToDatabase called with:', {
          sessionId: state.sessionId,
          responsesCount: state.responses.length,
          responses: state.responses
        });
        
        if (state.responses.length === 0) {
          console.log('❌ No responses to submit');
          return false;
        }

        try {
          console.log('🌐 Sending POST request to /api/responses...');
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

          console.log('📨 API Response status:', response.status);
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Database submission successful:', result);
            return true;
          } else {
            const error = await response.text();
            console.log('❌ Database submission failed:', response.status, error);
            return false;
          }
        } catch (error) {
          console.error('💥 Failed to submit responses to database:', error);
          return false;
        }
      },
      
      // Getters
      getCurrentDilemma: () => {
        const state = get();
        return state.dilemmas[state.currentIndex] || null;
      },
      
      getCurrentDilemmaId: () => {
        const state = get();
        const dilemma = state.getCurrentDilemma();
        console.log('🆔 getCurrentDilemmaId called', { 
          currentIndex: state.currentIndex, 
          dilemma: dilemma ? { id: dilemma.dilemmaId, title: dilemma.title } : null 
        });
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
      // Only persist responses and session data, exclude timer state
      partialize: (state) => ({
        responses: state.responses,
        sessionId: state.sessionId,
        // Reset auto-advance state on hydration
        autoAdvanceState: { active: false, remaining: 0 }
      })
    }
  )
);