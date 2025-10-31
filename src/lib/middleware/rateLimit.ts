/**
 * AI Summary: Simple in-memory rate limiter for API routes (test/dev use).
 * Invariants: Per-key sliding window; not for multi-instance production use.
 */

type Key = string;

interface Bucket {
  tokens: number;
  updatedAt: number; // epoch ms
}

const buckets = new Map<Key, Bucket>();

export interface RateLimitOptions {
  windowMs: number; // refill window
  max: number; // max tokens per window
  key?: string; // override key
}

export function rateLimit(keyBase: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const key = opts.key ?? keyBase;
  const windowMs = Math.max(1000, opts.windowMs);
  const max = Math.max(1, opts.max);

  const bucket = buckets.get(key) ?? { tokens: max, updatedAt: now };
  // Refill based on elapsed windows
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor(elapsed / windowMs) * max;
  if (refill > 0) {
    bucket.tokens = Math.min(max, bucket.tokens + refill);
    bucket.updatedAt = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}
