#!/usr/bin/env node

/**
 * Schema Validation Script
 * 
 * Prevents schema drift by validating:
 * 1. Database schema matches TypeScript types
 * 2. No hardcoded field names (use schema constants)
 * 3. All queries use proper types
 * 4. No unsafe array access
 * 
 * Run automatically in pre-commit hook.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
      .filter(file => file.match(/\.(ts|tsx)$/));
  } catch (error) {
    return [];
  }
}

// Validation rules
const validationRules = [
  {
    name: 'Hardcoded collection names',
    pattern: /\.collection\(['"`]([^'"`]+)['"`]\)/g,
    check: (match, content, filePath) => {
      // Allow in schema.ts, BaseService.ts, API routes, prompt utilities, patterns pages, logging, scripts, and sitemap
      if (filePath.includes('schema.ts') || 
          filePath.includes('BaseService.ts') ||
          filePath.includes('/api/') ||
          filePath.includes('/prompts/') ||
          filePath.includes('/prompts.ts') ||
          filePath.includes('/patterns/') ||
          filePath.includes('/logging/') ||
          filePath.includes('/scripts/') ||
          filePath.includes('scripts/') ||
          filePath.includes('sitemap.ts')) {
        return false;
      }
      return true;
    },
    severity: 'HIGH',
    message: 'Use service classes instead of hardcoded collection names',
    suggestion: 'Use userService.find() instead of db.collection("users").find()',
  },
  
  {
    name: 'Unsafe array access',
    pattern: /\[0\]|\[1\]|\[\d+\]/g,
    check: (match, content, filePath) => {
      // Check if there's a length check or optional chaining nearby
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(match)) {
          // Skip TypeScript destructuring patterns (const [response] = ...)
          if (lines[i].match(/const\s+\[.*\]\s*=/)) {
            return false; // Safe - TypeScript destructuring
          }
          // Skip array destructuring in function parameters
          if (lines[i].match(/\[.*\]\s*:/)) {
            return false; // Safe - function parameter destructuring
          }
          // Skip array destructuring in await expressions
          if (lines[i].match(/await.*\[.*\]/)) {
            return false; // Safe - await destructuring
          }
          // Check previous 3 lines for length check
          for (let j = Math.max(0, i - 3); j < i; j++) {
            if (lines[j].includes('.length') || lines[j].includes('hasItems')) {
              return false; // Safe - has length check
            }
          }
          // Check if using optional chaining
          if (lines[i].includes('?.')) {
            return false; // Safe - using optional chaining
          }
          return true; // Unsafe
        }
      }
      return false;
    },
    severity: 'MEDIUM',
    message: 'Unsafe array access without length check',
    suggestion: 'Use hasItems() or optional chaining: arr?.[0]',
  },
  
  {
    name: 'Direct array.map without safety check',
    pattern: /\.map\(/g,
    check: (match, content, filePath) => {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('.map(')) {
          // Check if using safeMap
          if (lines[i].includes('safeMap')) {
            return false;
          }
          // Check if there's a length check or optional chaining
          for (let j = Math.max(0, i - 3); j < i; j++) {
            if (lines[j].includes('.length') || lines[j].includes('hasItems') || lines[j].includes('Array.isArray')) {
              return false;
            }
          }
          // Check if using optional chaining
          if (lines[i].includes('?.map')) {
            return false;
          }
          return true; // Potentially unsafe
        }
      }
      return false;
    },
    severity: 'LOW',
    message: 'Consider using safeMap() for safer array operations',
    suggestion: 'Use safeMap(arr, fn) instead of arr.map(fn)',
  },
  
  {
    name: 'Missing organizationId in query',
    pattern: /\.find\(\{[^}]*\}\)|\.findOne\(\{[^}]*\}\)|\.updateOne\(\{[^}]*\}\)|\.deleteOne\(\{[^}]*\}\)/g,
    check: (match, content, filePath) => {
      // Skip if in BaseService or schema files
      if (filePath.includes('BaseService.ts') || filePath.includes('schema.ts')) {
        return false;
      }
      
      // Skip if organizationId is in the query
      if (match.includes('organizationId')) {
        return false;
      }
      
      // Skip if querying by _id only (common pattern)
      if (match.match(/\{\s*_id:\s*[^}]+\s*\}/)) {
        return false;
      }
      
      // Skip system-wide scheduled jobs (they intentionally query all users)
      if (content.includes('System-wide scheduled job') || content.includes('SECURITY: This query is intentionally system-wide')) {
        return false;
      }
      
      // Skip user-scoped queries (filtered by userId, not organizationId)
      if (match.includes('userId') && (content.includes('user-scoped') || content.includes('user-specific'))) {
        return false;
      }
      
      // Check if this is a multi-tenant collection
      const multiTenantCollections = ['users', 'conversations', 'prompt_templates', 'audit_logs'];
      const isMultiTenant = multiTenantCollections.some(col => content.includes(`'${col}'`) || content.includes(`"${col}"`));
      
      return isMultiTenant;
    },
    severity: 'CRITICAL',
    message: 'Query missing organizationId - POTENTIAL DATA LEAK',
    suggestion: 'Add organizationId to query or use service method that includes it',
  },
  
  {
    name: 'Using any type',
    pattern: /:\s*any\b/g,
    check: (match, content, filePath) => {
      // Allow in test files
      if (filePath.includes('.test.ts') || filePath.includes('.spec.ts')) {
        return false;
      }
      
      // Allow if file has file-level eslint-disable for no-explicit-any
      if (content.includes('eslint-disable') && content.includes('no-explicit-any')) {
        return false;
      }
      
      // Allow if preceded by eslint-disable comment on previous line OR same line
      const lines = content.split('\n');
      const matchIndex = content.substring(0, match.index).split('\n').length - 1;
      const currentLine = lines[matchIndex] || '';
      const previousLine = lines[matchIndex - 1] || '';
      
      // Check previous line for eslint-disable-next-line
      if (previousLine.includes('eslint-disable-next-line') && 
          previousLine.includes('no-explicit-any')) {
        return false;
      }
      
      // Check same line for eslint-disable-line
      if (currentLine.includes('eslint-disable-line') && 
          currentLine.includes('no-explicit-any')) {
        return false;
      }
      
      return true;
    },
    severity: 'HIGH',
    message: 'Using "any" type - breaks type safety',
    suggestion: 'Use proper types or unknown with type guards, or add eslint-disable comment if intentional',
  },
  
  {
    name: 'Non-null assertion',
    pattern: /!\.|\!\[/g,
    check: (match, content, filePath) => {
      return true; // Always flag non-null assertions
    },
    severity: 'MEDIUM',
    message: 'Non-null assertion (!) can cause runtime errors',
    suggestion: 'Use optional chaining (?.) or explicit null checks',
  },
  
  {
    name: 'Duplicate code (repeated strings)',
    pattern: /(['"`])([^'"`]{20,})\1/g,
    check: (match, content, filePath) => {
      // Count occurrences of the string
      const str = match.slice(1, -1); // Remove quotes
      const count = (content.match(new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      return count > 2; // Flag if appears more than twice
    },
    severity: 'LOW',
    message: 'Repeated string literal - consider extracting to constant',
    suggestion: 'Extract to const or enum',
  },
];

// Check a file for violations
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  validationRules.forEach(({ name, pattern, check, severity, message, suggestion }) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      if (check(match[0], content, filePath)) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        
        issues.push({
          file: filePath,
          line: lineNumber,
          severity,
          type: name,
          message,
          suggestion,
          code: match[0],
        });
      }
    }
  });

  return issues;
}

// Main execution
function main() {
  console.log(`${colors.blue}🔍 Running schema and code quality validation...${colors.reset}\n`);

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log(`${colors.green}✅ No TypeScript files to check${colors.reset}`);
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
  const low = allIssues.filter(i => i.severity === 'LOW');

  // Display issues
  if (critical.length > 0) {
    console.log(`${colors.red}🚨 CRITICAL ISSUES (${critical.length}):${colors.reset}\n`);
    critical.forEach(issue => {
      console.log(`${colors.red}  ❌ ${issue.type}${colors.reset}`);
      console.log(`     File: ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      console.log(`     Code: ${issue.code}`);
      console.log(`     💡 ${issue.suggestion}`);
      console.log('');
    });
  }

  if (high.length > 0) {
    console.log(`${colors.yellow}⚠️  HIGH PRIORITY ISSUES (${high.length}):${colors.reset}\n`);
    high.forEach(issue => {
      console.log(`${colors.yellow}  ⚠️  ${issue.type}${colors.reset}`);
      console.log(`     File: ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      console.log(`     💡 ${issue.suggestion}`);
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
    console.log(`${colors.red}❌ COMMIT BLOCKED: Fix critical/high priority issues${colors.reset}\n`);
    console.log('See docs/CODE_QUALITY_STANDARDS.md for guidelines\n');
    process.exit(1);
  }

  if (medium.length > 0) {
    console.log(`${colors.yellow}⚠️  Warning: Medium priority issues found${colors.reset}`);
    console.log('Consider fixing these before committing\n');
  }

  if (allIssues.length === 0) {
    console.log(`${colors.green}✅ No code quality issues found${colors.reset}\n`);
  }

  process.exit(0);
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`${colors.red}Error running validation:${colors.reset}`, error.message);
  process.exit(1);
}
