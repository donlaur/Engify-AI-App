# JSDoc Checker - MCP Tool Integration Proposal

## 📊 Current Status

**Script:** `scripts/check-jsdoc.ts`  
**Status:** ✅ Working and tested on OpsHub area  
**Output Formats:** Human-readable text and JSON

## 📈 Test Results (OpsHub Area)

**Initial Scan Results:**
- **Total Files Analyzed:** 46
- **Files with Issues:** 44 (95.7%)
- **Total Issues:** 49
  - ❌ Errors: 1 (missing class JSDoc)
  - ⚠️ Warnings: 47 (missing function JSDoc)
  - ℹ️ Info: 1 (missing @returns)

**Key Findings:**
- Most exported functions are missing JSDoc comments
- 1 exported class (`AdminErrorBoundary`) missing JSDoc
- Good news: Functions that have JSDoc are mostly complete (no missing @param issues found)

## 🎯 MCP Tool Integration

### Proposed MCP Tool: `check_jsdoc_documentation`

**Purpose:** Automated JSDoc documentation quality checking for codebases

**Features:**
1. **File/Directory Analysis**
   - Analyze specific files or entire directories
   - Support for TypeScript/JavaScript files
   - Exclude test files automatically

2. **Issue Detection**
   - Missing JSDoc for exported functions
   - Missing JSDoc for exported classes
   - Incomplete JSDoc (missing descriptions)
   - Missing @param documentation
   - Missing @returns documentation

3. **Output Formats**
   - Human-readable report (for CLI/terminal)
   - JSON output (for programmatic use)
   - Structured data for integration

4. **Severity Levels**
   - **Error:** Missing JSDoc on exported classes (required)
   - **Warning:** Missing JSDoc on exported functions (recommended)
   - **Info:** Missing optional documentation (@returns for event handlers)

### MCP Tool Specification

```typescript
interface CheckJSDocParams {
  /**
   * Path to file or directory to analyze
   * @example "src/components/opshub"
   * @example "src/lib/utils.ts"
   */
  path: string;
  
  /**
   * Output format
   * @default "text"
   */
  format?: 'text' | 'json';
  
  /**
   * Severity threshold (only report issues at or above this level)
   * @default "info"
   */
  severity?: 'error' | 'warning' | 'info';
  
  /**
   * Include files matching these patterns
   * @default ["**/*.{ts,tsx,js,jsx}"]
   */
  include?: string[];
  
  /**
   * Exclude files matching these patterns
   * @default ["**/*.test.ts", "**/*.spec.ts", "**/__tests__/**"]
   */
  exclude?: string[];
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
  issues: Array<{
    file: string;
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info';
    rule: string;
    message: string;
  }>;
  summary: {
    exportedFunctionsWithoutJSDoc: number;
    classesWithoutJSDoc: number;
    functionsWithIncompleteJSDoc: number;
    missingParamDocs: number;
    missingReturnDocs: number;
  };
}
```

### Integration Points

1. **Guardrails MCP Server**
   - Add as a code quality check tool
   - Run automatically during code quality assessments
   - Include in pre-commit hooks

2. **Standalone Tool**
   - Can be called directly via MCP
   - Useful for documentation audits
   - Can be scheduled for regular checks

3. **CI/CD Integration**
   - Run in GitHub Actions
   - Block PRs if critical issues found
   - Generate documentation coverage reports

## 🔧 Implementation Steps

### Step 1: Add to Guardrails MCP Server

```typescript
// services/mcp-server/src/tools/jsdoc-checker.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function checkJSDocDocumentation(params: CheckJSDocParams): Promise<JSDocReport> {
  const { path, format = 'json', severity = 'info', include, exclude } = params;
  
  // Build command
  const args = ['--json', path];
  if (severity) args.push(`--severity=${severity}`);
  
  // Execute script
  const { stdout } = await execAsync(
    `tsx scripts/check-jsdoc.ts ${args.join(' ')}`,
    { cwd: process.cwd() }
  );
  
  return JSON.parse(stdout);
}
```

