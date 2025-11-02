# Bundle Size Analysis Guide

**Date:** 2025-11-02  
**Purpose:** Guide for analyzing and optimizing bundle sizes  
**Related:** Day 7 Phase 8, Performance Optimization

---

## Overview

Bundle size directly impacts page load performance. This guide documents how to analyze bundle sizes and optimize them.

---

## Quick Start

### Running Bundle Analysis

```bash
# Build the application first
pnpm build

# Run bundle size check
pnpm run ci:bundle

# Or use the script directly
tsx scripts/ci/check-bundle-size.ts
```

### Using Next.js Bundle Analyzer

```bash
# Install analyzer (if not already installed)
pnpm add -D @next/bundle-analyzer

# Run analyzer
ANALYZE=true pnpm build
```

This opens an interactive visualization showing:
- Bundle sizes
- Module dependencies
- Code splitting effectiveness

---

## Current Bundle Budgets

**Per-Route Budgets:**
- Homepage (`app/page`): 150 KB
- Prompt Library (`app/library/page`): 200 KB
- Workbench (`app/workbench/page`): 250 KB
- Patterns (`app/patterns/page`): 180 KB

**Shared Chunks:**
- `_app`: 300 KB
- `framework`: 150 KB
- `commons`: 100 KB

**Total Budget:** 1200 KB

---

## Common Issues & Fixes

### 1. Large Dependencies

**Problem:** Heavy libraries inflating bundle size

**Solutions:**
- Use dynamic imports for heavy components
- Replace heavy libraries with lighter alternatives
- Tree-shake unused exports

**Example:**
```typescript
// ❌ BAD: Import entire library
import { Chart } from 'heavy-chart-library';

// ✅ GOOD: Dynamic import
const Chart = dynamic(() => import('heavy-chart-library').then(mod => mod.Chart), {
  ssr: false,
});
```

### 2. Duplicate Dependencies

**Problem:** Same dependency included multiple times

**Solution:**
```bash
# Check for duplicates
npx npm-check-duplicates

# Or use webpack-bundle-analyzer
ANALYZE=true pnpm build
```

### 3. Unused Code

**Problem:** Dead code included in bundle

**Solutions:**
- Enable tree-shaking (already enabled in Next.js)
- Remove unused imports
- Use barrel exports sparingly

**Example:**
```typescript
// ❌ BAD: Import entire module
import * as utils from '@/lib/utils';

// ✅ GOOD: Import specific functions
import { formatDate, formatCurrency } from '@/lib/utils';
```

### 4. Large Images

**Problem:** Images not optimized

**Solutions:**
- Use Next.js Image component
- Convert to WebP format
- Use responsive images
- Lazy load below-fold images

### 5. Inline Styles/CSS

**Problem:** Large CSS bundles

**Solutions:**
- Use Tailwind utility classes (already doing this)
- Purge unused CSS (Tailwind does this automatically)
- Extract critical CSS
- Use CSS-in-JS sparingly

---

## Optimization Strategies

### Code Splitting

**Route-based Splitting (Automatic):**
Next.js automatically splits by route. Ensure you're not importing heavy components across routes.

**Component-based Splitting:**
```typescript
// ✅ Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed for SSR
});
```

**Library Splitting:**
```typescript
// ✅ Split large libraries
const Chart = dynamic(() => import('chart.js'), {
  ssr: false,
});
```

### Tree Shaking

**Ensure:**
- Using ES modules (`import`/`export`)
- Not using CommonJS (`require`)
- Libraries support tree-shaking

**Check:**
```typescript
// ✅ Tree-shakeable
import { specificFunction } from 'library';

// ❌ Not tree-shakeable
const { specificFunction } = require('library');
```

### Dependency Optimization

**Replace Heavy Libraries:**
- `moment.js` (289 KB) → `date-fns` (71 KB) or native `Intl`
- `lodash` (70 KB) → `lodash-es` (tree-shakeable) or individual functions
- `axios` (13 KB) → native `fetch` (0 KB)

**Use CDN for Large Libraries:**
```typescript
// Only if necessary
<script src="https://cdn.jsdelivr.net/npm/chart.js@3"></script>
```

---

## Analysis Tools

### 1. Next.js Bundle Analyzer

**Install:**
```bash
pnpm add -D @next/bundle-analyzer
```

**Configure `next.config.js`:**
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

**Run:**
```bash
ANALYZE=true pnpm build
```

### 2. Webpack Bundle Analyzer

**Install:**
```bash
pnpm add -D webpack-bundle-analyzer
```

**Use:**
```bash
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

### 3. Import Cost Extension

**VS Code Extension:**
- Install "Import Cost" extension
- Shows import size inline in editor

---

## Monitoring Bundle Size

### CI/CD Integration

**GitHub Actions:**
```yaml
name: Bundle Size Check
on: [pull_request]
jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm run ci:bundle
```

**Bundle Size Comparison:**
```bash
# Compare with previous build
./scripts/ci/compare-bundle-size.sh
```

---

## Best Practices

### 1. Regular Audits
- Run bundle analysis weekly
- Track bundle size trends
- Set alerts for size increases

### 2. Budget Enforcement
- Use CI/CD to block oversized bundles
- Review budgets quarterly
- Adjust based on user needs

### 3. Dependency Management
- Review dependencies monthly
- Remove unused dependencies
- Update to lighter alternatives when possible

### 4. Code Reviews
- Check bundle impact in PR reviews
- Flag large imports
- Suggest code splitting when needed

---

## Checklist

### Pre-Deployment
- [ ] Bundle size within budget
- [ ] No duplicate dependencies
- [ ] Heavy components lazy-loaded
- [ ] Images optimized
- [ ] Unused code removed

### Regular Maintenance
- [ ] Weekly bundle size check
- [ ] Monthly dependency audit
- [ ] Quarterly budget review
- [ ] Track size trends

---

## Related Documentation

- [Lighthouse Audit Guide](./LIGHTHOUSE_AUDIT_GUIDE.md)
- [Performance Optimization Plan](./OPTIMIZATION_DAY7.md)
- [Bundle Size Check Script](../../scripts/ci/check-bundle-size.ts)

---

**Last Updated:** 2025-11-02  
**Status:** ✅ Documentation complete  
**Next Review:** After bundle analysis

