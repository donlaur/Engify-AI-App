# Observability Module

Enterprise-grade observability infrastructure for Next.js applications.

## Quick Start

### 1. Wrap API Routes

```typescript
import { withObservability } from '@/lib/observability';

async function handler(request: Request) {
  return Response.json({ data: 'result' });
}

export const GET = withObservability(handler, {
  operation: 'getUserProfile',
});
```

### 2. Add Performance Tracking

```typescript
import { withDbTiming, withAiTiming } from '@/lib/observability';

// Database timing
const users = await withDbTiming('users', 'find', async () => {
  return await db.collection('users').find({}).toArray();
});

// AI provider timing
const response = await withAiTiming('openai', 'gpt-4', async () => {
  return await openai.chat.completions.create({...});
}, { cost: 0.002, tokens: 100 });
```

### 3. Track Errors

```typescript
import { errorTracker, ErrorCategory } from '@/lib/observability';

try {
  await riskyOperation();
} catch (error) {
  errorTracker.trackError(error, ErrorCategory.DATABASE, {
    operation: 'findUser',
  });
  throw error;
}
```

### 4. Log Business Metrics

```typescript
import { observabilityLogger } from '@/lib/observability';

observabilityLogger.business('feature_used', {
  feature: 'ai_chat',
  userId: '123',
});
```

## Module Structure

```
src/lib/observability/
├── index.ts                    # Main exports
├── request-context.ts          # Request ID & context
├── enhanced-logger.ts          # Structured logging
├── health-checks.ts            # Service health monitoring
├── performance-monitor.ts      # Performance tracking
├── error-tracker.ts            # Error management
├── middleware.ts               # API route middleware
├── rate-limit-tracker.ts       # Rate limiting metrics
├── metrics.ts                  # RED metrics (existing)
├── USAGE.md                    # Detailed usage guide
└── README.md                   # This file
```

## Key Features

- **Request Tracing**: Unique ID for every request with context propagation
- **Structured Logging**: Context-aware logging with automatic metadata
- **Performance Monitoring**: DB queries, AI calls, custom operations
- **Health Checks**: Comprehensive service health monitoring
- **Error Tracking**: Categorized errors with alerting
- **Metrics**: RED (Rate, Errors, Duration) metrics
- **Rate Limiting**: Track and monitor rate limit usage
- **Middleware**: Automatic instrumentation for API routes

## API Endpoints

- `GET /api/health` - Comprehensive health check
- `GET /api/observability/dashboard` - Metrics dashboard
- `POST /api/observability/example` - Example implementation

## Documentation

For detailed usage instructions, see [USAGE.md](./USAGE.md)

For implementation details, see `/home/user/Engify-AI-App/OBSERVABILITY_IMPLEMENTATION.md`

## Initialization

```typescript
import { initializeObservability } from '@/lib/observability';

// Start monitoring (optional)
const timers = initializeObservability({
  memoryMonitoringIntervalMs: 60000,    // Every minute
  errorCleanupIntervalMs: 60000,        // Every minute
  rateLimitCleanupIntervalMs: 300000,   // Every 5 minutes
});

// Cleanup on shutdown
process.on('SIGTERM', () => {
  const { shutdownObservability } = require('@/lib/observability');
  shutdownObservability(timers);
});
```

## Best Practices

1. Always wrap API routes with `withObservability()`
2. Use timing wrappers for DB queries and AI calls
3. Track business metrics for important user actions
4. Categorize errors properly for better alerting
5. Add meaningful metadata to logs and errors
6. Monitor the health endpoint regularly
7. Review metrics and errors periodically

## Monitoring

Set up external monitoring for:
- `GET /api/health` - Alert on unhealthy status
- Error rates - Alert on high error rates
- Performance - Alert on high latency (p95 > 5s)
- Memory - Alert on high memory usage (> 512MB)

## Support

For questions or issues, refer to:
- [USAGE.md](./USAGE.md) - Detailed usage examples
- [Example Route](/src/app/api/observability/example/route.ts) - Reference implementation
- [Implementation Guide](/OBSERVABILITY_IMPLEMENTATION.md) - Complete documentation
