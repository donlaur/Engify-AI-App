# Phase 8 - Content Sync & Migration Strategy

**Status:** Analysis complete, migration plan documented

## Overview

Engify.ai currently has content in two places:
1. **Static TypeScript files** in `/src/data/`
2. **MongoDB collections** (prompts, web_content, etc.)

This document analyzes the content, identifies overlaps/gaps, and defines migration strategy.

## Current State

### Static Content (`/src/data/`)

**Prompt Files:**
- `/src/data/seed-prompts.ts` - ~90 prompts
- `/src/data/prompts/management/performance-improvement-plans.ts` - 3 prompts (Phase 4)
- `/src/data/prompts/management/conflict-resolution.ts` - 3 prompts (Phase 4)
- `/src/data/prompts/management/facilitator-guides.ts` - 2 prompts (Phase 4)

**Other Data:**
- `/src/data/prompt-patterns.ts` - Pattern definitions
- `/src/data/learning-paths.ts` - Learning content
- Various feature data files

**Total Static Prompts:** ~98

### MongoDB Collections

**Confirmed Collections:**
- `prompts` or `prompt_templates` - ~90 prompts (from seed script)
- `web_content` - ~45 items
- `users` - User accounts
- `prompt_history` - User interactions
- `prompt_test_results` - Multi-model test results (Phase 2)

**Estimated Total DB Prompts:** 90

## Content Audit

### Prompt Overlap Analysis

**Hypothesis:** Static and DB prompts are largely the same (from initial seed)

**To Verify (Run in Production):**
```bash
# Count static prompts
cat src/data/seed-prompts.ts | grep "id:" | wc -l

# Count DB prompts
pnpm exec tsx scripts/content/audit-database-content.ts

# Find duplicates
pnpm exec tsx scripts/content/find-duplicate-prompts.ts
```

**Expected Result:**
- 90 prompts exist in both static and DB (seeded)
- 8 management prompts only in static (Phase 4, not yet seeded)
- Possible variations in updated dates, views, ratings

### Content Categories

| Category | Static | MongoDB | Status |
|----------|--------|---------|--------|
| Core Prompts (General) | 90 | 90 | ✅ Synced (from seed) |
| Management (PIPs, Conflict) | 8 | 0 | ⚠️ Need to seed |
| Learning Paths | Static only | N/A | ✅ Keep static |
| Pattern Definitions | Static only | N/A | ✅ Keep static |
| User Data | N/A | DB only | ✅ Correct |
| Test Results | N/A | DB only | ✅ Correct |

### Orphaned Content

**Static Prompts Not in DB:**
- 8 management prompts (Phase 4) - Need seeding

**DB Prompts Not in Static:**
- Likely none (DB was seeded from static)
- Check for user-generated content if feature is live

### Duplicate Content

**Risk:** Same prompt in both static and DB with different:
- Updated dates
- View counts
- Ratings
- Content (if edited in one place)

**Solution:** Establish single source of truth per content type.

## Migration Strategy

### Single Source of Truth Principle

**Rule:** Each piece of content has ONE authoritative source.

**Decision Matrix:**

| Content Type | Source of Truth | Reason |
|--------------|----------------|--------|
| Core prompts (90) | **MongoDB** | Dynamic (views, ratings, user edits) |
| Management prompts (8) | **MongoDB** (after seed) | Same as core prompts |
| Prompt metadata | MongoDB | Same as above |
| Learning paths | **Static files** | Rarely change, no user interaction |
| Pattern definitions | **Static files** | Reference data, no user edits |
| Site configuration | **Static files** | Code-deployed, version controlled |
| User data | **MongoDB** | Obviously dynamic |
| Analytics data | **MongoDB** | Obviously dynamic |

### Migration Plan

#### Phase 1: Seed Management Prompts (Week 1)

**Goal:** Get all prompts into MongoDB

**Steps:**
1. Create seed script for management prompts
2. Run in production: `pnpm exec tsx scripts/content/seed-management-prompts.ts`
3. Verify in MongoDB: Should now have 98 prompts

