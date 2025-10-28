/**
 * Simple client-side stats cache
 * Stats don't change often, so cache for 1 hour
 */

const CACHE_KEY = 'engify_stats';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

interface CachedStats {
  data: {
    stats: {
      prompts: number;
      patterns: number;
      pathways: number;
      users: number;
    };
  };
  timestamp: number;
}

export async function getStats() {
  // Try cache first
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CachedStats = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;

      if (age < CACHE_DURATION) {
        return parsed.data;
      }
    }
  }

  // Fetch fresh data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/stats`);
  if (!res.ok) {
    return { stats: { prompts: 0, patterns: 23, pathways: 0, users: 0 } };
  }

  const data = await res.json();

  // Cache it
  if (typeof window !== 'undefined') {
    const cached: CachedStats = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  }

  return data;
}
