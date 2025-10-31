# ADR 005: RED Metrics for Observability

**Status**: Accepted  
**Date**: 2025-10-31  
**Decision Makers**: Engineering Team, SRE  
**Related**: Day 5 Phase 6, `src/lib/observability/metrics.ts`

---

## Context

Need observability into API performance and AI provider costs without adding heavy APM tooling (Datadog, New Relic) that costs $100+/month.

Current state:
- Logs exist but require manual grep/analysis
- No SLO tracking (p95 latency, error rates)
- Provider costs tracked in execution but not aggregated
- No alerting on performance regressions

---

## Decision

Implement **lightweight RED metrics** (Rate, Errors, Duration) tracking with in-memory aggregation and percentile calculation.

Expose via:
1. `/api/health` - Top-5 routes and provider summary
2. `/api/observability/metrics` - Full RED dashboard (RBAC: super_admin)

---

## RED Metrics Framework

### Rate (Requests/sec)
- How many requests is the service handling?
- Tracks: `requestCount` per route and provider

### Errors (Error %)
- What percentage of requests are failing?
- Tracks: `errorCount / requestCount` per route and provider

### Duration (Latency)
- How long do requests take?
- Tracks: `p50`, `p95`, `p99` latencies per route

---

## Alternatives Considered

### 1. Full APM Solution (Datadog/New Relic)
**Pros**: 
- Distributed tracing
- Advanced alerting
- Beautiful dashboards
- Proven at scale

**Cons**:
- $100-500/month cost
- Vendor lock-in
- Requires instrumentation across codebase
- Overkill for current scale (<100 req/min)

**Rejected**: Too expensive for current stage

### 2. Prometheus + Grafana
**Pros**:
- Open source
- Industry standard
- Powerful query language

**Cons**:
- Requires running Prometheus server
- Grafana instance to maintain
- Complex setup for small team
- Storage costs for time-series DB

**Rejected**: Too much operational overhead

### 3. Cloud Provider Metrics (Vercel Analytics)
**Pros**:
- Built-in to Vercel
- Zero setup
- Automatic dashboards

**Cons**:
- Limited to HTTP metrics (no provider costs)
- No custom dimensions
- Can't track business metrics
- $10/month for advanced features

**Rejected**: Doesn't track what we need (provider costs)

### 4. Logging + Post-Processing
**Pros**:
- Already have winston logging
- Flexible queries

**Cons**:
- Manual analysis required
- No real-time alerting
- Hard to calculate percentiles
- Poor UX for dashboard

**Rejected**: Too manual, no real-time visibility

---

## Selected Approach: Custom RED Metrics

**Pros**:
- ✅ $0 cost
- ✅ Tracks exactly what we need (routes + providers)
- ✅ Real-time aggregation
- ✅ Percentile calculation for SLOs
- ✅ Easy to expose via API
- ✅ RBAC-protected admin endpoint

**Cons**:
- ⚠️ In-memory (see ADR 004 for migration plan)
- ⚠️ No distributed tracing
- ⚠️ No automatic alerting (requires polling)

---

## Implementation

### Data Structures

```typescript
interface RouteMetrics {
  requestCount: number;
  errorCount: number;
  totalDurationMs: number;
  p50: number;
  p95: number;
  p99: number;
  lastUpdated: Date;
}

interface ProviderMetrics {
  requestCount: number;
  errorCount: number;
  totalDurationMs: number;
  totalCostUSD: number;
  lastUpdated: Date;
}
```

### Recording Points

1. **Success Path** (`/api/v2/ai/execute`):
   ```typescript
   recordRouteMetric('/api/v2/ai/execute', duration, true);
   recordProviderMetric(provider, latency, cost, true);
   ```

2. **Error Path**:
   ```typescript
   recordRouteMetric('/api/v2/ai/execute', duration, false);
   ```

### Percentile Calculation

