import { getMongoDb } from '@/lib/db/mongodb';
import { UsageRecord, UsageQuota } from '@/types/usage';

export class UsageService {
  async trackUsage(record: Omit<UsageRecord, 'id' | 'timestamp'>): Promise<void> {
    const db = await getMongoDb();
    
    await db.collection('usage_records').insertOne({
      ...record,
      timestamp: new Date(),
    });
    
    await this.incrementQuota(record.userId, record.organizationId);
  }
  
  private async incrementQuota(userId: string, organizationId?: string): Promise<void> {
    const db = await getMongoDb();
    
    await db.collection('usage_quotas').updateOne(
      { userId },
      { $inc: { usedAIExecutions: 1 } },
      { upsert: true }
    );
  }
  
  async getQuota(userId: string): Promise<UsageQuota | null> {
    const db = await getMongoDb();
    
    return db.collection<UsageQuota>('usage_quotas').findOne({ userId });
  }
  
  async hasQuota(userId: string): Promise<boolean> {
    const quota = await this.getQuota(userId);
    
    if (!quota) return true;
    
    return quota.usedAIExecutions < quota.maxAIExecutions;
  }
}
