import { randomUUID, createHash } from 'node:crypto';
import { getDb } from '@/lib/db/client';
import {
  Collections,
  type WorkbenchRun,
  type WorkbenchRunStatus,
} from '@/lib/db/schema';

interface StartWorkbenchRunInput {
  toolId: string;
  userId: string | null;
  budgetCents: number;
  contractVersion: number;
  runId?: string;
  prompt?: string;
  metadata?: Record<string, unknown>;
}

interface CompleteWorkbenchRunInput {
  runId: string;
  status: WorkbenchRunStatus;
  costCents?: number | null;
  provider?: string | null;
  model?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  error?: string | null;
  metadata?: Record<string, unknown>;
}

export async function startWorkbenchRun(
  input: StartWorkbenchRunInput
): Promise<
  | { status: 'started'; runId: string }
  | { status: 'replay'; runId: string; existing: WorkbenchRun }
> {
  const db = await getDb();
  const collection = db.collection<WorkbenchRun>(Collections.WORKBENCH_RUNS);

  const runId = input.runId ?? randomUUID();
  const existing = await collection.findOne({ runId });
  if (existing) {
    return { status: 'replay', runId, existing };
  }

  const promptHash = input.prompt
    ? createHash('sha256').update(input.prompt).digest('hex')
    : null;

  await collection.insertOne({
    runId,
    toolId: input.toolId,
    userId: input.userId,
    status: 'pending',
    budgetCents: input.budgetCents,
    costCents: null,
    provider: null,
    model: null,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    promptHash,
    contractVersion: input.contractVersion,
    metadata: input.metadata ?? {},
    error: null,
    createdAt: new Date(),
    completedAt: null,
  } as WorkbenchRun);

  return { status: 'started', runId };
}

export async function completeWorkbenchRun(
  input: CompleteWorkbenchRunInput
): Promise<void> {
  const db = await getDb();
  const collection = db.collection<WorkbenchRun>(Collections.WORKBENCH_RUNS);

  const updateFields: Partial<WorkbenchRun> = {
    status: input.status,
    completedAt: new Date(),
  };

  if (typeof input.costCents === 'number') {
    updateFields.costCents = input.costCents;
  }
  if (typeof input.inputTokens === 'number') {
    updateFields.inputTokens = input.inputTokens;
  }
  if (typeof input.outputTokens === 'number') {
    updateFields.outputTokens = input.outputTokens;
  }
  if (typeof input.totalTokens === 'number') {
    updateFields.totalTokens = input.totalTokens;
  }
  if (typeof input.provider === 'string' || input.provider === null) {
    updateFields.provider = input.provider ?? null;
  }
  if (typeof input.model === 'string' || input.model === null) {
    updateFields.model = input.model ?? null;
  }
  if (typeof input.error === 'string' || input.error === null) {
    updateFields.error = input.error ?? null;
  }
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    updateFields.metadata = input.metadata;
  }

  await collection.updateOne({ runId: input.runId }, { $set: updateFields });
}

export async function getWorkbenchRunById(
  runId: string
): Promise<WorkbenchRun | null> {
  const db = await getDb();
  return db.collection<WorkbenchRun>(Collections.WORKBENCH_RUNS).findOne({ runId });
}
