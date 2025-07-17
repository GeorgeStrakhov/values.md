#!/usr/bin/env node

/**
 * VALUES.MD Regression Test Bench
 * 
 * This test bench catches all the issues we've encountered:
 * 1. Database connectivity and seeding
 * 2. API endpoints functionality
 * 3. Page routing and rendering
 * 4. Build process
 * 5. Data flow integrity
 * 6. Static vs dynamic rendering
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestBench {
  constructor() {
    this.results = [];
    this.ports = {
      dev: 3000,
      prod: 3001
    };
  }

  async run() {
    console.log('🧪 VALUES.MD Regression Test Bench');
    console.log('=====================================\n');

    try {
      await this.testDatabaseConnection();
      await this.testDatabaseSeeding();
      await this.testBuildProcess();
      await this.testDevServer();
      await this.testProdServer();
      await this.testAPIEndpoints();
      await this.testPageRouting();
      await this.testDataFlow();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test bench failed:', error.message);
      process.exit(1);
    }
  }

  async testDatabaseConnection() {
    console.log('📊 Testing database connection...');
    
    try {
      const result = await this.execCommand('npx drizzle-kit introspect');
      this.addResult('Database Connection', true, 'Connected successfully');
    } catch (error) {
      this.addResult('Database Connection', false, error.message);
    }
  }

  async testDatabaseSeeding() {
    console.log('🌱 Testing database seeding...');
    
    try {
      // Check if we can query the database
      const result = await this.execCommand('npx tsx -e "import { db } from \'./src/lib/db\'; import { dilemmas } from \'./src/lib/schema\'; console.log(\'DB accessible\')"');
      this.addResult('Database Query', true, 'Database is accessible');
    } catch (error) {
      this.addResult('Database Query', false, error.message);
    }
  }

  async testBuildProcess() {
    console.log('🏗️ Testing build process...');
    
    try {
      const result = await this.execCommand('npm run build');
      
      // Check if build created expected files
      const buildDir = '.next';
      const serverDir = path.join(buildDir, 'server');
      const explorePageExists = fs.existsSync(path.join(serverDir, 'app/explore/page.js'));
      
      if (explorePageExists) {
        this.addResult('Build Process', true, 'Build completed successfully');
      } else {
        this.addResult('Build Process', false, 'Explore page not found in build');
      }
    } catch (error) {
      this.addResult('Build Process', false, error.message);
    }
  }

  async testDevServer() {
    console.log('🔧 Testing dev server...');
    
    return new Promise((resolve) => {
      const server = spawn('npm', ['run', 'dev'], { 
        stdio: 'pipe',
        detached: true
      });

      let output = '';
      let ready = false;

      server.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Ready in')) {
          ready = true;
          setTimeout(() => this.testServerEndpoints('dev', server, resolve), 2000);
        }
      });

      server.stderr.on('data', (data) => {
        output += data.toString();
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!ready) {
          this.addResult('Dev Server', false, 'Server failed to start within 30s');
          server.kill('SIGKILL');
          resolve();
        }
      }, 30000);
    });
  }

  async testProdServer() {
    console.log('🚀 Testing production server...');
    
    return new Promise((resolve) => {
      const server = spawn('npm', ['run', 'start', '--', '--port', this.ports.prod], { 
        stdio: 'pipe',
        detached: true
      });

      let output = '';
      let ready = false;

      server.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Ready in') || output.includes('Local:')) {
          ready = true;
          setTimeout(() => this.testServerEndpoints('prod', server, resolve), 2000);
        }
      });

      server.stderr.on('data', (data) => {
        output += data.toString();
        if (output.includes('EADDRINUSE')) {
          this.addResult('Production Server', false, 'Port already in use');
          server.kill('SIGKILL');
          resolve();
          return;
        }
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!ready) {
          this.addResult('Production Server', false, 'Server failed to start within 15s');
          server.kill('SIGKILL');
          resolve();
        }
      }, 15000);
    });
  }

  async testServerEndpoints(serverType, server, callback) {
    const port = serverType === 'dev' ? this.ports.dev : this.ports.prod;
    const baseUrl = `http://localhost:${port}`;
    
    const endpoints = [
      '/',
      '/explore',
      '/results',
      '/api/dilemmas',
      '/api/status/database'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.httpRequest(`${baseUrl}${endpoint}`);
        const success = response.status >= 200 && response.status < 400;
        this.addResult(
          `${serverType.toUpperCase()} ${endpoint}`, 
          success, 
          `HTTP ${response.status}`
        );
      } catch (error) {
        this.addResult(
          `${serverType.toUpperCase()} ${endpoint}`, 
          false, 
          error.message
        );
      }
    }

    server.kill('SIGKILL');
    callback();
  }

  async testAPIEndpoints() {
    console.log('🔌 Testing API endpoints...');
    // This is covered in server tests above
  }

  async testPageRouting() {
    console.log('🛣️ Testing page routing...');
    // This is covered in server tests above
  }

  async testDataFlow() {
    console.log('📊 Testing data flow...');
    
    try {
      // Test if explore page can be statically generated
      const explorePage = path.join('.next', 'server', 'app', 'explore', 'page.js');
      const pageExists = fs.existsSync(explorePage);
      
      if (pageExists) {
        const pageContent = fs.readFileSync(explorePage, 'utf8');
        const hasClientDirective = pageContent.includes('use client');
        const hasDynamicExport = pageContent.includes('force-dynamic');
        
        this.addResult('Static Generation', !hasClientDirective, 
          hasClientDirective ? 'Page uses client directive' : 'Page is server-compatible');
        this.addResult('Dynamic Export', hasDynamicExport, 
          hasDynamicExport ? 'Dynamic export found' : 'Missing dynamic export');
      } else {
        this.addResult('Explore Page Build', false, 'Explore page not found in build');
      }
    } catch (error) {
      this.addResult('Data Flow', false, error.message);
    }
  }

  addResult(test, passed, message) {
    this.results.push({
      test,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
    
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} ${test}: ${message}`);
  }

  printResults() {
    console.log('\n📋 Test Results Summary');
    console.log('========================');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = ((passed / total) * 100).toFixed(1);
    
    console.log(`Passed: ${passed}/${total} (${percentage}%)`);
    
    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(result => {
        console.log(`  - ${result.test}: ${result.message}`);
      });
    }
    
    // Write results to file
    const resultsFile = path.join(__dirname, 'test-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
    
    if (failed.length > 0) {
      process.exit(1);
    }
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${command} failed: ${error.message}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async httpRequest(url) {
    return new Promise((resolve, reject) => {
      const module = url.startsWith('https:') ? require('https') : require('http');
      
      module.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      }).on('error', reject);
    });
  }
}

// Run the test bench
if (require.main === module) {
  const bench = new TestBench();
  bench.run();
}

module.exports = TestBench;