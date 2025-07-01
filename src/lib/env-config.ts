/**
 * Environment Configuration
 * 
 * Provides runtime environment validation and fallbacks
 * for CI/CD compatibility and development environments.
 */

export interface EnvConfig {
  database: {
    url: string;
    isConfigured: boolean;
  };
  openrouter: {
    apiKey: string;
    isConfigured: boolean;
  };
  auth: {
    secret: string;
    url: string;
    isConfigured: boolean;
  };
  app: {
    siteUrl: string;
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
    isCI: boolean;
  };
  vercel: {
    env: string;
    url: string;
    gitSha: string;
  };
}

/**
 * Check if running in CI environment
 */
function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.VERCEL ||
    process.env.NODE_ENV === 'test'
  );
}

/**
 * Generate fallback values for CI environments
 */
function generateCIFallbacks() {
  const timestamp = Date.now().toString(36);
  return {
    DATABASE_URL: `postgresql://test:test@localhost:5432/test_${timestamp}`,
    OPENROUTER_API_KEY: `sk-test-${timestamp}`,
    NEXTAUTH_SECRET: `test-secret-${timestamp}-${Math.random().toString(36)}`,
    NEXTAUTH_URL: 'http://localhost:3000',
    SITE_URL: 'http://localhost:3000'
  };
}

/**
 * Get environment configuration with fallbacks
 */
export function getEnvConfig(): EnvConfig {
  const ci = isCI();
  const fallbacks = ci ? generateCIFallbacks() : {};
  
  // Environment variables with fallbacks
  const databaseUrl = process.env.DATABASE_URL || (fallbacks as any).DATABASE_URL || '';
  const openrouterKey = process.env.OPENROUTER_API_KEY || (fallbacks as any).OPENROUTER_API_KEY || '';
  const nextAuthSecret = process.env.NEXTAUTH_SECRET || (fallbacks as any).NEXTAUTH_SECRET || '';
  const nextAuthUrl = process.env.NEXTAUTH_URL || (fallbacks as any).NEXTAUTH_URL || 'http://localhost:3000';
  const siteUrl = process.env.SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
                  (fallbacks as any).SITE_URL || 
                  'http://localhost:3000';
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    database: {
      url: databaseUrl,
      isConfigured: !!databaseUrl && !databaseUrl.includes('test@localhost')
    },
    openrouter: {
      apiKey: openrouterKey,
      isConfigured: !!openrouterKey && !openrouterKey.startsWith('sk-test-')
    },
    auth: {
      secret: nextAuthSecret,
      url: nextAuthUrl,
      isConfigured: !!nextAuthSecret && !nextAuthSecret.startsWith('test-secret-')
    },
    app: {
      siteUrl,
      nodeEnv,
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development',
      isCI: ci
    },
    vercel: {
      env: process.env.VERCEL_ENV || 'development',
      url: process.env.VERCEL_URL || '',
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA || ''
    }
  };
}

/**
 * Validate environment configuration
 */
export function validateEnvConfig(config?: EnvConfig): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const env = config || getEnvConfig();
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Critical checks for production
  if (env.app.isProduction) {
    if (!env.database.isConfigured) {
      errors.push('DATABASE_URL is not properly configured for production');
    }
    if (!env.openrouter.isConfigured) {
      errors.push('OPENROUTER_API_KEY is not properly configured for production');
    }
    if (!env.auth.isConfigured) {
      errors.push('NEXTAUTH_SECRET is not properly configured for production');
    }
  }
  
  // Warnings for development/CI
  if (env.app.isDevelopment || env.app.isCI) {
    if (!env.database.isConfigured) {
      warnings.push('Using fallback database configuration');
    }
    if (!env.openrouter.isConfigured) {
      warnings.push('Using fallback OpenRouter API key - LLM features will not work');
    }
    if (!env.auth.isConfigured) {
      warnings.push('Using fallback auth secret - sessions may not persist');
    }
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Log environment status (for debugging)
 */
export function logEnvStatus(): void {
  const config = getEnvConfig();
  const validation = validateEnvConfig(config);
  
  console.log('🔧 Environment Configuration:');
  console.log(`  Node Environment: ${config.app.nodeEnv}`);
  console.log(`  Is CI: ${config.app.isCI}`);
  console.log(`  Database: ${config.database.isConfigured ? '✅' : '⚠️'} configured`);
  console.log(`  OpenRouter: ${config.openrouter.isConfigured ? '✅' : '⚠️'} configured`);
  console.log(`  Auth: ${config.auth.isConfigured ? '✅' : '⚠️'} configured`);
  
  if (validation.warnings.length > 0) {
    console.log('⚠️ Warnings:');
    validation.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (validation.errors.length > 0) {
    console.log('❌ Errors:');
    validation.errors.forEach(error => console.log(`  - ${error}`));
  }
}

// Export singleton instance
export const envConfig = getEnvConfig();