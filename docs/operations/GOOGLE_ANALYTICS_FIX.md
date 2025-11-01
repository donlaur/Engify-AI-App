# Fix: Google Analytics Not Reporting Data

## Issue: GA Shows "No data received"

The warning "Data collection isn't active for your website" means Google Analytics isn't receiving events.

## Root Causes & Fixes

### 1. **GA Only Loads in Production** ✅ Fixed

The component checks `if (process.env.NODE_ENV !== 'production')` and returns `null` in development.

**Fix:** Verify the env var is set in **Vercel Production**:

- Vercel Dashboard → Project → Settings → Environment Variables
- Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-1X4BJ3EEKD`
- Redeploy

### 2. **Check Script Loading**

**In Browser Console (on engify.ai):**

```javascript
// Check if gtag is loaded
console.log(typeof window.gtag); // Should be "function"

// Check if dataLayer exists
console.log(window.dataLayer); // Should be an array

// Manually send a test event
window.gtag('event', 'test_event', { test: true });
```

### 3. **Verify Tag Installation**

**Method 1: Google Tag Assistant**

1. Install [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Visit `https://engify.ai`
3. Click the extension icon
4. Check if GA tag is detected

**Method 2: Browser DevTools**

1. Open DevTools → Network tab
2. Filter by "google-analytics" or "gtag"
3. Visit `https://engify.ai`
4. Should see requests to `google-analytics.com/g/collect` or `googletagmanager.com`

### 4. **Common Issues**

**Issue: Ad blockers**

- GA4 requests are blocked by uBlock Origin, Privacy Badger, etc.
- **Test:** Disable ad blockers and visit the site

**Issue: Script not in `<head>`**

- ✅ Already fixed - `<GoogleAnalytics />` is in `<head>` in `layout.tsx`

**Issue: Wrong Measurement ID**

- Current: `G-1X4BJ3EEKD` (hardcoded fallback)
- **Verify:** Check GA Console → Admin → Data Streams → Web stream → Measurement ID matches

**Issue: Domain mismatch**

- GA stream URL: `https://www.engify.ai`
- **Verify:** Site is accessible at `www.engify.ai` (not just `engify.ai`)

### 5. **Quick Test**

**Create a test page** that manually fires an event:

```typescript
// src/app/test-ga/page.tsx
'use client';
import { useEffect } from 'react';

export default function TestGAPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'test_page_view', {
        page_title: 'Test Page',
        page_location: window.location.href,
      });
      console.log('✅ GA event sent');
    } else {
      console.error('❌ GA not loaded');
    }
  }, []);

  return <div>Check console for GA status</div>;
}
```

Visit `https://engify.ai/test-ga` and check console.

## Next Steps

1. ✅ Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in Vercel Production
2. ✅ Check browser console for GA errors
3. ✅ Test with Tag Assistant extension
4. ✅ Disable ad blockers and test
5. ✅ Verify domain matches (`www.engify.ai`)

---

**Most likely fix:** Set the env var in Vercel Production environment and redeploy!
