// Robust localStorage management with quota handling and compression

interface StorageOptions {
  compress?: boolean;
  maxRetries?: number;
  fallbackToMemory?: boolean;
}

class StorageManager {
  private memoryFallback = new Map<string, string>();
  private quotaExceeded = false;

  // Estimate localStorage usage
  getStorageUsage(): { used: number; available: number; percentage: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Estimate available space (typical browser limit is 5-10MB)
    const estimated = 5 * 1024 * 1024; // 5MB conservative estimate
    return {
      used,
      available: estimated - used,
      percentage: (used / estimated) * 100
    };
  }

  // Compress data using simple text compression
  private compress(data: string): string {
    try {
      // Simple compression: remove unnecessary whitespace from JSON
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed);
    } catch {
      return data;
    }
  }

  // Decompress data
  private decompress(data: string): string {
    return data; // For now, our compression is just JSON.stringify optimization
  }

  // Clean old or less important data
  private cleanup(): void {
    const keysToClean = [
      'debug_logs',
      'temp_',
      'cache_',
      'old_responses'
    ];
    
    for (const key of keysToClean) {
      for (let storageKey in localStorage) {
        if (storageKey.includes(key)) {
          localStorage.removeItem(storageKey);
        }
      }
    }
  }

  // Safe set with quota management
  setItem(key: string, value: string, options: StorageOptions = {}): boolean {
    const { compress = true, maxRetries = 3, fallbackToMemory = true } = options;
    
    const dataToStore = compress ? this.compress(value) : value;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        localStorage.setItem(key, dataToStore);
        this.quotaExceeded = false;
        return true;
      } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn(`Storage quota exceeded on attempt ${attempt + 1}/${maxRetries}`);
          this.quotaExceeded = true;
          
          if (attempt < maxRetries - 1) {
            // Try cleanup and retry
            this.cleanup();
            continue;
          }
          
          if (fallbackToMemory) {
            console.warn(`Falling back to memory storage for key: ${key}`);
            this.memoryFallback.set(key, dataToStore);
            return true;
          }
        }
        
        console.error(`Failed to store ${key}:`, error);
        return false;
      }
    }
    
    return false;
  }

  // Safe get with fallback
  getItem(key: string, options: StorageOptions = {}): string | null {
    const { compress = true } = options;
    
    try {
      let data = localStorage.getItem(key);
      
      // Fallback to memory if not in localStorage
      if (data === null && this.memoryFallback.has(key)) {
        data = this.memoryFallback.get(key) || null;
      }
      
      return data && compress ? this.decompress(data) : data;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return this.memoryFallback.get(key) || null;
    }
  }

  // Remove item from both storage types
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
    
    this.memoryFallback.delete(key);
  }

  // Get storage health status
  getHealthStatus() {
    const usage = this.getStorageUsage();
    return {
      healthy: usage.percentage < 80,
      usage,
      quotaExceeded: this.quotaExceeded,
      memoryFallbackActive: this.memoryFallback.size > 0,
      recommendations: this.getRecommendations(usage)
    };
  }

  private getRecommendations(usage: any): string[] {
    const recommendations = [];
    
    if (usage.percentage > 90) {
      recommendations.push("Storage critically full - consider reducing response data");
    } else if (usage.percentage > 70) {
      recommendations.push("Storage getting full - cleanup recommended");
    }
    
    if (this.memoryFallback.size > 0) {
      recommendations.push("Some data stored in memory - will be lost on page reload");
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Helper functions for common operations
export const saveResponses = (responses: any[]): boolean => {
  return storage.setItem('responses', JSON.stringify(responses), { compress: true });
};

export const loadResponses = (): any[] => {
  const data = storage.getItem('responses', { compress: true });
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse responses:', error);
    return [];
  }
};

export const getStorageHealth = () => storage.getHealthStatus();