- Store last 1000 latencies per route
- Sort on read and calculate p50/p95/p99
- Trade-off: Memory usage vs accuracy

---

## Exposure Points

### 1. Health Endpoint (`/api/health`)
```json
{
  "status": "ok",
  "services": { "database": ..., "qstash": ..., "redis": ... },
  "metrics": {
    "routes": [
      {
        "route": "/api/v2/ai/execute",
        "rate": 156,
        "errorRate": 0.01,
        "avgDuration": 850,
        "p50": 720,
        "p95": 1250,
        "p99": 1800
      }
    ],
    "providers": [
      {
        "provider": "openai",
        "rate": 89,
        "errorRate": 0.02,
        "totalCost": 4.53
      }
    ]
  }
}
```

### 2. Metrics Dashboard (`/api/observability/metrics`)
- RBAC: `requireSuperAdmin()`
- Returns full RED summary
- Query params: `?route=X` or `?provider=Y` for filtered view

---

## SLO Definitions

### Route SLOs

| Route | p95 Latency | Error Rate | Availability |
|-------|-------------|------------|--------------|
| `/api/v2/ai/execute` | <2s | <2% | >99.5% |
| `/api/agents/creator` | <30s | <5% | >99% |
| `/api/auth/mfa/send-code` | <3s | <1% | >99.9% |

### Provider SLOs

| Provider | p95 Latency | Error Rate | Monthly Budget |
|----------|-------------|------------|----------------|
| OpenAI | <2s | <3% | $500 |
| Anthropic | <2.5s | <3% | $300 |
| Google (Gemini) | <1.5s | <5% | $200 |

---

## Alerting Strategy (Future)

### Critical Alerts (Page On-Call)
- Error rate >10% for 5 minutes
- p95 latency >5s for 5 minutes  
- Any route unavailable for 2 minutes

### Warning Alerts (Slack)
- Error rate >5% for 10 minutes
- p95 latency >3s for 10 minutes
- Provider cost >80% of monthly budget

### Info Alerts (Email)
- Daily cost summary
- Weekly performance report
- Monthly SLO compliance report

---

## Migration Path to Redis

When we scale to >1 instance:

```typescript
// Before
recordRouteMetric('/api/test', 100, true);

// After
await recordRouteMetricRedis('/api/test', 100, true);
```

Implementation in `src/lib/observability/metricsRedis.ts`:

```typescript
import { Redis } from '@upstash/redis';

export async function recordRouteMetricRedis(
  route: string,
  duration: number,
  success: boolean
): Promise<void> {
  const key = `metrics:route:${route}`;
  await redis.pipeline()
    .hincrby(key, 'requests', 1)
    .hincrby(key, 'errors', success ? 0 : 1)
    .hincrby(key, 'totalMs', duration)
    .zadd(`latencies:${route}`, { score: duration, member: Date.now() })
    .zremrangebyrank(`latencies:${route}`, 0, -1001) // Keep last 1000
    .exec();
}
```

---

## Success Metrics

- ✅ Dashboard accessible at `/api/observability/metrics`
- ✅ p95 latencies visible for all routes
- ✅ Provider cost tracking operational
- ✅ <10ms overhead per metric recording
- ✅ SLO violations detectable within 1 minute

---

## Future Enhancements

1. **Automatic Alerting**: Poll metrics, trigger webhooks on SLO violations
2. **Retention Policy**: Archive old metrics to S3
3. **Grafana Integration**: Export metrics in Prometheus format
4. **User-Facing Dashboards**: Show response times to users
5. **Cost Attribution**: Track costs per user/organization

---

## References

- Implementation: `src/lib/observability/metrics.ts`
- Tests: `src/lib/observability/__tests__/metrics.test.ts`
- Health Endpoint: `src/app/api/health/route.ts`
- Metrics API: `src/app/api/observability/metrics/route.ts`
- Related: [ADR 004 - In-Memory vs Redis](./004-in-memory-vs-redis-state.md)

