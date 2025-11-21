# Code Readability & Documentation Tools

**Open source tools for checking code comments, JSDoc completeness, and readability.**

## 🎯 Overview

This document catalogs open source tools that can automatically check:
- JSDoc comment completeness
- Code readability metrics
- Documentation coverage
- Comment quality
- AI-readability patterns

---

## 🔧 Recommended Tools

### 1. **ESLint Plugins** (Recommended for TypeScript/JavaScript)

#### `eslint-plugin-jsdoc`
**Purpose:** Enforces JSDoc comment standards and completeness

**Installation:**
```bash
pnpm add -D eslint-plugin-jsdoc
```

**Configuration:**
```javascript
// eslint.config.js
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    plugins: {
      jsdoc,
    },
    rules: {
      // Require JSDoc comments on exported functions
      'jsdoc/require-jsdoc': [
        'warn',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false, // Too noisy for inline functions
            FunctionExpression: false,
          },
          contexts: [
            'ExportNamedDeclaration > FunctionDeclaration',
            'ExportDefaultDeclaration > FunctionDeclaration',
          ],
        },
      ],
      // Check JSDoc syntax
      'jsdoc/check-syntax': 'error',
      // Require description
      'jsdoc/require-description': 'warn',
      // Require @param for all parameters
      'jsdoc/require-param': 'warn',
      // Require @returns
      'jsdoc/require-returns': 'warn',
      // Check parameter names match
      'jsdoc/check-param-names': 'error',
      // Check return types
      'jsdoc/check-types': 'warn',
      // Enforce consistent formatting
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-indentation': 'warn',
    },
  },
];
```

**Benefits:**
- ✅ Catches missing JSDoc comments
- ✅ Validates JSDoc syntax
- ✅ Ensures parameter documentation matches function signatures
- ✅ Enforces consistent formatting
- ✅ Works with TypeScript

**GitHub:** https://github.com/gajus/eslint-plugin-jsdoc

---

#### `@typescript-eslint/eslint-plugin` (JSDoc rules)
**Purpose:** TypeScript-specific JSDoc validation

**Already installed** - just enable additional rules:

```javascript
// eslint.config.js
rules: {
  // Check JSDoc types match TypeScript types
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/prefer-ts-expect-error': 'error',
  
  // Require JSDoc for complex types
  '@typescript-eslint/explicit-function-return-type': 'off', // We use JSDoc instead
  '@typescript-eslint/explicit-module-boundary-types': 'off', // We use JSDoc instead
}
```

---

### 2. **CommentLint** (Markdown-style comments)

**Purpose:** Lints comments for style and consistency

**Installation:**
```bash
pnpm add -D commentlint @commentlint/cli
```

**Configuration:**
```javascript
// .commentlintrc.js
module.exports = {
  rules: {
    // Enforce sentence case in comments
    'sentence-case': 'warn',
    // Require periods at end of sentences
    'period-in-list': 'warn',
    // Check for TODO/FIXME format
    'todo-format': ['warn', { pattern: 'TODO\\(#[0-9]+\\): .+' }],
  },
};
```

**GitHub:** https://github.com/commentlint/commentlint

---

### 3. **TypeDoc** (Documentation Generator + Validator)

**Purpose:** Generates documentation and validates JSDoc completeness

**Installation:**
```bash
pnpm add -D typedoc
```

**Usage:**
```bash
# Generate docs (will fail if JSDoc is incomplete)
typedoc --out docs/api src/

# Check without generating
typedoc --emit none --noEmit src/
```

**Configuration:**
```json
// typedoc.json
{
  "entryPoints": ["src/**/*.ts"],
  "out": "docs/api",
  "exclude": ["**/*.test.ts", "**/__tests__/**"],
  "excludePrivate": true,
  "excludeProtected": true,
  "validation": {
    "invalidLink": true,
    "notDocumented": true
  }
}
```

**GitHub:** https://github.com/TypeDoc/TypeDoc

---

### 4. **TSDoc** (Microsoft's TypeScript Documentation Standard)

**Purpose:** Validates TSDoc (TypeScript-specific JSDoc variant)

**Installation:**
```bash
pnpm add -D @microsoft/tsdoc
```

**Usage:**
```typescript
// Custom script to validate TSDoc
import { TSDocParser } from '@microsoft/tsdoc';

const parser = new TSDocParser();
const result = parser.parseString(docComment);
// Check for errors
if (result.log.messages.length > 0) {
  // Report issues
}
```

