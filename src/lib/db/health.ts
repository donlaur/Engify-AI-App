import { getMongoDb } from './mongodb';

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = await getMongoDb();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
