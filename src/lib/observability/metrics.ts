/**
 * AI Summary: RED metrics (Rate, Errors, Duration) tracking for observability.
 * In-memory counters suitable for single-instance; migrate to Redis/Prometheus for multi-instance.
 */

export interface RouteMetrics {
  requestCount: number;
  errorCount: number;
  totalDurationMs: number;
  p50: number;
  p95: number;
  p99: number;
  lastUpdated: Date;
}

export interface ProviderMetrics {
  requestCount: number;
  errorCount: number;
  totalDurationMs: number;
  totalCostUSD: number;
  lastUpdated: Date;
}

// In-memory storage (use Redis/Prometheus in production)
const routeMetrics = new Map<string, RouteMetrics>();
const providerMetrics = new Map<string, ProviderMetrics>();
const routeLatencies = new Map<string, number[]>();

const MAX_LATENCIES_PER_ROUTE = 1000;

export function recordRouteMetric(
  route: string,
  durationMs: number,
  success: boolean
): void {
  const existing = routeMetrics.get(route) ?? {
    requestCount: 0,
    errorCount: 0,
    totalDurationMs: 0,
    p50: 0,
    p95: 0,
    p99: 0,
    lastUpdated: new Date(),
  };

  existing.requestCount += 1;
  if (!success) {
    existing.errorCount += 1;
  }
  existing.totalDurationMs += durationMs;
  existing.lastUpdated = new Date();

  // Track latencies for percentile calculation
  const latencies = routeLatencies.get(route) ?? [];
  latencies.push(durationMs);

  // Keep only last N latencies to prevent unbounded growth
  if (latencies.length > MAX_LATENCIES_PER_ROUTE) {
    latencies.shift();
  }
  routeLatencies.set(route, latencies);

  // Calculate percentiles
  if (latencies.length > 0) {
    const sorted = [...latencies].sort((a, b) => a - b);
    existing.p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
    existing.p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    existing.p99 = sorted[Math.floor(sorted.length * 0.99)] ?? 0;
  }

  routeMetrics.set(route, existing);
}

export function recordProviderMetric(
  provider: string,
  durationMs: number,
  costUSD: number,
  success: boolean
): void {
  const existing = providerMetrics.get(provider) ?? {
    requestCount: 0,
    errorCount: 0,
    totalDurationMs: 0,
    totalCostUSD: 0,
    lastUpdated: new Date(),
  };

  existing.requestCount += 1;
  if (!success) {
    existing.errorCount += 1;
  }
  existing.totalDurationMs += durationMs;
  existing.totalCostUSD += costUSD;
  existing.lastUpdated = new Date();

  providerMetrics.set(provider, existing);
}

export function getRouteMetrics(route?: string): Map<string, RouteMetrics> | RouteMetrics | null {
  if (route) {
    return routeMetrics.get(route) ?? null;
  }
  return routeMetrics;
}

export function getProviderMetrics(provider?: string): Map<string, ProviderMetrics> | ProviderMetrics | null {
  if (provider) {
    return providerMetrics.get(provider) ?? null;
  }
  return providerMetrics;
}

export function getREDSummary(): {
  routes: Array<{
    route: string;
    rate: number;
    errorRate: number;
    avgDuration: number;
    p50: number;
    p95: number;
    p99: number;
  }>;
  providers: Array<{
    provider: string;
    rate: number;
    errorRate: number;
    avgDuration: number;
    totalCost: number;
  }>;
} {
  const routes = Array.from(routeMetrics.entries()).map(([route, metrics]) => ({
    route,
    rate: metrics.requestCount,
    errorRate: metrics.errorCount / Math.max(1, metrics.requestCount),
    avgDuration: metrics.totalDurationMs / Math.max(1, metrics.requestCount),
    p50: metrics.p50,
    p95: metrics.p95,
    p99: metrics.p99,
  }));

  const providers = Array.from(providerMetrics.entries()).map(([provider, metrics]) => ({
    provider,
    rate: metrics.requestCount,
    errorRate: metrics.errorCount / Math.max(1, metrics.requestCount),
    avgDuration: metrics.totalDurationMs / Math.max(1, metrics.requestCount),
    totalCost: metrics.totalCostUSD,
  }));

  return { routes, providers };
}

export function resetMetrics(): void {
  routeMetrics.clear();
  providerMetrics.clear();
  routeLatencies.clear();
}

