# ADR 004: In-Memory State vs Redis for Rate Limiting and Metrics

**Status**: Accepted (with migration plan)  
**Date**: 2025-10-31  
**Decision Makers**: Engineering Team, SRE  
**Related**: Day 5 Phases 3, 4, 6

---

## Context

Multiple Day 5 features require stateful tracking:
- **Rate limiting** (Twilio MFA, SendGrid webhooks)
- **Replay protection** (Twilio/SendGrid webhooks)
- **Health tracking** (SendGrid event status)
- **RED metrics** (request counts, latencies, error rates)

Current implementation uses **in-memory JavaScript Maps/Sets**, suitable for single-instance deployments but not horizontally scalable.

---

## Decision

**Phase 1 (Current)**: Use in-memory state for rapid development and single-instance deployments.

**Phase 2 (Before Horizontal Scaling)**: Migrate to Redis for distributed state management.

---

## Rationale

### Why In-Memory First?

1. **Velocity**: Zero external dependencies for Day 5 delivery
2. **Simplicity**: No Redis setup, connection pooling, or error handling
3. **Local Development**: Works without additional services
4. **Testing**: Easy to reset state in tests (`resetMetrics()`)
5. **Deployment Readiness**: Vercel single-instance deployments work immediately

### Why Redis Eventually?

1. **Horizontal Scaling**: Multiple instances need shared state
2. **Persistence**: Rate limits survive restarts
3. **Performance**: Redis is faster for high-volume reads/writes
4. **Features**: TTL for automatic cleanup, pub/sub for real-time updates

---

## Current Implementation

### Rate Limiting (`src/lib/middleware/rateLimit.ts`)

```typescript
const buckets = new Map<string, { tokens: number; updatedAt: number }>();

export function rateLimit(key: string, opts: RateLimitOptions): boolean {
  const bucket = buckets.get(key) ?? { tokens: opts.max, updatedAt: Date.now() };
  // Token bucket algorithm
  if (bucket.tokens <= 0) return false;
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}
```

**Limitations**:
- ❌ State lost on restart
- ❌ Each instance has separate buckets (rate limit × instance count)
- ❌ No distributed coordination

### Replay Protection

```typescript
// Twilio: src/lib/services/twilioWebhookState.ts
const processedMessages = new Set<string>();

export function hasProcessedMessage(messageId: string | null): boolean {
  if (!messageId) return false;
  if (processedMessages.has(messageId)) return true;
  processedMessages.add(messageId);
  return false;
}
```

**Limitations**:
- ❌ Capped at 1000 messages per instance
- ❌ Replay only prevented within same instance
- ❌ State lost on restart (allows replay after deploy)

### RED Metrics (`src/lib/observability/metrics.ts`)

```typescript
const routeMetrics = new Map<string, RouteMetrics>();
const providerMetrics = new Map<string, ProviderMetrics>();

export function recordRouteMetric(route: string, duration: number, success: boolean) {
  const existing = routeMetrics.get(route) ?? { ... };
  existing.requestCount += 1;
  // Update p50/p95/p99
  routeMetrics.set(route, existing);
}
```

**Limitations**:
- ❌ Metrics reset on restart
- ❌ Each instance has partial view
- ❌ Percentiles calculated per-instance, not globally

---

## Migration Plan to Redis

### Phase 2.1: Rate Limiting

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function rateLimitRedis(key: string, opts: RateLimitOptions): Promise<boolean> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / opts.windowMs)}`;
  
  const count = await redis.incr(windowKey);
  if (count === 1) {
    await redis.expire(windowKey, Math.ceil(opts.windowMs / 1000));
  }
  
  return count <= opts.max;
}
```

### Phase 2.2: Replay Protection

```typescript
export async function hasProcessedMessageRedis(messageId: string): Promise<boolean> {
  const key = `replay:${messageId}`;
  const exists = await redis.set(key, '1', { nx: true, ex: 3600 }); // 1hr TTL
  return exists === null; // null means key already existed
}
```

### Phase 2.3: RED Metrics

```typescript
export async function recordRouteMetricRedis(route: string, duration: number, success: boolean) {
  const key = `metrics:route:${route}`;
  await redis.pipeline()
    .hincrby(key, 'requestCount', 1)
    .hincrby(key, 'errorCount', success ? 0 : 1)
    .hincrby(key, 'totalDurationMs', duration)
    .zadd(`latencies:${route}`, { score: duration, member: Date.now() })
    .exec();
}
```

---

## When to Migrate?

### Trigger Conditions

Migrate when **ANY** of these occur:
1. Planning horizontal scaling (>1 instance)
2. Rate limit false positives due to instance routing
3. Replay attacks succeed after deploys
4. Metrics become unreliable (missing data)

### Migration Checklist

- [ ] Provision Upstash Redis (already have credentials)
- [ ] Create Redis adapter layer (`src/lib/redis/adapter.ts`)
- [ ] Implement Redis-backed versions of all stateful utilities
- [ ] Add feature flag: `REDIS_STATE_ENABLED=true`
- [ ] Run A/B test (50% in-memory, 50% Redis)
- [ ] Monitor latency impact (expect <10ms overhead)
- [ ] Cutover to Redis for all instances
- [ ] Remove in-memory implementations

### Estimated Effort

- **Development**: 4-6 hours
- **Testing**: 2 hours
- **Rollout**: 1 hour
- **Total**: 1 day

---

## Cost Analysis

### In-Memory (Current)
- **Cost**: $0/month
- **Scalability**: Single instance only
- **Reliability**: State lost on restart

### Redis (Upstash)
- **Cost**: ~$10-50/month (based on volume)
- **Scalability**: Unlimited instances
- **Reliability**: Persisted, 99.99% uptime SLA

**ROI**: Worth $10-50/month when we need >1 instance for reliability.

---

## Consequences

### Current (In-Memory)

**Positive**:
- ✅ Zero latency overhead
- ✅ Zero external dependencies
- ✅ Perfect for single-instance Vercel deployments
- ✅ Simplified local development

**Negative**:
- ⚠️ Blocks horizontal scaling
- ⚠️ Rate limits reset on deploy
- ⚠️ Replay protection gaps during deploys
- ⚠️ Metrics incomplete across instances

### Future (Redis)

**Positive**:
- ✅ Distributed state across instances
- ✅ Persistent rate limits
- ✅ Global replay protection
- ✅ Accurate cross-instance metrics

**Negative**:
- ⚠️ +5-10ms latency per state operation
- ⚠️ Additional infrastructure to monitor
- ⚠️ Monthly cost ($10-50)

---

## References

- Implementation: `src/lib/middleware/rateLimit.ts`
- Replay: `src/lib/services/twilioWebhookState.ts`
- Metrics: `src/lib/observability/metrics.ts`
- Health: `src/lib/services/sendgridHealth.ts`
- Redis Setup: `scripts/redis/setup-upstash.sh`

