# Future Migration: JSON Files → Authenticated API Routes

**Date:** 2025-11-04  
**Status:** Planning Phase  
**Priority:** Medium (Before enterprise/firewall deployment)

---

## Problem Statement

**Current:** JSON files served from `/public/data/*.json`  
**Future:** Enterprise/firewall deployment where `/public` files aren't accessible  
**Requirement:** Authenticated API routes to serve JSON data

---

## Solution: Authenticated JSON API Routes

### Create API Routes

**1. `/api/content/prompts`** - Serve prompts.json
**2. `/api/content/patterns`** - Serve patterns.json  
**3. `/api/content/learning`** - Serve learning.json

### Implementation

```typescript
// src/app/api/content/prompts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';

export async function GET(request: NextRequest) {
  // RBAC: Authenticated users only
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Load from JSON file (server-side only)
    const prompts = await loadPromptsFromJson();
    
    return NextResponse.json(
      {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        prompts,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600', // 1 hour cache
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load prompts' },
      { status: 500 }
    );
  }
}
```

### Update Clients

**Before (Public):**
```typescript
const response = await fetch('/data/prompts.json');
```

**After (Authenticated):**
```typescript
const response = await fetch('/api/content/prompts', {
  headers: {
    // NextAuth handles cookies automatically
  },
});
```

---

## Benefits

✅ **Works Behind Firewall**
- Authenticated API routes accessible behind firewall
- RBAC/permissions ready

✅ **Still Fast**
- Serves static JSON (no MongoDB query)
- Cached (1 hour cache headers)

✅ **Low Cost**
- Free tier compatible
- Minimal processing (just file read + JSON parse)

✅ **Backward Compatible**
- Can support both `/public` and `/api` routes during migration
- Gradual rollout possible

---

## Migration Checklist

- [ ] Create `/api/content/prompts` route
- [ ] Create `/api/content/patterns` route
- [ ] Create `/api/content/learning` route
- [ ] Add RBAC checks (authenticated users)
- [ ] Add caching headers (1 hour)
- [ ] Update `loadPromptsFromJson` to support API fetch
- [ ] Update `loadPatternsFromJson` to support API fetch
- [ ] Update `loadLearningResourcesFromJson` to support API fetch
- [ ] Test behind firewall environment
- [ ] Update documentation

---

## Cost Analysis

**Current (Public JSON):**
- Cost: $0 (static files)
- Speed: ⚡⚡⚡⚡⚡ (CDN cached)
- Works behind firewall: ❌ No

**Future (Authenticated API):**
- Cost: $0 (static JSON served via API route)
- Speed: ⚡⚡⚡⚡ (slightly slower than public, but still fast)
- Works behind firewall: ✅ Yes

**MongoDB Direct Query:**
- Cost: $ (database reads)
- Speed: ⚡⚡⚡ (cold starts, query time)
- Works behind firewall: ✅ Yes

**Winner:** JSON API routes for display, MongoDB for RAG/search

