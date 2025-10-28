# Performance Strategy

## Core Principles

1. **Fast Initial Load** - < 2s First Contentful Paint
2. **Optimistic UI** - Show skeleton states, never blank screens
3. **Efficient Queries** - Indexed, paginated, cached
4. **Professional Polish** - Smooth transitions, no jank
5. **Business-Grade** - Enterprise-level performance

## Performance Targets

### Load Times

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### API Response Times

- **Database Queries**: < 100ms (p95)
- **API Endpoints**: < 200ms (p95)
- **Search**: < 150ms (p95)
- **Mutations**: < 300ms (p95)

### User Experience

- **No blank screens** - Always show skeleton states
- **Smooth transitions** - 60fps animations
- **Instant feedback** - Optimistic updates
- **Progressive loading** - Show content as it arrives

## Implementation Plan

### Phase 1: Skeleton States (Commits 102-103)

#### 1.1 Create Skeleton Components

```typescript
// Reusable skeleton primitives
-SkeletonCard - SkeletonText - SkeletonAvatar - SkeletonButton - SkeletonTable;
```

#### 1.2 Page-Level Skeletons

```typescript
- LibraryPageSkeleton (grid of SkeletonCards)
- PromptDetailSkeleton
- DashboardSkeleton
- WorkbenchSkeleton
```

#### 1.3 Replace Loading Spinners

```typescript
// Before: <LoadingSpinner />
// After: <LibraryPageSkeleton />

Benefits:
- Shows page structure immediately
- Reduces perceived load time
- Professional appearance
- No layout shift
```

### Phase 2: Database Optimization (Commits 104-105)

#### 2.1 Indexing Strategy

```typescript
// MongoDB indexes for common queries
prompts:
  - { category: 1, isPublic: 1, isFeatured: -1 }
  - { role: 1, isPublic: 1, views: -1 }
  - { tags: 1, isPublic: 1 }
  - { title: "text", description: "text" } // Full-text search
  - { createdAt: -1 }
  - { views: -1 }
  - { rating: -1 }

users:
  - { email: 1 } (unique)
  - { organizationId: 1, role: 1 }

auditLogs:
  - { userId: 1, timestamp: -1 }
  - { eventType: 1, timestamp: -1 }
  - { timestamp: -1 } (TTL index for retention)
```

#### 2.2 Query Optimization

```typescript
// Pagination
- Cursor-based pagination (not offset)
- Limit: 20 items per page
- Prefetch next page

// Projection
- Only select needed fields
- Exclude large fields (content) from list views
- Include content only in detail views

// Aggregation
- Use aggregation pipeline for complex queries
- Cache aggregation results
```

#### 2.3 Caching Strategy

```typescript
// Redis caching layers
L1: In-memory (Node.js)
  - Hot prompts (5 min TTL)
  - User sessions (15 min TTL)

L2: Redis
  - Prompt lists by category (10 min TTL)
  - Search results (5 min TTL)
  - User profiles (30 min TTL)
  - Pattern metadata (1 hour TTL)

L3: CDN
  - Static assets (1 year)
  - API responses with Cache-Control headers
```

### Phase 3: Frontend Optimization (Commits 106-107)

#### 3.1 Code Splitting

```typescript
// Route-based splitting (automatic with Next.js)
- /library -> library.chunk.js
- /workbench -> workbench.chunk.js
- /dashboard -> dashboard.chunk.js

// Component-based splitting
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <SkeletonHeavy />,
  ssr: false
});
```

#### 3.2 Image Optimization

```typescript
// Next.js Image component
- Automatic WebP/AVIF
- Lazy loading
- Responsive sizes
- Blur placeholder

// Icon optimization
- Use SVG sprites
- Inline critical icons
- Lazy load icon library
```

#### 3.3 Bundle Optimization

```typescript
// Tree shaking
- Import only what's used
- Centralized icon imports (done ✅)
- Remove unused dependencies

// Minification
- Terser for JS
- cssnano for CSS
- HTML minification

// Compression
- Brotli for text assets
- Gzip fallback
```

### Phase 4: React Query Integration (Commits 108-109)

#### 4.1 Setup React Query

