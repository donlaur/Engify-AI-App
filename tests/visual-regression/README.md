# Visual Regression Testing

**Purpose**: Automatically detect unintended visual changes to the UI by comparing screenshots.

## 📁 Directory Structure

```
tests/visual-regression/
├── README.md                      # This file
├── visual-regression.test.ts      # Main test runner
├── specs/                         # Individual page specs
│   ├── baseline.spec.ts          # Baseline comparison tests
│   ├── homepage.spec.ts          # Homepage tests
│   ├── library.spec.ts           # Library page tests
│   └── patterns.spec.ts          # Patterns page tests
└── screenshots/                   # Screenshot storage
    ├── baseline/                  # Reference images (source of truth)
    │   ├── homepage-1920x1080.png
    │   ├── homepage-768x1024.png
    │   ├── homepage-375x667.png
    │   └── homepage-dark-1920x1080.png
    ├── current/                   # Latest test run screenshots
    │   └── (same structure as baseline)
    └── diff/                      # Visual differences highlighted
        └── (generated when differences detected)
```

## 🎯 What It Does

Visual regression testing captures screenshots of your application and compares them to baseline images to detect:

- **Layout changes** - Elements moved or resized
- **Styling changes** - Colors, fonts, spacing modified
- **Content changes** - Text or images altered
- **Responsive issues** - Breakpoint problems
- **Dark mode issues** - Theme inconsistencies

## 🚀 Running Tests

### Run All Visual Tests
```bash
pnpm test:visual
```

### Run Specific Test
```bash
pnpm test:visual -- tests/visual-regression/visual-regression.test.ts
```

### Update Baselines (After Intentional Changes)
```bash
# Delete old baselines
rm -rf tests/visual-regression/screenshots/baseline/*

# Run tests to generate new baselines
pnpm test:visual
```

## 📸 Screenshot Sizes

Tests capture screenshots at multiple viewport sizes:

| Size | Viewport | Device Type |
|------|----------|-------------|
| **1920x1080** | Desktop | Standard desktop monitor |
| **768x1024** | Tablet | iPad portrait |
| **375x667** | Mobile | iPhone SE |
| **1920x1080 (dark)** | Desktop | Dark mode |

## 🔍 How It Works

1. **Capture**: Puppeteer takes screenshots of pages
2. **Compare**: pixelmatch compares current vs baseline
3. **Threshold**: Differences > 1% trigger failure
4. **Diff Image**: Visual diff saved to `screenshots/diff/`

### Comparison Algorithm

```typescript
const diff = pixelmatch(
  baseline.data,
  current.data,
  diff.data,
  width,
  height,
  { threshold: 0.1 } // 10% tolerance
);

const diffPercentage = (diff / (width * height)) * 100;
```

## ⚙️ Configuration

### Test Configuration
Located in: `tests/visual-regression/visual-regression.test.ts`

```typescript
const BASE_URL = process.env.TEST_URL || 'http://localhost:3005';
const TIMEOUT = 30000; // 30 seconds
```

### Viewport Sizes
```typescript
const viewports = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};
```

## 📋 Best Practices

### 1. **Screenshot Management**
- ✅ **All screenshots are tracked in git** - baseline, current, and diff
- ✅ Provides visual history of UI changes over time
- ✅ Update baselines after intentional UI changes
- ✅ Commit diff images to show what changed
- ❌ Don't update baselines to "fix" failing tests without investigation

### 2. **Test Stability**
- Wait for page load before capturing
- Wait for animations to complete
- Hide dynamic content (timestamps, random data)
- Use consistent test data

### 3. **Diff Investigation**
When tests fail:
1. Check `screenshots/diff/` for visual differences
2. Verify if change was intentional
3. If intentional: Update baseline
4. If unintentional: Fix the bug

### 4. **Performance**
- Run visual tests in CI/CD
- Cache baseline images
- Run in parallel when possible
- Use headless browser

## 🐛 Troubleshooting

### Tests Failing After Deployment
**Cause**: Intentional UI changes not reflected in baselines  
**Solution**: Update baselines after verifying changes are correct

### Flaky Tests
**Cause**: Dynamic content, animations, or timing issues  
**Solution**: 
- Add wait conditions
- Hide dynamic elements
- Increase timeout
- Use data-testid for stability

### Large Diff Percentages
**Cause**: Font rendering differences, anti-aliasing  
**Solution**: 
- Adjust threshold (currently 1%)
- Use consistent fonts
- Run tests in same environment

### Missing Screenshots
**Cause**: Test timeout or page load failure  
**Solution**:
- Check dev server is running
- Increase timeout
- Check network connectivity

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Visual Regression Tests
  run: |
    pnpm test:visual
  env:
    TEST_URL: http://localhost:3005
```

### Pre-deployment Check
```bash
# Start dev server
pnpm dev:test &

# Wait for server
sleep 5

# Run visual tests
pnpm test:visual

# Kill dev server
kill %1
```

## 📊 Test Coverage

Current pages tested:
- ✅ Homepage (desktop, tablet, mobile, dark mode)
- ✅ Library page
- ✅ Patterns page
- 🔄 Learning pathways (planned)
- 🔄 Workbench (planned)

## 🎨 Screenshot Naming Convention

Format: `{page}-{width}x{height}[-{variant}].png`

Examples:
- `homepage-1920x1080.png` - Desktop homepage
- `homepage-375x667.png` - Mobile homepage
- `homepage-dark-1920x1080.png` - Dark mode desktop
- `library-768x1024.png` - Tablet library page

## 📝 Adding New Tests

1. **Create spec file**
```typescript
// tests/visual-regression/specs/newpage.spec.ts
import { test } from '@playwright/test';

test('newpage visual regression', async ({ page }) => {
  await page.goto('/newpage');
  await page.screenshot({ 
    path: 'tests/visual-regression/screenshots/baseline/newpage-1920x1080.png' 
  });
});
```

2. **Generate baseline**
```bash
pnpm test:visual
```

3. **Commit baseline**
```bash
git add tests/visual-regression/screenshots/baseline/newpage-*.png
git commit -m "Add visual regression baseline for newpage"
```

## 🔗 Related Documentation

- [Testing Strategy](../README.md)
- [E2E Tests](../e2e/README.md)
- [API Tests](../api/README.md)
- [Quality Gates](../../docs/development/CODE_QUALITY_REVIEW.md)

## 📞 Support

If visual tests are failing and you're not sure why:

1. Check the diff images in `screenshots/diff/`
2. Review recent UI changes
3. Verify test environment matches baseline environment
4. Check for dynamic content issues

---

**Remember**: Visual regression tests are your safety net. Don't ignore failures! 🛡️
