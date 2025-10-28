import { getMongoDb } from './mongodb';

export async function getUserStats(userId: string) {
  const db = await getMongoDb();
  
  return db.collection('usage_records').aggregate([
    { $match: { userId } },
    { $group: {
      _id: '$provider',
      totalExecutions: { $sum: 1 },
      totalTokens: { $sum: '$tokensUsed' },
      totalCost: { $sum: '$cost' },
    }},
    { $sort: { totalExecutions: -1 } },
  ]).toArray();
}

export async function getOrganizationStats(organizationId: string) {
  const db = await getMongoDb();
  
  return db.collection('usage_records').aggregate([
    { $match: { organizationId } },
    { $group: {
      _id: { 
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        provider: '$provider',
      },
      count: { $sum: 1 },
      tokens: { $sum: '$tokensUsed' },
      cost: { $sum: '$cost' },
    }},
    { $sort: { '_id.date': -1 } },
  ]).toArray();
}
