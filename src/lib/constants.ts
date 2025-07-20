// IMMUTABLE CONSTANTS - Never change these without updating all references

export const ROUTES = {
  LANDING: '/',
  EXPLORE: '/explore',
  RESULTS: '/results', 
  RESEARCH: '/research',
  ADMIN: '/admin'
} as const;

export const STORAGE_KEYS = {
  SESSION_ID: 'values_session_id',
  RESPONSES: 'values_responses', 
  COMPLETED_AT: 'values_completed_at'
} as const;

export const API_ENDPOINTS = {
  DILEMMAS: '/api/dilemmas',
  GENERATE_VALUES: '/api/generate-values',
  RESPONSES: '/api/responses'
} as const;

export const DILEMMA_COUNT = 12;

// State phases - immutable state machine
export type AppPhase = 'landing' | 'exploring' | 'completed';

export interface UserResponse {
  dilemmaId: string;
  chosenOption: string;
  reasoning: string;
  responseTime: number;
  perceivedDifficulty: number;
}

export interface Dilemma {
  dilemmaId: string;
  title: string;
  scenario: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  domain: string;
}