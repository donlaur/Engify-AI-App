# Configuration Management System

Comprehensive documentation for the Engify AI application configuration system.

## Overview

The Engify AI application uses a robust, type-safe configuration management system built with TypeScript and Zod. This system provides:

- **Type Safety**: Full TypeScript support with auto-completion
- **Runtime Validation**: Zod schemas validate all configuration at startup
- **Domain Organization**: Configuration grouped by functional domain
- **Security**: Built-in secret detection and masking
- **Developer Experience**: Helpful error messages and validation feedback

## Architecture

```
src/lib/config/
├── index.ts       # Main configuration loader and exports
├── schema.ts      # Zod schemas for all configuration domains
├── types.ts       # TypeScript types and constants
└── utils.ts       # Helper functions and utilities
```

## Configuration Domains

Configuration is organized into logical domains:

| Domain | Description | Examples |
|--------|-------------|----------|
| **core** | Application core settings | NODE_ENV, APP_URL, VERSION |
| **database** | Database connections | MONGODB_URI |
| **auth** | Authentication & authorization | NextAuth, OAuth, MFA |
| **aiProviders** | AI service configurations | OpenAI, Anthropic, Google, Replicate |
| **email** | Email service (SendGrid) | API keys, templates |
| **sms** | SMS/MFA service (Twilio) | Account SID, phone numbers |
| **queue** | Job queues (QStash) | Queue URLs, webhooks |
| **cache** | Redis caching | Upstash Redis, local Redis |
| **aws** | AWS services | Region, credentials |
| **security** | Encryption keys | API key encryption |
| **contentCreation** | Content agent settings | Models, budgets |
| **rag** | RAG/Python backend | API URLs, feature flags |
| **featureFlags** | Feature toggles | Signup, playground, admin |
| **analytics** | Analytics services | Google Analytics, PostHog |

## Quick Start

### 1. Basic Usage

```typescript
import { config } from '@/lib/config';

// Access configuration by domain
const mongoUri = config.database.MONGODB_URI;
const openaiKey = config.aiProviders.OPENAI_API_KEY;
const isProduction = config.core.NODE_ENV === 'production';

// Use helper functions
if (config.helpers.isProduction()) {
  console.log('Running in production mode');
}

if (config.helpers.hasAIProvider('openai')) {
  console.log('OpenAI is configured');
}
```

### 2. Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```bash
# Core (Required)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# AI Providers (at least one required in production)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional services
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
```

### 3. Type-Safe Access

The configuration system provides full type safety:

```typescript
import { config, type AIProvidersConfig } from '@/lib/config';

// TypeScript knows the exact type
const timeout: number | undefined = config.aiProviders.AI_PROVIDER_TIMEOUT_MS;

// Auto-completion works for all config keys
const templates = config.email.SENDGRID_WELCOME_TEMPLATE_ID;
```

## Configuration Validation

### Startup Validation

Configuration is validated when the application starts:

```
✅ Configuration loaded successfully
   Environment: development
   App URL: http://localhost:3000
   AI Providers: openai, anthropic
   Feature Flags: NEXT_PUBLIC_ALLOW_SIGNUP, NEXT_PUBLIC_SHOW_PLAYGROUND
```

### Validation Errors

If validation fails, you'll see detailed error messages:

```
❌ Configuration validation failed:
  ❌ MONGODB_URI: Required
  ❌ NEXTAUTH_SECRET: String must contain at least 32 character(s)

Please check your .env.local file and ensure all required variables are set.
See .env.example for reference.
```

### Production Security

In production, the system enforces additional security checks:

- Critical secrets must not be placeholders
- At least one AI provider must be configured
- Image generation requires Replicate API token (if enabled)

```
❌ Production security validation failed:
Critical secrets misconfigured in production: NEXTAUTH_SECRET.
Ensure they are set to secure, non-placeholder values.
```

## Helper Functions

The config system provides convenient helper functions:

### Environment Checks

```typescript
import { config } from '@/lib/config';

config.helpers.isProduction()    // true if NODE_ENV === 'production'
config.helpers.isDevelopment()   // true if NODE_ENV === 'development'
config.helpers.isTest()          // true if NODE_ENV === 'test'
```

### AI Provider Checks

```typescript
// Check if specific provider is configured
config.helpers.hasAIProvider('openai')      // boolean
config.helpers.hasAIProvider('anthropic')   // boolean

// Get all configured providers
const providers = config.helpers.getConfiguredAIProviders();
// Returns: ['openai', 'anthropic', 'google']
```

### Service Checks

```typescript
config.helpers.hasOAuth()          // OAuth configured
config.helpers.hasEmailService()   // SendGrid configured
config.helpers.hasSMSService()     // Twilio configured
config.helpers.hasRedisCache()     // Redis configured
```

### Feature Flags

```typescript
// Check individual feature
config.helpers.isFeatureEnabled('NEXT_PUBLIC_ALLOW_SIGNUP')

// Get all enabled features
const flags = config.helpers.getEnabledFeatureFlags();
```

### Settings

```typescript
config.helpers.getAdminSessionMaxAge()    // seconds
config.helpers.isAdminMFARequired()       // boolean
config.helpers.getAIProviderTimeout()     // milliseconds
config.helpers.isImageGenerationEnabled() // boolean
config.helpers.isRAGEnabled()             // boolean
```

## Security Features

### Secret Masking

Secrets are automatically masked in logs:

```typescript
import { maskSecret, createSafeConfig } from '@/lib/config';

// Mask a single secret
maskSecret('sk-1234567890abcdef')
// Returns: 'sk-1...cdef'

