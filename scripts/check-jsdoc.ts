#!/usr/bin/env tsx

/**
 * JSDoc Documentation Checker
 * 
 * Analyzes TypeScript/JavaScript files for JSDoc comment completeness and quality.
 * This script can be used standalone or integrated into MCP tools for automated
 * documentation quality checks.
 * 
 * Usage:
 *   tsx scripts/check-jsdoc.ts [directory]
 *   tsx scripts/check-jsdoc.ts src/components/opshub
 *   tsx scripts/check-jsdoc.ts --json src/components/opshub
 */

import { readFileSync, statSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

interface JSDocIssue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
}

interface JSDocReport {
  totalFiles: number;
  filesWithIssues: number;
  totalIssues: number;
  issuesBySeverity: {
    error: number;
    warning: number;
    info: number;
  };
  issues: JSDocIssue[];
  summary: {
    exportedFunctionsWithoutJSDoc: number;
    classesWithoutJSDoc: number;
    functionsWithIncompleteJSDoc: number;
    missingParamDocs: number;
    missingReturnDocs: number;
  };
}

/**
 * Extract JSDoc comment from a function/class declaration
 */
function extractJSDoc(content: string, lineNumber: number): string | null {
  const lines = content.split('\n');
  let jsdoc = '';
  let currentLine = lineNumber - 1;
  
  // Look backwards for JSDoc comment
  while (currentLine >= 0) {
    const line = lines[currentLine].trim();
    
    // Found end of JSDoc
    if (line === '*/') {
      jsdoc = line + '\n' + jsdoc;
      currentLine--;
      continue;
    }
    
    // Found start of JSDoc
    if (line.startsWith('/**')) {
      jsdoc = line + '\n' + jsdoc;
      return jsdoc.trim();
    }
    
    // Collecting JSDoc content
    if (jsdoc || line.startsWith('*')) {
      jsdoc = line + '\n' + jsdoc;
      currentLine--;
      continue;
    }
    
    // Hit non-comment code, stop looking
    if (line && !line.startsWith('//') && !line.startsWith('*')) {
      break;
    }
    
    currentLine--;
  }
  
  return null;
}

/**
 * Parse function signature to extract parameters
 */
function parseFunctionParams(funcMatch: RegExpMatchArray): string[] {
  const paramsMatch = funcMatch[0].match(/\(([^)]*)\)/);
  if (!paramsMatch) return [];
  
  return paramsMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p && p !== '...args')
    .map(p => {
      // Extract parameter name (handle types, defaults, etc.)
      const nameMatch = p.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      return nameMatch ? nameMatch[1] : p;
    });
}

/**
 * Check if JSDoc has @param for all parameters
 */
function checkJSDocParams(jsdoc: string, params: string[]): string[] {
  const missing: string[] = [];
  const paramMatches = jsdoc.matchAll(/@param\s+(\w+)/g);
  const documentedParams = new Set(Array.from(paramMatches, m => m[1]));
  
  for (const param of params) {
    if (!documentedParams.has(param)) {
      missing.push(param);
    }
  }
  
  return missing;
}

/**
 * Check if JSDoc has @returns
 */
function hasJSDocReturns(jsdoc: string): boolean {
  return /@returns?|@return/.test(jsdoc);
}

/**
 * Analyze a single file for JSDoc issues
 */
