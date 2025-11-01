# Google Analytics Verification Guide

## ✅ Current Status

Your `window.gtag` function exists and is working! This confirms Google Analytics is loaded.

## Quick Verification Steps

### 1. Check DataLayer (Run in Browser Console)

```javascript
// Check if dataLayer exists and has data
console.log('DataLayer:', window.dataLayer);

// Should show an array with config objects
// Example: [{...}, {command: 'config', targetId: 'G-1X4BJ3EEKD', ...}]
```

### 2. Check Network Requests

1. Open Chrome DevTools → Network tab
2. Filter by "gtag" or "google-analytics"
3. You should see:
   - `www.googletagmanager.com/gtag/js?id=G-1X4BJ3EEKD` (script load)
   - `google-analytics.com/g/collect?...` (page view tracking)

### 3. Manually Trigger a Test Event

```javascript
// In browser console, trigger a test page view
window.gtag('config', 'G-1X4BJ3EEKD', {
  page_path: '/test-page',
  page_title: 'Test Page'
});

// Check Network tab - should see a new /collect request
```

### 4. Check Google Analytics Dashboard

**Real-time Reports** (shows immediately):
1. Go to Google Analytics dashboard
2. Reports → Realtime → Overview
3. Visit your site - should see yourself as an active user within 30 seconds

**Standard Reports** (24-48 hour delay):
- Reports → Engagement → Pages
- May take 24-48 hours to show data

## Troubleshooting

### If you don't see Network requests:

1. **Check if you're in production mode:**
   ```javascript
   // GA only loads when NODE_ENV === 'production'
   console.log('NODE_ENV:', process.env.NODE_ENV);
   ```

2. **Check if GA ID is correct:**
   - Current fallback: `G-1X4BJ3EEKD`
   - Verify in Vercel: Settings → Environment Variables → `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Should start with `G-`

3. **Check browser console for errors:**
   - Look for any GA-related warnings or errors
   - Check if ad blockers are blocking GA

4. **Verify component is rendering:**
   ```javascript
   // Check if GA scripts are in DOM
   document.querySelector('script[src*="googletagmanager.com"]');
   // Should return the script element
   ```

### Common Issues

**Issue: No data in GA dashboard**
- ✅ **Solution:** Check Real-time reports first (shows immediately)
- ✅ **Solution:** Wait 24-48 hours for standard reports
- ✅ **Solution:** Verify GA ID matches your property

**Issue: dataLayer is empty**
- ❌ **Problem:** GA scripts may not have loaded
- ✅ **Solution:** Check Network tab for script requests
- ✅ **Solution:** Verify no ad blockers are active

**Issue: Multiple page views tracked**
- ✅ **Fixed:** We set `send_page_view: false` and track manually
- ✅ **Verify:** Check Network tab - should see 1 /collect per page navigation

## Current Configuration

- **GA Measurement ID:** `G-1X4BJ3EEKD` (fallback) or `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Loading Strategy:** `afterInteractive` (non-blocking)
- **Page Tracking:** Manual via `useEffect` on route changes
- **Production Only:** Yes (only loads when `NODE_ENV === 'production'`)

## Next Steps

1. ✅ **Verify Network Requests** - Check DevTools Network tab
2. ✅ **Check Real-time Reports** - GA Dashboard → Realtime
3. ✅ **Wait 24-48 hours** - Standard reports take time to populate
4. ✅ **Verify Environment Variable** - Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in Vercel

## Testing Commands

Run these in browser console to verify:

```javascript
// 1. Check gtag function
console.log('gtag:', window.gtag);
// Should show: ƒ gtag(){dataLayer.push(arguments);}

// 2. Check dataLayer
console.log('dataLayer:', window.dataLayer);
// Should show array with config objects

// 3. Check GA scripts
console.log('GA Script:', document.querySelector('script[src*="googletagmanager.com"]'));
// Should show script element

// 4. Manually trigger test
window.gtag('event', 'test_event', { test: true });
// Check Network tab for /collect request
```

