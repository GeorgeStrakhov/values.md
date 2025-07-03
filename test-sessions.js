#!/usr/bin/env node

/**
 * Comprehensive Session Testing Script
 * Simulates multiple users completing the full values.md flow
 * Tests for breakage, mismatches, and regressions
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const NUM_SESSIONS = 5;

class SessionTester {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.responses = [];
    this.currentDilemmaUuid = null;
    this.dilemmas = [];
    this.errors = [];
    this.timings = {};
  }

  log(message) {
    console.log(`[Session ${this.sessionId}] ${message}`);
  }

  error(message, error) {
    const errorMsg = `ERROR: ${message} - ${error?.message || error}`;
    this.log(errorMsg);
    this.errors.push(errorMsg);
  }

  async makeRequest(path, method = 'GET', data = null) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `SessionTester/${this.sessionId}`
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          const duration = Date.now() - startTime;
          this.timings[path] = (this.timings[path] || []).concat(duration);
          
          try {
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${body}`));
              return;
            }
            
            if (res.statusCode === 307 || res.statusCode === 302) {
              const location = res.headers.location;
              this.log(`Redirect ${res.statusCode} to: ${location}`);
              resolve({ redirect: location, status: res.statusCode });
              return;
            }
            
            const result = body ? JSON.parse(body) : {};
            result._status = res.statusCode;
            result._duration = duration;
            resolve(result);
          } catch (error) {
            reject(new Error(`Parse error: ${error.message} - Body: ${body.substring(0, 200)}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Request timeout')));
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async startSession() {
    this.log('🚀 Starting new session...');
    
    try {
      // Step 1: Get random dilemma (should redirect)
      const randomResponse = await this.makeRequest('/api/dilemmas/random');
      
      if (!randomResponse.redirect) {
        throw new Error('Expected redirect from /api/dilemmas/random');
      }
      
      // Extract UUID from redirect
      const uuidMatch = randomResponse.redirect.match(/\/explore\/([a-f0-9-]+)/);
      if (!uuidMatch) {
        throw new Error(`Invalid redirect URL: ${randomResponse.redirect}`);
      }
      
      this.currentDilemmaUuid = uuidMatch[1];
      this.log(`📋 Got starting dilemma UUID: ${this.currentDilemmaUuid}`);
      
      return true;
    } catch (error) {
      this.error('Failed to start session', error);
      return false;
    }
  }

  async loadDilemmas() {
    this.log('📚 Loading dilemma set...');
    
    try {
      const response = await this.makeRequest(`/api/dilemmas/${this.currentDilemmaUuid}`);
      
      if (!response.dilemmas || !Array.isArray(response.dilemmas)) {
        throw new Error('Invalid dilemmas response structure');
      }
      
      this.dilemmas = response.dilemmas;
      this.log(`✅ Loaded ${this.dilemmas.length} dilemmas`);
      
      // Validate dilemma structure
      for (let i = 0; i < this.dilemmas.length; i++) {
        const dilemma = this.dilemmas[i];
        if (!dilemma.dilemmaId || !dilemma.title || !dilemma.scenario) {
          throw new Error(`Invalid dilemma structure at index ${i}`);
        }
        if (!dilemma.choiceA || !dilemma.choiceB || !dilemma.choiceC || !dilemma.choiceD) {
          throw new Error(`Missing choices in dilemma ${i}: ${dilemma.title}`);
        }
      }
      
      return true;
    } catch (error) {
      this.error('Failed to load dilemmas', error);
      return false;
    }
  }

  generateRandomResponse(dilemma, index) {
    const choices = ['a', 'b', 'c', 'd'];
    const choice = choices[Math.floor(Math.random() * choices.length)];
    const difficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    const reasoningTemplates = [
      `This choice aligns with my values because it prioritizes ${choice === 'a' ? 'immediate action' : choice === 'b' ? 'careful consideration' : choice === 'c' ? 'stakeholder welfare' : 'long-term consequences'}.`,
      `I believe this is the most ethical option given the circumstances.`,
      `This decision best balances competing interests.`,
      `This approach minimizes harm while maximizing benefit.`,
      `This reflects my commitment to principled decision-making.`,
      '', // Sometimes no reasoning
    ];
    
    const reasoning = reasoningTemplates[Math.floor(Math.random() * reasoningTemplates.length)];
    const responseTime = Math.floor(Math.random() * 45000) + 5000; // 5-50 seconds
    
    return {
      dilemmaId: dilemma.dilemmaId,
      chosenOption: choice,
      reasoning: reasoning,
      responseTime: responseTime,
      perceivedDifficulty: difficulty
    };
  }

  async answerAllDilemmas() {
    this.log(`🎯 Answering ${this.dilemmas.length} dilemmas...`);
    
    for (let i = 0; i < this.dilemmas.length; i++) {
      const dilemma = this.dilemmas[i];
      const response = this.generateRandomResponse(dilemma, i);
      this.responses.push(response);
      
      this.log(`📝 Dilemma ${i + 1}/${this.dilemmas.length}: "${dilemma.title}" -> Choice ${response.chosenOption.toUpperCase()} (difficulty: ${response.perceivedDifficulty})`);
      
      // Simulate thinking time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.log(`✅ Generated ${this.responses.length} responses`);
    return true;
  }

  async submitResponses() {
    this.log('📤 Submitting responses to database...');
    
    try {
      const payload = {
        sessionId: `test-session-${this.sessionId}-${Date.now()}`,
        responses: this.responses
      };
      
      const response = await this.makeRequest('/api/responses', 'POST', payload);
      
      if (response._status !== 200) {
        throw new Error(`Unexpected status: ${response._status}`);
      }
      
      this.log(`✅ Submitted ${this.responses.length} responses successfully`);
      this.submittedSessionId = payload.sessionId;
      return true;
    } catch (error) {
      this.error('Failed to submit responses', error);
      return false;
    }
  }

  async generateValues() {
    this.log('🧠 Generating values.md file...');
    
    try {
      const payload = {
        sessionId: this.submittedSessionId
      };
      
      const response = await this.makeRequest('/api/generate-values', 'POST', payload);
      
      if (response._status !== 200) {
        throw new Error(`Unexpected status: ${response._status}`);
      }
      
      if (!response.valuesMarkdown) {
        throw new Error('No valuesMarkdown in response');
      }
      
      this.valuesMarkdown = response.valuesMarkdown;
      const wordCount = this.valuesMarkdown.split(/\s+/).length;
      this.log(`✅ Generated values.md (${wordCount} words, ${response._duration}ms)`);
      
      // Basic validation of values.md structure
      if (!this.valuesMarkdown.includes('# My Values')) {
        this.error('Values.md missing expected header', 'Structure validation failed');
      }
      
      if (wordCount < 100) {
        this.error('Values.md suspiciously short', `Only ${wordCount} words`);
      }
      
      return true;
    } catch (error) {
      this.error('Failed to generate values', error);
      return false;
    }
  }

  async runCompleteSession() {
    this.log('🎬 Starting complete session test...');
    const startTime = Date.now();
    
    const steps = [
      { name: 'Start Session', fn: () => this.startSession() },
      { name: 'Load Dilemmas', fn: () => this.loadDilemmas() },
      { name: 'Answer Dilemmas', fn: () => this.answerAllDilemmas() },
      { name: 'Submit Responses', fn: () => this.submitResponses() },
      { name: 'Generate Values', fn: () => this.generateValues() }
    ];
    
    for (const step of steps) {
      const stepStart = Date.now();
      this.log(`⏳ ${step.name}...`);
      
      const success = await step.fn();
      const stepDuration = Date.now() - stepStart;
      
      if (!success) {
        this.log(`❌ ${step.name} FAILED (${stepDuration}ms)`);
        return false;
      }
      
      this.log(`✅ ${step.name} completed (${stepDuration}ms)`);
    }
    
    const totalDuration = Date.now() - startTime;
    this.log(`🎉 Complete session PASSED (${totalDuration}ms total)`);
    return true;
  }

  getReport() {
    const avgTimings = {};
    for (const [path, times] of Object.entries(this.timings)) {
      avgTimings[path] = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }
    
    return {
      sessionId: this.sessionId,
      success: this.errors.length === 0,
      errors: this.errors,
      responsesGenerated: this.responses.length,
      dilemmasLoaded: this.dilemmas.length,
      valuesGenerated: !!this.valuesMarkdown,
      avgTimings: avgTimings
    };
  }
}

// Health check first
async function checkHealth() {
  console.log('🏥 Running health check...');
  
  const tester = new SessionTester('health');
  try {
    const response = await tester.makeRequest('/api/health');
    if (response._status === 200) {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log(`❌ Health check failed: ${response._status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
    return false;
  }
}

// Run multiple sessions
async function runAllSessions() {
  console.log(`🧪 Starting ${NUM_SESSIONS} session tests...\n`);
  
  const results = [];
  
  for (let i = 1; i <= NUM_SESSIONS; i++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SESSION ${i}/${NUM_SESSIONS}`);
    console.log(`${'='.repeat(60)}`);
    
    const tester = new SessionTester(i);
    const success = await tester.runCompleteSession();
    const report = tester.getReport();
    results.push(report);
    
    console.log(`\nSession ${i} Result: ${success ? '✅ PASS' : '❌ FAIL'}`);
    if (!success) {
      console.log('Errors:', report.errors);
    }
    
    // Brief pause between sessions
    if (i < NUM_SESSIONS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Final report
  console.log(`\n${'='.repeat(60)}`);
  console.log('FINAL REPORT');
  console.log(`${'='.repeat(60)}`);
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`📊 Sessions: ${results.length} total, ${successCount} passed, ${failCount} failed`);
  console.log(`📈 Success Rate: ${Math.round((successCount / results.length) * 100)}%`);
  
  if (failCount > 0) {
    console.log('\n❌ FAILURES:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  Session ${result.sessionId}: ${result.errors.join(', ')}`);
    });
  }
  
  // Performance summary
  const allTimings = {};
  results.forEach(result => {
    Object.entries(result.avgTimings || {}).forEach(([path, time]) => {
      allTimings[path] = (allTimings[path] || []).concat(time);
    });
  });
  
  console.log('\n⚡ PERFORMANCE:');
  Object.entries(allTimings).forEach(([path, times]) => {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const max = Math.max(...times);
    console.log(`  ${path}: ${avg}ms avg, ${max}ms max`);
  });
  
  return successCount === results.length;
}

// Main execution
async function main() {
  console.log('🧪 VALUES.MD SESSION TESTING SCRIPT');
  console.log('=====================================\n');
  
  // Check if server is running
  const healthOk = await checkHealth();
  if (!healthOk) {
    console.log('❌ Server not healthy. Please start the development server first.');
    process.exit(1);
  }
  
  const allPassed = await runAllSessions();
  
  console.log('\n🏁 TESTING COMPLETE');
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = { SessionTester };