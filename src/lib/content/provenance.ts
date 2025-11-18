import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';

export type ProvenanceStatus = 'queued' | 'success' | 'error';

export interface ProvenanceEvent {
  stage: string;
  source: string;
  status: ProvenanceStatus;
  metadata?: Record<string, unknown>;
}

export async function recordProvenance(event: ProvenanceEvent): Promise<void> {
  // Using static import
  const db = await getDb();
  await db.collection(Collections.CONTENT_PROVENANCE).insertOne({
    stage: event.stage,
    source: event.source,
    status: event.status,
    metadata: event.metadata ?? {},
    createdAt: new Date(),
  });
}
