# Mobile Strategy

**Mobile-First Design with Native App Roadmap**

---

## 🎯 Strategy Overview

### Phase 1: Mobile-First Web (Current)
- ✅ Responsive design (mobile → tablet → desktop)
- ✅ PWA (Progressive Web App)
- ✅ iOS/Android installable
- ✅ Offline support (planned)
- ✅ Touch-optimized UI

### Phase 2: Enhanced PWA (Month 2-3)
- 📱 Push notifications
- 📱 Background sync
- 📱 Native share API
- 📱 Camera/file access
- 📱 Biometric auth

### Phase 3: Native Apps (Month 4-6)
- 📱 React Native (iOS + Android)
- 📱 Or Swift (iOS) + Kotlin (Android)
- 📱 Native performance
- 📱 App Store distribution
- 📱 Deep linking

---

## 📱 Mobile-First Design Principles

### 1. Touch-First Interactions
```typescript
// ✅ Large touch targets (44x44px minimum)
<button className="min-h-[44px] min-w-[44px] p-4">
  Tap Me
</button>

// ✅ Swipe gestures (drawer, cards)
<Drawer>
  <DrawerContent>
    {/* Swipe to close */}
  </DrawerContent>
</Drawer>

// ✅ Pull-to-refresh
<div className="overscroll-y-contain">
  {/* Content */}
</div>
```

### 2. Mobile-First Breakpoints
```typescript
// Tailwind breakpoints (mobile-first)
sm: '640px',   // Small tablets
md: '768px',   // Tablets
lg: '1024px',  // Laptops
xl: '1280px',  // Desktops
2xl: '1536px', // Large desktops

// Usage
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding increases on larger screens */}
</div>
```

### 3. Responsive Typography
```css
/* Mobile: 14-16px base */
/* Tablet: 16px base */
/* Desktop: 16-18px base */

.text-base {
  @apply text-sm md:text-base lg:text-lg;
}
```

### 4. Bottom Navigation (Mobile)
```typescript
// Mobile: Bottom nav
// Desktop: Sidebar
<nav className="fixed bottom-0 left-0 right-0 md:static md:w-64">
  {/* Navigation items */}
</nav>
```

---

## 🔧 PWA Configuration

### Manifest (`public/manifest.json`)
```json
{
  "name": "Engify.ai",
  "short_name": "Engify",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "orientation": "portrait-primary"
}
```

### Service Worker (Next.js)
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... other config
});
```

### iOS Meta Tags (Already Added)
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<link rel="apple-touch-icon" href="/apple-icon-180.png" />
```

---

## 📐 Responsive Layout Patterns

### 1. Stack → Grid
```typescript
// Mobile: Stack vertically
// Desktop: Grid layout
<div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

### 2. Drawer → Sidebar
```typescript
// Mobile: Drawer (overlay)
// Desktop: Sidebar (persistent)
<div className="md:flex">
  {/* Mobile: Drawer */}
  <Drawer>
    <DrawerContent>
      <Sidebar />
    </DrawerContent>
  </Drawer>
  
  {/* Desktop: Persistent sidebar */}
  <aside className="hidden md:block md:w-64">
    <Sidebar />
  </aside>
  
  <main className="flex-1">
    {/* Content */}
  </main>
</div>
```

### 3. Bottom Sheet → Modal
```typescript
// Mobile: Bottom sheet (partial screen)
// Desktop: Centered modal
<Dialog>
  <DialogContent className="bottom-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

## 🎨 Mobile UI Components

### 1. Mobile Navigation
```typescript
// Bottom tab bar (mobile)
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
  <div className="flex justify-around p-2">
    <NavItem icon={Home} label="Home" />
    <NavItem icon={Search} label="Search" />
    <NavItem icon={User} label="Profile" />
  </div>
</nav>
```

### 2. Pull-to-Refresh
```typescript
// Using react-pull-to-refresh
import PullToRefresh from 'react-pull-to-refresh';

<PullToRefresh onRefresh={handleRefresh}>
  <div className="min-h-screen">
    {/* Content */}
  </div>
</PullToRefresh>
```

### 3. Swipeable Cards
```typescript
// Using framer-motion
import { motion } from 'framer-motion';

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(e, { offset, velocity }) => {
    if (offset.x > 100) handleSwipeRight();
    if (offset.x < -100) handleSwipeLeft();
  }}
>
  <Card />
</motion.div>
```

---

## 📱 Native App Strategy

### Option 1: React Native (Recommended)
**Pros**:
- ✅ Share code with web (80%+)
- ✅ Single codebase for iOS + Android
- ✅ Fast development
- ✅ Large community

**Cons**:
- ❌ Slightly less performant than native
- ❌ Some platform-specific code needed

**Tech Stack**:
```typescript
// Shared
- TypeScript
- React
- tRPC (via HTTP)
- Zod validation

// React Native Specific
- React Navigation
- React Native Paper (or NativeBase)
- Expo (for easier development)
```

### Option 2: Swift (iOS) + Kotlin (Android)
**Pros**:
- ✅ Best performance
- ✅ Full platform features
- ✅ Native look & feel

**Cons**:
- ❌ Separate codebases
- ❌ 2x development time
- ❌ 2x maintenance

**Shared**:
```typescript
// API layer (tRPC over HTTP)
- Same backend
- Same database
- Same business logic
```

