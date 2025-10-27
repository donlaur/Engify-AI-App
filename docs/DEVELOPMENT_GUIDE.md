# Development Guide

**Purpose**: Ensure consistent, high-quality development that scales from MVP to enterprise. This guide keeps AI models, developers, and future team members aligned.

---

## 🎯 Core Principles

### 1. Think Big, Start Small
- Build MVP features quickly
- Design architecture for enterprise scale
- Document decisions for future expansion

### 2. Security & Compliance First
- Assume every feature will need SOC2 compliance
- Add audit logging from day one
- Encrypt sensitive data always

### 3. Multi-Tenant by Default
- Every collection has `organizationId`
- Every query includes `organizationId`
- Test data isolation thoroughly

### 4. Documentation-Driven
- Document decisions before coding
- Update docs with code changes
- Write for AI models and humans

### 5. Test What Matters
- Test business logic thoroughly
- Test data isolation (critical for multi-tenant)
- Test security boundaries
- E2E tests for critical user flows

---

## 📁 Project Structure

```
engify-ai/
├── docs/                           # 📚 All documentation
│   ├── strategy/                  # Strategic decisions
│   ├── implementation/            # Implementation guides
│   ├── guides/                    # Getting started
│   ├── DECISION_LOG.md           # Architecture Decision Records
│   └── DEVELOPMENT_GUIDE.md      # This file
│
├── src/                           # Source code
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/              # Auth routes (grouped)
│   │   ├── (dashboard)/         # Protected routes (grouped)
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/               # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── features/            # Feature-specific components
│   │   └── shared/              # Shared components
│   │
│   ├── lib/                      # Core libraries
│   │   ├── ai/                  # AI provider abstractions
│   │   │   ├── providers/       # Individual providers
│   │   │   ├── orchestrator.ts  # Multi-provider logic
│   │   │   └── types.ts         # Shared types
│   │   ├── db/                  # Database utilities
│   │   │   ├── mongodb.ts       # Connection
│   │   │   ├── schema.ts        # Type definitions
│   │   │   └── queries.ts       # Reusable queries
│   │   ├── auth/                # Auth utilities
│   │   ├── stripe/              # Billing utilities
│   │   └── utils/               # General utilities
│   │
│   ├── types/                    # TypeScript types
│   ├── hooks/                    # Custom React hooks
│   └── config/                   # Configuration
│
├── python/                        # Python AI services
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── rag_service.py
│   │   └── embeddings.py
│   ├── utils/
│   └── requirements.txt
│
├── tests/                         # Test suites
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
├── .husky/                        # Git hooks
│   ├── pre-commit               # Run before commit
│   └── commit-msg               # Validate commit messages
│
├── .github/                       # GitHub configuration
│   ├── workflows/               # CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md
│
├── public/                        # Static assets
├── .env.example                   # Environment template
├── .eslintrc.json                # ESLint config
├── .prettierrc                   # Prettier config
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── package.json                  # Dependencies
└── README.md                     # Project overview
```

---

## 🔧 Development Setup

### Prerequisites
```bash
# Required
- Node.js 18+
- pnpm (or npm)
- MongoDB Atlas account
- Git

# Optional (for later)
- AWS CLI
- Python 3.11+
- Docker
```

### Initial Setup
```bash
# Clone repository
git clone https://github.com/yourusername/engify-ai.git
cd engify-ai

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up Git hooks
pnpm prepare

# Run development server
pnpm dev
```

---

## 📝 Coding Standards

### TypeScript

#### Always Use Strict Mode
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Type Everything
```typescript
// ❌ Bad
const user = await getUser(id);

// ✅ Good
const user: User = await getUser(id);

// ✅ Better
const user = await getUser(id); // Type inferred from function return
```

#### Use Zod for Runtime Validation
```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  organizationId: z.string().optional(),
});

// Validate input
const result = userSchema.safeParse(input);
if (!result.success) {
  throw new Error('Invalid input');
}
```

### Multi-Tenant Queries

#### Always Include organizationId

```typescript
// ❌ CRITICAL ERROR - Data leak!
const conversations = await db.collection('conversations').find({
  userId: user._id
});

// ✅ Correct - Data isolated
const conversations = await db.collection('conversations').find({
  organizationId: user.organizationId,
  userId: user._id
});

// ✅ Best - Use helper function
const conversations = await getOrganizationConversations(
  user.organizationId,
  user._id
);
```

#### Create Helper Functions

```typescript
// src/lib/db/queries.ts

/**
 * Get conversations for a user within their organization
 * CRITICAL: Always includes organizationId for data isolation
 */
export async function getOrganizationConversations(
  organizationId: string | null,
  userId: string
) {
  const db = await getDb();
  
  return db.collection('conversations').find({
    organizationId: organizationId || null,
    userId: userId
  }).toArray();
}

/**
 * Get all users in an organization
 * CRITICAL: Only admins should call this
 */
export async function getOrganizationUsers(
  organizationId: string,
  requestingUserId: string
) {
  // Verify requesting user is admin
  const requestingUser = await getUserById(requestingUserId);
  if (!isAdmin(requestingUser)) {
    throw new Error('Unauthorized');
  }
  
  const db = await getDb();
  return db.collection('users').find({
    organizationId: organizationId
  }).toArray();
}
```

