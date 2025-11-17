# Configuration Migration Guide

This guide helps you migrate from the old `env.ts` system to the new centralized configuration system.

## Overview

The new configuration system provides:
- Better organization with domain-specific configs
- Enhanced type safety
- More comprehensive validation
- Better developer experience

## Backward Compatibility

**Good News!** The old `env.ts` is still functional and now wraps the new config system. Your existing code will continue to work without changes.

However, we recommend migrating to the new system for better organization and features.

## Migration Strategies

Choose the strategy that works best for your timeline:

### Strategy 1: Gradual Migration (Recommended)

Migrate files incrementally as you work on them:

1. Keep using `import { env } from '@/lib/env'` in existing files
2. Use `import { config } from '@/lib/config'` in new files
3. Refactor old files when you touch them

### Strategy 2: Complete Migration

Migrate everything at once (good for smaller codebases):

1. Search and replace all imports
2. Update all usages
3. Test thoroughly

### Strategy 3: Keep Old System

If the old system works for you:
- Continue using `@/lib/env`
- It's now a thin wrapper around the new config
- All validation and features still work

## Migration Examples

### 1. Simple Variable Access

**Old:**
```typescript
import { env } from '@/lib/env';

const mongoUri = env.MONGODB_URI;
const openaiKey = env.OPENAI_API_KEY;
```

**New:**
```typescript
import { config } from '@/lib/config';

const mongoUri = config.database.MONGODB_URI;
const openaiKey = config.aiProviders.OPENAI_API_KEY;
```

### 2. Environment Checks

**Old:**
```typescript
import { isProduction, isDevelopment, isTest } from '@/lib/env';

if (isProduction) {
  // Production logic
}
```

**New:**
```typescript
import { config } from '@/lib/config';

if (config.helpers.isProduction()) {
  // Production logic
}

// Or direct access
if (config.core.NODE_ENV === 'production') {
  // Production logic
}
```

### 3. Feature Checks

**Old:**
```typescript
import { hasAIProviders, hasGoogleOAuth } from '@/lib/env';

if (hasAIProviders) {
  // Use AI
}
```

**New:**
```typescript
import { config } from '@/lib/config';

// Check if any AI provider is configured
if (config.helpers.getConfiguredAIProviders().length > 0) {
  // Use AI
}

// Check specific provider
if (config.helpers.hasAIProvider('openai')) {
  // Use OpenAI
}

// OAuth
if (config.helpers.hasOAuth()) {
  // Use OAuth
}
```

### 4. Admin Settings

**Old:**
```typescript
import { adminSessionMaxAgeSeconds, isAdminMFAEnforced } from '@/lib/env';

const maxAge = adminSessionMaxAgeSeconds;
const requireMFA = isAdminMFAEnforced;
```

**New:**
```typescript
import { config } from '@/lib/config';

const maxAge = config.helpers.getAdminSessionMaxAge();
const requireMFA = config.helpers.isAdminMFARequired();

// Or direct access
const maxAgeMinutes = config.auth.ADMIN_SESSION_MAX_AGE_MINUTES;
const mfaRequired = config.auth.ADMIN_MFA_REQUIRED;
```

## Complete Mapping Reference

### Direct Variable Mapping

| Old (env.ts) | New (config) | Domain |
|--------------|--------------|---------|
| `env.NODE_ENV` | `config.core.NODE_ENV` | core |
| `env.NEXT_PUBLIC_APP_URL` | `config.core.NEXT_PUBLIC_APP_URL` | core |
| `env.MONGODB_URI` | `config.database.MONGODB_URI` | database |
| `env.NEXTAUTH_SECRET` | `config.auth.NEXTAUTH_SECRET` | auth |
| `env.NEXTAUTH_URL` | `config.auth.NEXTAUTH_URL` | auth |
| `env.GOOGLE_CLIENT_ID` | `config.auth.GOOGLE_CLIENT_ID` | auth |
| `env.GOOGLE_CLIENT_SECRET` | `config.auth.GOOGLE_CLIENT_SECRET` | auth |
| `env.OPENAI_API_KEY` | `config.aiProviders.OPENAI_API_KEY` | aiProviders |
| `env.ANTHROPIC_API_KEY` | `config.aiProviders.ANTHROPIC_API_KEY` | aiProviders |
| `env.GOOGLE_API_KEY` | `config.aiProviders.GOOGLE_API_KEY` | aiProviders |
| `env.REPLICATE_API_TOKEN` | `config.aiProviders.REPLICATE_API_TOKEN` | aiProviders |
| `env.SENDGRID_API_KEY` | `config.email.SENDGRID_API_KEY` | email |
| `env.TWILIO_ACCOUNT_SID` | `config.sms.TWILIO_ACCOUNT_SID` | sms |

