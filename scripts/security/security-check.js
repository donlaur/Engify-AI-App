#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * Runs before every commit to catch security issues:
 * - Hardcoded secrets (API keys, passwords, tokens)
 * - Missing organizationId in database queries
 * - Unsafe input handling
 * - Exposed error messages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Get staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output
      .split('\n')
      .filter(file => file.trim() !== '')
      .filter(file => file.match(/\.(ts|tsx|js|jsx)$/));
  } catch (error) {
    return [];
  }
}

// Security patterns to check
const securityPatterns = [
  {
    name: 'Hardcoded API Keys',
    pattern: /(sk-[a-zA-Z0-9]{32,}|sk_live_[a-zA-Z0-9]{24,}|sk_test_[a-zA-Z0-9]{24,})/g,
    severity: 'CRITICAL',
    message: 'Hardcoded API key detected. Use environment variables instead.',
  },
  {
    name: 'MongoDB Connection Strings',
    pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/g,
    check: (match, content, filePath) => {
      // Skip if it's just checking the URI format (startsWith check)
      if (content.includes('startsWith(\'mongodb+srv://\')') || content.includes('startsWith("mongodb+srv://")')) {
        return false;
      }
      // Skip connection utility files that only reference the format
      if (filePath && filePath.includes('mongodb.ts') && !match.includes('@')) {
        return false;
      }
      return true;
    },
    severity: 'CRITICAL',
    message: 'MongoDB connection string with credentials detected. Use environment variables.',
  },
  {
    name: 'AWS Access Keys',
    pattern: /(AKIA[0-9A-Z]{16})/g,
    severity: 'CRITICAL',
    message: 'AWS access key detected. Use AWS Secrets Manager or environment variables.',
  },
  {
    name: 'Private Keys',
    pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g,
    severity: 'CRITICAL',
    message: 'Private key detected. Never commit private keys.',
  },
  {
    name: 'Generic Secrets',
    pattern: /(password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    check: (match, content, filePath) => {
      // Skip test files - they legitimately use test passwords
      if (filePath && (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.'))) {
        return false;
      }
      return true;
    },
    severity: 'HIGH',
    message: 'Potential hardcoded secret detected. Use environment variables.',
  },
  {
    name: 'JWT Tokens',
    pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    severity: 'HIGH',
    message: 'JWT token detected. Never commit tokens.',
  },
];

// Database query patterns (multi-tenant check)
const databasePatterns = [
  {
    name: 'Missing organizationId in find()',
    pattern: /\.find\(\{[^}]*\}\)/g,
    check: (match, content) => {
      // Skip system-wide scheduled jobs (they intentionally query all users)
      if (content.includes('System-wide scheduled job') || content.includes('SECURITY: This query is intentionally system-wide')) {
        return false;
      }
      // Skip if querying by _id only
      if (match.match(/\{\s*_id:\s*[^}]+\s*\}/)) {
        return false;
      }
      // Skip user-scoped queries (filtered by userId, not organizationId)
      if (match.includes('userId') && (content.includes('user-scoped') || content.includes('user-specific'))) {
        return false;
      }
      // Skip public analytics collections (aggregated public data)
      if (content.includes('prompt_stats') && (content.includes('public analytics') || content.includes('aggregated public'))) {
        return false;
      }
      // Check if organizationId is in the query
      return !match.includes('organizationId');
    },
    severity: 'CRITICAL',
    message: 'Database query missing organizationId. This is a DATA ISOLATION VIOLATION.',
  },
  {
    name: 'Missing organizationId in findOne()',
    pattern: /\.findOne\(\{[^}]*\}\)/g,
    check: (match, content, filePath, lineNumber) => {
      // Skip system-wide scheduled jobs
      if (content.includes('System-wide scheduled job') || content.includes('SECURITY: This query is intentionally system-wide')) {
        return false;
      }
      // Skip if querying by _id only
      if (match.match(/\{\s*_id:\s*[^}]+\s*\}/)) {
        return false;
      }
      // Skip user-scoped queries (filtered by userId, not organizationId)
      if (match.includes('userId') && (content.includes('user-scoped') || content.includes('user-specific'))) {
        return false;
      }
      // Skip email-scoped queries (access_requests, signup validations - NOT multi-tenant)
      if (match.includes('email') && (content.includes('user-scoped') || content.includes('NOT a multi-tenant') || content.includes('NOT a multi-tenant collection'))) {
        return false;
      }
      // Skip public analytics collections (aggregated public data)
      if (content.includes('prompt_stats') && (content.includes('public analytics') || content.includes('aggregated public'))) {
        return false;
      }
      return !match.includes('organizationId');
    },
    severity: 'CRITICAL',
    message: 'Database query missing organizationId. This is a DATA ISOLATION VIOLATION.',
  },
  {
    name: 'Missing organizationId in updateOne()',
    pattern: /\.updateOne\(\{[^}]*\}/g,
    check: (match, content) => {
      // Skip system-wide scheduled jobs
      if (content.includes('System-wide scheduled job') || content.includes('SECURITY: This query is intentionally system-wide')) {
        return false;
      }
      // Skip user-scoped queries (filtered by userId, not organizationId)
      if (match.includes('userId') && (content.includes('user-scoped') || content.includes('user-specific'))) {
        return false;
      }
      return !match.includes('organizationId');
    },
    severity: 'CRITICAL',
    message: 'Database update missing organizationId. This is a DATA ISOLATION VIOLATION.',
  },
  {
    name: 'Missing organizationId in deleteOne()',
    pattern: /\.deleteOne\(\{[^}]*\}/g,
    check: (match, content) => {
      // Skip system-wide scheduled jobs
      if (content.includes('System-wide scheduled job') || content.includes('SECURITY: This query is intentionally system-wide')) {
        return false;
      }
      // Skip user-scoped queries (filtered by userId, not organizationId)
      if (match.includes('userId') && (content.includes('user-scoped') || content.includes('user-specific'))) {
        return false;
      }
      return !match.includes('organizationId');
    },
    severity: 'CRITICAL',
    message: 'Database delete missing organizationId. This is a DATA ISOLATION VIOLATION.',
  },
];

