#!/usr/bin/env node

// Simple migration runner for Docker environments
const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Running database migrations...');

const command = 'npm run migration:run';

exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('⚠️ Migration warnings:', stderr);
  }
  
  console.log('✅ Migrations completed successfully');
  console.log(stdout);
});