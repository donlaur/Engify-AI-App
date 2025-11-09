#!/usr/bin/env node

/**
 * Quick MCP Server Setup Test
 * Validates that everything is working without requiring full IDE setup
 */

// Load environment variables
require('dotenv').config();

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const CONFIG_FILE = join(homedir(), '.engify-mcp-auth.json');

console.log('🧪 Engify MCP Server Setup Test\n');

// Test 1: Check config file exists
console.log('1. Checking authentication config...');
if (existsSync(CONFIG_FILE)) {
  console.log('✅ Authentication config found');
  
  try {
    const config = JSON.parse(require('fs').readFileSync(CONFIG_FILE, 'utf8'));
    console.log(`   User ID: ${config.userId}`);
    console.log(`   Expires: ${new Date(config.expiresAt).toLocaleString()}`);
    
    // Check if expired
    if (Date.now() >= config.expiresAt) {
      console.log('⚠️  Token expired - run "pnpm auth" to refresh');
    } else {
      console.log('✅ Token is valid');
    }
  } catch (error) {
    console.log('❌ Invalid config format');
    process.exit(1);
  }
} else {
  console.log('❌ No authentication config found');
  console.log('   Run "pnpm auth" to set up authentication');
  process.exit(1);
}

// Test 2: Check dependencies
console.log('\n2. Checking dependencies...');
try {
  // Check if node_modules exists and has the required packages
  const fs = require('fs');
  const path = require('path');
  
  const requiredPackages = [
    '@modelcontextprotocol/sdk',
    'jose',
    'chalk'
  ];
  
  let allFound = true;
  for (const pkg of requiredPackages) {
    const pkgPath = path.join(__dirname, 'node_modules', pkg);
    if (!fs.existsSync(pkgPath)) {
      console.log(`❌ Missing ${pkg}`);
      allFound = false;
    }
  }
  
  if (allFound) {
    console.log('✅ All dependencies installed');
  } else {
    console.log('❌ Missing dependencies - run "pnpm install"');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Missing dependencies - run "pnpm install"');
  process.exit(1);
}

// Test 3: Check environment
console.log('\n3. Checking environment...');
if (!process.env.NEXTAUTH_SECRET) {
  console.log('⚠️  NEXTAUTH_SECRET not set (using fallback)');
} else {
  console.log('✅ NEXTAUTH_SECRET configured');
}

if (!process.env.MONGODB_URI) {
  console.log('⚠️  MONGODB_URI not set (using default localhost)');
} else {
  console.log('✅ MONGODB_URI configured');
}

// Test 4: Try to start launcher (dry run)
console.log('\n4. Testing launcher startup...');
console.log('   Starting launcher for 3 seconds to validate...');

const launcher = spawn('tsx', ['engify-mcp-launcher.ts'], {
  cwd: __dirname,
  stdio: 'pipe',
  timeout: 3000
});

let output = '';
launcher.stdout.on('data', (data) => {
  output += data.toString();
});

launcher.stderr.on('data', (data) => {
  output += data.toString();
});

launcher.on('close', (code) => {
  if (output.includes('🚀 Starting Engify MCP Server')) {
    console.log('✅ Launcher starts successfully');
  } else if (output.includes('❌')) {
    console.log('❌ Launcher failed to start');
    console.log('   Error:', output);
  } else {
    console.log('⚠️  Launcher test inconclusive');
  }
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('If all checks pass, your MCP server is ready to use!');
  console.log('\nNext steps:');
  console.log('1. Configure your IDE with the MCP server');
  console.log('2. Use @Engify get new bug reports to test');
  console.log('3. Use @Engify get bug report details to get specific bugs');
});

// Kill launcher after timeout
setTimeout(() => {
  launcher.kill('SIGTERM');
}, 3000);
