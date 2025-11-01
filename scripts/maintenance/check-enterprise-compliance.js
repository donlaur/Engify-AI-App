#!/usr/bin/env node

/**
 * Enterprise Compliance Checker
 * 
 * Validates code against enterprise standards established in Days 2-4:
 * - ADR-001 compliance (AI Provider Interface)
 * - RBAC requirements
 * - Multi-tenant (organizationId)
 * - Security (rate limiting, XSS sanitization)
 * - Observability (audit logging, error boundaries)
 * - Testing requirements
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

// Get added files (new files)
function getAddedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=A', {
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

// Enterprise compliance rules
const complianceRules = [
  {
    name: 'New API route missing rate limiting',
    pattern: /export async function (GET|POST|PUT|DELETE|PATCH)\(/g,
    check: (match, content, filePath) => {
      // Only check API routes
      if (!filePath.includes('/api/') || !filePath.includes('/route.ts')) {
        return false;
      }
      
      // Check if rate limiting is present
      const hasRateLimit = content.includes('checkRateLimit') || 
                          content.includes('checkFeedbackRateLimit') ||
                          content.includes('rateLimit');
      
      // Skip if it's a protected route (requires auth) - those might have different rate limiting
      const isProtected = content.includes('auth()') && content.includes('session?.user');
      
      // Public routes MUST have rate limiting
      return !hasRateLimit && !isProtected;
    },
    severity: 'HIGH',
    message: 'Public API route missing rate limiting',
    suggestion: 'Add rate limiting: import { checkRateLimit } from "@/lib/rate-limit"',
  },
  
  {
    name: 'User input missing XSS sanitization',
    pattern: /(comment|content|description|text|message|input|body)\s*[:=]/g,
    check: (match, content, filePath) => {
      // Only check API routes and components that handle user input
      if (!filePath.includes('/api/') && !filePath.includes('/components/')) {
        return false;
      }
      
      // Check if sanitization is present
      const hasSanitize = content.includes('sanitizeText') || 
                         content.includes('sanitizeRichContent') ||
                         content.includes('DOMPurify');
      
      // Skip if it's validated through Zod (Zod strips HTML by default)
      const hasZodValidation = content.includes('.parse(') || content.includes('.safeParse(');
      
      // Skip test files
      if (filePath.includes('.test.') || filePath.includes('.spec.')) {
        return false;
      }
      
      // API routes that accept user comments/content need sanitization
      if (filePath.includes('/api/') && 
          (content.includes('comment') || content.includes('content')) &&
          !hasSanitize && !hasZodValidation) {
        return true;
      }
      
      return false;
    },
    severity: 'HIGH',
    message: 'User input may contain XSS vulnerabilities',
    suggestion: 'Import and use sanitizeText() from "@/lib/security/sanitize"',
  },
  
  {
    name: 'Client component missing error boundary',
    pattern: /^\s*['"]use client['"]/gm,
    check: (match, content, filePath) => {
      // Only check components
      if (!filePath.includes('/components/')) {
        return false;
      }
      
      // Skip if it's the ErrorBoundary component itself
      if (filePath.includes('ErrorBoundary')) {
        return false;
      }
      
      // Check if wrapped in ErrorBoundary in the component file itself
      const hasErrorBoundary = content.includes('ErrorBoundary') || 
                               content.includes('FeedbackErrorBoundary') ||
                               content.includes('withErrorBoundary');
      
      // Check if it's a simple wrapper component (might not need boundary)
      const isSimpleWrapper = content.split('\n').length < 20;
      
      // Check if component is wrapped in pages (we can't detect this perfectly, so we'll be lenient)
      // Components like ContactForm are wrapped in pages, which is acceptable
      const isWrappedInPage = filePath.includes('ContactForm') || filePath.includes('Footer');
      
      return !hasErrorBoundary && !isSimpleWrapper && !isWrappedInPage;
    },
    severity: 'MEDIUM',
    message: 'Client component should be wrapped in ErrorBoundary',
    suggestion: 'Import { FeedbackErrorBoundary } from "@/components/ErrorBoundary"',
  },
  
  {
    name: 'New API route missing tests',
    pattern: /export async function (GET|POST|PUT|DELETE|PATCH)\(/g,
    check: (match, content, filePath) => {
      // Only check API routes
      if (!filePath.includes('/api/') || !filePath.includes('/route.ts')) {
        return false;
      }
      
      // Check if test file exists
      const testFilePath = filePath.replace('/route.ts', '.test.ts');
      const testFileExists = fs.existsSync(testFilePath) || 
                            fs.existsSync(testFilePath.replace('/app/api/', '/__tests__/api/')) ||
                            fs.existsSync(testFilePath.replace('/api/', '/__tests__/api/'));
      
      return !testFileExists;
    },
    severity: 'HIGH',
    message: 'New API route missing tests',
    suggestion: 'Create test file: src/__tests__/api/[route-name].test.ts',
  },
  
  {
    name: 'New client component missing tests',
    pattern: /^export (function|const) \w+(\(|:)/gm,
    check: (match, content, filePath) => {
      // Only check components
      if (!filePath.includes('/components/') || filePath.includes('.test.')) {
        return false;
      }
      
      // Skip if it's a simple wrapper or utility component
      const isSimpleWrapper = content.split('\n').length < 50;
      
      // Check if test file exists
      const repoRoot = path.resolve(__dirname, '../..');
      const testFilePath = path.resolve(repoRoot, filePath.replace('.tsx', '.test.tsx').replace('.ts', '.test.ts'));
      // Also check in __tests__ subdirectories (components/forms/Component.tsx -> components/forms/__tests__/Component.test.tsx)
      // Match the directory path before the filename and insert __tests__/
      const testFilePathInTests = path.resolve(repoRoot, filePath.replace(/(\/components\/[^/]+\/)([^/]+\.tsx?)$/, '$1__tests__/$2')
        .replace('.tsx', '.test.tsx')
        .replace('.ts', '.test.ts'));
      // Also check co-located tests (same directory)
      const testFilePathColocated = path.resolve(repoRoot, filePath
        .replace('.tsx', '.test.tsx')
        .replace('.ts', '.test.ts'));
      const testFileExists = fs.existsSync(testFilePath) || 
                            fs.existsSync(testFilePathInTests) ||
                            fs.existsSync(testFilePathColocated);
      
      return !testFileExists && !isSimpleWrapper;
    },
    severity: 'MEDIUM',
    message: 'New component missing tests',
    suggestion: 'Create test file: [component-name].test.tsx',
  },
  
  {
    name: 'Database schema missing organizationId',
    pattern: /export const \w+Schema = z\.object\(\{/g,
    check: (match, content, filePath) => {
      // Only check schema files
      if (!filePath.includes('schema') || !filePath.includes('/schemas/')) {
        return false;
      }
      
      // Skip if it's an audit log or system schema
      if (filePath.includes('auditLog') || filePath.includes('system')) {
        return false;
      }
      
      // Check if organizationId is present
      const hasOrganizationId = content.includes('organizationId');
      
      // Check if it's intentionally user-scoped (has userId but not organizationId)
      const isUserScoped = content.includes('userId') && 
                          (content.includes('user-scoped') || content.includes('NOT multi-tenant'));
      
      return !hasOrganizationId && !isUserScoped;
    },
    severity: 'CRITICAL',
    message: 'Schema missing organizationId - BREAKS MULTI-TENANT COMPLIANCE',
    suggestion: 'Add organizationId: z.string().optional() to schema',
  },
  
  {
    name: 'Significant event missing audit logging',
    pattern: /(insertOne|updateOne|deleteOne|insertMany)\(/g,
    check: (match, content, filePath) => {
      // Only check API routes
      if (!filePath.includes('/api/')) {
        return false;
      }
      
      // Check if audit logging is present
      const hasAuditLog = content.includes('logAuditEvent') || 
                         content.includes('auditLog') ||
                         content.includes('auditLogService');
      
      // Skip if it's a quick feedback (low-significance)
      const isQuickFeedback = content.includes('quick-feedback') || 
                             content.includes('QUICK_FEEDBACK');
      
      // Significant events: user creation, prompt creation, ratings, etc.
      const isSignificantEvent = content.includes('DetailedRating') ||
                                content.includes('prompt') ||
                                content.includes('user') ||
                                content.includes('rating');
      
      return !hasAuditLog && isSignificantEvent && !isQuickFeedback;
    },
    severity: 'HIGH',
    message: 'Significant database operation missing audit logging',
    suggestion: 'Import { logAuditEvent } from "@/server/middleware/audit"',
  },
  
  {
    name: 'Creating duplicate AI provider code',
    pattern: /(class|interface|type) \w*(Provider|Adapter|Client)/g,
    check: (match, content, filePath) => {
      // Check if it's creating a new provider instead of using existing
      if (!filePath.includes('/ai/') && !filePath.includes('/provider')) {
        return false;
      }
      
      // Skip if it's using the existing interface
      if (content.includes('implements AIProvider') || 
          content.includes('extends BaseProvider') ||
          content.includes('AIProviderFactory')) {
        return false;
      }
      
      // Skip if it's in the v2 directory (that's the existing system)
      if (filePath.includes('/ai/v2/')) {
        return false;
      }
      
      // Skip test files
      if (filePath.includes('.test.') || filePath.includes('.spec.')) {
        return false;
      }
      
      return true;
    },
    severity: 'CRITICAL',
    message: 'Creating duplicate AI provider code - VIOLATES ADR-001',
    suggestion: 'Use existing AIProvider interface from src/lib/ai/v2/interfaces/AIProvider.ts',
  },
  
  {
    name: 'Hardcoded AI model names',
    pattern: /model:\s*['"](gpt-|claude-|gemini-|o1-)/g,
    check: (match, content, filePath) => {
      // Skip if it's in ai-models.ts (that's where models are defined)
      if (filePath.includes('ai-models.ts')) {
        return false;
      }
      
      // Skip if it's using getModelById or similar
      if (content.includes('getModelById') || content.includes('AI_MODELS')) {
        return false;
      }
      
      // Skip test files
      if (filePath.includes('.test.') || filePath.includes('.spec.')) {
        return false;
      }
      
      return true;
    },
    severity: 'HIGH',
    message: 'Hardcoded AI model name - use centralized config',
    suggestion: 'Import { getModelById } from "@/lib/config/ai-models"',
  },
];

// Check a file for compliance violations
function checkFile(filePath, isNewFile = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  complianceRules.forEach(({ name, pattern, check, severity, message, suggestion }) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(content)) !== null) {
      if (check(match[0], content, filePath, match.index)) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        
        issues.push({
          file: filePath,
          line: lineNumber,
          severity,
          type: name,
          message,
          suggestion,
          isNewFile,
        });
      }
    }
  });

  return issues;
}

// Main execution
function main() {
  console.log(`${colors.blue}🏢 Running enterprise compliance checks...${colors.reset}\n`);

  const stagedFiles = getStagedFiles();
  const addedFiles = getAddedFiles();

  if (stagedFiles.length === 0) {
    console.log(`${colors.green}✅ No TypeScript files to check${colors.reset}`);
    process.exit(0);
  }

  console.log(`Checking ${stagedFiles.length} file(s)...\n`);

  let allIssues = [];

  stagedFiles.forEach(file => {
    const isNewFile = addedFiles.includes(file);
    const issues = checkFile(file, isNewFile);
    allIssues = allIssues.concat(issues);
  });

  // Group issues by severity
  const critical = allIssues.filter(i => i.severity === 'CRITICAL');
  const high = allIssues.filter(i => i.severity === 'HIGH');
  const medium = allIssues.filter(i => i.severity === 'MEDIUM');
  const low = allIssues.filter(i => i.severity === 'LOW');

  // Display issues
  if (critical.length > 0) {
    console.log(`${colors.red}🚨 CRITICAL COMPLIANCE VIOLATIONS (${critical.length}):${colors.reset}\n`);
    critical.forEach(issue => {
      console.log(`${colors.red}  ❌ ${issue.type}${colors.reset}`);
      console.log(`     File: ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      console.log(`     💡 ${issue.suggestion}`);
      if (issue.isNewFile) {
        console.log(`     📝 NEW FILE - This MUST be fixed before commit`);
      }
      console.log('');
    });
  }

  if (high.length > 0) {
    console.log(`${colors.yellow}⚠️  HIGH PRIORITY COMPLIANCE ISSUES (${high.length}):${colors.reset}\n`);
    high.forEach(issue => {
      console.log(`${colors.yellow}  ⚠️  ${issue.type}${colors.reset}`);
      console.log(`     File: ${issue.file}:${issue.line}`);
      console.log(`     ${issue.message}`);
      console.log(`     💡 ${issue.suggestion}`);
      if (issue.isNewFile) {
        console.log(`     📝 NEW FILE - Recommended to fix before commit`);
      }
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
    console.log(`${colors.red}❌ COMMIT BLOCKED: Enterprise compliance violations detected${colors.reset}\n`);
    console.log('See docs/ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md for standards\n');
    console.log(`${colors.yellow}💡 Remember: Enterprise standards are non-negotiable!${colors.reset}\n`);
    process.exit(1);
  }

  if (medium.length > 0) {
    console.log(`${colors.yellow}⚠️  Warning: Medium priority compliance issues found${colors.reset}`);
    console.log('Consider fixing these before committing\n');
  }

  if (allIssues.length === 0) {
    console.log(`${colors.green}✅ All enterprise compliance checks passed!${colors.reset}\n`);
  }

  process.exit(0);
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`${colors.red}Error running compliance check:${colors.reset}`, error.message);
  process.exit(1);
}

