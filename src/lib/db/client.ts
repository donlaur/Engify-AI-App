/**
 * MongoDB Client (DEPRECATED - Use @/lib/mongodb instead)
 *
 * This file re-exports from the canonical MongoDB connection file.
 * All MongoDB connections should use @/lib/mongodb directly.
 *
 * @deprecated Import from @/lib/mongodb instead
 */

export {
  getClient,
  getDb,
  getMongoClient,
  getMongoDb,
  connectDB,
  default,
} from '@/lib/mongodb';

/**
 * Close MongoDB connection
 * Only use in tests or shutdown
 */
export async function closeConnection(): Promise<void> {
  const { getClient } = await import('@/lib/mongodb');
  const client = await getClient();
  await client.close();
}
