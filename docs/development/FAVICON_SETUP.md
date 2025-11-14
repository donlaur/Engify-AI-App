# Favicon Setup

## Overview
Favicon files from `favicon_io/` have been moved to the `public/` directory and configured for Next.js 15 App Router.

## Files Location
All favicon files are now in `/public/`:
- `favicon.ico` - Main favicon
- `favicon-16x16.png` - 16x16 favicon
- `favicon-32x32.png` - 32x32 favicon
- `apple-touch-icon.png` - Apple touch icon (180x180)
- `android-chrome-192x192.png` - Android Chrome icon (192x192)
- `android-chrome-512x512.png` - Android Chrome icon (512x512)
- `site.webmanifest` - Web manifest file

## Configuration

### 1. `src/app/manifest.ts`
Updated to include all favicon sizes:
- favicon.ico
- favicon-16x16.png
- favicon-32x32.png
- android-chrome-192x192.png
- android-chrome-512x512.png
- apple-touch-icon.png

### 2. `src/app/layout.tsx`
Updated metadata icons configuration:
- Multiple icon sizes for better browser support
- Apple touch icon for iOS devices
- Shortcut icon reference

### 3. `public/site.webmanifest`
Created/updated web manifest with:
- App name and description
- Icon references for Android
- Theme colors
- Display mode

## How It Works
1. Next.js automatically serves files from the `public/` directory at the root URL
2. The `manifest.ts` file generates the web app manifest
3. The `layout.tsx` metadata provides icon references for SEO and browser tabs
4. The `site.webmanifest` file provides additional PWA support

## Browser Support
- **Desktop browsers**: Uses favicon.ico and PNG sizes
- **iOS Safari**: Uses apple-touch-icon.png
- **Android Chrome**: Uses android-chrome icons via manifest
- **PWA**: Uses site.webmanifest for app installation

## Cleanup
The `favicon_io/` folder can be removed after verifying favicons work correctly:
```bash
rm -rf favicon_io/
```

## Testing
To verify favicons are working:
1. Check browser tab for favicon
2. Test on mobile devices (iOS/Android)
3. Check PWA installation support
4. Verify manifest.json is accessible at `/site.webmanifest`

## References
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Favicon Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preconnect)