// Create safe config for logging
const safeConfig = createSafeConfig(config.flat);
console.log(safeConfig);
// Secrets are masked: { OPENAI_API_KEY: 'sk-1...cdef' }
```

### Secret Detection

The system automatically detects secret keys:

```typescript
import { isSecretKey } from '@/lib/config';

isSecretKey('OPENAI_API_KEY')     // true
isSecretKey('NEXTAUTH_SECRET')    // true
isSecretKey('MONGODB_URI')        // true
isSecretKey('NODE_ENV')           // false
```

### Placeholder Detection

Detects placeholder/test values:

```typescript
import { isPlaceholder } from '@/lib/config';

isPlaceholder('your-key-here')     // true
isPlaceholder('test-key')          // true
isPlaceholder('sk-test123')        // true
isPlaceholder('sk-prod-real-key')  // false
```

## Best Practices

### 1. Use Domain-Specific Access

```typescript
// ✅ Good - domain-specific access
const uri = config.database.MONGODB_URI;
const key = config.aiProviders.OPENAI_API_KEY;

// ❌ Avoid - flat access (less organized)
const uri = config.flat.MONGODB_URI;
```

### 2. Use Helper Functions

```typescript
// ✅ Good - use helpers
if (config.helpers.isProduction()) {
  // ...
}

// ❌ Avoid - manual checks
if (config.core.NODE_ENV === 'production') {
  // ...
}
```

### 3. Never Log Secrets

```typescript
// ✅ Good - use safe config
console.log('Config:', config.getSafeConfig());

// ❌ NEVER - exposes secrets
console.log('Config:', config.flat);
```

### 4. Validate Early

```typescript
// ✅ Good - config validates on import
import { config } from '@/lib/config';
// Fails fast if invalid

// ❌ Avoid - manual validation later
const key = process.env.OPENAI_API_KEY;
if (!key) throw new Error('Missing key');
```

## Advanced Usage

### Custom Validation

```typescript
import { validateConfig, aiProvidersConfigSchema } from '@/lib/config';

const result = validateConfig(aiProvidersConfigSchema, process.env, {
  strict: true,
  throwOnError: false,
});

if (!result.success) {
  console.error('Validation errors:', result.errors);
}
```

### Configuration Metadata

```typescript
import { getConfigMetadata } from '@/lib/config';

const metadata = getConfigMetadata(
  'OPENAI_API_KEY',
  process.env.OPENAI_API_KEY,
  'production'
);

console.log(metadata);
// {
//   key: 'OPENAI_API_KEY',
//   value: '***',
//   source: { type: 'env' },
//   isSecret: true,
//   isRequired: true,
//   description: 'OpenAI API key for GPT models'
// }
```

### Environment Defaults

```typescript
import { getEnvironmentDefaults } from '@/lib/config';

const defaults = getEnvironmentDefaults('production');
// Returns production-specific defaults
```

## Testing

### Test Configuration

```typescript
import { config } from '@/lib/config';

describe('My Component', () => {
  it('works in test environment', () => {
    expect(config.helpers.isTest()).toBe(true);
    expect(config.core.NODE_ENV).toBe('test');
  });
});
```

### Mock Configuration

For unit tests, you can mock the config:

```typescript
import { config } from '@/lib/config';

jest.mock('@/lib/config', () => ({
  config: {
    database: {
      MONGODB_URI: 'mongodb://test',
    },
    helpers: {
      isTest: () => true,
    },
  },
}));
```

## Troubleshooting

### Common Issues

#### 1. Missing Required Variables

**Error:**
```
❌ MONGODB_URI: Required
```

**Solution:** Add the variable to your `.env.local` file:
```bash
MONGODB_URI=mongodb+srv://...
```

#### 2. Invalid URL Format

**Error:**
```
❌ NEXT_PUBLIC_APP_URL: Invalid url
```

**Solution:** Ensure the URL is valid and includes protocol:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ✅
NEXT_PUBLIC_APP_URL=localhost:3000         # ❌
```

#### 3. Short Secret

**Error:**
```
❌ NEXTAUTH_SECRET: String must contain at least 32 character(s)
```

**Solution:** Generate a secure secret:
```bash
openssl rand -base64 32
```

#### 4. Production Placeholder

**Warning:**
```
⚠️ OPENAI_API_KEY: Placeholder value detected in production
```

**Solution:** Replace with real API key in production environment.

## Migration Guide

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions from the old env.ts system.

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for comprehensive usage examples.

## API Reference

### Main Exports

- `config` - Pre-initialized configuration instance
- `getConfig()` - Get configuration instance
- All schema types (`CoreConfig`, `AuthConfig`, etc.)
- All utility functions (`validateConfig`, `maskSecret`, etc.)

### Configuration Instance

- `config.core` - Core application config
- `config.database` - Database config
- `config.auth` - Authentication config
- `config.aiProviders` - AI provider config
- `config.email` - Email service config
- `config.sms` - SMS service config
- `config.queue` - Queue config
- `config.cache` - Cache config
- `config.aws` - AWS config
- `config.security` - Security config
- `config.contentCreation` - Content creation config
- `config.rag` - RAG config
- `config.featureFlags` - Feature flags
- `config.analytics` - Analytics config
- `config.flat` - Flat config (backward compatibility)
- `config.helpers` - Helper functions
- `config.getSafeConfig()` - Get config with masked secrets
- `config.isValidated` - Check if validated

## Support

For issues or questions:
1. Check [EXAMPLES.md](./EXAMPLES.md) for common patterns
2. Review [MIGRATION.md](./MIGRATION.md) for migration help
3. Check existing code for usage examples
4. Create an issue in the project repository
