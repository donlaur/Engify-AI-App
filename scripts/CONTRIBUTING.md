# Contributing to Scripts

**Guidelines for adding new scripts to the Engify.ai repository**

This guide will help you create well-structured, maintainable, and documented scripts that follow the project's best practices.

## Table of Contents

- [Quick Start](#quick-start)
- [Script Checklist](#script-checklist)
- [Step-by-Step Guide](#step-by-step-guide)
- [Script Standards](#script-standards)
- [Examples](#examples)
- [Testing Scripts](#testing-scripts)
- [Common Pitfalls](#common-pitfalls)

## Quick Start

```bash
# 1. Choose category and create script
mkdir -p scripts/my-category
touch scripts/my-category/my-script.ts

# 2. Use the template
cp scripts/templates/script-template.ts scripts/my-category/my-script.ts

# 3. Implement your logic
# Edit the script with your IDE

# 4. Test locally
tsx scripts/my-category/my-script.ts

# 5. Add npm alias (optional but recommended)
# Edit package.json scripts section

# 6. Update documentation
# Add to scripts/README.md

# 7. Commit and push
git add scripts/my-category/my-script.ts
git commit -m "feat: add my-script for X functionality"
git push
```

## Script Checklist

Before submitting your script, ensure it meets these requirements:

### Required

- [ ] **Shebang line** (`#!/usr/bin/env tsx` for TypeScript, `#!/bin/bash` for Bash)
- [ ] **Header documentation** with purpose, usage, and examples
- [ ] **Error handling** (try/catch, exit codes)
- [ ] **Environment validation** (check required vars before running)
- [ ] **Descriptive file name** (kebab-case, verb-noun pattern)
- [ ] **Proper category** (placed in appropriate subdirectory)
- [ ] **Updated README.md** (documented in scripts/README.md)

### Recommended

- [ ] **NPM script alias** (added to package.json if commonly used)
- [ ] **CLI argument parsing** (if script accepts options)
- [ ] **Progress reporting** (for long-running operations)
- [ ] **Dry-run mode** (for destructive operations)
- [ ] **Help flag** (`--help` support)
- [ ] **Logging** (structured output with timestamps)
- [ ] **Type safety** (TypeScript with proper types)

### Optional

- [ ] **Unit tests** (for complex logic)
- [ ] **Integration tests** (for end-to-end workflows)
- [ ] **Monitoring/metrics** (for production scripts)
- [ ] **Rollback capability** (for data modifications)

## Step-by-Step Guide

### Step 1: Choose the Right Category

Determine which category best fits your script's purpose:

| Category | Purpose | Examples |
|----------|---------|----------|
| `admin/` | Administrative operations | User management, DB inspection |
| `ai/` | AI/ML operations | Model testing, inference |
| `aws/` | AWS/cloud operations | Lambda deployment, IAM |
| `ci/` | CI/CD automation | Bundle size checks, audits |
| `content/` | Content management | RSS parsing, metadata enrichment |
| `data/` | Data migration/seeding | Import/export, transformations |
| `db/` | Database operations | Backups, indexing, migrations |
| `deployment/` | Deployment automation | Verification, bootstrapping |
| `development/` | Development utilities | Icon audits, link checking |
| `maintenance/` | System maintenance | Cleanup, validation |
| `policy/` | Policy enforcement | Route guards, compliance |
| `redis/` | Redis operations | Start/stop, monitoring |
| `security/` | Security auditing | Secret scanning, vulnerability checks |
| `testing/` | Test automation | Flaky test detection, analysis |

**Pro tip:** If your script doesn't fit any category, it may be too general. Consider breaking it into focused scripts or creating a new category.

### Step 2: Name Your Script

Follow these naming conventions:

**Pattern:** `verb-noun.ext`

**Good Examples:**
- `backup-mongodb.ts` (verb: backup, noun: mongodb)
- `test-prompts.ts` (verb: test, noun: prompts)
- `validate-schema.js` (verb: validate, noun: schema)
- `sync-ai-models.ts` (verb: sync, noun: ai-models)

**Bad Examples:**
- `script1.ts` (not descriptive)
- `databaseBackup.ts` (camelCase instead of kebab-case)
- `test.ts` (too generic)
- `mongodb.ts` (missing verb)

### Step 3: Use the Template

Start with the provided template to ensure consistency:

```bash
# TypeScript template
cp scripts/templates/script-template.ts scripts/category/my-script.ts

# Or create manually with this structure:
```

See [scripts/templates/script-template.ts](/home/user/Engify-AI-App/scripts/templates/script-template.ts) for the complete template.

### Step 4: Add Documentation Header

Every script MUST have a documentation header:

```typescript
#!/usr/bin/env tsx
/**
 * [Script Name]
 *
 * [Brief description of what this script does - 1-2 sentences]
 *
 * Usage:
 *   tsx scripts/category/script-name.ts [options]
 *   pnpm script:alias [options]
 *
 * Options:
 *   --option1 <value>    Description of option1
 *   --option2            Description of option2
 *   --help               Show this help message
 *
 * Examples:
 *   # Example 1: Basic usage
 *   tsx scripts/category/script-name.ts
 *
 *   # Example 2: With options
 *   tsx scripts/category/script-name.ts --option1 value
 *
 * Dependencies:
 *   - MongoDB connection (MONGODB_URI)
 *   - API keys: OPENAI_API_KEY, ANTHROPIC_API_KEY
 *
 * Exit Codes:
 *   0 - Success
 *   1 - General error
 *   2 - Invalid arguments
 */
```

### Step 5: Implement Core Logic

Follow these patterns:

#### Environment Variable Validation

```typescript
import { config } from 'dotenv';
config({ path: '.env.local' });

function validateEnvironment(): void {
  const required = ['MONGODB_URI', 'API_KEY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please set them in .env.local');
    process.exit(1);
  }
}
```

#### CLI Argument Parsing

```typescript
interface ScriptOptions {
  verbose: boolean;
  dryRun: boolean;
  help: boolean;
  collection?: string;
}

function parseArguments(): ScriptOptions {
  const args = process.argv.slice(2);

  return {
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help') || args.includes('-h'),
    collection: args.find(arg => !arg.startsWith('--')),
  };
}
```

#### Error Handling

```typescript
async function main() {
  try {
    validateEnvironment();
    const options = parseArguments();

    if (options.help) {
      showHelp();
      process.exit(0);
    }

    // Your script logic here
    console.log('✅ Script completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Script failed:', error instanceof Error ? error.message : error);

    if (options.verbose) {
      console.error('Stack trace:', error);
    }

    process.exit(1);
  }
}

main();
```

#### Progress Reporting

```typescript
async function processItems(items: any[]) {
  const total = items.length;
  console.log(`Processing ${total} items...`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const progress = `[${i + 1}/${total}]`;

    console.log(`${progress} Processing: ${item.name}`);
    await processItem(item);
  }

  console.log('✅ All items processed');
}
```

#### Database Operations

```typescript
import { MongoClient } from 'mongodb';

async function withDatabase<T>(
  callback: (db: any) => Promise<T>
): Promise<T> {
  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    return await callback(db);

  } finally {
    await client.close();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Usage
await withDatabase(async (db) => {
  const collection = db.collection('prompts');
  const count = await collection.countDocuments();
  console.log(`Found ${count} documents`);
});
```

### Step 6: Add NPM Script Alias

For frequently used scripts, add an npm alias in `package.json`:

```json
{
  "scripts": {
    "category:action": "tsx scripts/category/script-name.ts",
    "category:action:verbose": "tsx scripts/category/script-name.ts --verbose"
  }
}
```

**Naming convention for aliases:**
- `category:action` - Main command
- `category:action:flag` - With specific flag
- Use descriptive names that indicate purpose

**Examples:**
- `admin:stats` - Admin statistics
- `backup:db` - Database backup
- `test:prompts` - Test prompts
- `redis:start` - Start Redis

### Step 7: Update Documentation

Add your script to `scripts/README.md` in the appropriate category:

```markdown
#### `my-script.ts`
- **Purpose:** Brief one-line description
- **Usage:**
  ```bash
  tsx scripts/category/my-script.ts [options]
  pnpm category:action
  ```
- **Features:**
  - Feature 1
  - Feature 2
  - Feature 3
- **Parameters:**
  - `--option1` - Description
  - `--option2` - Description
- **Dependencies:** MongoDB connection, API keys
```

### Step 8: Test Your Script

#### Local Testing

```bash
# 1. Test with dry-run (if supported)
tsx scripts/category/my-script.ts --dry-run

# 2. Test with verbose output
tsx scripts/category/my-script.ts --verbose

# 3. Test error handling
tsx scripts/category/my-script.ts --invalid-option

# 4. Test help flag
tsx scripts/category/my-script.ts --help

# 5. Test via npm alias
pnpm category:action
```

#### Type Checking

```bash
# Check TypeScript types
pnpm type-check:scripts

# Or check individual script
npx tsc --noEmit scripts/category/my-script.ts
```

#### Integration Testing

```bash
# Test in clean environment
docker run --rm -it -v $(pwd):/app node:18 bash
cd /app
pnpm install
tsx scripts/category/my-script.ts
```

## Script Standards

### Code Style

**TypeScript:**
- Use strict mode (`"strict": true` in tsconfig)
- Define interfaces for all complex types
- Use descriptive variable names
- Add JSDoc comments for functions
- Prefer `async/await` over callbacks

**Shell Scripts:**
- Use `set -e` to exit on errors
- Quote all variables: `"$VARIABLE"`
- Use `readonly` for constants
- Add functions for reusable logic
- Use meaningful function names

### Output Format

**Use consistent emoji indicators:**
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warning messages
- 📊 Statistics/reports
- 🔍 Analysis/inspection
- 🔄 Processing/loading
- 📝 Information
- 💡 Tips/suggestions

**Example:**
```typescript
console.log('🔍 Scanning codebase...');
console.log('📊 Found 42 files');
console.log('✅ All checks passed');
console.log('⚠️ 3 warnings found');
console.log('💡 Tip: Use --verbose for more details');
```

### Exit Codes

Use standard exit codes:
- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Environment not configured
- `4` - Dependency not found
- `5` - Operation failed (e.g., backup)

### Logging

**Structured logging for production scripts:**

```typescript
function log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta,
  };

  console.log(JSON.stringify(logEntry));
}

// Usage
log('info', 'Processing started', { itemCount: 100 });
log('error', 'Operation failed', { error: 'Connection timeout' });
```

### Security

**Never:**
- Log sensitive data (API keys, passwords, tokens)
- Commit secrets to git
- Use hardcoded credentials
- Trust user input without validation

**Always:**
- Validate all inputs
- Use environment variables for secrets
- Sanitize file paths
- Implement rate limiting for API calls

## Examples

### Example 1: Simple Database Query Script

```typescript
#!/usr/bin/env tsx
/**
 * Count Documents Script
 *
 * Counts documents in a MongoDB collection
 *
 * Usage:
 *   tsx scripts/db/count-documents.ts <collection>
 *   pnpm db:count <collection>
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

async function main() {
  const collection = process.argv[2];

  if (!collection) {
    console.error('❌ Usage: tsx scripts/db/count-documents.ts <collection>');
    process.exit(2);
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment');
    process.exit(3);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const count = await db.collection(collection).countDocuments();

    console.log(`📊 Collection "${collection}": ${count} documents`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
```

### Example 2: Script with Options

```typescript
#!/usr/bin/env tsx
/**
 * Batch Processor Script
 *
 * Processes items in batches with configurable options
 */

interface Options {
  batchSize: number;
  verbose: boolean;
  dryRun: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);

  return {
    batchSize: parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] ?? '100'),
    verbose: args.includes('--verbose'),
    dryRun: args.includes('--dry-run'),
  };
}

async function processBatch(items: any[], options: Options) {
  if (options.dryRun) {
    console.log('🔍 [DRY RUN] Would process:', items.length, 'items');
    return;
  }

  if (options.verbose) {
    console.log(`🔄 Processing batch of ${items.length} items...`);
  }

  // Process items
  for (const item of items) {
    await processItem(item);
  }
}

async function main() {
  const options = parseArgs();
  const items = await fetchItems();

  for (let i = 0; i < items.length; i += options.batchSize) {
    const batch = items.slice(i, i + options.batchSize);
    await processBatch(batch, options);
  }

  console.log('✅ Complete!');
}

main();
```

### Example 3: Shell Script with Functions

```bash
#!/bin/bash

# Redis Health Check Script
# Checks Redis connection and reports status

set -e

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_redis() {
    if redis-cli ping &> /dev/null; then
        print_success "Redis is running"
        return 0
    else
        print_error "Redis is not running"
        return 1
    fi
}

# Main
main() {
    echo "🔍 Checking Redis health..."

    if check_redis; then
        echo "📊 Redis info:"
        redis-cli info | grep -E '(version|used_memory_human|connected_clients)'
        exit 0
    else
        print_error "Redis health check failed"
        exit 1
    fi
}

main "$@"
```

## Testing Scripts

### Unit Testing (Optional)

For complex logic, consider adding unit tests:

```typescript
// scripts/db/__tests__/backup-mongodb.test.ts
import { describe, it, expect } from 'vitest';
import { validateBackupIntegrity } from '../backup-mongodb';

describe('backup-mongodb', () => {
  it('should validate backup integrity', () => {
    const backup = { collections: [], totalDocs: 0 };
    const result = validateBackupIntegrity(backup);
    expect(result).toBe(true);
  });
});
```

### Integration Testing

Test scripts in CI/CD:

```yaml
# .github/workflows/test-scripts.yml
name: Test Scripts
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Test backup script
        run: |
          pnpm install
          tsx scripts/db/backup-mongodb.ts --dry-run
```

## Common Pitfalls

### 1. Not Validating Environment

**Bad:**
```typescript
const uri = process.env.MONGODB_URI; // Could be undefined!
const client = new MongoClient(uri);
```

**Good:**
```typescript
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not set');
  process.exit(1);
}
const client = new MongoClient(process.env.MONGODB_URI);
```

### 2. Poor Error Messages

**Bad:**
```typescript
} catch (error) {
  console.log('Error'); // Not helpful!
}
```

**Good:**
```typescript
} catch (error) {
  console.error('❌ Failed to backup database:', error.message);
  console.error('💡 Check MongoDB connection and try again');
  process.exit(1);
}
```

### 3. No Progress Indication

**Bad:**
```typescript
for (const item of items) {
  await process(item); // Silent processing
}
```

**Good:**
```typescript
console.log(`🔄 Processing ${items.length} items...`);
for (let i = 0; i < items.length; i++) {
  console.log(`[${i + 1}/${items.length}] Processing: ${items[i].name}`);
  await process(items[i]);
}
console.log('✅ Complete!');
```

### 4. Ignoring Dry-Run Mode

**Bad:**
```typescript
await deleteAllData(); // Always destructive!
```

**Good:**
```typescript
if (options.dryRun) {
  console.log('🔍 [DRY RUN] Would delete all data');
  return;
}
await deleteAllData();
console.log('✅ Data deleted');
```

### 5. Hardcoded Values

**Bad:**
```typescript
const batchSize = 100; // What if we need different sizes?
```

**Good:**
```typescript
const batchSize = parseInt(process.env.BATCH_SIZE ?? '100');
// Or from CLI args
```

## Getting Help

- **Questions:** Open a GitHub discussion
- **Bugs:** Open a GitHub issue
- **Examples:** Check existing scripts in the repository
- **Template:** Use `scripts/templates/script-template.ts`

## Review Checklist

Before submitting a PR with your script, verify:

- [ ] Script follows naming conventions
- [ ] Documentation header is complete
- [ ] Error handling is implemented
- [ ] Environment variables are validated
- [ ] Script is placed in correct category
- [ ] README.md is updated
- [ ] NPM alias is added (if needed)
- [ ] Script has been tested locally
- [ ] TypeScript types are correct (if applicable)
- [ ] No secrets are hardcoded
- [ ] Exit codes are appropriate
- [ ] Output is clear and helpful

---

**Thank you for contributing to Engify.ai scripts! Well-organized scripts make everyone's life easier.**

*Questions? See [scripts/README.md](/home/user/Engify-AI-App/scripts/README.md) or ask in GitHub discussions.*
