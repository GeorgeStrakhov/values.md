#!/usr/bin/env node

/**
 * COMPREHENSIVE DEPLOYMENT TESTING PROTOCOL
 * Tests the EXACT user flow that fails with "No Dilemmas Available"
 * Must pass before deployment is approved
 */

// Using built-in fetch (Node.js 18+)

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
  duration?: number;
}

class DeploymentTester {
  private baseUrl: string;
  private results: TestResult[] = [];
  private failures = 0;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async runFullProtocol(): Promise<boolean> {
    console.log('🧪 COMPREHENSIVE DEPLOYMENT TESTING PROTOCOL\n');
    console.log(`Testing: ${this.baseUrl}\n`);

    // Test in the exact order a user would experience
    await this.testHomepageLoads();
    await this.testDiagnosticEndpoints();
    await this.testDatabaseConnectivity();
    await this.testRandomDilemmaEndpoint();
    await this.testExplorePageFlow();
    await this.testValuesGeneration();
    await this.testEmergencyFallbacks();
    await this.testCompleteUserJourney();

    this.printResults();
    return this.failures === 0;
  }

  private async testHomepageLoads() {
    await this.runTest('homepage-load', async () => {
      const response = await fetch(`${this.baseUrl}/`);
      if (!response.ok) {
        throw new Error(`Homepage returned ${response.status}`);
      }
      const html = await response.text();
      if (!html.includes('VALUES.md')) {
        throw new Error('Homepage content missing');
      }
      return { status: response.status, hasContent: true };
    });
  }

  private async testDiagnosticEndpoints() {
    await this.runTest('diagnostic-endpoint', async () => {
      const response = await fetch(`${this.baseUrl}/api/diagnostics/full-system`, {
        headers: { 'x-debug-auth': 'values-md-full-diagnostic' }
      });
      
      if (!response.ok) {
        throw new Error(`Diagnostics returned ${response.status}`);
      }
      
      const data = await response.json();
      return {
        hasDatabase: data.database?.connectionSuccess || false,
        dilemmaCount: data.database?.dilemmaCount || 0,
        environment: data.system?.environmentVariables?.hasDatabaseUrl || false
      };
    });
  }

  private async testDatabaseConnectivity() {
    await this.runTest('database-connectivity', async () => {
      // Test via diagnostic endpoint since we can't connect directly
      const response = await fetch(`${this.baseUrl}/api/diagnostics/full-system`, {
        headers: { 'x-debug-auth': 'values-md-full-diagnostic' }
      });
      
      const data = await response.json();
      
      if (!data.database?.connectionSuccess) {
        throw new Error(`Database connection failed: ${data.database?.error?.message || 'Unknown error'}`);
      }
      
      if (data.database.dilemmaCount === 0) {
        throw new Error('Database has 0 dilemmas - will cause "No Dilemmas Available" error');
      }
      
      return {
        connected: true,
        dilemmaCount: data.database.dilemmaCount,
        motifCount: data.database.motifCount,
        randomDilemmaWorks: data.database.randomDilemmaTest?.success
      };
    });
  }