### Step 2: Register MCP Tool

```typescript
// services/mcp-server/src/index.ts
import { checkJSDocDocumentation } from './tools/jsdoc-checker';

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ... existing tools
      {
        name: 'check_jsdoc_documentation',
        description: 'Check JSDoc documentation completeness and quality for TypeScript/JavaScript files',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to file or directory to analyze',
            },
            format: {
              type: 'string',
              enum: ['text', 'json'],
              default: 'json',
            },
            severity: {
              type: 'string',
              enum: ['error', 'warning', 'info'],
              default: 'info',
            },
          },
          required: ['path'],
        },
      },
    ],
  };
});
```

### Step 3: Add to Code Quality Assessment

```typescript
// In engify_guardrail_assess_code_quality tool
async function assessCodeQuality(filePath: string) {
  // ... existing checks
  
  // Check JSDoc documentation
  const jsdocReport = await checkJSDocDocumentation({
    path: filePath,
    format: 'json',
    severity: 'warning',
  });
  
  // Add to assessment results
  if (jsdocReport.totalIssues > 0) {
    recommendations.push({
      type: 'documentation',
      severity: 'medium',
      message: `Missing JSDoc documentation: ${jsdocReport.summary.exportedFunctionsWithoutJSDoc} functions, ${jsdocReport.summary.classesWithoutJSDoc} classes`,
      details: jsdocReport.issues.slice(0, 5), // Top 5 issues
    });
  }
}
```

## 📊 Benefits of MCP Integration

1. **Automated Quality Checks**
   - Run as part of code quality assessments
   - Catch documentation issues early
   - Consistent documentation standards

2. **AI-Assisted Documentation**
   - AI can use tool to identify missing docs
   - AI can generate JSDoc based on function signatures
   - AI can validate documentation completeness

3. **Developer Experience**
   - Quick feedback on documentation gaps
   - Clear guidance on what needs documentation
   - Integration with existing workflows

4. **Metrics & Tracking**
   - Track documentation coverage over time
   - Identify areas needing documentation
   - Measure improvement in code readability

## 🎯 Usage Examples

### Example 1: Check Single File
```typescript
// Via MCP
const result = await mcp.callTool('check_jsdoc_documentation', {
  path: 'src/components/opshub/panels/OpsHubTabs.tsx',
  format: 'json',
});

console.log(`Found ${result.totalIssues} documentation issues`);
```

### Example 2: Check Entire Directory
```typescript
// Via MCP
const result = await mcp.callTool('check_jsdoc_documentation', {
  path: 'src/components/opshub',
  format: 'json',
  severity: 'warning', // Only warnings and errors
});

// Generate report
console.log(`Documentation Coverage: ${((result.totalFiles - result.filesWithIssues) / result.totalFiles * 100).toFixed(1)}%`);
```

### Example 3: Pre-commit Hook
```bash
#!/bin/sh
# .husky/pre-commit

# Check JSDoc for staged files
git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' | while read file; do
  tsx scripts/check-jsdoc.ts "$file" --severity=error
  if [ $? -ne 0 ]; then
    echo "❌ JSDoc check failed for $file"
    exit 1
  fi
done
```

## 📈 Next Steps

1. ✅ **Script Created** - `scripts/check-jsdoc.ts` is working
2. ⏳ **Add to MCP Server** - Integrate into Guardrails MCP
3. ⏳ **Add to Assessments** - Include in code quality checks
4. ⏳ **CI Integration** - Add to GitHub Actions
5. ⏳ **Documentation** - Update developer docs

## 🔗 Related Documentation

- [CODE_READABILITY_TOOLS.md](./CODE_READABILITY_TOOLS.md) - Overview of documentation tools
- [OPSHUB_PATTERNS.md](../opshub/OPSHUB_PATTERNS.md) - OpsHub coding patterns
- [AI_GUARDRAILS.md](../AI_GUARDRAILS.md) - AI development guardrails

