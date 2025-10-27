/**
 * Workbench Tool Types
 * DRY definitions for all workbench tools
 */

export type WorkbenchToolId = 
  | 'token-counter'
  | 'prompt-optimizer'
  | 'model-comparison'
  | 'knowledge-navigator'
  | 'prompt-tester';

export interface WorkbenchTool {
  id: WorkbenchToolId;
  name: string;
  description: string;
  icon: string;
  category: 'analysis' | 'optimization' | 'testing' | 'execution';
  requiresBackend: boolean;
  comingSoon?: boolean;
  features: string[];
}

export const WORKBENCH_TOOLS: Record<WorkbenchToolId, WorkbenchTool> = {
  'token-counter': {
    id: 'token-counter',
    name: 'Token Counter & Cost Estimator',
    description: 'Calculate tokens and estimate costs across all AI models',
    icon: 'hash',
    category: 'analysis',
    requiresBackend: false,
    features: [
      'Real-time token counting',
      'Cost comparison (8 models)',
      'Optimization tips',
      'Context window warnings',
      'Cheapest model recommendation',
    ],
  },
  'prompt-optimizer': {
    id: 'prompt-optimizer',
    name: 'Prompt Optimizer',
    description: 'Automatically improve prompts using best practices and patterns',
    icon: 'sparkles',
    category: 'optimization',
    requiresBackend: true,
    comingSoon: true,
    features: [
      'AI-powered optimization',
      'Pattern application',
      'Before/after comparison',
      'Improvement explanations',
      'One-click apply',
    ],
  },
  'model-comparison': {
    id: 'model-comparison',
    name: 'Multi-Model Comparison',
    description: 'Run same prompt across multiple AI models and compare results',
    icon: 'gitCompare',
    category: 'execution',
    requiresBackend: true,
    comingSoon: true,
    features: [
      'Parallel execution',
      'Side-by-side comparison',
      'Quality metrics',
      'Speed & cost analysis',
      'Export results',
    ],
  },
  'knowledge-navigator': {
    id: 'knowledge-navigator',
    name: 'Knowledge Navigator (RAG)',
    description: 'Upload documents and ask questions with AI-powered answers',
    icon: 'fileSearch',
    category: 'execution',
    requiresBackend: true,
    comingSoon: true,
    features: [
      'Document upload (PDF, TXT, MD)',
      'Semantic search',
      'Source citations',
      'Chat interface',
      'Multiple documents',
    ],
  },
  'prompt-tester': {
    id: 'prompt-tester',
    name: 'Prompt Tester',
    description: 'Test prompts with multiple inputs and grade results automatically',
    icon: 'testTube',
    category: 'testing',
    requiresBackend: true,
    comingSoon: true,
    features: [
      'Batch testing',
      'A-F grading system',
      'Test case management',
      'Statistics & insights',
      'Export test reports',
    ],
  },
};

export function getWorkbenchTool(id: WorkbenchToolId): WorkbenchTool {
  return WORKBENCH_TOOLS[id];
}

export function getAvailableTools(): WorkbenchTool[] {
  return Object.values(WORKBENCH_TOOLS).filter((tool) => !tool.comingSoon);
}

export function getComingSoonTools(): WorkbenchTool[] {
  return Object.values(WORKBENCH_TOOLS).filter((tool) => tool.comingSoon);
}

export function getToolsByCategory(category: WorkbenchTool['category']): WorkbenchTool[] {
  return Object.values(WORKBENCH_TOOLS).filter((tool) => tool.category === category);
}
