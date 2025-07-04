#!/usr/bin/env node

/**
 * Session Flow Tracer
 * Simulates complete user sessions with detailed execution tracing
 * to catch regressions and mismatches in the dilemma flow
 */

const { execSync } = require('child_process');

function fetch(url, options = {}) {
  const { method = 'GET', headers = {}, body } = options;
  
  let curlCmd = `curl -s -w "\\n%{http_code}" "${url}"`;
  
  if (method !== 'GET') {
    curlCmd += ` -X ${method}`;
  }
  
  Object.entries(headers).forEach(([key, value]) => {
    curlCmd += ` -H "${key}: ${value}"`;
  });
  
  if (body) {
    curlCmd += ` -d '${body}'`;
  }
  
  try {
    const output = execSync(curlCmd, { encoding: 'utf8' });
    const lines = output.trim().split('\n');
    const statusCode = parseInt(lines.pop());
    const responseText = lines.join('\n');
    
    return {
      ok: statusCode >= 200 && statusCode < 300,
      status: statusCode,
      json: () => Promise.resolve(JSON.parse(responseText))
    };
  } catch (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }
}

class SessionTracer {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.sessionId = `trace-session-${Date.now()}`;
    this.responses = [];
    this.currentUuid = null;
    this.dilemmas = [];
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  async trace(description) {
    console.log(`\n🔍 TRACE: ${description}`);
    console.log('=' + '='.repeat(description.length + 8));
  }

  async startSession() {
    await this.trace('Starting new session');
    this.log(`Session ID: ${this.sessionId}`);
    
    // Step 1: Get random dilemma set
    this.log('1. Requesting random dilemma set...');
    const randomResponse = await fetch(`${this.baseUrl}/api/dilemmas/random`);
    const randomData = await randomResponse.json();
    
    this.log('Random dilemma response:', {
      status: randomResponse.status,
      redirectUrl: randomData.redirectUrl
    });
    
    if (randomData.redirectUrl) {
      this.currentUuid = randomData.redirectUrl.split('/').pop();
      this.log(`Extracted UUID: ${this.currentUuid}`);
    } else {
      throw new Error('No redirect URL received');
    }
    
    // Step 2: Load dilemma set details
    this.log('2. Loading dilemma set details...');
    const dilemmaResponse = await fetch(`${this.baseUrl}/api/dilemmas/${this.currentUuid}`);
    const dilemmaData = await dilemmaResponse.json();
    
    this.dilemmas = dilemmaData.dilemmas;
    this.log('Dilemma set loaded:', {
      status: dilemmaResponse.status,
      count: this.dilemmas.length,
      firstTitle: this.dilemmas[0]?.title,
      lastTitle: this.dilemmas[this.dilemmas.length - 1]?.title
    });
    
    return true;
  }

  async simulateUserResponses() {
    await this.trace('Simulating user responses');
    
    const choices = ['a', 'b', 'c', 'd'];
    const reasoningTemplates = [
      'This choice aligns with my values because it prioritizes long-term consequences.',
      'I believe this is the most ethical option given the circumstances.',
      'This decision best balances competing interests.',
      'This approach minimizes harm while maximizing benefit.',
      'This reflects my commitment to principled decision-making.',
      'This choice aligns with my values because it prioritizes immediate action.'
    ];
    
    for (let i = 0; i < this.dilemmas.length; i++) {
      const dilemma = this.dilemmas[i];
      const choice = choices[Math.floor(Math.random() * choices.length)];
      const reasoning = reasoningTemplates[Math.floor(Math.random() * reasoningTemplates.length)];
      const difficulty = Math.floor(Math.random() * 10) + 1;
      const responseTime = Math.floor(Math.random() * 30000) + 5000; // 5-35 seconds
      
      const response = {
        dilemmaId: dilemma.dilemmaId,
        chosenOption: choice,
        reasoning: Math.random() > 0.3 ? reasoning : '', // 70% chance of reasoning
        responseTime,
        perceivedDifficulty: difficulty
      };
      
      this.responses.push(response);
      
      this.log(`Response ${i + 1}/${this.dilemmas.length}:`, {
        dilemmaTitle: dilemma.title,
        choice,
        difficulty,
        hasReasoning: !!reasoning,
        responseTime: `${Math.round(responseTime / 1000)}s`
      });
      
      // Simulate localStorage state that would occur
      this.log(`  localStorage state: ${this.responses.length} responses stored`);
      
      // Check completion logic
      if (this.responses.length >= this.dilemmas.length) {
        this.log(`  🚨 COMPLETION CHECK: ${this.responses.length} >= ${this.dilemmas.length} - should redirect to results`);
      }
    }
    
    return this.responses;
  }

