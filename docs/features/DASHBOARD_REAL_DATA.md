<!--
AI Summary: Remove mock achievements and hardcoded activity data from dashboard.
Display only real user gamification data from MongoDB with proper empty states.
Part of Day 6 Content Hardening: Phase 2.
-->

# Phase 2: Dashboard Real Data Implementation

**Status:** ⚠️ In Progress  
**Part of:** [Day 6 Content Hardening](../planning/DAY_6_CONTENT_HARDENING.md) → Phase 2

## Problem Statement

Dashboard shows 3 hardcoded achievements and empty activity array, making site appear non-functional.

## Solution

### Recent Activity Fix

**File:** `src/app/dashboard/page.tsx` (lines 94-99)

**Before:**

```typescript
const recentActivity: Array<{
  type: string;
  description: string;
  timestamp: Date;
}> = [];
```

**After:**

```typescript
const recentActivity = gamificationData?.recentActivity || [];
```

**Display Logic:**

```typescript
{recentActivity.length > 0 ? (
  recentActivity.map((activity, idx) => (
    <div key={idx}>{activity.description}</div>
  ))
) : (
  <p className="text-muted-foreground">No recent activity - start exploring prompts!</p>
)}
```

### Achievements Section Fix

**File:** `src/app/dashboard/page.tsx` (lines 353-395)

**Remove:** 3 hardcoded achievements ("Week Warrior", "Power User", "Pattern Explorer")

**Replace with:**

```typescript
// Fetch from gamificationData
const achievements = gamificationData?.achievements || [];

// Map IDs to definitions from achievements.ts
import { ACHIEVEMENTS } from '@/lib/gamification/achievements';

const displayAchievements = achievements.map((id) => ACHIEVEMENTS[id]);
```

**Empty State:**

```typescript
{achievements.length > 0 ? (
  displayAchievements.map(achievement => (
    <AchievementCard key={achievement.id} achievement={achievement} />
  ))
) : (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-4">
      No achievements yet - start exploring prompts to unlock your first badge!
    </p>
    <Link href="/prompts">
      <Button>Browse Prompts</Button>
    </Link>
  </div>
)}
```

### First Login Achievement

**File:** `src/lib/services/GamificationService.ts`

```typescript
export async function getUserGamification(userId: string) {
  const db = await getDb();
  let gamification = await db
    .collection('user_gamification')
    .findOne({ userId });

  if (!gamification) {
    // Create new gamification record
    gamification = await createGamificationRecord(userId);

    // Award "First Login" achievement
    await checkAchievements(userId);

    return gamification;
  }

  return gamification;
}
```

## Empty State Handling

### New Users See:

- ✅ "First Login" achievement (awarded automatically)
- "No recent activity - start exploring!" message
- Progress bars at 0/100 XP
- Call-to-action: "Browse Prompts" button

### Never Show:

- ❌ Completely blank sections
- ❌ Hardcoded mock achievements
- ❌ Fake activity data

## Related Documentation

- [Gamification Service](../architecture/FEEDBACK_LEARNING_SYSTEM.md)
- [Day 6 Content Hardening Plan](../planning/DAY_6_CONTENT_HARDENING.md)
- [OpsHub Dashboard](../operations/OPSHUB_DASHBOARD.md)
