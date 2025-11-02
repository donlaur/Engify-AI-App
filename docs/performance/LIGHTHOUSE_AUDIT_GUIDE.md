# Lighthouse Performance Audit Guide

**Date:** 2025-11-02  
**Purpose:** Guide for running Lighthouse audits and documenting findings  
**Related:** Day 7 Phase 8, Performance Optimization

---

## Overview

Lighthouse audits help identify performance, accessibility, SEO, and best practices issues. This guide documents how to run audits and interpret results.

---

## Running Lighthouse Audits

### Prerequisites

Lighthouse is installed globally or via npm:
```bash
npm install -g lighthouse
# Or use npx (no installation needed)
npx lighthouse --version
```

### Basic Usage

**Audit a URL:**
```bash
# Production URL
npx lighthouse https://engify.ai --view

# Local development (start dev server first)
pnpm dev
# In another terminal:
npx lighthouse http://localhost:3000 --view

# Save results to file
npx lighthouse https://engify.ai --output html --output-path ./lighthouse-report.html
```

### Advanced Options

**Multiple formats:**
```bash
npx lighthouse https://engify.ai \
  --output html,json \
  --output-path ./lighthouse-report.html
```

**Mobile emulation:**
```bash
npx lighthouse https://engify.ai \
  --preset mobile \
  --view
```

**Throttling (simulate slow connection):**
```bash
npx lighthouse https://engify.ai \
  --throttling-method=simulate \
  --throttling.rttMs=150 \
  --view
```

**CI/CD integration:**
```bash
npx lighthouse https://engify.ai \
  --output json \
  --output-path ./lighthouse-results.json \
  --quiet
```

---

## Target Scores

**Current Targets (Day 7):**

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| Performance | 90+ | TBD | ⏳ Pending audit |
| Accessibility | 95+ | TBD | ⏳ Pending audit |
| Best Practices | 100 | TBD | ⏳ Pending audit |
| SEO | 100 | TBD | ⏳ Pending audit |

**Acceptable Scores:**
- Performance: 90+ (excellent), 75-89 (good), 50-74 (needs improvement)
- Accessibility: 95+ (excellent), 90-94 (good)
- Best Practices: 100 (required)
- SEO: 100 (required)

---

## Key Pages to Audit

### Priority 1: High-Traffic Pages
1. **Homepage** (`/`)
   - Critical for first impressions
   - Check hero section, stats display, CTA buttons

2. **Prompt Library** (`/prompts`)
   - Core value proposition
   - Check search, filters, card rendering

3. **Prompt Detail** (`/prompts/[id]`)
   - Individual prompt pages
   - Check content loading, share functionality

### Priority 2: User-Facing Pages
4. **Dashboard** (`/dashboard`)
   - Authenticated user experience
   - Check stats loading, data fetching

5. **Login/Signup** (`/login`, `/signup`)
   - Authentication flow
   - Check form performance, validation

### Priority 3: Admin Pages
6. **OpsHub** (`/opshub`)
   - Admin dashboard
   - Check table rendering, data loading

---

## Common Issues & Fixes

### Performance Issues

**1. Large JavaScript Bundles**
- **Symptom:** High Total Blocking Time (TBT)
- **Fix:** Code splitting, lazy loading, remove unused dependencies
- **Check:** Bundle analyzer (`pnpm run ci:bundle`)

**2. Slow Server Response**
- **Symptom:** High Time to First Byte (TTFB)
- **Fix:** Optimize API routes, add caching, use ISR
- **Check:** API response times in monitoring

**3. Unoptimized Images**
- **Symptom:** Large image sizes
- **Fix:** Use Next.js Image component, WebP format, responsive sizes
- **Check:** Image sizes in Network tab

**4. Render-Blocking Resources**
- **Symptom:** High First Contentful Paint (FCP)
- **Fix:** Defer non-critical CSS/JS, use font-display: swap
- **Check:** Critical CSS extraction

### Accessibility Issues

**1. Missing Alt Text**
- **Fix:** Add descriptive alt text to all images
- **Check:** HTML validator, Lighthouse audit

**2. Poor Color Contrast**
- **Fix:** Ensure WCAG AA compliance (4.5:1 for text)
- **Check:** Contrast checker tools