### Error Handling

#### Use Custom Error Classes

```typescript
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class DataIsolationError extends AppError {
  constructor(message = 'Data isolation violation') {
    super(message, 403, 'DATA_ISOLATION_VIOLATION');
  }
}
```

#### Handle Errors Consistently

```typescript
// API route
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError();
    }
    
    const data = await getData(session.user.id);
    return NextResponse.json(data);
    
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    // Log unexpected errors
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Audit Logging

#### Log All Important Actions

```typescript
// src/lib/audit/logger.ts

export async function logAuditEvent(
  organizationId: string | null,
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details: Record<string, any>,
  req: Request
) {
  const db = await getDb();
  
  await db.collection('audit_logs').insertOne({
    organizationId,
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    timestamp: new Date(),
    retainUntil: calculateRetentionDate(organizationId)
  });
}

// Usage
await logAuditEvent(
  user.organizationId,
  user._id,
  'conversation.created',
  'conversation',
  conversationId,
  { title: conversation.title },
  req
);
```

---

## 🧪 Testing Standards

### Unit Tests

```typescript
// tests/unit/lib/ai/orchestrator.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { AIOrchestrator } from '@/lib/ai/orchestrator';

describe('AIOrchestrator', () => {
  let orchestrator: AIOrchestrator;
  
  beforeEach(() => {
    orchestrator = new AIOrchestrator({
      gemini: 'test-key',
      openai: 'test-key'
    });
  });
  
  it('should select user preferred provider', async () => {
    const provider = orchestrator.selectProvider('gemini');
    expect(provider.name).toBe('gemini');
  });
  
  it('should fallback to available provider', async () => {
    const orchestrator = new AIOrchestrator({
      openai: 'test-key'
    });
    
    const provider = orchestrator.selectProvider('gemini');
    expect(provider.name).toBe('openai');
  });
});
```

### Integration Tests

```typescript
// tests/integration/api/conversations.test.ts

import { describe, it, expect } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import * as handler from '@/app/api/conversations/route';

describe('/api/conversations', () => {
  it('should return only user conversations', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            cookie: 'session=test-session'
          }
        });
        
        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.conversations).toBeDefined();
      }
    });
  });
  
  it('should enforce data isolation', async () => {
    // Test that user A cannot access user B's conversations
    // CRITICAL TEST for multi-tenant security
  });
});
```

### E2E Tests

```typescript
// tests/e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login and access dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
  
  test('should enforce organization data isolation', async ({ page }) => {
    // Login as user from Org A
    // Verify they cannot see Org B data
    // CRITICAL TEST for enterprise security
  });
});
```

---

## 🔒 Pre-Commit Hooks

### Setup Husky

```bash
# Install husky
pnpm add -D husky

# Initialize
pnpm exec husky init

# Add pre-commit hook
echo "pnpm lint-staged" > .husky/pre-commit

# Add commit-msg hook
echo "pnpm commitlint --edit \$1" > .husky/commit-msg
```

### Lint-Staged Configuration

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{json,md}": [
      "prettier --write"
    ],
    "src/lib/db/**/*.ts": [
      "node scripts/validate-queries.js"
    ]
  }
}
```

### Custom Query Validator

```javascript
// scripts/validate-queries.js

/**
 * Validates that all database queries include organizationId
 * CRITICAL for multi-tenant data isolation
 */

const fs = require('fs');
const path = require('path');

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for .find( without organizationId
  const findRegex = /\.find\(\{[^}]*\}\)/g;
  const matches = content.match(findRegex) || [];
  
  const violations = [];
  
  for (const match of matches) {
    if (!match.includes('organizationId')) {
      violations.push({
        file: filePath,
        code: match,
        message: 'Query missing organizationId - DATA ISOLATION VIOLATION'
      });
    }
  }
  
  return violations;
}

// Run validator
const files = process.argv.slice(2);
let hasViolations = false;

for (const file of files) {
  const violations = validateFile(file);
  
  if (violations.length > 0) {
    hasViolations = true;
    console.error(`\n❌ Data isolation violations in ${file}:`);
    violations.forEach(v => {
      console.error(`  ${v.message}`);
      console.error(`  Code: ${v.code}`);
    });
  }
}

if (hasViolations) {
  console.error('\n🚨 CRITICAL: Fix data isolation violations before committing');
  process.exit(1);
}

console.log('✅ All queries include organizationId');
```

### Commit Message Format

