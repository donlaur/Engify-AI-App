# Configuration Usage Examples

Comprehensive examples showing how to use the configuration system in various scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Database Configuration](#database-configuration)
- [Authentication](#authentication)
- [AI Providers](#ai-providers)
- [Email Services](#email-services)
- [Feature Flags](#feature-flags)
- [Environment-Specific Logic](#environment-specific-logic)
- [API Routes](#api-routes)
- [Service Classes](#service-classes)
- [React Components](#react-components)
- [Testing](#testing)
- [Advanced Patterns](#advanced-patterns)

## Basic Usage

### Accessing Configuration

```typescript
import { config } from '@/lib/config';

// Access by domain
const mongoUri = config.database.MONGODB_URI;
const authSecret = config.auth.NEXTAUTH_SECRET;
const openaiKey = config.aiProviders.OPENAI_API_KEY;

// Use helper functions
const isProd = config.helpers.isProduction();
const hasMail = config.helpers.hasEmailService();
```

### Type-Safe Access

```typescript
import { config, type AIProvidersConfig } from '@/lib/config';

// TypeScript knows the exact type
const timeout: number | undefined = config.aiProviders.AI_PROVIDER_TIMEOUT_MS;
const maxRetries: number | undefined = config.aiProviders.AI_PROVIDER_MAX_RETRIES;

// Function parameters with config types
function setupAI(aiConfig: AIProvidersConfig) {
  // Full type safety
}

setupAI(config.aiProviders);
```

## Database Configuration

### MongoDB Connection

```typescript
import { config } from '@/lib/config';
import { MongoClient } from 'mongodb';

const client = new MongoClient(config.database.MONGODB_URI, {
  maxPoolSize: config.helpers.isProduction() ? 10 : 5,
});

async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}
```

### Connection Pool Settings

```typescript
import { config } from '@/lib/config';

const dbOptions = {
  uri: config.database.MONGODB_URI,
  options: {
    maxPoolSize: config.helpers.isProduction() ? 50 : 10,
    minPoolSize: config.helpers.isProduction() ? 10 : 2,
    retryWrites: true,
    w: 'majority',
  },
};
```

## Authentication

### NextAuth Configuration

```typescript
import { config } from '@/lib/config';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  secret: config.auth.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: config.helpers.getAdminSessionMaxAge(),
  },

  providers: [
    ...(config.helpers.hasOAuth()
      ? [
          GoogleProvider({
            clientId: config.auth.GOOGLE_CLIENT_ID!,
            clientSecret: config.auth.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
};
```

### Session Management

```typescript
import { config } from '@/lib/config';

function getSessionConfig() {
  return {
    maxAge: config.helpers.getAdminSessionMaxAge(),
    updateAge: config.helpers.getAdminSessionMaxAge() / 2,
    requireMFA: config.helpers.isAdminMFARequired(),
  };
}

// Use in middleware
export function middleware(req: NextRequest) {
  const sessionConfig = getSessionConfig();

  if (sessionConfig.requireMFA && !req.cookies.get('mfa-verified')) {
    return NextResponse.redirect('/mfa/verify');
  }
}
```

## AI Providers

### Multi-Provider Setup

```typescript
import { config } from '@/lib/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize available providers
const providers = {
  openai: config.helpers.hasAIProvider('openai')
    ? new OpenAI({ apiKey: config.aiProviders.OPENAI_API_KEY })
    : null,

  anthropic: config.helpers.hasAIProvider('anthropic')
    ? new Anthropic({ apiKey: config.aiProviders.ANTHROPIC_API_KEY })
    : null,

  google: config.helpers.hasAIProvider('google')
    ? new GoogleGenerativeAI(config.aiProviders.GOOGLE_API_KEY!)
    : null,
};

// Get first available provider
function getAvailableProvider() {
  const available = config.helpers.getConfiguredAIProviders();
  if (available.length === 0) {
    throw new Error('No AI providers configured');
  }
  return available[0];
}
```

### Dynamic Provider Selection

```typescript
import { config } from '@/lib/config';
import type { AIProvider } from '@/lib/config';

async function generateText(
  prompt: string,
  preferredProvider?: AIProvider
) {
  // Use preferred provider if available, otherwise use first available
  const provider =
    preferredProvider && config.helpers.hasAIProvider(preferredProvider)
      ? preferredProvider
      : config.helpers.getConfiguredAIProviders()[0];

  switch (provider) {
    case 'openai':
      return generateWithOpenAI(prompt);
    case 'anthropic':
      return generateWithAnthropic(prompt);
    case 'google':
      return generateWithGoogle(prompt);
    default:
      throw new Error(`Provider ${provider} not available`);
  }
}
```

### Provider-Specific Configuration

```typescript
import { config } from '@/lib/config';

const aiConfig = {
  timeout: config.helpers.getAIProviderTimeout(),
  maxRetries: config.helpers.getAIProviderMaxRetries(),

  openai: config.helpers.hasAIProvider('openai') ? {
    apiKey: config.aiProviders.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
  } : null,

  replicate: config.helpers.hasAIProvider('replicate') ? {
    token: config.aiProviders.REPLICATE_API_TOKEN,
    model: config.aiProviders.REPLICATE_MODEL,
    allowedModels: config.aiProviders.REPLICATE_ALLOWED_MODELS,
    imageModel: config.aiProviders.REPLICATE_IMAGE_MODEL,
  } : null,
};
```

## Email Services

### SendGrid Email Service

```typescript
import { config } from '@/lib/config';
import sgMail from '@sendgrid/mail';

class EmailService {
  constructor() {
    if (config.helpers.hasEmailService()) {
      sgMail.setApiKey(config.email.SENDGRID_API_KEY!);
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    if (!config.helpers.hasEmailService()) {
      console.warn('Email service not configured');
      return;
    }

    const templateId = config.email.SENDGRID_WELCOME_TEMPLATE_ID;

    await sgMail.send({
      to,
      from: {
        email: config.email.SENDGRID_FROM_EMAIL!,
        name: config.email.SENDGRID_FROM_NAME!,
      },
      replyTo: config.email.SENDGRID_REPLY_TO,
      templateId,
      dynamicTemplateData: {
        name,
        appUrl: config.core.NEXT_PUBLIC_APP_URL,
      },
    });
  }

  async sendPasswordReset(to: string, resetToken: string) {
    if (!config.helpers.hasEmailService()) {
      throw new Error('Email service required for password reset');
    }

    await sgMail.send({
      to,
      from: config.email.SENDGRID_FROM_EMAIL!,
      templateId: config.email.SENDGRID_PASSWORD_RESET_TEMPLATE_ID,
      dynamicTemplateData: {
        resetUrl: `${config.core.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
      },
    });
  }
}
```

### Template-Based Emails

```typescript
import { config } from '@/lib/config';

const emailTemplates = {
  welcome: config.email.SENDGRID_WELCOME_TEMPLATE_ID,
  passwordReset: config.email.SENDGRID_PASSWORD_RESET_TEMPLATE_ID,
  verification: config.email.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID,
  promptShared: config.email.SENDGRID_PROMPT_SHARED_TEMPLATE_ID,
  weeklyDigest: config.email.SENDGRID_WEEKLY_DIGEST_TEMPLATE_ID,
};

async function sendTemplateEmail(
  type: keyof typeof emailTemplates,
  to: string,
  data: Record<string, unknown>
) {
  const templateId = emailTemplates[type];

  if (!templateId) {
    throw new Error(`Template ${type} not configured`);
  }

  // Send email...
}
```

## Feature Flags

### Checking Feature Flags

```typescript
import { config } from '@/lib/config';

// Check individual features
if (config.helpers.isFeatureEnabled('NEXT_PUBLIC_ALLOW_SIGNUP')) {
  // Show signup form
}

if (config.helpers.isFeatureEnabled('NEXT_PUBLIC_SHOW_PLAYGROUND')) {
  // Show playground link
}

// Get all enabled features
const enabledFeatures = config.helpers.getEnabledFeatureFlags();
console.log('Enabled features:', enabledFeatures);
```

### Feature-Based Components

```typescript
import { config } from '@/lib/config';

export function Navigation() {
  const showPlayground = config.helpers.isFeatureEnabled('NEXT_PUBLIC_SHOW_PLAYGROUND');
  const showAdmin = config.helpers.isFeatureEnabled('NEXT_PUBLIC_SHOW_ADMIN_LINK');

  return (
    <nav>
      <Link href="/">Home</Link>
      {showPlayground && <Link href="/playground">Playground</Link>}
      {showAdmin && <Link href="/admin">Admin</Link>}
    </nav>
  );
}
```

### Environment-Based Features

```typescript
import { config } from '@/lib/config';

const features = {
  // Always enabled in development
  debugMode: config.helpers.isDevelopment(),

  // Configurable via env
  allowSignup: config.helpers.isFeatureEnabled('NEXT_PUBLIC_ALLOW_SIGNUP'),

  // Only in production
  analytics: config.helpers.isProduction() &&
    Boolean(config.analytics.NEXT_PUBLIC_GA_MEASUREMENT_ID),

  // Conditional on service availability
  emailNotifications: config.helpers.hasEmailService(),
  smsVerification: config.helpers.hasSMSService(),
};
```

## Environment-Specific Logic

### Development vs Production

```typescript
import { config } from '@/lib/config';

const logger = {
  level: config.helpers.isProduction() ? 'error' : 'debug',
  pretty: config.helpers.isDevelopment(),

  log(message: string, ...args: unknown[]) {
    if (config.helpers.isDevelopment()) {
      console.log(`[${new Date().toISOString()}]`, message, ...args);
    }
  },
};
```

### Environment-Specific Settings

```typescript
import { config } from '@/lib/config';

const appSettings = {
  // Cache settings
  cache: {
    ttl: config.helpers.isProduction() ? 3600 : 60,
    enabled: config.helpers.hasRedisCache(),
  },

  // Rate limiting
  rateLimit: {
    enabled: config.helpers.isProduction(),
    maxRequests: config.helpers.isProduction() ? 100 : 1000,
    windowMs: 60 * 1000,
  },

  // Logging
  logging: {
    level: config.helpers.isProduction() ? 'error' : 'debug',
    pretty: config.helpers.isDevelopment(),
  },
};
```

## API Routes

### Configuration in API Route

```typescript
// src/app/api/ai/generate/route.ts
import { config } from '@/lib/config';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  // Check if AI provider is available
  if (!config.helpers.hasAIProvider('openai')) {
    return NextResponse.json(
      { error: 'OpenAI not configured' },
      { status: 503 }
    );
  }

  const openai = new OpenAI({
    apiKey: config.aiProviders.OPENAI_API_KEY,
    timeout: config.helpers.getAIProviderTimeout(),
    maxRetries: config.helpers.getAIProviderMaxRetries(),
  });

  try {
    const { prompt } = await req.json();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error('AI generation failed:', error);
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
```

### Multi-Provider API Route

```typescript
// src/app/api/ai/chat/route.ts
import { config } from '@/lib/config';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt, provider = 'openai' } = await req.json();

  // Validate provider is configured
  if (!config.helpers.hasAIProvider(provider)) {
    return NextResponse.json(
      {
        error: `Provider ${provider} not configured`,
        available: config.helpers.getConfiguredAIProviders(),
      },
      { status: 400 }
    );
  }

  // Route to appropriate provider
  switch (provider) {
    case 'openai':
      return handleOpenAI(prompt);
    case 'anthropic':
      return handleAnthropic(prompt);
    case 'google':
      return handleGoogle(prompt);
    default:
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
  }
}
```

## Service Classes

### Database Service

```typescript
import { config } from '@/lib/config';
import { MongoClient } from 'mongodb';

export class DatabaseService {
  private client: MongoClient;
  private isConnected = false;

  constructor() {
    this.client = new MongoClient(config.database.MONGODB_URI, {
      maxPoolSize: config.helpers.isProduction() ? 50 : 10,
    });
  }

  async connect() {
    if (this.isConnected) return;

    await this.client.connect();
    this.isConnected = true;

    console.log('✅ Database connected');
  }

  async disconnect() {
    if (!this.isConnected) return;

    await this.client.close();
    this.isConnected = false;
  }

  get db() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return this.client.db();
  }
}
```

### Cache Service

```typescript
import { config } from '@/lib/config';
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis | null = null;

  constructor() {
    if (config.helpers.hasRedisCache()) {
      if (config.cache.UPSTASH_REDIS_REST_URL) {
        // Use Upstash Redis
        this.redis = new Redis(config.cache.UPSTASH_REDIS_REST_URL);
      } else {
        // Use local Redis
        this.redis = new Redis({
          host: config.cache.REDIS_HOST,
          port: config.cache.REDIS_PORT ?? 6379,
          password: config.cache.REDIS_PASSWORD,
          db: config.cache.REDIS_DB ?? 0,
        });
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (!this.redis) return;

    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  get isAvailable(): boolean {
    return this.redis !== null;
  }
}
```

## React Components

### Configuration in Client Components

```typescript
'use client';

import { useEffect, useState } from 'react';

// Note: Only NEXT_PUBLIC_ vars are available in client components
export function FeatureFlag({ feature }: { feature: string }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Access public env vars
    const value = process.env[`NEXT_PUBLIC_${feature}`];
    setIsEnabled(value === 'true');
  }, [feature]);

  return isEnabled ? <div>Feature enabled</div> : null;
}
```

### Server Components

```typescript
import { config } from '@/lib/config';

export function AppInfo() {
  return (
    <div>
      <h1>{config.core.NEXT_PUBLIC_APP_NAME}</h1>
      <p>Version: {config.core.NEXT_PUBLIC_APP_VERSION}</p>
      <p>Environment: {config.core.NODE_ENV}</p>

      {config.helpers.isProduction() && (
        <p>Running in production mode</p>
      )}
    </div>
  );
}
```

## Testing

### Unit Tests with Configuration

```typescript
import { config } from '@/lib/config';
import { describe, it, expect } from 'vitest';

describe('Configuration', () => {
  it('should be in test environment', () => {
    expect(config.helpers.isTest()).toBe(true);
    expect(config.core.NODE_ENV).toBe('test');
  });

  it('should have required config', () => {
    expect(config.database.MONGODB_URI).toBeDefined();
    expect(config.auth.NEXTAUTH_SECRET).toBeDefined();
  });

  it('should have at least one AI provider', () => {
    const providers = config.helpers.getConfiguredAIProviders();
    expect(providers.length).toBeGreaterThan(0);
  });
});
```

### Mocking Configuration

```typescript
import { vi } from 'vitest';

// Mock the entire config
vi.mock('@/lib/config', () => ({
  config: {
    database: {
      MONGODB_URI: 'mongodb://test',
    },
    aiProviders: {
      OPENAI_API_KEY: 'sk-test',
    },
    helpers: {
      isTest: () => true,
      hasAIProvider: () => true,
    },
  },
}));
```

## Advanced Patterns

### Configuration Validation

```typescript
import { config, validateConfig, aiProvidersConfigSchema } from '@/lib/config';

function validateAIConfig() {
  const result = validateConfig(
    aiProvidersConfigSchema,
    process.env,
    {
      strict: true,
      warnOnMissing: true,
    }
  );

  if (!result.success) {
    console.error('AI config validation failed:', result.errors);
    return false;
  }

  if (result.warnings) {
    console.warn('AI config warnings:', result.warnings);
  }

  return true;
}
```

### Safe Configuration Logging

```typescript
import { config } from '@/lib/config';

function logConfiguration() {
  const safeConfig = config.getSafeConfig();

  console.log('Configuration:', {
    environment: config.core.NODE_ENV,
    appUrl: config.core.NEXT_PUBLIC_APP_URL,
    providers: config.helpers.getConfiguredAIProviders(),
    features: config.helpers.getEnabledFeatureFlags(),
    // Secrets are masked
    config: safeConfig,
  });
}
```

### Dynamic Configuration

```typescript
import { config } from '@/lib/config';

class DynamicConfig {
  // Cache configuration values
  private cache = new Map<string, unknown>();

  get<T>(key: string, defaultValue?: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    // Get from config
    const value = this.getFromConfig(key) ?? defaultValue;
    this.cache.set(key, value);
    return value as T;
  }

  private getFromConfig(key: string): unknown {
    // Navigate nested config
    const parts = key.split('.');
    let current: any = config;

    for (const part of parts) {
      current = current[part];
      if (current === undefined) break;
    }

    return current;
  }
}

// Usage
const dynamicConfig = new DynamicConfig();
const timeout = dynamicConfig.get('aiProviders.AI_PROVIDER_TIMEOUT_MS', 30000);
```

### Configuration Factory

```typescript
import { config } from '@/lib/config';
import type { AIProvider } from '@/lib/config';

interface ProviderConfig {
  apiKey: string;
  timeout: number;
  maxRetries: number;
}

function createProviderConfig(provider: AIProvider): ProviderConfig {
  const keyMap = {
    openai: config.aiProviders.OPENAI_API_KEY,
    anthropic: config.aiProviders.ANTHROPIC_API_KEY,
    google: config.aiProviders.GOOGLE_API_KEY,
    groq: config.aiProviders.GROQ_API_KEY,
    replicate: config.aiProviders.REPLICATE_API_TOKEN,
  };

  const apiKey = keyMap[provider];
  if (!apiKey) {
    throw new Error(`Provider ${provider} not configured`);
  }

  return {
    apiKey,
    timeout: config.helpers.getAIProviderTimeout(),
    maxRetries: config.helpers.getAIProviderMaxRetries(),
  };
}
```

## Best Practices Summary

1. **Use domain-specific access**: `config.database.MONGODB_URI` instead of `config.flat.MONGODB_URI`
2. **Use helper functions**: `config.helpers.isProduction()` instead of manual checks
3. **Never log secrets**: Use `config.getSafeConfig()` for logging
4. **Check availability**: Use `config.helpers.hasXxx()` before using optional services
5. **Type safety**: Import types when needed for better IDE support
6. **Environment checks**: Use helpers for environment-specific logic
7. **Feature flags**: Use `config.helpers.isFeatureEnabled()` for feature toggles

## More Examples

For more examples, see:
- [README.md](./README.md) - Full API documentation
- [MIGRATION.md](./MIGRATION.md) - Migration patterns from old system
- Existing codebase for real-world usage