// Unsafe patterns
const unsafePatterns = [
  {
    name: 'dangerouslySetInnerHTML without sanitization',
    pattern: /dangerouslySetInnerHTML/g,
    check: (match, content, filePath, lineNumber) => {
      // Skip security-check.js itself - it checks for dangerouslySetInnerHTML patterns
      if (filePath && filePath.includes('security-check.js')) {
        return false;
      }
      // Skip JSON-LD structured data (safe - JSON.stringify of our own data)
      const contextStart = Math.max(0, lineNumber - 5);
      const contextEnd = Math.min(content.split('\n').length, lineNumber + 5);
      const context = content.split('\n').slice(contextStart, contextEnd).join('\n');
      if (context.includes('application/ld+json') || context.includes('JSON.stringify')) {
        return false; // JSON-LD is safe
      }
      // Check if DOMPurify is used nearby
      return !context.includes('DOMPurify') && !context.includes('sanitize');
    },
    severity: 'HIGH',
    message: 'dangerouslySetInnerHTML without sanitization. Use DOMPurify.sanitize().',
  },
  {
    name: 'eval() usage',
    pattern: /\beval\(/g,
    check: (match, content, filePath) => {
      // Skip security-check.js itself - it checks for eval() patterns
      if (filePath.includes('security-check.js')) {
        return false;
      }
      // Allow Puppeteer's evaluate methods (safe, not actual eval)
      if (filePath && (
        filePath.includes('e2e/') || 
        filePath.includes('puppeteer') ||
        content.includes('page.evaluate') ||
        content.includes('page.$eval') ||
        content.includes('page.$$eval')
      )) {
        return false;
      }
      // Allow Redis EVAL (Lua script execution in Redis, not JavaScript eval)
      if (filePath && (
        filePath.includes('RedisAdapter') ||
        filePath.includes('redis') && (
          content.includes('Redis EVAL') ||
          content.includes('Lua script') ||
          content.includes('ioredis') ||
          content.includes('redisClient[luaMethod]')
        )
      )) {
        return false;
      }
      return true;
    },
    severity: 'CRITICAL',
    message: 'eval() is dangerous. Find a safer alternative.',
  },
  {
    name: 'Exposed error stack traces',
    pattern: /error\.stack|err\.stack/g,
    check: (match, content) => {
      // Check if it's being returned to client
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(match)) {
          // Check next few lines for NextResponse or return
          for (let j = i; j < Math.min(i + 5, lines.length); j++) {
            if (lines[j].includes('NextResponse') || lines[j].includes('return')) {
              return true;
            }
          }
        }
      }
      return false;
    },
    severity: 'HIGH',
    message: 'Error stack trace may be exposed to client. Use generic error messages.',
  },
];

