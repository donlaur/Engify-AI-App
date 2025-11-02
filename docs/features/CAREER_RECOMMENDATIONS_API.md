<!--
AI Summary: Connect career recommendations component to existing CareerRecommendationService via API.
Replaces hardcoded recommendations with personalized user data.
Part of Day 6 Content Hardening: Phase 4.
-->

# Phase 4: Career Recommendations API

**Status:** ⚠️ In Progress  
**Part of:** [Day 6 Content Hardening](../planning/DAY_6_CONTENT_HARDENING.md) → Phase 4

## Problem Statement

CareerRecommendations component shows 3 hardcoded recommendations instead of personalized data.

## Solution

### API Endpoint

**Route:** `GET /api/career/recommendations`

**File:** `src/app/api/career/recommendations/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CareerRecommendationService } from '@/lib/services/CareerRecommendationService';

export async function GET() {
  try {
    // Authentication required
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recommendations from existing service
    const service = new CareerRecommendationService();
    const recommendations = await service.getRecommendations({
      userId: session.user.id,
      role: session.user.role,
      skills: session.user.skills || [],
      experience: session.user.experience,
    });

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
```

### Service Integration

**Uses Existing Service:** `CareerRecommendationService`

No new business logic needed - just wrap existing service with API endpoint.

**Input:**

- User ID (from session)
- Current role
- Skills array
- Experience level

**Output:**

```typescript
interface CareerRecommendation {
  title: string;
  description: string;
  category: string;
  nextSteps: string[];
  estimatedProgress: number;
}
```

### Component Update

**File:** `src/components/career/CareerRecommendations.tsx`

**Before:**

```typescript
const recommendations = [
  { title: 'Senior Engineer', description: '...' },
  { title: 'Staff Engineer', description: '...' },
  { title: 'Engineering Manager', description: '...' },
];
```

**After:**

```typescript
const { data } = await fetch('/api/career/recommendations').then((r) =>
  r.json()
);
const recommendations = data?.recommendations || [];
```

**Empty State:**

```typescript
{recommendations.length === 0 ? (
  <p className="text-muted-foreground">
    Complete your profile to get personalized career recommendations.
  </p>
) : (
  recommendations.map(rec => <RecommendationCard key={rec.title} recommendation={rec} />)
)}
```

## Related Documentation

- [Career Service](../operations/CONTENT_MIGRATION_PLAN.md)
- [Day 6 Content Hardening Plan](../planning/DAY_6_CONTENT_HARDENING.md)
- [User Profile Management](../development/CONFIGURATION.md)