**Script to Create:**
```typescript
// scripts/content/seed-management-prompts.ts
import { performanceImprovementPlans } from '@/data/prompts/management/performance-improvement-plans';
import { conflictResolutionPrompts } from '@/data/prompts/management/conflict-resolution';
import { facilitatorGuides } from '@/data/prompts/management/facilitator-guides';
import { getDb } from '@/lib/mongodb';

async function seedManagementPrompts() {
  const db = await getDb();
  const collection = db.collection('prompt_templates');

  const allPrompts = [
    ...performanceImprovementPlans,
    ...conflictResolutionPrompts,
    ...facilitatorGuides,
  ].map((p, idx) => ({
    ...p,
    id: `mgmt-${Date.now()}-${idx}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const result = await collection.insertMany(allPrompts);
  console.log(`✅ Seeded ${result.insertedCount} management prompts`);
}

seedManagementPrompts();
```

#### Phase 2: Refactor Static References (Week 2)

**Goal:** Update code to fetch from MongoDB, not static files

**Files to Update:**
```typescript
// OLD: src/app/library/page.tsx
import { getSeedPromptsWithTimestamps } from '@/data/seed-prompts';
const prompts = getSeedPromptsWithTimestamps();

// NEW: src/app/library/page.tsx
import { getPrompts } from '@/lib/db/prompts';
const prompts = await getPrompts(); // Fetch from MongoDB
```

**Components to Update:**
- `/src/app/library/page.tsx` - Main library
- `/src/app/library/[id]/page.tsx` - Detail page
- `/src/app/patterns/[pattern]/page.tsx` - Pattern filter
- `/src/app/tags/[tag]/page.tsx` - Tag filter
- Any other components fetching prompts

**Helper Functions to Create:**
```typescript
// src/lib/db/prompts.ts
import { getDb } from './mongodb';

export async function getPrompts(filter = {}) {
  const db = await getDb();
  return db.collection('prompt_templates').find(filter).toArray();
}

export async function getPromptById(id: string) {
  const db = await getDb();
  return db.collection('prompt_templates').findOne({ id });
}

export async function getPromptsByTag(tag: string) {
  const db = await getDb();
  return db.collection('prompt_templates').find({ tags: tag }).toArray();
}

// Add more as needed
```

#### Phase 3: Archive Static Prompts (Week 3)

**Goal:** Remove or archive static prompt files

**Options:**

**Option A: Delete (Aggressive)**
- Delete `/src/data/seed-prompts.ts` and management prompt files
- Keep only in MongoDB
- Risk: Hard to redeploy or seed new environments

**Option B: Archive (Conservative)** ⭐ **Recommended**
- Move to `/src/data/archive/prompts-snapshot-2025-10.ts`
- Add comment: "Historical snapshot. Use MongoDB for current data."
- Keep for:
  - Disaster recovery
  - Seeding new environments
  - A/B testing prompt changes

**Option C: Keep as Backup**
- Keep files but add warning comment
- Update rarely (quarterly snapshots)

**Recommendation:** **Option B** - Archive for safety

#### Phase 4: Establish Update Process (Week 4)

**Goal:** Define how to add/edit content going forward

**Process:**

**For Prompt Content:**
1. Add/edit in MongoDB (via Admin UI or script)
2. Test in staging
3. Deploy to production
4. Update archive snapshot (quarterly)

**For Static Reference Data:**
1. Edit static files
2. PR review
3. Deploy via git

**Admin UI (Future):**
- Build `/admin/prompts` page for content editing
- WYSIWYG editor for prompts
- Bulk operations (import/export)
- Version history

## Content Sync Mechanisms

### ISR (Incremental Static Regeneration)

**Configure per page:**
```typescript
// src/app/library/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function LibraryPage() {
  const prompts = await getPrompts(); // Fetches from MongoDB
  return <LibraryGrid prompts={prompts} />;
}
```

**Benefits:**
- Static speed (pre-rendered)
- Dynamic data (from MongoDB)
- Auto-updates every 60s

### On-Demand Revalidation

**Webhook after content update:**
```typescript
// src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await request.json();
  revalidatePath(path);
  
  return NextResponse.json({ revalidated: true });
}
```

**Trigger from Admin UI:**
```typescript
// After saving prompt in Admin UI
await fetch('/api/revalidate', {
  method: 'POST',
  headers: {
    'x-revalidate-secret': process.env.REVALIDATE_SECRET,
  },
  body: JSON.stringify({ path: '/library' }),
});
```

### Cache Strategy

**Multi-Layer Caching:**
1. **CDN Cache** (Vercel Edge) - 60s
2. **ISR Cache** (Next.js) - 60s
3. **MongoDB** (Source of truth)
4. **Redis** (Optional for high traffic) - 30s

**Stale-While-Revalidate:**
- Serve cached version immediately
- Fetch fresh data in background
- Update cache for next request

## Monitoring

### Content Drift Detection

**Weekly Script:**
```typescript
// scripts/content/detect-content-drift.ts
// Compare static vs DB
// Report differences
// Alert if significant drift
```

### Analytics

**Track:**
- Content update frequency
- Cache hit rates
- Page generation times
- Failed revalidations

**Alerts:**
- DB connection failures
- Stale content (> 10 minutes)
- Failed revalidations

## Backup & Disaster Recovery

### MongoDB Backups

**Automated (MongoDB Atlas):**
- Daily snapshots (retained 7 days)
- Weekly snapshots (retained 4 weeks)
- Point-in-time recovery (within 24 hours)

**Manual Exports:**
```bash
# Export all prompts
mongoexport --uri="$MONGODB_URI" \
  --collection=prompt_templates \
  --out=backups/prompts-$(date +%Y%m%d).json