**3. Missing ARIA Labels**
- **Fix:** Add proper ARIA attributes to interactive elements
- **Check:** Screen reader testing

**4. Keyboard Navigation**
- **Fix:** Ensure all interactive elements are keyboard accessible
- **Check:** Tab through entire page

### SEO Issues

**1. Missing Meta Tags**
- **Fix:** Add proper title, description, Open Graph tags
- **Check:** Meta tags validator

**2. Missing Structured Data**
- **Fix:** Add JSON-LD structured data
- **Check:** Google Rich Results Test

**3. Missing Sitemap**
- **Fix:** Generate sitemap.xml
- **Check:** `/sitemap.xml` exists

**4. Missing robots.txt**
- **Fix:** Create robots.txt file
- **Check:** `/robots.txt` exists

### Best Practices Issues

**1. HTTPS Not Enforced**
- **Fix:** Redirect HTTP to HTTPS
- **Check:** Vercel/Deployment config

**2. Console Errors**
- **Fix:** Remove console.log, fix JavaScript errors
- **Check:** Browser console

**3. Vulnerable Dependencies**
- **Fix:** Update dependencies, run security audit
- **Check:** `npm audit`, Dependabot

---

## Audit Checklist

### Pre-Audit
- [ ] Dev server running (if testing locally)
- [ ] Production deployed (if testing production)
- [ ] Browser cache cleared
- [ ] Network throttling set (if simulating slow connection)

### During Audit
- [ ] Run Lighthouse in incognito mode
- [ ] Wait for page to fully load
- [ ] Run multiple times and average scores
- [ ] Test on mobile and desktop

### Post-Audit
- [ ] Document scores in this file
- [ ] Create issues for scores < target
- [ ] Prioritize fixes (Performance > Accessibility > SEO > Best Practices)
- [ ] Re-run after fixes

---

## Documentation Template

### Lighthouse Audit Results

**Date:** [Date]  
**URL:** [URL]  
**Device:** Desktop / Mobile  
**Connection:** Fast 3G / 4G / Cable

**Scores:**

| Category | Score | Target | Status |
|----------|-------|--------|--------|
| Performance | X | 90+ | ✅ / ⚠️ / ❌ |
| Accessibility | X | 95+ | ✅ / ⚠️ / ❌ |
| Best Practices | X | 100 | ✅ / ⚠️ / ❌ |
| SEO | X | 100 | ✅ / ⚠️ / ❌ |

**Key Metrics:**

- First Contentful Paint (FCP): X.Xs
- Largest Contentful Paint (LCP): X.Xs
- Total Blocking Time (TBT): X.Xms
- Cumulative Layout Shift (CLS): X.XX
- Speed Index: X.Xs

**Critical Issues:**

1. [Issue description]
   - Impact: High / Medium / Low
   - Fix: [Recommended fix]
   - Priority: P0 / P1 / P2

2. [Issue description]
   - Impact: High / Medium / Low
   - Fix: [Recommended fix]
   - Priority: P0 / P1 / P2

**Recommendations:**

1. [Recommendation]
2. [Recommendation]

---

## Automated Lighthouse Audits

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://engify.ai
            https://engify.ai/prompts
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**Script:**
```bash
# scripts/ci/lighthouse-audit.sh
#!/bin/bash
npx lighthouse https://engify.ai \
  --output json \
  --output-path ./lighthouse-results.json \
  --quiet

# Check scores
PERFORMANCE=$(cat lighthouse-results.json | jq '.categories.performance.score * 100')
if (( $(echo "$PERFORMANCE < 90" | bc -l) )); then
  echo "Performance score below target: $PERFORMANCE"
  exit 1
fi
```

---

## Related Documentation

- [Performance Optimization Plan](../performance/OPTIMIZATION_DAY7.md)
- [Bundle Size Analysis Guide](./BUNDLE_SIZE_ANALYSIS.md)
- [Day 7 Plan](../../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)

---

## Next Steps

1. **Run initial audit** on production URLs
2. **Document baseline scores** in this file
3. **Create issues** for scores below target
4. **Implement fixes** prioritized by impact
5. **Re-audit** after fixes
6. **Set up CI/CD** automation

---

**Last Updated:** 2025-11-02  
**Status:** ⏳ Pending initial audit  
**Next Review:** After production deployment