```typescript
// Benefits:
- Automatic caching
- Background refetching
- Optimistic updates
- Deduplication
- Prefetching

// Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

#### 4.2 Query Hooks

```typescript
// usePrompts - List prompts with filters
// usePrompt - Single prompt detail
// useUserPrompts - User's saved prompts
// useSearchPrompts - Search with debouncing
// usePrefetchPrompt - Prefetch on hover
```

#### 4.3 Optimistic Updates

```typescript
// Immediate UI feedback
- Save to favorites -> Update UI instantly
- Rate prompt -> Show new rating immediately
- Copy prompt -> Show "Copied!" without delay

// Rollback on error
- Revert UI if mutation fails
- Show error toast
- Retry option
```

### Phase 5: Advanced Optimizations (Commits 110-111)

#### 5.1 Virtualization

```typescript
// For long lists (100+ items)
- Use react-window or react-virtualized
- Only render visible items
- Smooth scrolling
- Reduced memory usage
```

#### 5.2 Debouncing & Throttling

```typescript
// Search input
- Debounce: 300ms
- Show loading indicator
- Cancel previous requests

// Scroll events
- Throttle: 100ms
- Passive listeners
```

#### 5.3 Prefetching

```typescript
// Link hover prefetching
<Link href="/prompt/123" prefetch>
  <PromptCard onMouseEnter={() => prefetchPrompt(123)} />
</Link>

// Predictive prefetching
- Prefetch next page on scroll
- Prefetch popular prompts
- Prefetch user's recent prompts
```

## Skeleton State Examples

### Library Page Skeleton

```typescript
export function LibraryPageSkeleton() {
  return (
    <div className="container py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-12 w-64 mb-2" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Search Skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
```

### Prompt Card Skeleton

```typescript
export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  );
}
```

## Monitoring & Metrics

### Performance Monitoring

```typescript
// Web Vitals tracking
- Track FCP, LCP, CLS, FID, TTFB
- Send to analytics
- Alert on regressions

// Custom metrics
- API response times
- Database query times
- Cache hit rates
- Error rates
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- Run Lighthouse on every PR
- Fail if performance score < 90
- Track metrics over time
- Budget for bundle size
```

### Bundle Analysis

```bash
# Analyze bundle size
pnpm build
pnpm analyze

# Set budgets
- Main bundle: < 200KB
- Page chunks: < 100KB each
- Total JS: < 500KB
```

## Professional Polish Checklist

### Loading States

- [ ] No blank screens
- [ ] Skeleton states for all async content
- [ ] Smooth transitions (fade-in)
- [ ] Loading indicators for actions
- [ ] Progress bars for long operations

### Error States

- [ ] Friendly error messages
- [ ] Retry buttons
- [ ] Fallback UI
- [ ] Error boundaries
- [ ] Graceful degradation

### Animations

- [ ] Smooth page transitions
- [ ] Micro-interactions (hover, click)
- [ ] 60fps animations
- [ ] Reduced motion support
- [ ] No layout shift

### Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Color contrast (WCAG AA)

### Mobile Performance

- [ ] Touch-optimized
- [ ] Responsive images
- [ ] Reduced bundle for mobile
- [ ] Service worker for offline
- [ ] Fast 3G performance

## Implementation Priority

### P0 (Critical - This Week)

1. ✅ Skeleton components
2. ✅ Replace all loading spinners
3. ✅ Database indexes
4. ✅ Query optimization

### P1 (High - Next Week)

5. React Query integration
6. Optimistic updates
7. Image optimization
8. Code splitting

### P2 (Medium - Following Week)

9. Caching layer (Redis)
10. Prefetching
11. Virtualization
12. Performance monitoring

### P3 (Nice to Have)

13. Service worker
14. Advanced prefetching
15. Bundle analysis automation
16. Performance budgets

## Success Metrics

### Before Optimization

- FCP: ~3s
- LCP: ~4s
- Bundle: ~800KB
- Blank screens during load

### After Optimization (Target)

- FCP: < 1.5s (50% improvement)
- LCP: < 2.5s (37% improvement)
- Bundle: < 500KB (37% reduction)
- No blank screens (skeleton states)

### Business Impact

- **Reduced bounce rate**: Faster loads = more engagement
- **Higher conversion**: Better UX = more signups
- **Professional image**: Enterprise-grade performance
- **SEO benefits**: Better Core Web Vitals = higher rankings