### Helper Function Mapping

| Old (env.ts) | New (config.helpers) |
|--------------|----------------------|
| `isProduction` | `config.helpers.isProduction()` |
| `isDevelopment` | `config.helpers.isDevelopment()` |
| `isTest` | `config.helpers.isTest()` |
| `hasAIProviders` | `config.helpers.getConfiguredAIProviders().length > 0` |
| `hasGoogleOAuth` | `config.helpers.hasOAuth()` |
| `adminSessionMaxAgeSeconds` | `config.helpers.getAdminSessionMaxAge()` |
| `isAdminMFAEnforced` | `config.helpers.isAdminMFARequired()` |
| `hasPythonServices` | `Boolean(config.rag.RAG_API_URL)` |

## Step-by-Step Migration

### Step 1: Update Imports

Find all files importing from `@/lib/env`:

```bash
# Search for old imports
grep -r "from '@/lib/env'" src/
```

Replace:
```typescript
// Old
import { env, isProduction } from '@/lib/env';

// New
import { config } from '@/lib/config';
```

### Step 2: Update Variable Access

Replace direct env access with domain-specific access:

```typescript
// Old
const uri = env.MONGODB_URI;
const key = env.OPENAI_API_KEY;

// New
const uri = config.database.MONGODB_URI;
const key = config.aiProviders.OPENAI_API_KEY;
```

### Step 3: Update Helper Usage

Replace constant checks with helper functions:

```typescript
// Old
if (isProduction) { }

// New
if (config.helpers.isProduction()) { }
```

### Step 4: Update Type Imports

Replace Env type with specific config types:

```typescript
// Old
import type { Env } from '@/lib/env';

// New
import type { FlatConfig, CoreConfig, AuthConfig } from '@/lib/config';
```

### Step 5: Test Thoroughly

```bash
# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Try building
pnpm build
```

## Real-World Migration Examples

### Example 1: Auth Configuration File

**Before:**
```typescript
// src/lib/auth/config.ts
import { env } from '@/lib/env';

export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
};
```

**After:**
```typescript
// src/lib/auth/config.ts
import { config } from '@/lib/config';

export const authOptions = {
  secret: config.auth.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: config.auth.GOOGLE_CLIENT_ID || '',
      clientSecret: config.auth.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
};
```

### Example 2: API Route

**Before:**
```typescript
// src/app/api/ai/route.ts
import { env } from '@/lib/env';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  // ...
}
```

**After:**
```typescript
// src/app/api/ai/route.ts
import { config } from '@/lib/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: config.aiProviders.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  // ...
}
```

### Example 3: Service Class

**Before:**
```typescript
// src/lib/services/emailService.ts
import { env } from '@/lib/env';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(env.SENDGRID_API_KEY || '');

export class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    await sgMail.send({
      to,
      from: env.SENDGRID_FROM_EMAIL || '',
      subject,
      html,
    });
  }
}
```

**After:**
```typescript
// src/lib/services/emailService.ts
import { config } from '@/lib/config';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(config.email.SENDGRID_API_KEY || '');

export class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    await sgMail.send({
      to,
      from: config.email.SENDGRID_FROM_EMAIL || '',
      subject,
      html,
    });
  }
}
```

### Example 4: Environment-Specific Logic

**Before:**
```typescript
// src/lib/logger.ts
import { isProduction, isDevelopment } from '@/lib/env';

const logger = createLogger({
  level: isProduction ? 'error' : 'debug',
  format: isDevelopment ? 'pretty' : 'json',
});
```

