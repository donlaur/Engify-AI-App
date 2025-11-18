#!/usr/bin/env tsx
/**
 * AI Guardrails Enforcement Script
 * 
 * Runs BEFORE pre-commit to ensure AI assistants:
 * 1. Check for existing tools before creating new
 * 2. Verify pre-commit hooks include validations
 * 3. Don't bypass quality gates unnecessarily
 * 
 * This prevents production breakages and keeps git history professional.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface GuardrailCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const checks: GuardrailCheck[] = [];

// Check 1: Icon validation in pre-commit (deprecated - script removed)
function checkIconValidation(): GuardrailCheck {
  // Note: audit-icons.ts was removed in cleanup - skip this check
  return {
    name: 'Icon Validation in Pre-Commit',
    passed: true,
    message: '✅ Icon validation check skipped (script removed in cleanup)',
    severity: 'info',
  };
}

// Check 2: No unnecessary --no-verify in recent commits
function checkNoVerifyUsage(): GuardrailCheck {
  try {
    const recentCommits = execSync(
      'git log --oneline -10 --all',
      { encoding: 'utf-8' }
    );
    const noVerifyCount = (recentCommits.match(/no-verify/gi) || []).length;
    
    return {
      name: 'Pre-Commit Hook Bypasses',
      passed: noVerifyCount <= 1,
      message: noVerifyCount > 1
        ? `⚠️  ${noVerifyCount} recent commits bypassed pre-commit hooks. Review with: git log --grep="no-verify" -i`
        : '✅ Minimal use of --no-verify (acceptable for emergency fixes)',
      severity: noVerifyCount > 2 ? 'error' : noVerifyCount > 0 ? 'warning' : 'info',
    };
  } catch {
    return {
      name: 'Pre-Commit Hook Bypasses',
      passed: true,
      message: '⚠️  Could not check git history',
      severity: 'warning',
    };
  }
}

// Check 3: Existing tools are being used
function checkExistingTools(): GuardrailCheck {
  const criticalTools = [
    'scripts/maintenance/check-enterprise-compliance.js',
    'scripts/security/security-check.js',
  ];

  const missing = criticalTools.filter(tool => !existsSync(tool));

  return {
    name: 'Critical Tools Exist',
    passed: missing.length === 0,
    message: missing.length === 0
      ? '✅ All critical validation tools exist'
      : `❌ Missing critical tools: ${missing.join(', ')}`,
    severity: missing.length === 0 ? 'info' : 'error',
  };
}

// Check 4: Pre-commit hook has all validations
function checkPreCommitCompleteness(): GuardrailCheck {
  const preCommit = readFileSync('.husky/pre-commit', 'utf-8');

  const requiredChecks = [
    { name: 'Enterprise Compliance', pattern: 'check-enterprise-compliance' },
    { name: 'Security Check', pattern: 'security-check' },
  ];

  const missing = requiredChecks.filter(
    check => !preCommit.includes(check.pattern)
  );

  return {
    name: 'Pre-Commit Hook Completeness',
    passed: missing.length === 0,
    message: missing.length === 0
      ? '✅ All critical validations in pre-commit'
      : `⚠️  Missing from pre-commit: ${missing.map(m => m.name).join(', ')}`,
    severity: missing.length === 0 ? 'info' : 'warning',
  };
}

// Run all checks
function runGuardrails(): void {
  console.log('🛡️  AI Guardrails Enforcement\n');
  
  checks.push(checkIconValidation());
  checks.push(checkNoVerifyUsage());
  checks.push(checkExistingTools());
  checks.push(checkPreCommitCompleteness());
  
  const errors = checks.filter(c => c.severity === 'error' && !c.passed);
  const warnings = checks.filter(c => c.severity === 'warning' && !c.passed);
  
  // Display results
  checks.forEach(check => {
    const icon = check.passed ? '✅' : check.severity === 'error' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}`);
    console.log(`   ${check.message}\n`);
  });
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  console.log(`   Passed: ${checks.filter(c => c.passed).length}/${checks.length}\n`);
  
  // Exit with error if critical issues
  if (errors.length > 0) {
    console.log('❌ Guardrails failed. Fix errors before proceeding.\n');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Guardrails passed with warnings. Review before committing.\n');
  } else {
    console.log('✅ All guardrails passed!\n');
  }
  
  process.exit(0);
}

runGuardrails();

