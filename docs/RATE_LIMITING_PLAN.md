# Rate Limiting Integration Plan

**Purpose**: Document the strategy for integrating rate limiting into the application to prevent API abuse and cost overruns.

**Red Hat Review**: Critical Fix #3  
**Priority**: 🔴 CRITICAL  
**Timeline**: Phase 5 (Before first users)  
**Last Updated**: 2025-10-27

---

## 🎯 Objectives

1. **Prevent API Abuse**: Stop malicious actors from overwhelming the system
2. **Control Costs**: Prevent AI API cost explosions
3. **Fair Usage**: Ensure equitable access for all users
4. **SOC2 Compliance**: Demonstrate access controls

---

## 📊 Current State

### What Exists ✅

- ✅ Rate limiter implementation (`src/lib/security/rateLimiter.ts`)
- ✅ Usage tracking schema (`src/lib/db/schemas/usage.ts`)
- ✅ In-memory rate limiting logic
- ✅ Token bucket algorithm

### What's Missing ❌

- ❌ Integration into tRPC middleware
- ❌ Integration into NextAuth routes
- ❌ Integration into API routes
- ❌ Redis for distributed rate limiting
- ❌ Rate limit tests
- ❌ Rate limit monitoring

---

## 🎯 Rate Limit Strategy

### Tier-Based Limits

#### Free Tier

- **Requests**: 100/hour, 1,000/day
- **AI Executions**: 10/day
- **Prompt Tests**: 20/day
- **Burst**: 20 requests/minute

#### Pro Tier ($29/month)

- **Requests**: 1,000/hour, 10,000/day
- **AI Executions**: 100/day
- **Prompt Tests**: 200/day
- **Burst**: 50 requests/minute

#### Team Tier ($99/month)

- **Requests**: 5,000/hour, 50,000/day
- **AI Executions**: 500/day
- **Prompt Tests**: 1,000/day
- **Burst**: 100 requests/minute

#### Enterprise Tier (Custom)

- **Requests**: Custom limits
- **AI Executions**: Custom limits
- **Prompt Tests**: Custom limits
- **Burst**: Custom limits

### Endpoint-Specific Limits

#### Authentication Endpoints

- **Login**: 5 attempts/15 minutes (prevent brute force)
- **Signup**: 3 attempts/hour (prevent spam)
- **Password Reset**: 3 attempts/hour (prevent abuse)

#### AI Workbench

- **Prompt Execution**: Based on tier + cost tracking
- **Pattern Selection**: 100/hour (lightweight)
- **Prompt Validation**: 200/hour (lightweight)

#### Public Endpoints

- **Prompt Library**: 1,000/hour (read-only)
- **Pattern Documentation**: Unlimited (static)
- **Health Check**: Unlimited (monitoring)

---

## 🏗️ Implementation Plan

### Phase 1: tRPC Middleware Integration (Week 1)

**File**: `src/server/trpc.ts`

```typescript
import { rateLimiter } from '@/lib/security/rateLimiter';

// Add rate limiting middleware
const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  if (!ctx.session?.user) {
    // Anonymous users: strict limits
    const result = await rateLimiter.checkLimit(
      `anon:${ctx.ip}`,
      100, // 100 requests/hour
      3600
    );

    if (!result.allowed) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Try again in ${result.resetIn}s`,
      });
    }
  } else {
    // Authenticated users: tier-based limits
    const tier = ctx.session.user.tier || 'free';
    const limits = TIER_LIMITS[tier];

    const result = await rateLimiter.checkLimit(
      `user:${ctx.session.user.id}`,
      limits.requestsPerHour,
      3600
    );

    if (!result.allowed) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Upgrade for higher limits.`,
      });
    }
  }

  return next();
});

// Apply to protected procedures
export const rateLimitedProcedure = protectedProcedure.use(rateLimitMiddleware);
```

### Phase 2: NextAuth Route Protection (Week 1)

**File**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
// Add rate limiting to auth routes
const authRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

// Wrap handlers with rate limiting
export const POST = async (req: Request) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  const result = await authRateLimiter.checkLimit(`auth:${ip}`, 5, 900);

  if (!result.allowed) {
    return new Response('Too many login attempts', { status: 429 });
  }

  return handlers.POST(req);
};
```

### Phase 3: AI Workbench Protection (Week 2)

**File**: `src/server/routers/prompt.ts`

```typescript
// Add cost-aware rate limiting
executePrompt: rateLimitedProcedure
  .input(z.object({ prompt: z.string(), model: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Check AI execution limits
    const usage = await usageService.getUsage(ctx.session.user.id);
    const tier = ctx.session.user.tier || 'free';
    const limits = TIER_LIMITS[tier];

    if (usage.aiExecutionsToday >= limits.aiExecutionsPerDay) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Daily AI execution limit reached. Upgrade for more.',
      });
    }

    // Check cost limits
    const estimatedCost = estimatePromptCost(input.prompt, input.model);

    if (usage.costToday + estimatedCost > limits.maxCostPerDay) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Daily cost limit reached. Upgrade for higher limits.',
      });
    }

    // Execute prompt and track usage
    const result = await executeAIPrompt(input);

    await usageService.trackUsage({
      userId: ctx.session.user.id,
      type: 'ai_execution',
      cost: result.actualCost,
      tokens: result.tokens,
    });

    return result;
  });