**After:**
```typescript
// src/lib/logger.ts
import { config } from '@/lib/config';

const logger = createLogger({
  level: config.helpers.isProduction() ? 'error' : 'debug',
  format: config.helpers.isDevelopment() ? 'pretty' : 'json',
});

// Or using core config directly
const logger = createLogger({
  level: config.core.NODE_ENV === 'production' ? 'error' : 'debug',
  format: config.core.NODE_ENV === 'development' ? 'pretty' : 'json',
});
```

## Advanced Migration Patterns

### Pattern 1: Configuration Injection

**Before:**
```typescript
class AIService {
  constructor(
    private apiKey: string = env.OPENAI_API_KEY || ''
  ) {}
}
```

**After:**
```typescript
import { config } from '@/lib/config';

class AIService {
  constructor(
    private apiKey: string = config.aiProviders.OPENAI_API_KEY || ''
  ) {}
}
```

### Pattern 2: Configuration Object

**Before:**
```typescript
const dbConfig = {
  uri: env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
  },
};
```

**After:**
```typescript
import { config } from '@/lib/config';

const dbConfig = {
  uri: config.database.MONGODB_URI,
  options: {
    useNewUrlParser: true,
  },
};
```

### Pattern 3: Conditional Configuration

**Before:**
```typescript
const redisConfig = env.UPSTASH_REDIS_REST_URL
  ? {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }
  : {
      host: env.REDIS_HOST || 'localhost',
      port: parseInt(env.REDIS_PORT || '6379'),
    };
```

**After:**
```typescript
import { config } from '@/lib/config';

const redisConfig = config.cache.UPSTASH_REDIS_REST_URL
  ? {
      url: config.cache.UPSTASH_REDIS_REST_URL,
      token: config.cache.UPSTASH_REDIS_REST_TOKEN,
    }
  : {
      host: config.cache.REDIS_HOST,
      port: config.cache.REDIS_PORT ?? 6379,
    };

// Or use helper
if (config.helpers.hasRedisCache()) {
  // Redis is configured
}
```

## Common Pitfalls and Solutions

### Pitfall 1: Forgetting to Use Helpers

```typescript
// ❌ Don't do this
if (config.isProduction) { }

// ✅ Do this
if (config.helpers.isProduction()) { }
```

### Pitfall 2: Wrong Domain

```typescript
// ❌ Wrong domain
const key = config.email.OPENAI_API_KEY;

// ✅ Correct domain
const key = config.aiProviders.OPENAI_API_KEY;
```

### Pitfall 3: Using Flat Config

```typescript
// ⚠️ Works but not recommended
const key = config.flat.OPENAI_API_KEY;

// ✅ Better - use domain-specific
const key = config.aiProviders.OPENAI_API_KEY;
```

## Validation During Migration

Run these checks after migration:

### 1. Type Check
```bash
pnpm typecheck
```

### 2. Build Check
```bash
pnpm build
```

### 3. Test Suite
```bash
pnpm test
```

### 4. Search for Old Patterns
```bash
# Should return no results
grep -r "from '@/lib/env'" src/ | grep -v "// Old:"
```

## Rollback Plan

If you need to rollback:

1. The old `env.ts` still works
2. Revert your changes
3. Continue using the old system
4. The new config system provides the underlying validation

## Benefits After Migration

After migrating to the new system, you'll enjoy:

1. **Better Organization**: Config grouped by domain
2. **Better IDE Support**: More specific types and auto-completion
3. **Clearer Code**: `config.database.MONGODB_URI` is more explicit
4. **New Features**: Access to helper functions
5. **Better Errors**: More specific validation messages

## Getting Help

If you run into issues:

1. Check this migration guide
2. See [EXAMPLES.md](./EXAMPLES.md) for patterns
3. Review [README.md](./README.md) for API reference
4. Search existing code for migration examples
5. Create an issue if you find a bug

## Timeline Recommendation

- **Small projects** (< 50 files): 1-2 hours for complete migration
- **Medium projects** (50-200 files): 1 day for complete migration, or gradual over 1 week
- **Large projects** (> 200 files): Gradual migration over 2-4 weeks

Choose the approach that works best for your team and timeline!
