# Configuration Guide

**Complete guide to all configuration files and environment setup for Engify.ai**

## Required Configuration Files

### Core Application Configs

#### `package.json`
- **Purpose**: Node.js project configuration and dependencies
- **Required**: Yes
- **Location**: Root directory
- **Key Sections**:
  - `scripts`: Development and build commands
  - `dependencies`: Production dependencies
  - `devDependencies`: Development dependencies
  - `engines`: Node.js and pnpm version requirements

#### `next.config.js`
- **Purpose**: Next.js framework configuration
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Experimental features
  - Build optimizations
  - Environment variables
  - Redirects and rewrites

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Strict mode enabled
  - Path mapping (`@/` aliases)
  - Target ES2022
  - Module resolution

#### `tailwind.config.ts`
- **Purpose**: Tailwind CSS configuration
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Content paths
  - Custom theme
  - Plugin configurations
  - Dark mode support

### Development & Testing Configs

#### `.eslintrc.json`
- **Purpose**: ESLint code quality rules
- **Required**: Yes
- **Location**: Root directory
- **Key Rules**:
  - TypeScript strict mode
  - No `any` types
  - No console statements (warn only)
  - Prefer const over let

#### `playwright.config.ts`
- **Purpose**: Playwright E2E testing configuration
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Test directories
  - Browser configurations
  - Timeout settings
  - Screenshot options

#### `vitest.config.ts`
- **Purpose**: Vitest unit testing configuration
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Test environment (jsdom)
  - Coverage settings
  - File patterns
  - Mock configurations

### UI & Component Configs

#### `components.json`
- **Purpose**: shadcn/ui component configuration
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Component paths
  - Style configuration
  - Import aliases

#### `postcss.config.js`
- **Purpose**: PostCSS configuration for Tailwind
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Tailwind CSS plugin
  - Autoprefixer plugin

### Monitoring & Analytics Configs

#### `sentry.server.config.ts`
- **Purpose**: Sentry error tracking for server-side
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - DSN configuration
  - Environment detection
  - Release tracking
  - Performance monitoring

#### `sentry.edge.config.ts`
- **Purpose**: Sentry error tracking for Edge Runtime
- **Required**: Yes
- **Location**: Root directory
- **Key Settings**:
  - Edge-specific configuration
  - Reduced bundle size
  - Performance monitoring

#### `.lighthouserc.json`
- **Purpose**: Lighthouse CI configuration
- **Required**: Optional
- **Location**: Root directory
- **Key Settings**:
  - Performance budgets
  - Accessibility checks
  - SEO validation
  - PWA requirements

### Python Workbench Configs

#### `python/requirements.txt`
- **Purpose**: Python dependencies for AI workbench
- **Required**: Yes
- **Location**: `python/` directory
- **Key Dependencies**:
  - OpenAI SDK
  - Anthropic SDK
  - Google Generative AI
  - ChromaDB for vector storage
  - Testing frameworks

## Environment Variables

### Required Environment Variables

Create `.env.local` in the root directory:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI Provider API Keys
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_API_KEY=your-google-api-key
GROQ_API_KEY=gsk_your-groq-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Python Workbench
PYTHON_PATH=./python/venv/bin/python
VENV_PATH=./python/venv
```

### Optional Environment Variables

```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc-your-posthog-key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# Performance
NEXT_PUBLIC_CACHE_TTL=3600
NEXT_PUBLIC_MAX_RETRIES=3
```

## Configuration Validation

### Pre-commit Checks

The following configurations are validated on every commit:

1. **TypeScript Compilation** (`tsconfig.json`)
   - Zero type errors
   - Strict mode compliance
   - Path resolution

2. **ESLint Rules** (`.eslintrc.json`)
   - Code quality standards
   - TypeScript best practices
   - Security checks

3. **Security Scanning** (`scripts/security/security-check.js`)
   - Secret detection
   - Dependency vulnerabilities
   - Configuration security

4. **Schema Validation** (`scripts/maintenance/validate-schema.js`)
   - Data structure validation
   - API schema compliance
   - Type safety

### Build-time Validation

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build

# Test suite
npm test
```

## Configuration Best Practices

### 1. Environment-specific Configs

```typescript
// next.config.js
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  // Development-only features
  ...(isDev && {
    experimental: {
      serverComponentsExternalPackages: ['mongodb']
    }
  }),
  
  // Production optimizations
  ...(isProd && {
    compress: true,
    poweredByHeader: false
  })
};
```

### 2. Type-safe Environment Variables

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  NODE_ENV: z.enum(['development', 'production', 'test'])
});

export const env = envSchema.parse(process.env);
```

### 3. Configuration Validation

```typescript
// scripts/validate-config.ts
import { config } from 'dotenv';
import { z } from 'zod';

const requiredEnvSchema = z.object({
  MONGODB_URI: z.string(),
  NEXTAUTH_SECRET: z.string(),
  OPENAI_API_KEY: z.string()
});

function validateConfig() {
  config({ path: '.env.local' });
  
  try {
    requiredEnvSchema.parse(process.env);
    console.log('✅ Configuration valid');
  } catch (error) {
    console.error('❌ Configuration invalid:', error);
    process.exit(1);
  }
}

validateConfig();
```

## Troubleshooting Configuration Issues

### Common Issues

#### 1. TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf .next tsconfig.tsbuildinfo

# Rebuild
npm run build
```

#### 2. Environment Variables Not Loading
```bash
# Check .env.local exists
ls -la .env.local

# Verify variable names match exactly
grep -E "^[A-Z_]+=" .env.local
```

#### 3. Build Failures
```bash
# Clear all caches
rm -rf .next node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

#### 4. Python Environment Issues
```bash
# Recreate Python virtual environment
cd python
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Configuration Debugging

#### Environment Variable Debugging
```typescript
// Add to any component for debugging
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  // Don't log sensitive variables
});
```

#### Build Configuration Debugging
```bash
# Verbose Next.js build
DEBUG=* npm run build

# TypeScript verbose output
npx tsc --listFiles

# ESLint debug mode
DEBUG=eslint:* npm run lint
```

## Security Considerations

### 1. Never Commit Secrets
```bash
# .gitignore should include
.env
.env.local
.env.*.local
*.key
*.pem
```

### 2. Environment Variable Security
- Use different secrets for each environment
- Rotate secrets regularly
- Use secret management services in production
- Never log sensitive environment variables

### 3. Configuration Security
```typescript
// Validate all environment variables
const secureEnvSchema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb\+srv:\/\//),
  NEXTAUTH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().regex(/^sk-/),
});
```

## Performance Optimization

### 1. Build Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};
```

### 2. Bundle Analysis
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### 3. Configuration Caching
```typescript
// Cache configuration objects
const configCache = new Map();

export function getConfig(key: string) {
  if (configCache.has(key)) {
    return configCache.get(key);
  }
  
  const config = loadConfig(key);
  configCache.set(key, config);
  return config;
}
```

---

**This configuration guide demonstrates professional development practices and enterprise-grade configuration management suitable for production environments.**
