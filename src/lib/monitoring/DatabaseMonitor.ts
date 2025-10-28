import { getMongoDb } from '@/lib/db/mongodb';

export class DatabaseMonitor {
  async getConnectionStats() {
    const db = await getMongoDb();
    return db.admin().serverStatus();
  }
  
  async getSlowQueries(threshold: number = 100) {
    const db = await getMongoDb();
    return db.admin().command({
      profile: 1,
      slowms: threshold,
    });
  }
}
