# Bundle Size Optimization Guide

## Overview
This guide provides actionable steps to optimize bundle size for production deployment.

## Current Bundle Analysis

### Check Current Bundle Size

```bash
# Build and analyze
pnpm run build
pnpm run ci:bundle

# Or use webpack analyzer
pnpm add -D @next/bundle-analyzer
```

### Configuration for Bundle Analyzer

Add to `next.config.js`:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... your config
});

// Then run:
// ANALYZE=true pnpm run build
```

## Critical Optimizations

### 1. Dynamic Imports for Heavy Libraries

**AI SDKs (Large)**

```typescript
// ❌ BAD: All AI SDKs loaded upfront
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ✅ GOOD: Load only when needed
async function executeWithOpenAI(prompt: string) {
  const { OpenAI } = await import('openai');
  const client = new OpenAI();
  // ... use client
}

async function executeWithAnthropic(prompt: string) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  // ... use client
}
```

**Estimated Savings**: 500KB-1MB per SDK not loaded

### 2. Component-Level Code Splitting

```typescript
// ❌ BAD: Load all components
import { HeavyChart } from '@/components/charts/HeavyChart';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';

// ✅ GOOD: Dynamic import with loading state
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(
  () => import('@/components/charts/HeavyChart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false  // Disable SSR for client-only components
  }
);

const PDFViewer = dynamic(
  () => import('@/components/pdf/PDFViewer'),
  { ssr: false }
);
```

**Estimated Savings**: 100-300KB per heavy component

### 3. Tree Shaking and Barrel Exports

**Problem: Barrel Imports**

```typescript
// ❌ BAD: Imports entire lodash
import _ from 'lodash';
const sorted = _.sortBy(array, 'name');

// ❌ STILL BAD: Barrel export may include everything
import { sortBy } from 'lodash';

// ✅ GOOD: Import only what you need
import sortBy from 'lodash/sortBy';
```

**Recommended Replacements:**

- `lodash` → `lodash-es` (better tree-shaking) or individual imports
- `moment` → `date-fns` (smaller, tree-shakeable)
- `axios` → `fetch` (native, 0 bytes)

### 4. Remove Unused Dependencies

```bash
# Find unused dependencies
pnpm dlx depcheck

# Remove unused
pnpm remove package-name

# Check for duplicate dependencies
pnpm dedupe
```

### 5. Optimize Images

```typescript
// ✅ Use Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  quality={75}  // Reduce quality for smaller size
  priority  // LCP optimization
/>
```

### 6. Font Optimization

```typescript
// ✅ Use next/font for automatic optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Prevent flash of unstyled text
  preload: true,
});
```

## Dependency Audit

### Heavy Dependencies in package.json

Based on the current setup, here are potential optimizations:

#### 1. AI SDKs (Keep but use dynamically)

```typescript
// Current size: ~800KB total
- @anthropic-ai/sdk
- @google/generative-ai
- openai
- groq-sdk
- replicate

// Optimization: Dynamic imports (see above)
// Savings: 600KB (load only what's needed)
```

#### 2. UI Libraries (Already optimized)

```typescript
// Good: Radix UI components are tree-shakeable
- @radix-ui/*  // Already optimized

// Good: Tailwind uses PurgeCSS
- tailwindcss  // Already optimized
```

#### 3. State Management (Consider alternatives)

```typescript
// Current:
- zustand  // Small, good choice
- @tanstack/react-query  // Large but necessary
- swr  // Similar to react-query

// ⚠️ WARNING: You have both react-query AND swr
// Consider using only one

// Recommendation: Keep react-query, remove swr
pnpm remove swr
```

**Estimated Savings**: 30-50KB

#### 4. Markdown Rendering

```typescript
// Current: Multiple markdown libraries
- marked
- react-markdown
- rehype-*
- remark-*

// These are necessary but ensure you're using dynamic imports
// for pages that render markdown
```

#### 5. Monitoring (Server-side only)

```typescript
// Ensure these are NOT in client bundle
- @sentry/nextjs  // Should be server-side only
- winston  // Server-side only

// Add to serverComponentsExternalPackages in next.config.js
```

## next.config.js Optimizations

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // External packages for server components
  serverComponentsExternalPackages: [
    'mongodb',
    'ioredis',
    '@upstash/redis',
    'winston',
    '@sentry/nextjs',
  ],

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle server-only packages in client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // AI SDKs in separate chunk
          ai: {
            name: 'ai-sdks',
            test: /[\\/]node_modules[\\/](@anthropic-ai|@google\/generative-ai|openai|groq-sdk|replicate)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          // UI libraries
          ui: {
            name: 'ui-libraries',
            test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
            priority: 9,
          },
          // Common utilities
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 8,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Production source maps (disable for faster builds)
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
```

## Lighthouse Performance Checklist

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Checklist

- [ ] Images optimized with Next.js Image
- [ ] Fonts loaded with next/font
- [ ] Heavy components dynamically imported
- [ ] AI SDKs loaded on-demand
- [ ] No duplicate dependencies (pnpm dedupe)
- [ ] Server-side packages excluded from client
- [ ] Code splitting configured
- [ ] Bundle size under target (< 200KB initial JS)
- [ ] Lighthouse score > 90

## Monitoring Bundle Size

### GitHub Actions (CI)

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on: [pull_request]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm run build

      - name: Check bundle size
        run: |
          # Fail if bundle exceeds 200KB
          SIZE=$(du -s .next/static/chunks/pages | cut -f1)
          if [ $SIZE -gt 200000 ]; then
            echo "Bundle size too large: ${SIZE}KB"
            exit 1
          fi
```

### Bundle Size Budget

Create `.bundlewatch.config.json`:

```json
{
  "files": [
    {
      "path": ".next/static/chunks/pages/_app-*.js",
      "maxSize": "150kb"
    },
    {
      "path": ".next/static/chunks/pages/index-*.js",
      "maxSize": "50kb"
    }
  ],
  "ci": {
    "trackBranches": ["main", "develop"]
  }
}
```

## Quick Wins

### 1. Remove swr (if using react-query)

```bash
pnpm remove swr
# Estimated savings: 40KB
```

### 2. Use date-fns instead of moment

```bash
pnpm remove moment
pnpm add date-fns
# Estimated savings: 60KB
```

### 3. Remove unused Radix components

```bash
# Only keep what you use
pnpm remove @radix-ui/react-accordion  # if not used
# Check all @radix-ui/* packages
```

### 4. Optimize PostCSS/Tailwind

```javascript
// tailwind.config.ts
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Purge unused classes
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
  },
};
```

## Expected Results

| Optimization | Bundle Reduction | User Impact |
|--------------|------------------|-------------|
| Remove swr | 40KB | Faster load |
| Dynamic AI SDKs | 600KB | Initial load 2x faster |
| Dynamic heavy components | 200KB | Page-specific optimization |
| Image optimization | 500KB-2MB | Much faster LCP |
| Font optimization | 100KB | Faster FCP |

**Total Potential Savings**: 1.4MB+

## Testing

```bash
# Build and check size
pnpm run build

# Check specific page size
ls -lh .next/static/chunks/pages/

# Lighthouse test
pnpm dlx lighthouse https://your-app.com --view

# WebPageTest
# https://www.webpagetest.org/
```

## Resources

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Bundle Size Budgets](https://web.dev/performance-budgets-101/)
- [Web Vitals](https://web.dev/vitals/)

---

**Last Updated**: 2025-11-17
**Status**: Ready for Implementation
