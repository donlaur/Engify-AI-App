#!/usr/bin/env node

/**
 * Check for unused imports and missing dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Checking imports and dependencies...\n');

// Get all import statements
try {
  const imports = execSync(
    'grep -rh "^import.*from" src/ --include="*.tsx" --include="*.ts"',
    { encoding: 'utf8' }
  ).trim().split('\n');

  // Extract package names
  const packages = new Set();
  imports.forEach(line => {
    const match = line.match(/from ['"]([^'"]+)['"]/);
    if (match && !match[1].startsWith('.') && !match[1].startsWith('@/')) {
      const pkg = match[1].split('/')[0];
      packages.add(pkg);
    }
  });

  // Read package.json
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );

  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Find missing dependencies
  const missing = Array.from(packages).filter(pkg => !allDeps[pkg]);

  console.log(`📊 Import Analysis:`);
  console.log(`  Total imports: ${imports.length}`);
  console.log(`  Unique packages: ${packages.size}`);
  console.log(`  Installed deps: ${Object.keys(allDeps).length}\n`);

  if (missing.length > 0) {
    console.log('⚠️  Potentially missing dependencies:');
    missing.forEach(pkg => console.log(`  - ${pkg}`));
    console.log('\nNote: Some may be built-in Node modules');
  } else {
    console.log('✅ All imported packages are in package.json');
  }

  // Check for common issues
  console.log('\n🔍 Common Issues:');
  
  const reactImports = imports.filter(i => i.includes("from 'react'"));
  console.log(`  React imports: ${reactImports.length}`);
  
  const nextImports = imports.filter(i => i.includes("from 'next"));
  console.log(`  Next.js imports: ${nextImports.length}`);
  
  const componentImports = imports.filter(i => i.includes('@/components'));
  console.log(`  Component imports: ${componentImports.length}`);

} catch (error) {
  console.error('Error:', error.message);
}
