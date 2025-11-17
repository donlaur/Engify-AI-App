# Redis Migration Strategy

**Date:** 2025-11-09  
**Goal:** Move high-frequency operations from MongoDB to Upstash Redis

## Why Redis?

**MongoDB M0 Tier Limits:**
- Max connections: 500
- Current usage: 80%+ (400+ connections)
- Problem: Connection pool exhaustion

**Redis Benefits:**
- In-memory (100x faster)
- Auto-expiry (TTL)
- Atomic operations
- Works across serverless instances
- Free tier: 10,000 commands/day

---

## Completed Migrations

### ✅ 1. Analytics Tracking
**Before:** MongoDB write on every event  
**After:** Redis counters, sync to MongoDB hourly

**Files:**
- `src/lib/analytics/redis-tracker.ts`
- `src/app/api/analytics/track/route.ts`
- `src/app/api/cron/sync-analytics/route.ts`

**Impact:**
- Zero real-time MongoDB writes
- 100x faster tracking
- Hourly bulk sync (1 write instead of thousands)

---

### ✅ 2. Rate Limiting
**Before:** In-memory Map (broken in serverless)  
**After:** Redis with sliding window

**Files:**
- `src/lib/middleware/rateLimit.ts`

**Impact:**
- Works across all serverless instances
- Proper rate limiting in production
- Auto-expiry of old data

---

## Planned Migrations

### 🔴 HIGH PRIORITY

#### 3. User Session Cache
**Current:** Every request queries MongoDB for user data  
**Proposed:** Cache user in Redis (5-min TTL)

**Implementation:**
```typescript
// src/lib/auth/user-cache.ts
async function getUserCached(userId: string) {
  const cached = await redis.get(`user:${userId}`);
  if (cached) return cached;
  
  const user = await db.collection('users').findOne({ _id: userId });
  await redis.set(`user:${userId}`, user, { ex: 300 }); // 5 min
  return user;
}
```

**Impact:** 50-70% reduction in user queries

---

#### 4. MFA Codes
**Current:** MongoDB with manual cleanup  
**Proposed:** Redis with auto-expiry

**Implementation:**
```typescript
// Generate MFA code
await redis.set(`mfa:${userId}`, code, { ex: 300 }); // 5 min expiry

// Verify MFA code
const stored = await redis.get(`mfa:${userId}`);
if (stored === code) {
  await redis.del(`mfa:${userId}`);
  return true;
}
```

**Impact:**
- Simpler code
- Auto-cleanup
- Faster verification

---

### 🟡 MEDIUM PRIORITY

#### 5. API Key Usage Tracking
**Current:** MongoDB query on every API call  
**Proposed:** Redis counters

**Implementation:**
```typescript
// Track usage
await redis.incr(`apikey:${keyId}:requests:${today}`);
await redis.expire(`apikey:${keyId}:requests:${today}`, 86400 * 30);

// Check limit
const count = await redis.get(`apikey:${keyId}:requests:${today}`);
if (count > limit) return false;
```

**Impact:** Faster API key validation

---

#### 6. Workbench Session State
**Current:** MongoDB for active sessions  
**Proposed:** Redis for hot sessions, MongoDB for history

**Implementation:**
```typescript
// Store active session
await redis.set(`workbench:${sessionId}`, state, { ex: 3600 });

// On session end, persist to MongoDB
const state = await redis.get(`workbench:${sessionId}`);
await db.collection('workbench_history').insertOne(state);
await redis.del(`workbench:${sessionId}`);
```

**Impact:** Faster workbench, less MongoDB load

---

## Migration Checklist

For each migration:

- [ ] Implement Redis version
- [ ] Add fallback to MongoDB (for when Redis fails)
- [ ] Test locally
- [ ] Deploy to staging
- [ ] Monitor Redis usage
- [ ] Monitor MongoDB connection reduction
- [ ] Document in this file

---

## Redis Usage Monitoring

**Upstash Dashboard:** https://console.upstash.com/

**Key Metrics:**
- Commands per day (limit: 10,000 free tier)
- Storage used (limit: 256 MB free tier)
- Bandwidth

**Current Usage:**
- Analytics: ~100-500 commands/day
- Rate limiting: ~50-200 commands/day
- **Total:** ~150-700 commands/day (well under limit)

---

## Fallback Strategy

All Redis implementations include MongoDB fallback:

```typescript
try {
  // Try Redis first
  const result = await redis.get(key);
  if (result) return result;
} catch (error) {
  console.error('Redis error, falling back to MongoDB:', error);
}

// Fallback to MongoDB
return await db.collection('...').findOne({...});
```

This ensures:
- Site works even if Redis is down
- Graceful degradation
- No single point of failure

---

## Cost Analysis

**Before (MongoDB only):**
- M0 tier: Free
- Connection pool: 80%+ usage (risky)
- Risk of exhaustion: High

**After (MongoDB + Redis):**
- MongoDB M0: Free
- Connection pool: 20-30% usage (safe)
- Upstash Redis: Free tier
- **Total cost: $0**

**If we need to upgrade:**
- MongoDB M10: $0.08/hr = ~$58/month
- Upstash Pro: $10/month (100K commands/day)
- **With Redis, we avoid MongoDB upgrade**

---

## Testing

**Test Redis connection:**
```bash
tsx scripts/test-upstash-redis.ts
```

**Test rate limiting:**
```bash
tsx scripts/test-redis-rate-limit.ts
```

**Monitor in production:**
- Check Upstash dashboard
- Monitor MongoDB connection pool %
- Watch for Redis errors in logs

---

## Next Steps

1. ✅ Analytics tracking (done)
2. ✅ Rate limiting (done)
3. ⏳ User session cache (next)
4. ⏳ MFA codes
5. ⏳ API key usage tracking

**Goal:** Reduce MongoDB connections from 80% to 20-30% usage.

---

## Related Files

- `docs/MONGODB_CONNECTION_AUDIT.md` - Full connection audit
- `docs/MONGODB_OPTIMIZATION_PLAN.md` - Optimization strategy
- `docs/ANALYTICS_STRATEGY.md` - Analytics approach
- `src/lib/analytics/redis-tracker.ts` - Redis analytics
- `src/lib/middleware/rateLimit.ts` - Redis rate limiting
