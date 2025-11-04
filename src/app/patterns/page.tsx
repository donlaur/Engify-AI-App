import { MainLayout } from '@/components/layout/MainLayout';
import { PatternsClient } from './patterns-client';
import { getAllPatterns } from '@/lib/patterns/mongodb-patterns';

export default async function PatternsPage() {
  // Fetch patterns from MongoDB
  const patterns = await getAllPatterns();

  return (
    <MainLayout>
      <PatternsClient patterns={patterns} />
    </MainLayout>
  );
}
