<!--
AI Summary: Deprecate hardcoded siteStats constant, migrate to real-time MongoDB queries.
Ensures accurate statistics as content grows.
Part of Day 6 Content Hardening: Phase 5.
-->

# Phase 5: Site Stats Migration

**Status:** ⚠️ In Progress  
**Part of:** [Day 6 Content Hardening](../planning/DAY_6_CONTENT_HARDENING.md) → Phase 5

## Problem Statement

`siteStats` constant has hardcoded numbers that become stale as content grows.

## Solution

### Deprecation Strategy

**File:** `src/lib/constants.ts` (lines 62-66)

```typescript
// DEPRECATED: Use /api/stats instead
// Keep for backwards compatibility during migration
export const siteStats = {
  totalPrompts: 90,
  totalPatterns: 15,
  totalUsers: 1000,
};
```

**Comment explains:**

- Why it's deprecated
- What to use instead
- When it will be removed

### API Endpoint

**Route:** `GET /api/stats`

**File:** `src/app/api/stats/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();

    // Get real counts from MongoDB
    const [totalPrompts, totalPatterns, totalUsers] = await Promise.all([
      db.collection('prompts').countDocuments({ isPublic: true }),
      db.collection('patterns').countDocuments(),
      db.collection('users').countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalPrompts,
        totalPatterns,
        totalUsers,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
```

**Features:**

- Public read access (no auth required)
- Real-time counts from MongoDB
- Cached on server (updates on revalidation)

### Components to Update

**File:** `src/components/chat/ChatWidget.tsx`

**Before:**

```typescript
import { siteStats } from '@/lib/constants';
// Using hardcoded stats
```

**After:**

```typescript
const [stats, setStats] = useState({ totalPrompts: 0, totalPatterns: 0 });

useEffect(() => {
  fetch('/api/stats')
    .then((r) => r.json())
    .then((data) => setStats(data.stats));
}, []);
```

**Other Files Using siteStats:**

- `src/components/home/StatsSection.tsx`
- `src/app/about/page.tsx`
- Any other marketing/landing pages

### Migration Checklist

- [ ] Search codebase: `grep -r "siteStats" src/`
- [ ] Update ChatWidget.tsx
- [ ] Update StatsSection.tsx
- [ ] Update about page
- [ ] Update any other usage
- [ ] Mark constant as deprecated
- [ ] Add TODO: Remove in Phase 7

## Related Documentation

- [MongoDB Configuration](../development/CONFIGURATION.md)
- [Day 6 Content Hardening Plan](../planning/DAY_6_CONTENT_HARDENING.md)
- [Content Migration Plan](./CONTENT_MIGRATION_PLAN.md)
