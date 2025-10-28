import { getMongoDb } from '@/lib/db/mongodb';
import { AuditAction, AuditLog } from '@/types/audit';

export class AuditService {
  async log(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const db = await getMongoDb();
    
    await db.collection('audit_logs').insertOne({
      ...log,
      timestamp: new Date(),
    });
  }
  
  async getByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const db = await getMongoDb();
    
    return db
      .collection<AuditLog>('audit_logs')
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
  
  async getByOrganization(organizationId: string, limit: number = 100): Promise<AuditLog[]> {
    const db = await getMongoDb();
    
    return db
      .collection<AuditLog>('audit_logs')
      .find({ organizationId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}
