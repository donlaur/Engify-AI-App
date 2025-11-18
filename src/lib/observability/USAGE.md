# Observability System Usage Guide

## Overview

This comprehensive observability system provides enterprise-grade monitoring, logging, and performance tracking for your Next.js application.

## Features

1. **Request Tracing**: Automatic request ID generation and context propagation
2. **Structured Logging**: Winston-based logging with request context
3. **Performance Monitoring**: Database, AI provider, and custom operation timing
4. **Health Checks**: Comprehensive health monitoring for all external services
5. **Error Tracking**: Categorized error tracking with alerting
6. **Metrics**: RED (Rate, Errors, Duration) metrics for routes and providers
7. **Middleware**: Automatic instrumentation for API routes

## Quick Start

### 1. Basic API Route with Observability

```typescript
// src/app/api/users/route.ts
import { withObservability } from '@/lib/observability';

async function handler(request: Request) {
  // Your code here
  return Response.json({ users: [] });
}

export const GET = withObservability(handler, {
  operation: 'getUsers',
});
```

### 2. Logging with Context

```typescript
import { observabilityLogger } from '@/lib/observability';

// Simple logging
observabilityLogger.info('User action completed', {
  userId: '123',
  action: 'profile_update',
});

// Business metrics
observabilityLogger.business('feature_used', {
  feature: 'ai_chat',
  userId: '123',
  value: 1,
});

// Performance logging
observabilityLogger.performance('complex_calculation', 150, {
  recordCount: 1000,
});
```

### 3. Database Query Timing

```typescript
import { withDbTiming } from '@/lib/observability';

const users = await withDbTiming('users', 'find', async () => {
  return await db.collection('users').find({ active: true }).toArray();
}, { filters: { active: true } });
```

### 4. AI Provider Call Timing

```typescript
import { withAiTiming } from '@/lib/observability';

const response = await withAiTiming(
  'openai',
  'gpt-4',
  async () => {
    return await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    });
  },
  {
    cost: 0.002,
    tokens: 100,
  }
);
```

### 5. Error Tracking

```typescript
import { errorTracker, ErrorCategory } from '@/lib/observability';

try {
  await riskyOperation();
} catch (error) {
  errorTracker.trackError(error, ErrorCategory.EXTERNAL_API, {
    operation: 'fetchUserData',
    userId: '123',
  });
  throw error;
}
```

### 6. Custom Operation Timing

```typescript
import { withTiming } from '@/lib/observability';

const result = await withTiming('processPayment', async () => {
  // Complex operation
  return await processPayment(paymentData);
}, { amount: 99.99, currency: 'USD' });
```

## Advanced Usage

### Request Context

Access request context anywhere in your code:

```typescript
import { RequestContext } from '@/lib/observability';

// Get current request ID
const requestId = RequestContext.getRequestId();

// Get user ID
const userId = RequestContext.getUserId();

// Get full context
const context = RequestContext.get();

// Update metadata
RequestContext.updateMetadata({
  customField: 'value',
});
```

### Rate Limiting with Observability

```typescript
import { withRateLimit } from '@/lib/observability';

async function handler(request: Request) {
  // Your code
  return Response.json({ data: 'result' });
}

export const POST = withRateLimit(handler, {
  limit: 100,
  windowMs: 60000, // 1 minute
  operation: 'createResource',
});
```

### Performance Monitoring

```typescript
import { performanceMonitor } from '@/lib/observability';

// Get average duration for an operation
const avg = performanceMonitor.getAverageDuration('db:find:users');

// Get p95 latency
const p95 = performanceMonitor.getP95Duration('api:/api/users');

// Check memory thresholds
performanceMonitor.checkMemoryThresholds({
  heapUsedMB: 512,
  rssMB: 1024,
});

// Get formatted memory usage
const memory = performanceMonitor.getFormattedMemoryUsage();
```

### Health Checks

```typescript
import { healthCheckManager } from '@/lib/observability';

// Check all services
const health = await healthCheckManager.checkAll();

// Check specific service
const mongoHealth = await healthCheckManager.checkService('mongodb');

// Get uptime
const uptime = healthCheckManager.getUptime();
```

### Error Analysis

```typescript
import { errorTracker } from '@/lib/observability';

// Get error statistics
const stats = errorTracker.getErrorStats();

// Get recent errors
const recent = errorTracker.getRecentErrors(50);

// Get alert-worthy errors
const alerts = errorTracker.getAlertWorthyErrors();

// Get error summary
const summary = errorTracker.getErrorSummary();
```

## Integration Examples

### Example 1: Enhanced API Route

