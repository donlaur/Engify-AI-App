import { WORKBENCH_TOOLS, type WorkbenchToolId } from '@/types/workbench';

export interface WorkbenchToolContract {
  contractId: string;
  toolId: string;
  version: number;
  maxCostCents: number;
  maxTotalTokens: number;
  costPerTokenCents: number;
  replayWindowMinutes: number;
}

export type ContractToolId = WorkbenchToolId | 'multi-agent';

const WORKBENCH_TOOL_CONTRACTS: Partial<Record<ContractToolId, WorkbenchToolContract>> = {
  'prompt-optimizer': {
    contractId: 'contract/prompt-optimizer@1',
    toolId: 'prompt-optimizer',
    version: 1,
    maxCostCents: 75,
    maxTotalTokens: 3500,
    costPerTokenCents: 0.02,
    replayWindowMinutes: 5,
  },
  'model-comparison': {
    contractId: 'contract/model-comparison@1',
    toolId: 'model-comparison',
    version: 1,
    maxCostCents: 150,
    maxTotalTokens: 6000,
    costPerTokenCents: 0.025,
    replayWindowMinutes: 5,
  },
  'knowledge-navigator': {
    contractId: 'contract/knowledge-navigator@1',
    toolId: 'knowledge-navigator',
    version: 1,
    maxCostCents: 100,
    maxTotalTokens: 5000,
    costPerTokenCents: 0.02,
    replayWindowMinutes: 10,
  },
  'prompt-tester': {
    contractId: 'contract/prompt-tester@1',
    toolId: 'prompt-tester',
    version: 1,
    maxCostCents: 90,
    maxTotalTokens: 4500,
    costPerTokenCents: 0.02,
    replayWindowMinutes: 10,
  },
  'multi-agent': {
    contractId: 'contract/multi-agent@1',
    toolId: 'multi-agent',
    version: 1,
    maxCostCents: 250,
    maxTotalTokens: 8000,
    costPerTokenCents: 0.03,
    replayWindowMinutes: 15,
  },
};

export function getWorkbenchToolContract(
  toolId: ContractToolId
): WorkbenchToolContract | null {
  if (toolId in WORKBENCH_TOOL_CONTRACTS) {
    return WORKBENCH_TOOL_CONTRACTS[toolId] ?? null;
  }
  // If tool exists but no contract, return null (front-end tools may not need one)
  return null;
}

export function isWorkbenchToolWithContract(
  toolId: ContractToolId
): toolId is ContractToolId {
  return Boolean(WORKBENCH_TOOL_CONTRACTS[toolId]);
}

export function getContractToolIds(): ContractToolId[] {
  return Object.keys(WORKBENCH_TOOL_CONTRACTS) as ContractToolId[];
}

export function describeContract(toolId: ContractToolId): {
  toolName: string;
  contract: WorkbenchToolContract;
} | null {
  const contract = getWorkbenchToolContract(toolId);
  if (!contract) return null;

  const toolName = WORKBENCH_TOOLS[toolId as WorkbenchToolId]?.name ?? toolId;
  return { toolName, contract };
}

