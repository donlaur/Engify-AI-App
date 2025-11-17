# MongoDB Connection Optimization Plan

**Date:** 2025-11-09  
**Goal:** Reduce MongoDB connections by 70-90% to prevent M0 pool exhaustion

## Current State

**M0 Limits:**
- Max connections: 500
- Current usage: 80%+ (400+ connections)
- **Problem:** Hitting limits, causing fallbacks

**Connection Usage:**
- Per page request: ~1 connection (auth)
- Per AI request: ~2 connections (auth + usage tracking)
- Peak: 100-200 connections

---

## Optimization Targets

### ✅ DONE - Content Collections (ISR)
- `prompts` (296 docs) - Now uses JSON ISR
- `patterns` (18 docs) - Now uses JSON ISR
- `learning_resources` (20 docs) - Has JSON ISR
- **Impact:** Eliminated ~90% of content queries

### 🔴 CRITICAL - AI Usage Tracking (Write Heavy)

**Current:** Every AI request writes to MongoDB immediately

**File:** `src/lib/ai/usage-tracker.ts`

**Problem:**
```typescript
// CURRENT: 1 DB write per AI request
await db.collection('ai_usage').insertOne(usageDoc);
```

**Solution: Batch Writes**
```typescript
// NEW: Buffer 50 requests, bulk insert every 30s
const usageBuffer: UsageDoc[] = [];

function trackUsage(doc: UsageDoc) {
  usageBuffer.push(doc);
  
  if (usageBuffer.length >= 50) {
    flushBuffer();
  }
}

async function flushBuffer() {
  if (usageBuffer.length === 0) return;
  
  const batch = [...usageBuffer];
  usageBuffer.length = 0;
  
  await db.collection('ai_usage').insertMany(batch);
}

// Flush every 30s
setInterval(flushBuffer, 30000);
```

**Impact:** Reduce AI tracking connections by 90%

---

### 🟡 HIGH PRIORITY - Analytics Tracking

**Current:** Every user event writes to MongoDB

**File:** `src/app/api/analytics/track/route.ts`

**Problem:** Same as AI usage - 1 write per event

**Solution:** Same batching strategy

**Impact:** Reduce analytics connections by 80%

---

### 🟡 MEDIUM PRIORITY - User Stats Endpoints

**Current:** Two duplicate endpoints

**Files:**
- `src/app/api/user-stats/route.ts`
- `src/app/api/user/stats/route.ts`

**Solution:** 
1. Consolidate into one endpoint
2. Add Redis cache (5 min TTL)
3. Reduce query frequency

**Impact:** Reduce user stats queries by 50%

---

### 🟢 LOW PRIORITY - Platform Stats

**Status:** ✅ Already cached in Redis (1 hour TTL)

**File:** `src/lib/stats/fetch-platform-stats.ts`

**No action needed**

---

## Implementation Priority

### Phase 1: Batch Writes (This Week)

**Goal:** Reduce write connections by 85%

1. **AI Usage Batching** (2 hours)
   - Create buffer system
   - Implement flush logic
   - Add error handling
   - Test with load

2. **Analytics Batching** (1 hour)
   - Reuse buffer pattern
   - Add to analytics endpoint

**Files to modify:**
- `src/lib/ai/usage-tracker.ts`
- `src/app/api/analytics/track/route.ts`

**Testing:**
```bash
# Load test with 100 concurrent AI requests
# Before: 200 connections
# After: 20 connections (90% reduction)
```

---

### Phase 2: User Stats Optimization (Next Week)

**Goal:** Reduce read connections by 50%

1. **Consolidate Endpoints** (1 hour)
   - Merge duplicate endpoints
   - Update frontend calls

2. **Add Redis Cache** (1 hour)
   - Cache user stats for 5 min
   - Invalidate on user updates

**Files to modify:**
- `src/app/api/user-stats/route.ts` (keep this one)
- `src/app/api/user/stats/route.ts` (delete)

---

### Phase 3: Monitoring (Ongoing)