  async submitResponses() {
    await this.trace('Submitting responses to API');
    
    const requestBody = {
      sessionId: this.sessionId,
      responses: this.responses
    };
    
    this.log('Submitting to /api/responses:', {
      sessionId: this.sessionId,
      responseCount: this.responses.length,
      firstResponse: this.responses[0]?.dilemmaId
    });
    
    const response = await fetch(`${this.baseUrl}/api/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    this.log('Response storage result:', {
      status: response.status,
      success: result.success,
      stored: result.stored
    });
    
    return result;
  }

  async generateValues() {
    await this.trace('Generating values.md document');
    
    const requestBody = {
      sessionId: this.sessionId
    };
    
    this.log('Requesting values generation...');
    
    const response = await fetch(`${this.baseUrl}/api/generate-values`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    this.log('Values generation result:', {
      status: response.status,
      success: result.success,
      wordCount: result.valuesMarkdown?.split(/\s+/).length || 0,
      primaryMotif: result.topMotifs?.[0],
      cached: result.cached
    });
    
    return result;
  }

  async traceFlowBoundaries() {
    await this.trace('Analyzing flow boundaries and potential regression points');
    
    // Check localStorage simulation
    this.log('1. localStorage state simulation:');
    this.log(`   - Responses stored: ${this.responses.length}`);
    this.log(`   - Dilemmas total: ${this.dilemmas.length}`);
    this.log(`   - Completion check: ${this.responses.length} >= ${this.dilemmas.length} = ${this.responses.length >= this.dilemmas.length}`);
    
    // Check index calculation
    this.log('2. Index calculation logic:');
    this.log(`   - savedResponses.length: ${this.responses.length}`);
    this.log(`   - currentIndex should be: ${this.responses.length}`);
    this.log(`   - Next dilemma index: ${this.responses.length} (if < ${this.dilemmas.length})`);
    
    // Check completion boundary
    this.log('3. Completion boundary analysis:');
    if (this.responses.length >= this.dilemmas.length) {
      this.log(`   ✅ Should redirect to /results (${this.responses.length} >= ${this.dilemmas.length})`);
    } else {
      this.log(`   🔄 Should continue to dilemma ${this.responses.length + 1} (${this.responses.length} < ${this.dilemmas.length})`);
    }
    
    // Check for off-by-one errors
    this.log('4. Off-by-one error checks:');
    this.log(`   - Array bounds: dilemmas[0] to dilemmas[${this.dilemmas.length - 1}]`);
    this.log(`   - Response indices: 0 to ${this.responses.length - 1}`);
    this.log(`   - Next expected index: ${this.responses.length}`);
    
    if (this.responses.length < this.dilemmas.length) {
      this.log(`   - Next dilemma exists: dilemmas[${this.responses.length}] = "${this.dilemmas[this.responses.length]?.title}"`);
    } else {
      this.log(`   - No more dilemmas: index ${this.responses.length} >= array length ${this.dilemmas.length}`);
    }
  }

  async runCompleteSession() {
    try {
      await this.startSession();
      await this.simulateUserResponses();
      await this.traceFlowBoundaries();
      await this.submitResponses();
      await this.generateValues();
      
      return {
        success: true,
        sessionId: this.sessionId,
        responsesCount: this.responses.length,
        dilemmasCount: this.dilemmas.length,
        completed: this.responses.length >= this.dilemmas.length
      };
      
    } catch (error) {
      this.log('❌ Session failed:', { error: error.message });
      return {
        success: false,
        error: error.message,
        sessionId: this.sessionId
      };
    }
  }
}

async function runMultipleTraces(count = 3) {
  console.log(`🧪 STARTING ${count} SESSION TRACES`);
  console.log('=' + '='.repeat(30));
  
  const results = [];
  
  for (let i = 1; i <= count; i++) {
    console.log(`\n🎯 SESSION ${i}/${count}`);
    console.log('-'.repeat(50));
    
    const tracer = new SessionTracer();
    const result = await tracer.runCompleteSession();
    results.push(result);
    
    console.log(`\n📊 SESSION ${i} SUMMARY:`, {
      success: result.success,
      responses: result.responsesCount,
      dilemmas: result.dilemmasCount,
      completed: result.completed
    });
    
    if (!result.success) {
      console.log(`❌ Session ${i} failed:`, result.error);
      break;
    }
    
    // Brief pause between sessions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final summary
  console.log(`\n📈 FINAL SUMMARY`);
  console.log('=' + '='.repeat(30));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Sessions run: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${Math.round((successful / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n❌ FAILURES:');
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`${index + 1}. ${result.error}`);
    });
  }
  
  // Check for the "No More Dilemmas" regression specifically
  const completedSessions = results.filter(r => r.success && r.completed);
  console.log(`\n🔍 REGRESSION CHECK:`);
  console.log(`Completed sessions: ${completedSessions.length}/${successful}`);
  console.log(`All sessions should have exactly 12 responses and 12 dilemmas`);
  
  completedSessions.forEach((session, index) => {
    const isValid = session.responsesCount === session.dilemmasCount && session.dilemmasCount === 12;
    console.log(`Session ${index + 1}: ${session.responsesCount}/${session.dilemmasCount} responses - ${isValid ? '✅' : '❌'}`);
  });
  
  return results;
}

// Run the traces
if (require.main === module) {
  runMultipleTraces(3).then(() => {
    console.log('\n🏁 Session tracing complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Tracing failed:', error);
    process.exit(1);
  });
}

module.exports = { SessionTracer, runMultipleTraces };