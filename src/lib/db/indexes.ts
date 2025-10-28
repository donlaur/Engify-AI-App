/**
 * Database Index Definitions
 * Run this to create all necessary indexes for performance
 */

import { getMongoDb } from './mongodb';

export async function createIndexes() {
  const db = await getMongoDb();

  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ organizationId: 1 });
  await db.collection('users').createIndex({ createdAt: -1 });
  await db.collection('users').createIndex({ role: 1, organizationId: 1 });

  // Organizations collection indexes
  await db.collection('organizations').createIndex({ slug: 1 }, { unique: true });
  await db.collection('organizations').createIndex({ createdAt: -1 });

  // Prompts collection indexes
  await db.collection('prompts').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('prompts').createIndex({ organizationId: 1 });
  await db.collection('prompts').createIndex({ category: 1 });
  await db.collection('prompts').createIndex({ tags: 1 });

  // Audit logs collection indexes
  await db.collection('audit_logs').createIndex({ userId: 1, timestamp: -1 });
  await db.collection('audit_logs').createIndex({ organizationId: 1, timestamp: -1 });
  await db.collection('audit_logs').createIndex({ action: 1, timestamp: -1 });
  await db.collection('audit_logs').createIndex({ timestamp: -1 });

  // Usage records collection indexes
  await db.collection('usage_records').createIndex({ userId: 1, timestamp: -1 });
  await db.collection('usage_records').createIndex({ organizationId: 1, timestamp: -1 });
  await db.collection('usage_records').createIndex({ provider: 1, timestamp: -1 });

  // Rate limits collection indexes
  await db.collection('rate_limits').createIndex({ key: 1, timestamp: -1 });
  await db.collection('rate_limits').createIndex({ timestamp: 1 }, { expireAfterSeconds: 3600 });

  console.log('✅ All database indexes created');
}