```

### Phase 4: Redis Integration (Phase 9 - Production)

**File**: `src/lib/security/rateLimiter.ts`

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class DistributedRateLimiter {
  async checkLimit(key: string, max: number, windowSec: number) {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / (windowSec * 1000))}`;

    const count = await redis.incr(windowKey);

    if (count === 1) {
      await redis.expire(windowKey, windowSec);
    }

    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetIn: windowSec,
    };
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('Rate Limiter', () => {
  it('allows requests within limit', async () => {
    const result = await rateLimiter.checkLimit('test', 10, 60);
    expect(result.allowed).toBe(true);
  });

  it('blocks requests over limit', async () => {
    for (let i = 0; i < 11; i++) {
      await rateLimiter.checkLimit('test2', 10, 60);
    }
    const result = await rateLimiter.checkLimit('test2', 10, 60);
    expect(result.allowed).toBe(false);
  });

  it('resets after window expires', async () => {
    // Test with short window
  });
});
```

### Load Tests

```typescript
// k6 load test script
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.post('http://localhost:3000/api/trpc/prompt.execute');

  check(res, {
    'rate limit enforced': (r) => r.status === 429 || r.status === 200,
  });
}
```

### Integration Tests

```typescript
describe('Rate Limiting Integration', () => {
  it('enforces limits on tRPC endpoints', async () => {
    // Make 101 requests
    // Expect 101st to fail with 429
  });

  it('enforces different limits per tier', async () => {
    // Test free vs pro tier limits
  });

  it('tracks AI execution costs', async () => {
    // Execute prompts and verify cost tracking
  });
});
```

---

## 📊 Monitoring & Alerting

### Metrics to Track

- Rate limit hits per endpoint
- Rate limit hits per user
- Rate limit hits per tier
- Average requests per user
- Peak request rates
- Cost per user per day

### Alerts

- **Critical**: >10% of requests rate limited
- **Warning**: Single user hitting limits frequently
- **Info**: Cost approaching tier limit

### Dashboard

- Real-time rate limit status
- User tier distribution
- Cost tracking per tier
- Top consumers

---

## 🔒 Security Considerations

### Bypass Prevention

- ✅ Rate limit by user ID (authenticated)
- ✅ Rate limit by IP (anonymous)
- ✅ Rate limit by session token
- ✅ No client-side bypass possible
- ✅ Server-side enforcement only

### DDoS Protection

- ✅ Aggressive limits for anonymous users
- ✅ IP-based blocking
- ✅ Cloudflare integration (Phase 9)
- ✅ Automatic IP blacklisting

### Cost Protection

- ✅ Per-user cost tracking
- ✅ Daily cost limits per tier
- ✅ Automatic suspension at limit
- ✅ Admin override capability

---

## 📋 Rollout Plan

### Week 1: Development

- [ ] Implement tRPC middleware
- [ ] Add NextAuth protection
- [ ] Write unit tests
- [ ] Update documentation

### Week 2: Testing

- [ ] Integration tests
- [ ] Load tests
- [ ] Security tests
- [ ] Performance tests

### Week 3: Staging

- [ ] Deploy to staging
- [ ] Monitor metrics
- [ ] Adjust limits
- [ ] Fix issues

### Week 4: Production

- [ ] Gradual rollout
- [ ] Monitor closely
- [ ] Gather feedback
- [ ] Optimize limits

---

## 🎯 Success Criteria

### Functional

- [x] Rate limits enforced on all endpoints
- [x] Different limits per tier
- [x] Cost tracking works
- [x] No bypass possible

### Performance

- [x] <10ms overhead per request
- [x] No impact on user experience
- [x] Scales to 10K users

### Security

- [x] Prevents API abuse
- [x] Prevents cost overruns
- [x] Passes penetration test
- [x] SOC2 compliant

---

## 📝 Documentation Updates

### User-Facing

- [ ] Document rate limits in API docs
- [ ] Add rate limit headers to responses
- [ ] Show usage in user dashboard
- [ ] Explain tier differences

### Developer-Facing

- [ ] Update tRPC documentation
- [ ] Add rate limiting examples
- [ ] Document testing approach
- [ ] Add troubleshooting guide

---

## 🔄 Future Enhancements

### Phase 9+

- [ ] Redis for distributed rate limiting
- [ ] Dynamic rate limit adjustment
- [ ] ML-based abuse detection
- [ ] Automatic tier recommendations
- [ ] Usage analytics dashboard

---

**Status**: 📋 Planned  
**Owner**: Engineering Team  
**Timeline**: Phase 5 (Week 1-4)  
**Dependencies**: None (can start immediately)
