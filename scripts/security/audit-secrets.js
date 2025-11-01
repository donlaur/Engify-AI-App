#!/usr/bin/env node
/**
 * Security Audit Script
 * 
 * Scans codebase for exposed secrets, credentials, and sensitive data
 * Safe to run - only reports findings, doesn't modify files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to detect secrets
const SECRET_PATTERNS = [
  // AWS
  {
    name: 'AWS Access Key ID',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
    severity: 'CRITICAL',
  },
  {
    name: 'AWS Secret Access Key',
    pattern: /\b[A-Za-z0-9/+=]{40}\b/,
    severity: 'CRITICAL',
    // Skip base64 encoded data that might be false positives
    exclude: /data:image|base64/i,
  },
  {
    name: 'AWS Account ID',
    pattern: /\b[0-9]{4}-[0-9]{4}-[0-9]{4}\b/,
    severity: 'HIGH',
  },
  // Cognito
  {
    name: 'Cognito User Pool ID',
    pattern: /\b[a-z]+-[a-z]+-[0-9]+_[a-zA-Z0-9]+\b/,
    severity: 'HIGH',
    exclude: /YOUR_USER_POOL_ID|\[YOUR_USER_POOL_ID\]/i,
  },
  {
    name: 'Cognito Client ID',
    pattern: /\b[0-9a-z]{26,}\b/,
    severity: 'HIGH',
    exclude: /YOUR_CLIENT_ID|\[YOUR_CLIENT_ID\]|uuid|hash|token/i,
  },
  {
    name: 'Cognito Client Secret',
    pattern: /\b[0-9a-z]{40,}\b/,
    severity: 'CRITICAL',
    exclude: /YOUR_CLIENT_SECRET|\[YOUR_CLIENT_SECRET\]/i,
  },
  // MongoDB
  {
    name: 'MongoDB Connection String',
    pattern: /mongodb\+srv:\/\/[^:]+:[^@]+@/,
    severity: 'CRITICAL',
    exclude: /example|placeholder|mongodb\+srv:\/\/\[/i,
  },
  // API Keys
  {
    name: 'API Key Pattern',
    pattern: /(api[_-]?key|apikey|access[_-]?token|secret[_-]?key)\s*[=:]\s*['"][^'"]{20,}['"]/i,
    severity: 'HIGH',
    exclude: /process\.env|YOUR_|\[YOUR_|example|placeholder/i,
  },
  // Email addresses (personal)
  {
    name: 'Email Address',
    pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
    severity: 'MEDIUM',
    exclude: /example\.com|test\.com|placeholder|@example|donlaur@engify\.ai/i,
  },
  // Personal names
  {
    name: 'Personal Name',
    pattern: /\bdonlaur\b/i,
    severity: 'LOW',
    context: 'May be intentional',
  },
];

// Files/directories to ignore
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /\.git/,
  /dist/,
  /build/,
  /\.env/,
  /\.env\.local/,
  /pnpm-lock\.yaml/,
  /package-lock\.json/,
  /yarn\.lock/,
];

const findings = [];

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some((pattern) => pattern.test(filePath));
}

function scanFile(filePath) {
  if (shouldIgnore(filePath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    SECRET_PATTERNS.forEach(({ name, pattern, severity, exclude }) => {
      lines.forEach((line, lineNum) => {
        if (exclude && exclude.test(line)) {
          return;
        }

        const matches = line.match(pattern);
        if (matches) {
          findings.push({
            file: filePath,
            line: lineNum + 1,
            pattern: name,
            severity,
            match: matches[0],
            context: line.trim().substring(0, 100),
          });
        }
      });
    });
  } catch (error) {
    // Skip binary files or permission errors
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (shouldIgnore(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      scanFile(fullPath);
    }
  }
}

// Main execution
console.log('🔒 Running Security Audit...\n');

const rootDir = process.cwd();
scanDirectory(rootDir);

// Report findings
if (findings.length === 0) {
  console.log('✅ No security issues found!\n');
  process.exit(0);
}

console.log(`⚠️  Found ${findings.length} potential security issue(s):\n`);

// Group by severity
const bySeverity = {
  CRITICAL: [],
  HIGH: [],
  MEDIUM: [],
  LOW: [],
};

findings.forEach((finding) => {
  bySeverity[finding.severity] = bySeverity[finding.severity] || [];
  bySeverity[finding.severity].push(finding);
});

// Print by severity
['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach((severity) => {
  const issues = bySeverity[severity];
  if (issues.length > 0) {
    console.log(`\n${severity} (${issues.length}):`);
    console.log('─'.repeat(60));
    issues.forEach(({ file, line, pattern, match, context }) => {
      console.log(`\n📍 ${file}:${line}`);
      console.log(`   Pattern: ${pattern}`);
      console.log(`   Match: ${match.substring(0, 50)}...`);
      console.log(`   Context: ${context}`);
    });
  }
});

console.log(`\n\n📊 Summary:`);
console.log(`   CRITICAL: ${bySeverity.CRITICAL.length}`);
console.log(`   HIGH: ${bySeverity.HIGH.length}`);
console.log(`   MEDIUM: ${bySeverity.MEDIUM.length}`);
console.log(`   LOW: ${bySeverity.LOW.length}`);

console.log(`\n\n🔧 Next Steps:`);
console.log(`   1. Review each finding`);
console.log(`   2. Replace with placeholders or environment variables`);
console.log(`   3. Rotate exposed credentials`);
console.log(`   4. Add to .gitignore if needed`);
console.log(`   5. Update documentation`);

process.exit(findings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length > 0 ? 1 : 0);

