/**
 * Finite State Machine for Values.md App Flow
 * 
 * Manages the complete user journey from landing to results with proper
 * state transitions, session validation, and error handling.
 */

export type AppState = 
  | 'idle'           // Initial state, no session
  | 'loading'        // Loading dilemmas or session data  
  | 'answering'      // User answering dilemmas
  | 'submitting'     // Submitting responses to server
  | 'generating'     // Generating values from responses
  | 'completed'      // Values generated, showing results
  | 'error'          // Error state with recovery options
  | 'expired';       // Session expired, needs restart

export type AppEvent = 
  | { type: 'START_SESSION' }
  | { type: 'DILEMMAS_LOADED'; dilemmas: any[]; startingIndex?: number }
  | { type: 'DILEMMAS_LOAD_FAILED'; error: string }
  | { type: 'ANSWER_SUBMITTED'; answer: any }
  | { type: 'SESSION_RESTORED'; responses: any[]; sessionId: string }
  | { type: 'SESSION_INVALID' }
  | { type: 'NAVIGATE_TO_DILEMMA'; index: number }
  | { type: 'SUBMIT_RESPONSES' }
  | { type: 'RESPONSES_SUBMITTED' }
  | { type: 'SUBMISSION_FAILED'; error: string }
  | { type: 'GENERATE_VALUES' }
  | { type: 'VALUES_GENERATED'; valuesMarkdown: string }
  | { type: 'GENERATION_FAILED'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET_SESSION' };

export interface AppContext {
  sessionId: string | null;
  dilemmas: any[];
  currentIndex: number;
  responses: any[];
  valuesMarkdown: string | null;
  error: string | null;
  // Validation flags
  hasValidSession: boolean;
  hasCompleteResponses: boolean;
  canGenerateValues: boolean;
}

export type AppStateConfig = {
  [K in AppState]: {
    on?: Partial<Record<AppEvent['type'], AppState>>;
    entry?: (context: AppContext, event?: AppEvent) => void;
    exit?: (context: AppContext, event?: AppEvent) => void;
    guard?: (context: AppContext, event: AppEvent) => boolean;
  };
};

/**
 * State Machine Configuration
 * Defines valid transitions and side effects for each state
 */
export const appStateMachine: AppStateConfig = {
  idle: {
    on: {
      START_SESSION: 'loading',
      SESSION_RESTORED: 'answering'
    },
    entry: (context) => {
      // Clear any previous session data
      context.sessionId = null;
      context.dilemmas = [];
      context.currentIndex = 0;
      context.responses = [];
      context.valuesMarkdown = null;
      context.error = null;
      context.hasValidSession = false;
      context.hasCompleteResponses = false;
      context.canGenerateValues = false;
    }
  },

  loading: {
    on: {
      DILEMMAS_LOADED: 'answering',
      DILEMMAS_LOAD_FAILED: 'error',
      SESSION_RESTORED: 'answering'
    },
    entry: (context) => {
      context.error = null;
    }
  },

  answering: {
    on: {
      ANSWER_SUBMITTED: 'answering', // Stay in same state, just update data
      NAVIGATE_TO_DILEMMA: 'answering',
      SUBMIT_RESPONSES: 'submitting',
      SESSION_INVALID: 'expired'
    }
  },

  submitting: {
    on: {
      RESPONSES_SUBMITTED: 'generating',
      SUBMISSION_FAILED: 'error'
    }
  },

  generating: {
    on: {
      VALUES_GENERATED: 'completed',
      GENERATION_FAILED: 'error'
    }
  },

  completed: {
    on: {
      RESET_SESSION: 'idle'
    }
  },

  error: {
    on: {
      RETRY: 'loading',
      RESET_SESSION: 'idle'
    },
    entry: (context, event) => {
      if (event?.type === 'DILEMMAS_LOAD_FAILED' || 
          event?.type === 'SUBMISSION_FAILED' || 
          event?.type === 'GENERATION_FAILED') {
        context.error = (event as any).error;
      }
    }
  },

  expired: {
    on: {
      RESET_SESSION: 'idle'
    },
    entry: (context) => {
      context.error = 'Your session has expired. Please start over.';
    }
  }
};

/**
 * State Machine Implementation
 * Handles state transitions and context updates
 */
export class AppStateMachine {
  private state: AppState = 'idle';
  private context: AppContext = {
    sessionId: null,
    dilemmas: [],
    currentIndex: 0,
    responses: [],
    valuesMarkdown: null,
    error: null,
    hasValidSession: false,
    hasCompleteResponses: false,
    canGenerateValues: false
  };
  
  private listeners: ((state: AppState, context: AppContext) => void)[] = [];

  constructor(initialContext?: Partial<AppContext>) {
    if (initialContext) {
      this.context = { ...this.context, ...initialContext };
    }
    this.validateContext();
  }

  /**
   * Send an event to the state machine
   */
  send(event: AppEvent): void {
    const currentStateConfig = appStateMachine[this.state];
    const transition = currentStateConfig.on?.[event.type];
    
    if (!transition) {
      console.warn(`No transition for event ${event.type} in state ${this.state}`);
      return;
    }

    // Check guard conditions
    if (currentStateConfig.guard && !currentStateConfig.guard(this.context, event)) {
      console.warn(`Guard failed for transition ${this.state} -> ${transition}`);
      return;
    }

    // Exit current state
    if (currentStateConfig.exit) {
      currentStateConfig.exit(this.context, event);
    }

    // Update context based on event
    this.updateContextFromEvent(event);

    // Change state
    const previousState = this.state;
    this.state = transition;

    // Enter new state
    const newStateConfig = appStateMachine[this.state];
    if (newStateConfig.entry) {
      newStateConfig.entry(this.context, event);
    }

    // Re-validate context after state change
    this.validateContext();

    // Notify listeners
    this.notifyListeners();

    console.log(`State transition: ${previousState} -> ${this.state}`, {
      event: event.type,
      context: this.context
    });
  }

  /**
   * Get current state
   */
  getCurrentState(): AppState {
    return this.state;
  }

  /**
   * Get current context
   */
  getContext(): AppContext {
    return { ...this.context };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AppState, context: AppContext) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Check if a specific transition is valid from current state
   */
  canTransition(eventType: AppEvent['type']): boolean {
    const currentStateConfig = appStateMachine[this.state];
    return !!currentStateConfig.on?.[eventType];
  }

  /**
   * Update context based on incoming event
   */
  private updateContextFromEvent(event: AppEvent): void {
    switch (event.type) {
      case 'DILEMMAS_LOADED':
        this.context.dilemmas = event.dilemmas;
        this.context.currentIndex = event.startingIndex ?? 0;
        // Set sessionId if not already set
        if (!this.context.sessionId) {
          this.context.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        this.context.hasValidSession = true;
        break;

      case 'SESSION_RESTORED':
        this.context.responses = event.responses;
        this.context.sessionId = event.sessionId;
        this.context.hasValidSession = true;
        this.context.hasCompleteResponses = event.responses.length >= 12;
        break;

      case 'ANSWER_SUBMITTED':
        // Update responses array
        const existingIndex = this.context.responses.findIndex(
          r => r.dilemmaId === event.answer.dilemmaId
        );
        if (existingIndex !== -1) {
          this.context.responses[existingIndex] = event.answer;
        } else {
          this.context.responses.push(event.answer);
        }
        this.context.hasCompleteResponses = this.context.responses.length >= 12;
        break;

      case 'NAVIGATE_TO_DILEMMA':
        this.context.currentIndex = event.index;
        break;

      case 'VALUES_GENERATED':
        this.context.valuesMarkdown = event.valuesMarkdown;
        break;

      case 'SESSION_INVALID':
        this.context.hasValidSession = false;
        break;
    }
  }

  /**
   * Validate context flags based on current data
   */
  private validateContext(): void {
    // Don't override hasValidSession if it's already set from events
    if (this.context.hasValidSession === false) {
      this.context.hasValidSession = 
        !!this.context.sessionId && this.context.dilemmas.length > 0;
    }
    
    this.context.hasCompleteResponses = 
      this.context.responses.length >= 12;
    
    this.context.canGenerateValues = 
      this.context.hasCompleteResponses || !!this.context.valuesMarkdown;
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state, this.getContext());
      } catch (error) {
        console.error('Error in state machine listener:', error);
      }
    });
  }
}

/**
 * Route validation helpers
 */
export const routeValidation = {
  /**
   * Check if user can access /explore routes
   */
  canAccessExplore(context: AppContext): boolean {
    return context.hasValidSession && context.dilemmas.length > 0;
  },

  /**
   * Check if user can access /results
   */
  canAccessResults(context: AppContext): boolean {
    return context.hasValidSession && context.hasCompleteResponses;
  },

  /**
   * Get redirect path based on current context
   */
  getRedirectPath(context: AppContext, requestedPath: string): string | null {
    // If trying to access /results without complete responses
    if (requestedPath.startsWith('/results') && !this.canAccessResults(context)) {
      if (context.hasValidSession && context.dilemmas.length > 0) {
        // Continue where they left off
        const currentDilemma = context.dilemmas[context.currentIndex];
        return currentDilemma ? `/explore/${currentDilemma.dilemmaId}` : '/';
      }
      return '/';
    }

    // If trying to access /explore without valid session
    if (requestedPath.startsWith('/explore') && !this.canAccessExplore(context)) {
      return '/';
    }

    return null;
  }
};