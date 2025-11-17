# Scripts Directory - Complete Catalog

**Professional development, testing, deployment, and maintenance scripts for Engify.ai**

This directory contains **102 utility scripts** organized into 14 categories for comprehensive automation and tooling across the entire development lifecycle.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Script Categories](#script-categories)
  - [Admin Scripts (10)](#admin-scripts)
  - [AI & ML Scripts (3)](#ai--ml-scripts)
  - [AWS & Cloud Scripts (7)](#aws--cloud-scripts)
  - [CI/CD Scripts (2)](#cicd-scripts)
  - [Content Management Scripts (11)](#content-management-scripts)
  - [Data Management Scripts (12)](#data-management-scripts)
  - [Database Scripts (9)](#database-scripts)
  - [Deployment Scripts (4)](#deployment-scripts)
  - [Development Scripts (3)](#development-scripts)
  - [Maintenance Scripts (7)](#maintenance-scripts)
  - [Policy & Security Scripts (6)](#policy--security-scripts)
  - [Redis Scripts (9)](#redis-scripts)
  - [Testing Scripts (6)](#testing-scripts)
  - [Root Level Scripts (13)](#root-level-scripts)
- [Usage Guidelines](#usage-guidelines)
- [NPM Script Aliases](#npm-script-aliases)
- [Adding New Scripts](#adding-new-scripts)
- [Troubleshooting](#troubleshooting)

## Quick Reference

### Most Common Operations

```bash
# Database
pnpm admin:stats                    # View database statistics
pnpm backup:db                      # Backup MongoDB
pnpm db:seed                        # Seed database

# Testing
pnpm test:prompts                   # Test AI prompts
pnpm ci:flaky                       # Detect flaky tests
pnpm test:smoke                     # Smoke tests

# Redis
pnpm redis:start                    # Start local Redis
pnpm redis:health                   # Check Redis health
pnpm redis:monitor                  # Monitor Redis activity

# Content
pnpm content:rss                    # Fetch RSS feeds
pnpm content:enrich                 # Enrich metadata
pnpm admin:review-prompts          # Review prompts

# Auditing
pnpm audit:eod                      # End of day audit
pnpm audit:icons                    # Audit icon usage
pnpm ci:bundle                      # Check bundle size
```

---

## Script Categories

### Admin Scripts

**Location:** `/home/user/Engify-AI-App/scripts/admin/`
**Count:** 10 scripts
**Purpose:** Administrative operations, user management, and database inspection

#### `audit-prompt-quality.ts`
- **Purpose:** Audit the quality of prompts in the database
- **Usage:** `tsx scripts/admin/audit-prompt-quality.ts`
- **Features:**
  - Validates prompt structure and completeness
  - Checks for AI-generated content
  - Generates quality reports
  - Identifies prompts needing improvement
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `check-beta-requests.js`
- **Purpose:** Check and manage beta access requests
- **Usage:** `node scripts/admin/check-beta-requests.js`
- **Features:**
  - Lists pending beta requests
  - Validates request data
  - Exports request summaries
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `check-db-direct.js`
- **Purpose:** Direct database connection testing
- **Usage:** `node scripts/admin/check-db-direct.js`
- **Features:**
  - Tests MongoDB connection
  - Validates credentials
  - Reports connection status
- **Parameters:** None
- **Dependencies:** MongoDB URI in environment

#### `check-user.ts`
- **Purpose:** Check user account details and status
- **Usage:** `tsx scripts/admin/check-user.ts <email>`
- **Features:**
  - Retrieves user information
  - Shows account status
  - Displays user activity
- **Parameters:**
  - `email` - User email address
- **Dependencies:** MongoDB connection

#### `create-user-gamification.ts`
- **Purpose:** Initialize gamification features for users
- **Usage:** `tsx scripts/admin/create-user-gamification.ts`
- **Features:**
  - Sets up user achievement system
  - Initializes progress tracking
  - Creates gamification records
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `db-stats.ts`
- **Purpose:** Unified database statistics tool (DRY replacement for counting scripts)
- **Usage:**
  ```bash
  pnpm admin:stats                    # All collections
  pnpm admin:stats prompts            # Specific collection
  pnpm admin:stats prompts --details  # With detailed breakdown
  pnpm admin:stats --duplicates       # Check for duplicates
  ```
- **Features:**
  - Document counts per collection
  - Collection-specific breakdowns (by category, type, role)
  - Duplicate detection
  - Sample document preview
  - AI-generated content detection
- **Parameters:**
  - `[collection]` - Optional collection name
  - `--details` - Show detailed breakdown
  - `--duplicates` - Check for duplicate records
- **Dependencies:** MongoDB connection
- **Collections:** prompts, patterns, users, learning_content, web_content, affiliate_config, partnership_outreach, audit_logs, pathways

#### `engify-admin.ts`
- **Purpose:** Main administrative CLI tool
- **Usage:** `tsx scripts/admin/engify-admin.ts [command]`
- **Features:**
  - Comprehensive admin operations
  - User management
  - Content moderation
  - System configuration
- **Parameters:** Various subcommands
- **Dependencies:** Full environment setup

#### `extract-case-studies-examples-text.ts`
- **Purpose:** Extract text from case studies and examples
- **Usage:** `tsx scripts/admin/extract-case-studies-examples-text.ts`
- **Features:**
  - Parses case study content
  - Extracts example code
  - Formats for database storage
- **Parameters:** None
- **Dependencies:** File system access, MongoDB

#### `review-prompts.ts`
- **Purpose:** Review and validate prompt quality
- **Usage:** `tsx scripts/admin/review-prompts.ts` or `pnpm admin:review-prompts`
- **Features:**
  - Quality scoring
  - Completeness validation
  - Improvement suggestions
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `verify-text-indexes.ts`
- **Purpose:** Verify MongoDB text search indexes
- **Usage:** `tsx scripts/admin/verify-text-indexes.ts`
- **Features:**
  - Lists all text indexes
  - Validates index configuration
  - Tests search functionality
- **Parameters:** None
- **Dependencies:** MongoDB connection

---

### AI & ML Scripts

**Location:** `/home/user/Engify-AI-App/scripts/ai/`
**Count:** 3 scripts
**Purpose:** AI model testing, guardrails enforcement, and pre-deployment checks

#### `enforce-guardrails.ts`
- **Purpose:** Enforce AI safety guardrails
- **Usage:** `tsx scripts/ai/enforce-guardrails.ts`
- **Features:**
  - Validates AI responses against safety rules
  - Blocks inappropriate content
  - Logs violations
- **Parameters:** None
- **Dependencies:** AI provider APIs

#### `pre-change-check.sh`
- **Purpose:** Pre-deployment AI system check
- **Usage:** `./scripts/ai/pre-change-check.sh`
- **Features:**
  - Tests AI provider connectivity
  - Validates API keys
  - Checks model availability
- **Parameters:** None
- **Dependencies:** Environment variables for AI providers

#### `replicate-smoke.ts`
- **Purpose:** Smoke test for Replicate AI integration
- **Usage:** `tsx scripts/ai/replicate-smoke.ts` or `pnpm replicate:smoke`
- **Features:**
  - Tests Replicate API connection
  - Validates model access
  - Runs basic inference test
- **Parameters:** None
- **Dependencies:** REPLICATE_API_KEY

---

### AWS & Cloud Scripts

**Location:** `/home/user/Engify-AI-App/scripts/aws/`
**Count:** 7 scripts
**Purpose:** AWS deployment, Lambda management, and cloud infrastructure

#### `assume-role.sh`
- **Purpose:** Assume AWS IAM role for deployments
- **Usage:** `./scripts/aws/assume-role.sh <role-arn>`
- **Features:**
  - Assumes specified IAM role
  - Sets temporary credentials
  - Exports environment variables
- **Parameters:**
  - `role-arn` - ARN of role to assume
- **Dependencies:** AWS CLI

#### `deploy-multi-agent-lambda.sh`
- **Purpose:** Deploy multi-agent Lambda function
- **Usage:** `./scripts/aws/deploy-multi-agent-lambda.sh`
- **Features:**
  - Packages Lambda code
  - Uploads to AWS
  - Updates function configuration
- **Parameters:** None
- **Dependencies:** AWS CLI, Lambda function code

#### `deploy-python-backend.sh`
- **Purpose:** Deploy Python backend services
- **Usage:** `./scripts/aws/deploy-python-backend.sh`
- **Features:**
  - Builds Python dependencies
  - Creates deployment package
  - Deploys to AWS
- **Parameters:** None
- **Dependencies:** Python, AWS CLI

#### `login.sh`
- **Purpose:** AWS CLI login helper
- **Usage:** `./scripts/aws/login.sh`
- **Features:**
  - Configures AWS credentials
  - Sets up profiles
  - Validates access
- **Parameters:** None
- **Dependencies:** AWS CLI

#### `set-lambda-env.sh`
- **Purpose:** Set Lambda environment variables
- **Usage:** `./scripts/aws/set-lambda-env.sh <function-name>`
- **Features:**
  - Updates Lambda environment
  - Loads from .env files
  - Validates configuration
- **Parameters:**
  - `function-name` - Name of Lambda function
- **Dependencies:** AWS CLI

#### `validate-aws-config.sh`
- **Purpose:** Validate AWS configuration and credentials
- **Usage:** `./scripts/aws/validate-aws-config.sh`
- **Features:**
  - Checks AWS CLI installation
  - Validates credentials (ACCESS_KEY_ID, SECRET_ACCESS_KEY)
  - Tests account connectivity
  - Verifies required environment variables
  - Color-coded output (✅ success, ⚠️ warning, ❌ error)
- **Parameters:** None
- **Dependencies:** AWS CLI (optional), environment variables
- **Example Output:**
  ```
  ✅ AWS CLI installed
  ✅ AWS_ACCESS_KEY_ID set
  ✅ AWS credentials configured
     Account: 123456789012
     User/Role: arn:aws:iam::123456789012:user/admin
  ```

#### `whoami.sh`
- **Purpose:** Display current AWS identity
- **Usage:** `./scripts/aws/whoami.sh`
- **Features:**
  - Shows current AWS user/role
  - Displays account ID
  - Lists active permissions
- **Parameters:** None
- **Dependencies:** AWS CLI

---

### CI/CD Scripts

**Location:** `/home/user/Engify-AI-App/scripts/ci/`
**Count:** 2 scripts
**Purpose:** Continuous integration checks and automation

#### `check-bundle-size.ts`
- **Purpose:** Check and enforce bundle size limits
- **Usage:** `tsx scripts/ci/check-bundle-size.ts` or `pnpm ci:bundle`
- **Features:**
  - Measures bundle sizes
  - Compares against limits
  - Fails CI if exceeded
  - Generates size reports
- **Parameters:** None
- **Dependencies:** Build artifacts

#### `end-of-day-audit.ts`
- **Purpose:** Comprehensive end-of-day system audit
- **Usage:**
  ```bash
  pnpm audit:eod                  # Standard audit
  pnpm audit:eod:strict           # Strict mode (fail on warnings)
  pnpm audit:eod:json             # JSON output
  ```
- **Features:**
  - Code quality checks
  - Security scans
  - Dependency audits
  - Test coverage verification
  - Documentation completeness
  - Environment validation
- **Parameters:**
  - `--strict` - Fail on warnings
  - `--json` - Output as JSON
- **Dependencies:** Full development environment

---

### Content Management Scripts

**Location:** `/home/user/Engify-AI-App/scripts/content/`
**Count:** 11 scripts
**Purpose:** Content ingestion, enrichment, and database operations

#### `audit-database-content.ts`
- **Purpose:** Audit content quality in database
- **Usage:** `tsx scripts/content/audit-database-content.ts`
- **Features:**
  - Validates content structure
  - Checks for missing fields
  - Reports data quality issues
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `audit-prompts-patterns.ts`
- **Purpose:** Audit prompts and patterns content
- **Usage:**
  ```bash
  pnpm content:audit-prompts      # Audit prompts only
  pnpm content:audit-patterns     # Audit patterns only
  pnpm content:audit-both         # Audit both
  ```
- **Features:**
  - Validates prompt structure
  - Checks pattern completeness
  - Identifies quality issues
- **Parameters:**
  - `--type=prompts|patterns|both`
- **Dependencies:** MongoDB connection

#### `link-prompts-to-patterns.ts`
- **Purpose:** Create relationships between prompts and patterns
- **Usage:** `tsx scripts/content/link-prompts-to-patterns.ts`
- **Features:**
  - Analyzes prompt content
  - Matches to patterns
  - Creates database links
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `list-collections.ts`
- **Purpose:** List all MongoDB collections
- **Usage:** `tsx scripts/content/list-collections.ts`
- **Features:**
  - Shows collection names
  - Displays document counts
  - Lists indexes
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `list-gemini-models.ts`
- **Purpose:** List available Gemini AI models
- **Usage:** `tsx scripts/content/list-gemini-models.ts`
- **Features:**
  - Fetches model list from API
  - Shows model capabilities
  - Displays pricing info
- **Parameters:** None
- **Dependencies:** GEMINI_API_KEY

#### `metadata-enrich.ts`
- **Purpose:** Enrich content with metadata
- **Usage:** `tsx scripts/content/metadata-enrich.ts` or `pnpm content:enrich`
- **Features:**
  - Adds SEO metadata
  - Extracts keywords
  - Generates descriptions
- **Parameters:** None
- **Dependencies:** Content in database

#### `rss-fetch.ts`
- **Purpose:** Fetch and parse RSS/Atom feeds
- **Usage:**
  ```bash
  tsx scripts/content/rss-fetch.ts https://example.com/feed.xml
  pnpm content:rss
  ```
- **Features:**
  - Parses RSS and Atom feeds
  - Outputs NDJSON format
  - Extracts: title, url, publishedAt, source
  - Custom user-agent
- **Parameters:**
  - URL as CLI argument or RSS_URL environment variable
- **Dependencies:** Network access
- **Output:** NDJSON to stdout

#### `save-to-mongo.ts`
- **Purpose:** Save content to MongoDB
- **Usage:** `tsx scripts/content/save-to-mongo.ts` or `pnpm content:save`
- **Features:**
  - Bulk import to MongoDB
  - Validates before saving
  - Handles duplicates
- **Parameters:** None
- **Dependencies:** MongoDB connection, input data

#### `schedule.ts`
- **Purpose:** Schedule content operations
- **Usage:** `tsx scripts/content/schedule.ts` or `pnpm content:schedule`
- **Features:**
  - Cron-based scheduling
  - Content refresh automation
  - Feed polling
- **Parameters:** None
- **Dependencies:** Cron, MongoDB

#### `setup-test-environment.sh`
- **Purpose:** Set up test environment for content scripts
- **Usage:** `./scripts/content/setup-test-environment.sh`
- **Features:**
  - Creates test database
  - Seeds test data
  - Configures test environment
- **Parameters:** None
- **Dependencies:** MongoDB, test fixtures

#### `validate-environment.ts`
- **Purpose:** Validate environment configuration for content scripts
- **Usage:** `tsx scripts/content/validate-environment.ts`
- **Features:**
  - Checks required environment variables
  - Validates API keys
  - Tests database connection
- **Parameters:** None
- **Dependencies:** Environment variables

---

### Data Management Scripts

**Location:** `/home/user/Engify-AI-App/scripts/data/`
**Count:** 12 scripts
**Purpose:** Data migration, seeding, parsing, and transformation

#### `enrich-workflow-citations.ts`
- **Purpose:** Add citations to workflow content
- **Usage:** `tsx scripts/data/enrich-workflow-citations.ts`
- **Features:**
  - Extracts citations from content
  - Adds reference links
  - Validates citation format
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `extract-pain-points.ts`
- **Purpose:** Extract pain points from user feedback
- **Usage:** `tsx scripts/data/extract-pain-points.ts`
- **Features:**
  - Parses user feedback
  - Categorizes pain points
  - Generates insights
- **Parameters:** None
- **Dependencies:** MongoDB connection, feedback data

#### `import-content-bulk.ts`
- **Purpose:** Bulk import content from files
- **Usage:** `tsx scripts/data/import-content-bulk.ts`
- **Features:**
  - Imports from CSV/JSON
  - Validates data structure
  - Batch processing
  - Progress reporting
- **Parameters:** None
- **Dependencies:** MongoDB connection, input files

#### `import-external-resources.ts`
- **Purpose:** Import external learning resources
- **Usage:** `tsx scripts/data/import-external-resources.ts`
- **Features:**
  - Fetches from external APIs
  - Normalizes data format
  - Stores in database
- **Parameters:** None
- **Dependencies:** MongoDB connection, API keys

#### `merge-guardrails-into-workflows.ts`
- **Purpose:** Merge guardrails configuration into workflows
- **Usage:** `tsx scripts/data/merge-guardrails-into-workflows.ts`
- **Features:**
  - Combines guardrails with workflows
  - Updates workflow definitions
  - Validates merged data
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `migrate-learning-resources.ts`
- **Purpose:** Migrate learning resources between formats
- **Usage:** `tsx scripts/data/migrate-learning-resources.ts`
- **Features:**
  - Converts data formats
  - Preserves metadata
  - Handles version migrations
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `parse-guardrails-to-json.ts`
- **Purpose:** Parse guardrails from source to JSON
- **Usage:** `tsx scripts/data/parse-guardrails-to-json.ts`
- **Features:**
  - Parses guardrails definitions
  - Validates structure
  - Outputs JSON format
- **Parameters:** None
- **Dependencies:** Source files

#### `parse-recommendations-11-23.ts`
- **Purpose:** Parse recommendations (items 11-23)
- **Usage:** `tsx scripts/data/parse-recommendations-11-23.ts`
- **Features:**
  - Parses specific recommendation set
  - Validates format
  - Prepares for database
- **Parameters:** None
- **Dependencies:** Source data

#### `seed-api-keys.ts`
- **Purpose:** Seed test API keys
- **Usage:** `tsx scripts/data/seed-api-keys.ts`
- **Features:**
  - Creates test API keys
  - Sets up key permissions
  - Configures rate limits
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `seed-prompts-to-db.ts`
- **Purpose:** Seed prompt library to database
- **Usage:** `tsx scripts/data/seed-prompts-to-db.ts` or `pnpm seed:prompts`
- **Features:**
  - Imports prompts from TypeScript files
  - Validates structure
  - Handles duplicates
  - Updates existing prompts
- **Parameters:** None
- **Dependencies:** MongoDB connection, prompt source files

#### `seed-workflows-to-db.ts`
- **Purpose:** Seed workflow definitions to database
- **Usage:** `tsx scripts/data/seed-workflows-to-db.ts`
- **Features:**
  - Imports workflow definitions
  - Validates workflow structure
  - Creates workflow records
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `update-recommendations-1-10.ts`
- **Purpose:** Update recommendations (items 1-10)
- **Usage:** `tsx scripts/data/update-recommendations-1-10.ts`
- **Features:**
  - Updates specific recommendations
  - Validates changes
  - Preserves existing data
- **Parameters:** None
- **Dependencies:** MongoDB connection

---

### Database Scripts

**Location:** `/home/user/Engify-AI-App/scripts/db/`
**Count:** 9 scripts
**Purpose:** Database operations, backups, indexing, and model synchronization

#### `backup-mongodb.ts`
- **Purpose:** Full MongoDB database backup with verification
- **Usage:**
  ```bash
  tsx scripts/db/backup-mongodb.ts
  pnpm backup:db
  # Via cron: 0 * * * * cd /path/to/repo && pnpm exec tsx scripts/db/backup-mongodb.ts
  ```
- **Features:**
  - Backs up all collections to timestamped JSON files
  - Verifies backup integrity
  - Auto-cleanup (keeps last 24 backups)
  - Generates backup report
  - Document count validation
  - File size reporting
- **Parameters:** None
- **Dependencies:** MongoDB connection
- **Output Directory:** `backups/`
- **Retention:** Last 24 backups
- **Exit Codes:** 0 (success), 1 (failure)

#### `create-prompt-indexes.ts`
- **Purpose:** Create indexes for prompt collection
- **Usage:** `tsx scripts/db/create-prompt-indexes.ts`
- **Features:**
  - Creates text search indexes
  - Sets up compound indexes
  - Optimizes query performance
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `create-revision-indexes.ts`
- **Purpose:** Create indexes for revision tracking
- **Usage:** `tsx scripts/db/create-revision-indexes.ts` or `pnpm db:create-revision-indexes`
- **Features:**
  - Creates revision history indexes
  - Optimizes version queries
  - Enables efficient lookups
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `seed-ai-tools.ts`
- **Purpose:** Seed AI tools catalog
- **Usage:** `tsx scripts/db/seed-ai-tools.ts`
- **Features:**
  - Imports AI tools data
  - Updates tool information
  - Validates tool structure
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `setup-backup-cron.sh`
- **Purpose:** Set up automated database backup cron job
- **Usage:** `./scripts/db/setup-backup-cron.sh`
- **Features:**
  - Installs cron job
  - Configures schedule
  - Sets up notifications
- **Parameters:** None
- **Dependencies:** Cron, MongoDB backup script

#### `sync-ai-models-from-config.ts`
- **Purpose:** Sync AI models from configuration file
- **Usage:** `tsx scripts/db/sync-ai-models-from-config.ts`
- **Features:**
  - Reads model config
  - Updates database
  - Validates model data
- **Parameters:** None
- **Dependencies:** MongoDB connection, config file

#### `sync-ai-models-from-openrouter.ts`
- **Purpose:** Sync AI models from OpenRouter API
- **Usage:** `tsx scripts/db/sync-ai-models-from-openrouter.ts`
- **Features:**
  - Fetches models from OpenRouter
  - Updates database with latest models
  - Syncs pricing and capabilities
- **Parameters:** None
- **Dependencies:** MongoDB connection, OpenRouter API

#### `sync-ai-models-latest.ts`
- **Purpose:** Sync latest AI model information
- **Usage:** `tsx scripts/db/sync-ai-models-latest.ts`
- **Features:**
  - Updates to latest model versions
  - Syncs capabilities
  - Updates pricing
- **Parameters:** None
- **Dependencies:** MongoDB connection, AI provider APIs

#### `update-ai-tools-2025-safe.ts`
- **Purpose:** Safe update of AI tools for 2025
- **Usage:** `tsx scripts/db/update-ai-tools-2025-safe.ts`
- **Features:**
  - Safely updates tool information
  - Preserves existing data
  - Validates before commit
- **Parameters:** None
- **Dependencies:** MongoDB connection

---

### Deployment Scripts

**Location:** `/home/user/Engify-AI-App/scripts/deployment/`
**Count:** 4 scripts
**Purpose:** Deployment automation, verification, and bootstrapping

#### `bootstrap.sh`
- **Purpose:** Bootstrap new deployment environment
- **Usage:** `./scripts/deployment/bootstrap.sh`
- **Features:**
  - Sets up environment
  - Installs dependencies
  - Configures services
- **Parameters:** None
- **Dependencies:** Package manager

#### `pre-push-test.sh`
- **Purpose:** Run tests before git push
- **Usage:** `./scripts/deployment/pre-push-test.sh`
- **Features:**
  - Runs critical tests
  - Validates code quality
  - Checks for breaking changes
- **Parameters:** None
- **Dependencies:** Test suite

#### `smoke-test.sh`
- **Purpose:** Basic smoke tests for deployment
- **Usage:** `./scripts/deployment/smoke-test.sh`
- **Features:**
  - Tests critical endpoints
  - Validates basic functionality
  - Quick deployment verification
- **Parameters:** None
- **Dependencies:** Running application

#### `verify-deployment.sh`
- **Purpose:** Comprehensive deployment verification
- **Usage:** `./scripts/deployment/verify-deployment.sh`
- **Features:**
  - Checks all services
  - Validates configurations
  - Tests integrations
  - Reports deployment status
- **Parameters:** None
- **Dependencies:** Deployed application

---

### Development Scripts

**Location:** `/home/user/Engify-AI-App/scripts/development/`
**Count:** 3 scripts
**Purpose:** Development utilities and code auditing

#### `audit-icons.ts`
- **Purpose:** Audit icon usage across application
- **Usage:** `tsx scripts/development/audit-icons.ts` or `pnpm audit:icons`
- **Features:**
  - Scans components for icons
  - Identifies missing icons
  - Reports unused icons
  - Validates icon imports
- **Parameters:** None
- **Dependencies:** Source code access

#### `verify-navigation-links.ts`
- **Purpose:** Verify navigation links are valid
- **Usage:** `tsx scripts/development/verify-navigation-links.ts`
- **Features:**
  - Checks internal links
  - Validates route existence
  - Reports broken links
- **Parameters:** None
- **Dependencies:** Application code

#### `verify-source-urls.ts`
- **Purpose:** Verify source URLs in content
- **Usage:** `tsx scripts/development/verify-source-urls.ts`
- **Features:**
  - Validates external URLs
  - Checks for broken links
  - Reports URL status
- **Parameters:** None
- **Dependencies:** Network access, content database

---

### Maintenance Scripts

**Location:** `/home/user/Engify-AI-App/scripts/maintenance/`
**Count:** 7 scripts
**Purpose:** System maintenance, cleanup, and validation

#### `check-enterprise-compliance.js`
- **Purpose:** Check enterprise compliance requirements
- **Usage:** `node scripts/maintenance/check-enterprise-compliance.js`
- **Features:**
  - Validates security policies
  - Checks compliance rules
  - Generates compliance reports
- **Parameters:** None
- **Dependencies:** Configuration files

#### `check-test-framework.js`
- **Purpose:** Validate test framework configuration
- **Usage:** `node scripts/maintenance/check-test-framework.js`
- **Features:**
  - Checks test setup
  - Validates test dependencies
  - Reports configuration issues
- **Parameters:** None
- **Dependencies:** Test framework

#### `cleanup-docs.sh`
- **Purpose:** Clean up documentation files
- **Usage:** `./scripts/maintenance/cleanup-docs.sh`
- **Features:**
  - Removes old docs
  - Organizes documentation
  - Validates markdown files
- **Parameters:** None
- **Dependencies:** Documentation directory

#### `find-issues.sh`
- **Purpose:** Find common code issues
- **Usage:** `./scripts/maintenance/find-issues.sh`
- **Features:**
  - Scans for anti-patterns
  - Identifies code smells
  - Reports technical debt
- **Parameters:** None
- **Dependencies:** Source code

#### `fix-missing-icons.sh`
- **Purpose:** Fix missing icon references
- **Usage:** `./scripts/maintenance/fix-missing-icons.sh`
- **Features:**
  - Identifies missing icons
  - Suggests replacements
  - Updates icon imports
- **Parameters:** None
- **Dependencies:** Icon library

#### `smoke-test.sh`
- **Purpose:** Quick smoke test for core functionality
- **Usage:** `./scripts/maintenance/smoke-test.sh`
- **Features:**
  - Tests core features
  - Quick health check
  - Basic validation
- **Parameters:** None
- **Dependencies:** Running application

#### `validate-schema.js`
- **Purpose:** Validate data schemas
- **Usage:** `node scripts/maintenance/validate-schema.js`
- **Features:**
  - Validates Zod schemas
  - Tests data structures
  - Reports schema issues
- **Parameters:** None
- **Dependencies:** Schema definitions

---

### Policy & Security Scripts

**Location:** `/home/user/Engify-AI-App/scripts/policy/` and `/home/user/Engify-AI-App/scripts/security/`
**Count:** 6 scripts
**Purpose:** Security auditing, policy enforcement, and vulnerability scanning

#### Policy Scripts

##### `check-route-guards.ts`
- **Purpose:** Validate route protection and guards
- **Usage:** `tsx scripts/policy/check-route-guards.ts` or `pnpm policy:routes`
- **Features:**
  - Checks authentication guards
  - Validates authorization rules
  - Reports unprotected routes
- **Parameters:** None
- **Dependencies:** Route definitions

#### Security Scripts

##### `audit-git-history.sh`
- **Purpose:** Audit git history for secrets
- **Usage:** `./scripts/security/audit-git-history.sh`
- **Features:**
  - Scans commit history
  - Detects leaked secrets
  - Reports sensitive data
- **Parameters:** None
- **Dependencies:** Git repository

##### `audit-secrets.js`
- **Purpose:** Audit codebase for exposed secrets
- **Usage:** `node scripts/security/audit-secrets.js`
- **Features:**
  - Scans files for secrets
  - Detects API keys
  - Reports security issues
- **Parameters:** None
- **Dependencies:** Source code

##### `cleanup-git-history.sh`
- **Purpose:** Clean up git history (remove secrets)
- **Usage:** `./scripts/security/cleanup-git-history.sh`
- **Features:**
  - Removes secrets from history
  - Rewrites commits
  - Force pushes cleaned history
- **Parameters:** None
- **Dependencies:** Git repository
- **Warning:** Destructive operation, use with caution

##### `security-check.js`
- **Purpose:** Comprehensive security validation
- **Usage:** `node scripts/security/security-check.js`
- **Features:**
  - Scans for vulnerabilities
  - Validates security headers
  - Checks dependency security
  - Tests authentication
- **Parameters:** None
- **Dependencies:** Application code

##### `test-ai-keys.sh`
- **Purpose:** Test AI provider API keys
- **Usage:** `./scripts/security/test-ai-keys.sh`
- **Features:**
  - Validates API keys
  - Tests provider connectivity
  - Reports key status
- **Parameters:** None
- **Dependencies:** AI API keys in environment

---

### Redis Scripts

**Location:** `/home/user/Engify-AI-App/scripts/redis/`
**Count:** 9 scripts
**Purpose:** Redis management, monitoring, and testing

#### `flush.sh`
- **Purpose:** Flush Redis database
- **Usage:** `./scripts/redis/flush.sh` or `pnpm redis:flush`
- **Features:**
  - Clears all Redis data
  - Confirmation prompt
  - Reports cleared keys
- **Parameters:** None
- **Dependencies:** Redis connection
- **Warning:** Destructive operation

#### `health-check.sh`
- **Purpose:** Check Redis health status
- **Usage:** `./scripts/redis/health-check.sh` or `pnpm redis:health`
- **Features:**
  - Tests connectivity
  - Checks memory usage
  - Reports performance metrics
- **Parameters:** None
- **Dependencies:** Redis connection

#### `monitor.sh`
- **Purpose:** Monitor Redis activity in real-time
- **Usage:** `./scripts/redis/monitor.sh` or `pnpm redis:monitor`
- **Features:**
  - Live command monitoring
  - Real-time statistics
  - Activity logging
- **Parameters:** None
- **Dependencies:** Redis connection

#### `performance-test.sh`
- **Purpose:** Run Redis performance benchmarks
- **Usage:** `./scripts/redis/performance-test.sh` or `pnpm redis:performance`
- **Features:**
  - Benchmark operations
  - Test throughput
  - Measure latency
  - Generate performance reports
- **Parameters:** None
- **Dependencies:** Redis connection

#### `redis-manager.sh`
- **Purpose:** Unified Redis management interface
- **Usage:** `./scripts/redis/redis-manager.sh [command]`
- **Features:**
  - Start/stop Redis
  - Health checks
  - Data management
  - Configuration
- **Parameters:** Various subcommands
- **Dependencies:** Redis, Docker (for local)

#### `setup-upstash.sh`
- **Purpose:** Set up Upstash Redis cloud instance
- **Usage:** `./scripts/redis/setup-upstash.sh` or `pnpm redis:setup-upstash`
- **Features:**
  - Configures Upstash connection
  - Tests cloud Redis
  - Sets environment variables
- **Parameters:** None
- **Dependencies:** Upstash account, UPSTASH_REDIS_URL

#### `start-local.sh`
- **Purpose:** Start local Redis container
- **Usage:** `./scripts/redis/start-local.sh` or `pnpm redis:start`
- **Features:**
  - Starts Docker Redis container
  - Configures persistence
  - Waits for ready state
  - Color-coded status output
- **Parameters:** None
- **Dependencies:** Docker
- **Container:** `engify-redis` on port 6379
- **Configuration:**
  - Persistence: appendonly
  - Wait timeout: 30 seconds

#### `stop-local.sh`
- **Purpose:** Stop local Redis container
- **Usage:** `./scripts/redis/stop-local.sh` or `pnpm redis:stop`
- **Features:**
  - Stops Redis container
  - Preserves data
  - Clean shutdown
- **Parameters:** None
- **Dependencies:** Docker

#### `test-connection.sh`
- **Purpose:** Test Redis connection
- **Usage:** `./scripts/redis/test-connection.sh` or `pnpm redis:test`
- **Features:**
  - Validates connection
  - Tests authentication
  - Reports connection status
- **Parameters:** None
- **Dependencies:** Redis connection

---

### Testing Scripts

**Location:** `/home/user/Engify-AI-App/scripts/testing/`
**Count:** 6 scripts
**Purpose:** Test automation, analysis, and quality assurance

#### `analyze-test-results.ts`
- **Purpose:** Analyze and report test execution results
- **Usage:** `tsx scripts/testing/analyze-test-results.ts` or `pnpm analyze:tests`
- **Features:**
  - Parses test output
  - Generates coverage reports
  - Identifies failure patterns
  - Trend analysis
- **Parameters:** None
- **Dependencies:** Test results

#### `flaky-test-detector.ts`
- **Purpose:** Detect flaky tests by running suite multiple times
- **Usage:** `tsx scripts/testing/flaky-test-detector.ts` or `pnpm ci:flaky`
- **Features:**
  - Runs tests N times (default 5)
  - Tracks failure rates
  - Identifies intermittent failures
  - Reports flaky tests (>0% and <100% failure rate)
  - Fails CI if tests fail consistently (>30%)
- **Parameters:**
  - `FLAKY_TEST_RUNS` - Number of test runs (env var)
- **Dependencies:** Test suite
- **Exit Codes:** 0 (pass), 1 (consistent failures)

#### `test-adapters.ts`
- **Purpose:** Test AI provider adapter implementations
- **Usage:** `tsx scripts/testing/test-adapters.ts`
- **Features:**
  - Tests adapter interfaces
  - Validates implementations
  - Performance benchmarking
- **Parameters:** None
- **Dependencies:** AI adapters, API keys

#### `test-multi-agent-production.sh`
- **Purpose:** Test multi-agent system in production
- **Usage:** `./scripts/testing/test-multi-agent-production.sh`
- **Features:**
  - Production-like testing
  - Multi-agent coordination
  - Integration validation
- **Parameters:** None
- **Dependencies:** Multi-agent system

#### `test-prompts-batch.ts`
- **Purpose:** Batch test AI prompts across providers
- **Usage:** `tsx scripts/testing/test-prompts-batch.ts` or `pnpm test:prompts`
- **Features:**
  - Tests multiple prompts
  - Cross-provider comparison
  - Performance metrics
  - Quality scoring
- **Parameters:** None
- **Dependencies:** AI provider APIs

#### `test-prompts.ts`
- **Purpose:** Test individual AI prompts
- **Usage:** `tsx scripts/testing/test-prompts.ts`
- **Features:**
  - Single prompt testing
  - Provider comparison
  - Response validation
  - Quality assessment
- **Parameters:** Prompt ID or content
- **Dependencies:** AI provider APIs

---

### Root Level Scripts

**Location:** `/home/user/Engify-AI-App/scripts/`
**Count:** 13 scripts
**Purpose:** Core utilities, deployment, and system operations

#### `deploy-lambda.sh`
- **Purpose:** Deploy Lambda functions
- **Usage:** `./scripts/deploy-lambda.sh`
- **Features:**
  - Packages Lambda code
  - Uploads to AWS
  - Updates configuration
  - Validates deployment
- **Parameters:** None
- **Dependencies:** AWS CLI, Lambda code

#### `fix-guardrails-mitigation.ts`
- **Purpose:** Fix guardrails mitigation issues
- **Usage:** `tsx scripts/fix-guardrails-mitigation.ts`
- **Features:**
  - Repairs guardrail configurations
  - Updates mitigation strategies
  - Validates fixes
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `post-deploy-refresh-json.sh`
- **Purpose:** Refresh JSON data after deployment
- **Usage:** `./scripts/post-deploy-refresh-json.sh`
- **Features:**
  - Rebuilds JSON caches
  - Updates static data
  - Validates JSON files
- **Parameters:** None
- **Dependencies:** Deployed application

#### `restore-prompts-standalone.ts`
- **Purpose:** Standalone script to restore prompts from backup
- **Usage:** `tsx scripts/restore-prompts-standalone.ts`
- **Features:**
  - Restores prompts independently
  - No external dependencies
  - Validates restored data
- **Parameters:** Backup file path
- **Dependencies:** Backup file

#### `restore-prompts.ts`
- **Purpose:** Restore prompts from backup
- **Usage:** `tsx scripts/restore-prompts.ts`
- **Features:**
  - Restores from backup
  - Validates data
  - Preserves existing data
- **Parameters:** Backup file path
- **Dependencies:** MongoDB connection, backup file

#### `restore-user-from-backup.ts`
- **Purpose:** Restore user data from backup
- **Usage:** `tsx scripts/restore-user-from-backup.ts <email>`
- **Features:**
  - Restores user account
  - Preserves relationships
  - Validates restoration
- **Parameters:**
  - `email` - User email to restore
- **Dependencies:** MongoDB connection, backup file

#### `seed-knowledge-base.ts`
- **Purpose:** Seed knowledge base with content
- **Usage:** `tsx scripts/seed-knowledge-base.ts`
- **Features:**
  - Imports knowledge articles
  - Creates embeddings
  - Builds search index
- **Parameters:** None
- **Dependencies:** MongoDB connection, content files

#### `seed-user.ts`
- **Purpose:** Seed test user accounts
- **Usage:** `tsx scripts/seed-user.ts`
- **Features:**
  - Creates test users
  - Sets up permissions
  - Generates auth tokens
- **Parameters:** None
- **Dependencies:** MongoDB connection

#### `start-rag-service.py`
- **Purpose:** Start RAG (Retrieval Augmented Generation) service
- **Usage:** `python scripts/start-rag-service.py`
- **Features:**
  - Starts RAG backend
  - Loads vector database
  - Enables semantic search
- **Parameters:** None
- **Dependencies:** Python, vector database

#### `test-guardrails-validation.ts`
- **Purpose:** Test guardrails validation system
- **Usage:** `tsx scripts/test-guardrails-validation.ts`
- **Features:**
  - Tests guardrail rules
  - Validates enforcement
  - Reports violations
- **Parameters:** None
- **Dependencies:** Guardrails system

#### `test-lambda.sh`
- **Purpose:** Test Lambda function locally
- **Usage:** `./scripts/test-lambda.sh`
- **Features:**
  - Local Lambda testing
  - Simulates AWS environment
  - Validates responses
- **Parameters:** None
- **Dependencies:** Lambda code, test events

#### `test-redis-rate-limit.ts`
- **Purpose:** Test Redis-based rate limiting
- **Usage:** `tsx scripts/test-redis-rate-limit.ts`
- **Features:**
  - Tests rate limit logic
  - Validates Redis operations
  - Reports throttling behavior
- **Parameters:** None
- **Dependencies:** Redis connection

#### `test-upstash-redis.ts`
- **Purpose:** Test Upstash Redis connection
- **Usage:** `tsx scripts/test-upstash-redis.ts`
- **Features:**
  - Tests cloud Redis
  - Validates operations
  - Measures latency
- **Parameters:** None
- **Dependencies:** UPSTASH_REDIS_URL

---

## Usage Guidelines

### Running Scripts

```bash
# TypeScript scripts (recommended)
tsx scripts/category/script-name.ts

# JavaScript scripts
node scripts/category/script-name.js

# Shell scripts
./scripts/category/script-name.sh

# Python scripts
python scripts/script-name.py

# Via npm scripts (preferred when available)
pnpm <script-alias>
```

### Script Execution Permissions

```bash
# Make shell script executable
chmod +x scripts/category/script-name.sh

# Make all scripts in directory executable
chmod +x scripts/category/*.sh
```

### Environment Variables

Most scripts require environment variables to be set. Load them before running:

```bash
# Load environment
source .env.local

# Or use dotenv
node -r dotenv/config scripts/script-name.js
```

### Common Patterns

#### Database Connection Scripts

```typescript
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MongoClient } from 'mongodb';

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    const db = client.db();
    // Script logic here
  } finally {
    await client.close();
  }
}

main();
```

#### CLI Argument Parsing

```typescript
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose'),
  dryRun: args.includes('--dry-run'),
  collection: args.find(arg => !arg.startsWith('--'))
};
```

#### Progress Reporting

```typescript
console.log(`Processing ${total} items...`);
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  console.log(`[${i + 1}/${total}] Processing: ${item.name}`);
  // Process item
}
console.log('✅ Complete!');
```

---

## NPM Script Aliases

All commonly used scripts have npm/pnpm aliases defined in `package.json`:

### Database Operations
- `pnpm admin:stats` - Database statistics
- `pnpm backup:db` - Backup MongoDB
- `pnpm db:seed` - Seed database
- `pnpm seed:prompts` - Seed prompts only

### Testing
- `pnpm test:prompts` - Test AI prompts
- `pnpm ci:flaky` - Detect flaky tests
- `pnpm analyze:tests` - Analyze test results
- `pnpm test:smoke` - Smoke tests

### Redis Management
- `pnpm redis:start` - Start local Redis
- `pnpm redis:stop` - Stop local Redis
- `pnpm redis:health` - Redis health check
- `pnpm redis:monitor` - Monitor Redis
- `pnpm redis:test` - Test connection
- `pnpm redis:flush` - Flush database
- `pnpm redis:setup-upstash` - Setup Upstash
- `pnpm redis:performance` - Performance test

### Content Management
- `pnpm content:rss` - Fetch RSS feeds
- `pnpm content:enrich` - Enrich metadata
- `pnpm content:save` - Save to MongoDB
- `pnpm content:schedule` - Schedule operations
- `pnpm content:audit-prompts` - Audit prompts
- `pnpm content:audit-patterns` - Audit patterns
- `pnpm content:audit-both` - Audit all content

### Administration
- `pnpm admin:stats` - Database statistics
- `pnpm admin:review-prompts` - Review prompts

### CI/CD & Auditing
- `pnpm audit:eod` - End of day audit
- `pnpm audit:eod:strict` - Strict audit mode
- `pnpm audit:eod:json` - JSON output
- `pnpm audit:icons` - Audit icons
- `pnpm ci:bundle` - Check bundle size
- `pnpm policy:routes` - Check route guards

### AI & Testing
- `pnpm replicate:smoke` - Replicate smoke test

---

## Adding New Scripts

### 1. Choose the Right Category

Place your script in the appropriate directory:
- `admin/` - Administrative operations
- `ai/` - AI/ML operations
- `aws/` - AWS/cloud operations
- `ci/` - CI/CD automation
- `content/` - Content management
- `data/` - Data migration/seeding
- `db/` - Database operations
- `deployment/` - Deployment automation
- `development/` - Development utilities
- `maintenance/` - Maintenance tasks
- `policy/` - Policy enforcement
- `redis/` - Redis operations
- `security/` - Security auditing
- `testing/` - Test automation

### 2. Follow Naming Conventions

- Use `kebab-case` for filenames
- Use descriptive names: `verb-noun.ext`
- Examples: `backup-database.ts`, `test-prompts.ts`, `validate-schema.js`

### 3. Add Documentation Header

For TypeScript/JavaScript scripts:

```typescript
#!/usr/bin/env tsx
/**
 * Script Title
 *
 * Brief description of what this script does
 *
 * Usage:
 *   tsx scripts/category/script-name.ts [options]
 *   pnpm script-alias
 *
 * Options:
 *   --option1    Description
 *   --option2    Description
 *
 * Examples:
 *   tsx scripts/category/script-name.ts --option1
 *
 * Dependencies:
 *   - MongoDB connection
 *   - API keys: OPENAI_API_KEY
 */
```

For Shell scripts:

```bash
#!/bin/bash

# Script Title
# Brief description
#
# Usage: ./scripts/category/script-name.sh [options]
#
# Options:
#   -h    Show help
#   -v    Verbose mode

set -e  # Exit on error
```

### 4. Add Standard Error Handling

```typescript
async function main() {
  try {
    // Script logic
    console.log('✅ Success!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
```

### 5. Add NPM Script Alias

Edit `package.json`:

```json
{
  "scripts": {
    "category:action": "tsx scripts/category/script-name.ts"
  }
}
```

### 6. Update This README

Add your script to the appropriate category section above with:
- Script name and file
- Purpose (one line)
- Usage examples
- Features (bullet points)
- Parameters
- Dependencies

### 7. Use the Script Template

See `scripts/templates/script-template.ts` for a complete template with:
- Standard header
- CLI argument parsing
- Error handling
- Logging
- Progress reporting

---

## Troubleshooting

### Common Issues

#### 1. Permission Denied

```bash
chmod +x scripts/script-name.sh
```

#### 2. Module Not Found

```bash
pnpm install
```

#### 3. TypeScript Errors

```bash
# Check types without running
pnpm type-check:scripts

# Or compile individually
npx tsc --noEmit scripts/script-name.ts
```

#### 4. Environment Variables Missing

```bash
# Check .env.local exists
ls -la .env.local

# Load environment
source .env.local

# Or use dotenv-cli
pnpm add -D dotenv-cli
dotenv -e .env.local -- tsx scripts/script-name.ts
```

#### 5. MongoDB Connection Failed

```bash
# Check MongoDB URI
echo $MONGODB_URI

# Test connection
tsx scripts/admin/check-db-direct.js
```

#### 6. AWS Credentials Not Configured

```bash
# Validate AWS configuration
./scripts/aws/validate-aws-config.sh

# Configure AWS CLI
aws configure
```

### Debug Mode

```bash
# Enable debug logging for Node.js
DEBUG=* tsx scripts/script-name.ts

# Enable verbose mode (if script supports it)
tsx scripts/script-name.ts --verbose

# Dry run (if script supports it)
tsx scripts/script-name.ts --dry-run

# Bash debug mode
bash -x scripts/script-name.sh
```

### Getting Help

```bash
# Most scripts support --help
tsx scripts/script-name.ts --help

# View script source
cat scripts/script-name.ts

# Check npm script definition
pnpm run <script-name> --help
```

---

## Script Statistics

- **Total Scripts:** 102
- **TypeScript Scripts:** 64
- **JavaScript Scripts:** 7
- **Shell Scripts:** 30
- **Python Scripts:** 1

### By Category
- Admin: 10 scripts
- AI & ML: 3 scripts
- AWS & Cloud: 7 scripts
- CI/CD: 2 scripts
- Content: 11 scripts
- Data: 12 scripts
- Database: 9 scripts
- Deployment: 4 scripts
- Development: 3 scripts
- Maintenance: 7 scripts
- Policy & Security: 6 scripts
- Redis: 9 scripts
- Testing: 6 scripts
- Root Level: 13 scripts

---

## Best Practices

1. **Always use npm/pnpm aliases** when available
2. **Test in development** before running in production
3. **Back up data** before running destructive operations
4. **Use --dry-run** flags when available
5. **Check environment variables** before running
6. **Review script source** if unsure what it does
7. **Keep scripts DRY** - avoid duplicate functionality
8. **Document new scripts** in this README
9. **Add error handling** to all scripts
10. **Use type checking** for TypeScript scripts

---

**This comprehensive scripts catalog demonstrates professional development practices, enterprise-grade tooling, and production-ready automation suitable for serious AI applications.**

*Last Updated: 2025-11-17*
