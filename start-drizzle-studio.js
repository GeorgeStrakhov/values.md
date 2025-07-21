#!/usr/bin/env node

// GLOBAL DRIZZLE STUDIO SERVER
// Starts Drizzle Studio on 0.0.0.0 for remote access

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const STUDIO_PORT = process.env.DRIZZLE_PORT || '4173';
const HOST = '0.0.0.0'; // Bind to all interfaces for global access

console.log('🗄️  STARTING DRIZZLE STUDIO (GLOBAL ACCESS)');
console.log('==========================================');
console.log(`📍 Port: ${STUDIO_PORT}`);
console.log(`🌐 Host: ${HOST} (accessible globally)`);
console.log(`🔗 URL: http://0.0.0.0:${STUDIO_PORT}`);

// Start Drizzle Studio with global access
const studio = spawn('npx', ['drizzle-kit', 'studio', '--port', STUDIO_PORT, '--host', HOST], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    DRIZZLE_HOST: HOST,
    DRIZZLE_PORT: STUDIO_PORT
  }
});

// Handle process events
studio.on('error', (error) => {
  console.error('❌ Failed to start Drizzle Studio:', error.message);
  process.exit(1);
});

studio.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Drizzle Studio stopped gracefully');
  } else {
    console.error(`❌ Drizzle Studio exited with code ${code}`);
  }
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Drizzle Studio...');
  studio.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping Drizzle Studio...');
  studio.kill('SIGTERM');
});

// Keep the process alive
process.stdin.resume();