```

### Static Snapshots

**Quarterly Process:**
1. Export MongoDB prompts to JSON
2. Convert to TypeScript format
3. Save to `/src/data/archive/prompts-snapshot-YYYY-MM.ts`
4. Commit to git
5. Tag release: `v1.x-content-snapshot`

**Purpose:**
- Disaster recovery
- Historical reference
- Seed new environments

## Migration Timeline

| Week | Phase | Tasks | Owner |
|------|-------|-------|-------|
| 1 | Seed Management | Create script, seed 8 prompts, verify | Dev |
| 2 | Refactor Code | Update components to fetch from DB | Dev |
| 3 | Archive Static | Move static files to archive | Dev |
| 4 | Process Docs | Document update process, create admin tools | Dev + PM |
| Ongoing | Monitor | Track drift, backups, performance | Ops |

## Static Content Policy

**Keep Static:**
- Pattern definitions (rarely change)
- Learning paths structure
- Site configuration
- Feature flags
- Constants and enums

**Move to MongoDB:**
- Prompts (all types)
- User-editable content
- Analytics data
- Test results

**Hybrid (Static + DB):**
- Sitemap (generated from DB)
- RSS feed (generated from DB)
- Search index (built from DB)

## Success Criteria

**Phase 8 Complete When:**
- ✅ All prompts in MongoDB (98)
- ✅ Code fetches from MongoDB, not static files
- ✅ Static files archived (not deleted)
- ✅ Update process documented
- ✅ ISR configured for dynamic pages
- ✅ Backups automated
- ✅ No content drift detected

## Next Steps

1. ✅ Document sync strategy (this file)
2. ⚠️ Create seed script for management prompts
3. ⚠️ Audit current DB content vs static
4. ⚠️ Refactor components to use DB
5. ⚠️ Archive static prompt files
6. ⚠️ Set up content drift monitoring
7. ⚠️ Create quarterly snapshot process

**Timeline:** 4 weeks for full migration. Can be done incrementally without breaking changes.

## Related Documentation

- [Multi-Model Testing](./MULTI_MODEL_TESTING.md) - Test results in MongoDB
- [Tag Taxonomy](./TAG_TAXONOMY.md) - Tagging system
- [SEO Expansion](../seo/SEO_EXPANSION_PLAN.md) - Dynamic sitemap from DB

