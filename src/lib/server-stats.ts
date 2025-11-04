/**
 * Server-Side Stats Helper
 * 
 * Re-exports the shared stats fetching logic
 * Use this in server components (pages, layouts, etc.)
 */

export { fetchPlatformStats as getServerStats, type StatsResponse as ServerStats } from './stats/fetch-platform-stats';