function analyzeFile(filePath: string): JSDocIssue[] {
  const issues: JSDocIssue[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Find exported functions
  const exportedFunctionRegex = /export\s+(async\s+)?function\s+(\w+)/g;
  let match;
  
  while ((match = exportedFunctionRegex.exec(content)) !== null) {
    const funcName = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const column = match.index - content.lastIndexOf('\n', match.index) - 1;
    
    const jsdoc = extractJSDoc(content, lineNumber);
    
    if (!jsdoc) {
      issues.push({
        file: filePath,
        line: lineNumber,
        column: column + 1,
        severity: 'warning',
        rule: 'jsdoc/require-jsdoc',
        message: `Exported function '${funcName}' is missing JSDoc comment`,
      });
      continue;
    }
    
    // Check for description
    if (!jsdoc.match(/\*\s+\w+/)) {
      issues.push({
        file: filePath,
        line: lineNumber,
        column: column + 1,
        severity: 'warning',
        rule: 'jsdoc/require-description',
        message: `JSDoc for '${funcName}' is missing description`,
      });
    }
    
    // Check parameters
    const params = parseFunctionParams(match);
    if (params.length > 0) {
      const missingParams = checkJSDocParams(jsdoc, params);
      for (const param of missingParams) {
        issues.push({
          file: filePath,
          line: lineNumber,
          column: column + 1,
          severity: 'warning',
          rule: 'jsdoc/require-param',
          message: `JSDoc for '${funcName}' is missing @param for '${param}'`,
        });
      }
    }
    
    // Check return type (if function is not void)
    if (!hasJSDocReturns(jsdoc) && !funcName.match(/^handle|^on[A-Z]|^set[A-Z]/)) {
      issues.push({
        file: filePath,
        line: lineNumber,
        column: column + 1,
        severity: 'info',
        rule: 'jsdoc/require-returns',
        message: `JSDoc for '${funcName}' may need @returns documentation`,
      });
    }
  }
  
  // Find exported classes
  const exportedClassRegex = /export\s+(default\s+)?class\s+(\w+)/g;
  while ((match = exportedClassRegex.exec(content)) !== null) {
    const className = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const column = match.index - content.lastIndexOf('\n', match.index) - 1;
    
    const jsdoc = extractJSDoc(content, lineNumber);
    
    if (!jsdoc) {
      issues.push({
        file: filePath,
        line: lineNumber,
        column: column + 1,
        severity: 'error',
        rule: 'jsdoc/require-jsdoc',
        message: `Exported class '${className}' is missing JSDoc comment`,
      });
    }
  }
  
  // Find exported arrow functions (const exports)
  const exportedArrowFunctionRegex = /export\s+(const|let|var)\s+(\w+)\s*=\s*(\([^)]*\)\s*)?=>/g;
  while ((match = exportedArrowFunctionRegex.exec(content)) !== null) {
    const funcName = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const column = match.index - content.lastIndexOf('\n', match.index) - 1;
    
    // Only check if it's a function (not a simple value)
    if (match[3]) {
      const jsdoc = extractJSDoc(content, lineNumber);
      
      if (!jsdoc) {
        issues.push({
          file: filePath,
          line: lineNumber,
          column: column + 1,
          severity: 'warning',
          rule: 'jsdoc/require-jsdoc',
          message: `Exported arrow function '${funcName}' is missing JSDoc comment`,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Generate report from issues
 */
function generateReport(issues: JSDocIssue[], totalFiles: number): JSDocReport {
  const filesWithIssues = new Set(issues.map(i => i.file)).size;
  
  const summary = {
    exportedFunctionsWithoutJSDoc: issues.filter(
      i => i.rule === 'jsdoc/require-jsdoc' && i.severity === 'warning'
    ).length,
    classesWithoutJSDoc: issues.filter(
      i => i.rule === 'jsdoc/require-jsdoc' && i.severity === 'error'
    ).length,
    functionsWithIncompleteJSDoc: issues.filter(
      i => i.rule === 'jsdoc/require-description'
    ).length,
    missingParamDocs: issues.filter(
      i => i.rule === 'jsdoc/require-param'
    ).length,
    missingReturnDocs: issues.filter(
      i => i.rule === 'jsdoc/require-returns'
    ).length,
  };
  
  return {
    totalFiles,
    filesWithIssues,
    totalIssues: issues.length,
    issuesBySeverity: {
      error: issues.filter(i => i.severity === 'error').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
    },
    issues,
    summary,
  };
}

/**
 * Format report as human-readable text
 */
function formatReport(report: JSDocReport): string {
  let output = '\n📋 JSDoc Documentation Report\n';
  output += '='.repeat(50) + '\n\n';
  
  output += `Total Files Analyzed: ${report.totalFiles}\n`;
  output += `Files with Issues: ${report.filesWithIssues}\n`;
  output += `Total Issues: ${report.totalIssues}\n\n`;
  
  output += 'Issues by Severity:\n';
  output += `  ❌ Errors: ${report.issuesBySeverity.error}\n`;
  output += `  ⚠️  Warnings: ${report.issuesBySeverity.warning}\n`;
  output += `  ℹ️  Info: ${report.issuesBySeverity.info}\n\n`;
  
  output += 'Summary:\n';
  output += `  • Exported functions without JSDoc: ${report.summary.exportedFunctionsWithoutJSDoc}\n`;
  output += `  • Classes without JSDoc: ${report.summary.classesWithoutJSDoc}\n`;
  output += `  • Functions with incomplete JSDoc: ${report.summary.functionsWithIncompleteJSDoc}\n`;
  output += `  • Missing @param documentation: ${report.summary.missingParamDocs}\n`;
  output += `  • Missing @returns documentation: ${report.summary.missingReturnDocs}\n\n`;
  
  if (report.issues.length > 0) {
    output += 'Issues by File:\n';
    output += '-'.repeat(50) + '\n';
    
    const issuesByFile = report.issues.reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, JSDocIssue[]>);
    
    for (const [file, fileIssues] of Object.entries(issuesByFile)) {
      const relativePath = path.relative(process.cwd(), file);
      output += `\n${relativePath}:\n`;
      
      for (const issue of fileIssues) {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        output += `  ${icon} Line ${issue.line}:${issue.column} [${issue.rule}]\n`;
        output += `     ${issue.message}\n`;
      }
    }
  }
  
  return output;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const targetDir = args.find(arg => !arg.startsWith('--')) || 'src/components/opshub';
  
  console.log(`Analyzing JSDoc documentation in: ${targetDir}\n`);
  
  // Find all TypeScript files
  const files = await glob(`${targetDir}/**/*.{ts,tsx}`, {
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**', '**/node_modules/**'],
  });
  
  const allIssues: JSDocIssue[] = [];
  
  for (const file of files) {
    try {
      const issues = analyzeFile(file);
      allIssues.push(...issues);
    } catch (error) {
      console.error(`Error analyzing ${file}:`, error);
    }
  }
  
  const report = generateReport(allIssues, files.length);
  
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
    
    // Exit with error code if there are critical issues
    if (report.issuesBySeverity.error > 0) {
      process.exit(1);
    }
  }
}

main().catch(console.error);