**Add Metrics:**
1. Connection pool usage (%)
2. Buffer flush frequency
3. Cache hit rates
4. Query response times

**Alerts:**
- Connection pool > 60% (warning)
- Connection pool > 80% (critical)
- Buffer flush failures

---

## Expected Results

### Before Optimization:
- Peak connections: 400+ (80%+ of limit)
- AI request: 2 connections each
- Analytics event: 1 connection each
- **Risk:** Frequent pool exhaustion

### After Optimization:
- Peak connections: 100-150 (20-30% of limit)
- AI request: 0.04 connections each (batched)
- Analytics event: 0.02 connections each (batched)
- **Risk:** Minimal, plenty of headroom

---

## Batch Write Implementation

### Core Buffer System

```typescript
// src/lib/db/batch-writer.ts
export class BatchWriter<T> {
  private buffer: T[] = [];
  private collectionName: string;
  private maxSize: number;
  private flushInterval: number;
  private timer: NodeJS.Timeout;

  constructor(
    collectionName: string,
    maxSize = 50,
    flushInterval = 30000
  ) {
    this.collectionName = collectionName;
    this.maxSize = maxSize;
    this.flushInterval = flushInterval;
    
    // Auto-flush every interval
    this.timer = setInterval(() => this.flush(), flushInterval);
  }

  async add(doc: T): Promise<void> {
    this.buffer.push(doc);
    
    // Flush if buffer full
    if (this.buffer.length >= this.maxSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    
    const batch = [...this.buffer];
    this.buffer.length = 0;
    
    try {
      const db = await getMongoDb();
      await db.collection(this.collectionName).insertMany(batch);
      
      logger.info('Batch write successful', {
        collection: this.collectionName,
        count: batch.length,
      });
    } catch (error) {
      logger.error('Batch write failed', {
        collection: this.collectionName,
        count: batch.length,
        error,
      });
      
      // Re-add to buffer for retry
      this.buffer.unshift(...batch);
    }
  }

  destroy(): void {
    clearInterval(this.timer);
    this.flush(); // Final flush
  }
}

// Singleton instances
export const aiUsageWriter = new BatchWriter('ai_usage', 50, 30000);
export const analyticsWriter = new BatchWriter('analytics', 50, 30000);
```

### Usage in AI Tracker

```typescript
// src/lib/ai/usage-tracker.ts
import { aiUsageWriter } from '@/lib/db/batch-writer';

export async function trackAIUsage(data: AIUsageData) {
  // Add to buffer (non-blocking)
  await aiUsageWriter.add({
    ...data,
    timestamp: new Date(),
  });
  
  // No DB connection used here!
  // Batch will be written in background
}
```

---

## Rollback Plan

If batching causes issues:

1. **Immediate:** Revert to direct writes
2. **Investigate:** Check buffer overflow, flush failures
3. **Fix:** Adjust buffer size or flush interval
4. **Redeploy:** With fixes

**Monitoring during rollout:**
- Watch for lost events (buffer overflow)
- Check flush success rate
- Monitor connection pool usage

---

## Success Metrics

**Week 1:**
- [ ] AI usage batching deployed
- [ ] Analytics batching deployed
- [ ] Connection pool < 30% during peak
- [ ] No lost events (verified in logs)

**Week 2:**
- [ ] User stats consolidated
- [ ] Redis cache added
- [ ] Connection pool < 20% during peak
- [ ] Cache hit rate > 80%

**Ongoing:**
- [ ] Zero pool exhaustion alerts
- [ ] Sub-100ms query response times
- [ ] 90%+ uptime for MongoDB queries

---

## Related Files

- `docs/MONGODB_CONNECTION_AUDIT.md` - Full connection audit
- `docs/DATA_RESILIENCE_STRATEGY.md` - Fallback strategy
- `src/lib/ai/usage-tracker.ts` - AI usage tracking
- `src/app/api/analytics/track/route.ts` - Analytics tracking
- `src/lib/mongodb.ts` - Connection pool config

---

**Next Step:** Implement Phase 1 (Batch Writes) this week.