```bash
# .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",     # New feature
        "fix",      # Bug fix
        "docs",     # Documentation
        "style",    # Formatting
        "refactor", # Code restructuring
        "test",     # Tests
        "chore",    # Maintenance
        "security"  # Security fix
      ]
    ]
  }
}
```

**Examples**:
```bash
feat: add SSO support for enterprise customers
fix: prevent data leak in conversation queries
docs: update architecture decision for MongoDB
security: add rate limiting to auth endpoints
```

---

## 📊 Code Review Checklist

### For All PRs

- [ ] Code follows TypeScript strict mode
- [ ] All functions have JSDoc comments
- [ ] Error handling is comprehensive
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Commit messages follow convention

### For Database Changes

- [ ] All queries include `organizationId` (if applicable)
- [ ] Data isolation is tested
- [ ] Indexes are added for performance
- [ ] Migration script is included (if schema change)
- [ ] Audit logging is added for sensitive operations

### For API Routes

- [ ] Authentication is enforced
- [ ] Authorization is checked (RBAC)
- [ ] Input validation with Zod
- [ ] Rate limiting is considered
- [ ] Audit logging for important actions
- [ ] Error responses are consistent

### For Enterprise Features

- [ ] Works with multi-tenant architecture
- [ ] Admin permissions are enforced
- [ ] Audit logs are comprehensive
- [ ] Complies with SOC2 requirements
- [ ] Documentation includes compliance notes

---

## 🚀 Deployment Checklist

### Before Every Deploy

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Environment variables are set
- [ ] Database migrations are run
- [ ] Backup is created
- [ ] Rollback plan is documented

### For Production Deploys

- [ ] Staging deploy successful
- [ ] E2E tests pass on staging
- [ ] Performance testing done
- [ ] Security scan completed
- [ ] Monitoring alerts configured
- [ ] Incident response plan updated
- [ ] Changelog updated
- [ ] Team notified

---

## 📚 Documentation Standards

### Code Comments

```typescript
/**
 * Get all conversations for a user within their organization
 * 
 * SECURITY: Always includes organizationId for data isolation
 * AUDIT: Logs access to conversations
 * 
 * @param organizationId - User's organization ID (null for individual users)
 * @param userId - User ID requesting conversations
 * @returns Array of conversations
 * @throws UnauthorizedError if user not authenticated
 * @throws DataIsolationError if organizationId mismatch
 */
export async function getOrganizationConversations(
  organizationId: string | null,
  userId: string
): Promise<Conversation[]> {
  // Implementation
}
```

### README Files

Every major directory should have a README:

```markdown
# /src/lib/ai

AI provider abstractions and multi-provider orchestration.

## Architecture

We support multiple AI providers (Gemini, OpenAI, Anthropic) through a common interface. See [ADR-004](../../../docs/DECISION_LOG.md#adr-004) for rationale.

## Usage

\`\`\`typescript
import { AIOrchestrator } from '@/lib/ai/orchestrator';

const orchestrator = new AIOrchestrator(apiKeys);
const response = await orchestrator.generateResponse(messages);
\`\`\`

## Adding a New Provider

1. Create provider class implementing `AIProvider` interface
2. Add to `AIOrchestrator.providers` map
3. Add tests
4. Update documentation
```

---

## 🎓 Learning Resources

### For AI Models

When an AI model starts working on this project, it should read:
1. [DECISION_LOG.md](./DECISION_LOG.md) - Understand all architectural decisions
2. [ENTERPRISE_STRATEGY.md](./strategy/ENTERPRISE_STRATEGY.md) - Understand business context
3. [ARCHITECTURE_STRATEGY.md](./strategy/ARCHITECTURE_STRATEGY.md) - Understand technical architecture
4. This file - Understand development standards

### For Developers

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe Documentation](https://stripe.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## 🆘 Common Issues

### Data Isolation Bugs

**Symptom**: User sees data from another organization

**Cause**: Query missing `organizationId`

**Fix**:
```typescript
// ❌ Before
const data = await db.collection('conversations').find({ userId });

// ✅ After
const data = await db.collection('conversations').find({
  organizationId: user.organizationId,
  userId
});
```

### TypeScript Errors

**Symptom**: `Property 'organizationId' does not exist on type 'User'`

**Cause**: Type definition outdated

**Fix**: Update type definition in `src/types/index.ts`

### Test Failures

**Symptom**: Tests fail in CI but pass locally

**Cause**: Environment variables not set in CI

**Fix**: Add environment variables to GitHub Actions secrets

---

## 📞 Getting Help

### For AI Models
- Read [DECISION_LOG.md](./DECISION_LOG.md) first
- Check existing code for patterns
- Ask clarifying questions before implementing

### For Developers
- Check documentation first
- Search existing issues
- Ask in team Slack
- Create detailed issue with reproduction steps

---

**This guide ensures consistent, high-quality development that scales from MVP to enterprise. Follow it. Update it. Improve it.**

**Last Updated**: 2025-10-27  
**Maintainer**: Engineering Leadership
