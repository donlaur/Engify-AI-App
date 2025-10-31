export type ProvenanceStatus = 'queued' | 'success' | 'error';

export interface ProvenanceEvent {
  stage: string;
  source: string;
  status: ProvenanceStatus;
  metadata?: Record<string, unknown>;
}

export async function recordProvenance(event: ProvenanceEvent): Promise<void> {
  const { getDb } = await import('@/lib/db/client');
  const { Collections } = await import('@/lib/db/schema');
  const db = await getDb();
  await db.collection(Collections.CONTENT_PROVENANCE).insertOne({
    stage: event.stage,
    source: event.source,
    status: event.status,
    metadata: event.metadata ?? {},
    createdAt: new Date(),
  });
}