---

## 🔄 Code Sharing Strategy

### Web ↔ React Native

**Shared (80%)**:
```typescript
// Business logic
src/lib/
  ├── utils/          # ✅ Shared
  ├── hooks/          # ✅ Shared (mostly)
  ├── services/       # ✅ Shared (API calls)
  └── types/          # ✅ Shared

// API
src/server/           # ✅ Shared (tRPC)
```

**Platform-Specific (20%)**:
```typescript
// UI Components
src/components/
  ├── web/            # Web-specific
  └── native/         # React Native-specific

// Navigation
src/navigation/
  ├── web/            # Next.js routing
  └── native/         # React Navigation
```

### Web ↔ Swift/Kotlin

**Shared (40%)**:
```typescript
// API contracts
- tRPC types (generate from TypeScript)
- Database schemas
- Business logic (in backend)
```

**Platform-Specific (60%)**:
```swift
// iOS (Swift)
- SwiftUI views
- Combine for state
- URLSession for API

// Android (Kotlin)
- Jetpack Compose views
- Flow for state
- Retrofit for API
```

---

## 🚀 Implementation Roadmap

### Phase 1: Mobile-First Web (Weeks 1-4)
- [x] Mobile-first layout
- [x] PWA manifest
- [x] iOS meta tags
- [ ] Touch-optimized components
- [ ] Bottom navigation
- [ ] Drawer components
- [ ] Responsive breakpoints
- [ ] Mobile testing

### Phase 2: Enhanced PWA (Weeks 5-8)
- [ ] Service worker
- [ ] Offline support
- [ ] Push notifications
- [ ] Background sync
- [ ] Install prompts
- [ ] Share API
- [ ] Camera access

### Phase 3: React Native (Weeks 9-16)
- [ ] Set up Expo project
- [ ] Share API layer
- [ ] Build core screens
- [ ] Navigation
- [ ] Authentication
- [ ] Push notifications
- [ ] App Store submission

### Phase 4: Native Apps (Optional, Weeks 17-24)
- [ ] Swift (iOS) setup
- [ ] Kotlin (Android) setup
- [ ] API integration
- [ ] Core features
- [ ] Platform-specific features
- [ ] App Store optimization

---

## 📊 Mobile Performance

### Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Mobile Score**: > 90
- **Bundle Size**: < 200KB (initial)
- **Images**: WebP, lazy loaded

### Optimization Strategies
```typescript
// 1. Code splitting
const Dashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <Skeleton />,
});

// 2. Image optimization
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>

// 3. Font optimization
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });

// 4. Prefetching
<Link href="/dashboard" prefetch>
  Dashboard
</Link>
```

---

## 🧪 Mobile Testing

### Browsers to Test
- ✅ iOS Safari (iPhone 12+)
- ✅ Chrome Mobile (Android)
- ✅ Samsung Internet
- ✅ Firefox Mobile

### Devices to Test
- ✅ iPhone 14 Pro (390x844)
- ✅ iPhone SE (375x667)
- ✅ Samsung Galaxy S23 (360x800)
- ✅ iPad Pro (1024x1366)

### Testing Tools
```bash
# Chrome DevTools
- Device emulation
- Network throttling
- Lighthouse audit

# BrowserStack
- Real device testing
- Multiple OS versions

# Playwright
- Automated mobile tests
```

---

## 📱 App Store Preparation

### iOS App Store
- **Name**: Engify.ai
- **Subtitle**: AI Adoption Made Easy
- **Keywords**: AI, prompt engineering, learning, education
- **Category**: Education, Productivity
- **Screenshots**: 6.5" iPhone, 12.9" iPad
- **Privacy Policy**: Required
- **Age Rating**: 4+

### Google Play Store
- **Title**: Engify.ai - AI Learning
- **Short Description**: Learn prompt engineering
- **Full Description**: 4000 characters
- **Category**: Education
- **Screenshots**: Phone, 7" tablet, 10" tablet
- **Content Rating**: Everyone

---

## ✅ Mobile Checklist

### PWA Basics
- [x] Manifest.json
- [x] iOS meta tags
- [x] Theme color
- [x] Icons (192px, 512px)
- [ ] Service worker
- [ ] Offline page

### Mobile UX
- [ ] Touch targets ≥ 44px
- [ ] Bottom navigation
- [ ] Drawer components
- [ ] Pull-to-refresh
- [ ] Swipe gestures
- [ ] Loading states
- [ ] Error states

### Performance
- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s
- [ ] TTI < 3s
- [ ] Images optimized
- [ ] Fonts optimized

### Testing
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Real device testing
- [ ] Touch interactions
- [ ] Orientation changes

---

## 🎯 Summary

**Current State**:
- ✅ Mobile-first layout configured
- ✅ PWA manifest created
- ✅ iOS meta tags added
- ✅ Responsive breakpoints set

**Next Steps**:
1. Build mobile-optimized components
2. Add service worker for offline
3. Test on real devices
4. Optimize performance
5. Plan React Native app

**Future**:
- React Native app (iOS + Android)
- Or native Swift/Kotlin apps
- App Store distribution
- Push notifications
- Native features

**This foundation supports both web and native mobile apps!** 📱

**Last Updated**: 2025-10-27  
**Status**: Active - Mobile-First Development
