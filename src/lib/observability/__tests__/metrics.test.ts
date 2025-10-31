/**
 * AI Summary: Tests for RED metrics tracking (Rate, Errors, Duration).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordRouteMetric,
  recordProviderMetric,
  getRouteMetrics,
  getProviderMetrics,
  getREDSummary,
  resetMetrics,
} from '../metrics';

describe('RED Metrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  describe('recordRouteMetric', () => {
    it('records route request count and duration', () => {
      recordRouteMetric('/api/test', 100, true);
      recordRouteMetric('/api/test', 200, true);

      const metrics = getRouteMetrics('/api/test');
      expect(metrics).not.toBeNull();
      if (metrics && typeof metrics === 'object' && 'requestCount' in metrics) {
        expect(metrics.requestCount).toBe(2);
        expect(metrics.errorCount).toBe(0);
        expect(metrics.totalDurationMs).toBe(300);
      }
    });

    it('tracks error count separately', () => {
      recordRouteMetric('/api/test', 100, true);
      recordRouteMetric('/api/test', 150, false);
      recordRouteMetric('/api/test', 120, false);

      const metrics = getRouteMetrics('/api/test');
      expect(metrics).not.toBeNull();
      if (metrics && typeof metrics === 'object' && 'requestCount' in metrics) {
        expect(metrics.requestCount).toBe(3);
        expect(metrics.errorCount).toBe(2);
      }
    });

    it('calculates percentiles correctly', () => {
      // Record 10 requests with known latencies
      const latencies = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
      latencies.forEach((lat) => recordRouteMetric('/api/test', lat, true));

      const metrics = getRouteMetrics('/api/test');
      expect(metrics).not.toBeNull();
      if (metrics && typeof metrics === 'object' && 'p50' in metrics) {
        expect(metrics.p50).toBeGreaterThanOrEqual(250); // 50th percentile
        expect(metrics.p50).toBeLessThanOrEqual(300);
        expect(metrics.p95).toBeGreaterThan(450); // 95th percentile
      }
    });
  });

  describe('recordProviderMetric', () => {
    it('tracks provider usage and cost', () => {
      recordProviderMetric('openai', 500, 0.05, true);
      recordProviderMetric('openai', 600, 0.07, true);

      const metrics = getProviderMetrics('openai');
      expect(metrics).not.toBeNull();
      if (metrics && typeof metrics === 'object' && 'requestCount' in metrics) {
        expect(metrics.requestCount).toBe(2);
        expect(metrics.totalCostUSD).toBeCloseTo(0.12, 2);
        expect(metrics.errorCount).toBe(0);
      }
    });

    it('tracks provider errors', () => {
      recordProviderMetric('anthropic', 500, 0.05, true);
      recordProviderMetric('anthropic', 600, 0, false);

      const metrics = getProviderMetrics('anthropic');
      expect(metrics).not.toBeNull();
      if (metrics && typeof metrics === 'object' && 'requestCount' in metrics) {
        expect(metrics.requestCount).toBe(2);
        expect(metrics.errorCount).toBe(1);
      }
    });
  });

  describe('getREDSummary', () => {
    it('returns summary across all routes and providers', () => {
      recordRouteMetric('/api/test1', 100, true);
      recordRouteMetric('/api/test1', 200, false);
      recordRouteMetric('/api/test2', 150, true);

      recordProviderMetric('openai', 500, 0.05, true);
      recordProviderMetric('gemini', 300, 0.02, true);

      const summary = getREDSummary();

      expect(summary.routes.length).toBe(2);
      expect(summary.providers.length).toBe(2);

      const test1 = summary.routes.find((r) => r.route === '/api/test1');
      expect(test1).toBeDefined();
      expect(test1?.rate).toBe(2);
      expect(test1?.errorRate).toBe(0.5); // 1 error out of 2

      const openaiMetrics = summary.providers.find((p) => p.provider === 'openai');
      expect(openaiMetrics).toBeDefined();
      expect(openaiMetrics?.totalCost).toBeCloseTo(0.05, 2);
    });

    it('calculates error rates correctly', () => {
      recordRouteMetric('/api/test', 100, true);
      recordRouteMetric('/api/test', 100, true);
      recordRouteMetric('/api/test', 100, true);
      recordRouteMetric('/api/test', 100, false); // 1 error out of 4

      const summary = getREDSummary();
      const metrics = summary.routes.find((r) => r.route === '/api/test');
      
      expect(metrics?.errorRate).toBeCloseTo(0.25, 2); // 25% error rate
    });
  });

  describe('resetMetrics', () => {
    it('clears all metrics', () => {
      recordRouteMetric('/api/test', 100, true);
      recordProviderMetric('openai', 500, 0.05, true);

      resetMetrics();

      const summary = getREDSummary();
      expect(summary.routes.length).toBe(0);
      expect(summary.providers.length).toBe(0);
    });
  });
});