  private async testRandomDilemmaEndpoint() {
    await this.runTest('random-dilemma-endpoint', async () => {
      const response = await fetch(`${this.baseUrl}/api/dilemmas/random`, {
        redirect: 'manual' // Don't follow redirects so we can check them
      });
      
      // This endpoint should redirect (302 or 307) to /explore/[uuid]
      if (response.status === 302 || response.status === 307) {
        const location = response.headers.get('location');
        if (location && location.includes('/explore/')) {
          return { redirected: true, location, status: response.status };
        } else {
          throw new Error(`Redirect location invalid: ${location}`);
        }
      } else if (response.status === 200) {
        // Some implementations might return JSON instead of redirecting
        const data = await response.json();
        if (data.error) {
          throw new Error(`API error: ${data.error}`);
        }
        return { redirected: false, data, status: 200 };
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    });
  }

  private async testExplorePageFlow() {
    await this.runTest('explore-page-flow', async () => {
      // First get a dilemma UUID from the random endpoint
      const randomResponse = await fetch(`${this.baseUrl}/api/dilemmas/random`, {
        redirect: 'manual'
      });
      
      let dilemmaUuid;
      if (randomResponse.status === 302 || randomResponse.status === 307) {
        const location = randomResponse.headers.get('location');
        const match = location?.match(/\/explore\/([^\/]+)/);
        dilemmaUuid = match?.[1];
      }
      
      if (!dilemmaUuid) {
        throw new Error('Could not extract dilemma UUID from random endpoint');
      }
      
      // Now test the dilemma API endpoint
      const dilemmaResponse = await fetch(`${this.baseUrl}/api/dilemmas/${dilemmaUuid}`);
      
      if (!dilemmaResponse.ok) {
        throw new Error(`Dilemma API returned ${dilemmaResponse.status}`);
      }
      
      const dilemmaData = await dilemmaResponse.json();
      
      if (!dilemmaData.dilemmas || dilemmaData.dilemmas.length === 0) {
        throw new Error('Dilemma API returned empty dilemmas array');
      }
      
      return {
        dilemmaUuid,
        dilemmaCount: dilemmaData.dilemmas.length,
        firstDilemmaTitle: dilemmaData.dilemmas[0]?.title
      };
    });
  }

  private async testValuesGeneration() {
    await this.runTest('values-generation', async () => {
      // Test combinatorial generation with minimal data (valid UUID format)
      const testResponses = [
        {
          dilemmaId: '12345678-1234-1234-1234-123456789012',
          chosenOption: 'a',
          reasoning: 'Test reasoning',
          perceivedDifficulty: 5
        }
      ];
      
      const response = await fetch(`${this.baseUrl}/api/generate-values-combinatorial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: testResponses })
      });
      
      if (!response.ok) {
        throw new Error(`Values generation returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.valuesMarkdown) {
        throw new Error('Values generation did not return valuesMarkdown');
      }
      
      return {
        valuesLength: data.valuesMarkdown.length,
        hasMarkdown: data.valuesMarkdown.includes('# VALUES.md')
      };
    });
  }

  private async testEmergencyFallbacks() {
    await this.runTest('emergency-fallbacks', async () => {
      const response = await fetch(`${this.baseUrl}/api/emergency/dilemmas`);
      
      if (!response.ok) {
        throw new Error(`Emergency endpoint returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.dilemma) {
        throw new Error('Emergency endpoint did not return a dilemma');
      }
      
      return {
        hasEmergencyDilemma: true,
        source: data.source,
        dilemmaTitle: data.dilemma.title
      };
    });
  }

  private async testCompleteUserJourney() {
    await this.runTest('complete-user-journey', async () => {
      // Simulate complete user flow
      const steps = [];
      
      // 1. Homepage
      const homepageResponse = await fetch(`${this.baseUrl}/`);
      steps.push({ step: 'homepage', success: homepageResponse.ok });
      
      // 2. Random dilemma (should redirect)
      const randomResponse = await fetch(`${this.baseUrl}/api/dilemmas/random`, {
        redirect: 'manual'
      });
      steps.push({ step: 'random-dilemma', success: randomResponse.status === 302 || randomResponse.status === 307 });
      
      // 3. Extract UUID and test explore page API
      const location = randomResponse.headers.get('location');
      const dilemmaUuid = location?.match(/\/explore\/([^\/]+)/)?.[1];
      
      if (dilemmaUuid) {
        const exploreResponse = await fetch(`${this.baseUrl}/api/dilemmas/${dilemmaUuid}`);
        steps.push({ step: 'explore-api', success: exploreResponse.ok });
      }
      
      // 4. Values generation
      const valuesResponse = await fetch(`${this.baseUrl}/api/generate-values-combinatorial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          responses: [{ dilemmaId: '12345678-1234-1234-1234-123456789012', chosenOption: 'a', perceivedDifficulty: 5 }] 
        })
      });
      steps.push({ step: 'values-generation', success: valuesResponse.ok });
      
      const allSuccessful = steps.every(s => s.success);
      
      if (!allSuccessful) {
        const failedSteps = steps.filter(s => !s.success).map(s => s.step);
        throw new Error(`User journey failed at: ${failedSteps.join(', ')}`);
      }
      
      return { steps, allSuccessful };
    });
  }

  private async runTest(testName: string, testFunction: () => Promise<any>) {
    const start = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - start;
      
      this.results.push({
        test: testName,
        status: 'PASS',
        message: 'Test passed successfully',
        details: result,
        duration
      });
      
      console.log(`✅ ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      this.failures++;
      
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: error instanceof Error ? error.message : String(error),
        duration
      });
      
      console.log(`❌ ${testName} (${duration}ms): ${error instanceof Error ? error.message : error}`);
    }
  }

  private printResults() {
    console.log('\n📊 DEPLOYMENT TESTING RESULTS\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const totalTime = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);
    
    console.log(`✅ PASSED: ${passed}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`⏱️  TOTAL TIME: ${totalTime}ms`);
    
    if (this.failures === 0) {
      console.log('\n🎉 DEPLOYMENT TESTING PASSED - Ready for production!');
    } else {
      console.log('\n🚨 DEPLOYMENT TESTING FAILED - DO NOT DEPLOY!');
      console.log('\nFailed tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  ❌ ${r.test}: ${r.message}`));
    }
  }
}

// Run testing if called directly
if (require.main === module) {
  const testUrl = process.argv[2] || 'http://localhost:3000';
  
  const tester = new DeploymentTester(testUrl);
  tester.runFullProtocol().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Deployment testing crashed:', error);
    process.exit(1);
  });
}

export { DeploymentTester };