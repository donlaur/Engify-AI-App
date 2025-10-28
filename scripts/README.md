# Scripts Directory

**Professional development and maintenance scripts for Engify.ai**

This directory contains utility scripts for development, testing, deployment, and maintenance tasks. All scripts follow professional standards with proper error handling, logging, and documentation.

## Script Categories

### 🔧 Development Scripts

#### `audit-icons.ts`

- **Purpose**: Audit and validate icon usage across the application
- **Usage**: `npm run audit:icons`
- **Features**:
  - Scans components for icon usage
  - Identifies missing or unused icons
  - Generates usage reports

#### `check-imports.js`

- **Purpose**: Validate import statements and dependencies
- **Usage**: `node scripts/check-imports.js`
- **Features**:
  - Checks for unused imports
  - Validates import paths
  - Reports circular dependencies

#### `check-links.ts`

- **Purpose**: Validate internal and external links in documentation
- **Usage**: `tsx scripts/check-links.ts`
- **Features**:
  - Checks markdown files for broken links
  - Validates external URLs
  - Reports link status

### 🧪 Testing Scripts

#### `analyze-test-results.ts`

- **Purpose**: Analyze and report test execution results
- **Usage**: `npm run analyze:tests`
- **Features**:
  - Parses test output
  - Generates coverage reports
  - Identifies test failures

#### `test-prompts-batch.ts`

- **Purpose**: Batch test AI prompts across multiple providers
- **Usage**: `npm run test:prompts`
- **Features**:
  - Tests prompts with OpenAI, Claude, Gemini
  - Compares response quality
  - Generates performance metrics

#### `test-prompts.ts`

- **Purpose**: Test individual AI prompts
- **Usage**: `tsx scripts/test-prompts.ts`
- **Features**:
  - Single prompt testing
  - Provider comparison
  - Response validation

#### `test-adapters.ts`

- **Purpose**: Test AI provider adapters
- **Usage**: `tsx scripts/test-adapters.ts`
- **Features**:
  - Tests adapter implementations
  - Validates interface compliance
  - Performance benchmarking

#### `smoke-test.sh`

- **Purpose**: Basic smoke tests for deployment
- **Usage**: `./scripts/smoke-test.sh`
- **Features**:
  - Tests critical endpoints
  - Validates basic functionality
  - Quick deployment verification

### 🚀 Deployment Scripts

#### `verify-deployment.sh`

- **Purpose**: Verify production deployment
- **Usage**: `./scripts/verify-deployment.sh`
- **Features**:
  - Checks deployment status
  - Validates environment variables
  - Tests production endpoints

#### `pre-push-test.sh`

- **Purpose**: Pre-push validation tests
- **Usage**: `./scripts/pre-push-test.sh`
- **Features**:
  - Runs critical tests before push
  - Validates code quality
  - Prevents broken deployments

### 📊 Data Management Scripts

#### `seed-prompts-to-db.ts`

- **Purpose**: Seed MongoDB with prompt data
- **Usage**: `npm run seed:prompts`
- **Features**:
  - Imports prompts from TypeScript files
  - Validates data structure
  - Handles duplicates

#### `seed-api-keys.ts`

- **Purpose**: Seed API keys for testing
- **Usage**: `tsx scripts/seed-api-keys.ts`
- **Features**:
  - Sets up test API keys
  - Validates key format
  - Environment configuration

#### `import-content-bulk.ts`

- **Purpose**: Bulk import content from external sources
- **Usage**: `tsx scripts/import-content-bulk.ts`
- **Features**:
  - Imports from CSV/JSON files
  - Data validation and cleaning
  - Batch processing

#### `import-external-resources.ts`

- **Purpose**: Import external learning resources
- **Usage**: `tsx scripts/import-external-resources.ts`
- **Features**:
  - Fetches external content
  - Normalizes data format
  - Integrates with existing content

#### `migrate-learning-resources.ts`

- **Purpose**: Migrate learning resources between formats
- **Usage**: `tsx scripts/migrate-learning-resources.ts`
- **Features**:
  - Converts between data formats
  - Preserves metadata
  - Handles version migrations

### 🔍 Analysis Scripts

#### `run-gemini-research.ts`

- **Purpose**: Run research tasks using Gemini AI
- **Usage**: `tsx scripts/run-gemini-research.ts`
- **Features**:
  - Automated research tasks
  - Content generation
  - Data analysis

#### `generate-articles.ts`

- **Purpose**: Generate articles using AI
- **Usage**: `tsx scripts/generate-articles.ts`
- **Features**:
  - AI-powered content generation
  - Template-based articles
  - Quality validation

#### `export-all.ts`

- **Purpose**: Export all application data
- **Usage**: `tsx scripts/export-all.ts`
- **Features**:
  - Complete data export
  - Multiple format support
  - Backup generation

#### `export-prompts.ts`

- **Purpose**: Export prompt library
- **Usage**: `tsx scripts/export-prompts.ts`
- **Features**:
  - Prompt data export
  - Format conversion
  - Metadata preservation

### 🛡️ Security Scripts

#### `security-check.js`

