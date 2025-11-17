# Configuration Quick Start Guide

Get up and running with the new configuration system in 5 minutes.

## 1. Install Dependencies

The configuration system uses Zod, which is already installed:

```bash
# Already in package.json
pnpm install
```

## 2. Basic Usage

```typescript
import { config } from '@/lib/config';

// Access configuration by domain
const mongoUri = config.database.MONGODB_URI;
const openaiKey = config.aiProviders.OPENAI_API_KEY;

// Use helper functions
if (config.helpers.isProduction()) {
  console.log('Running in production mode');
}
```

## 3. Common Patterns

### Check Environment

```typescript
import { config } from '@/lib/config';

if (config.helpers.isProduction()) {
  // Production code
}

if (config.helpers.isDevelopment()) {
  // Development code
}
```

### Check AI Providers

```typescript
import { config } from '@/lib/config';

// Check if specific provider is available
if (config.helpers.hasAIProvider('openai')) {
  // Use OpenAI
}

// Get all configured providers
const providers = config.helpers.getConfiguredAIProviders();
console.log('Available providers:', providers);
```

### Check Services

```typescript
import { config } from '@/lib/config';

if (config.helpers.hasEmailService()) {
  // Send emails
}

if (config.helpers.hasSMSService()) {
  // Send SMS
}

if (config.helpers.hasRedisCache()) {
  // Use Redis
}
```

### Feature Flags

```typescript
import { config } from '@/lib/config';

if (config.helpers.isFeatureEnabled('NEXT_PUBLIC_ALLOW_SIGNUP')) {
  // Show signup form
}

// Get all enabled features
const flags = config.helpers.getEnabledFeatureFlags();
```

## 4. Configuration Domains

| Domain | Access | Example |
|--------|--------|---------|
| Core | `config.core` | `config.core.NODE_ENV` |
| Database | `config.database` | `config.database.MONGODB_URI` |
| Auth | `config.auth` | `config.auth.NEXTAUTH_SECRET` |
| AI Providers | `config.aiProviders` | `config.aiProviders.OPENAI_API_KEY` |
| Email | `config.email` | `config.email.SENDGRID_API_KEY` |
| SMS | `config.sms` | `config.sms.TWILIO_ACCOUNT_SID` |
| Queue | `config.queue` | `config.queue.QSTASH_URL` |
| Cache | `config.cache` | `config.cache.REDIS_HOST` |
| AWS | `config.aws` | `config.aws.AWS_REGION` |
| Security | `config.security` | `config.security.API_KEY_ENCRYPTION_KEY` |
| Content | `config.contentCreation` | `config.contentCreation.CONTENT_CREATION_BUDGET_LIMIT` |
| RAG | `config.rag` | `config.rag.RAG_API_URL` |
| Features | `config.featureFlags` | `config.featureFlags.NEXT_PUBLIC_ALLOW_SIGNUP` |
| Analytics | `config.analytics` | `config.analytics.NEXT_PUBLIC_GA_MEASUREMENT_ID` |

## 5. Migration from Old System

If you're migrating from the old `env.ts` system:

```typescript
// Old
import { env, isProduction } from '@/lib/env';
const uri = env.MONGODB_URI;

// New
import { config } from '@/lib/config';
const uri = config.database.MONGODB_URI;
```

**Good news:** The old system still works! It now wraps the new config system, so you can migrate gradually.

## 6. Validation

Configuration is validated at startup:

```
✅ Configuration loaded successfully
   Environment: development
   App URL: http://localhost:3000
   AI Providers: openai, anthropic
```

If validation fails:

```
❌ Configuration validation failed:
  ❌ MONGODB_URI: Required
  ❌ NEXTAUTH_SECRET: String must contain at least 32 character(s)

Please check your .env.local file.
```

## 7. Security

Never log secrets directly:

```typescript
// ❌ BAD - exposes secrets
console.log(config.flat);

// ✅ GOOD - masks secrets
console.log(config.getSafeConfig());
```

## 8. Testing

```typescript
import { config } from '@/lib/config';

describe('My Test', () => {
  it('should be in test environment', () => {
    expect(config.helpers.isTest()).toBe(true);
  });
});
```

## Next Steps

- Read the [full documentation](./README.md)
- Check [examples](./EXAMPLES.md) for more patterns
- See [migration guide](./MIGRATION.md) for detailed migration steps

## Cheat Sheet

```typescript
import { config } from '@/lib/config';

// Environment
config.helpers.isProduction()
config.helpers.isDevelopment()
config.helpers.isTest()

// AI Providers
config.helpers.hasAIProvider('openai')
config.helpers.getConfiguredAIProviders()
config.helpers.getAIProviderTimeout()
config.helpers.isImageGenerationEnabled()

// Services
config.helpers.hasEmailService()
config.helpers.hasSMSService()
config.helpers.hasRedisCache()
config.helpers.hasOAuth()

// Features
config.helpers.isFeatureEnabled(key)
config.helpers.getEnabledFeatureFlags()

// Admin
config.helpers.getAdminSessionMaxAge()
config.helpers.isAdminMFARequired()

// Safety
config.getSafeConfig()  // Masks secrets
```

That's it! You're ready to use the configuration system.