```typescript
// src/app/api/ai/chat/route.ts
import {
  withObservability,
  observabilityLogger,
  withAiTiming,
  errorTracker,
  ErrorCategory,
} from '@/lib/observability';

async function handler(request: Request) {
  try {
    const body = await request.json();

    // Log business metric
    observabilityLogger.business('ai_chat_started', {
      model: body.model,
      messageCount: body.messages.length,
    });

    // AI call with timing
    const response = await withAiTiming(
      'openai',
      body.model,
      async () => {
        return await openai.chat.completions.create(body);
      },
      {
        cost: calculateCost(body.model),
        tokens: estimateTokens(body.messages),
      }
    );

    // Log completion
    observabilityLogger.business('ai_chat_completed', {
      model: body.model,
      tokensUsed: response.usage?.total_tokens,
    });

    return Response.json(response);
  } catch (error) {
    errorTracker.trackError(error, ErrorCategory.AI_PROVIDER, {
      model: body.model,
    });
    throw error;
  }
}

export const POST = withObservability(handler, {
  operation: 'aiChat',
  category: ErrorCategory.AI_PROVIDER,
});
```

### Example 2: Database Service with Monitoring

```typescript
// src/lib/services/UserService.ts
import { withDbTiming, observabilityLogger } from '@/lib/observability';

export class UserService {
  async findUsers(filters: Record<string, unknown>) {
    observabilityLogger.info('Finding users', { filters });

    const users = await withDbTiming('users', 'find', async () => {
      return await db.collection('users').find(filters).toArray();
    }, { filterCount: Object.keys(filters).length });

    observabilityLogger.info('Users found', { count: users.length });

    return users;
  }

  async createUser(userData: UserData) {
    const timer = observabilityLogger.startTimer();

    const user = await withDbTiming('users', 'insertOne', async () => {
      return await db.collection('users').insertOne(userData);
    });

    timer.end('createUser', { userId: user.insertedId });

    observabilityLogger.business('user_created', {
      userId: user.insertedId.toString(),
    });

    return user;
  }
}
```

### Example 3: Initialization in Application

```typescript
// src/app/layout.tsx or instrumentation.ts
import { initializeObservability } from '@/lib/observability';

// Initialize observability
const timers = initializeObservability({
  memoryMonitoringIntervalMs: 60000, // Every minute
  errorCleanupIntervalMs: 60000, // Every minute
});

// Cleanup on shutdown (if needed)
process.on('SIGTERM', () => {
  const { shutdownObservability } = require('@/lib/observability');
  shutdownObservability(timers);
});
```

## Metrics and Monitoring

### RED Metrics

Access RED (Rate, Errors, Duration) metrics:

```typescript
import { getREDSummary } from '@/lib/observability';

const summary = getREDSummary();

// Summary includes:
// - routes: Array of route metrics with p50, p95, p99 latencies
// - providers: Array of AI provider metrics with costs
```

### Custom Metrics

```typescript
import { recordRouteMetric, recordProviderMetric } from '@/lib/observability';

// Record route metric
recordRouteMetric('/api/users', 150, true);

// Record provider metric
recordProviderMetric('openai', 2000, 0.002, true);
```

## Best Practices

1. **Use withObservability for all API routes** - Automatic instrumentation
2. **Use withDbTiming for all database queries** - Track slow queries
3. **Use withAiTiming for all AI provider calls** - Track costs and performance
4. **Log business metrics** - Track feature usage and user actions
5. **Categorize errors properly** - Better alerting and analysis
6. **Add meaningful metadata** - Context helps debugging
7. **Monitor the /api/health endpoint** - Set up external monitoring
8. **Review error summary regularly** - Identify patterns and issues

## Health Check Endpoint

Access comprehensive health information:

```bash
curl http://localhost:3000/api/health
```

Response includes:
- Overall health status
- Individual service health
- Performance metrics
- Error summary
- Memory usage
- Uptime

## Troubleshooting

### High Memory Usage

```typescript
import { performanceMonitor } from '@/lib/observability';

// Check memory
performanceMonitor.checkMemoryThresholds({
  heapUsedMB: 512,
  rssMB: 1024,
});

// Get detailed usage
const memory = performanceMonitor.getMemoryUsage();
console.log('Heap:', memory.heapUsed / 1024 / 1024, 'MB');
```

### High Error Rate

```typescript
import { errorTracker } from '@/lib/observability';

// Check if error rate is high
const isHigh = errorTracker.isErrorRateHigh(ErrorCategory.DATABASE, 10);

// Get error statistics
const stats = errorTracker.getErrorStats(ErrorCategory.DATABASE);
console.log('Error rate:', stats[0].errorRate, 'errors/minute');
```

### Slow Operations

```typescript
import { performanceMonitor } from '@/lib/observability';

// Get slow operations
const metrics = performanceMonitor.getMetrics('db:find:users');
const p95 = performanceMonitor.getP95Duration('db:find:users');

console.log('P95 latency:', p95, 'ms');
```

## Production Considerations

1. **Set up external monitoring** - Monitor the /api/health endpoint
2. **Configure log aggregation** - Use tools like Datadog, New Relic, or ELK
3. **Set up alerting** - Alert on critical errors and service degradation
4. **Monitor memory usage** - Prevent memory leaks
5. **Review metrics regularly** - Identify performance bottlenecks
6. **Tune thresholds** - Adjust based on your application's needs
