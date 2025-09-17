#!/usr/bin/env node

/**
 * Simple script to trigger document reindexing
 * Run this from the backend container: node reindex-documents.js
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/search/reindex',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // Add any authentication headers if needed
  }
};

const req = http.request(options, (res) => {
  console.log(`Reindex request status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Reindex result:', result);
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Reindex request failed: ${e.message}`);
  console.log('Make sure the backend is running on localhost:3001');
});

console.log('Triggering document reindexing...');
req.end();