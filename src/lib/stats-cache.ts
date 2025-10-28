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

const STATIC_FALLBACK = {
  stats: { prompts: 76, patterns: 23, pathways: 12, users: 0 },
  categories: [],
};

export async function getStats() {
  // During build (SSR), return static data
  if (typeof window === 'undefined') {
    return STATIC_FALLBACK;
  }

  // Try cache first (client-side only)
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed: CachedStats = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;

    if (age < CACHE_DURATION) {
      return parsed.data;
    }
  }

  // Fetch fresh data (client-side only)
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) {
      return STATIC_FALLBACK;
    }

    const data = await res.json();

    // Cache it
    const cachedData: CachedStats = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));

    return data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return STATIC_FALLBACK;
  }
}
