// BULLETPROOF API CLIENT - Defense in depth error handling

import { API_ENDPOINTS, type Dilemma, type UserResponse } from './constants';

export interface DilemmasResponse {
  dilemmas: Dilemma[];
  success: boolean;
}

export interface ValuesResponse {
  valuesMarkdown: string;
  motifAnalysis: Record<string, number>;
  topMotifs: string[];
  success: boolean;
}

class ApiClient {
  private async safeFetch<T>(
    url: string, 
    options?: RequestInit,
    fallback?: T
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      
      if (fallback !== undefined) {
        return fallback;
      }
      
      throw error;
    }
  }

  async getDilemmas(): Promise<Dilemma[]> {
    try {
      const response = await this.safeFetch<DilemmasResponse>(API_ENDPOINTS.DILEMMAS);
      return response.dilemmas || [];
    } catch {
      // Fallback: Return empty array - UI will handle gracefully
      return [];
    }
  }

  async generateValues(responses: UserResponse[]): Promise<ValuesResponse | null> {
    if (responses.length === 0) {
      throw new Error('No responses provided');
    }

    try {
      // Send in format expected by production (backward compatible)
      const response = await this.safeFetch<ValuesResponse>(
        API_ENDPOINTS.GENERATE_VALUES,
        {
          method: 'POST',
          body: JSON.stringify({ 
            sessionId: `session_${Date.now()}`, // Generate session ID for production
            responses 
          })
        }
      );
      
      return response;
    } catch (error) {
      console.error('Failed to generate values:', error);
      return null;
    }
  }

  async saveResponses(sessionId: string, responses: UserResponse[]): Promise<boolean> {
    try {
      // Send all responses in a single request as expected by API
      await this.safeFetch(API_ENDPOINTS.RESPONSES, {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          responses
        })
      });
      return true;
    } catch {
      // Non-critical failure - don't block user flow
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();