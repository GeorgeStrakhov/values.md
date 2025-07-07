// Privacy-respecting telemetry for system health monitoring

interface TelemetryEvent {
  type: string;
  timestamp: number;
  sessionId: string;
  data: Record<string, any>;
}

interface SessionMetrics {
  sessionId: string;
  startTime: number;
  totalResponses: number;
  completedResponses: number;
  averageResponseTime: number;
  qualityScore: number;
  storageIssues: string[];
  performanceIssues: string[];
  userAgent: string;
  viewport: { width: number; height: number };
}

class TelemetryManager {
  private sessionId: string;
  private events: TelemetryEvent[] = [];
  private sessionMetrics: Partial<SessionMetrics> = {};
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initializeSession() {
    this.sessionMetrics = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      totalResponses: 0,
      completedResponses: 0,
      averageResponseTime: 0,
      qualityScore: 100,
      storageIssues: [],
      performanceIssues: [],
      userAgent: typeof navigator !== 'undefined' ? navigator?.userAgent || 'unknown' : 'server',
      viewport: {
        width: typeof window !== 'undefined' ? window?.innerWidth || 0 : 0,
        height: typeof window !== 'undefined' ? window?.innerHeight || 0 : 0
      }
    };

    this.trackEvent('session_start', {
      userAgent: this.sessionMetrics.userAgent,
      viewport: this.sessionMetrics.viewport,
      timestamp: this.sessionMetrics.startTime
    });
  }

  // Track events with automatic batching
  trackEvent(type: string, data: Record<string, any> = {}) {
    const event: TelemetryEvent = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: this.sanitizeData(data)
    };

    this.events.push(event);

    // Auto-flush if buffer gets large
    if (this.events.length >= 50) {
      this.flush();
    }
  }

  // Remove PII and sensitive data
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    
    // Remove potential PII
    const piiKeys = ['email', 'name', 'ip', 'address', 'phone'];
    piiKeys.forEach(key => {
      if (key in sanitized) {
        delete sanitized[key];
      }
    });

    // Truncate long text fields
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...';
      }
    });

    return sanitized;
  }

  // Track response submission
  trackResponse(response: any, validationResult: any) {
    this.sessionMetrics.totalResponses = (this.sessionMetrics.totalResponses || 0) + 1;
    
    if (validationResult.isValid) {
      this.sessionMetrics.completedResponses = (this.sessionMetrics.completedResponses || 0) + 1;
    }

    // Update average response time
    if (response.responseTime) {
      const currentAvg = this.sessionMetrics.averageResponseTime || 0;
      const count = this.sessionMetrics.completedResponses || 1;
      this.sessionMetrics.averageResponseTime = 
        (currentAvg * (count - 1) + response.responseTime) / count;
    }

    this.trackEvent('response_submitted', {
      valid: validationResult.isValid,
      responseTime: response.responseTime,
      difficulty: response.perceivedDifficulty,
      hasReasoning: !!(response.reasoning && response.reasoning.trim()),
      totalResponses: this.sessionMetrics.totalResponses,
      completedResponses: this.sessionMetrics.completedResponses
    });
  }

  // Track storage issues
  trackStorageIssue(issue: string, details: any = {}) {
    this.sessionMetrics.storageIssues = this.sessionMetrics.storageIssues || [];
    this.sessionMetrics.storageIssues.push(issue);

    this.trackEvent('storage_issue', {
      issue,
      details: this.sanitizeData(details),
      timestamp: Date.now()
    });
  }

  // Track performance issues
  trackPerformanceIssue(issue: string, details: any = {}) {
    this.sessionMetrics.performanceIssues = this.sessionMetrics.performanceIssues || [];
    this.sessionMetrics.performanceIssues.push(issue);

    this.trackEvent('performance_issue', {
      issue,
      details: this.sanitizeData(details),
      timestamp: Date.now()
    });
  }

  // Track API errors
  trackApiError(endpoint: string, error: any) {
    this.trackEvent('api_error', {
      endpoint,
      error: error.message || 'Unknown error',
      status: error.status || 0,
      timestamp: Date.now()
    });
  }

  // Update quality score based on validation
  updateQualityScore(score: number) {
    this.sessionMetrics.qualityScore = Math.min(100, Math.max(0, score));
    
    if (score < 50) {
      this.trackEvent('quality_warning', {
        score,
        timestamp: Date.now()
      });
    }
  }

  // Get current session metrics
  getSessionMetrics(): SessionMetrics {
    return {
      sessionId: this.sessionId,
      startTime: this.sessionMetrics.startTime || Date.now(),
      totalResponses: this.sessionMetrics.totalResponses || 0,
      completedResponses: this.sessionMetrics.completedResponses || 0,
      averageResponseTime: this.sessionMetrics.averageResponseTime || 0,
      qualityScore: this.sessionMetrics.qualityScore || 100,
      storageIssues: this.sessionMetrics.storageIssues || [],
      performanceIssues: this.sessionMetrics.performanceIssues || [],
      userAgent: this.sessionMetrics.userAgent || 'unknown',
      viewport: this.sessionMetrics.viewport || { width: 0, height: 0 }
    };
  }

  // Flush events to server (or local storage for now)
  async flush() {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // For now, store in localStorage (in production, send to analytics service)
      const existingLogs = JSON.parse(localStorage.getItem('telemetry_logs') || '[]');
      const updatedLogs = [...existingLogs, ...eventsToFlush];
      
      // Keep only last 1000 events to prevent storage bloat
      const recentLogs = updatedLogs.slice(-1000);
      localStorage.setItem('telemetry_logs', JSON.stringify(recentLogs));

      console.log(`Flushed ${eventsToFlush.length} telemetry events`);
    } catch (error) {
      console.warn('Failed to flush telemetry events:', error);
      // Put events back for retry
      this.events.unshift(...eventsToFlush);
    }
  }

  // Start periodic flushing
  private startPeriodicFlush() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  // Clean shutdown
  shutdown() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    this.trackEvent('session_end', {
      duration: Date.now() - (this.sessionMetrics.startTime || Date.now()),
      finalMetrics: this.getSessionMetrics()
    });
    
    this.flush();
  }

  // Get aggregated telemetry for health dashboard
  getHealthSummary() {
    const metrics = this.getSessionMetrics();
    const recentEvents = this.events.slice(-20);
    
    return {
      session: {
        id: metrics.sessionId,
        duration: Date.now() - metrics.startTime,
        responses: metrics.completedResponses,
        quality: metrics.qualityScore
      },
      issues: {
        storage: metrics.storageIssues.length,
        performance: metrics.performanceIssues.length,
        api: recentEvents.filter(e => e.type === 'api_error').length
      },
      performance: {
        avgResponseTime: metrics.averageResponseTime,
        viewport: metrics.viewport,
        userAgent: metrics.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
      }
    };
  }
}

// Export singleton instance
export const telemetry = new TelemetryManager();

// Convenience functions
export const trackEvent = (type: string, data?: Record<string, any>) => 
  telemetry.trackEvent(type, data);

export const trackResponse = (response: any, validation: any) => 
  telemetry.trackResponse(response, validation);

export const trackStorageIssue = (issue: string, details?: any) => 
  telemetry.trackStorageIssue(issue, details);

export const trackPerformanceIssue = (issue: string, details?: any) => 
  telemetry.trackPerformanceIssue(issue, details);

export const trackApiError = (endpoint: string, error: any) => 
  telemetry.trackApiError(endpoint, error);

export const getHealthSummary = () => telemetry.getHealthSummary();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    telemetry.shutdown();
  });
}