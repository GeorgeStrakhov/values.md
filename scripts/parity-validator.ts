#!/usr/bin/env node

/**
 * PRODUCTION-DEVELOPMENT PARITY VALIDATOR
 * Compares local development environment with production deployment
 * Identifies environment differences that cause "No Dilemmas Available"
 */

interface EnvironmentComparison {
  local: any;
  production: any;
  differences: string[];
  critical: boolean;
}

class ParityValidator {
  private productionUrl: string;
  private comparisons: Record<string, EnvironmentComparison> = {};

  constructor(productionUrl: string) {
    this.productionUrl = productionUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async validateParity(): Promise<boolean> {
    console.log('🔍 PRODUCTION-DEVELOPMENT PARITY VALIDATION\n');
    console.log(`Local: http://localhost:3000`);
    console.log(`Production: ${this.productionUrl}\n`);

    // Test environment variables and configuration
    await this.compareEnvironmentConfig();
    
    // Test database connectivity and content
    await this.compareDatabaseContent();
    
    // Test API endpoint responses  
    await this.compareApiResponses();
    
    // Test build and deployment artifacts
    await this.compareDeploymentArtifacts();

    return this.analyzeResults();
  }

  private async compareEnvironmentConfig() {
    console.log('📋 Comparing Environment Configuration...');
    
    try {
      // Get local environment info
      const localEnv = {
        hasDatabase: !!process.env.DATABASE_URL,
        hasOpenrouter: !!process.env.OPENROUTER_API_KEY,
        hasNextauth: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
        databaseProvider: this.getDatabaseProvider(process.env.DATABASE_URL)
      };

      // Get production environment info
      const prodResponse = await fetch(`${this.productionUrl}/api/diagnostics/full-system`, {
        headers: { 'x-debug-auth': 'values-md-full-diagnostic' }
      });
      
      if (!prodResponse.ok) {
        throw new Error(`Production diagnostics failed: ${prodResponse.status}`);
      }
      
      const prodData = await prodResponse.json();
      const prodEnv = {
        hasDatabase: prodData.system.environmentVariables.hasDatabaseUrl,
        hasOpenrouter: prodData.system.environmentVariables.hasOpenrouterKey,
        hasNextauth: prodData.system.environmentVariables.hasNextauthSecret,
        nodeEnv: prodData.system.systemInfo.nodeEnv,
        databaseProvider: this.getDatabaseProvider(prodData.system.environmentVariables.databaseUrlPrefix)
      };

      const differences = this.findDifferences(localEnv, prodEnv);
      const critical = differences.some(d => 
        d.includes('hasDatabase') || 
        d.includes('nodeEnv') || 
        d.includes('databaseProvider')
      );

      this.comparisons.environment = {
        local: localEnv,
        production: prodEnv,
        differences,
        critical
      };

      this.logComparison('Environment Config', localEnv, prodEnv, differences, critical);
    } catch (error) {
      console.log(`❌ Failed to compare environment config: ${error}`);
      this.comparisons.environment = {
        local: {},
        production: {},
        differences: [`Failed to fetch production environment: ${error}`],
        critical: true
      };
    }
  }

  private async compareDatabaseContent() {
    console.log('🗄️  Comparing Database Content...');
    
    try {
      // Get local database content
      const { db } = await import('../src/lib/db');
      const { dilemmas, motifs } = await import('../src/lib/schema');
      const { sql } = await import('drizzle-orm');
      
      const localDilemmaCount = await db.select({ count: sql<number>`COUNT(*)` }).from(dilemmas);
      const localMotifCount = await db.select({ count: sql<number>`COUNT(*)` }).from(motifs);
      const localRandomDilemma = await db.select().from(dilemmas).orderBy(sql`RANDOM()`).limit(1);
      
      const localDb = {
        dilemmaCount: localDilemmaCount[0]?.count || 0,
        motifCount: localMotifCount[0]?.count || 0,
        hasRandomDilemma: localRandomDilemma.length > 0,
        randomDilemmaTitle: localRandomDilemma[0]?.title || null
      };

      // Get production database content
      const prodResponse = await fetch(`${this.productionUrl}/api/diagnostics/full-system`, {
        headers: { 'x-debug-auth': 'values-md-full-diagnostic' }
      });
      
      const prodData = await prodResponse.json();
      const prodDb = {
        dilemmaCount: prodData.database?.dilemmaCount || 0,
        motifCount: prodData.database?.motifCount || 0,
        hasRandomDilemma: prodData.database?.randomDilemmaTest?.success || false,
        randomDilemmaTitle: prodData.database?.randomDilemmaTest?.dilemmaTitle || null
      };

      const differences = this.findDifferences(localDb, prodDb);
      const critical = differences.some(d => 
        d.includes('dilemmaCount') || 
        d.includes('hasRandomDilemma')
      );

      this.comparisons.database = {
        local: localDb,
        production: prodDb,
        differences,
        critical
      };

      this.logComparison('Database Content', localDb, prodDb, differences, critical);
    } catch (error) {
      console.log(`❌ Failed to compare database content: ${error}`);
      this.comparisons.database = {
        local: {},
        production: {},
        differences: [`Failed to compare database: ${error}`],
        critical: true
      };
    }
  }

  private async compareApiResponses() {
    console.log('🌐 Comparing API Responses...');
    
    const endpoints = [
      '/api/health',
      '/api/dilemmas/random',
      '/api/examples'
    ];

    for (const endpoint of endpoints) {
      try {
        // Test local endpoint (direct import for more reliable testing)
        let localResult;
        if (endpoint === '/api/dilemmas/random') {
          const { GET } = await import('../src/app/api/dilemmas/random/route');
          const mockRequest = new Request(`http://localhost:3000${endpoint}`);
          const response = await GET(mockRequest);
          localResult = {
            status: response.status,
            ok: response.ok,
            redirected: response.status === 302
          };
        } else {
          // For other endpoints, we'll assume they work locally
          localResult = { status: 200, ok: true, redirected: false };
        }

        // Test production endpoint
        const prodResponse = await fetch(`${this.productionUrl}${endpoint}`, {
          redirect: 'manual' // Don't follow redirects so we can see the actual response
        });
        
        const prodResult = {
          status: prodResponse.status,
          ok: prodResponse.ok,
          redirected: prodResponse.status === 302
        };

        const differences = this.findDifferences(localResult, prodResult);
        const critical = endpoint === '/api/dilemmas/random' && differences.length > 0;

        this.comparisons[`api-${endpoint}`] = {
          local: localResult,
          production: prodResult,
          differences,
          critical
        };

        this.logComparison(`API ${endpoint}`, localResult, prodResult, differences, critical);
      } catch (error) {
        console.log(`❌ Failed to compare ${endpoint}: ${error}`);
        this.comparisons[`api-${endpoint}`] = {
          local: {},
          production: {},
          differences: [`Failed to test endpoint: ${error}`],
          critical: endpoint === '/api/dilemmas/random'
        };
      }
    }
  }

  private async compareDeploymentArtifacts() {
    console.log('📦 Comparing Deployment Artifacts...');
    
    // Check local build artifacts
    const localBuild = {
      nextDirExists: require('fs').existsSync('.next'),
      packageJsonExists: require('fs').existsSync('package.json'),
      nodeModulesExists: require('fs').existsSync('node_modules')
    };

    // For production, we can only infer from API responses
    const prodBuild = {
      nextDirExists: true, // Assume true if site is running
      packageJsonExists: true, // Assume true if site is running  
      nodeModulesExists: true // Assume true if site is running
    };

    const differences = this.findDifferences(localBuild, prodBuild);
    
    this.comparisons.build = {
      local: localBuild,
      production: prodBuild,
      differences,
      critical: false
    };

    this.logComparison('Build Artifacts', localBuild, prodBuild, differences, false);
  }

  private findDifferences(local: any, production: any): string[] {
    const differences = [];
    
    // Compare all properties
    const allKeys = new Set([...Object.keys(local), ...Object.keys(production)]);
    
    for (const key of allKeys) {
      if (local[key] !== production[key]) {
        differences.push(`${key}: local=${local[key]}, production=${production[key]}`);
      }
    }
    
    return differences;
  }

  private getDatabaseProvider(url?: string): string {
    if (!url) return 'none';
    if (url.includes('neon.tech')) return 'neon';
    if (url.includes('supabase')) return 'supabase';
    if (url.includes('planetscale')) return 'planetscale';
    return 'unknown';
  }

  private logComparison(category: string, local: any, production: any, differences: string[], critical: boolean) {
    const icon = differences.length === 0 ? '✅' : critical ? '❌' : '⚠️';
    console.log(`  ${icon} ${category}`);
    
    if (differences.length > 0) {
      differences.forEach(diff => {
        const diffIcon = critical ? '❌' : '⚠️';
        console.log(`    ${diffIcon} ${diff}`);
      });
    }
  }

  private analyzeResults(): boolean {
    console.log('\n📊 PARITY VALIDATION RESULTS\n');
    
    const criticalIssues = Object.values(this.comparisons).filter(c => c.critical);
    const warnings = Object.values(this.comparisons).filter(c => !c.critical && c.differences.length > 0);
    
    console.log(`❌ CRITICAL ISSUES: ${criticalIssues.length}`);
    console.log(`⚠️  WARNINGS: ${warnings.length}`);
    
    if (criticalIssues.length === 0) {
      console.log('\n✅ PRODUCTION-DEVELOPMENT PARITY VALIDATED');
      console.log('No critical differences found that would cause deployment issues.');
      return true;
    } else {
      console.log('\n🚨 CRITICAL PARITY ISSUES FOUND');
      console.log('These differences will likely cause production failures:\n');
      
      criticalIssues.forEach((issue, index) => {
        const category = Object.keys(this.comparisons)[Object.values(this.comparisons).indexOf(issue)];
        console.log(`${index + 1}. ${category.toUpperCase()}`);
        issue.differences.forEach(diff => console.log(`   ❌ ${diff}`));
        console.log('');
      });
      
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const productionUrl = process.argv[2] || 'https://values-md.vercel.app';
  
  const validator = new ParityValidator(productionUrl);
  validator.validateParity().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Parity validation crashed:', error);
    process.exit(1);
  });
}

export { ParityValidator };