// Check a file for security issues
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  // Check for hardcoded secrets
  securityPatterns.forEach(({ name, pattern, check, severity, message }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Apply custom check function if provided
        if (check && !check(match, content, filePath)) {
          return; // Skip this match
        }
        
        // Find line number
        const lines = content.split('\n');
        const lineNumber = lines.findIndex(line => line.includes(match)) + 1;
        
        issues.push({
          file: filePath,
          line: lineNumber,
          severity,
          type: name,
          message,
          code: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
        });
      });
    }
  });

  // Check database queries (only in src/lib/db or API routes)
  if (filePath.includes('src/lib/db') || filePath.includes('src/app/api')) {
    databasePatterns.forEach(({ name, pattern, check, severity, message }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (check(match[0], content)) {
          const lines = content.substring(0, match.index).split('\n');
          const lineNumber = lines.length;
          
          issues.push({
            file: filePath,
            line: lineNumber,
            severity,
            type: name,
            message,
            code: match[0],
          });
        }
      }
    });
  }

  // Check for unsafe patterns
  unsafePatterns.forEach(({ name, pattern, check, severity, message }) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      const lineNumber = lines.length;
      
      if (!check || check(match[0], content, filePath, lineNumber)) {
        issues.push({
          file: filePath,
          line: lineNumber,
          severity,
          type: name,
          message,
          code: match[0],
        });
      }
    }
  });

  return issues;
}

// Main execution
function main() {
  console.log(`${colors.blue}🔍 Running security checks...${colors.reset}\n`);

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log(`${colors.green}✅ No files to check${colors.reset}`);
    process.exit(0);
  }

  console.log(`Checking ${stagedFiles.length} file(s)...\n`);

  let allIssues = [];

  stagedFiles.forEach(file => {
    const issues = checkFile(file);
    allIssues = allIssues.concat(issues);
  });

  // Group issues by severity
  const critical = allIssues.filter(i => i.severity === 'CRITICAL');
  const high = allIssues.filter(i => i.severity === 'HIGH');
  const medium = allIssues.filter(i => i.severity === 'MEDIUM');

  // Display issues
  if (critical.length > 0) {
    console.log(`${colors.red}🚨 CRITICAL ISSUES (${critical.length}):${colors.reset}\n`);
    critical.forEach(issue => {
      console.log(`${colors.red}  ❌ ${issue.type}${colors.reset}`);
      console.log(`     File: ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      console.log(`     Code: ${issue.code}`);
      console.log('');
    });
  }

  if (high.length > 0) {
    console.log(`${colors.yellow}⚠️  HIGH PRIORITY ISSUES (${high.length}):${colors.reset}\n`);
    high.forEach(issue => {
      console.log(`${colors.yellow}  ⚠️  ${issue.type}${colors.reset}`);
      console.log(`     File: ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      console.log(`     Code: ${issue.code}`);
      console.log('');
    });
  }

  if (medium.length > 0) {
    console.log(`${colors.blue}ℹ️  MEDIUM PRIORITY ISSUES (${medium.length}):${colors.reset}\n`);
    medium.forEach(issue => {
      console.log(`${colors.blue}  ℹ️  ${issue.type}${colors.reset}`);
      console.log(`     File: ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      console.log('');
    });
  }

  // Exit with error if critical or high issues found
  if (critical.length > 0 || high.length > 0) {
    console.log(`${colors.red}❌ COMMIT BLOCKED: Fix security issues before committing${colors.reset}\n`);
    console.log('See docs/SECURITY_GUIDE.md for help\n');
    process.exit(1);
  }

  if (medium.length > 0) {
    console.log(`${colors.yellow}⚠️  Warning: Medium priority issues found${colors.reset}`);
    console.log('Consider fixing these before committing\n');
  }

  if (allIssues.length === 0) {
    console.log(`${colors.green}✅ No security issues found${colors.reset}\n`);
  }

  process.exit(0);
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`${colors.red}Error running security check:${colors.reset}`, error.message);
  process.exit(1);
}
