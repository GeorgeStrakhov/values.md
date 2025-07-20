// BULLETPROOF STORAGE - Single source of truth, SSR-safe

import { STORAGE_KEYS, UserResponse, type AppPhase, DILEMMA_COUNT } from './constants';

// SSR-safe localStorage wrapper
const isBrowser = typeof window !== 'undefined';

export interface SessionData {
  sessionId: string;
  responses: UserResponse[];
  completedAt?: string;
  phase: AppPhase;
}

class StorageManager {
  // NEVER call localStorage in useState or during SSR
  private safeGet(key: string): string | null {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeSet(key: string, value: string): boolean {
    if (!isBrowser) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  private safeRemove(key: string): boolean {
    if (!isBrowser) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  // Generate session ID (client-side only)
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current session data
  getSession(): SessionData | null {
    const stored = this.safeGet(STORAGE_KEYS.RESPONSES);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      return {
        sessionId: parsed.sessionId || this.generateSessionId(),
        responses: parsed.responses || [],
        completedAt: parsed.completedAt,
        phase: parsed.phase || 'landing'
      };
    } catch {
      return null;
    }
  }

  // Save session data  
  saveSession(data: SessionData): boolean {
    return this.safeSet(STORAGE_KEYS.RESPONSES, JSON.stringify(data));
  }

  // Add response to current session
  addResponse(response: UserResponse): boolean {
    const session = this.getSession() || {
      sessionId: this.generateSessionId(),
      responses: [],
      phase: 'exploring' as AppPhase
    };

    session.responses.push(response);
    
    // Mark as completed if we have enough responses
    if (session.responses.length >= DILEMMA_COUNT) {
      session.phase = 'completed';
      session.completedAt = new Date().toISOString();
    }

    return this.saveSession(session);
  }

  // Check if session is complete
  isComplete(): boolean {
    const session = this.getSession();
    return session?.phase === 'completed' || (session?.responses.length || 0) >= DILEMMA_COUNT;
  }

  // Clear all data
  clear(): boolean {
    return this.safeRemove(STORAGE_KEYS.RESPONSES);
  }

  // Get responses for API submission
  getResponsesForAPI(): UserResponse[] {
    const session = this.getSession();
    return session?.responses || [];
  }
}

// Export singleton instance
export const storage = new StorageManager();