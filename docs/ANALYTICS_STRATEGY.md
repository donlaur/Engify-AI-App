# Analytics Strategy

**Date:** 2025-11-09  
**Goal:** Track prompt usage without MongoDB writes

## Solution: Google Analytics Events

### Why GA Instead of Custom Analytics?

1. **Zero MongoDB connections** - No database writes
2. **Already have it** - Vercel Analytics + GA already installed
3. **Better insights** - GA has better reporting than we'd build
4. **Free** - No cost, no infrastructure
5. **Real-time** - Instant tracking, no delays

---

## What We Track

### Prompt Interactions
- **View** - When someone views a prompt page
- **Copy** - When someone copies a prompt
- **Favorite** - When someone favorites a prompt
- **Execute** - When someone runs a prompt
- **Share** - When someone shares a prompt

### Pattern Interactions
- **View** - When someone views a pattern page

### Learning Resources
- **View** - When someone views a learning resource

---

## Implementation

### Client-Side Tracking

```typescript
import { trackPromptView, trackPromptCopy, trackPromptFavorite } from '@/lib/analytics/ga-events';

// On prompt page load
trackPromptView(promptId, promptTitle);

// When user copies
trackPromptCopy(promptId, promptTitle);

// When user favorites
trackPromptFavorite(promptId, promptTitle);
```

### What Gets Sent to GA

```javascript
gtag('event', 'favorite', {
  event_category: 'prompt_interaction',
  event_label: 'prompt-id-123',
  prompt_id: 'prompt-id-123',
  prompt_title: 'Code Review Assistant',
});
```

---

## Viewing Analytics in GA

### Custom Reports

**Top Prompts by Views:**
- Event Category: `prompt_interaction`
- Event Action: `view`
- Group by: `event_label` (prompt ID)

**Top Prompts by Favorites:**
- Event Category: `prompt_interaction`
- Event Action: `favorite`
- Group by: `event_label`

**Prompt Engagement Funnel:**
1. Views (all users)
2. Copies (engaged users)
3. Favorites (power users)
4. Executions (active users)

### GA4 Exploration

Create custom exploration:
- Dimension: `prompt_id`, `prompt_title`
- Metrics: Event count
- Filter: `event_category = 'prompt_interaction'`
- Breakdown: By `event_action` (view, copy, favorite, execute)

---

## Benefits Over Custom Analytics

### Custom System (What We Had):
- ❌ MongoDB writes on every event
- ❌ Connection pool exhaustion
- ❌ Need to build dashboards
- ❌ Need to maintain infrastructure
- ❌ Limited to what we build

### Google Analytics:
- ✅ Zero database writes
- ✅ Zero connection usage
- ✅ Built-in dashboards
- ✅ No maintenance
- ✅ Advanced segmentation, funnels, cohorts
- ✅ Real-time reporting
- ✅ Integration with other Google tools

---

## Migration Plan

### Phase 1: Switch to GA (Done)
- ✅ Created GA event tracker
- ✅ Updated FavoriteButton to use GA
- ✅ Zero MongoDB writes

### Phase 2: Add More Tracking (Next)
- [ ] Track prompt views on page load
- [ ] Track prompt copies
- [ ] Track pattern views
- [ ] Track learning resource views

### Phase 3: Remove Old System (Later)
- [ ] Remove `analytics_events` collection
- [ ] Remove `prompt_stats` collection
- [ ] Remove `/api/analytics/track` endpoint
- [ ] Remove Redis tracker (if not using)

---

## Code Examples

### Track Prompt View (Page Load)

```typescript
// src/app/prompts/[slug]/page.tsx
import { trackPromptView } from '@/lib/analytics/ga-events';

export default function PromptPage({ prompt }) {
  // Track view on mount
  useEffect(() => {
    trackPromptView(prompt.id, prompt.title);
  }, [prompt.id, prompt.title]);
  
  return <PromptDetail prompt={prompt} />;
}
```

### Track Prompt Copy

```typescript
// src/components/prompts/CopyButton.tsx
import { trackPromptCopy } from '@/lib/analytics/ga-events';

function handleCopy() {
  navigator.clipboard.writeText(prompt.content);
  trackPromptCopy(prompt.id, prompt.title);
}
```

### Track Prompt Execute

```typescript
// src/components/workbench/ExecuteButton.tsx
import { trackPromptExecute } from '@/lib/analytics/ga-events';

async function handleExecute() {
  const result = await executePrompt(prompt, model);
  trackPromptExecute(prompt.id, prompt.title, model);
}
```

---

## GA Dashboard Setup

### Custom Dashboard Widgets

1. **Top 10 Prompts by Views**
   - Widget: Table
   - Metric: Event count
   - Dimension: prompt_title
   - Filter: event_action = 'view'

2. **Prompt Engagement Rate**
   - Widget: Scorecard
   - Metric: (Favorites / Views) * 100
   - Shows % of viewers who favorite

3. **Daily Prompt Activity**
   - Widget: Time series
   - Metric: Event count
   - Dimension: Date
   - Breakdown: event_action

4. **Prompt Funnel**
   - Widget: Funnel
   - Steps: View → Copy → Favorite → Execute

---

## Comparison: Before vs After

### Before (Custom Analytics)
```
User favorites prompt
  ↓
POST /api/analytics/track
  ↓
MongoDB write (analytics_events)
  ↓
MongoDB write (prompt_stats)
  ↓
2 connections used
  ↓
Slow response (50-100ms)
```

### After (GA Events)
```
User favorites prompt
  ↓
gtag('event', 'favorite', {...})
  ↓
Sent to GA (async, non-blocking)
  ↓
0 connections used
  ↓
Instant response (0ms)
```

---

## Cost Savings

### Custom Analytics:
- MongoDB connections: 100-200/day
- Connection pool usage: 20-40%
- Infrastructure: Need to maintain
- Development: Need to build dashboards

### GA Events:
- MongoDB connections: 0
- Connection pool usage: 0%
- Infrastructure: None (Google handles it)
- Development: Use GA dashboards

**Savings:** ~30% reduction in MongoDB connection usage

---

## Related Files

- `src/lib/analytics/ga-events.ts` - GA event tracking functions
- `src/components/prompts/FavoriteButton.tsx` - Example usage
- `docs/MONGODB_CONNECTION_AUDIT.md` - Connection audit
- `docs/MONGODB_OPTIMIZATION_PLAN.md` - Optimization plan

---

## Next Steps

1. Add GA tracking to all prompt interactions
2. Create GA custom dashboard
3. Remove old analytics system
4. Monitor GA reports for insights

**Result:** Zero database writes for analytics, better insights, no maintenance.
