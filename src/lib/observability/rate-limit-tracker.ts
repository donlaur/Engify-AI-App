/**
 * Rate Limit Metrics Tracker
 *
 * Tracks rate limiting metrics for monitoring and alerting:
 * - Request counts per identifier
 * - Rate limit violations
 * - Top rate-limited identifiers
 * - Rate limit utilization
 *
 * Usage:
 *   import { rateLimitTracker } from '@/lib/observability/rate-limit-tracker';
 *
 *   rateLimitTracker.record('user:123', 100, 95, false);
 */

import { observabilityLogger } from './enhanced-logger';

export interface RateLimitMetric {
  identifier: string;
  limit: number;
  current: number;
  blocked: boolean;
  timestamp: Date;
  utilizationPercent: number;
}

export interface RateLimitStats {
  identifier: string;
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  averageUtilization: number;
  lastBlocked?: Date;
}

/**
 * Rate Limit Tracker Class
 */
class RateLimitTracker {
  private metrics: RateLimitMetric[] = [];
  private readonly maxMetrics = 10000;

  /**
   * Record a rate limit check
   */
  record(
    identifier: string,
    limit: number,
    current: number,
    blocked: boolean
  ): void {
    const metric: RateLimitMetric = {
      identifier,
      limit,
      current,
      blocked,
      timestamp: new Date(),
      utilizationPercent: (current / limit) * 100,
    };

    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log if blocked or high utilization
    if (blocked) {
      observabilityLogger.warn('Rate limit exceeded', {
        identifier,
        limit,
        current,
      });
    } else if (metric.utilizationPercent > 80) {
      observabilityLogger.info('Rate limit warning', {
        identifier,
        limit,
        current,
        utilizationPercent: metric.utilizationPercent.toFixed(2),
      });
    }
  }

  /**
   * Get statistics for an identifier
   */
  getStats(identifier?: string): RateLimitStats[] {
    const identifiers = identifier
      ? [identifier]
      : Array.from(new Set(this.metrics.map((m) => m.identifier)));

    return identifiers.map((id) => {
      const metrics = this.metrics.filter((m) => m.identifier === id);

      if (metrics.length === 0) {
        return {
          identifier: id,
          totalRequests: 0,
          blockedRequests: 0,
          blockRate: 0,
          averageUtilization: 0,
        };
      }

      const totalRequests = metrics.length;
      const blockedRequests = metrics.filter((m) => m.blocked).length;
      const blockRate = blockedRequests / totalRequests;
      const averageUtilization =
        metrics.reduce((sum, m) => sum + m.utilizationPercent, 0) /
        metrics.length;
      const lastBlocked = metrics
        .filter((m) => m.blocked)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
        ?.timestamp;

      return {
        identifier: id,
        totalRequests,
        blockedRequests,
        blockRate,
        averageUtilization,
        lastBlocked,
      };
    });
  }

  /**
   * Get top rate-limited identifiers
   */
  getTopRateLimited(limit: number = 10): RateLimitStats[] {
    return this.getStats()
      .sort((a, b) => b.blockedRequests - a.blockedRequests)
      .slice(0, limit);
  }

  /**
   * Get identifiers with high utilization
   */
  getHighUtilization(threshold: number = 80): RateLimitStats[] {
    return this.getStats().filter(
      (s) => s.averageUtilization > threshold
    );
  }

  /**
   * Get recent rate limit events
   */
  getRecentEvents(limit: number = 100, blocked?: boolean): RateLimitMetric[] {
    let events = this.metrics;

    if (blocked !== undefined) {
      events = events.filter((m) => m.blocked === blocked);
    }

    return events.slice(-limit).reverse();
  }

  /**
   * Get rate limit summary
   */
  getSummary(): {
    totalEvents: number;
    blockedEvents: number;
    uniqueIdentifiers: number;
    blockRate: number;
    topBlocked: Array<{ identifier: string; count: number }>;
  } {
    const totalEvents = this.metrics.length;
    const blockedEvents = this.metrics.filter((m) => m.blocked).length;
    const uniqueIdentifiers = new Set(this.metrics.map((m) => m.identifier))
      .size;
    const blockRate = totalEvents > 0 ? blockedEvents / totalEvents : 0;

    const topBlocked = this.getTopRateLimited(5).map((s) => ({
      identifier: s.identifier,
      count: s.blockedRequests,
    }));

    return {
      totalEvents,
      blockedEvents,
      uniqueIdentifiers,
      blockRate,
      topBlocked,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Cleanup old metrics
   */
  cleanup(maxAgeMs: number = 3600000): void {
    const cutoff = Date.now() - maxAgeMs;
    this.metrics = this.metrics.filter(
      (m) => m.timestamp.getTime() > cutoff
    );
  }

  /**
   * Start periodic cleanup
   */
  startCleanup(intervalMs: number = 300000): NodeJS.Timeout {
    return setInterval(() => {
      this.cleanup();
      observabilityLogger.debug('Rate limit metrics cleaned up', {
        remainingMetrics: this.metrics.length,
      });
    }, intervalMs);
  }
}

export const rateLimitTracker = new RateLimitTracker();
