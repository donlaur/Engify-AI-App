import { MainLayout } from '@/components/layout/MainLayout';
import { PatternsClient } from './patterns-client';
import { getDb } from '@/lib/mongodb';

export default async function PatternsPage() {
  // Fetch patterns from MongoDB
  const db = await getDb();
  const patterns = await db.collection('patterns').find({}).toArray();

  return (
    <MainLayout>
      <PatternsClient patterns={patterns} />
    </MainLayout>
  );
}