- **Purpose**: Comprehensive security validation
- **Usage**: `node scripts/security-check.js`
- **Features**:
  - Scans for secrets and vulnerabilities
  - Validates security headers
  - Checks dependency security

#### `test-ai-keys.sh`

- **Purpose**: Test AI provider API keys
- **Usage**: `./scripts/test-ai-keys.sh`
- **Features**:
  - Validates API key functionality
  - Tests provider connectivity
  - Reports key status

### 🔧 Maintenance Scripts

#### `auto-fix-icons.js`

- **Purpose**: Automatically fix icon issues
- **Usage**: `node scripts/auto-fix-icons.js`
- **Features**:
  - Fixes missing icons
  - Updates icon imports
  - Resolves icon conflicts

#### `fix-missing-icons.sh`

- **Purpose**: Fix missing icon references
- **Usage**: `./scripts/fix-missing-icons.sh`
- **Features**:
  - Identifies missing icons
  - Suggests replacements
  - Updates references

#### `find-issues.sh`

- **Purpose**: Find common code issues
- **Usage**: `./scripts/find-issues.sh`
- **Features**:
  - Scans for common problems
  - Reports code quality issues
  - Suggests improvements

#### `count-todos.js`

- **Purpose**: Count TODO comments in codebase
- **Usage**: `node scripts/count-todos.js`
- **Features**:
  - Scans for TODO comments
  - Categorizes by priority
  - Generates reports

#### `validate-schema.js`

- **Purpose**: Validate data schemas
- **Usage**: `node scripts/validate-schema.js`
- **Features**:
  - Validates Zod schemas
  - Tests data structures
  - Reports validation errors

## Usage Guidelines

### Running Scripts

```bash
# TypeScript scripts
tsx scripts/script-name.ts

# JavaScript scripts
node scripts/script-name.js

# Shell scripts
./scripts/script-name.sh

# Via npm scripts (preferred)
npm run script-name
```

### Script Development Standards

1. **Error Handling**

   ```typescript
   try {
     // Script logic
   } catch (error) {
     console.error('Script failed:', error.message);
     process.exit(1);
   }
   ```

2. **Logging**

   ```typescript
   import { logger } from '../src/lib/logger';

   logger.info('Starting script execution');
   logger.error('Script failed', { error: error.message });
   ```

3. **Progress Reporting**

   ```typescript
   const total = items.length;
   items.forEach((item, index) => {
     console.log(`Processing ${index + 1}/${total}: ${item.name}`);
     // Process item
   });
   ```

4. **Configuration**
   ```typescript
   const config = {
     batchSize: process.env.BATCH_SIZE || 100,
     timeout: process.env.TIMEOUT || 30000,
     retries: process.env.RETRIES || 3,
   };
   ```

### Script Organization

Scripts are organized by purpose:

```
scripts/
├── README.md              # This file
├── development/           # Development utilities
├── testing/              # Test-related scripts
├── deployment/           # Deployment scripts
├── data/                 # Data management scripts
├── analysis/             # Analysis and research scripts
├── security/             # Security validation scripts
└── maintenance/          # Maintenance and cleanup scripts
```

### Adding New Scripts

When adding new scripts:

1. **Choose appropriate category** folder
2. **Follow naming conventions**:
   - `kebab-case` for file names
   - Descriptive names indicating purpose
3. **Add JSDoc comments**:
   ```typescript
   /**
    * Script description
    * @param {string} input - Input parameter description
    * @returns {Promise<void>}
    */
   ```
4. **Update this README** with script documentation
5. **Add npm script** if commonly used
6. **Include error handling** and logging
7. **Test thoroughly** before committing

### Common Patterns

#### Database Scripts

```typescript
import { connectDB } from '../src/lib/db/mongodb';

async function main() {
  try {
    await connectDB();
    // Script logic
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
```

#### API Testing Scripts

```typescript
import { testAPI } from '../src/lib/test-utils';

async function testEndpoints() {
  const endpoints = ['/api/health', '/api/stats', '/api/ai/execute'];

  for (const endpoint of endpoints) {
    await testAPI(endpoint);
  }
}
```

#### Data Processing Scripts

```typescript
import { processBatch } from '../src/lib/batch-processor';

async function processData(items: any[]) {
  const batchSize = 100;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processBatch(batch);
    console.log(`Processed ${i + batch.length}/${items.length}`);
  }
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   chmod +x scripts/script-name.sh
   ```

2. **Module Not Found**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **TypeScript Errors**

   ```bash
   npx tsc --noEmit scripts/script-name.ts
   ```

4. **Environment Variables**

   ```bash
   # Check if .env.local exists
   ls -la .env.local

   # Load environment
   source .env.local
   ```

### Debug Mode

Run scripts with debug output:

```bash
# Enable debug logging
DEBUG=* tsx scripts/script-name.ts

# Verbose output
tsx scripts/script-name.ts --verbose

# Dry run mode
tsx scripts/script-name.ts --dry-run
```

---

**This scripts directory demonstrates professional development practices, comprehensive tooling, and enterprise-grade maintenance workflows suitable for production environments.**