**GitHub:** https://github.com/microsoft/tsdoc

---

### 5. **Code Climate** (Open Source: CodeClimate CLI)

**Purpose:** Code quality metrics including readability

**Installation:**
```bash
# Docker-based (recommended)
docker pull codeclimate/codeclimate

# Or npm
npm install -g codeclimate
```

**Usage:**
```bash
codeclimate analyze
```

**Configuration:**
```yaml
# .codeclimate.yml
engines:
  eslint:
    enabled: true
  duplication:
    enabled: true
    config:
      languages:
        - javascript
        - typescript
  fixme:
    enabled: true
    config:
      strings:
        - FIXME
        - TODO
        - XXX
```

**GitHub:** https://github.com/codeclimate/codeclimate

---

### 6. **SonarQube Community Edition** (Full-featured)

**Purpose:** Comprehensive code quality analysis including documentation

**Installation:**
```bash
# Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:community
```

**Features:**
- Documentation coverage metrics
- Code readability scoring
- Comment quality checks
- Duplication detection
- Maintainability index

**GitHub:** https://github.com/SonarSource/sonarqube

---

### 7. **Custom Scripts** (Recommended for AI-readability)

Since we're focusing on AI-readability patterns, we can create custom checks:

**Example: Check for AI-friendly comments:**
```typescript
// scripts/check-ai-readability.ts
import { readFileSync } from 'fs';
import { glob } from 'glob';

const AI_READABILITY_PATTERNS = [
  /@pattern\s+\w+/i, // Pattern annotations
  /@principle\s+\w+/i, // Principle annotations
  /@usage\s+/i, // Usage examples
  /@ai-readability/i, // Explicit AI-readability markers
];

function checkFile(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  const issues: string[] = [];
  
  // Check for exported functions without JSDoc
  const exportedFunctions = content.match(/export\s+(async\s+)?function\s+\w+/g);
  if (exportedFunctions) {
    exportedFunctions.forEach((fn) => {
      const funcName = fn.match(/function\s+(\w+)/)?.[1];
      if (funcName) {
        const hasJSDoc = content.includes(`/**`) && 
                        content.includes(`function ${funcName}`);
        if (!hasJSDoc) {
          issues.push(`Missing JSDoc for exported function: ${funcName}`);
        }
      }
    });
  }
  
  // Check for AI-readability patterns in complex files
  const lines = content.split('\n').length;
  if (lines > 100) {
    const hasAIPatterns = AI_READABILITY_PATTERNS.some(pattern => 
      pattern.test(content)
    );
    if (!hasAIPatterns) {
      issues.push(`Large file (${lines} lines) missing AI-readability patterns`);
    }
  }
  
  return issues;
}
```

---

## 🎯 Recommended Setup for This Project

### Phase 1: ESLint Plugin (Immediate)

Add `eslint-plugin-jsdoc` for basic JSDoc validation:

```bash
pnpm add -D eslint-plugin-jsdoc
```

### Phase 2: Custom Script (Short-term)

Create `scripts/check-documentation.ts` to validate:
- JSDoc completeness for exported functions
- AI-readability patterns in complex files
- Comment quality metrics

### Phase 3: Pre-commit Hook (Ongoing)

Add documentation checks to `.husky/pre-commit`:

```bash
# Check documentation
pnpm check:docs

# Check AI-readability
pnpm check:ai-readability
```

---

## 📊 Metrics to Track

1. **Documentation Coverage**
   - % of exported functions with JSDoc
   - % of complex functions (>50 lines) with JSDoc
   - % of public APIs with examples

2. **Comment Quality**
   - Average comment-to-code ratio
   - % of comments explaining "why" vs "what"
   - % of comments with AI-readability patterns

3. **Readability Score**
   - Cognitive complexity
   - Function length
   - File length
   - Nesting depth

---

## 🔗 Resources

- **ESLint JSDoc Plugin:** https://github.com/gajus/eslint-plugin-jsdoc
- **TypeDoc:** https://typedoc.org/
- **TSDoc:** https://tsdoc.org/
- **CommentLint:** https://commentlint.js.org/
- **Code Climate:** https://codeclimate.com/
- **SonarQube:** https://www.sonarqube.org/

---

## 📝 Next Steps

1. ✅ Add `eslint-plugin-jsdoc` to project
2. ✅ Create custom `check-documentation.ts` script
3. ✅ Add documentation checks to pre-commit hook
4. ✅ Set up CI checks for documentation coverage
5. ✅ Create documentation coverage dashboard

