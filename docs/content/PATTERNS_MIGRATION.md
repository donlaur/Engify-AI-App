<!--
AI Summary: Migration of prompt patterns from TypeScript files to MongoDB for IP protection and maintainability.
Includes schema design, API endpoints, seeding script, and deletion strategy.
Part of Day 6 Content Hardening: Phase 1.
-->

# Phase 1: Patterns Migration to MongoDB

**Status:** ⚠️ In Progress  
**Part of:** [Day 6 Content Hardening](../planning/DAY_6_CONTENT_HARDENING.md) → Phase 1

## Overview

Move all 23 prompt patterns from TypeScript files to MongoDB to protect intellectual property in public repository.

## Technical Specification

### Schema Design

**File:** `src/lib/db/schemas/pattern.ts`

```typescript
import { z } from 'zod';

export const PatternSchema = z.object({
  _id: z.string().optional(),
  id: z.string(),
  name: z.string(),
  category: z.enum([
    'FOUNDATIONAL',
    'STRUCTURAL',
    'COGNITIVE',
    'METACOGNITIVE',
  ]),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string(),
  example: z.string(),
  useCases: z.array(z.string()),
  relatedPatterns: z.array(z.string()),
  icon: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Pattern = z.infer<typeof PatternSchema>;
```

### Database Indexes

**File:** `scripts/content/seed-patterns-to-db.ts`

```typescript
// Create indexes after seeding
await db.collection('patterns').createIndex({ id: 1 }, { unique: true });
await db.collection('patterns').createIndex({ category: 1 });
await db.collection('patterns').createIndex({ level: 1 });
await db
  .collection('patterns')
  .createIndex({ name: 'text', description: 'text' });
```

### API Endpoint

**Route:** `GET /api/patterns`

**File:** `src/app/api/patterns/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { PatternSchema } from '@/lib/db/schemas/pattern';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    const db = await getDb();
    let query = {};

    if (category) query.category = category;
    if (level) query.level = level;

    const patterns = await db.collection('patterns').find(query).toArray();

    return NextResponse.json({ success: true, patterns });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    );
  }
}
```

**Features:**

- Public read access (no auth required)
- Optional filtering: `?category=FOUNDATIONAL&level=advanced`
- MongoDB indexes optimize queries
- Returns validated PatternSchema objects

### Seeding Script

**File:** `scripts/content/seed-patterns-to-db.ts`

**Merge 3 source files:**

1. `src/data/prompt-patterns.ts` - 8 foundational patterns
2. `src/data/pattern-details.ts` - 8 structural patterns
3. `src/lib/pattern-constants.ts` - 7 cognitive patterns

**Output:** `✅ Inserted 23 patterns into MongoDB`

### Files to Delete After Migration

- `src/data/prompt-patterns.ts`
- `src/data/pattern-details.ts`
- `src/lib/pattern-constants.ts`

### Files to Keep (Examples Only)

- `src/data/examples/pattern-examples.ts` (2-3 patterns for documentation)

## Testing Checklist

- [ ] Run seed script: `pnpm exec tsx scripts/content/seed-patterns-to-db.ts`
- [ ] Verify 23 patterns in MongoDB
- [ ] Visit /patterns page
- [ ] Verify all patterns display correctly
- [ ] Test category filtering: `/patterns?category=COGNITIVE`
- [ ] Test level filtering: `/patterns?level=advanced`
- [ ] Verify links to individual pattern pages work
- [ ] Run build: `pnpm build`
- [ ] Verify site functions correctly without TS pattern files
- [ ] Delete pattern TS files
- [ ] Re-run build: `pnpm build`
- [ ] Test site again

## Migration Verification

### Before Migration

```bash
# Count patterns in TypeScript
grep -r "export const patterns" src/data/ src/lib/ | wc -l
# Expected: 3 files found
```

### After Migration

```bash
# Connect to MongoDB
mongosh "MONGODB_URI"
use engify
db.patterns.countDocuments()
# Expected: 23 patterns
```

## Related Documentation

- [Content Migration Plan](../operations/CONTENT_MIGRATION_PLAN.md)
- [Day 6 Content Hardening Plan](../planning/DAY_6_CONTENT_HARDENING.md)
- [Tag Taxonomy](./TAG_TAXONOMY.md)
- [What is Seeding?](../development/WHAT_IS_SEEDING.md)
- [ADR-007: Content Storage Strategy](../development/ADR/007-content-storage-strategy.md)
